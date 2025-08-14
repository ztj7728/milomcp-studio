import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // State
  const token = ref(localStorage.getItem('milomcp_token') || null)
  const userInfo = ref(null)
  const isLoading = ref(false)
  const lastError = ref(null)

  // Getters
  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => userInfo.value?.isAdmin || false)
  const permissions = computed(() => userInfo.value?.permissions || [])

  // Actions
  const setToken = (newToken) => {
    token.value = newToken
    if (newToken) {
      localStorage.setItem('milomcp_token', newToken)
    } else {
      localStorage.removeItem('milomcp_token')
    }
  }

  const setUserInfo = (info) => {
    userInfo.value = info
  }

  const setError = (error) => {
    lastError.value = error
  }

  const clearError = () => {
    lastError.value = null
  }

  const logout = () => {
    setToken(null)
    setUserInfo(null)
    clearError()
  }

  const login = async (apiToken) => {
    isLoading.value = true
    clearError()
    
    try {
      // Validate token by making a test API call to an authenticated endpoint
      const { defaultClient } = await import('../api/client.js')
      defaultClient.setToken(apiToken)
      
      // Try to access admin endpoint to validate token and check admin status
      let isAdmin = false
      let permissions = []
      
      try {
        // Test admin access - only admin tokens can access /admin/users
        await defaultClient.getUsers()
        isAdmin = true
        permissions = ['*'] // Admin has all permissions
      } catch (adminError) {
        // If admin access fails, try regular authenticated endpoint
        try {
          await defaultClient.getTools()
          isAdmin = false
          permissions = ['user'] // Regular user permissions
        } catch (userError) {
          // If both fail, token is invalid
          throw new Error('Invalid token or insufficient permissions')
        }
      }
      
      setToken(apiToken)
      
      // Set user info based on token validation results
      const extractedUserInfo = {
        isAdmin,
        permissions,
        token: apiToken
      }
      setUserInfo(extractedUserInfo)
      
      return { success: true }
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || 
                          error.message || 
                          'Authentication failed'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  const hasPermission = (permission) => {
    if (!isAuthenticated.value) return false
    if (isAdmin.value) return true
    if (permissions.value.includes('*')) return true
    return permissions.value.includes(permission)
  }

  const validateToken = async () => {
    if (!token.value) return false
    
    try {
      const { defaultClient } = await import('../api/client.js')
      defaultClient.setToken(token.value)
      
      // Try to access authenticated endpoints to validate token and restore user info
      let isAdmin = false
      let permissions = []
      
      try {
        // Test admin access - only admin tokens can access /admin/users
        await defaultClient.getUsers()
        isAdmin = true
        permissions = ['*'] // Admin has all permissions
      } catch (adminError) {
        try {
          await defaultClient.getTools()
          isAdmin = false
          permissions = ['user'] // Regular user permissions
        } catch (userError) {
          // Both failed, token is invalid
          logout()
          return false
        }
      }
      
      // Restore user info based on validation results
      const extractedUserInfo = {
        isAdmin,
        permissions,
        token: token.value
      }
      setUserInfo(extractedUserInfo)
      
      return true
    } catch (error) {
      // Token is invalid, clear it
      logout()
      return false
    }
  }

  // Initialize store
  const init = async () => {
    if (token.value) {
      const isValid = await validateToken()
      if (!isValid) {
        logout()
      }
    }
  }

  return {
    // State
    token,
    userInfo,
    isLoading,
    lastError,
    
    // Getters
    isAuthenticated,
    isAdmin,
    permissions,
    
    // Actions
    setToken,
    setUserInfo,
    setError,
    clearError,
    logout,
    login,
    hasPermission,
    validateToken,
    init
  }
})