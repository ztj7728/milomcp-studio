<template>
  <div class="login-container" :style="getBackgroundStyle()">
    <div class="login-card">
      <div class="login-header" :style="getHeaderStyle()" v-if="uiStore.loginCustomization.header.title || uiStore.loginCustomization.header.subtitle">
        <div v-if="uiStore.loginCustomization.header.showLogo" class="login-logo">
          <!-- Logo placeholder -->
          <div class="logo-placeholder">📱</div>
        </div>
        <h1 v-if="uiStore.loginCustomization.header.title">{{ uiStore.loginCustomization.header.title }}</h1>
        <p v-if="uiStore.loginCustomization.header.subtitle">{{ uiStore.loginCustomization.header.subtitle }}</p>
      </div>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="apiToken">API Token</label>
          <input
            id="apiToken"
            v-model="apiToken"
            type="password"
            placeholder="请输入您的 MiloMCP API Token"
            required
            :disabled="authStore.isLoading"
            class="form-input"
          />
          <p class="form-hint">
            您可以使用 Admin Token 或通过管理员创建的用户 Token
          </p>
        </div>
        
        <div v-if="authStore.lastError" class="error-message">
          <span class="error-icon">⚠️</span>
          {{ authStore.lastError }}
        </div>
        
        <button
          type="submit"
          :disabled="authStore.isLoading || !apiToken.trim()"
          class="login-button"
        >
          <span v-if="authStore.isLoading">登录中...</span>
          <span v-else>登录</span>
        </button>
      </form>
      
      <div class="login-footer" :style="getFooterStyle()" v-if="shouldShowFooter">
        <div v-if="uiStore.loginCustomization.footer.showFeatures && uiStore.loginCustomization.footer.features.length > 0" class="feature-list">
          <h3>功能特性</h3>
          <ul>
            <li v-for="feature in uiStore.loginCustomization.footer.features" :key="feature">
              {{ feature }}
            </li>
          </ul>
        </div>
        <div v-if="uiStore.loginCustomization.footer.customText" class="custom-text">
          <p>{{ uiStore.loginCustomization.footer.customText }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { useUIStore } from '../stores/ui.js'

const router = useRouter()
const authStore = useAuthStore()
const uiStore = useUIStore()

const apiToken = ref('')

// 计算属性
const shouldShowFooter = computed(() => {
  return (uiStore.loginCustomization.footer.showFeatures && uiStore.loginCustomization.footer.features.length > 0) ||
         uiStore.loginCustomization.footer.customText
})

// 样式方法
const getBackgroundStyle = () => {
  const bg = uiStore.loginCustomization.background
  switch (bg.type) {
    case 'gradient':
      return { background: bg.gradient }
    case 'solid':
      return { backgroundColor: bg.solidColor }
    case 'image':
      return {
        backgroundImage: `url(${bg.imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }
    default:
      return { background: bg.gradient }
  }
}

const getHeaderStyle = () => {
  return {
    backgroundColor: uiStore.loginCustomization.header.backgroundColor,
    color: uiStore.loginCustomization.header.textColor
  }
}

const getFooterStyle = () => {
  return {
    backgroundColor: uiStore.loginCustomization.footer.backgroundColor,
    color: uiStore.loginCustomization.footer.textColor
  }
}

const handleLogin = async () => {
  authStore.clearError()
  
  const result = await authStore.login(apiToken.value.trim())
  
  if (result.success) {
    // Login successful, redirect to dashboard
    router.push({ name: 'Dashboard' })
  }
  // Error handling is managed by the store
}

onMounted(() => {
  // Initialize UI store
  uiStore.init()
  
  // Clear any existing errors when component mounts
  authStore.clearError()
  
  // If already authenticated, redirect to dashboard
  if (authStore.isAuthenticated) {
    router.push({ name: 'Dashboard' })
  }
})
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  transition: all 0.3s ease;
}

.login-card {
  background: var(--surface-color, white);
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 480px;
  animation: slideUp 0.6s ease-out;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
  padding: 1rem;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.login-logo {
  margin-bottom: 1rem;
}

.logo-placeholder {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.login-header h1 {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px 0;
  transition: color 0.3s ease;
}

.login-header p {
  font-size: 16px;
  margin: 0;
  opacity: 0.9;
  transition: color 0.3s ease;
}

.login-form {
  margin-bottom: 32px;
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  font-weight: 600;
  color: var(--text-color, #2d3748);
  margin-bottom: 8px;
  font-size: 14px;
  transition: color 0.3s ease;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid var(--border-color, #e2e8f0);
  border-radius: 8px;
  font-size: 16px;
  background-color: var(--surface-color, white);
  color: var(--text-color, #2d3748);
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.3s ease, color 0.3s ease;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color, #667eea);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input:disabled {
  background-color: var(--background-color, #f7fafc);
  cursor: not-allowed;
}

.form-hint {
  font-size: 12px;
  color: var(--text-secondary-color, #718096);
  margin-top: 4px;
  margin-bottom: 0;
  transition: color 0.3s ease;
}

.error-message {
  background-color: #fed7d7;
  border: 1px solid #feb2b2;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 20px;
  color: #c53030;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.error-icon {
  font-size: 16px;
}

.login-button {
  width: 100%;
  background: var(--primary-gradient, linear-gradient(135deg, #667eea 0%, #764ba2 100%));
  color: white;
  border: none;
  padding: 14px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.login-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.login-footer {
  border-top: 1px solid var(--border-color, #e2e8f0);
  padding: 1.5rem;
  border-radius: 12px;
  margin-top: 1rem;
  transition: all 0.3s ease;
}

.feature-list h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 12px 0;
  transition: color 0.3s ease;
}

.feature-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.feature-list li {
  padding: 4px 0;
  font-size: 14px;
  transition: color 0.3s ease;
}

.feature-list li::before {
  content: '✓';
  color: #4ade80;
  font-weight: bold;
  margin-right: 0.5rem;
}

.custom-text p {
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
  transition: color 0.3s ease;
}

@media (max-width: 480px) {
  .login-card {
    padding: 24px;
    margin: 10px;
  }
  
  .login-header h1 {
    font-size: 24px;
  }
}
</style>