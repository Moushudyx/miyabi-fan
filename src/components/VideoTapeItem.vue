<script setup lang="ts">
import { computed, inject } from 'vue'

type Props = {
  index: number
  spineColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  spineColor: '#2b3150',
})

const activeIndex = inject('videoTapeActiveIndex') as { value: number }
const toggleActive = inject('videoTapeToggleActive') as (index: number) => void

const isActive = computed(() => activeIndex?.value === props.index)

/**
 * 点击抽出或收回录像带。
 */
const handleToggle = () => {
  toggleActive?.(props.index)
}

/**
 * 键盘触发抽出或收回录像带。
 */
const handleKeyToggle = () => {
  toggleActive?.(props.index)
}
</script>

<template>
  <article
    class="video-tape-item"
    :class="{ 'is-active': isActive }"
    role="button"
    tabindex="0"
    @click="handleToggle"
    @keydown.enter.prevent="handleKeyToggle"
    @keydown.space.prevent="handleKeyToggle"
  >
    <div class="video-tape-item__spine" :style="{ background: props.spineColor }">
      <slot name="spine" />
    </div>
    <div class="video-tape-item__front" v-if="isActive">
      <slot />
    </div>
    <div class="video-tape-item__gloss"></div>
  </article>
</template>

<style>
.video-tape-item {
  position: relative;
  width: 68px;
  height: 220px;
  flex: 0 0 auto;
  perspective: 800px;
  cursor: pointer;
  transition:
    transform 400ms ease,
    box-shadow 400ms ease,
    width 400ms ease,
    height 400ms ease;
}

.video-tape-item__spine {
  height: 100%;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #f2f2f2;
  font-weight: 600;
  letter-spacing: 0.08em;
  transform: rotateY(-28deg);
  transition: transform 500ms ease;
  box-shadow: inset -6px 0 14px rgba(0, 0, 0, 0.45);
}

.video-tape-item__front {
  position: absolute;
  inset: 0;
  border-radius: 16px;
  background: rgba(6, 12, 14, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  transform: rotateY(90deg);
  transition:
    transform 500ms ease,
    opacity 300ms ease;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.55);
}

.video-tape-item__gloss {
  position: absolute;
  inset: 0;
  border-radius: 16px;
  background: linear-gradient(120deg, rgba(87, 171, 168, 0.2), transparent 55%);
  pointer-events: none;
  opacity: 0.4;
  mix-blend-mode: screen;
}

.video-tape-item.is-active .video-tape-item__spine {
  transform: rotateY(0deg);
}

.video-tape-item.is-active .video-tape-item__front {
  transform: rotateY(0deg);
}

.video-tape-item.is-active {
  position: fixed;
  top: 50%;
  left: 50%;
  width: 260px;
  height: 340px;
  transform: translate(-50%, -50%);
  z-index: 60;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6);
}

@media (max-width: 720px) {
  .video-tape-item.is-active {
    width: 220px;
    height: 300px;
  }
}
</style>
