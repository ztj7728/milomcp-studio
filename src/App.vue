<template>
  <div id="app" :class="themeClass">
    <RouterView />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useAuthStore } from './stores/auth.js'
import { useUIStore } from './stores/ui.js'

const authStore = useAuthStore()
const uiStore = useUIStore()

// Compute theme class for Element Plus
const themeClass = computed(() => {
  const theme = uiStore.currentTheme
  return {
    'theme-dark': theme.name === '深色主题',
    'theme-light': theme.name !== '深色主题'
  }
})

onMounted(async () => {
  // Initialize UI store first
  uiStore.init()
  
  // Initialize auth store when app starts
  await authStore.init()
})
</script>

<style>
/* Element Plus theme customization */
:root {
  --el-color-primary: #667eea;
  --el-color-primary-light-3: #8aa1f0;
  --el-color-primary-light-5: #a6bbf5;
  --el-color-primary-light-7: #c2d5fa;
  --el-color-primary-light-8: #d1e0fc;
  --el-color-primary-light-9: #e0effe;
  --el-color-primary-dark-2: #5a67d8;
  --el-border-radius-base: 8px;
}

/* Dark theme overrides */
.theme-dark {
  --el-color-primary: #9f7aea;
  --el-color-primary-light-3: #b794f6;
  --el-color-primary-light-5: #c6a7ff;
  --el-color-primary-light-7: #d6bcfa;
  --el-color-primary-light-8: #e9d8fd;
  --el-color-primary-light-9: #faf5ff;
  --el-color-primary-dark-2: #805ad5;
  --el-bg-color: #1a202c;
  --el-bg-color-page: #1a202c;
  --el-text-color-primary: #f7fafc;
  --el-text-color-regular: #a0aec0;
  --el-border-color: #4a5568;
  --el-fill-color-blank: #2d3748;
  --el-fill-color-lighter: #2d3748;
  --el-fill-color: #4a5568;
}

html, body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Open Sans', 'Helvetica Neue', sans-serif;
  line-height: 1.6;
  transition: background-color 0.3s ease, color 0.3s ease;
}

#app {
  min-height: 100vh;
}

/* Smooth transitions for theme changes */
* {
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}

/* Global modal styling for consistency */
.el-dialog {
  border-radius: var(--el-border-radius-base);
}

.el-dialog__header {
  border-bottom: 1px solid var(--el-border-color-lighter);
  padding: 20px;
}

.el-dialog__body {
  padding: 20px;
}

.el-dialog__footer {
  border-top: 1px solid var(--el-border-color-lighter);
  padding: 16px 20px;
}

/* Form styling */
.form-text {
  font-size: 12px;
  color: var(--el-text-color-regular);
  margin-top: 4px;
  line-height: 1.4;
}

/* Card header styling */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: 16px;
}
</style>