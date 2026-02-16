<!-- 首页官方信息与周边 -->
<script setup lang="ts">
import VideoTapeItem from '../../components/VideoTapeItem.vue'
import VideoTapeRack from '../../components/VideoTapeRack.vue'
</script>

<template>
  <div class="official-section">
    <header class="official-section__header" data-reveal data-delay="1">
      <p class="official-section__eyebrow">Official</p>
      <h2>官方情报与周边</h2>
    </header>
    <div class="official-section__racks" data-reveal data-delay="2">
      <VideoTapeRack title="最新情报">
        <VideoTapeItem :index="0" spine-color="#32405d">
          <template #spine>公告</template>
          <div class="official-section__front">官方公告</div>
        </VideoTapeItem>
        <VideoTapeItem :index="1" spine-color="#3e2f4d">
          <template #spine>活动</template>
          <div class="official-section__front">版本活动</div>
        </VideoTapeItem>
        <VideoTapeItem :index="2" spine-color="#2b4f52">
          <template #spine>更新</template>
          <div class="official-section__front">更新日志</div>
        </VideoTapeItem>
      </VideoTapeRack>
      <VideoTapeRack title="官方链接">
        <VideoTapeItem :index="0" spine-color="#3a3a5b">
          <template #spine>商店</template>
          <div class="official-section__front">官方商店</div>
        </VideoTapeItem>
        <VideoTapeItem :index="1" spine-color="#4a3651">
          <template #spine>周边</template>
          <div class="official-section__front">周边专区</div>
        </VideoTapeItem>
        <VideoTapeItem :index="2" spine-color="#2d4a3f">
          <template #spine>社区</template>
          <div class="official-section__front">官方社区</div>
        </VideoTapeItem>
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

.official-section__front {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
}
</style>
