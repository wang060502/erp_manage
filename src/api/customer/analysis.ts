import request from '@/utils/request'

/**
 * 获取客户统计数据
 * @param params 查询参数（可选）
 * @returns Promise
 */
export function getCustomerStats(params?: {
  customer_status?: string //潜在客户,成交客户,战略合作,无效客户
  customer_level?: string //重要客户,一般客户
  payment_status?: string //待付款,已付款部分,已结清
}) {
  return request({
    url: '/api/customers/stats',
    method: 'get',
    params,
  })
}

/**
 * 获取客户消费排行
 * @param params 查询参数（可选）
 * @returns Promise
 */
export function getCustomerConsumptionRanking(params?: {
  customer_level?: string // 重要客户, 一般客户
}) {
  return request({
    url: '/api/customers/consumption-ranking',
    method: 'get',
    params,
  })
}

/**
 * 获取客户销售业绩统计
 * @returns Promise
 */
export function getCustomerSalesPerformance() {
  return request({
    url: '/api/customers/sales-performance',
    method: 'get',
  })
}

/**
 * 获取我的客户统计
 * @returns Promise
 */
export function getMyCustomerStats() {
  return request({
    url: '/api/customers/my-stats',
    method: 'get',
  })
}
