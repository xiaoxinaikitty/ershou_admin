import axios from 'axios'

// 创建axios实例
const request = axios.create({
  baseURL: '/api',
  timeout: 10000
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    // 响应错误处理
    if (error.response && error.response.status === 401) {
      // 未登录或token过期，重定向到登录页
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// 用户注册
export function register(username: string, password: string) {
  return request({
    url: '/user/register',
    method: 'post',
    data: {
      username,
      password
    }
  })
}

// 用户登录
export function login(username: string, password: string) {
  return request({
    url: '/user/login',
    method: 'post',
    data: {
      username,
      password
    }
  })
}

// 管理员登录
export function adminLogin(username: string, password: string) {
  return request({
    url: '/user/admin',
    method: 'post',
    data: {
      username,
      password
    }
  })
}

// 添加用户地址
export function addUserAddress(addressData: {
  consignee: string
  region: string
  detail: string
  contactPhone: string
  isDefault: boolean
}) {
  return request({
    url: '/user/address',
    method: 'post',
    data: addressData
  })
}

// 获取用户信息
export function getUserInfo() {
  return request({
    url: '/user/info',
    method: 'get'
  })
}

// 修改用户信息
export function updateUserInfo(userData: {
  phone?: string
  email?: string
  avatar?: string
}) {
  return request({
    url: '/user/info',
    method: 'put',
    data: userData
  })
}

// 修改用户密码
export function updatePassword(passwordData: {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}) {
  return request({
    url: '/user/password',
    method: 'put',
    data: passwordData
  })
}

// 获取用户角色信息
export function getUserRole() {
  return request({
    url: '/user/role',
    method: 'get'
  })
}

// 修改用户角色（管理员功能）
export function updateUserRole(roleData: {
  targetUserId: number
  role: string
}) {
  return request({
    url: '/admin/user/role',
    method: 'put',
    data: roleData
  })
}

// 封禁用户（管理员功能）
export function banUser(banData: {
  targetUserId: number
  banReason?: string
}) {
  return request({
    url: '/admin/user/ban',
    method: 'put',
    data: banData
  })
}

// 解封用户（管理员功能）
export function unbanUser(targetUserId: number) {
  return request({
    url: '/admin/user/unban',
    method: 'put',
    data: {
      targetUserId
    }
  })
} 