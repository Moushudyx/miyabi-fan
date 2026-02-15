<script setup lang="ts">
import { useHead } from '#imports'
import AttributionPanel from '../components/AttributionPanel.vue'

useHead({
  title: '关于 | 星见雅 Fan Site',
  meta: [
    {
      name: 'description',
      content: '关于星见雅同人站的介绍与制作信息',
    },
  ],
})
</script>

<template>
  <div class="about-page">
    <div class="about-page__card">
      <h1>关于</h1>
      <p>这里是关于页的占位内容，后续会补充项目介绍与制作名单</p>
    </div>
    <AttributionPanel />
  </div>
</template>

<style>
.about-page {
  min-height: calc(100vh - 72px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 6vw;
}

.about-page__card {
  max-width: 640px;
  width: 100%;
  padding: 32px;
  border-radius: 24px;
  background: rgba(15, 18, 30, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(12px);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.about-page__card h1 {
  margin-top: 0;
}

.about-page__card p {
  margin-bottom: 0;
  opacity: 0.7;
}

@media (max-width: 720px) {
  .about-page {
    min-height: calc(100vh - 60px);
  }
}
</style>
