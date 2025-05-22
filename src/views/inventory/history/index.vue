<template>
  <div class="inventory-history-container">
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="商品名称">
          <el-input v-model="searchForm.productName" placeholder="请输入商品名称" clearable />
        </el-form-item>
        <el-form-item label="仓库">
          <el-select v-model="searchForm.warehouseId" placeholder="请选择仓库" clearable>
            <el-option
              v-for="item in warehouseOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="变动类型">
          <el-select v-model="searchForm.type" placeholder="请选择变动类型" clearable>
            <el-option label="入库" value="in" />
            <el-option label="出库" value="out" />
            <el-option label="调拨" value="transfer" />
            <el-option label="盘点" value="check" />
          </el-select>
        </el-form-item>
        <el-form-item label="变动时间">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="resetSearch">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作栏 -->
    <div class="operation-bar">
      <el-button type="success" @click="handleExport">
        <el-icon><Download /></el-icon>
        导出数据
      </el-button>
    </div>

    <!-- 库存记录列表 -->
    <el-card class="table-card">
      <el-table v-loading="loading" :data="tableData" border>
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="productName" label="商品名称" min-width="150">
          <template #default="{ row }">
            <div class="product-info">
              <el-image
                :src="row.productImage"
                :preview-src-list="[row.productImage]"
                fit="cover"
                class="product-image"
              />
              <div class="product-detail">
                <div class="product-name">{{ row.productName }}</div>
                <div class="product-sku">SKU: {{ row.productSku }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="warehouse" label="仓库" width="120" />
        <el-table-column prop="type" label="变动类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getTypeTag(row.type)">
              {{ getTypeLabel(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="quantity" label="变动数量" width="100">
          <template #default="{ row }">
            <span :class="{ 'quantity-in': row.type === 'in', 'quantity-out': row.type === 'out' }">
              {{ row.type === 'in' ? '+' : row.type === 'out' ? '-' : '' }}{{ row.quantity }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="beforeQuantity" label="变动前数量" width="100" />
        <el-table-column prop="afterQuantity" label="变动后数量" width="100" />
        <el-table-column prop="operator" label="操作人" width="100" />
        <el-table-column prop="createTime" label="操作时间" width="180" />
        <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip />
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Search, Refresh, Download } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

interface Warehouse {
  id: number
  name: string
}

interface InventoryRecord {
  id: number
  productName: string
  productSku: string
  productImage: string
  warehouse: string
  type: string
  quantity: number
  beforeQuantity: number
  afterQuantity: number
  operator: string
  createTime: string
  remark: string
}

// 搜索表单
const searchForm = reactive({
  productName: '',
  warehouseId: undefined as number | undefined,
  type: '',
  dateRange: [],
})

// 表格数据
const loading = ref(false)
const tableData = ref<InventoryRecord[]>([
  {
    id: 1,
    productName: 'iPhone 15 Pro',
    productSku: 'IP15P-256-BLK',
    productImage: 'https://example.com/iphone15pro.jpg',
    warehouse: '上海主仓库',
    type: 'in',
    quantity: 100,
    beforeQuantity: 0,
    afterQuantity: 100,
    operator: '张三',
    createTime: '2024-03-20 10:30:00',
    remark: '采购入库',
  },
  {
    id: 2,
    productName: 'MacBook Pro',
    productSku: 'MBP-14-M2',
    productImage: 'https://example.com/macbookpro.jpg',
    warehouse: '北京分仓',
    type: 'out',
    quantity: 50,
    beforeQuantity: 100,
    afterQuantity: 50,
    operator: '李四',
    createTime: '2024-03-20 11:30:00',
    remark: '销售出库',
  },
])

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)

// 选项数据
const warehouseOptions = ref<Warehouse[]>([
  { id: 1, name: '上海主仓库' },
  { id: 2, name: '北京分仓' },
  { id: 3, name: '广州分仓' },
])

// 获取类型标签
const getTypeTag = (type: string) => {
  const map: Record<string, string> = {
    in: 'success',
    out: 'danger',
    transfer: 'warning',
    check: 'info',
  }
  return map[type] || 'info'
}

const getTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    in: '入库',
    out: '出库',
    transfer: '调拨',
    check: '盘点',
  }
  return map[type] || '未知'
}

// 搜索
const handleSearch = () => {
  console.log('搜索条件：', searchForm)
  // TODO: 实现搜索逻辑
}

// 重置搜索
const resetSearch = () => {
  searchForm.productName = ''
  searchForm.warehouseId = undefined
  searchForm.type = ''
  searchForm.dateRange = []
  handleSearch()
}

// 导出数据
const handleExport = () => {
  // TODO: 实现导出逻辑
  ElMessage.success('开始导出数据')
}

// 分页大小变化
const handleSizeChange = (val: number) => {
  pageSize.value = val
  // TODO: 重新加载数据
}

// 页码变化
const handleCurrentChange = (val: number) => {
  currentPage.value = val
  // TODO: 重新加载数据
}
</script>

<style scoped>
.inventory-history-container {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.operation-bar {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.table-card {
  margin-bottom: 20px;
}

.product-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.product-image {
  width: 40px;
  height: 40px;
  border-radius: 4px;
}

.product-detail {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.product-name {
  font-weight: 500;
}

.product-sku {
  font-size: 12px;
  color: #909399;
}

.quantity-in {
  color: #67c23a;
}

.quantity-out {
  color: #f56c6c;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
