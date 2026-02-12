import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
import Index from '../pages/Index.vue'
import About from '../pages/About.vue'
import View3D from '../pages/View3D.vue'

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
  {
    path: '/view3d',
    name: 'view3d',
    component: View3D,
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
