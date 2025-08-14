<template>
  <div class="settings">
    <nav class="navbar">
      <div class="navbar-brand">
        <h1>MiloMCP Studio</h1>
      </div>
      <div class="navbar-nav">
        <RouterLink to="/dashboard" class="nav-link">仪表板</RouterLink>
        <RouterLink to="/tools" class="nav-link">工具管理</RouterLink>
        <RouterLink to="/users" class="nav-link" v-if="authStore.isAdmin">用户管理</RouterLink>
        <RouterLink to="/settings" class="nav-link active">设置</RouterLink>
        <button @click="handleLogout" class="btn btn-sm btn-secondary">退出登录</button>
      </div>
    </nav>

    <main class="main-content">
      <div class="container">
        <div class="page-header">
          <div class="header-content">
            <h2>设置</h2>
            <p>管理系统配置和个人偏好</p>
          </div>
          <div class="header-actions">
            <button @click="resetSettings" class="btn btn-secondary">重置设置</button>
            <button @click="exportSettings" class="btn btn-secondary">导出配置</button>
            <button @click="saveSettings" class="btn btn-primary" :disabled="!hasChanges">
              <span v-if="isSaving" class="loading"></span>
              {{ isSaving ? '保存中...' : '保存设置' }}
            </button>
          </div>
        </div>

        <div class="settings-tabs">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="['tab-button', { active: activeTab === tab.id }]"
          >
            {{ tab.icon }} {{ tab.name }}
          </button>
        </div>

        <div class="settings-content">
          <!-- General Settings -->
          <div v-show="activeTab === 'general'" class="settings-section">
            <div class="setting-group">
              <h3>基础设置</h3>
              <div class="setting-item">
                <label class="setting-label">
                  <span class="label-text">应用语言</span>
                  <select v-model="settings.general.language" class="form-select">
                    <option value="zh-CN">简体中文</option>
                    <option value="en-US">English</option>
                    <option value="ja-JP">日本語</option>
                  </select>
                </label>
              </div>
              <div class="setting-item">
                <label class="setting-label">
                  <span class="label-text">时间格式</span>
                  <select v-model="settings.general.timeFormat" class="form-select">
                    <option value="24h">24小时制</option>
                    <option value="12h">12小时制</option>
                  </select>
                </label>
              </div>
            </div>

            <div class="setting-group">
              <h3>显示设置</h3>
              <div class="setting-item">
                <label class="setting-label checkbox-label">
                  <input
                    type="checkbox"
                    v-model="settings.general.showWelcomeMessage"
                  />
                  <span class="checkmark"></span>
                  <span class="label-text">显示欢迎消息</span>
                </label>
              </div>
              <div class="setting-item">
                <label class="setting-label checkbox-label">
                  <input
                    type="checkbox"
                    v-model="settings.general.showNotifications"
                  />
                  <span class="checkmark"></span>
                  <span class="label-text">启用系统通知</span>
                </label>
              </div>
              <div class="setting-item">
                <label class="setting-label checkbox-label">
                  <input
                    type="checkbox"
                    v-model="settings.general.autoSave"
                  />
                  <span class="checkmark"></span>
                  <span class="label-text">自动保存设置</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Theme Settings -->
          <div v-show="activeTab === 'theme'" class="settings-section">
            <div class="setting-group">
              <h3>主题选择</h3>
              <div class="theme-selector">
                <div
                  v-for="(themeData, themeKey) in uiStore.themes"
                  :key="themeKey"
                  @click="uiStore.previewThemeChange(themeKey)"
                  :class="['theme-option', { active: (uiStore.previewTheme || uiStore.theme) === themeKey }]"
                >
                  <div class="theme-preview" :style="getThemePreviewStyle(themeData)">
                    <div class="theme-preview-header"></div>
                    <div class="theme-preview-content"></div>
                  </div>
                  <span class="theme-name">{{ themeData.name }}</span>
                </div>
                <div
                  @click="uiStore.previewThemeChange('auto')"
                  :class="['theme-option', { active: (uiStore.previewTheme || uiStore.theme) === 'auto' }]"
                >
                  <div class="theme-preview auto-theme">
                    <div class="theme-preview-split">
                      <div class="theme-preview-light"></div>
                      <div class="theme-preview-dark"></div>
                    </div>
                  </div>
                  <span class="theme-name">跟随系统</span>
                </div>
              </div>
            </div>

            <div class="setting-group">
              <h3>主题预览</h3>
              <div v-if="uiStore.currentPreviewTheme && uiStore.currentPreviewTheme.colors" class="theme-preview-large">
                <div class="preview-header" :style="{ backgroundColor: uiStore.currentPreviewTheme.colors.primary, color: 'white' }">
                  <h4>{{ uiStore.currentPreviewTheme.name }}</h4>
                </div>
                <div class="preview-content" :style="{ backgroundColor: uiStore.currentPreviewTheme.colors.background, color: uiStore.currentPreviewTheme.colors.text }">
                  <div class="preview-card" :style="{ backgroundColor: uiStore.currentPreviewTheme.colors.surface, border: `1px solid ${uiStore.currentPreviewTheme.colors.border}` }">
                    <p :style="{ color: uiStore.currentPreviewTheme.colors.text }">主要文本</p>
                    <p :style="{ color: uiStore.currentPreviewTheme.colors.textSecondary }">次要文本</p>
                    <div class="preview-buttons">
                      <button class="btn btn-sm" :style="{ backgroundColor: uiStore.currentPreviewTheme.colors.primary, color: 'white' }">主要按钮</button>
                      <button class="btn btn-sm" :style="{ backgroundColor: uiStore.currentPreviewTheme.colors.success, color: 'white' }">成功</button>
                      <button class="btn btn-sm" :style="{ backgroundColor: uiStore.currentPreviewTheme.colors.warning, color: 'white' }">警告</button>
                      <button class="btn btn-sm" :style="{ backgroundColor: uiStore.currentPreviewTheme.colors.error, color: 'white' }">错误</button>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="theme-preview-loading">
                <p>正在加载主题预览...</p>
              </div>
            </div>
          </div>

          <!-- Login Customization Settings -->
          <div v-show="activeTab === 'login'" class="settings-section">
            <div class="setting-group">
              <h3>登录页头部设置</h3>
              <div class="setting-item">
                <label class="setting-label">
                  <span class="label-text">标题</span>
                  <input
                    type="text"
                    v-model="uiStore.loginCustomization.header.title"
                    class="form-input"
                    placeholder="应用标题"
                  />
                </label>
              </div>
              <div class="setting-item">
                <label class="setting-label">
                  <span class="label-text">副标题</span>
                  <input
                    type="text"
                    v-model="uiStore.loginCustomization.header.subtitle"
                    class="form-input"
                    placeholder="应用描述"
                  />
                </label>
              </div>
              <div class="setting-item">
                <label class="setting-label checkbox-label">
                  <input
                    type="checkbox"
                    v-model="uiStore.loginCustomization.header.showLogo"
                  />
                  <span class="checkmark"></span>
                  <span class="label-text">显示Logo</span>
                </label>
              </div>
              <div class="setting-item">
                <label class="setting-label">
                  <span class="label-text">背景颜色</span>
                  <input
                    type="color"
                    v-model="uiStore.loginCustomization.header.backgroundColor"
                    class="color-input"
                  />
                </label>
              </div>
              <div class="setting-item">
                <label class="setting-label">
                  <span class="label-text">文字颜色</span>
                  <input
                    type="color"
                    v-model="uiStore.loginCustomization.header.textColor"
                    class="color-input"
                  />
                </label>
              </div>
            </div>

            <div class="setting-group">
              <h3>登录页底部设置</h3>
              <div class="setting-item">
                <label class="setting-label checkbox-label">
                  <input
                    type="checkbox"
                    v-model="uiStore.loginCustomization.footer.showFeatures"
                  />
                  <span class="checkmark"></span>
                  <span class="label-text">显示功能特性列表</span>
                </label>
              </div>
              <div v-if="uiStore.loginCustomization.footer.showFeatures" class="setting-item">
                <label class="setting-label">
                  <span class="label-text">功能特性</span>
                  <div class="feature-editor">
                    <div
                      v-for="(feature, index) in uiStore.loginCustomization.footer.features"
                      :key="index"
                      class="feature-item"
                    >
                      <input
                        type="text"
                        v-model="uiStore.loginCustomization.footer.features[index]"
                        class="form-input"
                        placeholder="功能描述"
                      />
                      <button
                        @click="removeFeature(index)"
                        class="btn btn-sm btn-danger"
                        type="button"
                      >
                        删除
                      </button>
                    </div>
                    <button
                      @click="addFeature"
                      class="btn btn-sm btn-secondary"
                      type="button"
                    >
                      添加功能
                    </button>
                  </div>
                </label>
              </div>
              <div class="setting-item">
                <label class="setting-label">
                  <span class="label-text">自定义文本</span>
                  <textarea
                    v-model="uiStore.loginCustomization.footer.customText"
                    class="form-textarea"
                    placeholder="可选的自定义文本内容"
                    rows="3"
                  ></textarea>
                </label>
              </div>
              <div class="setting-item">
                <label class="setting-label">
                  <span class="label-text">背景颜色</span>
                  <input
                    type="color"
                    v-model="uiStore.loginCustomization.footer.backgroundColor"
                    class="color-input"
                  />
                </label>
              </div>
              <div class="setting-item">
                <label class="setting-label">
                  <span class="label-text">文字颜色</span>
                  <input
                    type="color"
                    v-model="uiStore.loginCustomization.footer.textColor"
                    class="color-input"
                  />
                </label>
              </div>
            </div>

            <div class="setting-group">
              <h3>登录页背景设置</h3>
              <div class="setting-item">
                <label class="setting-label">
                  <span class="label-text">背景类型</span>
                  <select v-model="uiStore.loginCustomization.background.type" class="form-select">
                    <option value="gradient">渐变色</option>
                    <option value="solid">纯色</option>
                    <option value="image">图片</option>
                  </select>
                </label>
              </div>
              <div v-if="uiStore.loginCustomization.background.type === 'gradient'" class="setting-item">
                <label class="setting-label">
                  <span class="label-text">渐变样式</span>
                  <input
                    type="text"
                    v-model="uiStore.loginCustomization.background.gradient"
                    class="form-input"
                    placeholder="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  />
                </label>
              </div>
              <div v-if="uiStore.loginCustomization.background.type === 'solid'" class="setting-item">
                <label class="setting-label">
                  <span class="label-text">背景颜色</span>
                  <input
                    type="color"
                    v-model="uiStore.loginCustomization.background.solidColor"
                    class="color-input"
                  />
                </label>
              </div>
              <div v-if="uiStore.loginCustomization.background.type === 'image'" class="setting-item">
                <label class="setting-label">
                  <span class="label-text">图片URL</span>
                  <input
                    type="url"
                    v-model="uiStore.loginCustomization.background.imageUrl"
                    class="form-input"
                    placeholder="https://example.com/background.jpg"
                  />
                </label>
              </div>
            </div>

            <div class="setting-group">
              <h3>预览和操作</h3>
              <div class="login-preview">
                <div class="preview-container" :style="getLoginBackgroundStyle()">
                  <div class="preview-card">
                    <div class="preview-header" :style="getLoginHeaderStyle()">
                      <h4>{{ uiStore.loginCustomization.header.title }}</h4>
                      <p>{{ uiStore.loginCustomization.header.subtitle }}</p>
                    </div>
                    <div class="preview-form">
                      <div class="form-group">
                        <input type="text" placeholder="API Token" class="form-input" disabled />
                      </div>
                      <button class="btn btn-primary" disabled>登录</button>
                    </div>
                    <div class="preview-footer" :style="getLoginFooterStyle()">
                      <div v-if="uiStore.loginCustomization.footer.showFeatures">
                        <h5>功能特性</h5>
                        <ul>
                          <li v-for="feature in uiStore.loginCustomization.footer.features.slice(0, 3)" :key="feature">
                            {{ feature }}
                          </li>
                        </ul>
                      </div>
                      <div v-if="uiStore.loginCustomization.footer.customText">
                        <p>{{ uiStore.loginCustomization.footer.customText }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="preview-actions">
                <button @click="resetLoginCustomization" class="btn btn-secondary">重置为默认</button>
                <button @click="previewLogin" class="btn btn-primary">预览登录页</button>
              </div>
            </div>
          </div>

          <!-- Server Settings -->
          <div v-show="activeTab === 'server'" class="settings-section">
            <div class="setting-group">
              <h3>服务器连接</h3>
              <div class="setting-item">
                <label class="setting-label">
                  <span class="label-text">服务器地址</span>
                  <input
                    type="url"
                    v-model="settings.server.url"
                    class="form-input"
                    placeholder="http://localhost:3000"
                    readonly
                  />
                </label>
              </div>
              <div class="setting-item">
                <label class="setting-label">
                  <span class="label-text">连接超时 (秒)</span>
                  <input
                    type="number"
                    v-model.number="settings.server.timeout"
                    class="form-input"
                    min="5"
                    max="300"
                  />
                </label>
              </div>
              <div class="setting-item">
                <label class="setting-label">
                  <span class="label-text">重试次数</span>
                  <input
                    type="number"
                    v-model.number="settings.server.retries"
                    class="form-input"
                    min="0"
                    max="10"
                  />
                </label>
              </div>
            </div>

            <div class="setting-group">
              <h3>API 设置</h3>
              <div class="setting-item">
                <label class="setting-label checkbox-label">
                  <input
                    type="checkbox"
                    v-model="settings.server.enableCompression"
                  />
                  <span class="checkmark"></span>
                  <span class="label-text">启用压缩</span>
                </label>
              </div>
              <div class="setting-item">
                <label class="setting-label checkbox-label">
                  <input
                    type="checkbox"
                    v-model="settings.server.enableCaching"
                  />
                  <span class="checkmark"></span>
                  <span class="label-text">启用缓存</span>
                </label>
              </div>
              <div class="setting-item">
                <label class="setting-label">
                  <span class="label-text">缓存过期时间 (分钟)</span>
                  <input
                    type="number"
                    v-model.number="settings.server.cacheExpiry"
                    class="form-input"
                    :disabled="!settings.server.enableCaching"
                    min="1"
                    max="1440"
                  />
                </label>
              </div>
            </div>

            <div class="setting-group">
              <h3>连接测试</h3>
              <div class="connection-test">
                <button @click="testConnection" class="btn btn-primary" :disabled="isTestingConnection">
                  <span v-if="isTestingConnection" class="loading"></span>
                  {{ isTestingConnection ? '测试中...' : '测试连接' }}
                </button>
                <div v-if="connectionResult" class="test-result">
                  <span :class="['status-badge', connectionResult.success ? 'status-success' : 'status-error']">
                    {{ connectionResult.success ? '连接成功' : '连接失败' }}
                  </span>
                  <span class="test-details">{{ connectionResult.message }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Security Settings -->
          <div v-show="activeTab === 'security'" class="settings-section">
            <div class="setting-group">
              <h3>认证设置</h3>
              <div class="setting-item">
                <label class="setting-label checkbox-label">
                  <input
                    type="checkbox"
                    v-model="settings.security.rememberLogin"
                  />
                  <span class="checkmark"></span>
                  <span class="label-text">记住登录状态</span>
                </label>
              </div>
              <div class="setting-item">
                <label class="setting-label">
                  <span class="label-text">会话超时 (分钟)</span>
                  <input
                    type="number"
                    v-model.number="settings.security.sessionTimeout"
                    class="form-input"
                    min="5"
                    max="1440"
                  />
                </label>
              </div>
              <div class="setting-item">
                <label class="setting-label checkbox-label">
                  <input
                    type="checkbox"
                    v-model="settings.security.autoLogout"
                  />
                  <span class="checkmark"></span>
                  <span class="label-text">空闲时自动登出</span>
                </label>
              </div>
            </div>

            <div class="setting-group">
              <h3>安全选项</h3>
              <div class="setting-item">
                <label class="setting-label checkbox-label">
                  <input
                    type="checkbox"
                    v-model="settings.security.enableEncryption"
                  />
                  <span class="checkmark"></span>
                  <span class="label-text">启用端到端加密</span>
                </label>
              </div>
              <div class="setting-item">
                <label class="setting-label checkbox-label">
                  <input
                    type="checkbox"
                    v-model="settings.security.verifySSL"
                  />
                  <span class="checkmark"></span>
                  <span class="label-text">验证 SSL 证书</span>
                </label>
              </div>
              <div class="setting-item">
                <label class="setting-label checkbox-label">
                  <input
                    type="checkbox"
                    v-model="settings.security.logSensitiveActions"
                  />
                  <span class="checkmark"></span>
                  <span class="label-text">记录敏感操作</span>
                </label>
              </div>
            </div>

            <div class="setting-group">
              <h3>Token 管理</h3>
              <div class="setting-item">
                <div class="token-info">
                  <div class="token-status">
                    <span class="label-text">当前 Token:</span>
                    <span class="token-value">{{ maskedToken }}</span>
                    <span :class="['status-badge', 'status-success']">有效</span>
                  </div>
                  <button @click="refreshToken" class="btn btn-sm btn-secondary">
                    刷新 Token
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Performance Settings -->
          <div v-show="activeTab === 'performance'" class="settings-section">
            <div class="setting-group">
              <h3>性能优化</h3>
              <div class="setting-item">
                <label class="setting-label">
                  <span class="label-text">页面大小</span>
                  <select v-model="settings.performance.pageSize" class="form-select">
                    <option value="10">10 条/页</option>
                    <option value="25">25 条/页</option>
                    <option value="50">50 条/页</option>
                    <option value="100">100 条/页</option>
                  </select>
                </label>
              </div>
              <div class="setting-item">
                <label class="setting-label">
                  <span class="label-text">刷新间隔 (秒)</span>
                  <input
                    type="number"
                    v-model.number="settings.performance.refreshInterval"
                    class="form-input"
                    min="5"
                    max="300"
                  />
                </label>
              </div>
              <div class="setting-item">
                <label class="setting-label checkbox-label">
                  <input
                    type="checkbox"
                    v-model="settings.performance.enableLazyLoading"
                  />
                  <span class="checkmark"></span>
                  <span class="label-text">启用懒加载</span>
                </label>
              </div>
              <div class="setting-item">
                <label class="setting-label checkbox-label">
                  <input
                    type="checkbox"
                    v-model="settings.performance.enableVirtualScrolling"
                  />
                  <span class="checkmark"></span>
                  <span class="label-text">启用虚拟滚动</span>
                </label>
              </div>
            </div>

            <div class="setting-group">
              <h3>缓存管理</h3>
              <div class="cache-info">
                <div class="cache-stats">
                  <div class="stat-item">
                    <span class="stat-label">缓存大小:</span>
                    <span class="stat-value">2.4 MB</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">缓存项目:</span>
                    <span class="stat-value">156 个</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">命中率:</span>
                    <span class="stat-value">87%</span>
                  </div>
                </div>
                <div class="cache-actions">
                  <button @click="clearCache" class="btn btn-sm btn-danger">清空缓存</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Success Toast -->
    <div v-if="showToast" class="toast" :class="{ show: showToast }">
      <div class="toast-content">
        <span class="toast-icon">✅</span>
        <span class="toast-message">{{ toastMessage }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { useUIStore } from '../stores/ui.js'

const router = useRouter()
const authStore = useAuthStore()
const uiStore = useUIStore()

const activeTab = ref('general')
const isSaving = ref(false)
const isTestingConnection = ref(false)
const connectionResult = ref(null)
const showToast = ref(false)
const toastMessage = ref('')
const hasChanges = ref(false)

const tabs = ref([
  { id: 'general', name: '常规', icon: '⚙️' },
  { id: 'theme', name: '主题', icon: '🎨' },
  { id: 'login', name: '登录界面', icon: '🖼️' },
  { id: 'server', name: '服务器', icon: '🌐' },
  { id: 'security', name: '安全', icon: '🔒' },
  { id: 'performance', name: '性能', icon: '⚡' }
])

const settings = ref({
  general: {
    language: 'zh-CN',
    theme: 'light',
    timeFormat: '24h',
    showWelcomeMessage: true,
    showNotifications: true,
    autoSave: true
  },
  server: {
    url: import.meta.env.VITE_MILOMCP_API_URL || 'http://localhost:3000',
    timeout: 30,
    retries: 3,
    enableCompression: true,
    enableCaching: true,
    cacheExpiry: 60
  },
  security: {
    rememberLogin: true,
    sessionTimeout: 60,
    autoLogout: true,
    enableEncryption: true,
    verifySSL: true,
    logSensitiveActions: true
  },
  performance: {
    pageSize: 25,
    refreshInterval: 30,
    enableLazyLoading: true,
    enableVirtualScrolling: false
  }
})

// Store original settings for comparison
const originalSettings = ref(JSON.parse(JSON.stringify(settings.value)))

const maskedToken = computed(() => {
  const token = authStore.token
  if (!token) return 'No token'
  return token.substring(0, 8) + '...' + token.substring(token.length - 8)
})

// Watch for changes in settings
watch(settings, () => {
  hasChanges.value = JSON.stringify(settings.value) !== JSON.stringify(originalSettings.value)
}, { deep: true })

// Watch for changes in UI store (theme preview or login customization)
watch([() => uiStore.previewTheme, () => uiStore.loginCustomization], () => {
  // 如果有预览主题或login自定义有变化，标记为有更改
  hasChanges.value = hasChanges.value || !!uiStore.previewTheme || hasLoginCustomizationChanges()
}, { deep: true })

// 检查login自定义是否有变化
const hasLoginCustomizationChanges = () => {
  const savedUISettings = localStorage.getItem('milomcp_ui_settings')
  if (!savedUISettings) return true
  
  try {
    const parsed = JSON.parse(savedUISettings)
    return JSON.stringify(uiStore.loginCustomization) !== JSON.stringify(parsed.loginCustomization || {})
  } catch {
    return true
  }
}

const saveSettings = async () => {
  isSaving.value = true
  
  try {
    // Simulate API call to save settings
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 保存常规设置到localStorage
    localStorage.setItem('milomcp_settings', JSON.stringify(settings.value))
    
    // 如果有预览主题，确认应用主题
    if (uiStore.previewTheme) {
      uiStore.setTheme(uiStore.previewTheme)
    }
    
    // 保存UI store数据
    uiStore.saveToLocalStorage()
    
    // Update original settings
    originalSettings.value = JSON.parse(JSON.stringify(settings.value))
    hasChanges.value = false
    
    showToastMessage('设置已保存')
  } catch (error) {
    showToastMessage('保存失败: ' + error.message)
  } finally {
    isSaving.value = false
  }
}

const resetSettings = () => {
  if (confirm('确定要重置所有设置到默认值吗？此操作不可撤销。')) {
    // Reset to default values
    settings.value = {
      general: {
        language: 'zh-CN',
        theme: 'light',
        timeFormat: '24h',
        showWelcomeMessage: true,
        showNotifications: true,
        autoSave: true
      },
      server: {
        url: 'http://localhost:3000',
        timeout: 30,
        retries: 3,
        enableCompression: true,
        enableCaching: true,
        cacheExpiry: 60
      },
      security: {
        rememberLogin: true,
        sessionTimeout: 60,
        autoLogout: true,
        enableEncryption: true,
        verifySSL: true,
        logSensitiveActions: true
      },
      performance: {
        pageSize: 25,
        refreshInterval: 30,
        enableLazyLoading: true,
        enableVirtualScrolling: false
      }
    }
    showToastMessage('设置已重置为默认值')
  }
}

const exportSettings = () => {
  const dataStr = JSON.stringify(settings.value, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'milomcp-studio-settings.json'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  showToastMessage('设置已导出')
}

const testConnection = async () => {
  isTestingConnection.value = true
  connectionResult.value = null
  
  try {
    // Simulate connection test
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Simulate result (80% success rate)
    const success = Math.random() > 0.2
    
    connectionResult.value = {
      success,
      message: success 
        ? '连接成功，服务器响应正常' 
        : '连接失败，请检查服务器地址和网络状态'
    }
  } catch (error) {
    connectionResult.value = {
      success: false,
      message: '连接测试出错: ' + error.message
    }
  } finally {
    isTestingConnection.value = false
  }
}

const refreshToken = () => {
  if (confirm('确定要刷新 Token 吗？这将使当前会话失效。')) {
    showToastMessage('Token 刷新功能暂未实现')
  }
}

const clearCache = () => {
  if (confirm('确定要清空所有缓存吗？这可能会影响应用性能。')) {
    // Simulate cache clearing
    setTimeout(() => {
      showToastMessage('缓存已清空')
    }, 500)
  }
}

const showToastMessage = (message) => {
  toastMessage.value = message
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 3000)
}

const handleLogout = () => {
  authStore.logout()
  router.push({ name: 'Login' })
}

// 主题相关方法
const getThemePreviewStyle = (themeData) => {
  return {
    background: `linear-gradient(135deg, ${themeData.colors.primary} 0%, ${themeData.colors.secondary} 100%)`,
    color: themeData.colors.text
  }
}

// Login自定义相关方法
const addFeature = () => {
  uiStore.loginCustomization.footer.features.push('🆕 新功能特性')
}

const removeFeature = (index) => {
  uiStore.loginCustomization.footer.features.splice(index, 1)
}

const getLoginBackgroundStyle = () => {
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
        backgroundPosition: 'center'
      }
    default:
      return { background: bg.gradient }
  }
}

const getLoginHeaderStyle = () => {
  return {
    backgroundColor: uiStore.loginCustomization.header.backgroundColor,
    color: uiStore.loginCustomization.header.textColor
  }
}

const getLoginFooterStyle = () => {
  return {
    backgroundColor: uiStore.loginCustomization.footer.backgroundColor,
    color: uiStore.loginCustomization.footer.textColor
  }
}

const resetLoginCustomization = () => {
  if (confirm('确定要重置登录页面自定义设置吗？')) {
    uiStore.resetLoginCustomization()
    showToastMessage('登录页面设置已重置')
  }
}

const previewLogin = () => {
  // 在新窗口中打开登录页面进行预览
  const loginUrl = window.location.origin + '/login'
  window.open(loginUrl, '_blank')
}

onMounted(() => {
  console.log('🔧 Settings页面挂载，开始初始化...')
  
  // Initialize UI store
  uiStore.init()
  
  // 添加调试日志验证currentPreviewTheme是否可用
  console.log('🎨 UI Store初始化后状态：')
  console.log('- currentPreviewTheme:', uiStore.currentPreviewTheme)
  console.log('- currentPreviewTheme存在:', !!uiStore.currentPreviewTheme)
  console.log('- currentPreviewTheme.colors存在:', !!(uiStore.currentPreviewTheme && uiStore.currentPreviewTheme.colors))
  
  // Load saved settings from localStorage
  const savedSettings = localStorage.getItem('milomcp_settings')
  if (savedSettings) {
    try {
      const parsed = JSON.parse(savedSettings)
      settings.value = { ...settings.value, ...parsed }
      originalSettings.value = JSON.parse(JSON.stringify(settings.value))
      console.log('✅ 成功加载保存的设置')
    } catch (error) {
      console.error('❌ 加载设置失败:', error)
    }
  }
  
  console.log('🔧 Settings页面初始化完成')
})
</script>

<style scoped>
.settings {
  min-height: 100vh;
  background-color: #f7fafc;
}

.navbar {
  background: white;
  border-bottom: 1px solid #e2e8f0;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.navbar-brand h1 {
  font-size: 20px;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
}

.navbar-nav {
  display: flex;
  align-items: center;
  gap: 20px;
}

.nav-link {
  text-decoration: none;
  color: #718096;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.nav-link:hover {
  color: #2d3748;
  background-color: #f7fafc;
}

.nav-link.active {
  color: #667eea;
  background-color: #eef2ff;
}

.main-content {
  padding: 32px 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
}

.header-content h2 {
  font-size: 28px;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 4px 0;
}

.header-content p {
  color: #718096;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.settings-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 32px;
  background: white;
  border-radius: 8px;
  padding: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.tab-button {
  padding: 12px 20px;
  border: none;
  background: transparent;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #718096;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-button:hover {
  color: #2d3748;
  background-color: #f7fafc;
}

.tab-button.active {
  color: #667eea;
  background-color: #eef2ff;
}

.settings-content {
  background: white;
  border-radius: 8px;
  padding: 32px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.settings-section {
  max-width: 600px;
}

.setting-group {
  margin-bottom: 40px;
}

.setting-group:last-child {
  margin-bottom: 0;
}

.setting-group h3 {
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 20px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #e2e8f0;
}

.setting-item {
  margin-bottom: 20px;
}

.setting-label {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.label-text {
  font-weight: 500;
  color: #2d3748;
  min-width: 140px;
  flex-shrink: 0;
}

.checkbox-label {
  gap: 8px;
}

.checkbox-label .label-text {
  min-width: auto;
}

.checkmark {
  width: 20px;
  height: 20px;
  border: 2px solid #d1d5db;
  border-radius: 4px;
  position: relative;
  transition: all 0.2s ease;
}

.checkbox-label input[type="checkbox"] {
  display: none;
}

.checkbox-label input[type="checkbox"]:checked + .checkmark {
  background-color: #667eea;
  border-color: #667eea;
}

.checkbox-label input[type="checkbox"]:checked + .checkmark::after {
  content: '✓';
  position: absolute;
  top: -2px;
  left: 2px;
  color: white;
  font-size: 14px;
  font-weight: bold;
}

.connection-test {
  display: flex;
  align-items: center;
  gap: 16px;
}

.test-result {
  display: flex;
  align-items: center;
  gap: 8px;
}

.test-details {
  font-size: 14px;
  color: #718096;
}

.token-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: #f7fafc;
  border-radius: 6px;
}

.token-status {
  display: flex;
  align-items: center;
  gap: 12px;
}

.token-value {
  font-family: monospace;
  font-size: 12px;
  background: white;
  padding: 4px 8px;
  border-radius: 4px;
  color: #2d3748;
}

.cache-info {
  padding: 20px;
  background: #f7fafc;
  border-radius: 8px;
}

.cache-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: white;
  border-radius: 6px;
}

.stat-label {
  font-size: 14px;
  color: #718096;
}

.stat-value {
  font-weight: 600;
  color: #2d3748;
}

.cache-actions {
  display: flex;
  justify-content: flex-end;
}

/* 主题选择器样式 */
.theme-selector {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.theme-option {
  cursor: pointer;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px;
  text-align: center;
  transition: all 0.2s ease;
}

.theme-option:hover {
  border-color: #cbd5e0;
  transform: translateY(-2px);
}

.theme-option.active {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.theme-preview {
  width: 100%;
  height: 60px;
  border-radius: 6px;
  margin-bottom: 8px;
  position: relative;
  overflow: hidden;
}

.theme-preview-header {
  height: 20px;
  background: rgba(255, 255, 255, 0.2);
  margin-bottom: 4px;
}

.theme-preview-content {
  height: 36px;
  background: rgba(255, 255, 255, 0.1);
}

.auto-theme {
  background: linear-gradient(135deg, #f7fafc 0%, #f7fafc 50%, #2d3748 50%, #2d3748 100%);
}

.theme-preview-split {
  display: flex;
  height: 100%;
}

.theme-preview-light,
.theme-preview-dark {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 4px;
}

.theme-preview-light {
  background: #f7fafc;
}

.theme-preview-dark {
  background: #2d3748;
}

.theme-name {
  font-size: 12px;
  font-weight: 500;
  color: #4a5568;
}

.theme-preview-large {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 16px;
}

.preview-header {
  padding: 16px;
  text-align: center;
}

.preview-header h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
}

.preview-content {
  padding: 20px;
}

.preview-card {
  padding: 16px;
  border-radius: 6px;
  margin-bottom: 12px;
}

.preview-card p {
  margin: 0 0 8px 0;
  font-size: 14px;
}

.preview-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.preview-buttons .btn {
  font-size: 12px;
  padding: 6px 12px;
}

/* Login自定义样式 */
.feature-editor {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.feature-item {
  display: flex;
  gap: 8px;
  align-items: center;
}

.feature-item .form-input {
  flex: 1;
}

.color-input {
  width: 60px;
  height: 40px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
  background: none;
  padding: 0;
}

.color-input::-webkit-color-swatch-wrapper {
  padding: 0;
}

.color-input::-webkit-color-swatch {
  border: none;
  border-radius: 4px;
}

.login-preview {
  margin-bottom: 20px;
}

.preview-container {
  min-height: 300px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.preview-container .preview-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  width: 100%;
  max-width: 400px;
}

.preview-form {
  padding: 20px;
}

.preview-form .form-group {
  margin-bottom: 16px;
}

.preview-form .form-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

.preview-form .btn {
  width: 100%;
  padding: 12px;
  font-size: 14px;
  font-weight: 500;
}

.preview-footer {
  padding: 16px 20px;
  font-size: 12px;
}

.preview-footer h5 {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
}

.preview-footer ul {
  margin: 0;
  padding-left: 16px;
  list-style-type: disc;
}

.preview-footer li {
  margin-bottom: 4px;
}

.preview-footer p {
  margin: 8px 0 0 0;
  line-height: 1.4;
}

.preview-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.toast {
  position: fixed;
  top: 20px;
  right: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  transform: translateX(100%);
  transition: transform 0.3s ease;
}

.toast.show {
  transform: translateX(0);
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
}

.toast-icon {
  font-size: 20px;
}

.toast-message {
  font-weight: 500;
  color: #2d3748;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .header-actions {
    justify-content: flex-start;
    flex-wrap: wrap;
  }

  .settings-tabs {
    flex-wrap: wrap;
  }

  .settings-content {
    padding: 20px;
  }

  .setting-label {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .label-text {
    min-width: auto;
  }

  .connection-test {
    flex-direction: column;
    align-items: flex-start;
  }

  .token-info {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .cache-stats {
    grid-template-columns: 1fr;
  }

  .theme-selector {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  }

  .preview-actions {
    flex-direction: column;
  }

  .feature-item {
    flex-direction: column;
    align-items: stretch;
  }

  .feature-item .form-input {
    margin-bottom: 8px;
  }

  .login-preview .preview-container {
    min-height: 250px;
  }

  .preview-container .preview-card {
    max-width: 100%;
    margin: 0 16px;
  }
}
</style>