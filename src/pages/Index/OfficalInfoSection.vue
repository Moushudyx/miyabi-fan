<!-- 首页官方信息与周边 -->
<script setup lang="ts">
import VideoTapeItem from '../../components/VideoTapeItem.vue'
import VideoTapeRack from '../../components/VideoTapeRack.vue'
import { useNewsInfos, useOfficialInfos } from '../../data/officialInfos'

const newsInfos = useNewsInfos()
const officialInfos = useOfficialInfos()
</script>

<template>
  <div class="official-section">
    <header class="official-section__header" data-reveal data-delay="1">
      <p class="official-section__eyebrow">Official</p>
      <h2>官方情报与周边</h2>
    </header>
    <div class="official-section__racks" data-reveal data-delay="2">
      <VideoTapeRack title="最新情报">
        <VideoTapeItem
          v-for="(info, index) in newsInfos"
          :key="`${info.title}-${index}`"
          :index="index"
          :info="info"
        />
      </VideoTapeRack>
      <VideoTapeRack title="官方链接">
        <VideoTapeItem
          v-for="(info, index) in officialInfos"
          :key="`${info.title}-${index}`"
          :index="index"
          :info="info"
        />
      </VideoTapeRack>
    </div>
  </div>
</template>

<style lang="scss">
.official-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.official-section__header h2 {
  margin: 0;
  font-size: clamp(22px, 3vw, 32px);
}

.official-section__header p {
  margin: 0;
  opacity: 0.7;
}

.official-section__eyebrow {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.18em;
}

.official-section__racks {
  display: grid;
  gap: 28px;
}
</style>
