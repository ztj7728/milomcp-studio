<template>
  <div id="app" :class="uiStore.currentTheme.name" :style="themeVariables">
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

// 计算主题CSS变量
const themeVariables = computed(() => {
  const theme = uiStore.currentTheme
  return {
    '--primary-color': theme.colors.primary,
    '--secondary-color': theme.colors.secondary,
    '--background-color': theme.colors.background,
    '--surface-color': theme.colors.surface,
    '--text-color': theme.colors.text,
    '--text-secondary-color': theme.colors.textSecondary,
    '--border-color': theme.colors.border,
    '--primary-gradient': `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%)`,
    // 确保背景色应用到body
    'background-color': theme.colors.background,
    'color': theme.colors.text
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
/* Global Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Open Sans', 'Helvetica Neue', sans-serif;
  line-height: 1.6;
  color: var(--color-text, var(--text-color, #2d3748));
  background-color: var(--color-background, var(--background-color, #f7fafc));
  transition: color 0.3s ease, background-color 0.3s ease;
  min-height: 100vh;
}

#app {
  min-height: 100vh;
  transition: all 0.3s ease;
}

/* Utility Classes */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  gap: 8px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: var(--primary-color, #667eea);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--primary-color, #5a67d8);
  filter: brightness(0.9);
  transform: translateY(-1px);
}

.btn-secondary {
  background-color: var(--surface-color, #e2e8f0);
  color: var(--text-secondary-color, #4a5568);
}

.btn-secondary:hover:not(:disabled) {
  background-color: var(--border-color, #cbd5e0);
}

.btn-danger {
  background-color: #e53e3e;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background-color: #c53030;
}

.btn-success {
  background-color: #38a169;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background-color: #2f855a;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

.btn-lg {
  padding: 12px 24px;
  font-size: 16px;
}

/* Card Component */
.card {
  background: var(--surface-color, white);
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: background-color 0.3s ease;
}

.card-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color, #e2e8f0);
  font-weight: 600;
  font-size: 16px;
  color: var(--text-color, #2d3748);
  transition: all 0.3s ease;
}

.card-body {
  padding: 20px;
  color: var(--text-color, #2d3748);
  transition: color 0.3s ease;
}

.card-footer {
  padding: 12px 20px;
  background-color: var(--background-color, #f7fafc);
  border-top: 1px solid var(--border-color, #e2e8f0);
  transition: all 0.3s ease;
}

/* Form Elements */
.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  font-weight: 500;
  color: var(--text-color, #2d3748);
  margin-bottom: 4px;
  font-size: 14px;
  transition: color 0.3s ease;
}

.form-input, .form-select, .form-textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--border-color, #d1d5db);
  border-radius: 6px;
  font-size: 14px;
  background-color: var(--surface-color, white);
  color: var(--text-color, #2d3748);
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.3s ease, color 0.3s ease;
}

.form-input:focus, .form-select:focus, .form-textarea:focus {
  outline: none;
  border-color: var(--primary-color, #667eea);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

/* Status indicators */
.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  gap: 4px;
}

.status-success {
  background-color: #c6f6d5;
  color: #22543d;
}

.status-error {
  background-color: #fed7d7;
  color: #822727;
}

.status-warning {
  background-color: #fef2c7;
  color: #744210;
}

.status-info {
  background-color: #bee3f8;
  color: #1e4a8c;
}

/* Loading states */
.loading {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid var(--border-color, #e2e8f0);
  border-radius: 50%;
  border-top-color: var(--primary-color, #667eea);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 768px) {
  .container {
    padding: 0 16px;
  }
  
  .card-body {
    padding: 16px;
  }
}

/* Animations */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.slide-enter-active, .slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  transform: translateX(-20px);
  opacity: 0;
}

.slide-leave-to {
  transform: translateX(20px);
  opacity: 0;
}

/* Theme-specific styles */
.theme-light {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --background-color: #f7fafc;
  --surface-color: #ffffff;
  --text-color: #2d3748;
  --text-secondary-color: #718096;
  --border-color: #e2e8f0;
}

.theme-dark {
  --primary-color: #9f7aea;
  --secondary-color: #667eea;
  --background-color: #1a202c;
  --surface-color: #2d3748;
  --text-color: #f7fafc;
  --text-secondary-color: #a0aec0;
  --border-color: #4a5568;
}

.theme-blue {
  --primary-color: #3182ce;
  --secondary-color: #2b6cb0;
  --background-color: #ebf8ff;
  --surface-color: #ffffff;
  --text-color: #2a4365;
  --text-secondary-color: #4299e1;
  --border-color: #bee3f8;
}

.theme-purple {
  --primary-color: #805ad5;
  --secondary-color: #6b46c1;
  --background-color: #faf5ff;
  --surface-color: #ffffff;
  --text-color: #44337a;
  --text-secondary-color: #9f7aea;
  --border-color: #e9d8fd;
}

.theme-auto {
  /* Auto theme will be handled by JavaScript based on system preference */
}

/* Dark mode specific adjustments */
.theme-dark .card {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.theme-dark .form-input:focus,
.theme-dark .form-select:focus,
.theme-dark .form-textarea:focus {
  box-shadow: 0 0 0 3px rgba(159, 122, 234, 0.2);
}

.theme-dark .btn-primary:hover:not(:disabled) {
  filter: brightness(1.1);
}

/* Smooth transitions for theme changes */
* {
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}
</style>