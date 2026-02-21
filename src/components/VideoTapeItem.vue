<!-- 组件 以录像带风格排布新闻/文章项, 包括抽出和收回动画, 需搭配 VideoTapeRack 使用 -->
<script setup lang="ts">
import { computed, inject, nextTick, ref, watch } from 'vue'
import type { OfficialInfo } from '../data/officialInfos'
import { _, clamp, curry, debounce, sleep } from 'foreslash'

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

const containerRef = ref<HTMLElement | null>(null)
const shadowRef = ref<HTMLElement | null>(null)
const isExpanded = ref(false)
const isClosing = ref(false)
const offsetX = ref(0)
const offsetY = ref(0)

const isActive = computed(() => activeIndex?.value === props.index)
const isFloating = computed(() => isExpanded.value || isClosing.value)
const showFront = computed(() => isExpanded.value || isClosing.value)
const showMeta = computed(() => isExpanded.value)
const resolvedSpineColor = computed(() => props.spineColor ?? props.info.baseColor ?? '#333')
const showDescription = computed(() => Boolean(props.info.description && props.info.description.trim().length > 0))
// @ts-ignore
const clampHorizontalShift = curry(clamp)(_, 0, 100, { default: 50 })
// console.log('clampHorizontalShift(120)', clampHorizontalShift(120))
const coverMediaObjectPosition = computed(() => `${clampHorizontalShift(props.info.coverMediaHorizontalShift || 50)}% 50%`)
const spineMediaObjectPosition = computed(() => `${clampHorizontalShift(props.info.spineMediaHorizontalShift || 50)}% 50%`)

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
const setOffsetFromRect = () => {
  if (!containerRef.value) return
  if (!shadowRef.value) return

  const containerRect = containerRef.value.getBoundingClientRect()
  const shadowRect = shadowRef.value.getBoundingClientRect()
  offsetX.value = shadowRect.left - containerRect.left
  offsetY.value = shadowRect.top - containerRect.top
}

/**
 * 抽出录像带，先记录位置，再过渡到屏幕中央
 */
const openTape = async () => {
  setOffsetFromRect()
  isExpanded.value = true
  isClosing.value = false
  await sleep(0)
  offsetX.value = 0
  offsetY.value = 0
}

/**
 * 放回录像带，回到记录的原位，再结束状态
 */
const closeTape = async () => {
  isClosing.value = true
  offsetX.value = 0
  offsetY.value = 0
  await sleep(0)
  setOffsetFromRect()
  await sleep(520)
  if (isClosing.value && activeIndex?.value !== props.index) {
    isClosing.value = false
    isExpanded.value = false
  }
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
  if (event.target !== containerRef.value) return
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

onMounted(() => {
  const calcRect = debounce(() => {
    if (activeIndex?.value !== props.index) {
      setOffsetFromRect()
    }
  }, 240, { leading: true, trailing: true })
  calcRect()
  window.addEventListener('resize', calcRect)
  window.addEventListener('scroll', calcRect, { passive: true, capture: true })
  return () => {
    window.removeEventListener('resize', calcRect)
    window.removeEventListener('scroll', calcRect)
  }
})

</script>

<template>
  <div ref="containerRef" class="video-tape-item-wrapper" :style="{ '--spine-color': resolvedSpineColor }">
    <article
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
        <div class="video-tape-item__face video-tape-item__face--front" v-if="showFront">
          <div class="video-tape-item__front-content">
            <slot name="cover" :info="props.info" :open="openUrl">
              <slot :info="props.info" :open="openUrl">
                <div
                  class="video-tape-item__media"
                  @click.stop="openInfo"
                  @keydown.enter.prevent.stop="openInfo"
                  @keydown.space.prevent.stop="openInfo"
                  role="button"
                  tabindex="0"
                  :aria-label="`打开 ${props.info.title}`"
                >
                  <img
                    v-if="props.info.coverMediaType !== 'video'"
                    referrerpolicy="no-referrer"
                    :src="props.info.coverMediaUrl"
                    :alt="props.info.title"
                    :style="{ objectPosition: coverMediaObjectPosition }"
                  />
                  <video
                    v-else-if="props.info.coverMediaType === 'video'"
                    autoplay
                    muted
                    loop
                    playsinline
                    :style="{ objectPosition: coverMediaObjectPosition }"
                  >
                    <source :src="props.info.coverMediaUrl" />
                  </video>
                </div>
              </slot>
            </slot>
          </div>
        </div>
        <div class="video-tape-item__face video-tape-item__face--left">
          <div class="video-tape-item__spine">
            <slot name="spine" :info="props.info" :open="openUrl">
              <div class="video-tape-item__spine-media">
                <img
                  v-if="props.info.spineMediaType !== 'video'"
                  referrerpolicy="no-referrer"
                  :src="props.info.spineMediaUrl"
                  :alt="props.info.title"
                  :style="{ objectPosition: spineMediaObjectPosition }"
                />
                <video
                  v-else-if="props.info.spineMediaType === 'video'"
                  autoplay
                  muted
                  loop
                  playsinline
                  :style="{ objectPosition: spineMediaObjectPosition }"
                >
                  <source :src="props.info.spineMediaUrl" />
                </video>
              </div>
            </slot>
            <!-- 渲染阴影 因为 box-shadow 对 img 等不生效 -->
            <div class="video-tape-item__spine-shadow"></div>
          </div>
        </div>
        <!-- 不渲染这几个节省性能 -->
        <div class="video-tape-item__face video-tape-item__face--back" v-lazy-if="showFront"></div>
        <div class="video-tape-item__face video-tape-item__face--right" v-lazy-if="showFront"></div>
        <div class="video-tape-item__face video-tape-item__face--top" v-lazy-if="showFront"></div>
        <div class="video-tape-item__face video-tape-item__face--bottom" v-lazy-if="showFront"></div>
      </div>
      <!-- <div class="video-tape-item__gloss"></div> -->
      <div
        v-show="showMeta"
        class="video-tape-item__meta"
        :style="{ opacity: isActive ? 1 : 0, pointerEvents: isActive ? 'auto' : 'none' }"
      >
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
    <div ref="shadowRef" class="video-tape-item__shadow"></div>
  </div>
</template>

<style lang="scss">
$origin-tape-width: 160px;
$origin-tape-height: 240px;
$origin-tape-depth: 32px;

@property --tape-width {
  syntax: '<length>';
  inherits: true;
  initial-value: $origin-tape-width;
}

@property --tape-height {
  syntax: '<length>';
  inherits: true;
  initial-value: $origin-tape-height;
}

@property --tape-depth {
  syntax: '<length>';
  inherits: true;
  initial-value: $origin-tape-depth;
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
  --tape-width: #{$origin-tape-width};
  --tape-height: #{$origin-tape-height};
  --tape-depth: #{$origin-tape-depth};
  display: flex;
  width: var(--tape-depth);
  height: var(--tape-height);
  flex-direction: column;
  align-items: center;
  width: var(--tape-depth);
}
.video-tape-item__shadow {
  position: fixed;
  top: 50%;
  left: 50%;
  width: $origin-tape-depth;
  height: $origin-tape-height;
  perspective: 900px;
  transform-style: preserve-3d;
  pointer-events: none;
  opacity: 0;
}
.video-tape-item {
  position: fixed;
  top: 50%;
  left: 50%;
  width: var(--tape-depth);
  height: var(--tape-height);
  flex: 0 0 auto;
  perspective: 900px;
  transform-style: preserve-3d;
  transform: translate(calc(0px - var(--offset-x, 0px)), calc(0px - var(--offset-y, 0px))); // - var(--header-height, 0px)
  cursor: pointer;
  transition:
    all 520ms ease,
    transform 520ms ease,
    box-shadow 520ms ease,
    width 520ms ease,
    height 520ms ease,
    --offset-x 520ms ease,
    --offset-y 520ms ease,
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
  transform: rotateY(90deg) translateZ(calc(var(--tape-width) - var(--tape-depth) / 2));
  background: rgba(4, 9, 12, 0.92);
}

.video-tape-item__face--top,
.video-tape-item__face--bottom {
  width: var(--tape-width);
  height: var(--tape-depth);
  border-radius: 2px;
}

.video-tape-item__face--top {
  transform: rotateX(90deg) translateZ(calc(var(--tape-depth) / 2));
  background: rgba(8, 14, 18, 0.92);
}

.video-tape-item__face--bottom {
  transform: rotateX(-90deg) translateZ(calc(var(--tape-height) - var(--tape-depth) / 2));
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
  background-color: var(--spine-color);
}

.video-tape-item__spine-shadow {
  position: absolute;
  inset: 0;
  border-radius: 2px;
  box-shadow:
    inset -10px 0 14px rgba(0, 0, 0, 0.65),
    inset 0 0 0 1px rgba(255, 255, 255, 0.08);
  pointer-events: none;
  opacity: 1;
  // mix-blend-mode: screen;
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
  --tape-width: #{$origin-tape-width * 2};
  --tape-height: #{$origin-tape-height * 2};
  --tape-depth: #{$origin-tape-depth * 2};
  transform: translate(calc(0px - var(--tape-width) / 2), calc(0px - var(--tape-height) / 2 - var(--header-height, 0px) / 2));
  z-index: 60;
  /* box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6); */
  &.is-closing {
    width: var(--tape-depth);
    transform: translate(calc(0px - var(--offset-x, 0px)), calc(0px - var(--offset-y, 0px)));
    --tape-width: #{$origin-tape-width};
    --tape-height: #{$origin-tape-height};
    --tape-depth: #{$origin-tape-depth};
  }
}

.video-tape-item.is-closing .video-tape-item__body {
  transform: rotateY(90deg);
}

@media (max-width: 720px) {
  .video-tape-item.is-floating {
    --tape-width: #{$origin-tape-width * 1.5};
    --tape-height: #{$origin-tape-height * 1.5};
    --tape-depth: #{$origin-tape-depth * 1.5};
  }
}
</style>
