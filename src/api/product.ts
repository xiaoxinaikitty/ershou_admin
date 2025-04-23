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

// 商品基础模块

// 添加商品
export function addProduct(productData: {
  title: string
  description: string
  price: number
  originalPrice: number
  categoryId: number
  conditionLevel: number
  location: string
}) {
  return request({
    url: '/product/add',
    method: 'post',
    data: productData
  })
}

// 获取商品详情
export function getProductDetail(productId: number) {
  return request({
    url: `/product/detail/${productId}`,
    method: 'get'
  })
}

// 更新商品信息
export function updateProduct(productData: {
  productId: number
  title?: string
  description?: string
  price?: number
  originalPrice?: number
  categoryId?: number
  conditionLevel?: number
  location?: string
}) {
  return request({
    url: '/product/update',
    method: 'put',
    data: productData
  })
}

// 删除商品
export function deleteProduct(productId: number) {
  return request({
    url: `/product/delete/${productId}`,
    method: 'delete'
  })
}

// 商品收藏模块

// 收藏商品
export function addFavorite(productId: number) {
  return request({
    url: '/product/favorite/add',
    method: 'post',
    data: { productId }
  })
}

// 取消收藏商品
export function removeFavorite(productId: number) {
  return request({
    url: `/product/favorite/${productId}`,
    method: 'delete'
  })
}

// 获取收藏列表
export function getFavoriteList() {
  return request({
    url: '/product/favorite/list',
    method: 'get'
  })
}

// 商品图片模块

// 添加商品图片
export function addProductImage(imageData: {
  productId: number
  imageUrl: string
  isMain: number
  sortOrder?: number
}) {
  return request({
    url: '/product/image/add',
    method: 'post',
    data: imageData
  })
}

// 删除商品图片
export function deleteProductImage(productId: number, imageId: number) {
  return request({
    url: `/product/image/${productId}/${imageId}`,
    method: 'delete'
  })
}

// 商品举报模块

// 举报商品
export function reportProduct(reportData: {
  productId: number
  reportType: number
  reportContent: string
}) {
  return request({
    url: '/product/report/add',
    method: 'post',
    data: reportData
  })
}

// 获取商品举报列表（管理员权限）
export function getProductReportList(productId: number) {
  return request({
    url: `/product/report/list/${productId}`,
    method: 'get'
  })
}

// 商品交易方式模块

// 添加交易方式（管理员权限）
export function addTradeMethod(methodData: {
  methodName: string
  methodDesc: string
}) {
  return request({
    url: '/product/trade/method/add',
    method: 'post',
    data: methodData
  })
} 