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
    component: () => import('../views/HomeownerHome.vue')
  },
  {
    path: "/homeowner/profile",
    name: "Homeowner Profile",
    component: () => import("../views/HomeownerProfile.vue")
  },
  {
    path: '/homeowner/chat',
    name: 'Homeowner Chat',
    component: () => import('../views/HomeownerChatPage.vue')
  },
  {
    path: '/chats',
    name: 'Chats',
    component: () => import('../views/Chats.vue')
  },
  { 
    path: '/contractor/:contractorId', 
    component: () => import('../views/ContractorProfile.vue') }
]
})

export default router