<template>
  <el-header class="app-navbar">
    <div class="navbar-left">
      <h1 class="brand-title">MiloMCP Studio</h1>
    </div>
    <div class="navbar-nav">
      <el-menu mode="horizontal" :default-active="$route.name" router class="navbar-menu">
        <el-menu-item index="Dashboard">仪表板</el-menu-item>
        <el-menu-item index="Tools">工具管理</el-menu-item>
        <el-menu-item v-if="authStore.isAdmin" index="Users">用户管理</el-menu-item>
        <el-menu-item index="Settings">设置</el-menu-item>
      </el-menu>
      <el-button type="primary" @click="handleLogout" size="small" class="logout-btn">
        <el-icon><SwitchButton /></el-icon>
        退出登录
      </el-button>
    </div>
  </el-header>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { SwitchButton } from '@element-plus/icons-vue'

const router = useRouter()
const authStore = useAuthStore()

const handleLogout = () => {
  authStore.logout()
  router.push({ name: 'Login' })
}
</script>

<style scoped>
.app-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-lighter);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 60px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  backdrop-filter: blur(10px);
}

/* Dark mode box shadow */
:deep(.theme-dark) .app-navbar {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.navbar-left {
  display: flex;
  align-items: center;
}

.brand-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  margin: 0;
  background: linear-gradient(135deg, var(--el-color-primary), var(--el-color-primary-light-3));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.navbar-nav {
  display: flex;
  align-items: center;
  gap: 20px;
}

.navbar-menu {
  border-bottom: none !important;
  background: transparent !important;
}

/* Improve menu item styling */
:deep(.navbar-menu .el-menu-item) {
  border-bottom: none !important;
  border-radius: 6px;
  margin: 0 4px;
  transition: all 0.3s ease;
  font-weight: 500;
}

:deep(.navbar-menu .el-menu-item:hover) {
  background-color: var(--el-color-primary-light-9) !important;
  color: var(--el-color-primary) !important;
}

:deep(.navbar-menu .el-menu-item.is-active) {
  background-color: var(--el-color-primary) !important;
  color: white !important;
  border-radius: 6px;
}

/* Dark mode menu styling */
:deep(.theme-dark .navbar-menu .el-menu-item:hover) {
  background-color: var(--el-color-primary-dark-2) !important;
  color: var(--el-color-primary-light-3) !important;
}

:deep(.theme-dark .navbar-menu .el-menu-item.is-active) {
  background-color: var(--el-color-primary) !important;
  color: white !important;
}

:deep(.theme-dark .navbar-menu .el-menu-item) {
  color: var(--el-text-color-primary) !important;
}

.logout-btn {
  white-space: nowrap;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

@media (max-width: 768px) {
  .app-navbar {
    flex-direction: column;
    height: auto;
    padding: 10px;
  }
  
  .navbar-nav {
    margin: 10px 0;
    flex-direction: column;
    gap: 10px;
    width: 100%;
  }
  
  .navbar-menu {
    margin: 10px 0;
    width: 100%;
    justify-content: center;
  }
  
  :deep(.navbar-menu .el-menu-item) {
    margin: 2px 0;
    justify-content: center;
  }
}
</style>