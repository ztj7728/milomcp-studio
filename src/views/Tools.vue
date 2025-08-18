<template>
  <div>
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
        <el-button v-if="authStore.isAdmin" @click="reloadAllTools" :loading="isLoading" type="primary">
          <el-icon><RefreshRight /></el-icon>
          重载所有工具
        </el-button>
      </div>
    </div>

    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">🛠️</div>
            <div>
              <div class="stat-number">{{ tools.length }}</div>
              <div class="stat-label">可用工具</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">📋</div>
            <div>
              <div class="stat-number">{{ totalParams }}</div>
              <div class="stat-label">参数总数</div>
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
              <el-tag type="success">可用</el-tag>
            </div>
          </template>

          <div class="tool-schema">
            <h4>输入参数</h4>
            <div class="schema-list">
              <el-tag
                v-for="(param, key) in tool.inputSchema?.properties"
                :key="key"
                size="small"
                class="param-tag"
              >
                {{ key }} ({{ param.type }})
                <el-icon v-if="tool.inputSchema?.required?.includes(key)" color="#f56c6c"><StarFilled /></el-icon>
              </el-tag>
              <div v-if="!tool.inputSchema?.properties || Object.keys(tool.inputSchema.properties).length === 0" class="empty-schema">
                无参数
              </div>
            </div>
          </div>

          <template #footer>
            <div class="tool-actions">
              <el-button @click="testTool(tool)" size="small" type="primary">测试工具</el-button>
            </div>
          </template>
        </el-card>
      </el-col>
    </el-row>

    <el-empty v-if="tools.length === 0" description="暂无工具">
      <el-button @click="refreshTools" type="primary">刷新工具列表</el-button>
    </el-empty>

    <!-- Tool Test Modal -->
    <el-dialog
      v-model="showTestModal"
      :title="`测试工具: ${selectedTool?.name}`"
      width="600px"
    >
      <el-form label-position="top">
        <el-form-item
          v-for="(param, key) in selectedTool?.inputSchema?.properties"
          :key="key"
          :label="`${key} (${param.type})`"
          :required="selectedTool?.inputSchema?.required?.includes(key)"
        >
          <el-input
            v-if="param.type === 'string'"
            v-model="testParameters[key]"
            :placeholder="param.description || `请输入${key}`"
            :type="key.includes('password') ? 'password' : 'text'"
          />
          <el-input-number
            v-else-if="param.type === 'number'"
            v-model="testParameters[key]"
            :placeholder="param.description || `请输入${key}`"
            style="width: 100%"
          />
          <el-switch
            v-else-if="param.type === 'boolean'"
            v-model="testParameters[key]"
          />
          <el-input
            v-else
            v-model="testParameters[key]"
            type="textarea"
            :rows="3"
            :placeholder="param.description || `请输入${key} (${param.type})`"
          />
          <div v-if="param.description" class="param-description">
            {{ param.description }}
          </div>
        </el-form-item>
      </el-form>
      
      <div v-if="testResult" class="test-result">
        <h4>测试结果</h4>
        <div class="result-status">
          <el-tag :type="testResult.success ? 'success' : 'danger'">
            {{ testResult.success ? '成功' : '失败' }}
          </el-tag>
        </div>
        <el-input
          :model-value="typeof testResult.data === 'string' ? testResult.data : JSON.stringify(testResult.data, null, 2)"
          type="textarea"
          readonly
          :rows="8"
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { ElMessage } from 'element-plus'
import { Refresh, RefreshRight, StarFilled } from '@element-plus/icons-vue'

const router = useRouter()
const authStore = useAuthStore()

const isLoading = ref(false)
const isTestRunning = ref(false)
const showTestModal = ref(false)
const selectedTool = ref(null)
const testParameters = ref({})
const testResult = ref(null)

const tools = ref([])

const totalParams = computed(() => {
  return tools.value.reduce((sum, tool) => {
    const props = tool.inputSchema?.properties
    return sum + (props ? Object.keys(props).length : 0)
  }, 0)
})

const refreshTools = async () => {
  isLoading.value = true
  try {
    const { defaultClient } = await import('../api/client.js')
    const response = await defaultClient.getTools()
    
    if (response && response.result && response.result.tools) {
      tools.value = response.result.tools
    } else {
      tools.value = []
    }
  } catch (error) {
    console.error('Failed to fetch tools:', error)
    ElMessage.error('获取工具列表失败: ' + (error.message || '未知错误'))
  } finally {
    isLoading.value = false
  }
}

const reloadAllTools = async () => {
  isLoading.value = true
  try {
    const { defaultClient } = await import('../api/client.js')
    await defaultClient.reloadAllTools()
    ElMessage.success('所有工具已成功重载')
    // Refresh tools list after reload
    await refreshTools()
  } catch (error) {
    console.error('Failed to reload tools:', error)
    ElMessage.error('重载工具失败: ' + (error.message || '未知错误'))
  } finally {
    isLoading.value = false
  }
}

const testTool = (tool) => {
  selectedTool.value = tool
  testParameters.value = {}
  
  // Initialize test parameters with default values
  if (tool.inputSchema?.properties) {
    Object.keys(tool.inputSchema.properties).forEach(key => {
      const param = tool.inputSchema.properties[key]
      if (param.type === 'boolean') {
        testParameters.value[key] = false
      } else if (param.type === 'number') {
        testParameters.value[key] = 0
      } else {
        testParameters.value[key] = ''
      }
    })
  }
  
  testResult.value = null
  showTestModal.value = true
}

const runTest = async () => {
  isTestRunning.value = true
  
  try {
    const { defaultClient } = await import('../api/client.js')
    
    // Only send parameters if the tool actually has parameter definitions
    let toolParams = {}
    if (selectedTool.value.inputSchema?.properties && Object.keys(selectedTool.value.inputSchema.properties).length > 0) {
      // Filter out empty string values for optional parameters
      toolParams = Object.fromEntries(
        Object.entries(testParameters.value).filter(([key, value]) => {
          const paramDef = selectedTool.value.inputSchema.properties[key]
          const isRequired = selectedTool.value.inputSchema?.required?.includes(key)
          
          // Include if required, or if not required but has non-empty value
          return isRequired || (value !== '' && value !== null && value !== undefined)
        })
      )
    }
    
    const response = await defaultClient.executeTool(selectedTool.value.name, toolParams)
    
    testResult.value = {
      success: true,
      data: response.result || response
    }
    
    ElMessage.success('工具测试成功')
    
  } catch (error) {
    console.error('Failed to test tool:', error)
    testResult.value = {
      success: false,
      data: {
        error: error.message || '工具执行失败',
        details: error.response?.data || error
      }
    }
    ElMessage.error('工具测试失败: ' + (error.message || '未知错误'))
  } finally {
    isTestRunning.value = false
  }
}

const closeTestModal = () => {
  showTestModal.value = false
  selectedTool.value = null
  testParameters.value = {}
  testResult.value = null
}

onMounted(() => {
  refreshTools()
})
</script>

<style scoped>
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
  border-radius: 16px;
  border: none;
  background: var(--card-bg-color);
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.12);
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
  margin-bottom: 24px;
  border-radius: 16px;
  border: none;
  background: var(--card-bg-color);
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.tool-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.12);
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

.param-description {
  font-size: 12px;
  color: var(--el-text-color-regular);
  margin-top: 4px;
  line-height: 1.4;
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

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .page-header h2 {
    font-size: 20px;
  }
  
  .header-actions {
    flex-direction: column;
    gap: 8px;
  }
  
  .stats-row {
    margin-bottom: 20px;
  }
  
  .stat-card {
    margin-bottom: 16px;
  }
  
  .tool-card {
    margin-bottom: 16px;
  }
  
  .tool-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .tool-header h3 {
    font-size: 14px;
  }
  
  .tool-header p {
    font-size: 13px;
  }
  
  .tool-schema {
    margin: 12px 0;
  }
  
  .schema-list {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }
  
  .param-tag {
    font-size: 11px;
    margin: 2px;
  }
  
  .tool-actions {
    flex-direction: column;
    gap: 8px;
  }
  
  .tool-actions .el-button {
    width: 100%;
  }
}
</style>