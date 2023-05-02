import { createRouter, createWebHashHistory } from 'vue-router'
import { storeToRefs } from 'pinia'
import http from '@/api'
import useApiStore from '@/stores/apiStore.js'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    redirect: { name: 'Intro' },
    children: [
      {
        path: '',
        name: 'Intro',
        component: () => import('../views/Intro.vue')
      },
      {
        path: 'about',
        name: 'About',
        component: () => import('../views/About.vue')
      },
      {
        path: 'solution',
        name: 'Solution',
        component: () => import('../views/Solution.vue')
      }
    ]
  },
  {
    path: '/admin/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    redirect: { name: 'Overview' },
    children: [
      {
        path: 'init',
        name: 'Init',
        component: () => import('../views/Init.vue')
      },
      {
        path: 'overview',
        name: 'Overview',
        component: () => import('../views/Overview.vue')
      },
      {
        path: 'holdings',
        name: 'Holdings',
        component: () => import('../views/Holdings.vue')
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
        path: 'tradeDetails',
        name: 'TradeDetails',
        component: () => import('../views/TradeDetails.vue')
      },
      {
        path: 'tradeResult',
        name: 'TradeResult',
        component: () => import('../views/TradeResult.vue'),
        props: (route) => {
          return {
            tradeResult: JSON.parse(route.params.tradeResult)
          }
        }
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
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  linkActiveClass: 'font-semibold text-indigo-600',
  scrollBehavior(to, from, savedPosition) {
    return { top: 0, behavior: 'smooth' }
  },
  routes
})

router.beforeEach(async (to, from, next) => {
  const $store = useApiStore()
  const { axiosControllerQueue } = storeToRefs($store)

  for (let i = 0; i < axiosControllerQueue.value.length; i++) {
    const controller = axiosControllerQueue.value[i]
    controller.abort()
  }

  axiosControllerQueue.value.length = 0

  await checkDashboardAuth(to, next)
  next()
})

async function checkDashboardAuth(to, next) {
  if (to.fullPath.includes('dashboard')) {
    const hasLogin = await checkAuth()
    if (!hasLogin) router.replace({ name: 'Intro' })
  }
}

async function checkAuth() {
  const res = await http.post('/api/checkAuth')
  return res.data.result.hasLogin
}

export default router
