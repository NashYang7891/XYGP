import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { guest: true },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue'),
    meta: { guest: true },
  },
  {
    path: '/',
    component: () => import('../layouts/MainLayout.vue'),
    meta: { auth: true },
    children: [
      { path: '', name: 'Home', component: () => import('../views/Home.vue') },
      { path: 'intraday', name: 'Intraday', component: () => import('../views/Intraday.vue') },
      { path: 'etf', name: 'Etf', component: () => import('../views/Etf.vue') },
      { path: 'topic/:slug', name: 'Topic', component: () => import('../views/TopicPage.vue') },
      { path: 'index/:code', name: 'IndexDetail', component: () => import('../views/IndexPage.vue') },
      { path: 'stock/:symbol', name: 'StockDetail', component: () => import('../views/StockDetail.vue') },
      { path: 'watchlist', name: 'Watchlist', component: () => import('../views/Watchlist.vue') },
    ],
  },
  {
    path: '/admin',
    component: () => import('../layouts/AdminLayout.vue'),
    children: [
      { path: 'login', name: 'AdminLogin', component: () => import('../views/admin/AdminLogin.vue') },
      { path: '', name: 'AdminDashboard', component: () => import('../views/admin/Dashboard.vue'), meta: { adminAuth: true } },
      { path: 'users', name: 'AdminUsers', component: () => import('../views/admin/Users.vue'), meta: { adminAuth: true } },
      { path: 'stocks', name: 'AdminStocks', component: () => import('../views/admin/Stocks.vue'), meta: { adminAuth: true } },
      { path: 'announcements', name: 'AdminAnnouncements', component: () => import('../views/admin/Announcements.vue'), meta: { adminAuth: true } },
      { path: 'invite-codes', name: 'AdminInviteCodes', component: () => import('../views/admin/InviteCodes.vue'), meta: { adminAuth: true } },
    ],
  },
]

const router = createRouter({ history: createWebHistory(), routes })

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const adminToken = localStorage.getItem('admin_token')
  if (to.meta.auth && !token) return next('/login')
  if (to.meta.guest && token && !to.path.startsWith('/admin')) return next('/')
  if (to.meta.adminAuth && !adminToken) return next('/admin/login')
  if (to.path === '/admin' && adminToken) return next('/admin/')
  next()
})

export default router
