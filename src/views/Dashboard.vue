<template>
  <div class="dashboard">
    <nav class="navbar">
      <div class="navbar-brand">
        <h1>MiloMCP Studio</h1>
      </div>
      <div class="navbar-nav">
        <RouterLink to="/dashboard" class="nav-link active">仪表板</RouterLink>
        <RouterLink to="/tools" class="nav-link">工具管理</RouterLink>
        <RouterLink to="/users" v-if="authStore.isAdmin" class="nav-link">用户管理</RouterLink>
        <RouterLink to="/settings" class="nav-link">设置</RouterLink>
        <button @click="handleLogout" class="btn btn-sm btn-secondary">退出登录</button>
      </div>
    </nav>

    <main class="main-content">
      <div class="container">
        <div class="dashboard-header">
          <h2>欢迎使用 MiloMCP Studio</h2>
          <p>高性能、优雅、轻量的 MiloMCP 管理平台</p>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">🔧</div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.toolsCount }}</div>
              <div class="stat-label">工具总数</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">👥</div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.usersCount }}</div>
              <div class="stat-label">用户总数</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">📡</div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.connectionsCount }}</div>
              <div class="stat-label">活跃连接</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">⚡</div>
            <div class="stat-content">
              <div class="stat-number">{{ serverStatus }}</div>
              <div class="stat-label">服务状态</div>
            </div>
          </div>
        </div>

        <div class="dashboard-content">
          <div class="content-section">
            <div class="card">
              <div class="card-header">
                <h3>服务器信息</h3>
              </div>
              <div class="card-body">
                <div class="info-grid">
                  <div class="info-item">
                    <label>服务器地址</label>
                    <span>{{ serverInfo.url }}</span>
                  </div>
                  <div class="info-item">
                    <label>运行时间</label>
                    <span>{{ serverInfo.uptime }}</span>
                  </div>
                  <div class="info-item">
                    <label>版本信息</label>
                    <span>{{ serverInfo.version }}</span>
                  </div>
                  <div class="info-item">
                    <label>认证状态</label>
                    <span :class="['status-badge', authStore.isAuthenticated ? 'status-success' : 'status-error']">
                      {{ authStore.isAuthenticated ? '已认证' : '未认证' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="content-section">
            <div class="card">
              <div class="card-header">
                <h3>快速操作</h3>
              </div>
              <div class="card-body">
                <div class="action-buttons">
                  <RouterLink to="/tools" class="btn btn-primary">
                    🛠️ 管理工具
                  </RouterLink>
                  <RouterLink to="/users" v-if="authStore.isAdmin" class="btn btn-primary">
                    👥 管理用户
                  </RouterLink>
                  <RouterLink to="/settings" class="btn btn-secondary">
                    ⚙️ 系统设置
                  </RouterLink>
                  <button @click="refreshStats" class="btn btn-secondary" :disabled="isLoading">
                    <span v-if="isLoading" class="loading"></span>
                    🔄 刷新数据
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

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
    
    // Fetch server health which contains accurate statistics
    const health = await defaultClient.getHealth()
    
    if (health) {
      // Use health endpoint data which contains accurate statistics
      if (health.tools && Array.isArray(health.tools)) {
        stats.toolsCount = health.tools.length
      }
      
      if (health.auth) {
        stats.usersCount = health.auth.totalUsers || 0
        stats.connectionsCount = health.auth.activeConnections || 0
      }
      
      // Update server status and info
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
    // Keep existing stats if API fails
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
  // Initial data fetch
  await fetchStats()
  
  // Set up periodic refresh
  refreshInterval = setInterval(fetchStats, 30000) // Refresh every 30 seconds
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>

<style scoped>
.dashboard {
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

.dashboard-header {
  text-align: center;
  margin-bottom: 40px;
}

.dashboard-header h2 {
  font-size: 32px;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 8px 0;
}

.dashboard-header p {
  font-size: 16px;
  color: #718096;
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  font-size: 32px;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 28px;
  font-weight: 700;
  color: #2d3748;
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: #718096;
  margin-top: 4px;
}

.dashboard-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
}

.content-section {
  width: 100%;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item label {
  font-size: 12px;
  font-weight: 600;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-item span {
  font-size: 14px;
  color: #2d3748;
  font-weight: 500;
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

@media (max-width: 768px) {
  .navbar {
    flex-direction: column;
    height: auto;
    padding: 16px 20px;
  }

  .navbar-nav {
    width: 100%;
    justify-content: space-between;
    margin-top: 12px;
  }

  .dashboard-content {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    justify-content: center;
  }
}
</style>