<template>
  <div class="footer-section">
    <div class="footer-section__content" data-reveal data-delay="1">
      <h2>加入应援</h2>
      <div class="footer-section__links">
        <div class="footer-section__chip">Bilibili</div>
        <div class="footer-section__chip">微博</div>
        <div class="footer-section__chip">TapTap</div>
        <div class="footer-section__chip">HoYoLab</div>
      </div>
      <AttributionPanel />
    </div>
  </div>
</template>

<script setup lang="ts">
import AttributionPanel from '../../components/AttributionPanel.vue'
</script>

<style>
.footer-section {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.footer-section__content {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
}

.footer-section__content h2 {
  margin: 0;
}

.footer-section__content p {
  margin: 0;
  opacity: 0.7;
}

.footer-section__links {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

.footer-section__chip {
  padding: 8px 16px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(15, 18, 30, 0.7);
}
</style>
