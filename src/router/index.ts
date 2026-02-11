import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
import Index from '../pages/Index.vue'
import About from '../pages/About.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'index',
    component: Index,
  },
  {
    path: '/about',
    name: 'about',
    component: About,
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
