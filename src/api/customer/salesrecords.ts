import request from '@/utils/request'

/**
 * 新增产品销售记录（支持批量）
 * @param data 包含 customer_id, products, sales_time, creator
 * @returns Promise<any>
 */
export function addSalesRecord(data: {
  customer_id: number;
  products: Array<{
    product_id: number;
    product_sku: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    remark:string;
  }>;
  sales_time: string;
  creator: number;
}) {
  return request({
    url: '/api/sales-records',
    method: 'post',
    data,
  });
}

/**
 * 获取单个客户的产品销售记录列表（支持分页）
 * @param params { customerId, page, limit }
 * @returns Promise<any>
 */
export function getSalesRecordsByCustomer(params: { customerId: number; page?: number; limit?: number }) {
  return request({
    url: `/api/sales-records/customer/${params.customerId}`,
    method: 'get',
    params: {
      page: params.page,
      limit: params.limit,
    },
  });
}


