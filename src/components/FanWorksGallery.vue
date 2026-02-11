<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, provide, ref } from 'vue'

type Props = {
  defaultActive?: number
  direction?: 'row' | 'column'
}

const props = withDefaults(defineProps<Props>(), {
  defaultActive: 0,
  direction: 'row',
})

const activeIndex = ref(props.defaultActive)
const isPointer = ref(false)
let mediaQuery: MediaQueryList | null = null

/**
 * 标记当前设备是否支持鼠标指针，用于区分 hover 与 click 行为。
 */
const detectPointer = () => {
  if (typeof window === 'undefined') return
  mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)')
  isPointer.value = mediaQuery.matches
}

/**
 * 监听指针能力变化，适配可插拔设备。
 */
const handlePointerChange = () => {
  if (!mediaQuery) return
  isPointer.value = mediaQuery.matches
}

/**
 * 兼容旧版浏览器的媒体查询监听。
 */
const bindMediaQueryListener = () => {
  if (!mediaQuery) return
  mediaQuery.addEventListener('change', handlePointerChange)
}

/**
 * 清理媒体查询监听。
 */
const unbindMediaQueryListener = () => {
  if (!mediaQuery) return
  mediaQuery.removeEventListener('change', handlePointerChange)
}

/**
 * 设置展开的作品索引。
 */
const setActive = (index: number) => {
  activeIndex.value = index
}

/**
 * 根据交互类型更新展开的作品。
 */
const activateByInteraction = (index: number, mode: 'hover' | 'click') => {
  if (mode === 'hover' && !isPointer.value) return
  if (mode === 'click' && isPointer.value) return
  setActive(index)
}

provide('fanWorksActiveIndex', activeIndex)
provide('fanWorksSetActive', setActive)
provide('fanWorksActivateByInteraction', activateByInteraction)

const directionClass = computed(() =>
  props.direction === 'column' ? 'fan-works-gallery--column' : 'fan-works-gallery--row'
)

onMounted(() => {
  detectPointer()
  bindMediaQueryListener()
})

onBeforeUnmount(() => {
  unbindMediaQueryListener()
})
</script>

<template>
  <div class="fan-works-gallery" :class="directionClass">
    <slot />
  </div>
</template>

<style>
.fan-works-gallery {
  display: flex;
  gap: 12px;
  width: 100%;
  height: min(420px, 60vh);
}

.fan-works-gallery--column {
  flex-direction: column;
  height: auto;
}

@media (max-width: 840px) {
  .fan-works-gallery {
    flex-direction: column;
    height: calc(100vh - 120px - 60px - 66px);
  }
}
</style>
