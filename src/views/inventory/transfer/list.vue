<template>
  <div>
    <el-card>
      <div class="page-header">
        <span class="page-title">调拨管理</span>
        <el-button type="primary" @click="fetchList" :loading="loading">刷新</el-button>
      </div>
      <el-form :inline="true" :model="queryParams" class="filter-form">
        <el-form-item label="调拨类型">
          <el-select v-model="queryParams.transfer_type" placeholder="全部类型" clearable style="width: 160px;">
            <el-option v-for="(label, value) in transferTypeMap" :key="value" :label="label" :value="value" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="全部状态" clearable style="width: 140px;">
            <el-option label="待执行" value="PENDING" />
            <el-option label="已完成" value="COMPLETED" />
            <el-option label="已取消" value="CANCELLED" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchList">查询</el-button>
          <el-button type="default" @click="handleReset">重置</el-button>
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
        <el-table-column prop="created_at" label="创建时间" min-width="160">
          <template #default="{ row }">
            {{ row.created_at.replace('T', ' ').replace(/\.\d+Z?$/, '') }}
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="180">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="viewDetail(row)">详情</el-button>
            <el-button v-if="row.status === 'PENDING'" type="success" size="small" @click="handleExecute(row)">执行</el-button>
            <el-button v-if="row.status === 'PENDING'" type="danger" size="small" @click="handleCancel(row)">取消</el-button>
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

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailDialogVisible" width="800px" :show-close="false">
      <template #header>
        <div class="dialog-title">
          <span>调拨单详情</span>
        </div>
      </template>
      <div v-if="detail">
        <el-descriptions :column="3" border class="desc-table">
          <el-descriptions-item label="调拨单号">{{ detail.transfer_no }}</el-descriptions-item>
          <el-descriptions-item label="调拨类型">{{ transferTypeMap[detail.transfer_type as keyof typeof transferTypeMap] || detail.transfer_type }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="statusTagType(detail.status)">{{ statusText(detail.status) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="出库仓">{{ detail.from_warehouse_name }}</el-descriptions-item>
          <el-descriptions-item label="入库仓">{{ detail.to_warehouse_name }}</el-descriptions-item>
          <el-descriptions-item label="创建人">{{ detail.creator_name }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ detail.created_at.replace('T', ' ').replace(/\.\d+Z?$/, '') }}</el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">
            <span class="desc-remark">{{ detail.remarks || '-' }}</span>
          </el-descriptions-item>
        </el-descriptions>
        <div class="table-title">调拨明细</div>
        <el-table
          :data="detail.items"
          size="small"
          border
          stripe
          highlight-current-row
          :span-method="detailSpanMethod"
        >
          <el-table-column label="商品" min-width="220">
            <template #default="{ row, $index }">
              <div v-if="detail.spanMap[$index] > 0" style="display: flex; align-items: center; gap: 12px;">
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
          <el-table-column prop="warehouse_name" label="仓库" min-width="140" />
          <el-table-column prop="product_size" label="尺码/规格" min-width="100" />
          <el-table-column prop="quantity" label="调拨数量" min-width="100" align="center">
            <template #default="{ row }">
              <span :class="row.sign === '+' ? 'quantity-positive' : 'quantity-negative'">
                {{ row.sign }}{{ row.quantity }}
              </span>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <template #footer>
        <el-button type="primary" @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { getInventoryTransfers, getInventoryTransferDetail, executeInventoryTransfer, cancelInventoryTransfer, type InventoryTransferListItem, type GetInventoryTransfersParams, type TransferStatus, type InventoryTransferDetail } from '@/api/inventory/transfers';
import { transferTypeMap } from '@/api/inventory/typeMap';
import { ElMessage, ElMessageBox } from 'element-plus';

defineOptions({ name: 'TransferList' });

interface DetailViewData extends InventoryTransferDetail {
  items: any[];
  spanMap: Record<number, number>;
}

const loading = ref(false);
const transferList = ref<InventoryTransferListItem[]>([]);
const total = ref(0);
const queryParams = reactive<GetInventoryTransfersParams>({
  page: 1,
  limit: 10,
  transfer_type: undefined,
  status: undefined,
});

const detailDialogVisible = ref(false);
const detail = ref<DetailViewData | null>(null);

const fetchList = async () => {
  loading.value = true;
  try {
    const res = await getInventoryTransfers(queryParams);
    transferList.value = res.list;
    total.value = res.pagination?.total || 0;
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

const viewDetail = async (row: InventoryTransferListItem) => {
  try {
    const res = await getInventoryTransferDetail((row as any).id || row.transfer_no);
    const data = res.data;
    // 扁平化 products
    const rows: any[] = [];
    const spanMap: Record<number, number> = {};
    let rowIndex = 0;
    if ((data as any).products) {
      (data as any).products.forEach((product: any) => {
        const count = product.details.length;
        product.details.forEach((detailItem: any, dIdx: number) => {
          // 判断加减
          let sign = '';
          if (detailItem.warehouse_name === data.from_warehouse_name) {
            sign = '-';
          } else if (detailItem.warehouse_name === data.to_warehouse_name) {
            sign = '+';
          }
          rows.push({
            product_id: product.product_id,
            product_title: product.product_title,
            product_sku: product.product_sku,
            product_image: product.product_image,
            warehouse_name: detailItem.warehouse_name,
            product_size: detailItem.product_size,
            quantity: detailItem.quantity,
            sign,
            _rowIndex: rowIndex,
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
    detail.value = { ...data, items: rows, spanMap };
    detailDialogVisible.value = true;
  } catch {
    ElMessage.error('获取详情失败');
  }
};

const handleExecute = (row: InventoryTransferListItem) => {
  ElMessageBox.confirm('确定要执行该调拨单吗？', '提示', { type: 'warning' })
    .then(async () => {
      try {
        await executeInventoryTransfer((row as any).id || row.transfer_no);
        ElMessage.success('执行成功');
        fetchList();
      } catch {
        ElMessage.error('执行失败');
      }
    });
};

const handleCancel = (row: InventoryTransferListItem) => {
  ElMessageBox.confirm('确定要取消该调拨单吗？', '提示', { type: 'warning' })
    .then(async () => {
      try {
        await cancelInventoryTransfer((row as any).id || row.transfer_no);
        ElMessage.success('取消成功');
        fetchList();
      } catch {
        ElMessage.error('取消失败');
      }
    });
};

const handleReset = () => {
  queryParams.transfer_type = undefined;
  queryParams.status = undefined;
  queryParams.page = 1;
  queryParams.limit = 10;
  fetchList();
};

const statusText = (status: TransferStatus | string) => {
  const map: Record<TransferStatus, string> = {
    PENDING: '待执行',
    COMPLETED: '已完成',
    CANCELLED: '已取消',
  };
  return map[status as TransferStatus] || status;
};
const statusTagType = (status: TransferStatus | string) => {
  const map: Record<TransferStatus, 'info' | 'success' | 'danger'> = {
    PENDING: 'info',
    COMPLETED: 'success',
    CANCELLED: 'danger',
  };
  return map[status as TransferStatus] || 'info';
};

const detailSpanMethod = ({ rowIndex, columnIndex }: {rowIndex: number, columnIndex: number}) => {
  if (columnIndex === 0) {
    const rowspan = detail.value?.spanMap[rowIndex] || 0;
    return { rowspan, colspan: rowspan > 0 ? 1 : 0 };
  }
};

onMounted(() => {
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
.filter-form {
  margin-bottom: 16px;
}
.pagination-container {
  margin-top: 16px;
}
.dialog-title {
  font-size: 20px;
  font-weight: 700;
}
.desc-table {
  background: #f8fafc;
  border-radius: 8px;
  margin-bottom: 16px;
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
.quantity-positive {
  color: #00b42a;
  font-weight: 600;
}
.quantity-negative {
  color: #f53f3f;
  font-weight: 600;
}
</style>