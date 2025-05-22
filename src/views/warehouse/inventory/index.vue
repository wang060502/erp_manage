<template>
  <div class="inventory-container">
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="商品名称">
          <el-input v-model="searchForm.name" placeholder="请输入商品名称" clearable />
        </el-form-item>
        <el-form-item label="商品分类">
          <el-cascader
            v-model="searchForm.categoryId"
            :options="categoryOptions"
            :props="{
              checkStrictly: true,
              value: 'id',
              label: 'name',
              children: 'children',
              emitPath: false,
            }"
            clearable
            placeholder="请选择分类"
          />
        </el-form-item>
        <el-form-item label="库存状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="正常" value="normal" />
            <el-option label="预警" value="warning" />
            <el-option label="缺货" value="out" />
          </el-select>
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
      <el-button type="primary" @click="handleInStock">
        <el-icon><Plus /></el-icon>
        入库
      </el-button>
      <el-button type="warning" @click="handleOutStock">
        <el-icon><Minus /></el-icon>
        出库
      </el-button>
      <el-button type="info" @click="handleTransfer">
        <el-icon><Position /></el-icon>
        调拨
      </el-button>
      <el-button type="success" @click="handleExport">
        <el-icon><Download /></el-icon>
        导出数据
      </el-button>
    </div>

    <!-- 库存列表 -->
    <el-card class="table-card">
      <el-table
        v-loading="loading"
        :data="tableData"
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column label="商品信息" min-width="300">
          <template #default="{ row }">
            <div class="product-info">
              <el-image :src="row.image" class="product-image" />
              <div class="product-detail">
                <div class="product-name">{{ row.name }}</div>
                <div class="product-sku">SKU: {{ row.sku }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="分类" width="120" />
        <el-table-column label="库存信息" width="400">
          <template #default="{ row }">
            <div class="inventory-info">
              <div class="inventory-item">
                <span class="label">当前库存：</span>
                <span class="value">{{ row.quantity }}</span>
              </div>
              <div class="inventory-item">
                <span class="label">安全库存：</span>
                <span class="value">{{ row.safetyStock }}</span>
              </div>
              <div class="inventory-item">
                <span class="label">可用库存：</span>
                <span class="value">{{ row.availableQuantity }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag
              :type="
                row.status === 'normal'
                  ? 'success'
                  : row.status === 'warning'
                    ? 'warning'
                    : 'danger'
              "
            >
              {{ row.status === 'normal' ? '正常' : row.status === 'warning' ? '预警' : '缺货' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button type="primary" link @click="handleDetail(row)"> 详情 </el-button>
              <el-button type="primary" link @click="handleHistory(row)"> 记录 </el-button>
            </el-button-group>
          </template>
        </el-table-column>
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

    <!-- 入库对话框 -->
    <el-dialog v-model="inStockDialogVisible" title="商品入库" width="500px">
      <el-form ref="inStockFormRef" :model="inStockForm" :rules="inStockRules" label-width="100px">
        <el-form-item label="商品" prop="productId">
          <el-select
            v-model="inStockForm.productId"
            placeholder="请选择商品"
            filterable
            remote
            :remote-method="handleProductSearch"
            :loading="productSearchLoading"
          >
            <el-option
              v-for="item in productOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="入库数量" prop="quantity">
          <el-input-number v-model="inStockForm.quantity" :min="1" :precision="0" />
        </el-form-item>
        <el-form-item label="入库类型" prop="type">
          <el-select v-model="inStockForm.type" placeholder="请选择入库类型">
            <el-option label="采购入库" value="purchase" />
            <el-option label="退货入库" value="return" />
            <el-option label="调拨入库" value="transfer" />
            <el-option label="其他入库" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="inStockForm.remark"
            type="textarea"
            :rows="2"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="inStockDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleInStockSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 出库对话框 -->
    <el-dialog v-model="outStockDialogVisible" title="商品出库" width="500px">
      <el-form
        ref="outStockFormRef"
        :model="outStockForm"
        :rules="outStockRules"
        label-width="100px"
      >
        <el-form-item label="商品" prop="productId">
          <el-select
            v-model="outStockForm.productId"
            placeholder="请选择商品"
            filterable
            remote
            :remote-method="handleProductSearch"
            :loading="productSearchLoading"
          >
            <el-option
              v-for="item in productOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="出库数量" prop="quantity">
          <el-input-number v-model="outStockForm.quantity" :min="1" :precision="0" />
        </el-form-item>
        <el-form-item label="出库类型" prop="type">
          <el-select v-model="outStockForm.type" placeholder="请选择出库类型">
            <el-option label="销售出库" value="sale" />
            <el-option label="调拨出库" value="transfer" />
            <el-option label="报损出库" value="damage" />
            <el-option label="其他出库" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="outStockForm.remark"
            type="textarea"
            :rows="2"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="outStockDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleOutStockSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 调拨对话框 -->
    <el-dialog v-model="transferDialogVisible" title="库存调拨" width="500px">
      <el-form
        ref="transferFormRef"
        :model="transferForm"
        :rules="transferRules"
        label-width="100px"
      >
        <el-form-item label="商品" prop="productId">
          <el-select
            v-model="transferForm.productId"
            placeholder="请选择商品"
            filterable
            remote
            :remote-method="handleProductSearch"
            :loading="productSearchLoading"
          >
            <el-option
              v-for="item in productOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="调出仓库" prop="fromWarehouseId">
          <el-select v-model="transferForm.fromWarehouseId" placeholder="请选择调出仓库">
            <el-option
              v-for="item in warehouseOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="调入仓库" prop="toWarehouseId">
          <el-select v-model="transferForm.toWarehouseId" placeholder="请选择调入仓库">
            <el-option
              v-for="item in warehouseOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="调拨数量" prop="quantity">
          <el-input-number v-model="transferForm.quantity" :min="1" :precision="0" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="transferForm.remark"
            type="textarea"
            :rows="2"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="transferDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleTransferSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Search, Refresh, Plus, Minus, Position, Download } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

// 搜索表单
const searchForm = reactive({
  name: '',
  categoryId: undefined as number | undefined,
  status: '',
})

// 分类选项
const categoryOptions = ref([
  {
    id: 1,
    name: '电子产品',
    children: [
      { id: 11, name: '手机' },
      { id: 12, name: '电脑' },
    ],
  },
  {
    id: 2,
    name: '服装',
    children: [
      { id: 21, name: '男装' },
      { id: 22, name: '女装' },
    ],
  },
])

// 表格数据
const loading = ref(false)
const tableData = ref([
  {
    id: 1,
    name: 'iPhone 15 Pro',
    sku: 'IP15P-256-BLK',
    category: '电子产品',
    image: 'https://via.placeholder.com/50',
    quantity: 100,
    safetyStock: 50,
    availableQuantity: 80,
    status: 'normal',
  },
  {
    id: 2,
    name: 'MacBook Pro',
    sku: 'MBP-14-M2',
    category: '电子产品',
    image: 'https://via.placeholder.com/50',
    quantity: 20,
    safetyStock: 30,
    availableQuantity: 15,
    status: 'warning',
  },
])

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)

// 选中的商品
const selectedProducts = ref([])

// 入库相关
const inStockDialogVisible = ref(false)
const inStockFormRef = ref<FormInstance>()
const inStockForm = reactive({
  productId: undefined as number | undefined,
  quantity: 1,
  type: '',
  remark: '',
})

const inStockRules = reactive<FormRules>({
  productId: [{ required: true, message: '请选择商品', trigger: 'change' }],
  quantity: [{ required: true, message: '请输入入库数量', trigger: 'blur' }],
  type: [{ required: true, message: '请选择入库类型', trigger: 'change' }],
})

// 出库相关
const outStockDialogVisible = ref(false)
const outStockFormRef = ref<FormInstance>()
const outStockForm = reactive({
  productId: undefined as number | undefined,
  quantity: 1,
  type: '',
  remark: '',
})

const outStockRules = reactive<FormRules>({
  productId: [{ required: true, message: '请选择商品', trigger: 'change' }],
  quantity: [{ required: true, message: '请输入出库数量', trigger: 'blur' }],
  type: [{ required: true, message: '请选择出库类型', trigger: 'change' }],
})

// 调拨相关
const transferDialogVisible = ref(false)
const transferFormRef = ref<FormInstance>()
const transferForm = reactive({
  productId: undefined as number | undefined,
  fromWarehouseId: undefined as number | undefined,
  toWarehouseId: undefined as number | undefined,
  quantity: 1,
  remark: '',
})

const transferRules = reactive<FormRules>({
  productId: [{ required: true, message: '请选择商品', trigger: 'change' }],
  fromWarehouseId: [{ required: true, message: '请选择调出仓库', trigger: 'change' }],
  toWarehouseId: [{ required: true, message: '请选择调入仓库', trigger: 'change' }],
  quantity: [{ required: true, message: '请输入调拨数量', trigger: 'blur' }],
})

// 商品搜索相关
const productSearchLoading = ref(false)
const productOptions = ref([])

// 仓库选项
const warehouseOptions = ref([
  { id: 1, name: '上海主仓库' },
  { id: 2, name: '北京分仓' },
])

// 搜索
const handleSearch = () => {
  console.log('搜索条件：', searchForm)
  // TODO: 实现搜索逻辑
}

// 重置搜索
const resetSearch = () => {
  searchForm.name = ''
  searchForm.categoryId = undefined
  searchForm.status = ''
  handleSearch()
}

// 表格选择变化
const handleSelectionChange = (selection: any[]) => {
  selectedProducts.value = selection
}

// 商品搜索
const handleProductSearch = (query: string) => {
  if (query) {
    productSearchLoading.value = true
    // TODO: 实现商品搜索逻辑
    setTimeout(() => {
      productSearchLoading.value = false
      productOptions.value = [
        { id: 1, name: 'iPhone 15 Pro' },
        { id: 2, name: 'MacBook Pro' },
      ]
    }, 1000)
  } else {
    productOptions.value = []
  }
}

// 入库
const handleInStock = () => {
  inStockForm.productId = undefined
  inStockForm.quantity = 1
  inStockForm.type = ''
  inStockForm.remark = ''
  inStockDialogVisible.value = true
}

// 入库提交
const handleInStockSubmit = async () => {
  if (!inStockFormRef.value) return
  await inStockFormRef.value.validate((valid) => {
    if (valid) {
      // TODO: 实现入库逻辑
      ElMessage.success('入库成功')
      inStockDialogVisible.value = false
    }
  })
}

// 出库
const handleOutStock = () => {
  outStockForm.productId = undefined
  outStockForm.quantity = 1
  outStockForm.type = ''
  outStockForm.remark = ''
  outStockDialogVisible.value = true
}

// 出库提交
const handleOutStockSubmit = async () => {
  if (!outStockFormRef.value) return
  await outStockFormRef.value.validate((valid) => {
    if (valid) {
      // TODO: 实现出库逻辑
      ElMessage.success('出库成功')
      outStockDialogVisible.value = false
    }
  })
}

// 调拨
const handleTransfer = () => {
  transferForm.productId = undefined
  transferForm.fromWarehouseId = undefined
  transferForm.toWarehouseId = undefined
  transferForm.quantity = 1
  transferForm.remark = ''
  transferDialogVisible.value = true
}

// 调拨提交
const handleTransferSubmit = async () => {
  if (!transferFormRef.value) return
  await transferFormRef.value.validate((valid) => {
    if (valid) {
      // TODO: 实现调拨逻辑
      ElMessage.success('调拨成功')
      transferDialogVisible.value = false
    }
  })
}

// 查看详情
const handleDetail = (row: any) => {
  // TODO: 实现查看详情逻辑
  ElMessage.info(`查看商品"${row.name}"的库存详情`)
}

// 查看记录
const handleHistory = (row: any) => {
  // TODO: 实现查看记录逻辑
  ElMessage.info(`查看商品"${row.name}"的库存记录`)
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
.inventory-container {
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
  width: 50px;
  height: 50px;
  border-radius: 4px;
}

.product-detail {
  display: flex;
  flex-direction: column;
}

.product-name {
  font-weight: bold;
  color: #303133;
}

.product-sku {
  font-size: 12px;
  color: #909399;
}

.inventory-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.inventory-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.inventory-item .label {
  color: #909399;
  width: 80px;
}

.inventory-item .value {
  color: #409eff;
  font-weight: bold;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
