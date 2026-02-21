<script setup lang="ts">
import { useHead } from '#imports'
import PageSection from '../components/PageSection.vue'
import PageSlider from '../components/PageSlider.vue'
import MmdViewer from '../components/MmdViewer.vue'
import { useMmdModels } from '../data/mmdModels'

const mmdModels = useMmdModels()

useHead({
  title: '鉴赏 | 星见雅 Fan Site',
  meta: [
    {
      name: 'description',
      content: '角色鉴赏，包含角色模型鉴赏与相关信息介绍',
    },
  ],
})
</script>

<template>
  <PageSlider>
    <PageSection v-for="model in mmdModels" :key="model.id" :id="`view3d-${model.id}`" :title="model.name">
      <div class="view3d-section">
        <div class="view3d-section__intro" data-reveal>
          <!-- <p class="view3d-section__kicker">3D 鉴赏</p> -->
          <p class="view3d-section__summary">{{ model.subtitle }}</p>
          <h2 class="view3d-section__title">{{ model.name }}</h2>
        </div>
        <ClientOnly>
          <MmdViewer :model="model" />
          <template #fallback>
            <div class="view3d-placeholder" role="status" aria-live="polite">
              <div class="view3d-placeholder__media">
                <span class="view3d-placeholder__badge">3D Viewer Loading</span>
              </div>
              <div class="view3d-placeholder__body">
                <p class="view3d-placeholder__text">该页面包含可交互的 3D 模型展示，加载完成后将出现可旋转的模型视图</p>
                <div v-if="model.source" class="view3d-placeholder__credits">
                  <p class="view3d-placeholder__title">模型来源</p>
                  <p class="view3d-placeholder__line">{{ model.source.name }}</p>
                  <p v-if="model.source.author" class="view3d-placeholder__line">作者：{{ model.source.author }}</p>
                  <p v-if="model.source.note" class="view3d-placeholder__line">
                    {{ model.source.note }}
                  </p>
                  <a class="view3d-placeholder__link" :href="model.source.url" target="_blank" rel="noreferrer">
                    访问来源页面
                  </a>
                </div>
              </div>
            </div>
          </template>
        </ClientOnly>
      </div>
    </PageSection>
  </PageSlider>
</template>

<style lang="scss">
.view3d-section {
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

.view3d-placeholder {
  display: grid;
  gap: 18px;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
  padding: 24px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: linear-gradient(135deg, rgba(8, 18, 22, 0.92), rgba(12, 20, 26, 0.76));
}

.view3d-placeholder__media {
  position: relative;
  border-radius: 16px;
  min-height: 240px;
  background: linear-gradient(120deg, rgba(96, 201, 216, 0.2), rgba(135, 64, 82, 0.25));
  overflow: hidden;
}

.view3d-placeholder__media::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.25), transparent 55%);
}

.view3d-placeholder__badge {
  position: absolute;
  top: 16px;
  left: 16px;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-1);
  background: rgba(6, 52, 53, 0.65);
}

.view3d-placeholder__body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.view3d-placeholder__text {
  margin: 0;
  opacity: 0.75;
}

.view3d-placeholder__credits {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 14px;
}

.view3d-placeholder__title {
  margin: 0;
  font-weight: 600;
}

.view3d-placeholder__line {
  margin: 0;
  opacity: 0.8;
}

.view3d-placeholder__link {
  margin-top: 6px;
  color: var(--accent-cyan);
  font-weight: 600;
}

@media (max-width: 900px) {
  .view3d-placeholder {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 720px) {
  .view3d-section__kicker {
    letter-spacing: 0.2em;
  }
}
</style>
