import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
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
  routes
})

export default router
