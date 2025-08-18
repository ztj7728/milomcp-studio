<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth.js'
import { useUIStore } from './stores/ui.js'

const authStore = useAuthStore()
const uiStore = useUIStore()

onMounted(async () => {
  // Initialize UI store first
  uiStore.init()
  
  // Initialize auth store when app starts
  await authStore.init()
})
</script>

<style>
/* Global styles are now more streamlined */
:root {
  --el-border-radius-base: 8px;
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

/* Global responsive improvements */
@media (max-width: 768px) {
  .el-dialog {
    margin: 20px !important;
    width: calc(100vw - 40px) !important;
    max-width: 500px !important;
  }
  
  .el-dialog__header {
    padding: 16px;
  }
  
  .el-dialog__body {
    padding: 16px;
    max-height: 60vh;
    overflow-y: auto;
  }
  
  .el-dialog__footer {
    padding: 12px 16px;
  }
  
  .el-button {
    font-size: 14px;
    padding: 8px 15px;
  }
  
  .el-input__inner {
    font-size: 16px; /* Prevent zoom on iOS */
  }
  
  .el-form-item__label {
    font-size: 14px;
    line-height: 1.4;
  }
  
  .el-card {
    border-radius: 12px;
  }
  
  .el-card__header {
    padding: 16px;
  }
  
  .el-card__body {
    padding: 16px;
  }
}

/* Fix scrolling issues on mobile */
@media (max-width: 768px) {
  html {
    -webkit-text-size-adjust: 100%;
    -ms-text-size-adjust: 100%;
  }
  
  body {
    overflow-x: hidden;
  }
  
  .el-table {
    font-size: 13px;
  }
  
  .el-table th,
  .el-table td {
    padding: 8px;
  }
  
  .el-table__cell {
    font-size: 13px;
  }
}
</style>