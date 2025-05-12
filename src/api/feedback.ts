import axios from 'axios'
import type { AxiosResponse } from 'axios'

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
    const res = response.data
    // 如果响应码不为0，表示API请求出错
    if (res.code !== 0) {
      console.error('API请求失败:', res.message)
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    // 返回真正的数据
    return res.data
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

// 接口响应类型
interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

// 反馈列表请求参数
interface FeedbackListParams {
  pageNum?: number
  pageSize?: number
  status?: number
  feedbackType?: number
}

// 反馈列表响应类型
interface FeedbackListResponse {
  list: FeedbackItem[]
  total: number
  pageNum: number
  pageSize: number
  pages: number
  hasNext: boolean
  hasPrevious: boolean
}

// 反馈详情项
interface FeedbackItem {
  feedbackId: number
  userId: number
  username: string
  feedbackType: number
  feedbackTypeDesc: string
  feedbackTitle: string
  feedbackContent: string
  contactInfo: string
  images: string
  status: number
  statusDesc: string
  priorityLevel: number
  priorityLevelDesc: string
  adminId?: number
  adminReply?: string
  replyTime?: string
  createdTime: string
}

// 反馈回复请求参数
interface FeedbackReplyParams {
  feedbackId: number
  adminReply: string
  status: number
}

// 设置优先级请求参数
interface SetPriorityParams {
  feedbackId: number
  priorityLevel: number
}

// 反馈数量统计响应类型
interface FeedbackCountResponse {
  totalCount: number
  unprocessedCount: number
  processingCount: number
  processedCount: number
  typeCounts: {
    type1Count: number
    type2Count: number
    type3Count: number
    type4Count: number
    type5Count: number
  }
  priorityCounts: {
    normalCount: number
    importantCount: number
    urgentCount: number
  }
}

/**
 * 获取用户反馈列表
 * @param params 请求参数
 * @returns 反馈列表
 */
export const getFeedbackList = (params: FeedbackListParams = {}): Promise<FeedbackListResponse> => {
  return request.get('admin/feedback/list', { params })
}

/**
 * 获取反馈详情
 * @param feedbackId 反馈ID
 * @returns 反馈详情
 */
export const getFeedbackDetail = (feedbackId: number): Promise<FeedbackItem> => {
  return request.get(`feedback/detail/${feedbackId}`)
}

/**
 * 管理员回复反馈
 * @param params 回复参数
 * @returns 是否成功
 */
export const replyFeedback = (params: FeedbackReplyParams): Promise<boolean> => {
  return request.post('admin/feedback/reply', params)
}

/**
 * 设置反馈优先级
 * @param params 优先级参数
 * @returns 是否成功
 */
export const setPriorityLevel = (params: SetPriorityParams): Promise<boolean> => {
  return request.put('admin/feedback/priority', null, { params })
}

/**
 * 获取用户反馈消息的数量统计
 * @returns 反馈数量统计信息
 */
export const getFeedbackCount = (): Promise<FeedbackCountResponse> => {
  return request.get('admin/feedback/count')
}

// 导出反馈类型枚举
export const FeedbackTypeEnum = {
  FEATURE_SUGGESTION: 1,
  EXPERIENCE_ISSUE: 2,
  PRODUCT_RELATED: 3,
  LOGISTICS_RELATED: 4,
  OTHER: 5,
  getDesc(code: number): string {
    switch (code) {
      case 1: return '功能建议'
      case 2: return '体验问题'
      case 3: return '商品相关'
      case 4: return '物流相关'
      case 5: return '其他'
      default: return '未知'
    }
  }
}

// 导出反馈状态枚举
export const FeedbackStatusEnum = {
  UNPROCESSED: 0,
  PROCESSING: 1,
  PROCESSED: 2,
  getDesc(code: number): string {
    switch (code) {
      case 0: return '未处理'
      case 1: return '处理中'
      case 2: return '已处理'
      default: return '未知'
    }
  },
  getStatusType(code: number): string {
    switch (code) {
      case 0: return 'warning'
      case 1: return 'primary'
      case 2: return 'success'
      default: return 'info'
    }
  }
}

// 导出优先级枚举
export const PriorityLevelEnum = {
  NORMAL: 0,
  IMPORTANT: 1,
  URGENT: 2,
  getDesc(code: number): string {
    switch (code) {
      case 0: return '普通'
      case 1: return '重要'
      case 2: return '紧急'
      default: return '未知'
    }
  },
  getPriorityType(code: number): string {
    switch (code) {
      case 0: return 'info'
      case 1: return 'warning'
      case 2: return 'danger'
      default: return 'info'
    }
  }
} 