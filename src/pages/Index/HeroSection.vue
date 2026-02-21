<!-- 首页顶部(第一屏) -->
<template>
  <div class="hero-section">
    <div class="hero-section__copy" data-reveal data-delay="1">
      <p class="hero-section__eyebrow">Zenless Zone Zero · 星见雅</p>
      <h1 class="hero-section__title">夜色、风刃与绯光</h1>
      <p class="hero-section__subtitle">这里是星见雅的粉丝站</p>
      <div class="hero-section__cta">
        <button class="hero-section__button">了解角色</button>
        <button class="hero-section__button hero-section__button--ghost">同人作品</button>
      </div>
    </div>
    <div class="hero-section__art" data-reveal data-delay="2">
      <div class="hero-section__art-block">
        <span>动态立绘占位</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.hero-section {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 32px;
  align-items: center;
}

.hero-section__copy {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.hero-section__eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 12px;
  opacity: 0.6;
  margin: 0;
}

.hero-section__title {
  font-size: clamp(32px, 4vw, 54px);
  margin: 0;
  font-family: 'ZCOOL XiaoWei', serif;
}

.hero-section__subtitle {
  margin: 0;
  color: rgba(242, 242, 242, 0.78);
}

.hero-section__cta {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.hero-section__button {
  padding: 10px 20px;
  border-radius: 999px;
  border: none;
  background: linear-gradient(120deg, var(--primary-1), var(--accent-gold));
  color: #071214;
  font-weight: 700;
  cursor: pointer;
}

.hero-section__button--ghost {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: var(--text-1);
}

.hero-section__art {
  display: flex;
  justify-content: center;
}

.hero-section__art-block {
  width: min(420px, 80vw);
  aspect-ratio: 3 / 4;
  border-radius: 28px;
  background: linear-gradient(160deg, rgba(87, 171, 168, 0.3), rgba(10, 18, 22, 0.9));
  border: 1px solid rgba(255, 255, 255, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 600;
}

@media (max-width: 900px) {
  .hero-section {
    grid-template-columns: 1fr;
  }

  .hero-section__art {
    order: -1;
  }
}
</style>
