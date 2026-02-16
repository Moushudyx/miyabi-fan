<script setup lang="ts">
import { computed, inject, onBeforeUnmount, onMounted, ref } from 'vue'
import type { FanWork } from '../data/fanWorks'

type Props = {
  index: number
  work: FanWork
  thumbColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  thumbColor: undefined,
})

const activeIndex = inject('fanWorksActiveIndex') as { value: number }
const activateByInteraction = inject('fanWorksActivateByInteraction') as (
  index: number,
  mode: 'hover' | 'click'
) => void

const isActive = computed(() => activeIndex?.value === props.index)
const extraLinks = computed(() => props.work.extraLinks ?? [])
const hasExtraLinks = computed(() => extraLinks.value.length > 0)
const resolvedThumbColor = computed(
  () => props.thumbColor ?? props.work.thumbColor ?? '#2b3150'
)

const isSmallScreen = ref(false)
const checkScreenSize = () => {
  isSmallScreen.value = window.innerWidth <= 840
}

onMounted(() => {
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkScreenSize)
})

/**
 * 鼠标划过时展开当前作品
 */
const handleHover = () => {
  activateByInteraction?.(props.index, 'hover')
}

/**
 * 点击时展开当前作品（移动端优先）
 */
const handleClick = () => {
  activateByInteraction?.(props.index, 'click')
}

/**
 * 键盘操作时展开当前作品
 */
const handleKeyToggle = () => {
  activateByInteraction?.(props.index, 'click')
}

const openUrl = (url?: string) => {
  if (!url || typeof window === 'undefined') return
  window.open(url, '_blank', 'noopener,noreferrer')
}

const openWork = () => {
  openUrl(props.work.url)
}
</script>

<template>
  <div
    class="fan-work-item"
    :class="{ 'is-active': isActive }"
    @mouseenter="handleHover"
    @focusin="handleHover"
    @click="handleClick"
    @keydown.enter.prevent="handleKeyToggle"
    @keydown.space.prevent="handleKeyToggle"
    role="button"
    tabindex="0"
  >
    <div class="fan-work-item__thumb" :style="{ background: resolvedThumbColor }">
      <slot name="thumb" :work="props.work">
        <div v-if="props.work.thumbUrl || props.work.type === 'image'" class="fan-work-item__thumb-media">
          <!-- 收起来时展示的是比较窄的缩略图, 所以优先使用移动端的图片 -->
          <img
            :src="props.work.thumbUrl || props.work.mediaUrlMobile || props.work.mediaUrl"
            :alt="props.work.title"
          />
        </div>
        <div v-else class="fan-work-item__thumb-placeholder">
          <span>{{ props.work.title }}</span>
        </div>
      </slot>
    </div>
    <div class="fan-work-item__media" :aria-hidden="!isActive">
      <template v-if="isActive">
        <slot
          name="media-mobile"
          v-if="isSmallScreen && (props.work.mediaUrlMobile || $slots['media-mobile'])"
          :work="props.work"
          :open="openUrl"
        >
          <div class="fan-work-item__media-content">
            <div
              v-if="props.work.type === 'image'"
              class="fan-work-item__image"
              @click="openWork"
              @keydown.enter.prevent="openWork"
              @keydown.space.prevent="openWork"
              role="button"
              tabindex="0"
              :aria-label="`打开作品 ${props.work.title}`"
            >
              <img :src="props.work.mediaUrlMobile" :alt="props.work.title" />
            </div>
            <div
              v-else-if="props.work.type === 'video'"
              class="fan-work-item__video"
              @click="openWork"
              @keydown.enter.prevent="openWork"
              @keydown.space.prevent="openWork"
              role="button"
              tabindex="0"
              :aria-label="`打开作品 ${props.work.title}`"
            >
              <video autoplay muted loop playsinline>
                <source :src="props.work.mediaUrlMobile" />
                <!-- 回退到 thumbnail -->
                <img v-if="props.work.thumbUrl" :src="props.work.thumbUrl" :alt="props.work.title" />
                <span v-else>无法播放视频，请点击查看原链接</span>
              </video>
            </div>
          </div>
        </slot>
        <slot v-else name="media" :work="props.work" :open="openUrl">
          <div class="fan-work-item__media-content">
            <div
              v-if="props.work.type === 'image'"
              class="fan-work-item__image"
              @click="openWork"
              @keydown.enter.prevent="openWork"
              @keydown.space.prevent="openWork"
              role="button"
              tabindex="0"
              :aria-label="`打开作品 ${props.work.title}`"
            >
              <img :src="props.work.mediaUrl" :alt="props.work.title" />
            </div>
            <div
              v-else-if="props.work.type === 'video'"
              class="fan-work-item__video"
              @click="openWork"
              @keydown.enter.prevent="openWork"
              @keydown.space.prevent="openWork"
              role="button"
              tabindex="0"
              :aria-label="`打开作品 ${props.work.title}`"
            >
              <video autoplay muted loop playsinline>
                <source :src="props.work.mediaUrl" />
                <!-- 回退到 thumbnail -->
                <img v-if="props.work.thumbUrl" :src="props.work.thumbUrl" :alt="props.work.title" />
                <span v-else>无法播放视频，请点击查看原链接</span>
              </video>
            </div>
          </div>
        </slot>
      </template>
    </div>
    <div class="fan-work-item__info" :style="{ opacity: isActive ? 1 : 0 }">
      <slot name="info" :work="props.work" :open="openUrl">
        <div class="fan-work-item__info-body">
          <strong>{{ props.work.title }}</strong>
          <span>作者 · {{ props.work.author }}</span>
          <span v-if="hasExtraLinks">
            <template v-for="(link, linkIndex) in extraLinks" :key="linkIndex">
              <a
                class="fan-work-item__extra-link"
                :href="link.url"
                target="_blank"
                rel="noopener noreferrer"
                @click.stop
                @keydown.enter.prevent.stop="($event.currentTarget as HTMLElement).click()"
                @keydown.space.prevent.stop="($event.currentTarget as HTMLElement).click()"
              >
                {{ link.label }}
              </a>
              <span v-if="linkIndex < extraLinks.length - 1">, </span>
            </template>
          </span>
        </div>
      </slot>
    </div>
  </div>
</template>

<style lang="scss">
.fan-work-item {
  position: relative;
  flex: 1;
  min-width: 96px;
  border-radius: 8px;
  overflow: hidden;
  background: var(--surface-3);
  transition:
    flex 400ms ease,
    box-shadow 400ms ease,
    height 400ms ease;
  cursor: pointer;
}

.fan-work-item.is-active {
  flex: 3.4;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.45);
}

.fan-work-item__thumb,
.fan-work-item__media {
  position: absolute;
  inset: 0;
}

.fan-work-item__thumb {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.fan-work-item__thumb-media,
.fan-work-item__thumb-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fan-work-item__thumb-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.fan-work-item__media {
  opacity: 0;
  transition: opacity 240ms ease;
}

.fan-work-item.is-active .fan-work-item__media {
  opacity: 1;
  transition: opacity 120ms ease;
}

.fan-work-item__media-content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  background: rgba(0, 0, 0, 0.2);
}

.fan-work-item__image,
.fan-work-item__video {
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fan-work-item__image img,
.fan-work-item__video video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.fan-work-item__info {
  position: absolute;
  left: 16px;
  bottom: 16px;
  padding: 10px 14px;
  border-radius: 12px;
  background: rgba(6, 12, 14, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(8px);
  // opacity: 0;
  transition: opacity 240ms ease;
}

.fan-work-item__info-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
}

.fan-work-item__info-body span {
  opacity: 0.7;
}

.fan-work-item__extra-link {
  color: inherit;
  text-decoration: underline;
}

.fan-works-gallery--column .fan-work-item {
  flex: none;
  height: 140px;
}

.fan-works-gallery--column .fan-work-item.is-active {
  height: 280px;
}

@media (max-width: 840px) {
  .fan-work-item {
    min-height: 96px;
    height: 120px;
    flex: none;
  }

  .fan-work-item.is-active {
    height: 260px;
  }

  .fan-work-item__info {
    left: auto;
    right: 12px;
    top: 12px;
    bottom: auto;
  }
}
</style>
