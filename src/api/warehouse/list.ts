import request from '@/utils/request'

/**
 * 新增仓库
 * @param data 仓库信息
 * @returns Promise<any>
 */
export function addWarehouse(data: {
  warehouse_id?: number;
  warehouse_name?: string;
  warehouse_address?: string;
  warehouse_status?: number;
  warehouse_type?: number;
  product_quantity?: number;
  warehouse_manager?: string;
  contact_number?: string;
  remark?: string;
}) {
  return request({
    url: '/api/warehouses',
    method: 'post',
    data,
  })
}

/**
 * 获取所有仓库列表（支持分页和条件查询）
 * @param params 查询参数 { page, limit, warehouse_name, warehouse_type, warehouse_status }
 * @returns Promise<any>
 */
export function getWarehouseList(params?: {
  page?: number;
  limit?: number;
  warehouse_name?: string;
  warehouse_type?: number;
  warehouse_status?: number;
}) {
  return request({
    url: '/api/warehouses',
    method: 'get',
    params,
  })
}

/**
 * 更新仓库
 * @param id 仓库ID
 * @param data 仓库信息
 * @returns Promise<any>
 */
export function updateWarehouse(id: number, data: {
  warehouse_id?: number;
  warehouse_name?: string;
  warehouse_address?: string;
  warehouse_status?: number;
  warehouse_type?: number;
  product_quantity?: number;
  warehouse_manager?: string;
  contact_number?: string;
  remark?: string;
}) {
  return request({
    url: `/api/warehouses/${id}`,
    method: 'put',
    data,
  })
}

/**
 * 删除仓库
 * @param id 仓库ID
 * @returns Promise<any>
 */
export function deleteWarehouse(id: number) {
  return request({
    url: `/api/warehouses/${id}`,
    method: 'delete',
  })
}

/**
 * 批量删除仓库
 * @param ids 要删除的仓库ID数组
 * @returns Promise<any>
 */
export function batchDeleteWarehouses(ids: number[]) {
  return request({
    url: '/api/warehouses',
    method: 'delete',
    data: { ids },
  })
}

/**
 * @description 获取各仓库统计数据
 */
export interface WarehouseStat {
  warehouse_id: number;
  warehouse_name: string;
  product_count: number;
  total_stock_quantity: number;
}

export function getProductWarehouseStats(): Promise<{ data: WarehouseStat[] }> {
  return request({
    url: '/api/product-warehouses/stats',
    method: 'get',
  })
}