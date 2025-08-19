<template>
  <el-header class="app-navbar" :style="{ height: navbarHeight }">
    <div class="navbar-container">
      <div class="navbar-brand">
        <h1 class="brand-title">MiloMCP Studio</h1>
      </div>

      <!-- Desktop Navigation -->
      <div class="desktop-nav-container">
        <nav class="navbar-nav desktop-nav">
          <router-link v-for="item in navigationItems" :key="item.index" :to="{ name: item.index }" class="nav-item">
            <el-icon>
              <component :is="item.icon" />
            </el-icon>
            <span>{{ item.label }}</span>
          </router-link>
        </nav>
        <el-button type="primary" @click="handleLogout" class="logout-btn" plain>
          <el-icon>
            <SwitchButton />
          </el-icon>
          <span>退出登录</span>
        </el-button>
      </div>

      <!-- Mobile Navigation Toggle -->
      <el-button class="mobile-toggle" @click="isMobileMenuOpen = !isMobileMenuOpen" text circle size="large">
        <el-icon size="20">
          <component :is="isMobileMenuOpen ? Close : Menu" />
        </el-icon>
      </el-button>
    </div>

    <!-- Mobile Navigation Menu -->
    <div class="mobile-menu" :class="{ 'is-open': isMobileMenuOpen }">
      <nav class="mobile-nav">
        <router-link v-for="item in navigationItems" :key="item.index" :to="{ name: item.index }" class="mobile-nav-item" @click="closeMobileMenu">
          <el-icon class="nav-icon">
            <component :is="item.icon" />
          </el-icon>
          <span class="nav-text">{{ item.label }}</span>
        </router-link>
        <div class="mobile-logout-btn-wrapper">
          <el-button type="danger" @click="handleLogout" class="mobile-logout-btn" size="large" plain>
            <el-icon>
              <SwitchButton />
            </el-icon>
            <span>退出登录</span>
          </el-button>
        </div>
      </nav>
    </div>
  </el-header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import {
  SwitchButton, Menu, Close, Monitor, Tools, User, Setting
} from '@element-plus/icons-vue'

const router = useRouter()
const authStore = useAuthStore()
const isMobileMenuOpen = ref(false)

const navigationItems = computed(() => {
  const items = [
    { index: 'Dashboard', label: '仪表板', icon: Monitor },
    { index: 'Tools', label: '工具管理', icon: Tools },
    { index: 'Settings', label: '设置', icon: Setting }
  ]

  if (authStore.isAdmin) {
    items.splice(2, 0, { index: 'Users', label: '用户管理', icon: User })
  }

  return items
})

const navbarHeight = computed(() => {
  return '64px'
})

const handleLogout = () => {
  authStore.logout()
  router.push({ name: 'Login' })
  closeMobileMenu()
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

const handleResize = () => {
  if (window.innerWidth > 768 && isMobileMenuOpen.value) {
    isMobileMenuOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
/* Base Navbar Styles */
.app-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: var(--navbar-bg-color);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--el-border-color-lighter);
  transition: background-color 0.3s, box-shadow 0.3s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.navbar-container {
  height: 64px;
  width: 100%;
  max-width: 1280px; /* Max width for content */
  margin: 0 auto; /* Center the container */
  padding: 0 24px; /* Consistent padding */
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 1001;
}

.navbar-brand .brand-title {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  color: var(--el-text-color-primary);
}

/* Desktop Navigation */
.desktop-nav-container {
  display: flex;
  align-items: center;
  gap: 24px;
}

.desktop-nav {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  text-decoration: none;
  color: var(--el-text-color-regular);
  font-weight: 500;
  transition: all 0.2s ease-in-out;
}

.nav-item:hover {
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

.nav-item.router-link-exact-active {
  background-color: var(--el-color-primary);
  color: white;
}

/* Mobile Toggle */
.mobile-toggle {
  display: none;
}

/* Mobile Menu */
.mobile-menu {
  position: absolute;
  top: 64px;
  left: 0;
  right: 0;
  background: var(--navbar-bg-solid-color); /* Solid background */
  transform: translateY(-100%);
  transition: transform 0.4s cubic-bezier(0.23, 1, 0.32, 1), visibility 0.4s;
  visibility: hidden;
  overflow-x: hidden;
  overflow-y: auto;
  max-height: calc(100vh - 64px);
}

.mobile-menu.is-open {
  transform: translateY(0);
  visibility: visible;
}

.mobile-nav {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 16px;
  gap: 12px;
}

.mobile-nav-item {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  padding: 16px;
  border-radius: 8px;
  text-decoration: none;
  color: var(--el-text-color-primary);
  font-size: 16px;
  font-weight: 500;
  transition: all 0.2s ease-in-out;
}

.mobile-nav-item .nav-icon {
  margin-right: 12px;
}

.mobile-nav-item:hover {
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

.mobile-nav-item.router-link-exact-active {
  background-color: var(--el-color-primary);
  color: white;
}

.mobile-logout-btn-wrapper {
  display: flex;
  justify-content: center; /* Center the button */
  padding: 16px 0 0;
  margin-top: 8px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.mobile-logout-btn {
  width: 100%;
}

/* Responsive Breakpoints */
@media (max-width: 768px) {
  .desktop-nav-container {
    display: none;
  }

  .mobile-toggle {
    display: inline-flex;
  }

  .navbar-container {
    padding: 0 16px; /* Adjust padding for mobile */
  }
}
</style>
