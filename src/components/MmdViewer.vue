<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import type { OrbitControls } from 'three-stdlib'
import type { MmdModelConfig } from '../data/mmdModels'
import { splitFileUrl } from '../utils';

const props = defineProps<{ model: MmdModelConfig }>()

const rootRef = ref<HTMLDivElement | null>(null)
const stageRef = ref<HTMLDivElement | null>(null)
const isLoading = ref(false)
const isLoaded = ref(false)
const errorMessage = ref<string | null>(null)

let renderer: import('three').WebGLRenderer | null = null
let scene: import('three').Scene | null = null
let camera: import('three').PerspectiveCamera | null = null
let controls: OrbitControls | null = null
let modelRoot: import('three').Object3D | null = null
let animationFrameId = 0
let resizeObserver: ResizeObserver | null = null
let observer: IntersectionObserver | null = null
let isVisible = true

const loadModel = async () => {
  if (isLoading.value || isLoaded.value) return
  if (!stageRef.value) {
    errorMessage.value = '3D 容器搭建中，请稍等片刻...'
    return
  }

  isLoading.value = true
  errorMessage.value = null

  try {
    const THREE = await import('three')
    const { OrbitControls, MMDLoader } = await import('three-stdlib')

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

    const loader = new MMDLoader()
    ;(loader as { setCrossOrigin?: (value: string) => void }).setCrossOrigin?.('anonymous')

    // const baseUrl = props.model.resourcePath ?? props.model.modelUrl.substring(0, props.model.modelUrl.lastIndexOf('/') + 1)
    // const fileName = props.model.modelUrl.substring(baseUrl.length)
    const { baseUrl, fileName } = splitFileUrl(props.model.modelUrl)
    loader.setPath(baseUrl)
    ;(loader as { setResourcePath?: (value: string) => void }).setResourcePath?.(baseUrl)

    const loadedModel = await new Promise<import('three').Object3D>((resolve, reject) => {
      loader.load(fileName, resolve, undefined, reject)
    })

    if (!isVisible) {
      disposeThree()
      return
    }

    loadedModel.scale.setScalar(props.model.modelScale)
    loadedModel.rotation.set(...props.model.modelRotation)

    modelRoot = loadedModel
    scene.add(loadedModel)

    const animate = () => {
      if (!renderer || !scene || !camera) return
      animationFrameId = window.requestAnimationFrame(animate)
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

const resetCamera = () => {
  if (!camera || !controls) return
  camera.position.set(...props.model.cameraPosition)
  controls.target.set(...props.model.cameraTarget)
  controls.update()
}

const disposeObject = (object: import('three').Object3D) => {
  object.traverse((child) => {
    const mesh = child as import('three').Mesh
    if (mesh.geometry) {
      mesh.geometry.dispose()
    }

    const material = (mesh.material ?? null) as
      | import('three').Material
      | import('three').Material[]
      | null

    if (Array.isArray(material)) {
      material.forEach(disposeMaterial)
    } else if (material) {
      disposeMaterial(material)
    }
  })
}

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
  isLoaded.value = false
  isLoading.value = false
}

const unloadIfHidden = (entries: IntersectionObserverEntry[]) => {
  const [entry] = entries
  if (!entry) return
  isVisible = entry.isIntersecting
  if (!isVisible && isLoaded.value) {
    disposeThree()
  }
}

onMounted(() => {
  if (!rootRef.value || typeof IntersectionObserver === 'undefined') return
  observer = new IntersectionObserver(unloadIfHidden, { threshold: 0.2 })
  observer.observe(rootRef.value)
})

onBeforeUnmount(() => {
  disposeThree()
  observer?.disconnect()
  observer = null
})
</script>

<template>
  <section ref="rootRef" class="mmd-viewer">
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
  background: radial-gradient(circle at 20% 20%, rgba(87, 171, 168, 0.18), transparent 50%),
    linear-gradient(150deg, rgba(15, 26, 32, 0.9), rgba(6, 12, 14, 0.95));
  border: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

.mmd-viewer__stage canvas {
  width: 100%;
  height: 100%;
  display: block;
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
  transition: transform 180ms ease, box-shadow 180ms ease, opacity 180ms ease;
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
