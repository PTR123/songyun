import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'mobile',
    component: () => import('@/screens/MobileScreen.vue'),
    meta: { title: '宋韵照片生成' }
  },
  {
    path: '/display',
    name: 'display',
    component: () => import('@/screens/DisplayScreen.vue'),
    meta: { title: '宋韵照片展示' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, _from, next) => {
  document.title = to.meta.title as string || '宋韵照片生成'
  next()
})

export default router