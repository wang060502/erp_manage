import request from '@/utils/request'

/**
 * @description 单个库存调整项的接口定义
 */
export interface InventoryAdjustItem {
  product_id: number; // 商品ID
  warehouse_id: number; // 仓库ID
  product_size: string; // 商品规格/尺码
  change_quantity: number; // 变动数量（入库为正，出库为负）
}

/**
 * @description 库存调整接口的请求体定义
 */
export interface AdjustInventoryPayload {
  operation_type: 'INBOUND' | 'OUTBOUND' | 'ADJUSTMENT';
  operation_subtype?: string; // 新增
  operation_no?: string;
  remarks?: string;
  items: InventoryAdjustItem[];
}

/**
 * @description 库存调整（统一处理入库、出库、盘点）
 * @param {AdjustInventoryPayload} data - 请求体，包含操作类型、关联单号、备注和调整项目列表
 * @returns {Promise<any>}
 */
export function adjustInventory(data: AdjustInventoryPayload) {
  return request({
    url: '/api/inventory/adjust',
    method: 'post',
    data,
  })
}

/**
 * @description 查询库存操作记录的参数接口定义
 */
export interface GetInventoryLogsParams {
  page?: number;
  limit?: number;
  product_id?: number;
  warehouse_id?: number;
  operation_type?: 'INBOUND' | 'OUTBOUND' | 'ADJUSTMENT';
  operation_subtype?: string; // 新增
  operator_id?: number;
  reference_no?: string;
  start_time?: string;
  end_time?: string;
}

/**
 * @description 查询所有库存操作记录
 * @param {GetInventoryLogsParams} params - 查询参数，包含分页、筛选条件等
 * @returns {Promise<any>}
 */
export function getInventoryLogs(params?: GetInventoryLogsParams) {
  return request({
    url: '/api/inventory/logs',
    method: 'get',
    params,
  })
}

/**
 * @description 查询"我的"库存操作记录的参数接口定义
 */
export interface GetMyInventoryLogsParams {
  page?: number;
  limit?: number;
  operation_type?: 'INBOUND' | 'OUTBOUND' | 'ADJUSTMENT';
  start_time?: string;
  end_time?: string;
}

/**
 * @description 查询当前登录用户自己的库存操作记录
 * @param {GetMyInventoryLogsParams} params - 查询参数，包含分页和操作类型
 * @returns {Promise<any>}
 */
export function getMyInventoryLogs(params?: GetMyInventoryLogsParams) {
  return request({
    url: '/api/inventory/my-logs',
    method: 'get',
    params,
  })
}

/**
 * @description 导出库存操作记录（Excel）
 * @param {GetInventoryLogsParams} params - 查询参数，包含筛选条件
 * @returns {Promise<ExportInventoryLogsResponse>}
 */
export interface ExportInventoryLogsResponse {
  code: number;
  message: string;
  url: string;
}

export function exportInventoryLogs(params?: GetInventoryLogsParams): Promise<ExportInventoryLogsResponse> {
  return request({
    url: '/api/inventory/logs/export',
    method: 'get',
    params,
  });
}


// --- Inventory Stats Types ---

/**
 * @description 各操作类型总单数
 */
export interface TotalOrderStats {
  operation_type: string;
  total_orders: number;
  operation_type_cn: string;
}

/**
 * @description 各类型月度单数趋势
 */
export interface MonthlyOrderStats {
  year: number;
  month: number;
  operation_type: string;
  monthly_orders: number;
  operation_type_cn: string;
}

/**
 * @description 操作最频繁的商品Top 20
 */
export interface TopProductStats {
  product_id: number;
  product_title: string;
  product_sku: string;
  operation_count: number;
}

/**
 * @description 当前用户的个人统计
 */
export interface MyStats {
  totalOrders: TotalOrderStats[];
  monthlyOrders: MonthlyOrderStats[];
}

/**
 * @description 库存操作统计接口返回的数据结构
 */
export interface InventoryStatsData {
  totalOrders: TotalOrderStats[];
  monthlyOrders: MonthlyOrderStats[];
  topProducts: TopProductStats[];
  myStats: MyStats;
}

/**
 * @description 获取库存操作统计
 * @returns {Promise<{ data: InventoryStatsData }>}
 */
export function getInventoryStatsOperations(): Promise<{ data: InventoryStatsData }> {
  return request({
    url: '/api/inventory/stats/operations',
    method: 'get',
  })
}

/**
 * @description 获取我的出入库统计
 * @returns {Promise<{ data: InventoryStatsData }>}
 */
export function getMyInventoryStats(): Promise<{ data: InventoryStatsData }> {
  return request({
    url: '/api/inventory/my-stats',
    method: 'get',
  })
}

/**
 * @description 按操作单号删除库存操作记录（回滚库存）
 * @param referenceNo 操作单号
 * @returns Promise<RollbackByReferenceResponse>
 */
export interface RollbackByReferenceResponse {
  code: number;
  message: string;
  data?: Record<string, never>;
}

export function rollbackInventoryByReference(referenceNo: string): Promise<RollbackByReferenceResponse> {
  return request({
    url: `/api/inventory/logs/by-reference/${encodeURIComponent(referenceNo)}`,
    method: 'delete',
  })
}
