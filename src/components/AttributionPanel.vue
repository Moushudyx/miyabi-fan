<template>
  <div class="attribution-panel" aria-label="借物表 Credits">
    <div class="attribution-panel__title">借物表 Credits</div>
    <div class="attribution-panel__content">
      <slot>
        <p>
          开源软件: <a href="https://nuxt.com/" target="_blank" rel="noreferrer">Nuxt</a>,
          <a href="https://threejs.org/" target="_blank" rel="noreferrer">Three.js</a>,
          <a href="https://vuejs.org/" target="_blank" rel="noreferrer">Vue</a>,
          <a href="https://sass-lang.com/" target="_blank" rel="noreferrer">SCSS</a>,
          <a href="https://animejs.com/" target="_blank" rel="noreferrer">Animejs</a>,
          <a href="https://github.com/kripken/ammo.js/" target="_blank" rel="noreferrer">ammo.js</a>,
          <a href="https://github.com/moushudyx/foreslash" target="_blank" rel="noreferrer">foreslash</a>
        </p>
        <p>
          开发工具: <a href="https://nodejs.org/" target="_blank" rel="noreferrer">NodeJS</a>,
          <a href="https://pnpm.io/" target="_blank" rel="noreferrer">Pnpm</a>,
          <a href="https://code.visualstudio.com/" target="_blank" rel="noreferrer">VSCode</a>,
          <a href="https://www.typescriptlang.org/" target="_blank" rel="noreferrer">Typescript</a>,
          <a href="https://copilot.github.com/" target="_blank" rel="noreferrer">Copilot</a>
        </p>
        <p>
          字体:&nbsp;
          <a href="https://github.com/djrrb/Bungee" target="_blank" rel="noreferrer"> Bungee </a>
          , 作者: djrrb
        </p>
        <p>
          字体:&nbsp;
          <a href="https://www.zcool.com.cn/assets/7285916537935119172.html" target="_blank" rel="noreferrer">
            站酷小薇LOGO体 </a
          >, 作者: 上海佐兹品牌设计工作室设计总监李大卫（David 小马哥）及其工作室团队
        </p>
        <p>字体:&nbsp;Montserrat, 作者: Julieta Ulanovsky (julieta.ulanovsky@gmail.com)</p>
        <!-- <p>（待补充开源项目与免费素材信息）</p> -->
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
  text-align: left;
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
