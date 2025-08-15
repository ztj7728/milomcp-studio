<template>
  <div class="login-container" :style="getBackgroundStyle()">
    <el-card class="login-card" shadow="always">
      <div class="login-header" :style="getHeaderStyle()" v-if="uiStore.loginCustomization.header.title || uiStore.loginCustomization.header.subtitle">
        <div v-if="uiStore.loginCustomization.header.showLogo" class="login-logo">
          <div class="logo-placeholder">📱</div>
        </div>
        <h1 v-if="uiStore.loginCustomization.header.title">{{ uiStore.loginCustomization.header.title }}</h1>
        <p v-if="uiStore.loginCustomization.header.subtitle">{{ uiStore.loginCustomization.header.subtitle }}</p>
      </div>
      
      <el-form @submit.prevent="handleLogin" class="login-form" :model="loginForm" ref="loginFormRef" :rules="rules">
        <el-form-item prop="apiToken">
          <el-input
            v-model="loginForm.apiToken"
            type="password"
            placeholder="请输入您的 MiloMCP API Token"
            size="large"
            :disabled="authStore.isLoading"
            show-password
          >
            <template #prefix>
              <el-icon><Key /></el-icon>
            </template>
          </el-input>
          <div class="form-hint">
            您可以使用 Admin Token 或通过管理员创建的用户 Token
          </div>
        </el-form-item>
        
        <el-alert 
          v-if="authStore.lastError" 
          :title="authStore.lastError"
          type="error"
          :closable="false"
          show-icon
          class="login-error"
        />
        
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            @click="handleLogin"
            :loading="authStore.isLoading"
            :disabled="!loginForm.apiToken.trim()"
            class="login-button"
          >
            {{ authStore.isLoading ? '登录中...' : '登录' }}
          </el-button>
        </el-form-item>
      </el-form>
      
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
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { useUIStore } from '../stores/ui.js'
import { Key } from '@element-plus/icons-vue'

const router = useRouter()
const authStore = useAuthStore()
const uiStore = useUIStore()

const loginFormRef = ref()
const loginForm = reactive({
  apiToken: ''
})

const rules = {
  apiToken: [
    { required: true, message: '请输入 API Token', trigger: 'blur' }
  ]
}

const shouldShowFooter = computed(() => {
  return (uiStore.loginCustomization.footer.showFeatures && uiStore.loginCustomization.footer.features.length > 0) ||
         uiStore.loginCustomization.footer.customText
})

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
  if (!loginFormRef.value) return
  
  const isValid = await loginFormRef.value.validate().catch(() => false)
  if (!isValid) return

  try {
    const success = await authStore.login(loginForm.apiToken.trim())
    if (success) {
      router.push({ name: 'Dashboard' })
    }
  } catch (error) {
    console.error('Login failed:', error)
  }
}

onMounted(() => {
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
}

.login-card {
  width: 100%;
  max-width: 440px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
  padding: 24px;
  border-radius: 8px;
}

.login-logo {
  margin-bottom: 16px;
}

.logo-placeholder {
  font-size: 48px;
  margin-bottom: 16px;
}

.login-header h1 {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px 0;
}

.login-header p {
  font-size: 16px;
  opacity: 0.8;
  margin: 0;
}

.login-form {
  padding: 0 24px;
}

.form-hint {
  margin-top: 8px;
  font-size: 12px;
  color: var(--el-text-color-regular);
  line-height: 1.4;
}

.login-error {
  margin-bottom: 20px;
}

.login-button {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
}

.login-footer {
  margin-top: 32px;
  padding: 24px;
  border-radius: 8px;
  text-align: center;
}

.feature-list h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 16px 0;
}

.feature-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
  text-align: left;
}

.feature-list li {
  padding: 8px 0;
  font-size: 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.feature-list li:last-child {
  border-bottom: none;
}

.custom-text {
  margin-top: 16px;
}

.custom-text p {
  font-size: 14px;
  line-height: 1.6;
  margin: 0;
}

@media (max-width: 640px) {
  .login-container {
    padding: 16px;
  }
  
  .login-card {
    max-width: none;
  }
  
  .login-form {
    padding: 0 16px;
  }
  
  .login-header,
  .login-footer {
    padding: 16px;
  }
}
</style>