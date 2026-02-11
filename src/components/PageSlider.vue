<script setup lang="ts">
import { computed } from 'vue'

type Props = {
  axis?: 'y' | 'x'
}

const props = withDefaults(defineProps<Props>(), {
  axis: 'y',
})

const axisClass = computed(() => (props.axis === 'x' ? 'page-slider--horizontal' : 'page-slider--vertical'))
</script>

<template>
  <div class="page-slider" :class="axisClass">
    <slot />
  </div>
</template>

<style>
.page-slider {
  height: calc(100vh - 72px);
  overflow: auto;
  scroll-snap-type: y mandatory;
  scroll-behavior: smooth;
}

.page-slider--horizontal {
  height: auto;
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-snap-type: x mandatory;
}

@media (max-width: 720px) {
  .page-slider {
    height: calc(100vh - 60px);
  }
}
</style>
