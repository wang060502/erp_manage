// 类型中文映射
export const subtypeMap = {
  // 入库
  PURCHASE_INBOUND: '采购入库',
  TRANSFER_INBOUND: '调拨入库',
  RETURN_INBOUND: '退货入库',
  STOCK_PREPARE: '备货入库',
  INVENTORY_PROFIT: '盘盈入库',
  OTHER_INBOUND: '其他入库',
  // 出库
  SALES_OUTBOUND: '销售出库',
  TRANSFER_OUTBOUND: '调拨出库',
  RETURN_SUPPLIER: '退供出库',
  SAMPLE_OUTBOUND: '样品出库',
  INVENTORY_LOSS: '盘亏出库',
  SCRAP_OUTBOUND: '报废出库',
  VIRTUAL_OUTBOUND: '虚拟出库',
  // 盘点
  FULL_CHECK: '全盘',
  SAMPLE_CHECK: '抽盘',
  CYCLE_CHECK: '循环盘点',
  ASSIGN_CHECK: '指定盘点',
  SYSTEM_CHECK: '系统触发盘点',
};

export const transferTypeMap = {
  DOMESTIC: '国内调拨',
  CROSS_BORDER: '跨境调拨',
  FBA: 'FBA调拨',
  OVERSEAS: '海外调拨',
  VMI: 'VMI调拨',
  HUB: '中转仓调拨',
  PRE_ALLOCATE: '预先分配',
  EXCEPTION: '异常调拨',
};

