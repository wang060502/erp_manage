<template>
  <div class="category-container">
    <el-card class="category-card">
      <template #header>
        <div class="card-header">
          <span>商品分类管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增分类
          </el-button>
        </div>
      </template>

      <!-- 分类表格 -->
      <el-table v-loading="loading" :data="tableData">
        <el-table-column prop="category_name" label="分类名称" min-width="200" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="create_time" label="创建时间" width="180">
          <template #default="{ row }">
            {{ row.create_time.replace('T', ' ').replace(/\.\d+Z?$/, '') }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
              <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增分类' : '编辑分类'"
      width="500px"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" class="category-form">
        <el-form-item label="分类名称" prop="category_name">
          <el-input v-model="form.category_name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  createProductCategory,
  getProductCategoryList,
  updateProductCategory,
  deleteProductCategory,
} from '@/api/product/category'
import dayjs from 'dayjs'

// 表格数据
const loading = ref(false)
const tableData = ref([])

// 表单相关
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const formRef = ref<FormInstance>()
const form = reactive({
  category_id: undefined as number | undefined,
  category_name: '',
  status: 1,
})

// 表单验证规则
const rules = reactive<FormRules>({
  category_name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' },
  ],
})

// 获取分类列表
const fetchCategoryList = async () => {
  loading.value = true
  try {
    const res = await getProductCategoryList()
    tableData.value = res.data
  } catch (error) {
    console.error('获取分类列表失败:', error)
    ElMessage.error('获取分类列表失败')
  } finally {
    loading.value = false
  }
}

// 新增分类
const handleAdd = () => {
  dialogType.value = 'add'
  form.category_id = undefined
  form.category_name = ''
  form.status = 1
  dialogVisible.value = true
}

// 编辑分类
const handleEdit = (row: any) => {
  dialogType.value = 'edit'
  form.category_id = row.category_id
  form.category_name = row.category_name
  form.status = row.status
  dialogVisible.value = true
}

// 删除分类
const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确定要删除分类"${row.category_name}"吗？`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      await deleteProductCategory(row.category_id)
      ElMessage.success('删除成功')
      fetchCategoryList()
    } catch (error) {
      console.error('删除分类失败:', error)
      ElMessage.error('删除分类失败')
    }
  })
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (dialogType.value === 'add') {
          await createProductCategory({
            category_name: form.category_name,
            status: form.status,
          })
          ElMessage.success('新增成功')
        } else {
          await updateProductCategory(form.category_id!, {
            category_name: form.category_name,
            status: form.status,
          })
          ElMessage.success('编辑成功')
        }
        dialogVisible.value = false
        fetchCategoryList()
      } catch (error) {
        console.error('保存分类失败:', error)
        ElMessage.error('保存分类失败')
      }
    }
  })
}

// 状态切换处理
const handleStatusChange = async (row: { category_id: number; status: number }) => {
  try {
    await updateProductCategory(row.category_id, {
      status: row.status,
    })
    ElMessage.success('状态更新成功')
  } catch (error) {
    console.error('状态更新失败:', error)
    ElMessage.error('状态更新失败')
    // 恢复原状态
    row.status = row.status === 1 ? 0 : 1
  }
}

// 初始化
onMounted(() => {
  fetchCategoryList()
})
</script>

<style scoped>
.category-card {
  margin-bottom: 20px;
  border-radius: 12px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.card-header span {
  font-size: 18px;
  font-weight: 600;
}

.category-form {
  padding: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
