<template>
  <div class="attribution-panel" aria-label="借物表">
    <div class="attribution-panel__title">借物表</div>
    <div class="attribution-panel__content">
      <slot>
        <p>（待补充开源项目与免费素材信息）</p>
      </slot>
    </div>
  </div>
</template>

<style lang="scss">
.attribution-panel {
  width: min(720px, 100%);
  padding: 12px 16px;
  border-radius: 16px;
  /* border: 1px solid rgba(255, 255, 255, 0.14); */
  background: rgba(10, 15, 24, 0.36);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
  font-size: 12px;
  line-height: 1.6;
  color: var(--text-2);
}

.attribution-panel__title {
  font-weight: 600;
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 6px;
  color: var(--text-3);
}

.attribution-panel__content p {
  margin: 0;
  opacity: 0.7;
}

.attribution-panel__content a {
  text-decoration: underline;
  text-underline-offset: 2px;
}
</style>
