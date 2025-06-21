import request from '@/utils/request'

export interface InventoryTransferItem {
  product_id: number;
  product_size: string;
  quantity: number;
}

export interface CreateInventoryTransferPayload {
  from_warehouse_id: number;
  to_warehouse_id: number;
  remarks?: string;
  transfer_type: 'DOMESTIC' | 'CROSS_BORDER' | 'FBA' | 'OVERSEAS' | 'VMI' | 'HUB' | 'PRE_ALLOCATE' | 'EXCEPTION';
  items: InventoryTransferItem[];
}

/**
 * 创建库存调拨单
 * @param data CreateInventoryTransferPayload
 * @returns Promise<any>
 */
export function createInventoryTransfer(data: CreateInventoryTransferPayload): Promise<{ transfer_no: string }> {
  return request({
    url: '/api/inventory/transfers',
    method: 'post',
    data,
  });
}

export type TransferStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED';

export interface GetInventoryTransfersParams {
  page?: number;
  limit?: number;
  status?: TransferStatus;
  from_warehouse_id?: number;
  to_warehouse_id?: number;
  transfer_type?: 'DOMESTIC' | 'CROSS_BORDER' | 'FBA' | 'OVERSEAS' | 'VMI' | 'HUB' | 'PRE_ALLOCATE' | 'EXCEPTION';
}

export interface InventoryTransferListItem {
  transfer_no: string;
  transfer_type: string;
  transfer_type_cn: string;
  from_warehouse_id: number;
  from_warehouse_name: string;
  to_warehouse_id: number;
  to_warehouse_name: string;
  status: TransferStatus;
  remarks?: string;
  created_at?: string;
  updated_at?: string;
  // 其他字段可根据实际接口补充
}

export interface GetInventoryTransfersResponse {
  list: InventoryTransferListItem[];
  pagination: {
    total: number;
  };
}

/**
 * 查询所有库存调拨单
 * @param params GetInventoryTransfersParams
 * @returns Promise<GetInventoryTransfersResponse>
 */
export function getInventoryTransfers(params?: GetInventoryTransfersParams): Promise<GetInventoryTransfersResponse> {
  return request({
    url: '/api/inventory/transfers',
    method: 'get',
    params,
  });
}

export interface GetMyInventoryTransfersParams {
  page?: number;
  limit?: number;
  status?: TransferStatus;
}

/**
 * 查询我的库存调拨单
 * @param params GetMyInventoryTransfersParams
 * @returns Promise<GetInventoryTransfersResponse>
 */
export function getMyInventoryTransfers(params?: GetMyInventoryTransfersParams): Promise<GetInventoryTransfersResponse> {
  return request({
    url: '/api/inventory/my-transfers',
    method: 'get',
    params,
  });
}

export interface InventoryTransferDetailItem {
  product_id: number;
  product_title: string;
  product_sku: string;
  product_size: string;
  quantity: number;
}

export interface InventoryTransferDetail {
  transfer_no: string;
  transfer_type: string;
  transfer_type_cn: string;
  from_warehouse_id: number;
  from_warehouse_name: string;
  to_warehouse_id: number;
  to_warehouse_name: string;
  status: string;
  created_by: number;
  creator_name: string;
  created_at: string;
  items: InventoryTransferDetailItem[];
}

export interface GetInventoryTransferDetailResponse {
  data: InventoryTransferDetail;
}

/**
 * 查询单个调拨单详情
 * @param id 调拨单ID
 * @returns Promise<GetInventoryTransferDetailResponse>
 */
export function getInventoryTransferDetail(id: number): Promise<GetInventoryTransferDetailResponse> {
  return request({
    url: `/api/inventory/transfers/${id}`,
    method: 'get',
  });
}

/**
 * 执行调拨单
 * @param id 调拨单ID
 * @returns Promise<void>
 */
export function executeInventoryTransfer(id: number): Promise<void> {
  return request({
    url: `/api/inventory/transfers/${id}/execute`,
    method: 'post',
  });
}

/**
 * 取消调拨单
 * @param id 调拨单ID
 * @returns Promise<void>
 */
export function cancelInventoryTransfer(id: number): Promise<void> {
  return request({
    url: `/api/inventory/transfers/${id}/cancel`,
    method: 'put',
  });
}

// --- Inventory Transfer Stats Types ---

/**
 * @description 各仓库调拨统计
 */
export interface WarehouseTransferStats {
  warehouse_id: number;
  warehouse_name: string;
  from_count: number;
  to_count: number;
}

/**
 * @description 全系统月度调拨趋势
 */
export interface MonthlyTransfer {
  year: number;
  month: number;
  monthly_transfers: number;
}

/**
 * @description 个人月度调拨趋势
 */
export interface MyMonthlyTransfer {
  year: number;
  month: number;
  my_monthly_transfers: number;
}

/**
 * @description 库存调拨统计接口返回的数据结构
 */
export interface InventoryTransferStatsData {
  warehouseStats: WarehouseTransferStats[];
  monthlyTransfers: MonthlyTransfer[];
  myMonthlyTransfers: MyMonthlyTransfer[];
}

/**
 * @description 获取库存调拨统计
 * @returns {Promise<{ data: InventoryTransferStatsData }>}
 */
export function getInventoryTransferStats(): Promise<{ data: InventoryTransferStatsData }> {
  return request({
    url: '/api/inventory/stats/transfers',
    method: 'get',
  });
}
