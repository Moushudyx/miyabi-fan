<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="app-shell">
    <header class="site-header">
      <div class="site-header__logo">
        <span class="logo-mark">MIYABI</span>
        <span class="logo-sub">星见雅 Fan Site</span>
      </div>
      <nav class="site-header__nav" aria-label="主导航">
        <RouterLink to="/" class="nav-link">首页</RouterLink>
        <RouterLink to="/about" class="nav-link">关于</RouterLink>
      </nav>
    </header>
    <main class="site-main">
      <RouterView />
    </main>
  </div>
</template>

<style>
.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.site-header {
  position: fixed;
  inset: 0 0 auto 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: var(--header-height, 72px);
  padding: 16px 32px;
  background: rgba(6, 15, 18, 0.82);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.site-header__logo {
  display: flex;
  flex-direction: column;
  gap: 2px;
  color: var(--text-1);
}

.logo-mark {
  font-family: 'Bungee', 'Montserrat', sans-serif;
  letter-spacing: 0.14em;
  font-size: 18px;
}

.logo-sub {
  font-size: 12px;
  opacity: 0.7;
}

.site-header__nav {
  display: flex;
  gap: 20px;
  font-weight: 600;
}

.nav-link {
  color: var(--text-1);
  text-decoration: none;
  padding-bottom: 4px;
  border-bottom: 2px solid transparent;
  transition:
    border-color 200ms ease,
    opacity 200ms ease;
}

.nav-link.router-link-active {
  border-color: var(--primary-1);
}

.nav-link:hover {
  opacity: 0.7;
}

.site-main {
  flex: 1;
}

@media (max-width: 720px) {
  .site-header {
    padding: 12px 18px;
  }

  .logo-mark {
    font-size: 14px;
  }

  .site-header__nav {
    gap: 12px;
    font-size: 14px;
  }
}
</style>
