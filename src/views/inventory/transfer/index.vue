<template>
  <div class="transfer-container">
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="调拨单号">
          <el-input v-model="searchForm.code" placeholder="请输入调拨单号" clearable />
        </el-form-item>
        <el-form-item label="调出仓库">
          <el-select v-model="searchForm.fromWarehouse" placeholder="请选择调出仓库" clearable>
            <el-option
              v-for="item in warehouseOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="调入仓库">
          <el-select v-model="searchForm.toWarehouse" placeholder="请选择调入仓库" clearable>
            <el-option
              v-for="item in warehouseOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="调拨状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="待审核" value="pending" />
            <el-option label="已审核" value="approved" />
            <el-option label="已完成" value="completed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
        <el-form-item label="调拨时间">
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
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增调拨
      </el-button>
      <el-button type="success" @click="handleExport">
        <el-icon><Download /></el-icon>
        导出数据
      </el-button>
    </div>

    <!-- 调拨单列表 -->
    <el-card class="table-card">
      <el-table v-loading="loading" :data="tableData" border>
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="code" label="调拨单号" width="180" />
        <el-table-column prop="fromWarehouse" label="调出仓库" width="150" />
        <el-table-column prop="toWarehouse" label="调入仓库" width="150" />
        <el-table-column prop="totalQuantity" label="调拨数量" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button type="primary" link @click="handleDetail(row)"> 详情 </el-button>
              <el-button
                v-if="row.status === 'pending'"
                type="success"
                link
                @click="handleApprove(row)"
              >
                审核
              </el-button>
              <el-button
                v-if="row.status === 'approved'"
                type="warning"
                link
                @click="handleComplete(row)"
              >
                完成
              </el-button>
              <el-button
                v-if="row.status === 'pending'"
                type="danger"
                link
                @click="handleCancel(row)"
              >
                取消
              </el-button>
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

    <!-- 新增调拨对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增调拨' : '调拨详情'"
      width="800px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        :disabled="dialogType === 'detail'"
      >
        <el-form-item label="调出仓库" prop="fromWarehouseId">
          <el-select v-model="form.fromWarehouseId" placeholder="请选择调出仓库">
            <el-option
              v-for="item in warehouseOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="调入仓库" prop="toWarehouseId">
          <el-select v-model="form.toWarehouseId" placeholder="请选择调入仓库">
            <el-option
              v-for="item in warehouseOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="调拨商品">
          <div class="product-list">
            <div v-for="(item, index) in form.products" :key="index" class="product-item">
              <el-row :gutter="10">
                <el-col :span="8">
                  <el-form-item
                    :prop="'products.' + index + '.productId'"
                    :rules="{ required: true, message: '请选择商品', trigger: 'change' }"
                  >
                    <el-select
                      v-model="item.productId"
                      placeholder="请选择商品"
                      filterable
                      remote
                      :remote-method="handleProductSearch"
                      :loading="productSearchLoading"
                      @change="handleProductChange($event, index)"
                    >
                      <el-option
                        v-for="product in productOptions"
                        :key="product.id"
                        :label="product.name"
                        :value="product.id"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="4">
                  <el-form-item
                    :prop="'products.' + index + '.quantity'"
                    :rules="{ required: true, message: '请输入数量', trigger: 'blur' }"
                  >
                    <el-input-number
                      v-model="item.quantity"
                      :min="1"
                      :precision="0"
                      placeholder="数量"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="4">
                  <el-form-item>
                    <el-input v-model="item.remark" placeholder="备注" />
                  </el-form-item>
                </el-col>
                <el-col :span="4">
                  <el-button type="danger" link @click="removeProduct(index)"> 删除 </el-button>
                </el-col>
              </el-row>
            </div>
            <el-button type="primary" link @click="addProduct">
              <el-icon><Plus /></el-icon>
              添加商品
            </el-button>
          </div>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="请输入备注信息" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button v-if="dialogType !== 'detail'" type="primary" @click="handleSubmit">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Search, Refresh, Plus, Download } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

interface Warehouse {
  id: number
  name: string
}

interface Product {
  id: number
  name: string
}

interface TransferRecord {
  id: number
  code: string
  fromWarehouse: string
  toWarehouse: string
  totalQuantity: number
  status: string
  createTime: string
}

// 搜索表单
const searchForm = reactive({
  code: '',
  fromWarehouse: undefined as number | undefined,
  toWarehouse: undefined as number | undefined,
  status: '',
  dateRange: [],
})

// 表格数据
const loading = ref(false)
const tableData = ref<TransferRecord[]>([
  {
    id: 1,
    code: 'DB202403200001',
    fromWarehouse: '上海主仓库',
    toWarehouse: '北京分仓',
    totalQuantity: 100,
    status: 'pending',
    createTime: '2024-03-20 10:30:00',
  },
  {
    id: 2,
    code: 'DB202403200002',
    fromWarehouse: '北京分仓',
    toWarehouse: '广州分仓',
    totalQuantity: 50,
    status: 'approved',
    createTime: '2024-03-20 11:30:00',
  },
])

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)

// 对话框相关
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'detail'>('add')
const formRef = ref<FormInstance>()
const form = reactive({
  fromWarehouseId: undefined as number | undefined,
  toWarehouseId: undefined as number | undefined,
  products: [] as Array<{
    productId: number | undefined
    quantity: number
    remark: string
  }>,
  remark: '',
})

const rules = reactive<FormRules>({
  fromWarehouseId: [{ required: true, message: '请选择调出仓库', trigger: 'change' }],
  toWarehouseId: [{ required: true, message: '请选择调入仓库', trigger: 'change' }],
})

// 选项数据
const warehouseOptions = ref<Warehouse[]>([
  { id: 1, name: '上海主仓库' },
  { id: 2, name: '北京分仓' },
  { id: 3, name: '广州分仓' },
])

const productOptions = ref<Product[]>([])
const productSearchLoading = ref(false)

// 获取状态标签
const getStatusTag = (status: string) => {
  const map: Record<string, string> = {
    pending: 'warning',
    approved: 'primary',
    completed: 'success',
    cancelled: 'info',
  }
  return map[status] || 'info'
}

const getStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    pending: '待审核',
    approved: '已审核',
    completed: '已完成',
    cancelled: '已取消',
  }
  return map[status] || '未知'
}

// 搜索
const handleSearch = () => {
  console.log('搜索条件：', searchForm)
  // TODO: 实现搜索逻辑
}

// 重置搜索
const resetSearch = () => {
  searchForm.code = ''
  searchForm.fromWarehouse = undefined
  searchForm.toWarehouse = undefined
  searchForm.status = ''
  searchForm.dateRange = []
  handleSearch()
}

// 新增调拨
const handleAdd = () => {
  dialogType.value = 'add'
  form.fromWarehouseId = undefined
  form.toWarehouseId = undefined
  form.products = []
  form.remark = ''
  dialogVisible.value = true
}

// 查看详情
const handleDetail = (row: TransferRecord) => {
  dialogType.value = 'detail'
  // TODO: 加载详情数据
  dialogVisible.value = true
}

// 审核
const handleApprove = (row: TransferRecord) => {
  ElMessageBox.confirm('确认审核通过该调拨单吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    // TODO: 实现审核逻辑
    ElMessage.success('审核通过')
  })
}

// 完成
const handleComplete = (row: TransferRecord) => {
  ElMessageBox.confirm('确认完成该调拨单吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    // TODO: 实现完成逻辑
    ElMessage.success('调拨完成')
  })
}

// 取消
const handleCancel = (row: TransferRecord) => {
  ElMessageBox.confirm('确认取消该调拨单吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    // TODO: 实现取消逻辑
    ElMessage.success('调拨单已取消')
  })
}

// 导出数据
const handleExport = () => {
  // TODO: 实现导出逻辑
  ElMessage.success('开始导出数据')
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

// 商品选择变化
const handleProductChange = (productId: number, index: number) => {
  // TODO: 根据商品ID加载商品信息
  const product = productOptions.value.find((p) => p.id === productId)
  if (product) {
    form.products[index].quantity = 1
  }
}

// 添加商品
const addProduct = () => {
  form.products.push({
    productId: undefined,
    quantity: 1,
    remark: '',
  })
}

// 删除商品
const removeProduct = (index: number) => {
  form.products.splice(index, 1)
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (valid) {
      // TODO: 实现提交逻辑
      ElMessage.success('调拨单创建成功')
      dialogVisible.value = false
    }
  })
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
.transfer-container {
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

.product-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.product-item {
  padding: 10px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
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
