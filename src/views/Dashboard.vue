<template>
  <div>
    <div class="welcome-section">
      <h2>欢迎使用 MiloMCP Studio</h2>
      <p>高性能、优雅、轻量的 MiloMCP 管理平台</p>
    </div>

    <el-row :gutter="24" class="stats-section">
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon tools">
              <el-icon size="24"><Tools /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.toolsCount }}</div>
              <div class="stat-label">工具总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon users">
              <el-icon size="24"><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.usersCount }}</div>
              <div class="stat-label">用户总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon connections">
              <el-icon size="24"><Connection /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.connectionsCount }}</div>
              <div class="stat-label">活跃连接</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon server" :class="{ offline: serverStatus === '离线' }">
              <el-icon size="24"><Monitor /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ serverStatus }}</div>
              <div class="stat-label">服务状态</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="24" class="content-section">
      <el-col :xs="24" :lg="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>服务器信息</span>
              <el-icon><Monitor /></el-icon>
            </div>
          </template>
          <div class="info-list">
            <div class="info-item">
              <span class="label">服务器地址</span>
              <span class="value">{{ serverInfo.url }}</span>
            </div>
            <div class="info-item">
              <span class="label">运行时间</span>
              <span class="value">{{ serverInfo.uptime }}</span>
            </div>
            <div class="info-item">
              <span class="label">版本信息</span>
              <span class="value">{{ serverInfo.version }}</span>
            </div>
            <div class="info-item">
              <span class="label">认证状态</span>
              <el-tag
                :type="authStore.isAuthenticated ? 'success' : 'danger'"
                size="small"
              >
                {{ authStore.isAuthenticated ? '已认证' : '未认证' }}
              </el-tag>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>MCP 客户端配置</span>
              <el-icon><Document /></el-icon>
            </div>
          </template>
          <div class="mcp-config-content">
            <p class="config-description">
              复制以下 JSON 配置以在 MCP 客户端中使用，推荐使用Cherry-Studio-1.5.6+。
            </p>
            <div class="config-options">
              <el-radio-group v-model="configType" size="small">
                <el-radio-button label="sse">SSE</el-radio-button>
                <el-radio-button label="streamableHttp">StreamableHttp</el-radio-button>
              </el-radio-group>
            </div>
            <div class="config-json-container">
              <pre class="config-json">{{ formattedConfig }}</pre>
              <el-button
                type="primary"
                size="small"
                class="copy-button"
                @click="copyConfig"
                :loading="isCopying"
              >
                <el-icon><DocumentCopy /></el-icon>
                {{ copyButtonText }}
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { ElMessage } from 'element-plus'
import {
  Tools, User, Connection, Monitor, Document, DocumentCopy
} from '@element-plus/icons-vue'
import { defaultClient } from '../api/client.js'

const router = useRouter()
const authStore = useAuthStore()

const isLoading = ref(false)
const serverStatus = ref('运行中')
const configType = ref('sse')
const isCopying = ref(false)
const copyButtonText = ref('复制配置')

const stats = reactive({
  toolsCount: 0,
  usersCount: 0,
  connectionsCount: 0
})

const serverInfo = reactive({
  url: defaultClient.baseURL,
  uptime: '0分钟',
  version: 'v1.0.0'
})

const formattedConfig = computed(() => {
  const baseUrl = serverInfo.url
  const token = authStore.token
  const appTitle = 'MiloMCP Studio'
  
  if (!token) {
    return JSON.stringify({
      mcpServers: {
        [appTitle]: {
          type: configType.value,
          url: `${baseUrl}${configType.value === 'sse' ? '/sse' : '/mcp'}`,
          headers: {
            Authorization: 'Bearer <your-token-here>'
          }
        }
      }
    }, null, 2)
  }

  return JSON.stringify({
    mcpServers: {
      [appTitle]: {
        type: configType.value,
        url: `${baseUrl}${configType.value === 'sse' ? '/sse' : '/mcp'}`,
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    }
  }, null, 2)
})

let refreshInterval = null

const fetchStats = async () => {
  try {
    const health = await defaultClient.getHealth()
    
    if (health) {
      if (health.tools && Array.isArray(health.tools)) {
        stats.toolsCount = health.tools.length
      }
      
      if (health.auth) {
        stats.usersCount = health.auth.totalUsers || 0
        stats.connectionsCount = health.auth.activeConnections || 0
      }
      
      serverStatus.value = health.status === 'ok' ? '运行中' : '异常'
      
      if (health.uptime) {
        const uptimeMinutes = Math.floor(health.uptime / 60)
        if (uptimeMinutes < 60) {
          serverInfo.uptime = `${uptimeMinutes}分钟`
        } else {
          const hours = Math.floor(uptimeMinutes / 60)
          const minutes = uptimeMinutes % 60
          serverInfo.uptime = `${hours}小时${minutes}分钟`
        }
      }
      
      if (health.version) {
        serverInfo.version = health.version
      }
    } else {
      serverStatus.value = '离线'
    }
    
  } catch (error) {
    console.error('Failed to fetch stats:', error)
    serverStatus.value = '离线'
  }
}

const refreshStats = async () => {
  isLoading.value = true
  try {
    await fetchStats()
  } finally {
    setTimeout(() => {
      isLoading.value = false
    }, 500)
  }
}

const copyConfig = async () => {
  isCopying.value = true
  copyButtonText.value = '复制中...'
  
  try {
    await navigator.clipboard.writeText(formattedConfig.value)
    ElMessage.success('配置已复制到剪贴板')
    copyButtonText.value = '已复制!'
    
    setTimeout(() => {
      copyButtonText.value = '复制配置'
    }, 2000)
  } catch (error) {
    console.error('Failed to copy config:', error)
    ElMessage.error('复制失败，请手动选择并复制文本')
    copyButtonText.value = '复制失败'
    
    setTimeout(() => {
      copyButtonText.value = '复制配置'
    }, 2000)
  } finally {
    isCopying.value = false
  }
}

onMounted(async () => {
  await fetchStats()
  refreshInterval = setInterval(fetchStats, 30000)
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>

<style scoped>
.welcome-section {
  text-align: center;
  margin-bottom: 40px;
  padding: 40px 20px;
  background: var(--welcome-bg-color);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05);
}

html.dark .welcome-section {
  border-color: rgba(255, 255, 255, 0.1);
}

.welcome-section h2 {
  font-size: 32px;
  font-weight: 800;
  margin: 0 0 12px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -1px;
}

.welcome-section p {
  font-size: 18px;
  color: var(--el-text-color-regular);
  margin: 0;
  opacity: 0.8;
}

.stats-section {
  margin-bottom: 40px;
}

.stat-card {
  height: 140px;
  border-radius: 16px;
  border: none;
  background: var(--card-bg-color);
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  position: relative;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.12);
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
  height: 100%;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-icon.tools {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.users {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.connections {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon.server {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-icon.server.offline {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: var(--el-text-color-regular);
  margin-top: 4px;
}

.content-section {
  margin-bottom: 32px;
}

.content-section .el-card {
  border-radius: 16px;
  border: none;
  background: var(--card-bg-color);
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.content-section .el-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.12);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.info-item:last-child {
  border-bottom: none;
}

.info-item .label {
  font-size: 14px;
  color: var(--el-text-color-regular);
  font-weight: 500;
}

.info-item .value {
  font-size: 14px;
  color: var(--el-text-color-primary);
  font-weight: 600;
}

.mcp-config-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.config-description {
  margin: 0;
  font-size: 14px;
  color: var(--el-text-color-regular);
}

.config-options {
  display: flex;
  align-items: center;
  gap: 12px;
}

.config-json-container {
  position: relative;
  background: var(--el-fill-color-lighter);
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;
  overflow: hidden;
}

.config-json {
  margin: 0;
  padding: 16px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  line-height: 1.5;
  color: var(--el-text-color-primary);
  background: transparent;
  overflow-x: auto;
  white-space: pre;
}

.copy-button {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 1;
}

@media (max-width: 768px) {
  .dashboard-main {
    padding: 20px;
  }
  
  .welcome-section {
    margin-bottom: 32px;
    padding: 32px 20px;
    border-radius: 16px;
  }
  
  .welcome-section h2 {
    font-size: 28px;
  }
  
  .welcome-section p {
    font-size: 16px;
  }
  
  .stats-section {
    margin-bottom: 32px;
  }
  
  .stat-card {
    margin-bottom: 20px;
    height: 120px;
  }
  
  .stat-content {
    gap: 12px;
  }
  
  .stat-icon {
    width: 48px;
    height: 48px;
  }
  
  .stat-number {
    font-size: 20px;
  }
  
  .content-section {
    margin-bottom: 24px;
  }
  
  .content-section .el-card {
    margin-bottom: 20px;
    border-radius: 12px;
  }
  
  .card-header {
    flex-direction: row;
    gap: 8px;
  }
  
  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
    padding: 12px 0;
  }
  
  .info-item .label {
    font-weight: 600;
    font-size: 13px;
  }
  
  .info-item .value {
    font-size: 14px;
  }
  
  .mcp-config-content {
    gap: 20px;
  }
  
  .config-json {
    font-size: 11px;
    padding: 16px;
    border-radius: 8px;
  }
  
  .copy-button {
    position: static;
    margin-top: 12px;
    width: 100%;
    height: 44px;
    border-radius: 8px;
  }
  
  .config-json-container {
    display: flex;
    flex-direction: column;
    border-radius: 8px;
  }
  
  .config-options {
    justify-content: center;
  }
  
  .config-description {
    text-align: center;
    font-size: 13px;
  }
}
</style>