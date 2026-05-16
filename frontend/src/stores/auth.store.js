import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '../api/auth.api'
import router, { resetSessionCheck } from '../router'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  // Getters
  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.role === 'ADMIN')
  const userInitials = computed(() => {
    if (!user.value?.username) return '?'
    return user.value.username.slice(0, 2).toUpperCase()
  })

  // Actions
  const register = async (credentials) => {
    isLoading.value = true
    error.value = null
    try {
      await authApi.register(credentials)
      router.push('/login')
      return { success: true }
    } catch (err) {
      error.value = err.response?.data?.message || 'Registration failed'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const login = async (credentials) => {
    isLoading.value = true
    error.value = null
    try {
      const { data } = await authApi.login(credentials)
      user.value = data.data.user
      // Reset session check so next navigation properly reflects logged-in state
      resetSessionCheck()
      router.push('/dashboard')
      return { success: true }
    } catch (err) {
      error.value = err.response?.data?.message || 'Login failed'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    try {
      await authApi.logout()
    } finally {
      user.value = null
      // Reset so session is re-checked after next login
      resetSessionCheck()
      router.push('/login')
    }
  }

  const fetchCurrentUser = async () => {
    try {
      const { data } = await authApi.me()
      user.value = data.data
      return true
    } catch {
      user.value = null
      return false
    }
  }

  return {
    user, isLoading, error,
    isAuthenticated, isAdmin, userInitials,
    register, login, logout, fetchCurrentUser,
  }
})