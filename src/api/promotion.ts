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

// 图片类型接口
export interface PromotionImage {
  imageId?: number
  promotionId?: number
  imageUrl: string
  imageType: number
  imageTypeDesc?: string
  sortOrder?: number
  createdTime?: string
}

// 添加图片请求接口
export interface PromotionImageAddRequest {
  imageUrl: string
  imageType: number
  sortOrder?: number
}

// 营销活动接口
export interface Promotion {
  promotionId?: number
  title: string
  description?: string
  promotionType: number
  promotionTypeDesc?: string
  startTime: string
  endTime: string
  status: number
  statusDesc?: string
  sortOrder?: number
  urlLink?: string
  createdBy?: number
  createdByUsername?: string
  createdTime?: string
  updatedTime?: string
  images?: PromotionImage[]
}

// 添加营销活动请求接口
export interface PromotionAddRequest {
  title: string
  description?: string
  promotionType: number
  startTime: string
  endTime: string
  status: number
  sortOrder?: number
  urlLink?: string
  images?: PromotionImageAddRequest[]
}

// 更新营销活动请求接口
export interface PromotionUpdateRequest {
  promotionId: number
  title: string
  description?: string
  promotionType: number
  startTime: string
  endTime: string
  status: number
  sortOrder?: number
  urlLink?: string
  images?: PromotionImageAddRequest[]
}

// 查询营销活动请求接口
export interface PromotionQueryRequest {
  title?: string
  promotionType?: number
  status?: number
  startTimeBegin?: string
  startTimeEnd?: string
  endTimeBegin?: string
  endTimeEnd?: string
  pageNum?: number
  pageSize?: number
}

// 分页结果接口
export interface PageResult<T> {
  list: T[]
  total: number
  pageNum: number
  pageSize: number
  pages: number
  hasNext: boolean
  hasPrevious: boolean
}

/**
 * 添加营销活动
 * @param data 添加信息
 * @returns 活动ID
 */
export function addPromotion(data: PromotionAddRequest): Promise<number> {
  return request.post('/admin/promotion/add', data)
}

/**
 * 更新营销活动
 * @param data 更新信息
 * @returns 是否成功
 */
export function updatePromotion(data: PromotionUpdateRequest): Promise<boolean> {
  return request.put('/admin/promotion/update', data)
}

/**
 * 删除营销活动
 * @param promotionId 活动ID
 * @returns 是否成功
 */
export function deletePromotion(promotionId: number): Promise<boolean> {
  return request.delete(`/admin/promotion/delete/${promotionId}`)
}

/**
 * 更新营销活动状态
 * @param promotionId 活动ID
 * @param status 状态(0下线 1上线)
 * @returns 是否成功
 */
export function updateStatus(promotionId: number, status: number): Promise<boolean> {
  return request.put(`/admin/promotion/status?promotionId=${promotionId}&status=${status}`)
}

/**
 * 分页查询营销活动列表
 * @param params 查询条件
 * @returns 分页结果
 */
export function getPromotionList(
  params: PromotionQueryRequest
): Promise<PageResult<Promotion>> {
  return request.get('/admin/promotion/list', { params })
}

/**
 * 查询营销活动详情
 * @param promotionId 活动ID
 * @returns 活动详情
 */
export function getPromotionDetail(promotionId: number): Promise<Promotion> {
  return request.get(`/promotion/detail/${promotionId}`)
}

/**
 * 查询有效的营销活动列表（用于前台展示）
 * @param limit 限制数量，默认8个
 * @returns 活动列表
 */
export function getActivePromotions(limit?: number): Promise<Promotion[]> {
  return request.get('/promotion/active', { params: { limit } })
} 