import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth.store'

const routes = [
  // Public routes
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/auth/LoginView.vue'),
    meta: { requiresGuest: true },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/auth/RegisterView.vue'),
    meta: { requiresGuest: true },
  },

  // Protected routes — use layout wrapper
  {
    path: '/',
    component: () => import('../components/layout/AppLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/dashboard',
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/dashboard/DashboardView.vue'),
      },
      {
        path: 'tasks',
        name: 'Tasks',
        component: () => import('../views/tasks/TaskView.vue'),
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('../views/profile/ProfileView.vue'),
      },
      {
        path: 'admin',
        name: 'Admin',
        component: () => import('../views/admin/AdminView.vue'),
        meta: { requiresAdmin: true },
      },
    ],
  },

  // Catch-all — redirect unauthenticated to login, authenticated to dashboard
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

// Track whether we've already attempted session restore on this page load
// to avoid calling /auth/me on every navigation
let sessionChecked = false

// Call this after login/logout so the next navigation re-checks auth state
export const resetSessionCheck = () => {
  sessionChecked = false
}

// Navigation guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Only attempt to restore session once per page load (not on every navigation)
  if (!sessionChecked && !authStore.user) {
    sessionChecked = true
    await authStore.fetchCurrentUser()
  }

  // Redirect unauthenticated users away from protected routes
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next({ name: 'Login', query: { redirect: to.fullPath } })
  }

  // Redirect authenticated users away from guest-only routes (login/register)
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    return next({ name: 'Dashboard' })
  }

  // Block non-admins from admin routes
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    return next({ name: 'Dashboard' })
  }

  next()
})

export default router