<template>
  <div class="price-container">
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
        <el-form-item label="价格区间">
          <el-input-number
            v-model="searchForm.minPrice"
            :min="0"
            :precision="2"
            placeholder="最低价"
            style="width: 130px"
          />
          <span class="mx-2">-</span>
          <el-input-number
            v-model="searchForm.maxPrice"
            :min="0"
            :precision="2"
            placeholder="最高价"
            style="width: 130px"
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
      <el-button type="primary" @click="handleBatchAdjust">
        <el-icon><Edit /></el-icon>
        批量调价
      </el-button>
      <el-button type="success" @click="handleExport">
        <el-icon><Download /></el-icon>
        导出数据
      </el-button>
    </div>

    <!-- 价格表格 -->
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
        <el-table-column label="价格信息" width="400">
          <template #default="{ row }">
            <div class="price-info">
              <div class="price-item">
                <span class="label">成本价：</span>
                <span class="value">¥{{ row.costPrice }}</span>
              </div>
              <div class="price-item">
                <span class="label">销售价：</span>
                <span class="value">¥{{ row.salePrice }}</span>
              </div>
              <div class="price-item">
                <span class="label">会员价：</span>
                <span class="value">¥{{ row.memberPrice }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)"> 编辑 </el-button>
            <el-button type="primary" link @click="handleHistory(row)"> 历史 </el-button>
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

    <!-- 批量调价对话框 -->
    <el-dialog v-model="batchDialogVisible" title="批量调价" width="500px">
      <el-form ref="batchFormRef" :model="batchForm" :rules="batchRules" label-width="100px">
        <el-form-item label="调价方式" prop="type">
          <el-radio-group v-model="batchForm.type">
            <el-radio label="fixed">固定金额</el-radio>
            <el-radio label="percentage">百分比</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="调价数值" prop="value">
          <el-input-number
            v-model="batchForm.value"
            :precision="2"
            :step="0.1"
            :min="batchForm.type === 'percentage' ? -100 : -999999"
            :max="batchForm.type === 'percentage' ? 100 : 999999"
          />
          <span class="ml-2">{{ batchForm.type === 'percentage' ? '%' : '元' }}</span>
        </el-form-item>
        <el-form-item label="调价范围" prop="scope">
          <el-checkbox-group v-model="batchForm.scope">
            <el-checkbox label="costPrice">成本价</el-checkbox>
            <el-checkbox label="salePrice">销售价</el-checkbox>
            <el-checkbox label="memberPrice">会员价</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="batchDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleBatchSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 编辑价格对话框 -->
    <el-dialog v-model="editDialogVisible" title="编辑价格" width="500px">
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="100px">
        <el-form-item label="成本价" prop="costPrice">
          <el-input-number v-model="editForm.costPrice" :precision="2" :step="0.1" :min="0" />
        </el-form-item>
        <el-form-item label="销售价" prop="salePrice">
          <el-input-number v-model="editForm.salePrice" :precision="2" :step="0.1" :min="0" />
        </el-form-item>
        <el-form-item label="会员价" prop="memberPrice">
          <el-input-number v-model="editForm.memberPrice" :precision="2" :step="0.1" :min="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleEditSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Search, Refresh, Edit, Download } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

// 搜索表单
const searchForm = reactive({
  name: '',
  categoryId: undefined as number | undefined,
  minPrice: undefined as number | undefined,
  maxPrice: undefined as number | undefined,
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
    costPrice: 6999,
    salePrice: 8999,
    memberPrice: 8499,
  },
  {
    id: 2,
    name: 'MacBook Pro',
    sku: 'MBP-14-M2',
    category: '电子产品',
    image: 'https://via.placeholder.com/50',
    costPrice: 12999,
    salePrice: 14999,
    memberPrice: 14499,
  },
])

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)

// 选中的商品
const selectedProducts = ref([])

// 批量调价相关
const batchDialogVisible = ref(false)
const batchFormRef = ref<FormInstance>()
const batchForm = reactive({
  type: 'fixed',
  value: 0,
  scope: ['salePrice'],
})

const batchRules = reactive<FormRules>({
  type: [{ required: true, message: '请选择调价方式', trigger: 'change' }],
  value: [{ required: true, message: '请输入调价数值', trigger: 'blur' }],
  scope: [{ required: true, message: '请选择调价范围', trigger: 'change' }],
})

// 编辑价格相关
const editDialogVisible = ref(false)
const editFormRef = ref<FormInstance>()
const editForm = reactive({
  id: undefined as number | undefined,
  costPrice: 0,
  salePrice: 0,
  memberPrice: 0,
})

const editRules = reactive<FormRules>({
  costPrice: [{ required: true, message: '请输入成本价', trigger: 'blur' }],
  salePrice: [{ required: true, message: '请输入销售价', trigger: 'blur' }],
  memberPrice: [{ required: true, message: '请输入会员价', trigger: 'blur' }],
})

// 搜索
const handleSearch = () => {
  console.log('搜索条件：', searchForm)
  // TODO: 实现搜索逻辑
}

// 重置搜索
const resetSearch = () => {
  searchForm.name = ''
  searchForm.categoryId = undefined
  searchForm.minPrice = undefined
  searchForm.maxPrice = undefined
  handleSearch()
}

// 表格选择变化
const handleSelectionChange = (selection: any[]) => {
  selectedProducts.value = selection
}

// 批量调价
const handleBatchAdjust = () => {
  if (selectedProducts.value.length === 0) {
    ElMessage.warning('请先选择要调价的商品')
    return
  }
  batchDialogVisible.value = true
}

// 批量调价提交
const handleBatchSubmit = async () => {
  if (!batchFormRef.value) return
  await batchFormRef.value.validate((valid) => {
    if (valid) {
      // TODO: 实现批量调价逻辑
      ElMessage.success('批量调价成功')
      batchDialogVisible.value = false
    }
  })
}

// 编辑价格
const handleEdit = (row: any) => {
  editForm.id = row.id
  editForm.costPrice = row.costPrice
  editForm.salePrice = row.salePrice
  editForm.memberPrice = row.memberPrice
  editDialogVisible.value = true
}

// 编辑价格提交
const handleEditSubmit = async () => {
  if (!editFormRef.value) return
  await editFormRef.value.validate((valid) => {
    if (valid) {
      // TODO: 实现编辑价格逻辑
      ElMessage.success('价格修改成功')
      editDialogVisible.value = false
    }
  })
}

// 查看价格历史
const handleHistory = (row: any) => {
  // TODO: 实现查看价格历史逻辑
  ElMessage.info(`查看商品"${row.name}"的价格历史`)
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
.price-container {
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

.mx-2 {
  margin: 0 8px;
}

.ml-2 {
  margin-left: 8px;
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

.price-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.price-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.price-item .label {
  color: #909399;
  width: 60px;
}

.price-item .value {
  color: #f56c6c;
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
