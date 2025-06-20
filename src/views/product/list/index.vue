<template>
  <el-card class="product-list-container">
    <div class="product-list-container-header-title">商品列表</div>
    <div class="product-list-container-header">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="商品名称">
          <el-input v-model.trim="searchForm.product_title"  placeholder="请输入商品名称" clearable />
        </el-form-item>
        <el-form-item label="商品SKU">
          <el-input v-model.trim="searchForm.product_sku" placeholder="请输入商品SKU" clearable />
        </el-form-item>
        <el-form-item label="商品分类" style="width: 200px">
          <el-select v-model="searchForm.category_id" placeholder="请选择分类" clearable>
            <el-option
              v-for="item in categoryOptions"
              :key="item.category_id"
              :label="item.category_name"
              :value="item.category_id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" style="width: 200px">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="在售" :value="1" />
            <el-option label="下架" :value="0" />
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
    </div>

    <!-- 操作栏 -->
    <div class="operation-bar">
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增商品
      </el-button>
      <el-button type="danger" :disabled="!selectedProducts.length" @click="handleBatchDelete">
        <el-icon><Delete /></el-icon>
        批量删除
      </el-button>
      <el-button type="success" @click="handleExport">
        <el-icon><Download /></el-icon>
        导出数据
      </el-button>
    </div>

    <!-- 表格 -->
    <div class="table-card">
      <el-table v-loading="loading" :data="tableData" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column label="商品信息" min-width="300">
          <template #default="{ row }">
            <div class="product-info">
              <el-image :src="row.product_image" class="product-image" />
              <div class="product-detail">
                <div
                  class="product-name"
                  @click="handleView(row)"
                  style="cursor: pointer; color: #409eff"
                >
                  {{ row.product_title }}
                </div>
                <div class="product-sku">SKU: {{ row.product_sku }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="product_type" label="商品类型" width="120">
          <template #default="{ row }">
            {{ row.category_name }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              @change="(val) => handleStatusChange(row, val)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="create_time" label="更新时间" width="180">
          <template #default="{ row }">
            <span v-if="row.update_time === null">暂未更新</span>
            <span v-else>{{ row.update_time.replace('T', ' ').replace(/\.\d+Z?$/, '') }}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button type="primary" link @click="handleEdit(row)"> 编辑 </el-button>
              <el-button type="danger" link @click="handleDelete(row)"> 删除 </el-button>
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
    </div>

    <el-dialog v-model="dialogVisible" title="商品信息" width="30%" :before-close="handleClose">
      <el-form :model="form" :rules="rules" ref="formRef" label-position="left" label-width="100px">
        <el-form-item label="商品名称" prop="product_title">
          <el-input v-model.trim="form.product_title" />
        </el-form-item>
        <el-form-item label="商品SKU" prop="product_sku">
          <el-input v-model.trim="form.product_sku" />
        </el-form-item>
        <el-form-item label="类型代码" prop="type_code">
          <el-input v-model="form.type_code" disabled placeholder="自动生成" />
        </el-form-item>
        <el-form-item label="商品分类" prop="category_id">
          <el-select v-model="form.category_id" placeholder="请选择分类">
            <el-option
              v-for="item in categoryOptions"
              :key="item.category_id"
              :label="item.category_name"
              :value="item.category_id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="商品图片" style="margin-bottom: 50px">
          <el-upload
            class="avatar-uploader"
            style="width: 180px; height: 160px"
            drag
            :auto-upload="false"
            :show-file-list="false"
            accept="image/*"
            @change="handleFileChange"
          >
            <img
              v-if="form.product_image"
              :src="form.product_image"
              class="avatar"
              @click.stop="$refs.uploadRef.click()"
            />
            <div v-else class="upload-placeholder">
              <el-icon class="upload-icon"><Plus /></el-icon>
              <span class="upload-text">点击上传图片</span>
            </div>
          </el-upload>
        </el-form-item>
        <el-form-item label="商品详情" prop="product_detail">
          <el-input v-model="form.product_detail" type="textarea" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" />
        </el-form-item>
        <el-form-item label="状态" prop="status" v-if="dialogType === 'edit'">
          <el-switch
            v-model="form.status"
            :active-value="1"
            :inactive-value="0"
            active-text="在售"
            inactive-text="下架"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 查看详情弹窗 -->
    <el-dialog v-model="detailDialogVisible" title="商品详情" width="40%">
      <div v-if="currentProduct" class="product-detail-view">
        <div class="detail-header">
          <el-image :src="currentProduct.product_image" class="detail-image" />
          <div class="detail-info">
            <h3>{{ currentProduct.product_title }}</h3>
            <p>SKU: {{ currentProduct.product_sku }}</p>
            <p>商品类型: {{ currentProduct.product_type }}</p>
            <p>类型代码: {{ currentProduct.type_code }}</p>
            <p>
              状态:
              <el-tag :type="currentProduct.status === 1 ? 'success' : 'info'">
                {{ currentProduct.status === 1 ? '在售' : '下架' }}
              </el-tag>
            </p>
          </div>
        </div>
        <el-divider />
        <div class="detail-content">
          <h4>商品详情</h4>
          <p>{{ currentProduct.product_detail || '暂无详情' }}</p>
          <h4>备注</h4>
          <p>{{ currentProduct.remark || '暂无备注' }}</p>
          <h4>时间信息</h4>
          <p>创建时间: {{ currentProduct.create_time.replace('T', ' ').replace(/\.\d+Z?$/, '') }}</p>
          <p v-if="currentProduct.update_time">
            更新时间: {{ currentProduct.update_time.replace('T', ' ').replace(/\.\d+Z?$/, '') }}
          </p>
          <p v-if="!currentProduct.update_time">更新时间: 暂未更新</p>
        </div>
      </div>
    </el-dialog>
  </el-card>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Search, Refresh, Plus, Delete, Download } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  createProduct,
  getProductList,
  updateProduct,
  deleteProduct,
  batchDeleteProducts,
} from '@/api/product/list'
import { uploadFile } from '@/api/upload/upload'
import dayjs from 'dayjs'
import { getProductCategoryList } from '@/api/product/category'

// 搜索表单
const searchForm = reactive({
  product_title: '',
  product_sku: '',
  category_id: undefined as number | undefined,
  status: undefined as number | undefined,
})

// 表格数据
const loading = ref(false)
const tableData = ref([])
const total = ref(0)

// 分页
const currentPage = ref(1)
const pageSize = ref(10)

// 选中的商品
const selectedProducts = ref([])

const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')

const initialForm = {
  product_id: undefined,
  product_title: '',
  product_type: '',
  product_sku: '',
  type_code: '',
  category_id: undefined,
  product_image: '',
  product_detail: '',
  remark: '',
  status: 1,
}

const form = reactive({ ...initialForm })

const rules = {
  product_title: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  product_sku: [{ required: true, message: '请输入SKU', trigger: 'blur' }],
  category_id: [{ required: true, message: '请选择分类', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
}

const categoryOptions = ref<{ category_id: number; category_name: string }[]>([])

const fetchProductList = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      limit: pageSize.value,
      ...searchForm,
    }
    const res = await getProductList(params)
    tableData.value = res.data.list
    total.value = res.data.pagination.total
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  fetchProductList()
  const res = await getProductCategoryList()
  categoryOptions.value = res.data
})

// 搜索
const handleSearch = () => {
  currentPage.value = 1 // 重置到第一页
  fetchProductList()
}

// 重置搜索
const resetSearch = () => {
  Object.assign(searchForm, {
    product_title: '',
    product_sku: '',
    category_id: undefined,
    status: undefined,
  })
  currentPage.value = 1
  fetchProductList()
}

// 新增商品
const handleAdd = () => {
  dialogType.value = 'add'
  Object.assign(form, initialForm)
  dialogVisible.value = true
}

// 批量删除
const handleBatchDelete = async () => {
  if (!selectedProducts.value.length) return
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedProducts.value.length} 个商品吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )
    const ids = selectedProducts.value.map((item) => item.product_id)
    await batchDeleteProducts(ids)
    ElMessage.success('批量删除成功')
    fetchProductList()
  } catch {
    // 用户取消，无需处理
  }
}

// 导出数据
const handleExport = () => {
  // TODO: 实现导出逻辑
  ElMessage.success('开始导出数据')
}

// 表格选择变化
const handleSelectionChange = (selection: any[]) => {
  selectedProducts.value = selection
}

// 编辑商品
const handleEdit = (row) => {
  dialogType.value = 'edit'
  // 确保类型转换正确
  Object.assign(form, {
    ...row,
    status: Number(row.status),
    category_id: Number(row.category_id),
  })
  dialogVisible.value = true
}

// 查看商品
const handleView = (row: any) => {
  currentProduct.value = row
  detailDialogVisible.value = true
}

// 删除商品
const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确定要删除商品"${row.product_title}"吗？`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    await deleteProduct(row.product_id)
    ElMessage.success('删除成功')
    fetchProductList()
  })
}

// 分页大小变化
const handleSizeChange = (val: number) => {
  pageSize.value = val
  fetchProductList()
}

// 页码变化
const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchProductList()
}

// 处理文件选择
const handleFileChange = async (uploadFile1: any) => {
  const file = uploadFile1.raw
  console.log('file', file)
  // 验证文件
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
    return
  }

  try {
    // 调用上传接口
    const res = await uploadFile(file)
    console.log('res', res)
    if (res.code === 200 && res.file.url) {
      // 正确：更新响应式表单数据中的图片URL
      form.product_image = res.file.url
      ElMessage.success('图片上传成功')
    } else {
      ElMessage.error(res.message || '图片上传失败')
    }
  } catch (error) {
    console.error('图片上传失败:', error)
    ElMessage.error('图片上传失败')
  }
}

const handleClose = () => {
  dialogVisible.value = false
}

const handleSubmit = async () => {
  if (dialogType.value === 'add') {
    // 只取需要的字段
    const data = {
      product_title: form.product_title,
      product_sku: form.product_sku,
      category_id: form.category_id,
      product_image: form.product_image,
      product_detail: form.product_detail,
      remark: form.remark,
      // 不传 product_type、type_code、status
    }
    await createProduct(data)
    ElMessage.success('新增成功')
  } else {
    await updateProduct(form.product_id, form)
    ElMessage.success('编辑成功')
  }
  dialogVisible.value = false
  fetchProductList()
}

const handleStatusChange = async (row: any, val: number) => {
  try {
    await updateProduct(row.product_id, { status: val })
    ElMessage.success('状态更新成功')
  } catch (error) {
    // 如果更新失败，恢复原状态
    row.status = val === 1 ? 0 : 1
    ElMessage.error('状态更新失败')
  }
}

const detailDialogVisible = ref(false)
const currentProduct = ref<any>(null)
</script>

<style scoped>
.product-list-container-header-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 20px;
}
.product-list-container {
  border-radius: 12px;
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

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
(.el-upload) {
  --el-upload-dragger-padding-horizontal: 70px;
  --el-upload-dragger-padding-vertical: 106px;
}
.avatar-uploader .avatar {
  width: 120px;
  height: 120px;
  display: block;
  border-radius: 8px;
  cursor: pointer;
  object-fit: cover;
  margin: 0 auto;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 80px;
  color: #999;
}

.upload-icon {
  font-size: 20px;
}

.upload-text {
  margin-top: 10px;
  font-size: 12px;
}

.product-detail-view {
  padding: 20px;
}

.detail-header {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.detail-image {
  /* width: 200px; */
  height: 200px;
  border-radius: 8px;
  object-fit: cover;
}

.detail-info {
  flex: 1;
}

.detail-info h3 {
  margin: 0 0 10px 0;
  font-size: 18px;
  color: #303133;
}

.detail-info p {
  margin: 8px 0;
  color: #606266;
}

.detail-content {
  color: #606266;
}

.detail-content h4 {
  margin: 16px 0 8px 0;
  color: #303133;
}

.detail-content p {
  margin: 8px 0;
  line-height: 1.6;
}
</style>
