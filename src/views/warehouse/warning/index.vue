<template>
  <el-card class="warning-container">
    <div class="warning-header">
      <div class="warning-title">库存预警提醒</div>
      <div class="warning-header-right">
      <el-switch
          v-model="autoRefresh"
          active-text="自动刷新"
          inactive-text="手动刷新"
          class="refresh-switch"
        />
        <el-button
        class="refresh-btn"
        type="primary"
        :loading="loading"
        @click="fetchWarningList"
      >
        <el-icon><Refresh /></el-icon>
        刷新
      </el-button>
      </div>
    </div>

    <div class="warning-count">当前有 <span class="warning-count-number">{{ total }}</span> 个产品预警</div>

    <div class="warning-card-list">
      <div v-for="prod in tableData" :key="prod.product_id" class="warning-card">
        <div class="warning-card-header">
          <el-image
            v-if="prod.product_image"
            :src="prod.product_image"
            class="warning-product-image"
            fit="cover"
          />
          <div class="warning-product-info">
            <div class="warning-product-title">{{ prod.product_title }}</div>
            <div class="warning-product-meta">
              <span>SKU: {{ prod.product_sku }}</span>
              <span class="meta-divider" />
              <span>分类: {{ prod.product_type }}</span>
            </div>
          </div>
        </div>
        <div class="warning-detail-table-wrap">
          <el-table
            :data="prod.warnings"
            border
            size="small"
            class="warning-detail-table"
            :header-cell-style="{
              background: '#f7fafd',
              color: '#888',
              fontWeight: 500,
              fontSize: '14px'
            }"
            :cell-style="{
              fontSize: '15px',
              padding: '10px 0'
            }"
            empty-text="无预警明细"
          >
            <el-table-column prop="warehouse_name" label="仓库" min-width="120" />
            <el-table-column prop="product_size" label="尺码" min-width="80" />
            <el-table-column prop="stock_quantity" label="库存" min-width="80">
              <template #default="{ row }">
                <span :class="['stock-qty', row.stock_quantity <= row.safe_stock_quantity ? 'danger' : '']">
                  {{ row.stock_quantity }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="safe_stock_quantity" label="安全库存" min-width="100">
              <template #default="{ row }">
                <span class="safe-stock">{{ row.safe_stock_quantity }}</span>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>
    <el-pagination
      v-model:current-page="page"
      v-model:page-size="pageSize"
      :total="total"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      background
      @current-change="fetchWarningList"
      @size-change="handleSizeChange"
    />
  </el-card>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getProductWarehouseWarningList } from '@/api/warehouse/inventory'
import { Refresh } from '@element-plus/icons-vue'

interface WarningDetail {
  id: number
  warehouse_id: number
  warehouse_name: string
  product_size: string
  stock_quantity: number
  safe_stock_quantity: number
}
interface WarningProduct {
  product_id: number
  product_title: string
  product_sku: string
  product_image?: string
  product_type?: string
  warnings: WarningDetail[]
}

const tableData = ref<WarningProduct[]>([])
const loading = ref(false)
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const autoRefresh = ref(true)

let timer: number | undefined

const fetchWarningList = async () => {
  loading.value = true
  try {
    const res = await getProductWarehouseWarningList({
      page: page.value,
      limit: pageSize.value,
    })
    // 兼容 res.data.list 或 res.list
    const list = (res && (res.data?.list || res.list)) || []
    tableData.value = list
    // 兼容 res.data.total 或 res.total
    total.value = res?.pagination?.total || res?.total || 0
  } catch {
    ElMessage.error('获取库存预警数据失败')
    tableData.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

const handleSizeChange = (val: number) => {
  page.value = 1
  pageSize.value = val
  fetchWarningList()
}

const startAutoRefresh = () => {
  if (timer) clearInterval(timer)
  timer = window.setInterval(() => {
    fetchWarningList()
  }, 60 * 1000)
}
const stopAutoRefresh = () => {
  if (timer) clearInterval(timer)
  timer = undefined
}

// 监听开关变化
watch(autoRefresh, (val) => {
  if (val) {
    startAutoRefresh()
    ElMessage.success('已开启自动刷新')
  } else {
    stopAutoRefresh()
    ElMessage.info('已切换为手动刷新')
  }
})

onMounted(() => {
  fetchWarningList()
  if (autoRefresh.value) startAutoRefresh()
})

onUnmounted(() => {
  stopAutoRefresh()
})
</script>

<script lang="ts">
export default {
  name: 'WarehouseWarning',
}
</script>

<style scoped>
.warning-container {
  border-radius: 12px;
}
.warning-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}
.warning-header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.warning-card-list {
  display: flex;
  flex-wrap: wrap;
  gap: 32px;
}
.warning-title {
  font-size: 18px;
  font-weight: 700;
  color: #222;
  letter-spacing: 1px;
}
.warning-card {
  max-width: 400px;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 24px #0001, 0 1.5px 6px #409eff0a;
  margin-bottom: 32px;
  padding: 28px 36px 24px 36px;
  transition: box-shadow 0.2s;
}
.warning-card:hover {
  box-shadow: 0 8px 32px #409eff22, 0 2px 8px #409eff11;
}
.warning-card-header {
  display: flex;
  align-items: center;
  gap: 22px;
  margin-bottom: 12px;
}
.warning-product-image {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  object-fit: cover;
  background: #f5f7fa;
  box-shadow: 0 2px 8px #0001;
  border: 1.5px solid #eaf6ff;
}
.warning-product-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.warning-product-title {
  font-weight: 700;
  font-size: 20px;
  color: #222;
  margin-bottom: 2px;
}
.warning-product-meta {
  color: #888;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.meta-divider {
  display: inline-block;
  width: 1px;
  height: 14px;
  background: #e0e6ed;
  margin: 0 10px;
}
.warning-detail-table-wrap {
  border-radius: 10px;
  overflow: hidden;
  background: #fafdff;
  margin-top: 8px;
}
.warning-detail-table {
  border-radius: 10px;
  --el-table-border-color: #f0f2f5;
}
.stock-qty {
  font-weight: 600;
  color: #222;
  letter-spacing: 1px;
}
.stock-qty.danger {
  color: #f56c6c;
  background: #fff0f0;
  border-radius: 4px;
  padding: 2px 8px;
}
.safe-stock {
  color: #409eff;
  font-weight: 500;
}
.warning-count {
  font-size: 18px;
  font-weight: 600;
  margin-left: 12px;
  vertical-align: middle;
  margin-bottom: 24px;
}
.warning-count-number {
  font-size: 25px;
  color: #f56c6c;
  font-weight: 600;
}
.refresh-btn {
  vertical-align: middle;
  margin-left: 16px;
  font-size: 15px;
}
.refresh-switch {
  vertical-align: middle;
  margin-left: 18px;
}
@media (max-width: 900px) {
  .warning-container {
    padding: 18px 4vw 18px 4vw;
  }
  .warning-card {
    padding: 18px 10px 16px 10px;
  }
  .warning-card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>