<script setup lang="ts">
import FanWorkItem from '../../components/FanWorkItem.vue'
import FanWorksGallery from '../../components/FanWorksGallery.vue'
import { useFanWorks } from '../../data/fanWorks'

const fanWorks = useFanWorks()
</script>

<template>
  <div class="fan-works-section">
    <header class="fan-works-section__header" data-reveal data-delay="1">
      <p class="fan-works-section__eyebrow">Fan Works</p>
      <h2>同人作品推荐</h2>
    </header>
    <div data-reveal data-delay="2">
      <FanWorksGallery :default-active="0">
        <FanWorkItem v-for="(work, index) in fanWorks" :key="`${work.title}-${index}`" :index="index" :work="work" />
      </FanWorksGallery>
    </div>
  </div>
</template>

<style lang="scss">
.fan-works-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.fan-works-section__header {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.fan-works-section__header h2 {
  margin: 0;
  font-size: clamp(24px, 3vw, 36px);
}

.fan-works-section__header p {
  margin: 0;
  opacity: 0.7;
}

.fan-works-section__eyebrow {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.18em;
}
</style>
