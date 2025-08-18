<template>
  <div>
    <div class="page-header">
      <div>
        <h2>设置</h2>
        <p>管理系统配置和个人偏好</p>
      </div>
    </div>

    <el-tabs v-model="activeTab" class="settings-tabs">
      <el-tab-pane label="主题设置" name="theme">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>主题配置</span>
              <el-icon><Brush /></el-icon>
            </div>
          </template>
          
          <el-form label-width="120px">
            <el-form-item label="主题模式">
              <el-radio-group v-model="currentThemeSelection" @change="onThemeChange">
                <el-radio label="light">
                  <el-icon><Sunny /></el-icon>
                  浅色主题
                </el-radio>
                <el-radio label="dark">
                  <el-icon><Moon /></el-icon>
                  深色主题
                </el-radio>
                <el-radio label="auto">
                  <el-icon><Monitor /></el-icon>
                  跟随系统
                </el-radio>
              </el-radio-group>
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="saveTheme">
                <el-icon><Check /></el-icon>
                保存主题设置
              </el-button>
              <el-button @click="cancelThemePreview" v-if="isPreviewingTheme">
                <el-icon><Close /></el-icon>
                取消预览
              </el-button>
            </el-form-item>
          </el-form>
          
          <el-alert
            title="主题预览"
            type="info"
            :closable="false"
            show-icon
            v-if="isPreviewingTheme"
          >
            当前正在预览主题效果，点击保存确认应用或取消预览
          </el-alert>
        </el-card>
      </el-tab-pane>

      <el-tab-pane v-if="authStore.isAdmin" label="登录页面" name="login">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>登录页面自定义</span>
              <el-icon><User /></el-icon>
            </div>
          </template>
          
          <el-form :model="loginCustomization" label-width="120px">
            <el-divider content-position="left">页面标题</el-divider>
            
            <el-form-item label="应用标题">
              <el-input 
                v-model="loginCustomization.header.title"
                placeholder="MiloMCP Studio"
              />
            </el-form-item>
            
            <el-form-item label="副标题">
              <el-input 
                v-model="loginCustomization.header.subtitle"
                placeholder="高性能、优雅、轻量的 MCP 管理平台"
              />
            </el-form-item>
            
            <el-form-item label="显示Logo">
              <el-switch v-model="loginCustomization.header.showLogo" />
            </el-form-item>
            
            <el-divider content-position="left">背景设置</el-divider>
            
            <el-form-item label="背景类型">
              <el-radio-group v-model="loginCustomization.background.type">
                <el-radio label="gradient">渐变背景</el-radio>
                <el-radio label="solid">纯色背景</el-radio>
                <el-radio label="image">图片背景</el-radio>
              </el-radio-group>
            </el-form-item>
            
            <el-form-item v-if="loginCustomization.background.type === 'solid'" label="背景颜色">
              <el-color-picker v-model="loginCustomization.background.solidColor" />
            </el-form-item>
            
            <el-form-item v-if="loginCustomization.background.type === 'image'" label="背景图片URL">
              <el-input 
                v-model="loginCustomization.background.imageUrl"
                placeholder="https://example.com/background.jpg"
              />
            </el-form-item>
            
            <el-divider content-position="left">功能特性</el-divider>
            
            <el-form-item label="显示功能列表">
              <el-switch v-model="loginCustomization.footer.showFeatures" />
            </el-form-item>
            
            <el-form-item v-if="loginCustomization.footer.showFeatures" label="功能特性">
              <div class="feature-editor">
                <el-tag
                  v-for="(feature, index) in loginCustomization.footer.features"
                  :key="index"
                  closable
                  @close="removeFeature(index)"
                  class="feature-tag"
                >
                  {{ feature }}
                </el-tag>
                <el-input
                  v-if="showFeatureInput"
                  v-model="newFeature"
                  @keyup.enter="addFeature"
                  @blur="addFeature"
                  placeholder="输入新功能特性"
                  size="small"
                  class="feature-input"
                />
                <el-button v-else @click="showFeatureInput = true" size="small" text>
                  <el-icon><Plus /></el-icon>
                  添加功能
                </el-button>
              </div>
            </el-form-item>
            
            <el-form-item label="自定义文本">
              <el-input 
                v-model="loginCustomization.footer.customText"
                type="textarea"
                placeholder="在这里输入自定义的页脚文本"
              />
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="saveLoginCustomization">
                <el-icon><Check /></el-icon>
                保存登录设置
              </el-button>
              <el-button @click="resetLoginCustomization">
                <el-icon><Refresh /></el-icon>
                重置为默认
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="系统信息" name="system">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>系统信息</span>
              <el-icon><InfoFilled /></el-icon>
            </div>
          </template>
          
          <el-descriptions :column="2" border>
            <el-descriptions-item label="应用名称">MiloMCP Studio</el-descriptions-item>
            <el-descriptions-item label="版本">v1.0.0</el-descriptions-item>
            <el-descriptions-item label="构建时间">{{ new Date().toLocaleDateString() }}</el-descriptions-item>
            <el-descriptions-item label="运行环境">{{ getEnvironment() }}</el-descriptions-item>
            <el-descriptions-item label="浏览器">{{ getBrowser() }}</el-descriptions-item>
            <el-descriptions-item label="用户权限">{{ authStore.isAdmin ? '管理员' : '普通用户' }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { useUIStore } from '../stores/ui.js'
import { 
  Brush, Sunny, Moon, Monitor, Check, Close, User, Plus, 
  Refresh, InfoFilled 
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const authStore = useAuthStore()
const uiStore = useUIStore()

const activeTab = ref('theme')
const currentThemeSelection = ref(uiStore.theme)
const isPreviewingTheme = ref(false)
const showFeatureInput = ref(false)
const newFeature = ref('')

// Create reactive copy of login customization for editing
const loginCustomization = reactive({
  header: { ...uiStore.loginCustomization.header },
  footer: { ...uiStore.loginCustomization.footer },
  background: { ...uiStore.loginCustomization.background }
})

const onThemeChange = (value) => {
  currentThemeSelection.value = value
  uiStore.previewThemeChange(value)
  isPreviewingTheme.value = true
}

const saveTheme = () => {
  uiStore.setTheme(currentThemeSelection.value)
  isPreviewingTheme.value = false
  ElMessage.success('主题设置已保存')
}

const cancelThemePreview = () => {
  uiStore.cancelPreview()
  currentThemeSelection.value = uiStore.theme
  isPreviewingTheme.value = false
  ElMessage.info('已取消主题预览')
}

const addFeature = () => {
  if (newFeature.value.trim()) {
    loginCustomization.footer.features.push(newFeature.value.trim())
    newFeature.value = ''
  }
  showFeatureInput.value = false
}

const removeFeature = (index) => {
  loginCustomization.footer.features.splice(index, 1)
}

const saveLoginCustomization = () => {
  // Update the store with new values
  Object.keys(loginCustomization.header).forEach(key => {
    uiStore.updateLoginCustomization('header', { [key]: loginCustomization.header[key] })
  })
  Object.keys(loginCustomization.footer).forEach(key => {
    uiStore.updateLoginCustomization('footer', { [key]: loginCustomization.footer[key] })
  })
  Object.keys(loginCustomization.background).forEach(key => {
    uiStore.updateLoginCustomization('background', { [key]: loginCustomization.background[key] })
  })
  
  ElMessage.success('登录页面设置已保存')
}

const resetLoginCustomization = () => {
  uiStore.resetLoginCustomization()
  // Update reactive copy
  Object.assign(loginCustomization.header, uiStore.loginCustomization.header)
  Object.assign(loginCustomization.footer, uiStore.loginCustomization.footer)
  Object.assign(loginCustomization.background, uiStore.loginCustomization.background)
  
  ElMessage.success('登录页面设置已重置')
}

const getEnvironment = () => {
  return import.meta.env.DEV ? '开发环境' : '生产环境'
}

const getBrowser = () => {
  const userAgent = navigator.userAgent
  if (userAgent.includes('Chrome')) return 'Chrome'
  if (userAgent.includes('Firefox')) return 'Firefox'
  if (userAgent.includes('Safari')) return 'Safari'
  if (userAgent.includes('Edge')) return 'Edge'
  return '未知'
}

onMounted(() => {
  currentThemeSelection.value = uiStore.theme
})
</script>

<style scoped>
.page-header {
  margin-bottom: 24px;
}

.page-header h2 {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: var(--el-text-color-primary);
}

.page-header p {
  font-size: 14px;
  color: var(--el-text-color-regular);
  margin: 0;
}

.settings-tabs {
  background: transparent;
}

/* Card styling */
.settings-main .el-card {
  border-radius: 16px;
  border: none;
  background: var(--card-bg-color);
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  margin-bottom: 24px;
}

.settings-main .el-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.12);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.feature-editor {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.feature-input {
  width: 200px;
}

@media (max-width: 768px) {
  .page-header h2 {
    font-size: 20px;
  }
  
  .page-header p {
    font-size: 13px;
  }
  
  .settings-tabs {
    margin-top: 8px;
  }
  
  :deep(.el-tabs__nav-wrap) {
    padding: 0 8px;
  }
  
  :deep(.el-tabs__item) {
    font-size: 14px;
    padding: 0 12px;
  }
  
  .card-header {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }
  
  :deep(.el-form-item__label) {
    font-size: 14px;
    line-height: 1.4;
  }
  
  :deep(.el-radio) {
    flex-direction: column;
    align-items: flex-start;
    margin-right: 16px;
    margin-bottom: 8px;
  }
  
  :deep(.el-radio__label) {
    padding-left: 8px;
    font-size: 13px;
  }
  
  .feature-editor {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .feature-tag {
    align-self: flex-start;
  }
  
  .feature-input {
    width: 100%;
  }
  
  :deep(.el-descriptions) {
    font-size: 13px;
  }
  
  :deep(.el-descriptions__label) {
    font-size: 12px;
  }
  
  :deep(.el-descriptions__content) {
    font-size: 12px;
  }
  
  :deep(.el-form-item) {
    margin-bottom: 16px;
  }
  
  :deep(.el-button) {
    font-size: 13px;
  }
}
</style>