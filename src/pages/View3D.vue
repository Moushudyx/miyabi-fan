<script setup lang="ts">
import PageSection from '../components/PageSection.vue'
import PageSlider from '../components/PageSlider.vue'
import MmdViewer from '../components/MmdViewer.vue'
import { mmdModels } from '../data/mmdModels'
</script>

<template>
  <PageSlider>
    <PageSection v-for="model in mmdModels" :key="model.id" :id="`view3d-${model.id}`" :title="model.name">
      <div class="view3d-section">
        <div class="view3d-section__intro" data-reveal>
          <p class="view3d-section__kicker">3D 鉴赏</p>
          <h2 class="view3d-section__title">{{ model.name }}</h2>
          <p class="view3d-section__summary">{{ model.subtitle }}</p>
        </div>
        <MmdViewer :model="model" />
      </div>
    </PageSection>
  </PageSlider>
</template>

<style>
.view3d-section {
  /* display: grid; */
  /* grid-template-columns: minmax(0, 1fr); */
  display: flex;
  flex-direction: column;
  gap: 26px;
  height: 100%;
  overflow: hidden;
}

.view3d-section__intro {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.view3d-section__kicker {
  margin: 0;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  font-size: 12px;
  color: var(--accent-gold);
}

.view3d-section__title {
  margin: 0;
  font-size: clamp(28px, 3vw, 40px);
  letter-spacing: 0.08em;
}

.view3d-section__summary {
  margin: 0;
  opacity: 0.7;
  font-size: 15px;
  max-width: 520px;
}

@media (max-width: 720px) {
  .view3d-section__kicker {
    letter-spacing: 0.2em;
  }
}
</style>
