<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

type Props = {
  id?: string
  title?: string
}

const props = defineProps<Props>()
const sectionRef = ref<HTMLElement | null>(null)
const hasEntered = ref(false)
let observer: IntersectionObserver | null = null

/**
 * 初始化可视区域监听，只触发一次进入动画。
 */
const initObserver = () => {
  if (!sectionRef.value || typeof IntersectionObserver === 'undefined') {
    hasEntered.value = true
    return
  }

  observer = new IntersectionObserver(
    (entries) => {
      const [entry] = entries
      if (entry?.isIntersecting && !hasEntered.value) {
        hasEntered.value = true
        observer?.disconnect()
      }
    },
    { threshold: 0.35 }
  )

  observer.observe(sectionRef.value)
}

onMounted(() => {
  initObserver()
})

onBeforeUnmount(() => {
  observer?.disconnect()
})
</script>

<template>
  <section ref="sectionRef" class="page-section" :id="props.id" :data-entered="hasEntered" :aria-label="props.title">
    <div class="page-section__content">
      <slot :entered="hasEntered" />
    </div>
  </section>
</template>

<style>
.page-section {
  height: 100vh;
  scroll-snap-align: start;
  scroll-snap-stop: always;
  padding: calc(48px + var(--header-height, 72px)) 6vw 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-section__content {
  /* height: 100%; */
  width: min(1280px, 100%);
}

.page-section [data-reveal] {
  opacity: 0;
  transform: translateY(24px);
  transition:
    opacity 600ms ease,
    transform 600ms ease;
}

.page-section[data-entered='true'] [data-reveal] {
  opacity: 1;
  transform: translateY(0);
}

.page-section[data-entered='true'] [data-reveal][data-delay='1'] {
  transition-delay: 120ms;
}

.page-section[data-entered='true'] [data-reveal][data-delay='2'] {
  transition-delay: 240ms;
}

.page-section[data-entered='true'] [data-reveal][data-delay='3'] {
  transition-delay: 360ms;
}

@media (max-width: 720px) {
  .page-section {
    height: 100vh;
    padding: calc(32px + var(--header-height, 60px)) 5vw 32px;
  }
}
</style>
