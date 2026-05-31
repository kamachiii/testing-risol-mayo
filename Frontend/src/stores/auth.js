import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import api from '@/services/api'

const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp * 1000 < Date.now()
  } catch { return true }
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('user')) || null)
  const token = ref(localStorage.getItem('token') || null)

  // Auto-logout if token expired
  if (token.value && isTokenExpired(token.value)) {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/login', { email, password })
      if (data.status === 'success') {
        token.value = data.data.token
        user.value = data.data.user
        localStorage.setItem('token', data.data.token)
        localStorage.setItem('user', JSON.stringify(data.data.user))
        api.defaults.headers.common['Authorization'] = `Bearer ${data.data.token}`
        return { success: true }
      }
      return { success: false, message: data.message }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Gagal login' 
      }
    }
  }

  const register = async ({ name, email, password }) => {
    try {
      const { data } = await api.post('/register', { name, email, password })
      if (data.status === 'success') {
        return { success: true, message: 'Registrasi berhasil! Silakan login.' }
      }
      return { success: false, message: data.message }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Gagal register' 
      }
    }
  }

  const logout = async () => {
    try {
      await api.post('/logout')
    } catch (e) {
      // ignore error
    }
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    delete api.defaults.headers.common['Authorization']
  }

  // Initialize token in headers if exists
  if (token.value) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
  }

  // Auto-logout on 401
  api.interceptors.response.use(
    res => res,
    err => {
      if (err.response?.status === 401 && token.value) {
        token.value = null
        user.value = null
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        delete api.defaults.headers.common['Authorization']
      }
      return Promise.reject(err)
    }
  )

  return { user, token, isLoggedIn, isAdmin, login, register, logout }
})
