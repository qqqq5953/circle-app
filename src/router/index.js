import { createRouter, createWebHashHistory } from 'vue-router'
import { storeToRefs } from 'pinia'
import useApiStore from '@/stores/apiStore.js'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/admin/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    children: [
      {
        path: 'portfolio',
        name: 'Portfolio',
        component: () => import('../views/Portfolio.vue')
      },
      {
        path: 'holdings',
        name: 'Holdings',
        component: () => import('../views/Holdings.vue')
      },
      {
        path: 'holdings1',
        name: 'Holdings1',
        component: () => import('../views/Holdings1.vue')
      },
      {
        path: 'history',
        name: 'History',
        component: () => import('../views/History.vue')
      },
      {
        path: 'watchlist',
        name: 'Watchlist',
        component: () => import('../views/Watchlist.vue')
      },
      {
        path: 'stockInfo/:ticker',
        name: 'StockInfo',
        component: () => import('../views/StockInfo.vue'),
        props: true
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/admin/dashboard'
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  linkActiveClass: 'text-pink-500',
  scrollBehavior(to, from, savedPosition) {
    return { top: 0, behavior: 'smooth' }
  },
  routes
})

router.beforeEach((to, from) => {
  const $store = useApiStore()
  const { axiosControllerQueue } = storeToRefs($store)

  for (let i = 0; i < axiosControllerQueue.value.length; i++) {
    const controller = axiosControllerQueue.value[i]
    controller.abort()
  }

  axiosControllerQueue.value.length = 0
  return true
})

export default router
