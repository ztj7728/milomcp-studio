<template>
  <el-container class="dashboard-layout">
    <el-header class="dashboard-header">
      <div class="header-left">
        <h1 class="brand-title">MiloMCP Studio</h1>
      </div>
      <div class="header-nav">
        <el-menu mode="horizontal" :default-active="$route.name" router>
          <el-menu-item index="Dashboard">仪表板</el-menu-item>
          <el-menu-item index="Tools">工具管理</el-menu-item>
          <el-menu-item v-if="authStore.isAdmin" index="Users">用户管理</el-menu-item>
          <el-menu-item index="Settings">设置</el-menu-item>
        </el-menu>
        <el-button type="primary" @click="handleLogout" size="small">
          <el-icon><SwitchButton /></el-icon>
          退出登录
        </el-button>
      </div>
    </el-header>

    <el-main class="dashboard-main">
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
                <span>快速操作</span>
                <el-icon><Setting /></el-icon>
              </div>
            </template>
            <div class="action-buttons">
              <el-button type="primary" @click="$router.push('/tools')">
                <el-icon><Tools /></el-icon>
                管理工具
              </el-button>
              <el-button v-if="authStore.isAdmin" type="primary" @click="$router.push('/users')">
                <el-icon><User /></el-icon>
                管理用户
              </el-button>
              <el-button @click="$router.push('/settings')">
                <el-icon><Setting /></el-icon>
                系统设置
              </el-button>
              <el-button @click="refreshStats" :loading="isLoading">
                <el-icon><Refresh /></el-icon>
                刷新数据
              </el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-main>
  </el-container>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { 
  Tools, User, Connection, Monitor, Setting, SwitchButton, Refresh 
} from '@element-plus/icons-vue'

const router = useRouter()
const authStore = useAuthStore()

const isLoading = ref(false)
const serverStatus = ref('运行中')

const stats = reactive({
  toolsCount: 0,
  usersCount: 0,
  connectionsCount: 0
})

const serverInfo = reactive({
  url: import.meta.env.VITE_MILOMCP_API_URL || 'http://localhost:3000',
  uptime: '0分钟',
  version: 'v1.0.0'
})

let refreshInterval = null

const fetchStats = async () => {
  try {
    const { defaultClient } = await import('../api/client.js')
    
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

const handleLogout = async () => {
  authStore.logout()
  router.push({ name: 'Login' })
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
.dashboard-layout {
  height: 100vh;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color);
}

.header-left .brand-title {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  color: var(--el-text-color-primary);
}

.header-nav {
  display: flex;
  align-items: center;
  gap: 24px;
}

.dashboard-main {
  padding: 24px;
  background: var(--el-bg-color-page);
}

.welcome-section {
  text-align: center;
  margin-bottom: 32px;
}

.welcome-section h2 {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: var(--el-text-color-primary);
}

.welcome-section p {
  font-size: 16px;
  color: var(--el-text-color-regular);
  margin: 0;
}

.stats-section {
  margin-bottom: 32px;
}

.stat-card {
  height: 120px;
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
  margin-bottom: 24px;
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

.action-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    padding: 16px 24px;
    gap: 16px;
  }

  .header-nav {
    width: 100%;
    justify-content: space-between;
  }

  .dashboard-main {
    padding: 16px;
  }

  .action-buttons {
    grid-template-columns: 1fr;
  }
}
</style>