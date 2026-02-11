<script setup lang="ts">
import FanWorkItem from '../../components/FanWorkItem.vue'
import FanWorksGallery from '../../components/FanWorksGallery.vue'
</script>

<template>
  <div class="fan-works-section">
    <header class="fan-works-section__header" data-reveal data-delay="1">
      <p class="fan-works-section__eyebrow">Fan Works</p>
      <h2>同人作品精选</h2>
    </header>
    <div data-reveal data-delay="2">
      <FanWorksGallery :default-active="0">
        <FanWorkItem :index="0" thumb-color="#3b3f5e">
          <template #thumb>作品 A</template>
          <div class="fan-works-section__media">展开后媒体占位</div>
          <template #info>
            <div class="fan-works-section__info">
              <strong>作品 A</strong>
              <span>作者 · 某位同人画师</span>
            </div>
          </template>
        </FanWorkItem>
        <FanWorkItem :index="1" thumb-color="#2a4052">
          <template #thumb>作品 B</template>
          <div class="fan-works-section__media">动图/短视频占位</div>
          <template #info>
            <div class="fan-works-section__info">
              <strong>作品 B</strong>
              <span>作者 · 某位剪辑师</span>
            </div>
          </template>
        </FanWorkItem>
        <FanWorkItem :index="2" thumb-color="#46324f">
          <template #thumb>作品 C</template>
          <div class="fan-works-section__media">展开后媒体占位</div>
          <template #info>
            <div class="fan-works-section__info">
              <strong>作品 C</strong>
              <span>作者 · 某位摄影师</span>
            </div>
          </template>
        </FanWorkItem>
      </FanWorksGallery>
    </div>
  </div>
</template>

<style>
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

.fan-works-section__media {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  background: rgba(0, 0, 0, 0.2);
}

.fan-works-section__info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
}

.fan-works-section__info span {
  opacity: 0.7;
}
</style>
