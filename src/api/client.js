import axios from 'axios'

/**
 * MiloMCP API Client
 * Handles communication with MiloMCP backend server
 */
export class MCPClient {
  constructor(baseURL, token = null) {
    this.baseURL = baseURL
    this.token = token
    
    // Create axios instance
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    
    // Add request interceptor to include auth token
    this.client.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )
    
    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        // Handle common errors
        if (error.response?.status === 401) {
          // Token expired or invalid
          console.warn('Authentication failed, token may be invalid')
        } else if (error.response?.status === 403) {
          // Forbidden
          console.warn('Access forbidden, insufficient permissions')
        } else if (error.response?.status >= 500) {
          // Server error
          console.error('Server error:', error.response?.data || error.message)
        }
        return Promise.reject(error)
      }
    )
  }
  
  /**
   * Set authentication token
   */
  setToken(token) {
    this.token = token
  }
  
  /**
   * Clear authentication token
   */
  clearToken() {
    this.token = null
  }
  
  // ==========================================================================
  // Health and System Endpoints
  // ==========================================================================
  
  /**
   * Check server health status
   */
  async getHealth() {
    try {
      const response = await this.client.get('/health')
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Failed to check server health')
    }
  }
  
  /**
   * Get server information
   */
  async getServerInfo() {
    try {
      const response = await this.client.get('/info')
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Failed to get server information')
    }
  }
  
  // ==========================================================================
  // JSON-RPC 2.0 Support
  // ==========================================================================
  
  /**
   * Send a JSON-RPC 2.0 request
   */
  async jsonRpc(method, params = {}, id = null) {
    try {
      const requestId = id || Math.random().toString(36).substr(2, 9)
      const payload = {
        jsonrpc: '2.0',
        method,
        id: requestId
      }
      
      if (Object.keys(params).length > 0) {
        payload.params = params
      }
      
      const response = await this.client.post('/jsonrpc', payload)
      
      if (response.data.error) {
        throw new Error(response.data.error.message || 'JSON-RPC error')
      }
      
      return response.data
    } catch (error) {
      throw this.handleError(error, `JSON-RPC call failed: ${method}`)
    }
  }

  // ==========================================================================
  // Tools Management
  // ==========================================================================
  
  /**
   * Get list of available tools
   */
  async getTools() {
    try {
      // Try JSON-RPC first, fall back to REST API
      try {
        const response = await this.jsonRpc('tools/list')
        return response
      } catch (jsonRpcError) {
        // Fall back to REST API
        const response = await this.client.get('/tools')
        return response.data
      }
    } catch (error) {
      throw this.handleError(error, 'Failed to get tools list')
    }
  }
  
  /**
   * Get detailed information about a specific tool
   */
  async getTool(toolName) {
    try {
      const response = await this.client.get(`/tools/${encodeURIComponent(toolName)}`)
      return response.data
    } catch (error) {
      throw this.handleError(error, `Failed to get tool: ${toolName}`)
    }
  }
  
  /**
   * Execute a tool with given parameters
   */
  async executeTool(toolName, parameters = {}) {
    try {
      // Use JSON-RPC 2.0 for tool execution
      const params = { name: toolName }
      
      // Only include arguments if there are any parameters to send
      if (parameters && Object.keys(parameters).length > 0) {
        params.arguments = parameters
      }
      
      const response = await this.jsonRpc('tools/call', params)
      return response
    } catch (error) {
      throw this.handleError(error, `Failed to execute tool: ${toolName}`)
    }
  }
  
  /**
   * Reload a specific tool
   */
  async reloadTool(toolName) {
    try {
      const response = await this.client.post(`/tools/${encodeURIComponent(toolName)}/reload`)
      return response.data
    } catch (error) {
      throw this.handleError(error, `Failed to reload tool: ${toolName}`)
    }
  }
  
  /**
   * Reload all tools
   */
  async reloadAllTools() {
    try {
      const response = await this.client.post('/reload')
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Failed to reload all tools')
    }
  }
  
  /**
   * Enable/disable a tool
   */
  async setToolStatus(toolName, enabled) {
    try {
      const response = await this.client.patch(`/tools/${encodeURIComponent(toolName)}/status`, {
        enabled
      })
      return response.data
    } catch (error) {
      throw this.handleError(error, `Failed to set tool status: ${toolName}`)
    }
  }
  
  // ==========================================================================
  
  // ==========================================================================
  // Authentication
  // ==========================================================================
  
  /**
   * Validate current token
   */
  async validateToken() {
    try {
      const response = await this.client.post('/auth/validate')
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Failed to validate token')
    }
  }
  
  /**
   * Refresh authentication token
   */
  async refreshToken() {
    try {
      const response = await this.client.post('/auth/refresh')
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Failed to refresh token')
    }
  }
  
  // ==========================================================================
  // Logs and Monitoring
  // ==========================================================================
  
  /**
   * Get system logs
   */
  async getLogs(options = {}) {
    try {
      const params = new URLSearchParams()
      if (options.level) params.append('level', options.level)
      if (options.limit) params.append('limit', options.limit.toString())
      if (options.offset) params.append('offset', options.offset.toString())
      if (options.tool) params.append('tool', options.tool)
      
      const response = await this.client.get(`/logs?${params.toString()}`)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Failed to get logs')
    }
  }
  
  /**
   * Get tool-specific logs
   */
  async getToolLogs(toolName, options = {}) {
    try {
      const params = new URLSearchParams()
      if (options.level) params.append('level', options.level)
      if (options.limit) params.append('limit', options.limit.toString())
      if (options.offset) params.append('offset', options.offset.toString())
      
      const response = await this.client.get(`/tools/${encodeURIComponent(toolName)}/logs?${params.toString()}`)
      return response.data
    } catch (error) {
      throw this.handleError(error, `Failed to get logs for tool: ${toolName}`)
    }
  }
  
  /**
   * Get system statistics
   */
  async getStats() {
    try {
      const response = await this.client.get('/stats')
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Failed to get system statistics')
    }
  }
  
  // ==========================================================================
  // User Management (Admin Only)
  // ==========================================================================
  
  /**
   * Get all users (admin only)
   */
  async getUsers() {
    try {
      const response = await this.client.get('/admin/users')
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Failed to get users list')
    }
  }
  
  /**
   * Add a new user (admin only)
   */
  async addUser(userData) {
    try {
      const response = await this.client.post('/admin/users', userData)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Failed to add user')
    }
  }
  
  /**
   * Update user (admin only)
   */
  async updateUser(userId, userData) {
    try {
      const response = await this.client.patch(`/admin/users/${encodeURIComponent(userId)}`, userData)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Failed to update user')
    }
  }
  
  /**
   * Delete user (admin only)
   */
  async deleteUser(userId) {
    try {
      const response = await this.client.delete(`/admin/users/${encodeURIComponent(userId)}`)
      return response.data
    } catch (error) {
      throw this.handleError(error, 'Failed to delete user')
    }
  }

  // ==========================================================================
  // WebSocket and Real-time Communication
  // ==========================================================================
  
  /**
   * Create WebSocket connection for real-time updates
   */
  createWebSocket(onMessage, onError, onClose) {
    const wsUrl = this.baseURL.replace(/^http/, 'ws') + '/ws'
    const ws = new WebSocket(wsUrl)
    
    ws.onopen = () => {
      console.log('WebSocket connected')
      // Send authentication if token is available
      if (this.token) {
        ws.send(JSON.stringify({
          type: 'auth',
          token: this.token
        }))
      }
    }
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        onMessage && onMessage(data)
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
      }
    }
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      onError && onError(error)
    }
    
    ws.onclose = (event) => {
      console.log('WebSocket disconnected:', event.code, event.reason)
      onClose && onClose(event)
    }
    
    return ws
  }
  
  /**
   * Create Server-Sent Events connection
   */
  createEventSource(onMessage, onError) {
    const sseUrl = `${this.baseURL}/sse`
    const eventSource = new EventSource(sseUrl)
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        onMessage && onMessage(data)
      } catch (error) {
        console.error('Failed to parse SSE message:', error)
      }
    }
    
    eventSource.onerror = (error) => {
      console.error('SSE error:', error)
      onError && onError(error)
    }
    
    return eventSource
  }
  
  // ==========================================================================
  // Utility Methods
  // ==========================================================================
  
  /**
   * Handle and format API errors
   */
  handleError(error, defaultMessage) {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.error?.message || 
                     error.response.data?.message || 
                     error.response.statusText ||
                     defaultMessage
      
      return new Error(`${defaultMessage}: ${message}`)
    } else if (error.request) {
      // Request was made but no response received
      return new Error(`${defaultMessage}: Network error - no response from server`)
    } else {
      // Something else happened
      return new Error(`${defaultMessage}: ${error.message}`)
    }
  }
  
  /**
   * Test connection to the server
   */
  async testConnection() {
    const start = Date.now()
    try {
      await this.getHealth()
      const responseTime = Date.now() - start
      return {
        success: true,
        responseTime,
        message: `Connection successful (${responseTime}ms)`
      }
    } catch (error) {
      return {
        success: false,
        responseTime: Date.now() - start,
        message: error.message
      }
    }
  }
  
  /**
   * Get full URL for a given endpoint
   */
  getUrl(endpoint) {
    return `${this.baseURL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`
  }
}

// Default client instance (can be configured globally)
export const defaultClient = new MCPClient(import.meta.env.VITE_MILOMCP_API_URL || 'http://localhost:3000')

// Utility functions for common operations
export const mcpApi = {
  /**
   * Create a new client instance
   */
  createClient(baseURL, token) {
    return new MCPClient(baseURL, token)
  },
  
  /**
   * Quick health check
   */
  async ping(baseURL = import.meta.env.VITE_MILOMCP_API_URL || 'http://localhost:3000') {
    const client = new MCPClient(baseURL)
    try {
      await client.getHealth()
      return true
    } catch {
      return false
    }
  },
  
  /**
   * Test authentication with token
   */
  async testAuth(baseURL, token) {
    const client = new MCPClient(baseURL, token)
    try {
      await client.validateToken()
      return true
    } catch {
      return false
    }
  }
}

export default MCPClient