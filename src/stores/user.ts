import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import * as userApi from '@/api/user'

export interface UserInfo {
  userId: number
  username: string
  phone: string | null
  email: string | null
  avatar: string | null
  role: string
  balance: number
  isLocked: boolean
  createTime: string
}

export const useUserStore = defineStore('user', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const userInfo = ref<UserInfo | null>(null)
  const isAdmin = computed(() => userInfo.value?.role === '系统管理员')
  const isLoggedIn = computed(() => !!token.value)

  // 设置token
  function setToken(newToken: string | null) {
    token.value = newToken
    if (newToken) {
      localStorage.setItem('token', newToken)
    } else {
      localStorage.removeItem('token')
    }
  }

  // 用户登录
  async function login(username: string, password: string) {
    try {
      const res = await userApi.login(username, password)
      if (res.code === 0) {
        setToken(res.data)
        await fetchUserInfo()
      }
      return res
    } catch (error) {
      return { code: -1, message: '登录失败', data: null }
    }
  }

  // 管理员登录
  async function adminLogin(username: string, password: string) {
    try {
      const res = await userApi.adminLogin(username, password)
      if (res.code === 0) {
        setToken(res.data.token)
        await fetchUserInfo()
      }
      return res
    } catch (error) {
      return { code: -1, message: '登录失败', data: null }
    }
  }

  // 获取用户信息
  async function fetchUserInfo() {
    if (!token.value) return null
    
    try {
      const res = await userApi.getUserInfo()
      if (res.code === 0) {
        userInfo.value = res.data
        return res.data
      }
      return null
    } catch (error) {
      return null
    }
  }

  // 退出登录
  function logout() {
    setToken(null)
    userInfo.value = null
  }

  return {
    token,
    userInfo,
    isAdmin,
    isLoggedIn,
    login,
    adminLogin,
    fetchUserInfo,
    logout
  }
}) 