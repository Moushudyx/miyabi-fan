<script setup lang="ts">
import { computed, provide, ref } from 'vue'

type Props = {
  defaultActive?: number
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  defaultActive: -1,
  title: '',
})

const activeIndex = ref(props.defaultActive)

/**
 * 设置抽出的录像带索引，重复点击可收回。
 */
const toggleActive = (index: number) => {
  activeIndex.value = activeIndex.value === index ? -1 : index
}

/**
 * 关闭当前抽出的录像带。
 */
const closeActive = () => {
  activeIndex.value = -1
}

provide('videoTapeActiveIndex', activeIndex)
provide('videoTapeToggleActive', toggleActive)

const hasTitle = computed(() => props.title.trim().length > 0)
const isOpen = computed(() => activeIndex.value >= 0)
</script>

<template>
  <section class="video-tape-rack" :aria-label="props.title" :data-open="isOpen">
    <header v-if="hasTitle" class="video-tape-rack__header">
      <h2>{{ props.title }}</h2>
    </header>
    <div class="video-tape-rack__track">
      <slot />
    </div>
    <div v-if="isOpen" class="video-tape-rack__overlay" @click="closeActive"></div>
  </section>
</template>

<style>
.video-tape-rack {
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
}

.video-tape-rack__header h2 {
  margin: 0;
  font-size: 20px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.video-tape-rack__track {
  display: flex;
  justify-content: center;
  gap: 6px;
  overflow-x: auto;
  padding: 16px 12px 18px;
  position: relative;
  border-radius: 6px;
  background:
    linear-gradient(180deg, rgba(7, 14, 18, 0.9), rgba(7, 14, 18, 0.7)),
    repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.06) 0, rgba(255, 255, 255, 0.06) 2px, transparent 2px, transparent 8px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    inset 0 -4px 8px rgba(0, 0, 0, 0.4);
}

.video-tape-rack__track::after {
  content: '';
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: 8px;
  height: 4px;
  background: linear-gradient(90deg, rgba(249, 225, 154, 0.25), rgba(255, 255, 255, 0.08));
  border-radius: 2px;
}

.video-tape-rack__overlay {
  position: fixed;
  inset: 0;
  background: rgba(7, 10, 16, 0.62);
  backdrop-filter: blur(6px);
  z-index: 40;
}

.video-tape-rack__track::-webkit-scrollbar {
  height: 6px;
}

.video-tape-rack__track::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}
</style>
