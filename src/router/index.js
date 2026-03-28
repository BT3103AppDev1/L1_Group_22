import ContractorHome from '@/views/ContractorHome.vue'
import HomeownerHome from '@/views/HomeownerHome.vue'

import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
  {
    path: '/',
    name: 'login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/signup',
    name: 'signup',
    component: () => import('../views/Signup.vue')
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('../views/Dashboard.vue')
  },
  {
    path: '/contractor/home',
    name: 'Contractor Home',
    component: () => import('../views/ContractorHome.vue')
  },
  {
    path: "/contractor/profile",
    name: "Contractor Profile",
    component: () => import("../views/ContractorProfile.vue")
  },
  {
    path: '/homeowner/home',
    name: 'Homeowner Home',
    component: HomeownerHome,
  },
  {
    path: "/homeowner/profile",
    name: "Homeowner Profile",
    component: () => import("../views/HomeownerProfile.vue")
  },
]
})

export default router