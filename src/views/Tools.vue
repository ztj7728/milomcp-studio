<template>
  <div class="tools">
    <nav class="navbar">
      <div class="navbar-brand">
        <h1>MiloMCP Studio</h1>
      </div>
      <div class="navbar-nav">
        <RouterLink to="/dashboard" class="nav-link">仪表板</RouterLink>
        <RouterLink to="/tools" class="nav-link active">工具管理</RouterLink>
        <RouterLink to="/users" class="nav-link" v-if="authStore.isAdmin">用户管理</RouterLink>
        <RouterLink to="/settings" class="nav-link">设置</RouterLink>
        <button @click="handleLogout" class="btn btn-sm btn-secondary">退出登录</button>
      </div>
    </nav>

    <main class="main-content">
      <div class="container">
        <div class="page-header">
          <div class="header-content">
            <h2>工具管理</h2>
            <p>管理和监控 MiloMCP 系统工具</p>
          </div>
          <div class="header-actions">
            <button @click="refreshTools" class="btn btn-secondary" :disabled="isLoading">
              <span v-if="isLoading" class="loading"></span>
              🔄 刷新工具
            </button>
            <button @click="reloadAllTools" class="btn btn-primary" :disabled="isLoading">
              ♻️ 重载所有工具
            </button>
          </div>
        </div>

        <div class="tools-stats">
          <div class="stat-card">
            <div class="stat-icon">🛠️</div>
            <div class="stat-content">
              <div class="stat-number">{{ tools.length }}</div>
              <div class="stat-label">总工具数</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">✅</div>
            <div class="stat-content">
              <div class="stat-number">{{ enabledTools }}</div>
              <div class="stat-label">已启用</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">📊</div>
            <div class="stat-content">
              <div class="stat-number">{{ totalCalls }}</div>
              <div class="stat-label">总调用次数</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">⚡</div>
            <div class="stat-content">
              <div class="stat-number">{{ avgResponseTime }}ms</div>
              <div class="stat-label">平均响应时间</div>
            </div>
          </div>
        </div>

        <div class="tools-grid">
          <div v-for="tool in tools" :key="tool.name" class="tool-card">
            <div class="tool-header">
              <div class="tool-info">
                <h3>{{ tool.name }}</h3>
                <p>{{ tool.description }}</p>
              </div>
              <div class="tool-status">
                <span :class="['status-badge', tool.enabled ? 'status-success' : 'status-error']">
                  {{ tool.enabled ? '已启用' : '已禁用' }}
                </span>
              </div>
            </div>

            <div class="tool-details">
              <div class="detail-row">
                <span class="label">类别:</span>
                <span class="value">{{ tool.category }}</span>
              </div>
              <div class="detail-row">
                <span class="label">版本:</span>
                <span class="value">{{ tool.version }}</span>
              </div>
              <div class="detail-row">
                <span class="label">调用次数:</span>
                <span class="value">{{ tool.callCount }}</span>
              </div>
              <div class="detail-row">
                <span class="label">平均响应:</span>
                <span class="value">{{ tool.avgResponseTime }}ms</span>
              </div>
            </div>

            <div class="tool-schema">
              <h4>输入参数</h4>
              <div class="schema-list">
                <div v-for="param in tool.inputSchema?.properties" :key="param.name" class="param-item">
                  <span class="param-name">{{ param.name }}</span>
                  <span class="param-type">{{ param.type }}</span>
                  <span v-if="param.required" class="param-required">必需</span>
                </div>
                <div v-if="!tool.inputSchema?.properties?.length" class="empty-schema">
                  无参数
                </div>
              </div>
            </div>

            <div class="tool-actions">
              <button @click="testTool(tool)" class="btn btn-sm btn-primary">测试工具</button>
              <button @click="reloadTool(tool)" class="btn btn-sm btn-secondary">重载</button>
              <button 
                @click="toggleTool(tool)" 
                :class="['btn', 'btn-sm', tool.enabled ? 'btn-danger' : 'btn-success']"
              >
                {{ tool.enabled ? '禁用' : '启用' }}
              </button>
              <button @click="showToolLogs(tool)" class="btn btn-sm btn-secondary">查看日志</button>
            </div>
          </div>
        </div>

        <div v-if="tools.length === 0" class="empty-state">
          <div class="empty-icon">🛠️</div>
          <h3>暂无工具</h3>
          <p>系统中还没有注册任何工具，请检查 MiloMCP 服务器配置</p>
          <button @click="refreshTools" class="btn btn-primary">刷新工具列表</button>
        </div>
      </div>
    </main>

    <!-- Tool Test Modal -->
    <div v-if="showTestModal" class="modal-overlay" @click="closeTestModal">
      <div class="modal large-modal" @click.stop>
        <div class="modal-header">
          <h3>测试工具: {{ selectedTool?.name }}</h3>
          <button @click="closeTestModal" class="close-btn">✕</button>
        </div>
        <div class="modal-body">
          <div class="test-form">
            <div class="form-group">
              <label class="form-label">输入参数 (JSON)</label>
              <textarea
                v-model="testInput"
                class="form-textarea"
                rows="6"
                placeholder="请输入 JSON 格式的参数..."
              ></textarea>
            </div>
            <div class="test-actions">
              <button @click="runTest" class="btn btn-primary" :disabled="isTestRunning">
                <span v-if="isTestRunning" class="loading"></span>
                {{ isTestRunning ? '运行中...' : '运行测试' }}
              </button>
            </div>
          </div>
          
          <div v-if="testResult" class="test-result">
            <h4>测试结果</h4>
            <div class="result-status">
              <span :class="['status-badge', testResult.success ? 'status-success' : 'status-error']">
                {{ testResult.success ? '成功' : '失败' }}
              </span>
              <span class="response-time">响应时间: {{ testResult.responseTime }}ms</span>
            </div>
            <pre class="result-content">{{ JSON.stringify(testResult.data, null, 2) }}</pre>
          </div>
        </div>
      </div>
    </div>

    <!-- Tool Logs Modal -->
    <div v-if="showLogsModal" class="modal-overlay" @click="closeLogsModal">
      <div class="modal large-modal" @click.stop>
        <div class="modal-header">
          <h3>工具日志: {{ selectedTool?.name }}</h3>
          <button @click="closeLogsModal" class="close-btn">✕</button>
        </div>
        <div class="modal-body">
          <div class="logs-container">
            <div class="logs-header">
              <div class="log-filters">
                <select v-model="logLevel" class="form-select">
                  <option value="all">所有级别</option>
                  <option value="info">信息</option>
                  <option value="warn">警告</option>
                  <option value="error">错误</option>
                </select>
              </div>
              <button @click="refreshLogs" class="btn btn-sm btn-secondary">刷新日志</button>
            </div>
            <div class="logs-content">
              <div v-for="log in filteredLogs" :key="log.id" :class="['log-entry', `log-${log.level}`]">
                <div class="log-timestamp">{{ formatTimestamp(log.timestamp) }}</div>
                <div class="log-level">{{ log.level.toUpperCase() }}</div>
                <div class="log-message">{{ log.message }}</div>
              </div>
              <div v-if="filteredLogs.length === 0" class="no-logs">
                暂无日志记录
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

const router = useRouter()
const authStore = useAuthStore()

const isLoading = ref(false)
const isTestRunning = ref(false)
const showTestModal = ref(false)
const showLogsModal = ref(false)
const selectedTool = ref(null)
const testInput = ref('{}')
const testResult = ref(null)
const logLevel = ref('all')

const tools = ref([
  {
    name: 'calculator',
    description: '基础数学计算工具',
    category: 'utility',
    version: '1.0.0',
    enabled: true,
    callCount: 156,
    avgResponseTime: 12,
    inputSchema: {
      properties: [
        { name: 'expression', type: 'string', required: true },
        { name: 'precision', type: 'number', required: false }
      ]
    }
  },
  {
    name: 'text-processor',
    description: '文本处理和分析工具',
    category: 'text',
    version: '1.2.1',
    enabled: true,
    callCount: 89,
    avgResponseTime: 45,
    inputSchema: {
      properties: [
        { name: 'text', type: 'string', required: true },
        { name: 'operation', type: 'string', required: true },
        { name: 'options', type: 'object', required: false }
      ]
    }
  },
  {
    name: 'uuid-generator',
    description: 'UUID 生成器工具',
    category: 'utility',
    version: '1.0.0',
    enabled: true,
    callCount: 203,
    avgResponseTime: 8,
    inputSchema: {
      properties: [
        { name: 'version', type: 'number', required: false },
        { name: 'count', type: 'number', required: false }
      ]
    }
  },
  {
    name: 'timestamp',
    description: '时间戳处理工具',
    category: 'datetime',
    version: '1.1.0',
    enabled: true,
    callCount: 34,
    avgResponseTime: 15,
    inputSchema: {
      properties: [
        { name: 'format', type: 'string', required: false },
        { name: 'timezone', type: 'string', required: false }
      ]
    }
  },
  {
    name: 'weather',
    description: '天气信息查询工具',
    category: 'api',
    version: '2.0.0',
    enabled: true,
    callCount: 67,
    avgResponseTime: 128,
    inputSchema: {
      properties: [
        { name: 'location', type: 'string', required: true },
        { name: 'units', type: 'string', required: false }
      ]
    }
  }
])

const toolLogs = ref([
  {
    id: 1,
    tool: 'calculator',
    level: 'info',
    message: '计算表达式: 2 + 2 = 4',
    timestamp: new Date(Date.now() - 300000)
  },
  {
    id: 2,
    tool: 'text-processor',
    level: 'info',
    message: '处理文本长度: 256 字符',
    timestamp: new Date(Date.now() - 600000)
  },
  {
    id: 3,
    tool: 'weather',
    level: 'warn',
    message: 'API 响应时间较慢: 1250ms',
    timestamp: new Date(Date.now() - 900000)
  },
  {
    id: 4,
    tool: 'timestamp',
    level: 'error',
    message: '无效的时区参数: invalid/timezone',
    timestamp: new Date(Date.now() - 1200000)
  }
])

const enabledTools = computed(() => tools.value.filter(tool => tool.enabled).length)
const totalCalls = computed(() => tools.value.reduce((sum, tool) => sum + tool.callCount, 0))
const avgResponseTime = computed(() => {
  const total = tools.value.reduce((sum, tool) => sum + (tool.avgResponseTime * tool.callCount), 0)
  return Math.round(total / totalCalls.value) || 0
})

const filteredLogs = computed(() => {
  let logs = toolLogs.value
  if (selectedTool.value) {
    logs = logs.filter(log => log.tool === selectedTool.value.name)
  }
  if (logLevel.value !== 'all') {
    logs = logs.filter(log => log.level === logLevel.value)
  }
  return logs.sort((a, b) => b.timestamp - a.timestamp)
})

const formatTimestamp = (timestamp) => {
  return new Date(timestamp).toLocaleString('zh-CN')
}

const refreshTools = async () => {
  isLoading.value = true
  // Simulate API call to refresh tools
  setTimeout(() => {
    isLoading.value = false
  }, 1000)
}

const reloadAllTools = async () => {
  isLoading.value = true
  // Simulate API call to reload all tools
  setTimeout(() => {
    isLoading.value = false
    // Show success message
    alert('所有工具已成功重载')
  }, 2000)
}

const reloadTool = async (tool) => {
  // Simulate tool reload
  alert(`工具 "${tool.name}" 已重载`)
}

const toggleTool = (tool) => {
  tool.enabled = !tool.enabled
  const status = tool.enabled ? '启用' : '禁用'
  alert(`工具 "${tool.name}" 已${status}`)
}

const testTool = (tool) => {
  selectedTool.value = tool
  testInput.value = JSON.stringify({}, null, 2)
  testResult.value = null
  showTestModal.value = true
}

const runTest = async () => {
  isTestRunning.value = true
  
  try {
    // Parse input
    const input = JSON.parse(testInput.value)
    
    // Simulate tool execution
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))
    
    // Simulate result
    const success = Math.random() > 0.2 // 80% success rate
    const responseTime = Math.round(50 + Math.random() * 200)
    
    testResult.value = {
      success,
      responseTime,
      data: success 
        ? { result: `Test result for ${selectedTool.value.name}`, input }
        : { error: 'Tool execution failed', code: 'EXECUTION_ERROR' }
    }
    
    // Update tool stats
    selectedTool.value.callCount++
    selectedTool.value.avgResponseTime = Math.round(
      (selectedTool.value.avgResponseTime * (selectedTool.value.callCount - 1) + responseTime) / selectedTool.value.callCount
    )
    
  } catch (error) {
    testResult.value = {
      success: false,
      responseTime: 0,
      data: { error: 'Invalid JSON input', message: error.message }
    }
  } finally {
    isTestRunning.value = false
  }
}

const showToolLogs = (tool) => {
  selectedTool.value = tool
  logLevel.value = 'all'
  showLogsModal.value = true
}

const refreshLogs = () => {
  // Simulate log refresh
  alert('日志已刷新')
}

const closeTestModal = () => {
  showTestModal.value = false
  selectedTool.value = null
  testInput.value = '{}'
  testResult.value = null
}

const closeLogsModal = () => {
  showLogsModal.value = false
  selectedTool.value = null
}

const handleLogout = () => {
  authStore.logout()
  router.push({ name: 'Login' })
}

onMounted(() => {
  refreshTools()
})
</script>

<style scoped>
.tools {
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

.tools-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-icon {
  font-size: 24px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eef2ff;
  border-radius: 8px;
}

.stat-number {
  font-size: 20px;
  font-weight: 700;
  color: #2d3748;
}

.stat-label {
  font-size: 12px;
  color: #718096;
  margin-top: 2px;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
}

.tool-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.2s ease;
}

.tool-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.tool-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.tool-info h3 {
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 4px 0;
}

.tool-info p {
  color: #718096;
  font-size: 14px;
  margin: 0;
}

.tool-details {
  margin-bottom: 16px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

.detail-row .label {
  color: #718096;
}

.detail-row .value {
  font-weight: 500;
  color: #2d3748;
}

.tool-schema {
  margin-bottom: 20px;
}

.tool-schema h4 {
  font-size: 14px;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 8px 0;
}

.schema-list {
  background: #f7fafc;
  border-radius: 6px;
  padding: 12px;
}

.param-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
  font-size: 12px;
}

.param-name {
  font-weight: 500;
  color: #2d3748;
}

.param-type {
  background: #e2e8f0;
  padding: 2px 6px;
  border-radius: 4px;
  color: #4a5568;
}

.param-required {
  background: #fed7d7;
  color: #c53030;
  padding: 2px 6px;
  border-radius: 4px;
}

.empty-schema {
  color: #718096;
  font-size: 12px;
  font-style: italic;
}

.tool-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.empty-state h3 {
  font-size: 20px;
  color: #2d3748;
  margin: 0 0 8px 0;
}

.empty-state p {
  color: #718096;
  margin: 0 0 24px 0;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.large-modal {
  max-width: 800px;
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #718096;
}

.modal-body {
  padding: 20px;
}

.test-form {
  margin-bottom: 24px;
}

.test-actions {
  margin-top: 16px;
}

.test-result {
  border-top: 1px solid #e2e8f0;
  padding-top: 24px;
}

.test-result h4 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 12px 0;
}

.result-status {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.response-time {
  font-size: 12px;
  color: #718096;
}

.result-content {
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 12px;
  overflow-x: auto;
  font-size: 12px;
  max-height: 300px;
}

.logs-container {
  max-height: 500px;
}

.logs-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.logs-content {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
}

.log-entry {
  padding: 8px 12px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  gap: 12px;
  font-size: 12px;
}

.log-entry:last-child {
  border-bottom: none;
}

.log-info {
  background: #f0f9ff;
}

.log-warn {
  background: #fffbeb;
}

.log-error {
  background: #fef2f2;
}

.log-timestamp {
  color: #64748b;
  flex-shrink: 0;
  width: 120px;
}

.log-level {
  font-weight: 600;
  flex-shrink: 0;
  width: 50px;
}

.log-message {
  flex: 1;
  color: #334155;
}

.no-logs {
  padding: 40px;
  text-align: center;
  color: #718096;
  font-style: italic;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .header-actions {
    justify-content: flex-start;
  }

  .tools-stats {
    grid-template-columns: 1fr;
  }

  .tools-grid {
    grid-template-columns: 1fr;
  }

  .tool-actions {
    flex-direction: column;
  }

  .modal {
    margin: 20px;
    width: calc(100% - 40px);
  }
}
</style>