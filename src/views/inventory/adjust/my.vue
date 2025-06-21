<template>
  <div class="page-container">
    <el-card class="main-card">
      <div class="page-header">
        <span class="page-title">我的库存操作</span>
        <div class="header-actions">
          <el-date-picker
            v-model="dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :shortcuts="shortcuts"
            @change="handleDateChange"
            clearable
          />
          <el-button type="primary" :icon="Plus" @click="handleOpenDialog">
            新增操作
          </el-button>
        </div>
      </div>

      <div class="filter-tabs">
        <span
          v-for="tab in filterTabs"
          :key="tab.name"
          :class="{ 'active-tab': queryParams.operation_type === tab.name }"
          @click="handleFilterTabClick(tab.name)"
        >
          {{ tab.label }}
        </span>
      </div>

      <!-- New Card-based Layout -->
      <div class="log-list-container" v-loading="loading">
        <div v-for="log in logData" :key="log.operation_no" class="log-group">
          <div class="log-group-header">
            <div class="header-left">
              <span class="meta-item"><strong>操作时间:</strong> {{ log.operation_time.replace('T', ' ').replace(/\.\d+Z?$/, '') }}</span>
              <span class="meta-item"><strong>操作单号:</strong> {{ log.operation_no || '-' }}</span>
              <!-- <span class="meta-item"><strong>操作员:</strong> {{ log.operator_name || '未知' }}</span> -->
              <span class="meta-item"><strong>备注:</strong> {{ log.remarks || '-' }}</span>
              <span class="meta-item">
                <strong>操作类型:</strong>
                <template v-if="log.operation_subtype">
                  <span style="margin-left: 8px; color: #888;">
                    {{ subtypeMap[log.operation_subtype] || log.operation_subtype }}
                  </span>
                </template>
              </span>
            </div>
            <div class="header-right">
              <el-tag :type="getOperationTypeTag(log.operation_type)" effect="light" class="operation-tag">{{ formatOperationType(log.operation_type) }}</el-tag>
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

      <el-pagination
        v-if="total > 0"
        v-model:current-page="queryParams.page"
        v-model:page-size="queryParams.limit"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        background
        @current-change="fetchMyLogs"
        @size-change="handleSizeChange"
        class="pagination-container"
      />
    </el-card>

    <!-- Dialog for NEW operations -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="75%" @close="handleCloseDialog">
        <el-form :model="formData" label-width="100px" ref="formRef">
           <el-row :gutter="20">
             <el-col :span="12">
               <el-form-item label="操作类型" prop="operation_type">
                 <el-select v-model="formData.operation_type" placeholder="请选择操作类型" style="width: 100%;">
                   <el-option label="入库" value="INBOUND" />
                   <el-option label="出库" value="OUTBOUND" />
                   <el-option label="盘点" value="ADJUSTMENT" />
                 </el-select>
               </el-form-item>
             </el-col>
             <el-col :span="12">
               <el-form-item label="操作单号" prop="operation_no">
                 <el-input v-model="formData.operation_no" placeholder="选填，不填则自动生成" />
               </el-form-item>
             </el-col>
             <el-col :span="24">
               <el-form-item label="备注" prop="remarks">
                 <el-input v-model="formData.remarks" type="textarea" placeholder="请输入备注信息" />
               </el-form-item>
             </el-col>
           </el-row>
           <el-row :gutter="20">
             <el-col :span="12">
               <el-form-item
                 v-if="getSubtypeOptions(formData.operation_type || '').length > 0"
                 label="子类型"
                 prop="operation_subtype"
               >
                 <el-select v-model="formData.operation_subtype" placeholder="请选择子类型" style="width: 100%;">
                   <el-option
                     v-for="opt in getSubtypeOptions(formData.operation_type || '')"
                     :key="opt.value"
                     :label="opt.label"
                     :value="opt.value"
                   />
                 </el-select>
               </el-form-item>
             </el-col>
           </el-row>
        </el-form>

        <el-divider/>

        <div style="margin-bottom: 16px;">
            <ProductAutoComplete @select="addProductToTable" />
        </div>

        <el-table :data="formData.items" :span-method="objectSpanMethod" border>
            <el-table-column label="商品" min-width="240">
                <template #default="{ row }">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <el-image v-if="row.product_image" :src="row.product_image" style="width:40px;height:40px;border-radius:4px;" fit="cover" />
                        <div>
                            <div><strong>{{ row.product_title }}</strong></div>
                            <div style="font-size:12px;color:#888;">SKU: {{ row.product_sku }}</div>
                        </div>
                    </div>
                </template>
            </el-table-column>
            <el-table-column label="仓库" min-width="180">
                <template #default="{ row }">
                    <el-select v-model="row.warehouse_id" placeholder="请选择仓库" @change="handleWarehouseChange(row)">
                         <el-option v-for="item in warehouseList" :key="item.warehouse_id" :label="item.warehouse_name" :value="item.warehouse_id" />
                    </el-select>
                </template>
            </el-table-column>
            <el-table-column label="尺码/规格" min-width="150">
                <template #default="{ row, $index }">
                    <el-select
                        v-model="row.product_size"
                        placeholder="请先选仓库"
                        :disabled="!row.warehouse_id"
                        :loading="row.sizes_loading"
                        @change="() => handleSizeChange(row, $index)"
                    >
                        <el-option
                            v-for="sizeInfo in row.available_sizes"
                            :key="sizeInfo.product_size"
                            :label="sizeInfo.product_size"
                            :value="sizeInfo.product_size"
                        >
                            <span>{{ sizeInfo.product_size }}</span>
                            <span style="float: right; color: #8492a6; font-size: 13px">库存: {{ sizeInfo.stock_quantity }}</span>
                        </el-option>
                    </el-select>
                </template>
            </el-table-column>
            <el-table-column :label="quantityLabel" min-width="120">
                <template #default="{ row }">
                    <el-input-number v-model="row.change_quantity" :min="formData.operation_type === 'OUTBOUND' ? -Infinity : 1" />
                </template>
            </el-table-column>
            <el-table-column label="操作" width="120" align="center">
                <template #default="scope">
                    <el-button type="primary" :icon="CopyDocument" circle @click="handleDuplicateItem(scope.$index)" />
                    <el-button type="danger" :icon="Delete" circle @click="handleRemoveItem(scope.$index)" />
                </template>
            </el-table-column>
        </el-table>

        <template #footer>
            <span class="dialog-footer">
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="handleSubmit">提交</el-button>
            </span>
        </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed, watch } from 'vue'
import { getMyInventoryLogs, adjustInventory } from '@/api/inventory'
import type { GetMyInventoryLogsParams, AdjustInventoryPayload } from '@/api/inventory'
import { getProductList } from '@/api/product/list'
import { getWarehouseList } from '@/api/warehouse/list'
import { getProductWarehouseList } from '@/api/warehouse/inventory'
import { ElMessage, type FormInstance } from 'element-plus'
import { Plus, Delete, CopyDocument } from '@element-plus/icons-vue'
import ProductAutoComplete from '@/components/ProductAutoComplete.vue'
import { subtypeMap } from '@/api/inventory/typeMap'

// interface LogDetailItem {
//     id: number;
//     product_id: number;
//     product_title: string;
//     product_sku: string;
//     warehouse_id: number;
//     warehouse_name: string;
//     product_size: string;
//     change_quantity: number;
//     stock_after_change: number;
//     product_image?: string; // For display
// }

interface LogItem {
    operation_no: string;
    operation_type: 'INBOUND' | 'OUTBOUND' | 'ADJUSTMENT';
    operator_name: string | null;
    operator_id: number | null;
    operation_time: string;
    remarks: string;
    products: ProductLog[];
    // This property will be added during data transformation for rendering
    display_items?: DisplayItem[];
}

interface ProductInfo {
    product_id: number;
    product_title: string;
    product_sku: string;
    product_image?: string;
    warehouses?: WarehouseData[];
}

interface WarehouseData {
    warehouse_id: number;
    warehouse_name: string;
    stocks: StockInfo[];
}

interface StockInfo {
    id: number;
    product_size: string;
    stock_quantity: number;
    safe_stock_quantity: number;
}

interface WarehouseInfo {
    warehouse_id: number;
    warehouse_name: string;
}

// This interface is now self-contained to allow `warehouse_id` to be nullable for the form.
interface FormDisplayItem {
  product_id: number;
  warehouse_id: number | null;
  product_size: string;
  change_quantity: number;

  // UI display properties
  product_title?: string;
  product_sku?: string;
  product_image?: string;
  available_sizes?: { product_size: string, stock_quantity: number }[];
  sizes_loading?: boolean;
}

// --- API Response Type Definitions ---
interface MyLogsResponse {
  list: LogItem[];
  pagination: {
    total: number;
  };
}

interface WarehouseListResponse {
    warehouses: WarehouseInfo[];
}

interface ProductWarehouseResponse {
    list: ProductInfo[];
}

// --- New Interfaces for Log List ---
interface DetailLog {
  log_id: number;
  warehouse_id: number;
  warehouse_name: string;
  product_size: string;
  change_quantity: number;
  stock_after_change: number;
}

interface ProductLog {
  product_id: number;
  product_title: string;
  product_sku: string;
  details: DetailLog[];
}

// A new flattened item structure for rendering the log list table
interface DisplayItem {
    product_id: number;
    product_title: string;
    product_sku: string;
    product_image?: string;
    warehouse_name: string;
    product_size: string;
    change_quantity: number;
    stock_after_change: number;
    // For span-method
    rowspan?: number;
}

const loading = ref(false)
const logData = ref<LogItem[]>([])
const total = ref(0)
const queryParams = reactive<{
  page: number;
  limit: number;
  operation_type: 'INBOUND' | 'OUTBOUND' | 'ADJUSTMENT' | '';
  start_time?: string;
  end_time?: string;
  operation_subtype?: string;
}>({
  page: 1,
  limit: 10,
  operation_type: '',
  operation_subtype: '',
})

// --- Select Options ---
const productList = ref<{id: number, name: string, sku: string, image?: string}[]>([])
const warehouseList = ref<WarehouseInfo[]>([])


// --- Dialog State ---
const dialogVisible = ref(false)
const formRef = ref<FormInstance | null>(null)
const formData = reactive<{
    operation_type: 'INBOUND' | 'OUTBOUND' | 'ADJUSTMENT';
    operation_subtype?: string;
    operation_no?: string;
    remarks?: string;
    items: FormDisplayItem[];
}>({
    operation_type: 'INBOUND',
    operation_subtype: '',
    items: [],
    operation_no: '',
    remarks: ''
})

const dialogTitle = ref('新增库存操作')

const quantityLabel = computed(() => {
    const typeMap: Record<string, string> = {
        INBOUND: '入库数量',
        OUTBOUND: '出库数量',
        ADJUSTMENT: '盘点数量'
    }
    return typeMap[formData.operation_type]
})

const spanMap = ref<Record<number, number>>({});

const updateSpanMap = () => {
    spanMap.value = {};
    if (formData.items.length === 0) return;

    let pos = 0;
    for (let i = 0; i < formData.items.length; i++) {
        if (i === 0) {
            spanMap.value[0] = 1;
            pos = 0;
        } else {
            if (formData.items[i].product_id === formData.items[i - 1].product_id) {
                spanMap.value[pos]++;
                spanMap.value[i] = 0;
            } else {
                spanMap.value[i] = 1;
                pos = i;
            }
        }
    }
};

watch(() => formData.items, updateSpanMap, { deep: true, immediate: true });

interface SpanMethodProps {
  row: FormDisplayItem
  column: import('element-plus').TableColumnCtx<FormDisplayItem>
  rowIndex: number
  columnIndex: number
}

const objectSpanMethod = ({ rowIndex, columnIndex }: SpanMethodProps) => {
  if (columnIndex === 0) { // The 'Product' column
    const rowspan = spanMap.value[rowIndex];
    return {
      rowspan: rowspan,
      colspan: rowspan > 0 ? 1 : 0,
    };
  }
}

const dateRange = ref<[Date, Date] | null>(null);

const shortcuts = [
  {
    text: '最近一周',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    },
  },
  {
    text: '最近一个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    },
  },
  {
    text: '最近三个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
      return [start, end]
    },
  },
]

// --- API Calls ---
const fetchMyLogs = async () => {
  loading.value = true
  try {
    const params: GetMyInventoryLogsParams = {
      ...queryParams,
      operation_type: queryParams.operation_type || undefined,
    }
    const res = await getMyInventoryLogs(params) as unknown as MyLogsResponse
    const apiLogs: LogItem[] = res.list || []

    // Transform logs for display
    const displayLogs = apiLogs.map(log => {
      const display_items: DisplayItem[] = [];
      log.products.forEach(product => {
        const productInfo = productList.value.find(p => p.id === product.product_id);
        product.details.forEach((detail, detailIndex) => {
          display_items.push({
            product_id: product.product_id,
            product_title: product.product_title,
            product_sku: product.product_sku,
            product_image: productInfo?.image,
            warehouse_name: detail.warehouse_name,
            product_size: detail.product_size,
            change_quantity: detail.change_quantity,
            stock_after_change: detail.stock_after_change,
            // Calculate rowspan for the first detail row of each product
            rowspan: detailIndex === 0 ? product.details.length : 0,
          });
        });
      });
      return { ...log, display_items };
    });

    logData.value = displayLogs
    total.value = res.pagination.total || 0
  } catch (err) {
    ElMessage.error('获取库存记录失败')
  } finally {
    loading.value = false
  }
}

const fetchSelectOptions = async () => {
    try {
        const warehouseRes = await getWarehouseList() as unknown as WarehouseListResponse;
        warehouseList.value = warehouseRes.warehouses || [];

        const productRes = await getProductList();
        productList.value = productRes.data.list.map((p: ProductInfo) => ({
            id: p.product_id,
            name: p.product_title,
            sku: p.product_sku,
            image: p.product_image
        }));
    } catch {
        ElMessage.error('获取基础数据失败');
    }
};

const handleSizeChange = (row: FormDisplayItem, index: number) => {
  if (!row.product_size) return; // Do nothing if cleared

  const duplicate = formData.items.find((item, i) =>
    i !== index &&
    item.product_id === row.product_id &&
    item.warehouse_id === row.warehouse_id &&
    item.product_size === row.product_size
  );

  if (duplicate) {
    ElMessage.warning('该商品规格已存在，请直接修改原条目的数量。');
    // Reset the selection to prevent duplicate entry
    row.product_size = '';
  }
};

const handleFilterChange = () => {
  queryParams.page = 1
  fetchMyLogs()
}

// --- Dialog Logic ---
const handleOpenDialog = () => {
  dialogVisible.value = true
}

const handleCloseDialog = () => {
    // Reset form data to initial state
    formData.operation_type = 'INBOUND';
    formData.items = []
    formData.operation_no = ''
    formData.remarks = ''
    dialogVisible.value = false
    if(formRef.value) {
        formRef.value.clearValidate()
    }
}

const addProductToTable = (product: ProductInfo) => {
    formData.items.unshift({
        product_id: product.product_id,
        warehouse_id: null, // Set to null to show placeholder by default
        product_size: '',
        change_quantity: 1,
        // For display
        product_title: product.product_title,
        product_sku: product.product_sku,
        product_image: product.product_image,
        available_sizes: [],
        sizes_loading: false
    })
}

const handleWarehouseChange = async (row: FormDisplayItem) => {
    row.product_size = '';
    row.available_sizes = [];
    if (!row.product_id || !row.warehouse_id) return;
    row.sizes_loading = true;
    try {
        const res = await getProductWarehouseList({ product_id: row.product_id }) as unknown as ProductWarehouseResponse;
        const productData = res.list.find((p: ProductInfo) => p.product_id === row.product_id);
        if (productData && productData.warehouses) {
            const warehouseData = productData.warehouses.find((w: WarehouseData) => w.warehouse_id === row.warehouse_id);
            row.available_sizes = warehouseData ? warehouseData.stocks : [];
        } else {
            row.available_sizes = [];
        }
        if (row.available_sizes?.length === 0) {
            ElMessage.info('该产品在此仓库中无库存记录');
        }
    } catch {
        ElMessage.error('获取尺码库存失败');
    } finally {
        row.sizes_loading = false;
    }
};

const handleDuplicateItem = (index: number) => {
  const originalItem = formData.items[index];
  const newItem: FormDisplayItem = {
    product_id: originalItem.product_id,
    product_title: originalItem.product_title,
    product_sku: originalItem.product_sku,
    product_image: originalItem.product_image,
    // Reset fields for new entry
    warehouse_id: null,
    product_size: '',
    change_quantity: 1,
    available_sizes: [],
    sizes_loading: false
  };
  formData.items.splice(index + 1, 0, newItem);
};

const handleRemoveItem = (index: number) => {
    formData.items.splice(index, 1)
}

const handleSubmit = async () => {
    if (formData.items.length === 0) {
        ElMessage.warning('请至少添加一个商品')
        return
    }

    // Enhanced validation before submitting
    for (const item of formData.items) {
        if (!item.warehouse_id) {
            ElMessage.error(`请为商品 "${item.product_title || '新商品'}" 选择一个仓库`);
            return;
        }
        if (!item.product_size) {
            ElMessage.error(`请为商品 "${item.product_title || '新商品'}" 选择一个尺码`);
            return;
        }
    }

    // Data preprocessing to match API payload
    const payload: AdjustInventoryPayload = {
        operation_type: formData.operation_type,
        operation_subtype: formData.operation_type !== 'ADJUSTMENT' ? formData.operation_subtype : undefined,
        operation_no: formData.operation_no,
        remarks: formData.remarks,
        items: formData.items.map(item => ({
            product_id: item.product_id,
            warehouse_id: item.warehouse_id as number,
            product_size: item.product_size,
            change_quantity: formData.operation_type === 'OUTBOUND'
                ? -Math.abs(item.change_quantity)
                : item.change_quantity
        }))
    }

    try {
        loading.value = true
        await adjustInventory(payload)
        ElMessage.success('操作成功')
        handleCloseDialog()
        await fetchMyLogs()
    } catch {
        ElMessage.error('操作失败')
    } finally {
        loading.value = false
    }
}

// --- Utils ---
const formatOperationType = (type: string) => {
  const map: Record<string, string> = {
    INBOUND: '入库',
    OUTBOUND: '出库',
    ADJUSTMENT: '盘点'
  }
  return map[type] || '调拨'
}

const getOperationTypeTag = (type: string): '' | 'success' | 'warning' | 'info' => {
  const map: Record<string, '' | 'success' | 'warning' | 'info'> = {
    INBOUND: 'success',
    OUTBOUND: 'warning',
    ADJUSTMENT: 'info'
  }
  return map[type] || ''
}

// --- Span method for the log list table ---
interface LogListSpanProps {
  row: DisplayItem
  columnIndex: number
}
const logListSpanMethod = ({ row, columnIndex }: LogListSpanProps) => {
  if (columnIndex === 0) { // The 'Product' column
    return {
      rowspan: row.rowspan || 0,
      colspan: (row.rowspan || 0) > 0 ? 1 : 0,
    };
  }
}

const filterTabs = [
  { label: '全部', name: '' },
  { label: '入库', name: 'INBOUND' },
  { label: '出库', name: 'OUTBOUND' },
  { label: '盘点', name: 'ADJUSTMENT' },
];

const handleFilterTabClick = (name: string) => {
    queryParams.operation_type = name as '' | 'INBOUND' | 'OUTBOUND' | 'ADJUSTMENT';
    handleFilterChange();
};

const handleDateChange = (newDateRange: [Date, Date] | null) => {
  if (newDateRange) {
    // Format dates to YYYY-MM-DD HH:mm:ss
    queryParams.start_time = formatDate(newDateRange[0]);
    queryParams.end_time = formatDate(newDateRange[1]);
  } else {
    queryParams.start_time = undefined;
    queryParams.end_time = undefined;
  }
  handleFilterChange(); // Re-use the existing filter change logic
};

const formatDate = (date: Date): string => {
  const pad = (num: number) => num.toString().padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
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
    ]
  };
  return (map[type as keyof typeof map] || []).map(key => ({ value: key, label: subtypeMap[key] }));
};

onMounted(async () => {
  await fetchSelectOptions()
  await fetchMyLogs()
})
</script>

<script lang="ts">
export default {
  name: 'MyInventoryAdjust',
}
</script>


<style scoped>
.main-card {
  border: none;
  box-shadow: none;
  border-radius: 8px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #1d2129;
}

.filter-tabs {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
  border-bottom: 1px solid #e5e6eb;
}

.filter-tabs span {
  padding: 8px 12px;
  font-size: 14px;
  color: #4e5969;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px; /* To overlap with the container border */
}

.filter-tabs span.active-tab,
.filter-tabs span:hover {
  color: #1677ff;
}

.filter-tabs span.active-tab {
  border-bottom-color: #1677ff;
  font-weight: 500;
}

.log-list-container {
  margin-top: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.log-group {
  padding: 24px 0;
  border-bottom: 1px solid #e5e6eb;
}
.log-group:last-child {
    border-bottom: none;
}

.log-group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 20px;
}

.operation-tag.el-tag {
  border-radius: 4px;
  font-weight: 500;
}

.log-table :deep(.el-table__header-wrapper) {
  border-radius: 4px;
}

.log-table :deep(th) {
  background-color: #f7f8fa !important;
  color: #86909c;
  font-weight: 500;
}

.log-table :deep(td), .log-table :deep(th.is-leaf) {
    border: none;
}

.log-table :deep(.el-table__row) {
    border-bottom: 1px solid #f0f2f5;
}
.log-table :deep(.el-table__row:last-child) {
    border-bottom: none;
}

.quantity-change.positive {
  color: #00b42a;
  font-weight: 500;
}
.quantity-change.negative {
  color: #f53f3f;
  font-weight: 500;
}

/* Cleanup old styles */
.card-header, .log-card-header, .header-left, .meta-item, .log-card {
  all: unset; /* Reset old styles to prevent conflicts */
}
.card-header, .page-header, .log-group-header, .header-left {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header-left {
  gap: 20px;
  color: #4e5969;
  font-size: 14px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}
</style>
