<template>
  <div>
    <el-card>
      <div class="page-header">
        <span class="page-title">我的调拨单</span>
        <el-button type="primary" @click="openCreateDialog">新建调拨单</el-button>
      </div>
      <el-form :inline="true" :model="queryParams" class="filter-form" style="margin-bottom: 16px;">
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="全部状态" clearable style="width: 140px;">
            <el-option label="待执行" value="PENDING" />
            <el-option label="已完成" value="COMPLETED" />
            <el-option label="已取消" value="CANCELLED" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchList">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="transferList" v-loading="loading" style="margin-bottom: 16px;">
        <el-table-column prop="transfer_no" label="调拨单号" min-width="140" />
        <el-table-column prop="transfer_type" label="调拨类型" min-width="120">
          <template #default="{ row }">
            {{ transferTypeMap[row.transfer_type as keyof typeof transferTypeMap] || row.transfer_type }}
          </template>
        </el-table-column>
        <el-table-column prop="from_warehouse_name" label="出库仓" min-width="120" />
        <el-table-column prop="to_warehouse_name" label="入库仓" min-width="120" />
        <el-table-column prop="status" label="状态" min-width="100">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)">{{ statusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" min-width="160" >
          <template #default="{ row }">
            {{ row.created_at.replace('T', ' ').replace(/\.\d+Z?$/, '') }}
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="120">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="viewDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-if="total > 0"
        v-model:current-page="queryParams.page"
        v-model:page-size="queryParams.limit"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        background
        @current-change="fetchList"
        @size-change="handleSizeChange"
        class="pagination-container"
      />
    </el-card>

    <!-- 创建调拨单弹窗 -->
    <el-dialog v-model="createDialogVisible" title="新建调拨单" width="75%">
      <el-form :model="createForm" label-width="100px">
        <el-form-item label="出库仓" prop="from_warehouse_id">
          <el-select v-model="createForm.from_warehouse_id" placeholder="请选择出库仓" @change="handleFromWarehouseChange" filterable>
            <el-option v-for="w in warehouseList" :key="w.warehouse_id" :label="w.warehouse_name" :value="w.warehouse_id" />
          </el-select>
        </el-form-item>
        <el-form-item label="入库仓" prop="to_warehouse_id">
          <el-select v-model="createForm.to_warehouse_id" placeholder="请选择入库仓" @change="handleToWarehouseChange" filterable>
            <el-option v-for="w in warehouseList" :key="w.warehouse_id" :label="w.warehouse_name" :value="w.warehouse_id" />
          </el-select>
        </el-form-item>
        <el-form-item label="调拨类型" prop="transfer_type">
          <el-select v-model="createForm.transfer_type" placeholder="请选择调拨类型">
            <el-option v-for="(label, value) in transferTypeMap" :key="value" :label="label" :value="value" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remarks">
          <el-input v-model="createForm.remarks" type="textarea" />
        </el-form-item>
      </el-form>
      <el-divider />
      <div style="margin-bottom: 16px;">
        <ProductAutoComplete @select="addProductToTable" />
      </div>
      <el-table
        :data="productDetailRows"
        row-key="_rowKey"
        size="small"
        style="margin-bottom: 8px; width: 100%;"
        :span-method="productDetailSpanMethod"
      >
        <el-table-column label="商品" min-width="200">
          <template #default="{ row }">
            <div v-if="row._isFirst" style="display: flex; align-items: center; gap: 8px;">
              <el-image v-if="row.product.product_image" :src="row.product.product_image" style="width:40px;height:40px;border-radius:4px;" fit="cover" />
              <div>
                <div><strong>{{ row.product.product_title }}</strong></div>
                <div style="font-size:12px;color:#888;">SKU: {{ row.product.product_sku }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="仓库">
          <template #default="{ row }">
            <el-select
              v-model="row.detail.warehouse_id"
              placeholder="请先在上方选择出库仓"
              :disabled="!!createForm.from_warehouse_id"
              @change="handleWarehouseChange(row.product, row.detail)"
            >
              <el-option v-for="item in warehouseList" :key="item.warehouse_id" :label="item.warehouse_name" :value="item.warehouse_id" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="尺码/规格">
          <template #default="{ row }">
            <div>
              <el-select
                v-model="row.detail.product_size"
                :placeholder="row.detail.sizes_loading ? '加载中...' : '请先选仓库'"
                :disabled="!row.detail.warehouse_id || row.detail.sizes_loading"
                :loading="row.detail.sizes_loading"
                @change="() => handleDetailSizeChange(row.product, row.detail, row._detailIndex)"
              >
                <el-option
                  v-for="sizeInfo in row.detail.available_sizes"
                  :key="sizeInfo.product_size"
                  :label="sizeInfo.product_size"
                  :value="sizeInfo.product_size"
                >
                  <span>{{ sizeInfo.product_size }}</span>
                  <span style="float: right; color: #8492a6; font-size: 13px">库存: {{ sizeInfo.stock_quantity }}</span>
                </el-option>
              </el-select>
              <!-- 调试信息
              <div style="font-size: 10px; color: #999; margin-top: 2px;">
                状态: {{ row.detail.sizes_loading ? '加载中' : '已加载' }} |
                尺码数: {{ row.detail.available_sizes.length }} |
                仓库: {{ row.detail.warehouse_id }}
              </div> -->
            </div>
          </template>
        </el-table-column>
        <el-table-column label="数量">
          <template #default="{ row }">
            <el-input-number
              v-model="row.detail.quantity"
              :min="1"
              :disabled="!row.detail.product_size"
              :placeholder="!row.detail.product_size ? '请先选择尺码' : ''"
              :title="!row.detail.product_size ? '请先选择尺码再输入数量' : ''"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center">
          <template #default="{ row }">
            <el-button
              type="primary"
              :icon="CopyDocument"
              circle
              @click="addDetailRow(row._productIndex)"
            />
            <el-button
              type="danger"
              :icon="Delete"
              circle
              @click="removeDetailRow(row._productIndex, row._detailIndex)"
            />
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCreate">提交</el-button>
      </template>
    </el-dialog>

    <!-- 调拨单详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      width="800px"
      class="transfer-detail-dialog"
      :show-close="false"
    >
      <template #header>
        <div class="dialog-title">
          <span>调拨单详情</span>
        </div>
      </template>
      <div class="detail-card">
        <el-descriptions :column="3" border class="desc-table">
          <el-descriptions-item label="调拨单号">{{ detail?.transfer_no }}</el-descriptions-item>
          <el-descriptions-item label="调拨类型">{{ transferTypeMap[detail?.transfer_type as keyof typeof transferTypeMap] || detail?.transfer_type }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="statusTagType(detail?.status || '')">{{ statusText(detail?.status || '') }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="出库仓">{{ detail?.from_warehouse_name }}</el-descriptions-item>
          <el-descriptions-item label="入库仓">{{ detail?.to_warehouse_name }}</el-descriptions-item>
          <el-descriptions-item label="创建人">{{ detail?.creator_name }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ detail?.created_at.replace('T', ' ').replace(/\.\d+Z?$/, '') }}</el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">
            <span class="desc-remark">{{ detail && 'remarks' in detail ? detail.remarks : '-' }}</span>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <div class="table-title">调拨明细</div>
      <el-table
        :data="detailTableRows"
        size="small"
        class="detail-table"
        :span-method="detailSpanMethod"
        border
        stripe
        highlight-current-row
      >
        <el-table-column label="商品" max-width="180">
          <template #default="{ row }">
            <div class="product-info">
              <el-image v-if="row.product_image" :src="row.product_image" class="product-img" fit="cover" />
              <div>
                <div class="product-title">{{ row.product_title }}</div>
                <div class="product-sku">SKU: {{ row.product_sku }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="warehouse_name" label="仓库" align="center" min-width="120" />
        <el-table-column prop="product_size" label="尺码/规格" align="center" min-width="80" />
        <el-table-column prop="quantity" label="调拨数量" align="center" min-width="80">
          <template #default="{ row }">
            <span :class="['quantity', row.sign === '+' ? 'plus' : 'minus']">
              {{ row.sign }}{{ row.quantity }}
            </span>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button type="primary" @click="detailDialogVisible = false" class="footer-btn">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { getMyInventoryTransfers, createInventoryTransfer, getInventoryTransferDetail } from '@/api/inventory/transfers';
import type { GetMyInventoryTransfersParams, InventoryTransferDetail } from '@/api/inventory/transfers';
import { transferTypeMap } from '@/api/inventory/typeMap';
import { ElMessage } from 'element-plus';
import { getWarehouseList } from '@/api/warehouse/list';
import ProductAutoComplete from '@/components/ProductAutoComplete.vue';
import { getProductWarehouseList } from '@/api/warehouse/inventory';
import { Delete, CopyDocument } from '@element-plus/icons-vue';

defineOptions({ name: 'MultiProductTransfer' });

// --- Type Definitions for Create Form ---
interface CreateFormDetail {
  warehouse_id: number | null;
  product_size: string;
  quantity: number;
  available_sizes: { product_size: string, stock_quantity: number }[];
  sizes_loading: boolean;
}

interface CreateFormProduct {
  product_id: number;
  product_title: string;
  product_sku: string;
  product_image?: string;
  details: CreateFormDetail[];
}

const loading = ref(false);
const transferList = ref<any[]>([]);
const total = ref(0);
const queryParams = reactive<GetMyInventoryTransfersParams>({
  page: 1,
  limit: 10,
  status: undefined,
});

const createDialogVisible = ref(false);
const createForm = reactive<{
  from_warehouse_id: number | null;
  to_warehouse_id: number | null;
  transfer_type: 'DOMESTIC' | 'CROSS_BORDER' | 'FBA' | 'OVERSEAS' | 'VMI' | 'HUB' | 'PRE_ALLOCATE' | 'EXCEPTION';
  remarks: string;
  products: CreateFormProduct[];
}>({
  from_warehouse_id: null,
  to_warehouse_id: null,
  transfer_type: 'DOMESTIC',
  remarks: '',
  products: [],
});

const detailDialogVisible = ref(false);
const detail = ref<InventoryTransferDetail | null>(null);
const detailTableRows = ref<any[]>([]);
const detailSpanMap = ref<{ [k: number]: number }>({});

const warehouseList = ref<{ warehouse_id: number; warehouse_name: string }[]>([]);

const fetchWarehouses = async () => {
  try {
    const res: any = await getWarehouseList({ page: 1, limit: 100 });
    if ('data' in res && res.data?.list) {
      warehouseList.value = res.data.list;
    } else if ('warehouses' in res) {
      warehouseList.value = res.warehouses;
    } else {
      warehouseList.value = [];
    }
  } catch {
    ElMessage.error('获取仓库列表失败');
  }
};

const fetchList = async () => {
  loading.value = true;
  try {
    const res: any = await getMyInventoryTransfers(queryParams);
    if ('data' in res && res.data?.list) {
      transferList.value = res.data.list;
      total.value = res.data.pagination?.total || 0;
    } else if ('list' in res) {
      transferList.value = res.list;
      total.value = res.pagination?.total || 0;
    } else {
      transferList.value = [];
      total.value = 0;
    }
  } catch {
    ElMessage.error('获取调拨单列表失败');
  } finally {
    loading.value = false;
  }
};

const handleSizeChange = (val: number) => {
  queryParams.limit = val;
  fetchList();
};

const openCreateDialog = () => {
  createDialogVisible.value = true;
  createForm.from_warehouse_id = null;
  createForm.to_warehouse_id = null;
  createForm.transfer_type = 'DOMESTIC';
  createForm.remarks = '';
  createForm.products = [];
};

const addProductToTable = async (product: { product_id: number, product_title: string, product_sku: string, product_image?: string }) => {
  if (createForm.products.some(p => p.product_id === product.product_id)) {
    ElMessage.warning('该商品已添加');
    return;
  }
  const newProduct: CreateFormProduct = {
    ...product,
    details: [
      {
        warehouse_id: createForm.from_warehouse_id,
        product_size: '',
        quantity: 1,
        available_sizes: [],
        sizes_loading: false
      }
    ]
  };
  createForm.products.push(newProduct);

  // 如果仓库已自动填充，则获取尺码列表
  if (newProduct.details[0].warehouse_id) {
    await handleWarehouseChange(newProduct, newProduct.details[0]);
  }
};

const handleWarehouseChange = async (product: CreateFormProduct, detail: CreateFormDetail) => {
  detail.product_size = '';
  detail.available_sizes = [];
  if (!product.product_id || !detail.warehouse_id) return;

  console.log(`开始加载尺码数据: 商品${product.product_id}, 仓库${detail.warehouse_id}`);
  detail.sizes_loading = true;
  console.log(`设置loading为true: ${detail.sizes_loading}`);

  try {
    // Assuming getProductWarehouseList is correctly typed or we handle the 'any' response
    const res: any = await getProductWarehouseList({ product_id: product.product_id });
    let list: any[] = [];
    if ('data' in res && res.data?.list) {
      list = res.data.list;
    } else if ('list' in res) {
      list = res.list;
    }
    const productData = list.find((p: any) => p.product_id === product.product_id);
    if (productData && productData.warehouses) {
      const warehouseData = productData.warehouses.find((w: any) => w.warehouse_id === detail.warehouse_id);
      detail.available_sizes = warehouseData ? warehouseData.stocks : [];
      console.log(`尺码数据加载完成: 商品${product.product_id}, 仓库${detail.warehouse_id}, 尺码数量: ${detail.available_sizes.length}`);
    } else {
      detail.available_sizes = [];
      console.log(`未找到商品${product.product_id}的仓库数据`);
    }
    if (!detail.available_sizes?.length) {
      ElMessage.info('该产品在此仓库中无库存记录');
    }
  } catch {
    ElMessage.error('获取尺码库存失败');
  } finally {
    detail.sizes_loading = false;
    console.log(`设置loading为false: ${detail.sizes_loading}`);
  }
};

const handleDetailSizeChange = (product: CreateFormProduct, detail: CreateFormDetail, detailIndex: number) => {
  if (!detail.product_size) return;
  // 校验同一产品下明细唯一
  const duplicate = product.details.find((item, i) =>
    i !== detailIndex &&
    item.warehouse_id === detail.warehouse_id &&
    item.product_size === detail.product_size
  );
  if (duplicate) {
    ElMessage.warning('该商品规格已存在，请直接修改原条目的数量。');
    detail.product_size = '';
  }
};

const handleCreate = async () => {
  if (!createForm.from_warehouse_id || !createForm.to_warehouse_id || !createForm.transfer_type || createForm.products.length === 0) {
    ElMessage.warning('请填写完整信息');
    return;
  }
  // 扁平化 products 为 items
  const items: any[] = [];
  createForm.products.forEach((product) => {
    product.details.forEach((detail) => {
      if (detail.warehouse_id && detail.product_size && detail.quantity > 0) {
        items.push({
          product_id: product.product_id,
          warehouse_id: detail.warehouse_id,
          product_size: detail.product_size,
          quantity: detail.quantity
        });
      }
    });
  });

  if (items.length === 0) {
    ElMessage.warning('请至少添加一条完整的明细');
    return;
  }

  try {
    await createInventoryTransfer({
      from_warehouse_id: createForm.from_warehouse_id,
      to_warehouse_id: createForm.to_warehouse_id,
      transfer_type: createForm.transfer_type,
      remarks: createForm.remarks,
      items
    });
    ElMessage.success('创建成功');
    createDialogVisible.value = false;
    fetchList();
  } catch {
    ElMessage.error('创建失败');
  }
};

const viewDetail = async (row: unknown) => {
  try {
    const res = await getInventoryTransferDetail((row as any).id || (row as any).transfer_no);
    const data = (res as any).data;
    detail.value = data;
    // 扁平化 products
    const rows: any[] = [];
    const spanMap: { [k: number]: number } = {};
    let rowIndex = 0;
    if (data && data.products) {
      data.products.forEach((product: any) => {
        const count = product.details.length;
        product.details.forEach((detail: any, dIdx: number) => {
          // 判断加减
          let sign = '';
          if (detail.warehouse_name === data.from_warehouse_name) {
            sign = '-';
          } else if (detail.warehouse_name === data.to_warehouse_name) {
            sign = '+';
          }
          rows.push({
            product_id: product.product_id,
            product_title: product.product_title,
            product_sku: product.product_sku,
            product_image: product.product_image,
            warehouse_name: detail.warehouse_name,
            product_size: detail.product_size,
            quantity: detail.quantity,
            sign,
            _rowIndex: rowIndex,
            _productIndex: rows.length,
            _isFirst: dIdx === 0,
            _span: count
          });
          if (dIdx === 0) {
            spanMap[rowIndex] = count;
          }
          rowIndex++;
        });
      });
    }
    detailTableRows.value = rows;
    detailSpanMap.value = spanMap;
    detailDialogVisible.value = true;
  } catch {
    ElMessage.error('获取详情失败');
  }
};

const statusText = (status: string) => {
  const map: Record<string, string> = {
    PENDING: '待执行',
    COMPLETED: '已完成',
    CANCELLED: '已取消',
  };
  return map[status] || status;
};
const statusTagType = (status: string) => {
  const map: Record<string, string> = {
    PENDING: 'info',
    COMPLETED: 'success',
    CANCELLED: 'danger',
  };
  return map[status] || 'info';
};

const removeItem = (index: number) => {
  createForm.products.splice(index, 1);
};

// 计算每个商品的rowspan
const detailSpanMethod = ({ rowIndex, columnIndex }: { rowIndex: number; columnIndex: number }) => {
  // 商品信息在第0列
  if (columnIndex === 0) {
    const span = detailSpanMap.value[rowIndex];
    if (span) {
      return { rowspan: span, colspan: 1 };
    } else {
      return { rowspan: 0, colspan: 0 };
    }
  }
};

const handleFromWarehouseChange = async (val: number | null) => {
  if (val && val === createForm.to_warehouse_id) {
    ElMessage.warning('出库仓和入库仓不能相同，请重新选择');
    createForm.from_warehouse_id = null;
    return;
  }

  // 将选择的出库仓同步到所有明细行，并等待所有尺码加载完成
  const promises = createForm.products.flatMap(product =>
    product.details.map(detail => {
      detail.warehouse_id = val;
      return handleWarehouseChange(product, detail);
    })
  );

  await Promise.all(promises);
};

const handleToWarehouseChange = (val: number) => {
  if (val === createForm.from_warehouse_id) {
    ElMessage.warning('出库仓和入库仓不能相同，请重新选择');
    createForm.to_warehouse_id = null;
  }
};

const addDetailRow = async (productIndex: number) => {
  const newDetail: CreateFormDetail = {
    warehouse_id: createForm.from_warehouse_id,
    product_size: '',
    quantity: 1,
    available_sizes: [],
    sizes_loading: false
  };
  createForm.products[productIndex].details.push(newDetail);

  // 如果仓库已自动填充，则获取尺码列表
  if (newDetail.warehouse_id) {
    await handleWarehouseChange(createForm.products[productIndex], newDetail);
  }
};

const removeDetailRow = (productIndex: number, detailIndex: number) => {
  createForm.products[productIndex].details.splice(detailIndex, 1);
  if (createForm.products[productIndex].details.length === 0) {
    createForm.products.splice(productIndex, 1);
  }
};

const removeProduct = (productIndex: number) => {
  createForm.products.splice(productIndex, 1);
};

const productDetailRows = computed(() => {
  const rows: {
    product: CreateFormProduct;
    detail: CreateFormDetail;
    _productIndex: number;
    _detailIndex: number;
    _isFirst: boolean;
    _span: number;
    _rowKey: string;
  }[] = [];
  createForm.products.forEach((product, pIdx) => {
    product.details.forEach((detail, dIdx) => {
      rows.push({
        product,
        detail,
        _productIndex: pIdx,
        _detailIndex: dIdx,
        _isFirst: dIdx === 0,
        _span: product.details.length,
        _rowKey: `${pIdx}-${dIdx}`
      });
    });
  });
  return rows;
});

const productDetailSpanMethod = ({ rowIndex, columnIndex }: { rowIndex: number; columnIndex: number }) => {
  // 商品信息在第0列
  if (columnIndex === 0) {
    const row = productDetailRows.value[rowIndex];
    if (row._isFirst) {
      return { rowspan: row._span, colspan: 1 };
    } else {
      return { rowspan: 0, colspan: 0 };
    }
  }
};

const handleReset = () => {
  queryParams.status = undefined;
  queryParams.page = 1;
  queryParams.limit = 10;
  fetchList();
};

onMounted(() => {
  fetchWarehouses();
  fetchList();
});
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.page-title {
  font-size: 18px;
  font-weight: 600;
}
.pagination-container {
  margin-top: 16px;
}
.transfer-detail-dialog .el-dialog__header {
  padding: 0;
}
.dialog-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 22px;
  font-weight: 700;
}
.close-btn {
  margin-left: 12px;
  background: #f5f7fa;
  color: #909399;
  border: none;
}
.desc-table {
  background: #f8fafc;
  border-radius: 8px;
}
.desc-remark {
  color: #909399;
  font-size: 14px;
  word-break: break-all;
}
.table-title {
  font-size: 16px;
  font-weight: 600;
  margin: 16px 0 8px 0;
  color: #333;
}
.detail-table {
  border-radius: 8px;
  box-shadow: 0 2px 8px 0 rgba(0,0,0,0.04);
  background: #fff;
}
.product-info {
  display: flex;
  align-items: center;
  gap: 12px;
}
.product-img {
  width: 48px;
  height: 48px;
  border-radius: 6px;
  border: 1px solid #f0f0f0;
  background: #fafbfc;
}
.product-title {
  font-weight: 600;
  font-size: 15px;
  color: #222;
}
.product-sku {
  font-size: 13px;
  color: #909399;
  margin-top: 2px;
}
.quantity {
  font-weight: 600;
  font-size: 15px;
}
.quantity.plus {
  color: #21ba45;
}
.quantity.minus {
  color: #f56c6c;
}
.footer-btn {
  min-width: 100px;
  font-size: 15px;
  border-radius: 6px;
}
</style>
