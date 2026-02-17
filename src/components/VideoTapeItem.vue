<!-- 组件 以录像带风格排布新闻/文章项, 包括抽出和收回动画, 需搭配 VideoTapeRack 使用 -->
<script setup lang="ts">
import { computed, inject, nextTick, ref, watch } from 'vue'
import type { OfficialInfo } from '../data/officalInfos'

type Props = {
  index: number
  info: OfficialInfo
  spineColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  spineColor: undefined,
})

const activeIndex = inject('videoTapeActiveIndex') as { value: number }
const toggleActive = inject('videoTapeToggleActive') as (index: number) => void

const itemRef = ref<HTMLElement | null>(null)
const isExpanded = ref(false)
const isClosing = ref(false)
const offsetX = ref(0)
const offsetY = ref(0)
const originRect = ref<DOMRect | null>(null)

const isActive = computed(() => activeIndex?.value === props.index)
const isFloating = computed(() => isExpanded.value || isClosing.value)
const showFront = computed(() => isExpanded.value || isClosing.value)
const showMeta = computed(() => isExpanded.value)
const resolvedSpineColor = computed(() => props.spineColor ?? props.info.baseColor ?? '#333')
const showDescription = computed(() => Boolean(props.info.description && props.info.description.trim().length > 0))

const openUrl = (url?: string) => {
  if (!url || typeof window === 'undefined') return
  window.open(url, '_blank', 'noopener,noreferrer')
}

const openInfo = () => {
  openUrl(props.info.url)
}

/**
 * 根据原位置计算抽出/放回的位移量
 */
const setOffsetFromRect = (rect: DOMRect) => {
  const centerX = window.innerWidth / 2
  const centerY = window.innerHeight / 2
  offsetX.value = rect.left + rect.width / 2 - centerX
  offsetY.value = rect.top + rect.height / 2 - centerY
}

/**
 * 抽出录像带，先记录位置，再过渡到屏幕中央
 */
const openTape = async () => {
  if (!itemRef.value) return
  originRect.value = itemRef.value.getBoundingClientRect()
  setOffsetFromRect(originRect.value)
  isExpanded.value = true
  isClosing.value = false
  await nextTick()
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      offsetX.value = 0
      offsetY.value = 0
    })
  })
}

/**
 * 放回录像带，回到记录的原位，再结束状态
 */
const closeTape = () => {
  if (!originRect.value) {
    isExpanded.value = false
    isClosing.value = false
    return
  }
  isClosing.value = true
  offsetX.value = 0
  offsetY.value = 0
  requestAnimationFrame(() => {
    if (!originRect.value) return
    requestAnimationFrame(() => {
      if (originRect.value) {
        setOffsetFromRect(originRect.value)
      }
    })
  })
}

/**
 * 点击抽出或收回录像带
 */
const handleToggle = () => {
  toggleActive?.(props.index)
}

/**
 * 键盘触发抽出或收回录像带
 */
const handleKeyToggle = () => {
  toggleActive?.(props.index)
}

/**
 * 动画完成后结束收回状态
 */
const handleTransitionEnd = (event: TransitionEvent) => {
  if (event.propertyName !== 'transform') return
  if (event.target !== itemRef.value) return
  if (isClosing.value) {
    isClosing.value = false
    isExpanded.value = false
  }
}

watch(
  () => activeIndex?.value,
  (value, previous) => {
    if (value === props.index) {
      openTape()
    } else if (previous === props.index) {
      closeTape()
    }
  },
  { immediate: true }
)
</script>

<template>
  <div class="video-tape-item-wrapper" :style="{ '--spine-color': resolvedSpineColor }">
    <article
      ref="itemRef"
      class="video-tape-item"
      :class="{ 'is-active': isActive, 'is-open': isExpanded, 'is-floating': isFloating, 'is-closing': isClosing }"
      :style="{ '--offset-x': `${offsetX}px`, '--offset-y': `${offsetY}px` }"
      role="button"
      tabindex="0"
      @click="handleToggle"
      @keydown.enter.prevent="handleKeyToggle"
      @keydown.space.prevent="handleKeyToggle"
      @transitionend="handleTransitionEnd"
    >
      <div class="video-tape-item__body">
        <div class="video-tape-item__face video-tape-item__face--front">
          <div class="video-tape-item__front-content" v-if="showFront">
            <slot name="cover" :info="props.info" :open="openUrl">
              <slot :info="props.info" :open="openUrl">
                <div class="video-tape-item__media" @click.stop="openInfo" @keydown.enter.prevent.stop="openInfo" @keydown.space.prevent.stop="openInfo" role="button" tabindex="0" :aria-label="`打开 ${props.info.title}`">
                  <img
                    v-if="props.info.coverMediaType !== 'video'"
                    :src="props.info.coverMediaUrl"
                    :alt="props.info.title"
                    referrerpolicy="no-referrer"
                  />
                  <video v-else autoplay muted loop playsinline>
                    <source :src="props.info.coverMediaUrl" />
                  </video>
                </div>
              </slot>
            </slot>
          </div>
        </div>
        <!-- 不渲染这几个节省性能 -->
        <!-- <div class="video-tape-item__face video-tape-item__face--back"></div> -->
        <div class="video-tape-item__face video-tape-item__face--left">
          <div class="video-tape-item__spine">
            <slot name="spine" :info="props.info" :open="openUrl">
              <div class="video-tape-item__spine-media">
                <img
                  v-if="props.info.spineMediaType !== 'video'"
                  :src="props.info.spineMediaUrl"
                  :alt="props.info.title"
                  referrerpolicy="no-referrer"
                />
                <video v-else autoplay muted loop playsinline>
                  <source :src="props.info.spineMediaUrl" />
                </video>
              </div>
            </slot>
          </div>
        </div>
        <!-- <div class="video-tape-item__face video-tape-item__face--right"></div> -->
        <!-- <div class="video-tape-item__face video-tape-item__face--top"></div> -->
        <!-- <div class="video-tape-item__face video-tape-item__face--bottom"></div> -->
      </div>
      <!-- <div class="video-tape-item__gloss"></div> -->
      <div v-show="showMeta" class="video-tape-item__meta" :style="{ opacity: isActive ? 1 : 0, pointerEvents: isActive ? 'auto' : 'none' }">
        <slot name="meta" :info="props.info" :open="openUrl">
          <strong
            class="video-tape-item__title"
            @click="openInfo"
            @keydown.enter.prevent="openInfo"
            @keydown.space.prevent="openInfo"
            role="button"
            tabindex="0"
          >
            {{ props.info.title }}
          </strong>
          <p v-if="showDescription" class="video-tape-item__description">
            {{ props.info.description }}
          </p>
        </slot>
      </div>
    </article>
  </div>
</template>

<style lang="scss">
@property --tape-width {
  syntax: '<length>';
  inherits: true;
  initial-value: 66px;
}

@property --tape-height {
  syntax: '<length>';
  inherits: true;
  initial-value: 220px;
}

@property --tape-depth {
  syntax: '<length>';
  inherits: true;
  initial-value: 34px;
}

@property --offset-x {
  syntax: '<length>';
  inherits: true;
  initial-value: 0px;
}

@property --offset-y {
  syntax: '<length>';
  inherits: true;
  initial-value: 0px;
}

.video-tape-item-wrapper {
  --tape-width: 160px;
  --tape-height: 240px;
  --tape-depth: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: var(--tape-depth);
}

.video-tape-item {
  position: relative;
  width: var(--tape-depth);
  height: var(--tape-height);
  flex: 0 0 auto;
  perspective: 900px;
  transform-style: preserve-3d;
  cursor: pointer;
  transition:
    all 520ms ease,
    transform 520ms ease,
    box-shadow 520ms ease,
    width 520ms ease,
    height 520ms ease,
    --tape-width 520ms ease,
    --tape-height 520ms ease,
    --tape-depth 520ms ease;
}
.video-tape-item:not(.is-floating):not(.is-open):not(.is-closing) {
  transition: transform 0ms;
}


.video-tape-item__body {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transform-origin: center center;
  transform: rotateY(90deg);
  transition: transform 520ms ease;
}

.video-tape-item__face {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(6, 12, 14, 0.92);
  border-radius: 2px;
  backface-visibility: hidden;
}

.video-tape-item__face--front,
.video-tape-item__face--back {
  width: var(--tape-width);
  height: var(--tape-height);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.55);
}

.video-tape-item__face--front {
  transform: translateZ(calc(var(--tape-depth) / 2));
}

.video-tape-item__face--back {
  transform: rotateY(180deg) translateZ(calc(var(--tape-depth) / 2));
  background: rgba(4, 9, 12, 0.92);
}

.video-tape-item__face--left,
.video-tape-item__face--right {
  display: flex;
  justify-content: center;
  align-items: center;
  width: var(--tape-depth);
  height: var(--tape-height);
  text-align: center;
}

.video-tape-item__face--left {
  transform: rotateY(-90deg) translateZ(calc(var(--tape-depth) / 2));
}

.video-tape-item__face--right {
  transform: rotateY(90deg) translateZ(calc(var(--tape-depth) / 2));
  background: rgba(4, 9, 12, 0.92);
}

.video-tape-item__face--top,
.video-tape-item__face--bottom {
  width: var(--tape-width);
  height: var(--tape-depth);
  border-radius: 2px;
}

.video-tape-item__face--top {
  transform: rotateX(90deg) translateZ(calc(var(--tape-height) / 2));
  background: rgba(8, 14, 18, 0.92);
}

.video-tape-item__face--bottom {
  transform: rotateX(-90deg) translateZ(calc(var(--tape-height) / 2));
  background: rgba(4, 9, 12, 0.92);
}

.video-tape-item__front-content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-tape-item__media {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.video-tape-item__media img,
.video-tape-item__media video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-tape-item__spine-media {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.video-tape-item__spine-media img,
.video-tape-item__spine-media video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-tape-item__spine {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: #f2f2f2;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.08), rgba(0, 0, 0, 0.25));
  box-shadow:
    inset -10px 0 14px rgba(0, 0, 0, 0.45),
    inset 0 0 0 1px rgba(255, 255, 255, 0.08);
  background-color: var(--spine-color);
}

.video-tape-item__meta {
  position: absolute;
  top: calc(100% + 12px);
  left: 50%;
  transform: translateX(-50%);
  width: min(220px, 70vw);
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 6px;
  pointer-events: auto;
  transition: all 240ms ease;
}

.video-tape-item__title {
  font-size: 13px;
  letter-spacing: 0.04em;
}

.video-tape-item__description {
  margin: 0;
  font-size: 12px;
  opacity: 0.7;
}

.video-tape-item__gloss {
  position: absolute;
  inset: 0;
  border-radius: 3px;
  background: linear-gradient(120deg, rgba(87, 171, 168, 0.22), transparent 55%);
  pointer-events: none;
  opacity: 0.4;
  mix-blend-mode: screen;
}

.video-tape-item.is-open .video-tape-item__body {
  transform: rotateY(0deg);
}

.video-tape-item.is-floating {
  position: fixed;
  top: 50%;
  left: 50%;
  width: var(--tape-width);
  height: var(--tape-height);
  --tape-width: 320px;
  --tape-height: 480px;
  --tape-depth: 64px;
  transform: translate(calc(-50% + var(--offset-x, 0px)), calc(-50% + var(--offset-y, 0px)));
  z-index: 60;
  /* box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6); */
}


.video-tape-item.is-closing .video-tape-item__body {
  transform: rotateY(90deg);
  --tape-width: 160px;
  --tape-height: 240px;
  --tape-depth: 32px;
  transition:
    /* all 520ms ease, */
    transform 520ms ease,
    /* box-shadow 520ms ease, */
    /* width 520ms ease, */
    /* height 520ms ease, */
    --tape-width 520ms ease,
    --tape-height 520ms ease,
    --tape-depth 520ms ease;
}

@media (max-width: 720px) {
  .video-tape-item.is-floating {
    --tape-width: 240px;
    --tape-height: 360px;
    --tape-depth: 48px;
  }
}
</style>
