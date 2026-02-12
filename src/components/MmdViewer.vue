<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import type { MMDAnimationHelper, MMDLoader, OrbitControls } from 'three-stdlib'
import type { AnimationClip, Clock, SkinnedMesh } from 'three'
import type { MmdModelConfig } from '../data/mmdModels'
import { splitFileUrl } from '../utils'

const props = defineProps<{ model: MmdModelConfig }>()

const stageRef = ref<HTMLDivElement | null>(null)
const isLoading = ref(false)
const isLoaded = ref(false)
const errorMessage = ref<string | null>(null)
const activeMotionId = ref<string | null>(null)
const activePoseId = ref<string | null>(null)

let renderer: import('three').WebGLRenderer | null = null
let scene: import('three').Scene | null = null
let camera: import('three').PerspectiveCamera | null = null
let controls: OrbitControls | null = null
let modelRoot: import('three').Object3D | null = null
let modelMesh: SkinnedMesh | null = null
let animationHelper: MMDAnimationHelper | null = null
let mmdLoader: MMDLoader | null = null
let clock: Clock | null = null
let animationFrameId = 0
let resizeObserver: ResizeObserver | null = null
const motionClips = new Map<string, AnimationClip>()
const poseCache = new Map<string, object>()

const getPhysicsEnabled = () => {
  const hasAmmo = typeof (window as { Ammo?: unknown }).Ammo !== 'undefined'
  return Boolean(props.model.enablePhysics && hasAmmo)
}

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

const loadModel = async () => {
  if (isLoading.value || isLoaded.value) return
  if (!stageRef.value) {
    errorMessage.value = '3D 容器搭建中，请稍等片刻...'
    return
  }

  isLoading.value = true
  errorMessage.value = null

  try {
    // 懒加载 three.js 与 MMD 相关模块，避免首屏体积爆炸
    const THREE = await import('three')
    const { OrbitControls, MMDAnimationHelper, MMDLoader } = await import('three-stdlib')

    scene = new THREE.Scene()

    const ambient = new THREE.AmbientLight(0xffffff, 0.65)
    const keyLight = new THREE.DirectionalLight(0xffffff, 0.85)
    const fillLight = new THREE.DirectionalLight(0x6fd6d3, 0.35)

    keyLight.position.set(8, 18, 12)
    fillLight.position.set(-10, 6, -8)

    scene.add(ambient, keyLight, fillLight)

    camera = new THREE.PerspectiveCamera(35, 1, 0.1, 2000)
    camera.position.set(...props.model.cameraPosition)

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.05
    stageRef.value.appendChild(renderer.domElement)

    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.enablePan = false
    controls.minDistance = 4
    controls.maxDistance = 120
    controls.rotateSpeed = 0.55
    controls.zoomSpeed = 0.9
    controls.target.set(...props.model.cameraTarget)
    controls.update()

    const resize = () => {
      if (!stageRef.value || !camera || !renderer) return
      const { width, height } = stageRef.value.getBoundingClientRect()
      const nextHeight = Math.max(height, 1)
      camera.aspect = width / nextHeight
      camera.updateProjectionMatrix()
      renderer.setSize(width, nextHeight, false)
    }

    resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(stageRef.value)
    resize()

    // MMDLoader 会根据 resourcePath 解析贴图路径
    mmdLoader = new MMDLoader()
    ;(mmdLoader as { setCrossOrigin?: (value: string) => void }).setCrossOrigin?.('anonymous')

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

    modelRoot = loadedModel
    modelMesh = loadedModel as SkinnedMesh
    // AnimationHelper 负责后续的 VMD 动作与物理更新
    animationHelper = new MMDAnimationHelper({ afterglow: 0.0 })
    animationHelper.add(modelMesh, { physics: getPhysicsEnabled() })
    clock = new THREE.Clock()
    scene.add(loadedModel)

    const animate = () => {
      if (!renderer || !scene || !camera) return
      animationFrameId = window.requestAnimationFrame(animate)
      const delta = clock?.getDelta() ?? 0
      animationHelper?.update(delta)
      controls?.update()
      renderer.render(scene, camera)
    }

    animate()
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
/** 重置镜头 */
const resetCamera = () => {
  if (!camera || !controls) return
  camera.position.set(...props.model.cameraPosition)
  controls.target.set(...props.model.cameraTarget)
  controls.update()
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
        const { baseUrl, fileName } = splitFileUrl(motion.vmdUrl)
        mmdLoader!.setAnimationPath(baseUrl)
        mmdLoader!.loadAnimation(fileName, modelMesh!, (result) => resolve(result as AnimationClip), undefined, reject)
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
        const { baseUrl, fileName } = splitFileUrl(pose.vpdUrl)
        mmdLoader!.setAnimationPath(baseUrl)
        mmdLoader!.loadVPD(fileName, pose.isUnicode ?? true, resolve, undefined, reject)
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

  controls?.dispose()
  controls = null

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
      <div v-if="isLoaded" class="mmd-viewer__actions">
        <!-- <button class="mmd-button mmd-button--ghost" type="button" @click="resetControls">重置轨道</button> -->
        <button class="mmd-button" type="button" @click="resetCamera">回到初始</button>
      </div>
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
    </p>
  </section>
</template>

<style>
.mmd-viewer {
  display: flex;
  flex-direction: column;
  gap: 18px;
  width: 100%;
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
}

.mmd-viewer__stage {
  position: relative;
  min-height: clamp(320px, 60vh, 620px);
  border-radius: 24px;
  background:
    radial-gradient(circle at 20% 20%, rgba(87, 171, 168, 0.18), transparent 50%),
    linear-gradient(150deg, rgba(15, 26, 32, 0.9), rgba(6, 12, 14, 0.95));
  border: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

.mmd-viewer__stage canvas {
  width: 100%;
  height: 100%;
  display: block;
}

.mmd-viewer__controls {
  display: flex;
  flex-direction: column;
  gap: 14px;
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
