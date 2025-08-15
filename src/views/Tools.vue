<template>
  <div>
    <el-container class="tools-layout">
    <el-header class="tools-header">
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

    <el-main class="tools-main">
        <div class="page-header">
          <div>
            <h2>工具管理</h2>
            <p>管理和监控 MiloMCP 系统工具</p>
          </div>
          <div class="header-actions">
            <el-button @click="refreshTools" :loading="isLoading" type="default">
              <el-icon><Refresh /></el-icon>
              刷新工具
            </el-button>
            <el-button @click="reloadAllTools" :loading="isLoading" type="primary">
              <el-icon><RefreshRight /></el-icon>
              重载所有工具
            </el-button>
          </div>
        </div>

        <el-row :gutter="20" class="stats-row">
          <el-col :xs="12" :sm="6">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-icon">🛠️</div>
                <div>
                  <div class="stat-number">{{ tools.length }}</div>
                  <div class="stat-label">总工具数</div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :xs="12" :sm="6">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-icon">✅</div>
                <div>
                  <div class="stat-number">{{ enabledTools }}</div>
                  <div class="stat-label">已启用</div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :xs="12" :sm="6">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-icon">📊</div>
                <div>
                  <div class="stat-number">{{ totalCalls }}</div>
                  <div class="stat-label">总调用次数</div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :xs="12" :sm="6">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-icon">⚡</div>
                <div>
                  <div class="stat-number">{{ avgResponseTime }}ms</div>
                  <div class="stat-label">平均响应时间</div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col v-for="tool in tools" :key="tool.name" :xs="24" :sm="12" :lg="8">
            <el-card class="tool-card">
              <template #header>
                <div class="tool-header">
                  <div>
                    <h3>{{ tool.name }}</h3>
                    <p>{{ tool.description }}</p>
                  </div>
                  <el-tag :type="tool.enabled ? 'success' : 'danger'">
                    {{ tool.enabled ? '已启用' : '已禁用' }}
                  </el-tag>
                </div>
              </template>

              <div class="tool-details">
                <el-descriptions :column="1" size="small">
                  <el-descriptions-item label="类别">{{ tool.category }}</el-descriptions-item>
                  <el-descriptions-item label="版本">{{ tool.version }}</el-descriptions-item>
                  <el-descriptions-item label="调用次数">{{ tool.callCount }}</el-descriptions-item>
                  <el-descriptions-item label="平均响应">{{ tool.avgResponseTime }}ms</el-descriptions-item>
                </el-descriptions>
              </div>

              <div class="tool-schema">
                <h4>输入参数</h4>
                <div class="schema-list">
                  <el-tag
                    v-for="param in tool.inputSchema?.properties"
                    :key="param.name"
                    size="small"
                    class="param-tag"
                  >
                    {{ param.name }} ({{ param.type }})
                    <el-icon v-if="param.required" color="#f56c6c"><StarFilled /></el-icon>
                  </el-tag>
                  <div v-if="!tool.inputSchema?.properties?.length" class="empty-schema">
                    无参数
                  </div>
                </div>
              </div>

              <template #footer>
                <div class="tool-actions">
                  <el-button @click="testTool(tool)" size="small" type="primary">测试工具</el-button>
                  <el-button @click="reloadTool(tool)" size="small">重载</el-button>
                  <el-button 
                    @click="toggleTool(tool)" 
                    size="small"
                    :type="tool.enabled ? 'danger' : 'success'"
                  >
                    {{ tool.enabled ? '禁用' : '启用' }}
                  </el-button>
                  <el-button @click="showToolLogs(tool)" size="small">查看日志</el-button>
                </div>
              </template>
            </el-card>
          </el-col>
        </el-row>

        <el-empty v-if="tools.length === 0" description="暂无工具">
          <el-button @click="refreshTools" type="primary">刷新工具列表</el-button>
        </el-empty>
      </el-main>
    </el-container>

    <!-- Tool Test Modal -->
    <el-dialog
      v-model="showTestModal"
      :title="`测试工具: ${selectedTool?.name}`"
      width="600px"
    >
      <el-form label-position="top">
        <el-form-item label="输入参数 (JSON)">
          <el-input
            v-model="testInput"
            type="textarea"
            :rows="6"
            placeholder="请输入 JSON 格式的参数..."
          />
        </el-form-item>
      </el-form>
      
      <div v-if="testResult" class="test-result">
        <h4>测试结果</h4>
        <div class="result-status">
          <el-tag :type="testResult.success ? 'success' : 'danger'">
            {{ testResult.success ? '成功' : '失败' }}
          </el-tag>
          <span class="response-time">响应时间: {{ testResult.responseTime }}ms</span>
        </div>
        <el-input
          :model-value="JSON.stringify(testResult.data, null, 2)"
          type="textarea"
          readonly
          :rows="10"
          class="result-content"
        />
      </div>

      <template #footer>
        <el-button @click="closeTestModal">取消</el-button>
        <el-button @click="runTest" type="primary" :loading="isTestRunning">
          {{ isTestRunning ? '运行中...' : '运行测试' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- Tool Logs Modal -->
    <el-dialog
      v-model="showLogsModal"
      :title="`工具日志: ${selectedTool?.name}`"
      width="800px"
    >
      <div class="logs-header">
        <el-select v-model="logLevel" placeholder="选择日志级别">
          <el-option label="所有级别" value="all" />
          <el-option label="信息" value="info" />
          <el-option label="警告" value="warn" />
          <el-option label="错误" value="error" />
        </el-select>
        <el-button @click="refreshLogs" size="small">刷新日志</el-button>
      </div>

      <div class="logs-content">
        <div v-for="log in filteredLogs" :key="log.id" class="log-entry">
          <el-tag :type="getLogType(log.level)" size="small">{{ log.level.toUpperCase() }}</el-tag>
          <span class="log-timestamp">{{ formatTimestamp(log.timestamp) }}</span>
          <span class="log-message">{{ log.message }}</span>
        </div>
        <el-empty v-if="filteredLogs.length === 0" description="暂无日志记录" />
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { SwitchButton, Refresh, RefreshRight, StarFilled } from '@element-plus/icons-vue'

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

const getLogType = (level) => {
  switch (level) {
    case 'error': return 'danger'
    case 'warn': return 'warning'
    default: return 'info'
  }
}

const formatTimestamp = (timestamp) => {
  return new Date(timestamp).toLocaleString('zh-CN')
}

const refreshTools = async () => {
  isLoading.value = true
  setTimeout(() => {
    isLoading.value = false
  }, 1000)
}

const reloadAllTools = async () => {
  isLoading.value = true
  setTimeout(() => {
    isLoading.value = false
    ElMessage.success('所有工具已成功重载')
  }, 2000)
}

const reloadTool = async (tool) => {
  ElMessage.success(`工具 "${tool.name}" 已重载`)
}

const toggleTool = (tool) => {
  tool.enabled = !tool.enabled
  const status = tool.enabled ? '启用' : '禁用'
  ElMessage.success(`工具 "${tool.name}" 已${status}`)
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
    const input = JSON.parse(testInput.value)
    
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))
    
    const success = Math.random() > 0.2
    const responseTime = Math.round(50 + Math.random() * 200)
    
    testResult.value = {
      success,
      responseTime,
      data: success 
        ? { result: `Test result for ${selectedTool.value.name}`, input }
        : { error: 'Tool execution failed', code: 'EXECUTION_ERROR' }
    }
    
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
  ElMessage.success('日志已刷新')
}

const closeTestModal = () => {
  showTestModal.value = false
  selectedTool.value = null
  testInput.value = '{}'
  testResult.value = null
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
.tools-layout {
  min-height: 100vh;
}

.tools-header {
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-lighter);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}

.header-left {
  display: flex;
  align-items: center;
}

.brand-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  margin: 0;
}

.header-nav {
  display: flex;
  align-items: center;
  gap: 20px;
}

.tools-main {
  padding: 24px;
  background: var(--el-bg-color-page);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.page-header h2 {
  font-size: 24px;
  margin: 0 0 8px 0;
}

.page-header p {
  margin: 0;
  color: var(--el-text-color-regular);
}

.header-actions {
  display: flex;
  gap: 12px;
}

.stats-row {
  margin-bottom: 24px;
}

.stat-card {
  margin-bottom: 0;
}

.stat-content {
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
  background: var(--el-color-primary-light-9);
  border-radius: 8px;
}

.stat-number {
  font-size: 20px;
  font-weight: 700;
  color: var(--el-text-color-primary);
}

.stat-label {
  font-size: 12px;
  color: var(--el-text-color-regular);
  margin-top: 2px;
}

.tool-card {
  margin-bottom: 20px;
}

.tool-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.tool-header h3 {
  font-size: 16px;
  margin: 0 0 4px 0;
}

.tool-header p {
  font-size: 14px;
  margin: 0;
  color: var(--el-text-color-regular);
}

.tool-schema {
  margin: 16px 0;
}

.tool-schema h4 {
  font-size: 14px;
  margin: 0 0 8px 0;
}

.param-tag {
  margin: 2px 4px 2px 0;
}

.empty-schema {
  color: var(--el-text-color-placeholder);
  font-size: 12px;
  font-style: italic;
}

.tool-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.test-result {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.test-result h4 {
  font-size: 16px;
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
  color: var(--el-text-color-regular);
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
}

.log-entry {
  padding: 8px 0;
  display: flex;
  gap: 12px;
  align-items: flex-start;
  font-size: 14px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.log-entry:last-child {
  border-bottom: none;
}

.log-timestamp {
  color: var(--el-text-color-secondary);
  flex-shrink: 0;
  width: 120px;
  font-size: 12px;
}

.log-message {
  flex: 1;
  color: var(--el-text-color-primary);
}

@media (max-width: 768px) {
  .navbar {
    flex-direction: column;
    height: auto;
    padding: 10px;
  }
  
  .navbar-menu {
    margin: 10px 0;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
  }
  
  .tool-actions {
    flex-direction: column;
  }
}
</style>