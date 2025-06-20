import request from '@/utils/request'

/**
 * 新增产品销售记录（支持批量）
 * @param data 包含 customer_id, products, sales_time, creator
 * @returns Promise<any>
 */
export function addSalesRecord(data: {
  customer_id: number
  products: Array<{
    product_id: number
    product_sku: string
    quantity: number
    unit_price: number
    total_price: number
    remark: string
    product_warehouse_id: number
  }>
  sales_time: string
  payment_status?: string
  payment_image?: string
}) {
  return request({
    url: '/api/sales-records',
    method: 'post',
    data,
  })
}

/**
 * 获取单个客户的产品销售记录列表（支持分页）
 * @param params { customerId, page, limit }
 * @returns Promise<any>
 */
export function getSalesRecordsByCustomer(params: {
  customerId: number
  page?: number
  limit?: number
}) {
  return request({
    url: `/api/sales-records/customer/${params.customerId}`,
    method: 'get',
    params: {
      page: params.page,
      limit: params.limit,
    },
  })
}

/**
 * 删除指定客户某时间点的销售记录
 * @param customerId 客户ID
 * @param salesTime 销售时间（字符串，格式如 '2024-05-26T00:00:00Z'）
 * @returns Promise<any>
 */
export function deleteSalesRecordByCustomerAndTime(customerId: number, salesTime: string) {
  return request({
    url: `/api/sales-records/customer/${customerId}/sales-time/${salesTime}`,
    method: 'delete',
  })
}

/**
 * 批量修改销售记录的付款状态
 * @param recordIds 销售记录ID数组
 * @param payment_status 新的付款状态
 * @returns Promise<any>
 */
export function updateSalesRecordPaymentStatus(recordIds: number[], payment_status: string) {
  return request({
    url: '/api/sales-records/payment-status',
    method: 'patch',
    data: {
      record_ids: recordIds,
      payment_status,
    },
  })
}

/**
 * 查询所有销售记录列表
 * @param params 查询参数
 * @returns Promise<any>
 */
export function getAllSalesRecords(params: {
  creator?: number
  payment_status?: string
  start_time?: string
  end_time?: string
  warehouse_id?: number
  warehouse_name?: string
  page?: number
  limit?: number
}) {
  return request({
    url: '/api/sales-records',
    method: 'get',
    params,
  })
}

/**
 * 导出销售记录列表到CSV
 * @param params 查询参数，支持 creator, payment_status, start_time, end_time, warehouse_id, warehouse_name, page, limit
 * @returns Promise<Blob>
 */
export function exportSalesRecordsToCSV(params: {
  creator?: number
  payment_status?: string
  start_time?: string
  end_time?: string
  warehouse_id?: number
  warehouse_name?: string
  page?: number
  limit?: number
}) {
  return request({
    url: '/api/sales-records/export',
    method: 'get',
    params
  })
}

