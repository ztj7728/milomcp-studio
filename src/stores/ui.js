import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export const useUIStore = defineStore('ui', () => {
  // 'light', 'dark', or 'auto'
  const theme = ref('auto')
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

  const isDark = computed(() => {
    const activeTheme = previewTheme.value || theme.value
    if (activeTheme === 'auto') {
      return systemTheme.value === 'dark'
    }
    return activeTheme === 'dark'
  })

  const applyTheme = (isDarkValue) => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', isDarkValue)
    }
  }

  const detectSystemTheme = () => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')
      systemTheme.value = darkModeQuery.matches ? 'dark' : 'light'
      
      darkModeQuery.addEventListener('change', (e) => {
        systemTheme.value = e.matches ? 'dark' : 'light'
      })
    }
  }

  watch(isDark, (newValue) => {
    applyTheme(newValue)
  }, { immediate: true })

  const previewThemeChange = (newTheme) => {
    previewTheme.value = newTheme
    const isPreviewingDark = newTheme === 'auto' ? systemTheme.value === 'dark' : newTheme === 'dark'
    applyTheme(isPreviewingDark)
  }

  const setTheme = (newTheme) => {
    theme.value = newTheme
    previewTheme.value = null
    applyTheme(isDark.value)
    saveToLocalStorage()
  }

  const cancelPreview = () => {
    previewTheme.value = null
    applyTheme(isDark.value)
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

  const saveToLocalStorage = () => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('milomcp_ui_settings', JSON.stringify({
        theme: theme.value,
        loginCustomization: loginCustomization.value
      }))
    }
  }

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

  const init = () => {
    detectSystemTheme()
    loadFromLocalStorage()
    applyTheme(isDark.value)
  }

  return {
    theme,
    previewTheme,
    systemTheme,
    loginCustomization,
    isDark,
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
