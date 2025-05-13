import request from '@/utils/request'

/**
 * 获取数据摘要
 * @returns 数据摘要信息
 */
export function getDataSummary() {
  return request({
    url: '/data/analysis/summary',
    method: 'get'
  })
}

/**
 * 获取商品分类统计
 * @returns 商品分类统计数据
 */
export function getProductCategoryAnalysis() {
  return request({
    url: '/data/analysis/product/category',
    method: 'get'
  })
}

/**
 * 获取商品价格区间统计
 * @returns 商品价格区间统计数据
 */
export function getProductPriceRangeAnalysis() {
  return request({
    url: '/data/analysis/product/price/range',
    method: 'get'
  })
}

/**
 * 获取商品成色统计
 * @returns 商品成色统计数据
 */
export function getProductConditionAnalysis() {
  return request({
    url: '/data/analysis/product/condition',
    method: 'get'
  })
}

/**
 * 获取商品状态统计
 * @returns 商品状态统计数据
 */
export function getProductStatusAnalysis() {
  return request({
    url: '/data/analysis/product/status',
    method: 'get'
  })
}

/**
 * 获取商品发布趋势
 * @param days 天数
 * @returns 商品发布趋势数据
 */
export function getProductTrend(days = 30) {
  return request({
    url: '/data/analysis/product/trend',
    method: 'get',
    params: { days }
  })
}

/**
 * 获取用户注册趋势
 * @param days 天数
 * @returns 用户注册趋势数据
 */
export function getUserRegisterTrend(days = 30) {
  return request({
    url: '/data/analysis/user/register/trend',
    method: 'get',
    params: { days }
  })
}

/**
 * 获取订单趋势
 * @param days 天数
 * @returns 订单趋势数据
 */
export function getOrderTrend(days = 30) {
  return request({
    url: '/data/analysis/order/trend',
    method: 'get',
    params: { days }
  })
}

/**
 * 获取订单金额趋势
 * @param days 天数
 * @returns 订单金额趋势数据
 */
export function getOrderAmountTrend(days = 30) {
  return request({
    url: '/data/analysis/order/amount/trend',
    method: 'get',
    params: { days }
  })
}

/**
 * 获取订单状态统计
 * @returns 订单状态统计数据
 */
export function getOrderStatusAnalysis() {
  return request({
    url: '/data/analysis/order/status',
    method: 'get'
  })
}

/**
 * 获取活跃用户统计
 * @param days 天数
 * @returns 活跃用户统计数据
 */
export function getUserActiveAnalysis(days = 30) {
  return request({
    url: '/data/analysis/user/active',
    method: 'get',
    params: { days }
  })
}

/**
 * 获取热门商品
 * @param limit 数量限制
 * @returns 热门商品数据
 */
export function getHotProducts(limit = 10) {
  return request({
    url: '/data/analysis/product/hot',
    method: 'get',
    params: { limit }
  })
}

/**
 * 获取自定义日期范围数据分析
 * @param startDate 开始日期
 * @param endDate 结束日期
 * @returns 自定义日期范围数据分析
 */
export function getCustomAnalysis(startDate: string, endDate: string) {
  return request({
    url: '/data/analysis/custom',
    method: 'get',
    params: { startDate, endDate }
  })
} 