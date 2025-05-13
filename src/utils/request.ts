import axios from 'axios'
import { ElMessage } from 'element-plus'

// 创建axios实例
const service = axios.create({
  // 使用vite.config.ts中配置的代理前缀
  baseURL: '/api',
  timeout: 30000, // 增加超时时间
  headers: {
    'Content-Type': 'application/json;charset=utf-8'
  }
})

// 定义接口返回的统一格式
interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  success?: boolean;
}

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 从localStorage获取token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    
    // 添加时间戳防止缓存
    if (config.method?.toLowerCase() === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      }
    }
    
    console.log(`发送请求: ${config.url}`, config)
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    const res = response.data
    
    console.log(`收到响应: ${response.config.url}`, res)
    
    // 判断请求是否成功，接受code=0或code=200或success=true作为成功标志
    if (res.code === 0 || res.code === 200 || res.success === true) {
      return res
    } else {
      ElMessage.error(res.message || '请求失败')
      
      // 如果是未登录状态，重定向到登录页
      if (res.code === 401) {
        localStorage.removeItem('token')
        window.location.href = '/login'
      }
      
      return Promise.reject(new Error(res.message || '请求失败'))
    }
  },
  error => {
    // 获取详细错误信息
    let errorMessage = '网络错误';
    
    if (error.response) {
      // 服务器返回了错误状态码
      console.error('响应错误:', error.response.status, error.response.data);
      errorMessage = `服务器错误(${error.response.status}): ${error.response.data?.message || '未知错误'}`;
    } else if (error.request) {
      // 请求已发送但没有收到响应
      console.error('请求超时或网络错误:', error.request);
      if (error.code === 'ECONNABORTED') {
        errorMessage = '请求超时，请检查网络';
      } else {
        errorMessage = '无法连接到服务器，请检查网络';
      }
    } else {
      // 请求配置出错
      console.error('请求配置错误:', error.message);
      errorMessage = error.message;
    }
    
    ElMessage.error(errorMessage)
    return Promise.reject(error)
  }
)

export default service 