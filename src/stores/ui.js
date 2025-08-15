import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export const useUIStore = defineStore('ui', () => {
  // 主题设置
  const theme = ref('light')
  const previewTheme = ref(null)
  const systemTheme = ref('light')
  
  // Login界面自定义设置
  const loginCustomization = ref({
    header: {
      title: 'MiloMCP Studio',
      subtitle: '高性能、优雅、轻量的 MCP 管理平台',
      showLogo: true,
      backgroundColor: '#ffffff',
      textColor: '#2d3748'
    },
    footer: {
      showFeatures: true,
      features: [
        '🔐 安全的 JWT Token 认证',
        '👥 用户管理和权限控制', 
        '🛠️ 工具管理和实时重载',
        '📡 多协议通信支持',
        '⚡ 高性能实时监控'
      ],
      customText: '',
      backgroundColor: '#ffffff',
      textColor: '#718096'
    },
    background: {
      type: 'gradient', // 'gradient', 'solid', 'image'
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      solidColor: '#f7fafc',
      imageUrl: ''
    }
  })

  // 简化的主题预设
  const themes = ref({
    light: {
      name: '浅色主题',
      isDark: false
    },
    dark: {
      name: '深色主题',
      isDark: true
    },
    auto: {
      name: '跟随系统',
      isDark: null // Will be determined by system
    }
  })

  // 计算当前主题
  const currentTheme = computed(() => {
    const activeTheme = theme.value
    if (activeTheme === 'auto') {
      return themes.value[systemTheme.value] || themes.value.light
    }
    return themes.value[activeTheme] || themes.value.light
  })

  // 计算预览主题
  const currentPreviewTheme = computed(() => {
    const activeTheme = previewTheme.value || theme.value
    if (activeTheme === 'auto') {
      return themes.value[systemTheme.value] || themes.value.light
    }
    return themes.value[activeTheme] || themes.value.light
  })

  // 检测系统主题
  const detectSystemTheme = () => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')
      systemTheme.value = darkModeQuery.matches ? 'dark' : 'light'
      
      // 监听系统主题变化
      darkModeQuery.addEventListener('change', (e) => {
        systemTheme.value = e.matches ? 'dark' : 'light'
      })
    }
  }

  // 应用主题到HTML元素
  const applyTheme = () => {
    if (typeof document !== 'undefined') {
      const html = document.documentElement
      const activeTheme = theme.value
      const resolvedTheme = activeTheme === 'auto' ? systemTheme.value : activeTheme
      
      // Remove existing theme classes
      html.classList.remove('theme-light', 'theme-dark')
      
      // Add current theme class
      html.classList.add(`theme-${resolvedTheme}`)
    }
  }

  // 监听主题变化
  watch([theme, systemTheme], applyTheme, { immediate: true })

  // 预览主题（不保存）
  const previewThemeChange = (newTheme) => {
    previewTheme.value = newTheme
  }

  // 确认并应用主题（保存）
  const setTheme = (newTheme) => {
    theme.value = newTheme
    previewTheme.value = null
    saveToLocalStorage()
  }

  // 取消预览
  const cancelPreview = () => {
    previewTheme.value = null
  }

  // 更新Login自定义设置
  const updateLoginCustomization = (section, updates) => {
    if (loginCustomization.value[section]) {
      Object.assign(loginCustomization.value[section], updates)
      saveToLocalStorage()
    }
  }

  // 重置Login自定义设置
  const resetLoginCustomization = () => {
    loginCustomization.value = {
      header: {
        title: 'MiloMCP Studio',
        subtitle: '高性能、优雅、轻量的 MCP 管理平台',
        showLogo: true,
        backgroundColor: '#ffffff',
        textColor: '#2d3748'
      },
      footer: {
        showFeatures: true,
        features: [
          '🔐 安全的 JWT Token 认证',
          '👥 用户管理和权限控制', 
          '🛠️ 工具管理和实时重载',
          '📡 多协议通信支持',
          '⚡ 高性能实时监控'
        ],
        customText: '',
        backgroundColor: '#ffffff',
        textColor: '#718096'
      },
      background: {
        type: 'gradient',
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        solidColor: '#f7fafc',
        imageUrl: ''
      }
    }
    saveToLocalStorage()
  }

  // 保存到本地存储
  const saveToLocalStorage = () => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('milomcp_ui_settings', JSON.stringify({
        theme: theme.value,
        loginCustomization: loginCustomization.value
      }))
    }
  }

  // 从本地存储加载
  const loadFromLocalStorage = () => {
    if (typeof localStorage !== 'undefined') {
      try {
        const saved = localStorage.getItem('milomcp_ui_settings')
        if (saved) {
          const parsed = JSON.parse(saved)
          if (parsed.theme) {
            theme.value = parsed.theme
          }
          if (parsed.loginCustomization) {
            loginCustomization.value = { ...loginCustomization.value, ...parsed.loginCustomization }
          }
        }
      } catch (error) {
        console.error('Failed to load UI settings:', error)
      }
    }
  }

  // 初始化
  const init = () => {
    detectSystemTheme()
    loadFromLocalStorage()
    applyTheme()
  }

  return {
    // 状态
    theme,
    previewTheme,
    systemTheme,
    loginCustomization,
    themes,
    
    // 计算属性
    currentTheme,
    currentPreviewTheme,
    
    // 方法
    setTheme,
    previewThemeChange,
    cancelPreview,
    updateLoginCustomization,
    resetLoginCustomization,
    saveToLocalStorage,
    loadFromLocalStorage,
    init
  }
})