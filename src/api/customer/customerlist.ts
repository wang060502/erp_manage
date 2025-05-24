import request from '@/utils/request'

// 新增客户
export function createCustomer(data: {
  customer_name: string
  customer_status: string
  customer_level: string
  payment_status: string
  customer_source?: string
  customer_address?: string
  customer_detail?: string
  deal_price?: number
  status?: number
  creator: number
}) {
  return request({
    url: '/api/customers',
    method: 'post',
    data,
  })
}

// 获取客户列表
export function getCustomerList(params: {
  page?: number
  limit?: number
  customer_name?: string
  customer_status?: string
  payment_status?: string
  creator_id?: number
}) {
  return request({
    url: '/api/customers',
    method: 'get',
    params,
  })
}

// 获取客户创建者列表
export function getCustomerCreators() {
  return request({
    url: '/api/customers/creators',
    method: 'get',
  })
}

// 修改客户
export function updateCustomer(
  customerId: number,
  data: {
    customer_name?: string
    customer_status?: string
    customer_level?: string
    payment_status?: string
    customer_source?: string
    customer_address?: string
    customer_detail?: string
    deal_price?: number
    status?: number
  },
) {
  return request({
    url: `/api/customers/${customerId}`,
    method: 'put',
    data,
  })
}

// 删除客户
export function deleteCustomer(customerId: number) {
  return request({
    url: `/api/customers/${customerId}`,
    method: 'delete',
  })
}

// 批量删除客户
export function batchDeleteCustomers(customerIds: number[]) {
  return request({
    url: '/api/customers/batch',
    method: 'delete',
    data: { customerIds },
  })
}
