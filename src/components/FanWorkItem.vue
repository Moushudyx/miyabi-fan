<script setup lang="ts">
import { computed, inject } from 'vue'

type Props = {
  index: number
  thumbColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  thumbColor: '#2b3150',
})

const activeIndex = inject('fanWorksActiveIndex') as { value: number }
const activateByInteraction = inject('fanWorksActivateByInteraction') as (
  index: number,
  mode: 'hover' | 'click'
) => void

const isActive = computed(() => activeIndex?.value === props.index)

/**
 * 鼠标划过时展开当前作品。
 */
const handleHover = () => {
  activateByInteraction?.(props.index, 'hover')
}

/**
 * 点击时展开当前作品（移动端优先）。
 */
const handleClick = () => {
  activateByInteraction?.(props.index, 'click')
}

/**
 * 键盘操作时展开当前作品。
 */
const handleKeyToggle = () => {
  activateByInteraction?.(props.index, 'click')
}
</script>

<template>
  <div
    class="fan-work-item"
    :class="{ 'is-active': isActive }"
    @mouseenter="handleHover"
    @focusin="handleHover"
    @click="handleClick"
    @keydown.enter.prevent="handleKeyToggle"
    @keydown.space.prevent="handleKeyToggle"
    role="button"
    tabindex="0"
  >
    <div class="fan-work-item__thumb" :style="{ background: props.thumbColor }">
      <slot name="thumb" />
    </div>
    <div class="fan-work-item__media" :aria-hidden="!isActive">
      <slot />
    </div>
    <div class="fan-work-item__info" v-if="isActive">
      <slot name="info" />
    </div>
  </div>
</template>

<style>
.fan-work-item {
  position: relative;
  flex: 1;
  min-width: 120px;
  border-radius: 18px;
  overflow: hidden;
  background: var(--surface-3);
  transition:
    flex 400ms ease,
    box-shadow 400ms ease,
    height 400ms ease;
  cursor: pointer;
}

.fan-work-item.is-active {
  flex: 3.4;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.45);
}

.fan-work-item__thumb,
.fan-work-item__media {
  position: absolute;
  inset: 0;
}

.fan-work-item__thumb {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.fan-work-item__media {
  opacity: 0;
  transition: opacity 300ms ease;
}

.fan-work-item.is-active .fan-work-item__media {
  opacity: 1;
}

.fan-work-item__info {
  position: absolute;
  left: 16px;
  bottom: 16px;
  padding: 10px 14px;
  border-radius: 12px;
  background: rgba(6, 12, 14, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(8px);
}

.fan-works-gallery--column .fan-work-item {
  flex: none;
  height: 140px;
}

.fan-works-gallery--column .fan-work-item.is-active {
  height: 280px;
}

@media (max-width: 840px) {
  .fan-work-item {
    min-height: 120px;
    height: 120px;
    flex: none;
  }

  .fan-work-item.is-active {
    height: 260px;
  }

  .fan-work-item__info {
    left: auto;
    right: 12px;
    top: 12px;
    bottom: auto;
  }
}
</style>
