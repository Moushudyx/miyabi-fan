<script setup lang="ts">
import FanWorkItem from '../../components/FanWorkItem.vue'
import FanWorksGallery from '../../components/FanWorksGallery.vue'
import { useFanWorks } from '../../data/fanWorks'

const fanWorks = useFanWorks()

const openUrl = (url: string) => {
  window.open(url, '_blank')
}
</script>

<template>
  <div class="fan-works-section">
    <header class="fan-works-section__header" data-reveal data-delay="1">
      <p class="fan-works-section__eyebrow">Fan Works</p>
      <h2>同人作品推荐</h2>
    </header>
    <div data-reveal data-delay="2">
      <FanWorksGallery :default-active="0">
        <FanWorkItem v-for="(work, index) in fanWorks" :key="index" :index="index" :thumb-color="work.thumbColor">
          <template #thumb>
            <div v-if="work.thumbUrl || work.type === 'image'" class="fan-works-section__thumb">
              <!-- 收起来时展示的是比较窄的缩略图, 所以优先使用移动端的图片 -->
              <img :src="work.thumbUrl || work.mediaUrlMobile || work.mediaUrl" :alt="work.title" />
            </div>
            <div v-else class="fan-works-section__thumb-placeholder">
              <span>{{ work.title }}</span>
            </div>
          </template>
          <div class="fan-works-section__media">
            <div
              v-if="work.type === 'image'"
              class="fan-works-section__image"
              @click="() => work.url && openUrl(work.url)"
              @keydown.enter.prevent="() => work.url && openUrl(work.url)"
              @keydown.space.prevent="() => work.url && openUrl(work.url)"
              role="button"
              tabindex="0"
              :aria-label="`打开作品 ${work.title}`"
            >
              <img :src="work.mediaUrl" :alt="work.title" />
            </div>
            <div
              v-else-if="work.type === 'video'"
              class="fan-works-section__video"
              @click="() => work.url && openUrl(work.url)"
              @keydown.enter.prevent="() => work.url && openUrl(work.url)"
              @keydown.space.prevent="() => work.url && openUrl(work.url)"
              role="button"
              tabindex="0"
              :aria-label="`打开作品 ${work.title}`"
            >
              <video autoplay muted loop playsinline>
                <source :src="work.mediaUrl" />
                <!-- 回退到 thumbnail -->
                <img v-if="work.thumbUrl" :src="work.thumbUrl" :alt="work.title" />
                <span v-else>无法播放视频，请点击查看原链接</span>
              </video>
            </div>
          </div>
          <template #media-mobile v-if="work.mediaUrlMobile">
            <div
              v-if="work.type === 'image'"
              class="fan-works-section__image"
              @click="() => work.url && openUrl(work.url)"
              @keydown.enter.prevent="() => work.url && openUrl(work.url)"
              @keydown.space.prevent="() => work.url && openUrl(work.url)"
              role="button"
              tabindex="0"
              :aria-label="`打开作品 ${work.title}`"
            >
              <img :src="work.mediaUrlMobile" :alt="work.title" />
            </div>
            <div
              v-else-if="work.type === 'video'"
              class="fan-works-section__video"
              @click="() => work.url && openUrl(work.url)"
              @keydown.enter.prevent="() => work.url && openUrl(work.url)"
              @keydown.space.prevent="() => work.url && openUrl(work.url)"
              role="button"
              tabindex="0"
              :aria-label="`打开作品 ${work.title}`"
            >
              <video autoplay muted loop playsinline>
                <source :src="work.mediaUrlMobile" />
                <!-- 回退到 thumbnail -->
                <img v-if="work.thumbUrl" :src="work.thumbUrl" :alt="work.title" />
                <span v-else>无法播放视频，请点击查看原链接</span>
              </video>
            </div>
          </template>
          <template #info>
            <div class="fan-works-section__info">
              <strong>{{ work.title }}</strong>
              <span>作者 · {{ work.author }}</span>
              <span
                v-if="work.extraLinks && work.extraLinks.length > 0"
                v-for="(link, linkIndex) in work.extraLinks"
                :key="linkIndex"
              >
                <a
                  class="fan-works-section__extra-link"
                  :href="link.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  @click.stop
                  @keydown.enter.prevent.stop="($event.currentTarget as HTMLElement).click()"
                  @keydown.space.prevent.stop="($event.currentTarget as HTMLElement).click()"
                >
                  {{ link.label }}
                </a>
                <span v-if="linkIndex < work.extraLinks.length - 1">, </span>
              </span>
            </div>
          </template>
        </FanWorkItem>
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

.fan-works-section__media {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  background: rgba(0, 0, 0, 0.2);
}

.fan-works-section__image,
.fan-works-section__video {
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fan-works-section__image img,
.fan-works-section__video video {
  width: 100%;
  height: 100%;
  object-fit: cover;
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

.fan-works-section__extra-link {
  color: inherit;
  text-decoration: underline;
}
</style>
