<template>
  <div class="out-stock-container">
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="出库单号">
          <el-input v-model="searchForm.code" placeholder="请输入出库单号" clearable />
        </el-form-item>
        <el-form-item label="出库类型">
          <el-select v-model="searchForm.type" placeholder="请选择出库类型" clearable>
            <el-option label="销售出库" value="sale" />
            <el-option label="调拨出库" value="transfer" />
            <el-option label="报损出库" value="damage" />
            <el-option label="其他出库" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="出库状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="待审核" value="pending" />
            <el-option label="已审核" value="approved" />
            <el-option label="已完成" value="completed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
        <el-form-item label="出库时间">
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
        新增出库
      </el-button>
      <el-button type="success" @click="handleExport">
        <el-icon><Download /></el-icon>
        导出数据
      </el-button>
    </div>

    <!-- 出库单列表 -->
    <el-card class="table-card">
      <el-table v-loading="loading" :data="tableData" border>
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="code" label="出库单号" width="180" />
        <el-table-column prop="type" label="出库类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getTypeTag(row.type)">
              {{ getTypeLabel(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="warehouse" label="出库仓库" width="150" />
        <el-table-column prop="customer" label="客户" width="150" />
        <el-table-column prop="totalAmount" label="总金额" width="120">
          <template #default="{ row }"> ¥{{ row.totalAmount.toFixed(2) }} </template>
        </el-table-column>
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

    <!-- 新增出库对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增出库' : '出库详情'"
      width="800px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        :disabled="dialogType === 'detail'"
      >
        <el-form-item label="出库类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择出库类型">
            <el-option label="销售出库" value="sale" />
            <el-option label="调拨出库" value="transfer" />
            <el-option label="报损出库" value="damage" />
            <el-option label="其他出库" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="出库仓库" prop="warehouseId">
          <el-select v-model="form.warehouseId" placeholder="请选择出库仓库">
            <el-option
              v-for="item in warehouseOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="客户" prop="customerId">
          <el-select
            v-model="form.customerId"
            placeholder="请选择客户"
            filterable
            remote
            :remote-method="handleCustomerSearch"
            :loading="customerSearchLoading"
          >
            <el-option
              v-for="item in customerOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="出库商品">
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
                  <el-form-item
                    :prop="'products.' + index + '.price'"
                    :rules="{ required: true, message: '请输入单价', trigger: 'blur' }"
                  >
                    <el-input-number
                      v-model="item.price"
                      :min="0"
                      :precision="2"
                      :step="0.1"
                      placeholder="单价"
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

// 搜索表单
const searchForm = reactive({
  code: '',
  type: '',
  status: '',
  dateRange: [],
})

// 表格数据
const loading = ref(false)
const tableData = ref([
  {
    id: 1,
    code: 'CK202403200001',
    type: 'sale',
    warehouse: '上海主仓库',
    customer: '张三',
    totalAmount: 9999.0,
    status: 'pending',
    createTime: '2024-03-20 10:30:00',
  },
  {
    id: 2,
    code: 'CK202403200002',
    type: 'transfer',
    warehouse: '北京分仓',
    customer: '李四',
    totalAmount: 8888.0,
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
  type: '',
  warehouseId: undefined as number | undefined,
  customerId: undefined as number | undefined,
  products: [] as Array<{
    productId: number | undefined
    quantity: number
    price: number
    remark: string
  }>,
  remark: '',
})

const rules = reactive<FormRules>({
  type: [{ required: true, message: '请选择出库类型', trigger: 'change' }],
  warehouseId: [{ required: true, message: '请选择出库仓库', trigger: 'change' }],
  customerId: [{ required: true, message: '请选择客户', trigger: 'change' }],
})

// 选项数据
const warehouseOptions = ref([
  { id: 1, name: '上海主仓库' },
  { id: 2, name: '北京分仓' },
])

const customerOptions = ref([])
const customerSearchLoading = ref(false)

const productOptions = ref([])
const productSearchLoading = ref(false)

// 获取类型标签
const getTypeTag = (type: string) => {
  const map: Record<string, string> = {
    sale: 'primary',
    transfer: 'warning',
    damage: 'danger',
    other: 'info',
  }
  return map[type] || 'info'
}

const getTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    sale: '销售出库',
    transfer: '调拨出库',
    damage: '报损出库',
    other: '其他出库',
  }
  return map[type] || '其他出库'
}

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
  searchForm.type = ''
  searchForm.status = ''
  searchForm.dateRange = []
  handleSearch()
}

// 新增出库
const handleAdd = () => {
  dialogType.value = 'add'
  form.type = ''
  form.warehouseId = undefined
  form.customerId = undefined
  form.products = []
  form.remark = ''
  dialogVisible.value = true
}

// 查看详情
const handleDetail = (row: any) => {
  dialogType.value = 'detail'
  // TODO: 加载详情数据
  dialogVisible.value = true
}

// 审核
const handleApprove = (row: any) => {
  ElMessageBox.confirm('确认审核通过该出库单吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    // TODO: 实现审核逻辑
    ElMessage.success('审核通过')
  })
}

// 完成
const handleComplete = (row: any) => {
  ElMessageBox.confirm('确认完成该出库单吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    // TODO: 实现完成逻辑
    ElMessage.success('出库完成')
  })
}

// 取消
const handleCancel = (row: any) => {
  ElMessageBox.confirm('确认取消该出库单吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    // TODO: 实现取消逻辑
    ElMessage.success('出库单已取消')
  })
}

// 导出数据
const handleExport = () => {
  // TODO: 实现导出逻辑
  ElMessage.success('开始导出数据')
}

// 客户搜索
const handleCustomerSearch = (query: string) => {
  if (query) {
    customerSearchLoading.value = true
    // TODO: 实现客户搜索逻辑
    setTimeout(() => {
      customerSearchLoading.value = false
      customerOptions.value = [
        { id: 1, name: '张三' },
        { id: 2, name: '李四' },
      ]
    }, 1000)
  } else {
    customerOptions.value = []
  }
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
    form.products[index].price = 0
  }
}

// 添加商品
const addProduct = () => {
  form.products.push({
    productId: undefined,
    quantity: 1,
    price: 0,
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
      ElMessage.success('出库单创建成功')
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
.out-stock-container {
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
