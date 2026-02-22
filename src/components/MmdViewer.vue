<!-- 组件 调用 three.js 渲染 MMD 格式的 3D 模型, 传入的内容格式参考 MmdModelConfig -->
<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import type { MMDAnimationHelper, MMDLoader, OrbitControls as OrbitControlsType } from 'three-stdlib'
import type { AnimationClip, Clock, Quaternion, SkinnedMesh, Vector3 } from 'three'
import { deepClone, isFunction, isObject, sleep } from 'foreslash'
import type { MmdModelConfig } from '../data/mmdModels'
import { splitFileUrl } from '../utils'
import { defaultLightSettings } from './MmdViewer-data'

const props = defineProps<{ model: MmdModelConfig }>()

const stageRef = ref<HTMLDivElement | null>(null)
const isLoading = ref(false)
const isLoaded = ref(false)
const errorMessage = ref<string | null>(null)
const activeMotionId = ref<string | null>(null)
const activePoseId = ref<string | null>(null)
const isAmmoReady = ref(false)
const ammoStatusMessage = ref<string | null>(null)

// 灯光调参默认配置
const lightSettings = ref(deepClone(defaultLightSettings))

let renderer: import('three').WebGLRenderer | null = null
let scene: import('three').Scene | null = null
let camera: import('three').PerspectiveCamera | null = null
let orbitControls: OrbitControlsType | null = null
let orbitControlsCtor: typeof OrbitControlsType | null = null
let modelRoot: import('three').Object3D | null = null
let modelMesh: SkinnedMesh | null = null
let animationHelper: MMDAnimationHelper | null = null
let mmdLoader: MMDLoader | null = null
let clock: Clock | null = null
let ambientLight: import('three').AmbientLight | null = null
let keyLight: import('three').DirectionalLight | null = null
let fillLight: import('three').DirectionalLight | null = null
let threeModule: typeof import('three') | null = null
let animationFrameId = 0
let resizeObserver: ResizeObserver | null = null
let initialCameraPosition: Vector3 | null = null
let initialCameraQuaternion: Quaternion | null = null
let cameraForward: Vector3 | null = null
let cameraYOffset = 0
let modelBoundsCenter: Vector3 | null = null
let modelBoundsRadius = 0
let detachPointerControls: (() => void) | null = null
const motionClips = new Map<string, AnimationClip>()
const poseCache = new Map<string, object>()

const zoomLimits = { min: 4, max: 120 }
const panLimits = { min: -12, max: 18 }
const rotateSpeed = 0.005
const panSpeed = 0.03
const zoomSpeed = 0.02
const axisLockThreshold = 6
const interactionMode = () => props.model.interactionMode ?? 'character'
const activeInteractionMode = ref<'character' | 'orbit'>(interactionMode())

const getPhysicsEnabled = () => {
  const hasAmmo = typeof (window as { Ammo?: unknown }).Ammo !== 'undefined'
  return Boolean(props.model.enablePhysics && hasAmmo)
}

// Ammo.js 只在需要时加载
const ensureAmmo = async () => {
  if (isObject((window as { Ammo?: unknown }).Ammo)) {
    isAmmoReady.value = true
    ammoStatusMessage.value = null
    return
  }

  try {
    // @ts-ignore
    const AmmoModule = (await import('ammo.js')) as unknown as
      | ((config?: unknown) => Promise<unknown>)
      | { default?: (config?: unknown) => Promise<unknown> }
    // console.log('加载 Ammo.js', AmmoModule)
    if (!AmmoModule) {
      throw new Error('Ammo.js 模块加载失败')
    }
    const initAmmo = isFunction(AmmoModule) ? AmmoModule : AmmoModule.default
    if (isFunction(initAmmo)) {
      const ammo = await initAmmo()
      ;(window as { Ammo?: unknown }).Ammo = ammo
      isAmmoReady.value = true
      ammoStatusMessage.value = null
    } else if (isObject(AmmoModule)) {
      // 兼容直接导出对象的情况
      ;(window as { Ammo?: unknown }).Ammo = AmmoModule
      isAmmoReady.value = true
      ammoStatusMessage.value = null
    } else {
      throw new Error('Ammo.js 模块格式异常')
    }
  } catch (error) {
    isAmmoReady.value = false
    ammoStatusMessage.value = error instanceof Error ? error.message : 'Ammo.js 加载失败，物理已关闭'
  }
}

// 将方位角/高度角转换为方向光位置
const updateLightPositions = (THREE: typeof import('three')) => {
  if (!keyLight || !fillLight) return
  const toRad = THREE.MathUtils.degToRad
  const toSpherical = (azimuth: number, elevation: number, distance: number) => {
    const phi = toRad(90 - elevation)
    const theta = toRad(azimuth)
    return new THREE.Vector3().setFromSphericalCoords(distance, phi, theta)
  }

  const keyPos = toSpherical(
    lightSettings.value.keyAzimuth,
    lightSettings.value.keyElevation,
    lightSettings.value.keyDistance
  )
  const fillPos = toSpherical(
    lightSettings.value.fillAzimuth,
    lightSettings.value.fillElevation,
    lightSettings.value.fillDistance
  )
  keyLight.position.copy(keyPos)
  fillLight.position.copy(fillPos)
}

// 修正 PMX 贴图在线性空间下的偏色问题
const applyMmdColorSpaceFix = (root: import('three').Object3D, THREE: typeof import('three')) => {
  // 避免 MMDLoader 颜色偏白的问题，参考 three.js #28336
  root.traverse((child) => {
    const mesh = child as import('three').Mesh
    const material = (mesh.material ?? null) as import('three').Material | import('three').Material[] | null
    const excludeEmissiveModifyList = new Set([] as string[])
    // const excludeEmissiveModifyList = new Set(['白目', '目', '目光', '目光2', '袜', '肌'])

    const applyToMaterial = (mat: import('three').Material) => {
      const matAny = mat as import('three').Material & {
        map?: import('three').Texture
        emissive?: import('three').Color
        emissiveMap?: import('three').Texture
        specularMap?: import('three').Texture
      }

      if (matAny.emissive && !excludeEmissiveModifyList.has(mat.name)) {
        matAny.emissive.set(0x000000)
      }
      if (matAny.map) matAny.map.colorSpace = THREE.SRGBColorSpace
      if (matAny.emissiveMap) matAny.emissiveMap.colorSpace = THREE.SRGBColorSpace
      if (matAny.specularMap) matAny.specularMap.colorSpace = THREE.SRGBColorSpace
    }

    if (Array.isArray(material)) {
      material.forEach(applyToMaterial)
    } else if (material) {
      applyToMaterial(material)
    }
  })
}

/** 角色鉴赏模式缩放时镜头控制 */
const clampZoomAlongForward = (delta: number) => {
  if (!camera || !cameraForward || !modelRoot || !threeModule) return
  const forward = cameraForward.clone().normalize()
  const center = modelBoundsCenter ?? modelRoot.position
  // 设为 1 可以完全阻止穿模, 考虑到有贴脸需求这里改为 0.1
  const minDistance = Math.max(zoomLimits.min, modelBoundsRadius * 0.1)
  const maxDistance = Math.max(minDistance + 1, zoomLimits.max)
  const currentPos = camera.position.clone()
  const desiredPos = currentPos.clone().addScaledVector(forward, delta)
  const desiredDistance = desiredPos.distanceTo(center)

  if (desiredDistance >= minDistance && desiredDistance <= maxDistance) {
    camera.position.copy(desiredPos)
    return
  }

  const targetDistance = desiredDistance < minDistance ? minDistance : maxDistance
  const p = currentPos.clone().sub(center)
  const b = 2 * p.dot(forward)
  const c = p.dot(p) - targetDistance * targetDistance
  const discriminant = b * b - 4 * c
  if (discriminant < 0) return

  const sqrt = Math.sqrt(discriminant)
  const t1 = (-b + sqrt) / 2
  const t2 = (-b - sqrt) / 2
  const desiredDelta = desiredPos.clone().sub(currentPos).dot(forward)
  const t = Math.abs(t2 - desiredDelta) < Math.abs(t1 - desiredDelta) ? t2 : t1
  camera.position.copy(currentPos.addScaledVector(forward, t))
}

const updateOrbitTarget = () => {
  if (!orbitControls || !modelRoot || !modelBoundsCenter) return
  orbitControls.target.copy(modelBoundsCenter)
  orbitControls.update()
}

const applyInteractionMode = (mode: 'character' | 'orbit') => {
  if (!renderer || !camera) return
  if (animationHelper) {
    // 避免重复 add/remove 造成物理拉扯，改为临时关闭物理后再恢复
    animationHelper.enable('physics', false)
    sleep(500).then(() => {
      if (animationHelper && getPhysicsEnabled()) animationHelper.enable('physics', true)
    })
  }

  // 切换模式时必须先清理旧监听，避免重复绑定
  detachPointerControls?.()
  orbitControls?.dispose()
  orbitControls = null

  resetCameraView()

  if (mode === 'orbit') {
    if (!orbitControlsCtor) return
    orbitControls = new orbitControlsCtor(camera, renderer.domElement)
    orbitControls.enableDamping = true
    orbitControls.dampingFactor = 0.08
    orbitControls.enablePan = true
    orbitControls.minDistance = zoomLimits.min
    orbitControls.maxDistance = zoomLimits.max
    if (modelBoundsCenter) {
      orbitControls.minDistance = Math.max(zoomLimits.min, modelBoundsRadius * 0.1)
      orbitControls.maxDistance = Math.max(orbitControls.minDistance + 1, zoomLimits.max)
      updateOrbitTarget()
    }
  } else {
    setupPointerControls()
  }
}

const setupPointerControls = () => {
  if (!renderer || !stageRef.value || !camera) return

  const dom = stageRef.value
  const pointers = new Map<number, { x: number; y: number }>()
  let lastPinchDistance = 0
  let dragMode: 'rotate' | 'pan' | null = null

  const getPointer = (event: PointerEvent) => ({ x: event.clientX, y: event.clientY })
  const distanceBetween = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.hypot(a.x - b.x, a.y - b.y)

  const onPointerDown = (event: PointerEvent) => {
    if (!isLoaded.value) return
    dom.setPointerCapture(event.pointerId)
    pointers.set(event.pointerId, getPointer(event))
    if (pointers.size === 2) {
      const [first, second] = Array.from(pointers.values())
      lastPinchDistance = distanceBetween(first!, second!)
      dragMode = null
    }
  }

  const onPointerMove = (event: PointerEvent) => {
    if (!isLoaded.value || !camera || !modelRoot) return
    const current = getPointer(event)
    const prev = pointers.get(event.pointerId)
    if (!prev) return

    pointers.set(event.pointerId, current)

    if (pointers.size === 2) {
      const [first, second] = Array.from(pointers.values())
      const distance = distanceBetween(first!, second!)
      const delta = distance - lastPinchDistance
      lastPinchDistance = distance
      clampZoomAlongForward(delta * zoomSpeed)
      return
    }

    const dx = current.x - prev.x
    const dy = current.y - prev.y

    if (!dragMode) {
      if (Math.abs(dx) > Math.abs(dy) + axisLockThreshold) {
        dragMode = 'rotate'
      } else if (Math.abs(dy) > Math.abs(dx) + axisLockThreshold) {
        dragMode = 'pan'
      } else {
        return
      }
    }

    if (dragMode === 'rotate') {
      modelRoot.rotation.y += dx * rotateSpeed
    } else if (dragMode === 'pan') {
      const baseY = initialCameraPosition?.y ?? camera.position.y
      cameraYOffset = Math.min(panLimits.max, Math.max(panLimits.min, cameraYOffset + dy * panSpeed))
      camera.position.y = baseY + cameraYOffset
    }
  }

  const onPointerUp = (event: PointerEvent) => {
    pointers.delete(event.pointerId)
    if (pointers.size < 2) {
      lastPinchDistance = 0
    }
    if (pointers.size === 0) {
      dragMode = null
    }
    dom.releasePointerCapture(event.pointerId)
  }

  const onWheel = (event: WheelEvent) => {
    if (!isLoaded.value) return
    event.preventDefault()
    clampZoomAlongForward(-event.deltaY * zoomSpeed)
  }

  dom.addEventListener('pointerdown', onPointerDown)
  dom.addEventListener('pointermove', onPointerMove)
  dom.addEventListener('pointerup', onPointerUp)
  dom.addEventListener('pointercancel', onPointerUp)
  dom.addEventListener('wheel', onWheel, { passive: false })

  detachPointerControls = () => {
    dom.removeEventListener('pointerdown', onPointerDown)
    dom.removeEventListener('pointermove', onPointerMove)
    dom.removeEventListener('pointerup', onPointerUp)
    dom.removeEventListener('pointercancel', onPointerUp)
    dom.removeEventListener('wheel', onWheel)
    detachPointerControls = null
  }
}

type LoadedModelAsset = {
  root: import('three').Object3D
  mesh: SkinnedMesh
  boundsCenter: Vector3
  boundsRadius: number
}
/** 初始化 three, 懒加载 three.js 与 MMD 相关模块，避免首屏体积爆炸 */
const initializeThreeRuntime = async () => {
  const THREE = await import('three')
  threeModule = THREE
  const { MMDAnimationHelper, MMDLoader, OrbitControls } = await import('three-stdlib')
  orbitControlsCtor = OrbitControls

  scene = new THREE.Scene()

  ambientLight = new THREE.AmbientLight(lightSettings.value.ambientColor, lightSettings.value.ambientIntensity)
  keyLight = new THREE.DirectionalLight(lightSettings.value.keyColor, lightSettings.value.keyIntensity)
  fillLight = new THREE.DirectionalLight(lightSettings.value.fillColor, lightSettings.value.fillIntensity)
  updateLightPositions(THREE)
  scene.add(ambientLight, keyLight, fillLight)

  camera = new THREE.PerspectiveCamera(35, 1, 0.1, 2000)
  camera.position.set(...props.model.cameraPosition)
  initialCameraPosition = camera.position.clone()
  initialCameraQuaternion = camera.quaternion.clone()
  cameraForward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion).normalize()
  cameraYOffset = 0

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(stageRef.value!.clientWidth, stageRef.value!.clientHeight, false)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05
  stageRef.value!.appendChild(renderer.domElement)

  applyInteractionMode(activeInteractionMode.value)

  const resize = () => {
    if (!stageRef.value || !camera || !renderer) return
    const [width, height] = [stageRef.value.clientWidth, stageRef.value.clientHeight]
    const nextHeight = Math.max(height, 1)
    camera.aspect = width / nextHeight
    camera.updateProjectionMatrix()
    renderer.setSize(width, nextHeight, false)
  }

  resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(stageRef.value!)
  resize()

  mmdLoader = new MMDLoader()
  ;(mmdLoader as { setCrossOrigin?: (value: string) => void }).setCrossOrigin?.('anonymous')

  return { THREE, MMDAnimationHelper }
}
/** 加载模型资源, MMDLoader 会根据 resourcePath 解析贴图路径 */
const loadModelAsset = async (THREE: typeof import('three')): Promise<LoadedModelAsset> => {
  if (!mmdLoader) {
    throw new Error('模型加载器初始化失败')
  }

  const { baseUrl, fileName } = splitFileUrl(props.model.modelUrl)
  const resourceBase = props.model.resourcePath ?? baseUrl
  mmdLoader.setPath(baseUrl)
  ;(mmdLoader as { setResourcePath?: (value: string) => void }).setResourcePath?.(resourceBase)

  const loadedModel = await new Promise<import('three').Object3D>((resolve, reject) => {
    mmdLoader?.load(fileName, resolve, undefined, reject)
  })

  loadedModel.scale.setScalar(props.model.modelScale)
  loadedModel.rotation.set(...props.model.modelRotation)
  applyMmdColorSpaceFix(loadedModel, THREE)

  const bounds = new THREE.Box3().setFromObject(loadedModel)
  const sphere = bounds.getBoundingSphere(new THREE.Sphere())

  return {
    root: loadedModel,
    mesh: loadedModel as SkinnedMesh,
    boundsCenter: sphere.center.clone(),
    boundsRadius: sphere.radius,
  }
}

const mountModelAsset = async (
  modelAsset: LoadedModelAsset,
  MMDAnimationHelperCtor: typeof import('three-stdlib').MMDAnimationHelper
) => {
  modelRoot = modelAsset.root
  modelMesh = modelAsset.mesh
  modelBoundsCenter = modelAsset.boundsCenter
  modelBoundsRadius = modelAsset.boundsRadius

  if (activeInteractionMode.value === 'orbit') {
    applyInteractionMode('orbit')
  }

  animationHelper = new MMDAnimationHelperCtor({ afterglow: 0.0 })
  if (props.model.enablePhysics) {
    await ensureAmmo()
  }
  animationHelper.add(modelMesh, { physics: getPhysicsEnabled() })

  if (scene) {
    scene.add(modelRoot)
  }
}
/** 开始渲染循环 */
const startRenderLoop = (THREE: typeof import('three')) => {
  clock = new THREE.Clock()

  const animate = () => {
    if (!renderer || !scene || !camera) return
    animationFrameId = window.requestAnimationFrame(animate)
    const delta = clock?.getDelta() ?? 0
    animationHelper?.update(delta)
    renderer.render(scene, camera)
  }

  animate()
}
/** 初始化 three 并加载模型 */
const loadModel = async () => {
  if (isLoading.value || isLoaded.value) return
  if (!stageRef.value) {
    errorMessage.value = '3D 容器搭建中，请稍等片刻...'
    return
  }

  isLoading.value = true
  errorMessage.value = null

  try {
    const { THREE, MMDAnimationHelper } = await initializeThreeRuntime()
    const modelAsset = await loadModelAsset(THREE)
    await mountModelAsset(modelAsset, MMDAnimationHelper)
    startRenderLoop(THREE)
    isLoaded.value = true
  } catch (error) {
    const message = error instanceof Error ? error.message : '模型加载失败'
    errorMessage.value = message
    disposeThree()
  } finally {
    isLoading.value = false
  }
}

// const resetControls = () => {
//   if (!controls) return
//   controls.reset()
// }
/** 重置镜头（不影响灯光与模式） */
const resetCameraView = () => {
  if (!camera) return
  if (initialCameraPosition) {
    camera.position.copy(initialCameraPosition)
  } else {
    camera.position.set(...props.model.cameraPosition)
  }
  if (initialCameraQuaternion) {
    camera.quaternion.copy(initialCameraQuaternion)
  }
  if (modelRoot) {
    modelRoot.rotation.set(...props.model.modelRotation)
  }
  cameraYOffset = 0
  if (orbitControls) {
    updateOrbitTarget()
  }
}

/** 重置视图（镜头 + 模型 + 灯光） */
const resetScene = () => {
  resetCameraView()
  if (modelMesh && animationHelper) {
    // 避免重复 add/remove 造成物理拉扯，改为临时关闭物理后再恢复
    animationHelper.enable('physics', false)
    modelMesh.pose()
    activeMotionId.value = null
    activePoseId.value = null
    sleep(500).then(() => {
      if (animationHelper && getPhysicsEnabled()) animationHelper.enable('physics', true)
    })
  }
  lightSettings.value = deepClone(defaultLightSettings)
}
/** 清除动画状态, 回到默认姿势 */
const clearAnimationState = () => {
  if (!modelMesh || !animationHelper) return
  animationHelper.remove(modelMesh)
  animationHelper.add(modelMesh, { physics: getPhysicsEnabled() })
  modelMesh.pose()
  activeMotionId.value = null
  activePoseId.value = null
}
/** 变更动作 */
const applyMotion = async (motionId: string) => {
  if (!mmdLoader || !modelMesh || !animationHelper) return
  const motion = props.model.motions?.find((item) => item.id === motionId)
  if (!motion) return

  activePoseId.value = null
  activeMotionId.value = motionId

  try {
    let clip = motionClips.get(motionId)
    if (!clip) {
      clip = await new Promise<AnimationClip>((resolve, reject) => {
        if (!mmdLoader || !modelMesh) {
          reject(new Error('动作加载已中断'))
          return
        }
        const { baseUrl, fileName } = splitFileUrl(motion.vmdUrl)
        mmdLoader.setAnimationPath(baseUrl)
        mmdLoader.loadAnimation(fileName, modelMesh, (result) => resolve(result as AnimationClip), undefined, reject)
      })
      motionClips.set(motionId, clip)
    }

    animationHelper.remove(modelMesh)
    animationHelper.add(modelMesh, { animation: clip, physics: getPhysicsEnabled() })
  } catch (error) {
    activeMotionId.value = null
    errorMessage.value = error instanceof Error ? error.message : '动作加载失败'
  }
}
/** 变更姿势 */
const applyPose = async (poseId: string) => {
  if (!mmdLoader || !modelMesh || !animationHelper) return
  const pose = props.model.poses?.find((item) => item.id === poseId)
  if (!pose) return

  activeMotionId.value = null
  activePoseId.value = poseId

  try {
    let vpd = poseCache.get(poseId)
    if (!vpd) {
      vpd = await new Promise<object>((resolve, reject) => {
        if (!mmdLoader) {
          reject(new Error('姿势加载已中断'))
          return
        }
        const { baseUrl, fileName } = splitFileUrl(pose.vpdUrl)
        mmdLoader.setAnimationPath(baseUrl)
        mmdLoader.loadVPD(fileName, pose.isUnicode ?? true, resolve, undefined, reject)
      })
      poseCache.set(poseId, vpd)
    }

    animationHelper.remove(modelMesh)
    animationHelper.add(modelMesh, { physics: getPhysicsEnabled() })
    animationHelper.pose(modelMesh, vpd, { resetPose: true })
  } catch (error) {
    activePoseId.value = null
    errorMessage.value = error instanceof Error ? error.message : '姿势加载失败'
  }
}

// 灯光参数变化同步更新场景
watch(
  () => ({ ...lightSettings.value }),
  () => {
    if (!ambientLight || !keyLight || !fillLight || !threeModule) return
    ambientLight.intensity = lightSettings.value.ambientIntensity
    ambientLight.color.set(lightSettings.value.ambientColor)
    keyLight.intensity = lightSettings.value.keyIntensity
    keyLight.color.set(lightSettings.value.keyColor)
    fillLight.intensity = lightSettings.value.fillIntensity
    fillLight.color.set(lightSettings.value.fillColor)
    updateLightPositions(threeModule)
  },
  { deep: true }
)
/** 释放 3D 对象资源 */
const disposeObject = (object: import('three').Object3D) => {
  object.traverse((child) => {
    const mesh = child as import('three').Mesh
    if (mesh.geometry) {
      mesh.geometry.dispose()
    }

    const material = (mesh.material ?? null) as import('three').Material | import('three').Material[] | null

    if (Array.isArray(material)) {
      material.forEach(disposeMaterial)
    } else if (material) {
      disposeMaterial(material)
    }
  })
}
/** 释放材质资源 */
const disposeMaterial = (material: import('three').Material) => {
  const materialAny = material as unknown as Record<string, unknown>
  Object.values(materialAny).forEach((value) => {
    const texture = value as { isTexture?: boolean; dispose?: () => void }
    if (texture?.isTexture && typeof texture.dispose === 'function') {
      texture.dispose()
    }
  })
  material.dispose()
}
/** 卸载, 释放 Three.js 相关资源 */
const disposeThree = () => {
  if (animationFrameId) {
    window.cancelAnimationFrame(animationFrameId)
    animationFrameId = 0
  }

  if (modelRoot && scene) {
    scene.remove(modelRoot)
    disposeObject(modelRoot)
    modelRoot = null
  }

  if (modelMesh && animationHelper) {
    animationHelper.remove(modelMesh)
  }

  detachPointerControls?.()
  orbitControls?.dispose()
  orbitControls = null

  resizeObserver?.disconnect()
  resizeObserver = null

  if (renderer) {
    renderer.dispose()
    renderer.forceContextLoss?.()
    renderer.domElement.remove()
  }

  renderer = null
  scene = null
  camera = null
  modelMesh = null
  animationHelper = null
  mmdLoader = null
  clock = null
  ambientLight = null
  keyLight = null
  fillLight = null
  threeModule = null
  initialCameraPosition = null
  initialCameraQuaternion = null
  cameraForward = null
  modelBoundsCenter = null
  modelBoundsRadius = 0
  motionClips.clear()
  poseCache.clear()
  isLoaded.value = false
  isLoading.value = false
  activeMotionId.value = null
  activePoseId.value = null
}

onBeforeUnmount(() => {
  disposeThree()
})
</script>

<template>
  <section class="mmd-viewer">
    <header class="mmd-viewer__header">
      <!-- <div>
        <p class="mmd-viewer__title">{{ props.model.name }}</p>
        <p class="mmd-viewer__subtitle">{{ props.model.subtitle }}</p>
      </div> -->
    </header>

    <div ref="stageRef" class="mmd-viewer__stage">
      <div v-if="!isLoaded" class="mmd-viewer__placeholder">
        <p class="mmd-viewer__placeholder-title">点击下方按钮加载模型</p>
        <p class="mmd-viewer__placeholder-text">模型和贴图的加载需要一点时间...</p>
        <button class="mmd-button" type="button" :disabled="isLoading" @click="loadModel">
          {{ isLoading ? '加载中…' : '加载模型' }}
        </button>
        <!-- <p class="mmd-viewer__placeholder-hint">支持拖拽旋转，滚轮/双指缩放</p> -->
      </div>
      <div v-if="errorMessage" class="mmd-viewer__error">
        {{ errorMessage }}
      </div>
    </div>

    <div class="mmd-viewer__controls">
      <div v-if="isLoaded" class="mmd-viewer__actions">
        <button class="mmd-button" type="button" @click="resetScene">初始状态</button>
        <div class="mmd-viewer__mode-toggle">
          <button
            class="mmd-button mmd-button--ghost"
            type="button"
            :class="{ 'mmd-button--active': activeInteractionMode === 'character' }"
            @click="
              () => {
                activeInteractionMode = 'character'
                applyInteractionMode('character')
              }
            "
          >
            角色鉴赏镜头
          </button>
          <button
            class="mmd-button mmd-button--ghost"
            type="button"
            :class="{ 'mmd-button--active': activeInteractionMode === 'orbit' }"
            @click="
              () => {
                activeInteractionMode = 'orbit'
                applyInteractionMode('orbit')
              }
            "
          >
            经典镜头
          </button>
        </div>
      </div>
      <p v-if="ammoStatusMessage" class="mmd-viewer__hint">物理提示：{{ ammoStatusMessage }}</p>
      <!-- <div class="mmd-viewer__control-group">
        <p class="mmd-viewer__control-label">光线</p>
        <div class="mmd-viewer__control-grid">
          <label class="mmd-viewer__control-item">
            环境强度
            <input
              v-model.number="lightSettings.ambientIntensity"
              type="range"
              min="0"
              max="2"
              step="0.05"
              :disabled="!isLoaded"
            />
          </label>
          <label class="mmd-viewer__control-item">
            环境颜色
            <input v-model="lightSettings.ambientColor" type="color" :disabled="!isLoaded" />
          </label>
        </div>
        <div class="mmd-viewer__control-grid">
          <label class="mmd-viewer__control-item">
            主光强度
            <input
              v-model.number="lightSettings.keyIntensity"
              type="range"
              min="0"
              max="3"
              step="0.05"
              :disabled="!isLoaded"
            />
          </label>
          <label class="mmd-viewer__control-item">
            主光颜色
            <input v-model="lightSettings.keyColor" type="color" :disabled="!isLoaded" />
          </label>
          <label class="mmd-viewer__control-item">
            主光方位
            <input
              v-model.number="lightSettings.keyAzimuth"
              type="range"
              min="0"
              max="360"
              step="1"
              :disabled="!isLoaded"
            />
          </label>
          <label class="mmd-viewer__control-item">
            主光高度
            <input
              v-model.number="lightSettings.keyElevation"
              type="range"
              min="-10"
              max="90"
              step="1"
              :disabled="!isLoaded"
            />
          </label>
          <label class="mmd-viewer__control-item">
            主光距离
            <input
              v-model.number="lightSettings.keyDistance"
              type="range"
              min="6"
              max="80"
              step="1"
              :disabled="!isLoaded"
            />
          </label>
        </div>
        <div class="mmd-viewer__control-grid">
          <label class="mmd-viewer__control-item">
            补光强度
            <input
              v-model.number="lightSettings.fillIntensity"
              type="range"
              min="0"
              max="2"
              step="0.05"
              :disabled="!isLoaded"
            />
          </label>
          <label class="mmd-viewer__control-item">
            补光颜色
            <input v-model="lightSettings.fillColor" type="color" :disabled="!isLoaded" />
          </label>
          <label class="mmd-viewer__control-item">
            补光方位
            <input
              v-model.number="lightSettings.fillAzimuth"
              type="range"
              min="0"
              max="360"
              step="1"
              :disabled="!isLoaded"
            />
          </label>
          <label class="mmd-viewer__control-item">
            补光高度
            <input
              v-model.number="lightSettings.fillElevation"
              type="range"
              min="-10"
              max="90"
              step="1"
              :disabled="!isLoaded"
            />
          </label>
          <label class="mmd-viewer__control-item">
            补光距离
            <input
              v-model.number="lightSettings.fillDistance"
              type="range"
              min="6"
              max="80"
              step="1"
              :disabled="!isLoaded"
            />
          </label>
        </div>
      </div> -->
    </div>

    <div v-if="props.model.motions?.length || props.model.poses?.length" class="mmd-viewer__controls">
      <div v-if="props.model.motions?.length" class="mmd-viewer__control-group">
        <p class="mmd-viewer__control-label">动作</p>
        <div class="mmd-viewer__control-buttons">
          <button
            class="mmd-button mmd-button--ghost"
            type="button"
            :class="{ 'mmd-button--active': !activeMotionId && !activePoseId }"
            :disabled="!isLoaded || isLoading"
            @click="clearAnimationState"
          >
            静止
          </button>
          <button
            v-for="motion in props.model.motions"
            :key="motion.id"
            class="mmd-button mmd-button--ghost"
            type="button"
            :class="{ 'mmd-button--active': activeMotionId === motion.id }"
            :disabled="!isLoaded || isLoading"
            @click="applyMotion(motion.id)"
          >
            {{ motion.name }}
          </button>
        </div>
      </div>

      <div v-if="props.model.poses?.length" class="mmd-viewer__control-group">
        <p class="mmd-viewer__control-label">姿势</p>
        <div class="mmd-viewer__control-buttons">
          <button
            v-for="pose in props.model.poses"
            :key="pose.id"
            class="mmd-button mmd-button--ghost"
            type="button"
            :class="{ 'mmd-button--active': activePoseId === pose.id }"
            :disabled="!isLoaded || isLoading"
            @click="applyPose(pose.id)"
          >
            {{ pose.name }}
          </button>
        </div>
      </div>
    </div>

    <p v-if="props.model.source" class="mmd-viewer__source">
      来源：
      <a :href="props.model.source.url" target="_blank" rel="noopener noreferrer">
        {{ props.model.source.name }}
      </a>
      <span v-if="props.model.source.note" class="mmd-viewer__source-note">{{ props.model.source.note }}</span>
      ; 光照调整功能尚有问题，暂时隐藏相关控制项，待后续更新
    </p>
  </section>
</template>

<style lang="scss">
.mmd-viewer {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  overflow: hidden;
}

.mmd-viewer__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
}

.mmd-viewer__title {
  font-family: 'Bungee', 'Montserrat', sans-serif;
  letter-spacing: 0.12em;
  font-size: 20px;
  margin: 0 0 4px;
}

.mmd-viewer__subtitle {
  margin: 0;
  opacity: 0.7;
  font-size: 13px;
}

.mmd-viewer__actions {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.mmd-viewer__mode-toggle {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.mmd-viewer__stage {
  flex-grow: 1;
  position: relative;
  min-height: clamp(320px, 50vh, 620px);
  border-radius: 24px;
  background:
    radial-gradient(circle at 20% 20%, rgba(87, 171, 168, 0.18), transparent 50%),
    linear-gradient(150deg, rgba(15, 26, 32, 0.9), rgba(6, 12, 14, 0.95));
  border: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
  touch-action: none;
}

.mmd-viewer__stage canvas {
  width: 100%;
  /* height: 100%; */
  display: block;
}

.mmd-viewer__controls {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-height: 40px;
}

.mmd-viewer__control-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.mmd-viewer__control-label {
  margin: 0;
  font-size: 12px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(249, 225, 154, 0.9);
}

.mmd-viewer__control-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.mmd-viewer__control-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px 16px;
}

.mmd-viewer__control-item {
  display: grid;
  gap: 6px;
  font-size: 12px;
  opacity: 0.85;
}

.mmd-viewer__control-item input[type='range'] {
  width: 100%;
}

.mmd-viewer__hint {
  margin: 0;
  font-size: 12px;
  opacity: 0.7;
}

.mmd-viewer__placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 14px;
  padding: 28px 34px;
}

.mmd-viewer__placeholder-title {
  margin: 0;
  font-size: 18px;
  letter-spacing: 0.08em;
}

.mmd-viewer__placeholder-text,
.mmd-viewer__placeholder-hint {
  margin: 0;
  max-width: 420px;
  opacity: 0.78;
  font-size: 14px;
}

.mmd-viewer__error {
  position: absolute;
  inset: auto 24px 24px 24px;
  padding: 12px 16px;
  border-radius: 12px;
  background: rgba(120, 22, 24, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.12);
  font-size: 13px;
}

.mmd-button {
  appearance: none;
  border: none;
  border-radius: 999px;
  padding: 10px 18px;
  background: linear-gradient(120deg, #57aba8, #874052);
  color: #fefcf4;
  font-weight: 600;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition:
    transform 180ms ease,
    box-shadow 180ms ease,
    opacity 180ms ease;
}

.mmd-button:disabled {
  opacity: 0.6;
  cursor: default;
}

.mmd-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 10px 24px rgba(6, 12, 14, 0.4);
}

.mmd-button--ghost {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.24);
}

.mmd-button--active {
  border-color: rgba(87, 171, 168, 0.7);
  box-shadow: 0 0 0 1px rgba(87, 171, 168, 0.35);
}

.mmd-viewer__source {
  margin: 0;
  font-size: 12px;
  opacity: 0.75;
}

.mmd-viewer__source a {
  color: var(--text-2);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.mmd-viewer__source-note {
  margin-left: 8px;
  opacity: 0.8;
}

@media (max-width: 720px) {
  .mmd-viewer__header {
    flex-direction: column;
    align-items: flex-start;
  }

  .mmd-viewer__actions {
    width: 100%;
    flex-wrap: wrap;
  }

  .mmd-viewer__placeholder {
    padding: 22px;
  }
}
</style>
