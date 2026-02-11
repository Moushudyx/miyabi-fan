<script setup lang="ts">
import PageSection from '../components/PageSection.vue'
import PageSlider from '../components/PageSlider.vue'
import FanWorksSection from './Index/FanWorksSection.vue'
import FooterSection from './Index/FooterSection.vue'
import HeroSection from './Index/HeroSection.vue'
import OfficalInfoSection from './Index/OfficalInfoSection.vue'
</script>

<template>
  <PageSlider>
    <PageSection id="hero" title="星见雅视觉">
      <HeroSection />
    </PageSection>
    <PageSection id="fan-works" title="同人作品">
      <FanWorksSection />
    </PageSection>
    <PageSection id="official" title="官方情报">
      <OfficalInfoSection />
    </PageSection>
    <PageSection id="footer" title="社交媒体">
      <FooterSection />
    </PageSection>
  </PageSlider>
</template>
