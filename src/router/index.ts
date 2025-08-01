import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/test',
      name: 'test',
      component: () => import('@/views/TestView.vue'),
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/presensi',
      name: 'presensi',
      component: () => import('@/views/PresensiView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/laporan',
      name: 'laporan',
      component: () => import('@/views/LaporanView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
  ],
})

// Navigation guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // For test route, allow access
  if (to.name === 'test') {
    next()
    return
  }

  // Wait for auth initialization if not done yet
  if (authStore.loading) {
    await new Promise((resolve) => {
      const checkAuth = () => {
        if (!authStore.loading) {
          resolve(true)
        } else {
          setTimeout(checkAuth, 100)
        }
      }
      checkAuth()
    })
  }

  // Check if route requires authentication
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    next('/login')
    return
  }

  // Check if route requires admin
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next('/dashboard')
    return
  }

  // Redirect authenticated users away from login
  if (to.meta.requiresGuest && authStore.isLoggedIn) {
    next('/dashboard')
    return
  }

  next()
})

export default router
