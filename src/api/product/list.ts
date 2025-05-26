import request from '@/utils/request'

/**
 * 新增产品
 * @param data 产品信息
 * @returns Promise
 */
export function createProduct(data: {
  product_title: string
  product_type: string
  product_sku: string
  type_code: string
  category_id: number
  product_image?: string
  product_detail?: string
  remark?: string
  status?: number // 0-禁用 1-启用
}) {
  return request({
    url: '/api/products',
    method: 'post',
    data,
  })
}

/**
 * 获取产品列表
 * @param params 查询参数
 * @returns Promise
 */
export function getProductList(params?: {
  page?: number
  page_size?: number
  product_title?: string
  product_sku?: string
  category_id?: number
  status?: number
}) {
  return request({
    url: '/api/products',
    method: 'get',
    params,
  })
}

/**
 * 修改产品
 * @param productId 产品ID
 * @param data 产品信息（可选字段）
 * @returns Promise
 */
export function updateProduct(
  productId: number,
  data: {
    product_title?: string
    product_type?: string
    product_sku?: string
    category_id?: number
    type_code?: string
    product_image?: string
    product_detail?: string
    remark?: string
    status?: number
  },
) {
  return request({
    url: `/api/products/${productId}`,
    method: 'put',
    data,
  })
}

/**
 * 删除产品
 * @param productId 产品ID
 * @returns Promise
 */
export function deleteProduct(productId: number) {
  return request({
    url: `/api/products/${productId}`,
    method: 'delete',
  })
}

/**
 * 批量删除产品
 * @param productIds 产品ID数组
 * @returns Promise
 */
export function batchDeleteProducts(productIds: number[]) {
  return request({
    url: '/api/products/batch',
    method: 'delete',
    data: { productIds },
  })
}

/**
 * 获取产品分类统计
 * @returns Promise
 */
export function getProductCategoryStats() {
  return request({
    url: '/api/products/stats/category',
    method: 'get',
  })
}
