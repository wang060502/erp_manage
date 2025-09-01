import request from '@/utils/request'

/**
 * 新增产品-仓库库存记录（支持批量）
 * @param items 产品库存记录数组
 * @returns Promise<any>
 */
export function addProductWarehouseRecords(items: Array<{
  product_id: number;
  product_size: string;
  stock_quantity: number;
  warehouse_id: number;
  safe_stock_quantity: number;
}>) {
  return request({
    url: '/api/product-warehouses',
    method: 'post',
    data: { items },
  })
}

/**
 * 获取所有产品-仓库库存
 * @param params 查询参数 { page, limit, product_name, product_sku, warehouse_id }
 * @returns Promise<any>
 */
export function getProductWarehouseList(params?: {
  page?: number;
  limit?: number;
  product_id?: number;
  product_name?: string;
  product_sku?: string;
  warehouse_id?: number;
  safe_stock_quantity?: number;
}) {
  return request({
    url: '/api/product-warehouses',
    method: 'get',
    params,
  })
}

/**
 * 批量更新产品-仓库库存记录
 * @param id 主库存记录ID（可传0或任意，实际用body的items）
 * @param items 更新项数组
 * @returns Promise<any>
 */
export function updateProductWarehouseRecords(id: number, items: Array<{
  id?: number;  // 更新时必填，新增时不需要
  product_id: number;
  product_size: string;
  warehouse_id: number;
  stock_quantity: number;
  safe_stock_quantity?: number;
}>) {
  return request({
    url: `/api/product-warehouses/${id}`,
    method: 'put',
    data: { items },
  })
}

/**
 * 删除产品-仓库库存记录
 * @param product_id 产品ID
 * @returns Promise<any>
 */
export function deleteProductWarehouseRecord(product_id: number) {
  return request({
    url: `/api/product-warehouses/${product_id}`,
    method: 'delete',
  })
}

/**
 * 根据产品ID查询该产品所有仓库的库存列表
 * @param productId 产品ID
 * @returns Promise<any>
 */
export function getWarehousesByProductId(productId: number) {
  return request({
    url: `/api/product-warehouses/product/${productId}`,
    method: 'get',
  })
}

/**
 * 获取库存预警提醒列表
 * @returns Promise<any>
 */
export function getProductWarehouseWarningList(params?: {
  page?: number;
  limit?: number;
}) {
  return request({
    url: '/api/product-warehouses/warning',
    method: 'get',
    params,
  })
}

/**
 * 导出指定仓库库存为Excel
 * @param warehouseId 仓库ID
 * @returns Promise<any> 返回Excel文件流
 */
export function exportWarehouseInventoryToExcel(warehouseId: number) {
  return request({
    url: `/api/product-warehouses/export/${warehouseId}`,
    method: 'get',
    // 移除 responseType: 'blob'，因为这可能导致响应拦截器问题
  })
}

