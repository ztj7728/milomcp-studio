import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import App from './App.vue'
import Login from './views/Login.vue'

// Create router
const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('./views/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/users',
    name: 'Users',
    component: () => import('./views/Users.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/tools',
    name: 'Tools',
    component: () => import('./views/Tools.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('./views/Settings.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guards
router.beforeEach(async (to, from, next) => {
  const { useAuthStore } = await import('./stores/auth.js')
  const authStore = useAuthStore()
  
  // Initialize auth store if not done yet
  if (!authStore.isInitialized) {
    await authStore.init()
  }
  
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin)
  
  if (requiresAuth && !authStore.isAuthenticated) {
    // Redirect to login if authentication required but not authenticated
    next({ name: 'Login' })
  } else if (requiresAdmin && !authStore.isAdmin) {
    // Redirect to dashboard if admin required but not admin
    next({ name: 'Dashboard' })
  } else if (to.name === 'Login' && authStore.isAuthenticated) {
    // Redirect to dashboard if already authenticated and trying to access login
    next({ name: 'Dashboard' })
  } else {
    next()
  }
})

// Create app
const app = createApp(App)

// Use plugins
app.use(createPinia())
app.use(router)

// Global error handler
app.config.errorHandler = (err, instance, info) => {
  console.error('Global error:', err)
  console.error('Error info:', info)
}

// Mount app
app.mount('#app')