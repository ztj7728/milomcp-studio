<template>
  <div class="users">
    <nav class="navbar">
      <div class="navbar-brand">
        <h1>MiloMCP Studio</h1>
      </div>
      <div class="navbar-nav">
        <RouterLink to="/dashboard" class="nav-link">仪表板</RouterLink>
        <RouterLink to="/tools" class="nav-link">工具管理</RouterLink>
        <RouterLink to="/users" class="nav-link active">用户管理</RouterLink>
        <RouterLink to="/settings" class="nav-link">设置</RouterLink>
        <button @click="handleLogout" class="btn btn-sm btn-secondary">退出登录</button>
      </div>
    </nav>

    <main class="main-content">
      <div class="container">
        <div class="page-header">
          <div class="header-content">
            <h2>用户管理</h2>
            <p>管理系统用户和权限设置</p>
          </div>
          <div class="header-actions">
            <button @click="showCreateModal = true" class="btn btn-primary">
              ➕ 添加用户
            </button>
            <button @click="refreshUsers" class="btn btn-secondary" :disabled="isLoading">
              <span v-if="isLoading" class="loading"></span>
              🔄 刷新
            </button>
          </div>
        </div>

        <div class="users-stats">
          <div class="stat-card">
            <div class="stat-icon">👥</div>
            <div class="stat-content">
              <div class="stat-number">{{ users.length }}</div>
              <div class="stat-label">总用户数</div>
            </div>
          </div>
        </div>

        <div class="users-table-container">
          <div class="card">
            <div class="card-header">
              <h3>用户列表</h3>
              <div class="search-box">
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="搜索用户..."
                  class="form-input"
                />
              </div>
            </div>
            <div class="card-body">
              <div v-if="filteredUsers.length === 0" class="empty-state">
                <div class="empty-icon">👤</div>
                <h4>暂无用户</h4>
                <p>点击"添加用户"按钮创建第一个用户</p>
              </div>
              <div v-else class="users-table">
                <table>
                  <thead>
                    <tr>
                      <th>用户名</th>
                      <th>ID</th>
                      <th>Token</th>
                      <th>创建时间</th>
                      <th>过期时间</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="user in filteredUsers" :key="user.id">
                      <td>
                        <div class="user-info">
                          <div class="user-avatar">{{ (user.name || user.id).charAt(0).toUpperCase() }}</div>
                          <span>{{ user.name || user.id }}</span>
                        </div>
                      </td>
                      <td>{{ user.id }}</td>
                      <td>
                        <button @click="copyToken(user.token)" class="btn btn-sm btn-outline-secondary">复制</button>
                      </td>
                      <td>{{ formatDate(user.createdAt) }}</td>
                      <td>{{ user.expiresAt ? formatDate(user.expiresAt) : '永久' }}</td>
                      <td>
                        <div class="action-buttons">
                          <button @click="editUser(user)" class="btn btn-sm btn-secondary">编辑</button>
                          <button @click="deleteUser(user)" class="btn btn-sm btn-danger">删除</button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Create/Edit User Modal -->
    <div v-if="showCreateModal || showEditModal" class="modal-overlay" @click="closeModals">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>{{ showCreateModal ? '添加用户' : '编辑用户' }}</h3>
          <button @click="closeModals" class="close-btn">✕</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveUser">
            <div class="form-group">
              <label class="form-label">用户 ID</label>
              <input v-model="userForm.id" type="text" :disabled="showEditModal" required class="form-input" />
              <small v-if="showCreateModal" class="form-text">用户的唯一标识符。</small>
            </div>
            <div class="form-group">
              <label class="form-label">名称</label>
              <input v-model="userForm.name" type="text" class="form-input" />
              <small class="form-text">可选。如果未提供，将默认使用 ID 的值。</small>
            </div>
            <div class="form-group">
              <label class="form-label">权限</label>
              <input v-model="permissionsForInput" type="text" class="form-input" />
              <small class="form-text">以逗号分隔的字符串数组，例如 "tool:calculator,tool:weather"。`*` 代表所有权限。</small>
            </div>
            <div class="form-group">
              <label class="form-label">速率限制 (每小时请求数)</label>
              <input v-model.number="userForm.rateLimits.requests" type="number" class="form-input" />
            </div>
             <div class="form-group">
              <label class="form-label">过期时间</label>
              <input v-model="userForm.expiresAt" type="datetime-local" class="form-input" />
              <small class="form-text">可选。如果为 null 或不提供，则永不过期。</small>
            </div>
            <div class="modal-actions">
              <button type="button" @click="closeModals" class="btn btn-secondary">取消</button>
              <button type="submit" class="btn btn-primary">保存</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import Swal from 'sweetalert2'

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


const copyToken = async (token) => {
  if (!token) {
    Swal.fire({
      icon: 'warning',
      title: '无 Token',
      text: '没有可复制的 Token。',
      confirmButtonColor: '#667eea',
    });
    return;
  }
  try {
    await navigator.clipboard.writeText(token);
    Swal.fire({
      icon: 'success',
      title: '复制成功',
      text: 'Token 已复制到剪贴板',
      timer: 1500,
      showConfirmButton: false,
    });
  } catch (err) {
    console.error('Failed to copy token: ', err);
    Swal.fire({
      icon: 'error',
      title: '复制失败',
      text: '请检查浏览器权限或是否在 HTTPS 环境下。',
      confirmButtonColor: '#667eea',
    });
  }
};

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
  editingUser.value = JSON.parse(JSON.stringify(user)); // Store original for diffing
  userForm.value = JSON.parse(JSON.stringify(user)) // Deep copy to avoid reactivity issues
  if (userForm.value.expiresAt) {
    // Convert to 'YYYY-MM-DDTHH:mm' format for datetime-local input
    const d = new Date(userForm.value.expiresAt)
    userForm.value.expiresAt = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().slice(0, 16)
  }
  showEditModal.value = true
}

const deleteUser = async (user) => {
  const result = await Swal.fire({
    title: `确定要删除用户 "${user.name || user.id}" 吗？`,
    text: "此操作不可撤销。",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: '确认删除',
    cancelButtonText: '取消'
  });

  if (result.isConfirmed) {
    try {
      const { defaultClient } = await import('../api/client.js');
      await defaultClient.deleteUser(user.id);

      const index = users.value.findIndex(u => u.id === user.id);
      if (index !== -1) {
        users.value.splice(index, 1);
      }

      Swal.fire(
        '已删除!',
        `用户 "${user.name || user.id}" 已被删除。`,
        'success'
      );
    } catch (error) {
      console.error('Failed to delete user:', error);
      Swal.fire(
        '删除失败',
        '删除用户时出错: ' + (error.message || '未知错误'),
        'error'
      );
    }
  }
};


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
        createData.rateLimits.requests = Number(createData.rateLimits.requests);
      } else {
        createData.rateLimits = { requests: 1000, window: 3600000 };
      }
      if (createData.rateLimits && !createData.rateLimits.window) {
        createData.rateLimits.window = 3600000;
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
      const formPermissions = Array.isArray(userForm.value.permissions) ? userForm.value.permissions : userForm.value.permissions.split(',').map(p => p.trim()).filter(p => p);
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
        await defaultClient.updateUser(id, updateData);
      } else {
        // No changes, just close the modal without making an API call
        console.log("No changes detected, skipping update.");
      }
    }
    
    closeModals()
    await refreshUsers() // Refresh the list to show changes
    
  } catch (error) {
    console.error('Failed to save user:', error)
    alert('保存用户失败: ' + (error.message || '未知错误'))
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
.users {
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

.users-stats {
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

.users-table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.search-box {
  width: 300px;
}

.users-table {
  overflow-x: auto;
}

.users-table table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th,
.users-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

.users-table th {
  background: #f7fafc;
  font-weight: 600;
  color: #2d3748;
  font-size: 14px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #667eea;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state h4 {
  font-size: 18px;
  color: #2d3748;
  margin: 0 0 8px 0;
}

.empty-state p {
  color: #718096;
  margin: 0;
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
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
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

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
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

  .users-stats {
    grid-template-columns: 1fr;
  }

  .search-box {
    width: 100%;
  }

  .users-table {
    font-size: 14px;
  }

  .action-buttons {
    flex-direction: column;
  }
}
</style>