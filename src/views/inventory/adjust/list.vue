<template>
  <div class="page-container">
    <el-card class="main-card">
      <div class="page-header">
        <span class="page-title">库存操作记录</span>
      </div>

      <!-- Filter Bar -->
      <div class="filter-bar-row">
        <div class="filter-bar-left">
          <el-select v-model="queryParams.operation_type" placeholder="操作类型" clearable class="filter-item">
            <el-option label="入库" value="INBOUND" />
            <el-option label="出库" value="OUTBOUND" />
            <el-option label="盘点" value="ADJUSTMENT" />
          </el-select>
          <el-select v-model="queryParams.operation_subtype" placeholder="子类型" clearable class="filter-item">
            <el-option v-for="opt in getSubtypeOptions(queryParams.operation_type || '')" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
          <el-date-picker
            v-model="dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :shortcuts="shortcuts"
            @change="handleDateChange"
            clearable
            class="filter-item"
          />
          <el-input
            v-model="queryParams.reference_no"
            placeholder="操作单号"
            clearable
            class="filter-item"
            @keyup.enter="handleSearch"
          />
          <el-select
            v-model="queryParams.product_id"
            placeholder="搜索商品名称/SKU"
            clearable
            filterable
            remote
            :remote-method="searchProducts"
            :loading="productSearchLoading"
            class="filter-item"
          >
            <el-option v-for="item in productOptions" :key="item.id" :label="item.name" :value="item.id">
              <div style="display: flex; align-items: center; gap: 8px; min-height: 40px;">
                  <el-image :src="item.image" style="width:32px;height:32px;border-radius:4px; flex-shrink: 0;" fit="cover">
                      <template #error><div class="image-slot" style="width:32px;height:32px;">无图</div></template>
                  </el-image>
                  <div>
                      <div style="font-weight: 500; line-height: 1.2;">{{ item.title }}</div>
                      <div style="font-size:12px;color:#888; line-height: 1.2;">SKU: {{ item.sku }}</div>
                  </div>
              </div>
            </el-option>
          </el-select>
          <el-select v-model="queryParams.warehouse_id" placeholder="全部仓库" clearable class="filter-item">
            <el-option v-for="w in warehouseList" :key="w.warehouse_id" :label="w.warehouse_name" :value="w.warehouse_id" />
          </el-select>
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </div>
        <div class="filter-bar-right">
          <el-button :icon="Download" type="success" @click="exportInventoryLogsHandler" class="export-btn">导出Excel</el-button>
        </div>
      </div>

      <!-- Log List -->
      <div class="log-list-container" v-loading="loading">
        <div v-for="log in logData" :key="log.operation_no" class="log-group">
          <div class="log-group-header">
            <div class="header-left">
              <span class="meta-item"><strong>操作时间:</strong> {{ log.operation_time.replace('T', ' ').replace(/\.\d+Z?$/, '') }}</span>
              <span class="meta-item"><strong>操作单号:</strong> {{ log.operation_no || '-' }}</span>
              <span class="meta-item"><strong>操作员:</strong> {{ log.operator_name || '未知' }}</span>
              <span class="meta-item"><strong>备注:</strong> {{ log.remarks || '-' }}</span>
              <span class="meta-item" v-if="log.operation_subtype">
                <strong>子类型:</strong> {{ subtypeMap[log.operation_subtype as keyof typeof subtypeMap] || log.operation_subtype }}
                <span v-if="log.transfer_type && (log.operation_subtype === 'TRANSFER_INBOUND' || log.operation_subtype === 'TRANSFER_OUTBOUND')" style="margin-left: 8px; color: #888;">
                  ({{ transferTypeMap[log.transfer_type as keyof typeof transferTypeMap] || log.transfer_type }})
                </span>
              </span>
            </div>
            <div class="header-right">
              <el-tag :type="getOperationTypeTag(log.operation_type)" effect="light" class="operation-tag">{{ formatOperationType(log.operation_type)  }}</el-tag>
            </div>
          </div>
          <el-table :data="log.display_items" :span-method="logListSpanMethod" :show-header="true" class="log-table">
            <el-table-column label="商品" min-width="240">
              <template #default="{ row }">
                <div style="display: flex; align-items: center; gap: 12px;">
                  <el-image :src="row.product_image" style="width:40px;height:40px;border-radius:4px; flex-shrink: 0;" fit="cover">
                    <template #error><div class="image-slot">无图</div></template>
                  </el-image>
                  <div>
                    <div><strong>{{ row.product_title }}</strong></div>
                    <div style="font-size:12px;color:#888;">SKU: {{ row.product_sku }}</div>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="warehouse_name" label="仓库" min-width="150" />
            <el-table-column prop="product_size" label="尺码/规格" min-width="120" />
            <el-table-column prop="change_quantity" label="变动数量" min-width="100" align="center">
              <template #default="{ row }">
                <span class="quantity-change" :class="row.change_quantity > 0 ? 'positive' : 'negative'">
                  {{ row.change_quantity > 0 ? '+' : '' }}{{ row.change_quantity }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="stock_after_change" label="调整后库存" min-width="100" align="center"/>
          </el-table>
        </div>
        <el-empty v-if="!loading && logData.length === 0" description="暂无库存操作记录" />
      </div>

      <!-- Pagination -->
      <el-pagination
        v-if="total > 0"
        v-model:current-page="queryParams.page"
        v-model:page-size="queryParams.limit"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        background
        @current-change="fetchLogs"
        @size-change="handleSizeChange"
        class="pagination-container"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { getInventoryLogs, exportInventoryLogs } from '@/api/inventory';
import type { GetInventoryLogsParams } from '@/api/inventory';
import { getProductList } from '@/api/product/list';
import { getWarehouseList } from '@/api/warehouse/list';
import { ElMessage } from 'element-plus';
import { Search, Refresh, Download } from '@element-plus/icons-vue';
import { subtypeMap, transferTypeMap } from '@/api/inventory/typeMap';

// --- Type Definitions ---
interface Product {
  product_id: number;
  product_title: string;
  product_sku: string;
  product_image?: string;
}
interface DetailLog { log_id: number; warehouse_id: number; warehouse_name: string; product_size: string; change_quantity: number; stock_after_change: number; }
interface ProductLog { product_id: number; product_title: string; product_sku: string; details: DetailLog[]; }
interface LogItem {
  operation_no: string;
  operation_type: 'INBOUND' | 'OUTBOUND' | 'ADJUSTMENT';
  operation_subtype?: string;
  transfer_type?: string;
  operator_name: string | null;
  operation_time: string;
  remarks: string;
  products: ProductLog[];
  display_items?: DisplayItem[];
}
interface DisplayItem { product_id: number; product_title: string; product_sku: string; product_image?: string; warehouse_name: string; product_size: string; change_quantity: number; stock_after_change: number; rowspan?: number; }
interface WarehouseInfo { warehouse_id: number; warehouse_name: string; }
interface ProductOption {
  id: number;
  name: string;
  title: string;
  sku: string;
  image?: string;
}

interface ApiResponse<T> {
  list: T[];
  pagination: {
    total: number;
  };
}
interface WarehouseApiResponse {
    warehouses: WarehouseInfo[];
}

// --- State ---
const loading = ref(false);
const logData = ref<LogItem[]>([]);
const total = ref(0);
const dateRange = ref<[Date, Date] | null>(null);
const warehouseList = ref<WarehouseInfo[]>([]);
const productOptions = ref<ProductOption[]>([]);
const productSearchLoading = ref(false);

const queryParams = reactive<GetInventoryLogsParams>({
  page: 1,
  limit: 10,
  operation_subtype: '',
});

const shortcuts = [ { text: '最近一周', value: () => { const end = new Date(); const start = new Date(); start.setTime(start.getTime() - 3600 * 1000 * 24 * 7); return [start, end]; }, }, { text: '最近一个月', value: () => { const end = new Date(); const start = new Date(); start.setTime(start.getTime() - 3600 * 1000 * 24 * 30); return [start, end]; }, }, { text: '最近三个月', value: () => { const end = new Date(); const start = new Date(); start.setTime(start.getTime() - 3600 * 1000 * 24 * 90); return [start, end]; }, }, ];

let searchTimer: ReturnType<typeof setTimeout> | null = null;

// --- API Calls & Data Handling ---
const fetchLogs = async () => {
  loading.value = true;
  try {
    const res = await getInventoryLogs(queryParams) as unknown as ApiResponse<LogItem>;
    const allProducts = await getProductList({ page_size: 1000 });

    const displayLogs = res.list.map(log => {
      const display_items: DisplayItem[] = [];
      log.products.forEach(product => {
        const productInfo = allProducts.data.list.find((p: Product) => p.product_id === product.product_id);
        product.details.forEach((detail, detailIndex) => {
          display_items.push({
            product_id: product.product_id,
            product_title: product.product_title,
            product_sku: product.product_sku,
            product_image: productInfo?.product_image,
            warehouse_name: detail.warehouse_name,
            product_size: detail.product_size,
            change_quantity: detail.change_quantity,
            stock_after_change: detail.stock_after_change,
            rowspan: detailIndex === 0 ? product.details.length : 0,
          });
        });
      });
      return { ...log, display_items };
    });

    logData.value = displayLogs;
    total.value = res.pagination.total || 0;
  } catch {
    ElMessage.error('获取库存记录失败');
  } finally {
    loading.value = false;
  }
};

const fetchFilterOptions = async () => {
  try {
    const warehouseRes = await getWarehouseList() as unknown as WarehouseApiResponse;
    warehouseList.value = warehouseRes.warehouses || [];
  } catch {
    ElMessage.error('获取仓库列表失败');
  }
};

const searchProducts = (query: string) => {
  if (searchTimer) clearTimeout(searchTimer);
  if (!query) {
    productOptions.value = [];
    return;
  }
  searchTimer = setTimeout(async () => {
    productSearchLoading.value = true;
    try {
      const res = await getProductList({ product_title: query, page_size: 50 });
      productOptions.value = res.data.list.map((p: Product) => ({
        id: p.product_id,
        name: p.product_title,
        title: p.product_title,
        sku: p.product_sku,
        image: p.product_image,
      }));
    } catch {
      productOptions.value = [];
    } finally {
      productSearchLoading.value = false;
    }
  }, 300);
};

const exportInventoryLogsHandler = async () => {
  try {
    const params = { ...queryParams };
    delete params.page;
    delete params.limit;
    const res = await exportInventoryLogs(params);
    if (res.code === 200 && res.url) {
      window.open(res.url, '_blank');
    } else {
      ElMessage.error(res.message || '导出失败，请重试');
    }
  } catch {
    ElMessage.error('导出失败，请重试');
  }
};

// --- Handlers ---
const handleSearch = () => {
  queryParams.page = 1;
  fetchLogs();
};

const handleReset = () => {
  queryParams.page = 1;
  queryParams.limit = 10;
  queryParams.operation_type = undefined;
  queryParams.product_id = undefined;
  queryParams.warehouse_id = undefined;
  queryParams.start_time = undefined;
  queryParams.end_time = undefined;
  dateRange.value = null;
  queryParams.reference_no = undefined;
  queryParams.operation_subtype = undefined;
  fetchLogs();
};

const handleSizeChange = (val: number) => {
  queryParams.limit = val;
  fetchLogs();
};

const handleDateChange = (newDateRange: [Date, Date] | null) => {
  const formatDate = (date: Date): string => {
    const pad = (num: number) => num.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  };
  if (newDateRange) {
    queryParams.start_time = formatDate(newDateRange[0]);
    queryParams.end_time = formatDate(newDateRange[1]);
  } else {
    queryParams.start_time = undefined;
    queryParams.end_time = undefined;
  }
};

// --- Utils ---
const formatOperationType = (type: string) => ({ INBOUND: '入库', OUTBOUND: '出库', ADJUSTMENT: '盘点' }[type] || '调拨');
const getOperationTypeTag = (type: string) => {
    const map: Record<string, 'success' | 'warning' | 'info' | ''> = { INBOUND: 'success', OUTBOUND: 'warning', ADJUSTMENT: 'info' };
    return map[type] || '';
};

const logListSpanMethod = ({ row, columnIndex }: { row: DisplayItem; columnIndex: number }) => {
  if (columnIndex === 0) {
    return { rowspan: row.rowspan || 0, colspan: (row.rowspan || 0) > 0 ? 1 : 0 };
  }
};

const getSubtypeOptions = (type: string) => {
  const map: Record<string, (keyof typeof subtypeMap)[]> = {
    INBOUND: [
      'PURCHASE_INBOUND', 'TRANSFER_INBOUND', 'RETURN_INBOUND', 'STOCK_PREPARE', 'INVENTORY_PROFIT', 'OTHER_INBOUND'
    ],
    OUTBOUND: [
      'SALES_OUTBOUND', 'TRANSFER_OUTBOUND', 'RETURN_SUPPLIER', 'SAMPLE_OUTBOUND', 'INVENTORY_LOSS', 'SCRAP_OUTBOUND', 'VIRTUAL_OUTBOUND'
    ],
    ADJUSTMENT: [
      'FULL_CHECK', 'SAMPLE_CHECK', 'CYCLE_CHECK', 'ASSIGN_CHECK', 'SYSTEM_CHECK'
    ],
    TRANSFER: []
  };
  return (map[type as keyof typeof map] || []).map(key => ({ value: key, label: subtypeMap[key] }));
};

// --- Lifecycle ---
onMounted(() => {
  fetchLogs();
  fetchFilterOptions();
});
</script>

<script lang="ts">
export default {
  name: 'InventoryLogList',
}
</script>

<style scoped>
.main-card { border: none; box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.06); border-radius: 12px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.page-title { font-size: 20px; font-weight: 600; color: #1d2129; }
.filter-bar-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  gap: 48px;
}
.filter-bar-left {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
}
.filter-bar-right {
  display: flex;
  align-items: flex-start;
  min-width: 120px;
  margin-left: 48px;
}
.filter-item {
  width: 220px;
  min-width: 120px;
}
.log-list-container { margin-top: 0; display: flex; flex-direction: column; gap: 0; }
.log-group { padding: 24px 0; border-bottom: 1px solid #e5e6eb; }
.log-group:last-child { border-bottom: none; }
.log-group-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; margin-bottom: 20px; }
.header-left { display: flex; flex-wrap: wrap; align-items: center; gap: 20px; color: #4e5969; font-size: 14px; }
.operation-tag.el-tag { border-radius: 4px; font-weight: 500; }
.log-table :deep(.el-table__header-wrapper) { border-radius: 4px; }
.log-table :deep(th) { background-color: #f7f8fa !important; color: #86909c; font-weight: 500; }
.log-table :deep(td), .log-table :deep(th.is-leaf) { border: none; }
.log-table :deep(.el-table__row) { border-bottom: 1px solid #f0f2f5; }
.log-table :deep(.el-table__row:last-child) { border-bottom: none; }
.quantity-change { font-weight: 500; }
.quantity-change.positive { color: #00b42a; }
.quantity-change.negative { color: #f53f3f; }
.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
}
.pagination-container { margin-top: 24px; }
.export-btn {
  margin-left: 8px;
}
</style>
