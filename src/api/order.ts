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

// 地址信息接口
export interface AddressInfo {
  receiverName: string
  receiverPhone: string
  province: string
  city: string
  district: string
  detailAddress: string
}

// 创建订单
export function createOrder(orderData: {
  productId: number
  sellerId: number
  paymentType: number
  deliveryType: number
  orderAmount: number
  paymentAmount: number
  deliveryFee?: number
  remark?: string
  address: AddressInfo
}) {
  return request({
    url: '/order/create',
    method: 'post',
    data: orderData
  })
}

// 获取订单列表
export function getOrderList(params?: {
  status?: number
  pageNum?: number
  pageSize?: number
}) {
  return request({
    url: '/order/list',
    method: 'get',
    params
  })
}

// 取消订单
export function cancelOrder(orderId: number) {
  return request({
    url: `/order/cancel/${orderId}`,
    method: 'post'
  })
}

// 订单支付
export function payOrder(orderId: number, paymentData: {
  payMethod: number
  payAccount?: string
}) {
  return request({
    url: `/order/pay/${orderId}`,
    method: 'post',
    data: paymentData
  })
}

// 确认收货
export function confirmOrder(orderId: number) {
  return request({
    url: `/order/confirm/${orderId}`,
    method: 'post'
  })
}

// 获取订单详情
export function getOrderDetail(orderId: number) {
  return request({
    url: `/order/detail/${orderId}`,
    method: 'get'
  })
}

// 订单发货
export function shipOrder(orderId: number, shipData: {
  expressCompany: string
  expressNo: string
}) {
  return request({
    url: `/order/ship/${orderId}`,
    method: 'post',
    data: shipData
  })
} 