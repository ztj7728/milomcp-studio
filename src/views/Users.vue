<template>
  <div>
    <el-container class="users-layout">
    <el-header class="users-header">
      <div class="header-left">
        <h1 class="brand-title">MiloMCP Studio</h1>
      </div>
      <div class="header-nav">
        <el-menu mode="horizontal" :default-active="$route.name" router>
          <el-menu-item index="Dashboard">仪表板</el-menu-item>
          <el-menu-item index="Tools">工具管理</el-menu-item>
          <el-menu-item index="Users">用户管理</el-menu-item>
          <el-menu-item index="Settings">设置</el-menu-item>
        </el-menu>
        <el-button type="primary" @click="handleLogout" size="small">
          <el-icon><SwitchButton /></el-icon>
          退出登录
        </el-button>
      </div>
    </el-header>

    <el-main class="users-main">
        <div class="page-header">
          <div>
            <h2>用户管理</h2>
            <p>管理系统用户和权限设置</p>
          </div>
          <div class="header-actions">
            <el-button @click="showCreateModal = true" type="primary">
              <el-icon><Plus /></el-icon>
              添加用户
            </el-button>
            <el-button @click="refreshUsers" :loading="isLoading" type="default">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </div>

        <el-row :gutter="20" class="stats-row">
          <el-col :xs="24" :sm="8">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-icon">👥</div>
                <div>
                  <div class="stat-number">{{ users.length }}</div>
                  <div class="stat-label">总用户数</div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <el-card>
          <template #header>
            <div class="card-header">
              <h3>用户列表</h3>
              <el-input
                v-model="searchQuery"
                placeholder="搜索用户..."
                style="width: 300px"
                clearable
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
            </div>
          </template>

          <el-empty v-if="filteredUsers.length === 0" description="暂无用户">
            <el-button @click="showCreateModal = true" type="primary">添加用户</el-button>
          </el-empty>

          <el-table v-else :data="filteredUsers" stripe>
            <el-table-column label="用户名" prop="name" min-width="150">
              <template #default="{ row }">
                <div class="user-info">
                  <el-avatar :size="32" class="user-avatar">
                    {{ (row.name || row.id).charAt(0).toUpperCase() }}
                  </el-avatar>
                  <span>{{ row.name || row.id }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="ID" prop="id" min-width="120" />
            <el-table-column label="Token" min-width="120">
              <template #default="{ row }">
                <el-button @click="copyToken(row.token)" size="small" type="primary" link>
                  <el-icon><DocumentCopy /></el-icon>
                  复制
                </el-button>
              </template>
            </el-table-column>
            <el-table-column label="创建时间" min-width="140">
              <template #default="{ row }">
                {{ formatDate(row.createdAt) }}
              </template>
            </el-table-column>
            <el-table-column label="过期时间" min-width="140">
              <template #default="{ row }">
                {{ row.expiresAt ? formatDate(row.expiresAt) : '永久' }}
              </template>
            </el-table-column>
            <el-table-column label="操作" min-width="160" fixed="right">
              <template #default="{ row }">
                <div class="action-buttons">
                  <el-button @click="editUser(row)" size="small" type="primary" link>
                    <el-icon><Edit /></el-icon>
                    编辑
                  </el-button>
                  <el-button @click="deleteUser(row)" size="small" type="danger" link>
                    <el-icon><Delete /></el-icon>
                    删除
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-main>
    </el-container>

    <!-- Create/Edit User Modal -->
    <el-dialog
      v-model="showModal"
      :title="showCreateModal ? '添加用户' : '编辑用户'"
      width="500px"
    >
      <el-form @submit.prevent="saveUser" label-position="top">
        <el-form-item label="用户 ID">
          <el-input v-model="userForm.id" :disabled="showEditModal" required />
          <div v-if="showCreateModal" class="form-text">用户的唯一标识符。</div>
        </el-form-item>
        
        <el-form-item label="名称">
          <el-input v-model="userForm.name" />
          <div class="form-text">可选。如果未提供，将默认使用 ID 的值。</div>
        </el-form-item>
        
        <el-form-item label="权限">
          <el-input v-model="permissionsForInput" />
          <div class="form-text">以逗号分隔的字符串数组，例如 "tool:calculator,tool:weather"。`*` 代表所有权限。</div>
        </el-form-item>
        
        <el-form-item label="速率限制 (每小时请求数)">
          <el-input-number v-model="userForm.rateLimits.requests" :min="1" :max="10000" />
        </el-form-item>
        
        <el-form-item label="过期时间">
          <el-date-picker
            v-model="userForm.expiresAt"
            type="datetime"
            placeholder="选择过期时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DDTHH:mm"
            style="width: 100%"
          />
          <div class="form-text">可选。如果为空，则永不过期。</div>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="closeModals">取消</el-button>
        <el-button @click="saveUser" type="primary">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import Swal from 'sweetalert2'
import { SwitchButton, Plus, Refresh, Search, DocumentCopy, Edit, Delete } from '@element-plus/icons-vue'

const router = useRouter()
const authStore = useAuthStore()

const isLoading = ref(false)
const searchQuery = ref('')
const showCreateModal = ref(false)
const showEditModal = ref(false)
const editingUser = ref(null)

const users = ref([])

const userForm = ref({
  id: '',
  name: '',
  permissions: [],
  rateLimits: {
    requests: 1000,
    window: 3600000
  },
  expiresAt: null,
})

const permissionsForInput = computed({
  get: () => userForm.value.permissions.join(','),
  set: (val) => {
    userForm.value.permissions = val.split(',').map(p => p.trim()).filter(p => p)
  }
})

const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value
  return users.value.filter(user =>
    user.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    user.id.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const showModal = computed({
  get: () => showCreateModal.value || showEditModal.value,
  set: (val) => {
    if (!val) {
      showCreateModal.value = false
      showEditModal.value = false
    }
  }
})

const copyToken = async (token) => {
  if (!token) {
    ElMessage.warning('没有可复制的 Token')
    return
  }
  try {
    await navigator.clipboard.writeText(token)
    ElMessage.success('Token 已复制到剪贴板')
  } catch (err) {
    console.error('Failed to copy token: ', err)
    ElMessage.error('复制失败，请检查浏览器权限或是否在 HTTPS 环境下')
  }
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const refreshUsers = async () => {
  isLoading.value = true
  try {
    const { defaultClient } = await import('../api/client.js')
    const response = await defaultClient.getUsers()
    
    if (response.result && Array.isArray(response.result)) {
      users.value = response.result.map(user => ({
        ...user,
        username: user.name || user.id, // for display
      }))
    }
  } catch (error) {
    console.error('Failed to fetch users:', error)
    // Keep existing users if API fails
  } finally {
    isLoading.value = false
  }
}

const editUser = (user) => {
  editingUser.value = JSON.parse(JSON.stringify(user)) // Store original for diffing
  userForm.value = JSON.parse(JSON.stringify(user)) // Deep copy to avoid reactivity issues
  if (userForm.value.expiresAt) {
    // Convert to 'YYYY-MM-DDTHH:mm' format for datetime-local input
    const d = new Date(userForm.value.expiresAt)
    userForm.value.expiresAt = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().slice(0, 16)
  }
  showEditModal.value = true
}

const deleteUser = async (user) => {
  try {
    await ElMessageBox.confirm(
      `此操作不可撤销。`,
      `确定要删除用户 "${user.name || user.id}" 吗？`,
      {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    const { defaultClient } = await import('../api/client.js')
    await defaultClient.deleteUser(user.id)

    const index = users.value.findIndex(u => u.id === user.id)
    if (index !== -1) {
      users.value.splice(index, 1)
    }

    ElMessage.success(`用户 "${user.name || user.id}" 已被删除`)
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to delete user:', error)
      ElMessage.error('删除用户时出错: ' + (error.message || '未知错误'))
    }
  }
}

const closeModals = () => {
  showCreateModal.value = false
  showEditModal.value = false
  editingUser.value = null // Reset editing user state
  userForm.value = {
    id: '',
    name: '',
    permissions: [],
    rateLimits: {
      requests: 1000,
      window: 3600000
    },
    expiresAt: null,
  }
}

const saveUser = async () => {
  try {
    const { defaultClient } = await import('../api/client.js')

    if (showCreateModal.value) {
      // Create new user
      const createData = JSON.parse(JSON.stringify(userForm.value))
      if (typeof createData.permissions === 'string') {
        createData.permissions = createData.permissions.split(',').map(p => p.trim()).filter(p => p)
      }
      if (createData.rateLimits && createData.rateLimits.requests) {
        createData.rateLimits.requests = Number(createData.rateLimits.requests)
      } else {
        createData.rateLimits = { requests: 1000, window: 3600000 }
      }
      if (createData.rateLimits && !createData.rateLimits.window) {
        createData.rateLimits.window = 3600000
      }
      if (createData.expiresAt) {
        createData.expiresAt = new Date(createData.expiresAt).toISOString()
      } else {
        createData.expiresAt = null
      }
      await defaultClient.addUser(createData)
    } else {
      // Update existing user by sending only changed data
      const { id } = userForm.value
      const originalUser = editingUser.value
      const updateData = {}

      // 1. Compare name
      if (userForm.value.name !== originalUser.name) {
        updateData.name = userForm.value.name
      }

      // 2. Compare permissions
      const formPermissions = Array.isArray(userForm.value.permissions) ? userForm.value.permissions : userForm.value.permissions.split(',').map(p => p.trim()).filter(p => p)
      if (JSON.stringify(formPermissions) !== JSON.stringify(originalUser.permissions)) {
        updateData.permissions = formPermissions
      }

      // 3. Compare rate limits
      const formRequests = Number(userForm.value.rateLimits.requests)
      if (!originalUser.rateLimits || formRequests !== originalUser.rateLimits.requests) {
        updateData.rateLimits = { requests: formRequests }
      }

      // 4. Compare expiresAt
      let originalExpiresAtForInput = null
      if (originalUser.expiresAt) {
        const d = new Date(originalUser.expiresAt)
        originalExpiresAtForInput = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().slice(0, 16)
      }
      const formExpiresAt = userForm.value.expiresAt || null

      if (formExpiresAt !== originalExpiresAtForInput) {
        updateData.expiresAt = formExpiresAt ? new Date(formExpiresAt).toISOString() : null
      }

      if (Object.keys(updateData).length > 0) {
        await defaultClient.updateUser(id, updateData)
      } else {
        // No changes, just close the modal without making an API call
        console.log("No changes detected, skipping update.")
      }
    }
    
    closeModals()
    await refreshUsers() // Refresh the list to show changes
    
  } catch (error) {
    console.error('Failed to save user:', error)
    ElMessage.error('保存用户失败: ' + (error.message || '未知错误'))
  }
}

const handleLogout = () => {
  authStore.logout()
  router.push({ name: 'Login' })
}

// Initialize component
onMounted(async () => {
  // Check admin access
  if (!authStore.isAdmin) {
    router.push({ name: 'Dashboard' })
    return
  }
  
  // Load users data
  await refreshUsers()
})
</script>

<style scoped>
.users-layout {
  min-height: 100vh;
}

.users-header {
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

.users-main {
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

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-avatar {
  background: var(--el-color-primary);
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.form-text {
  font-size: 12px;
  color: var(--el-text-color-regular);
  margin-top: 4px;
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
  
  .card-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
}
</style>