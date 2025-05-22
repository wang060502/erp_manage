<template>
  <div class="customer-category-container">
    <!-- 操作栏 -->
    <div class="operation-bar">
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增分类
      </el-button>
    </div>

    <!-- 分类列表 -->
    <el-card class="table-card">
      <el-table
        v-loading="loading"
        :data="tableData"
        row-key="id"
        border
        default-expand-all
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      >
        <el-table-column prop="name" label="分类名称" min-width="200" />
        <el-table-column prop="code" label="分类编码" width="120" />
        <el-table-column prop="sort" label="排序" width="80" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'">
              {{ row.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button type="primary" link @click="handleAddSub(row)">添加子分类</el-button>
              <el-button type="success" link @click="handleEdit(row)">编辑</el-button>
              <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑分类对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增分类' : '编辑分类'"
      width="500px"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item v-if="dialogType === 'add' && form.parentId" label="父级分类">
          <el-input v-model="form.parentName" disabled />
        </el-form-item>
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="分类编码" prop="code">
          <el-input v-model="form.code" placeholder="请输入分类编码" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" :min="0" :max="999" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio label="active">启用</el-radio>
            <el-radio label="inactive">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="请输入备注信息" />
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
import { ref, reactive } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

interface Category {
  id: number
  name: string
  code: string
  sort: number
  status: string
  createTime: string
  remark?: string
  parentId?: number
  parentName?: string
  children?: Category[]
}

// 表格数据
const loading = ref(false)
const tableData = ref<Category[]>([
  {
    id: 1,
    name: '企业客户',
    code: 'ENTERPRISE',
    sort: 1,
    status: 'active',
    createTime: '2024-03-20 10:30:00',
    children: [
      {
        id: 3,
        name: '大型企业',
        code: 'ENTERPRISE_LARGE',
        sort: 1,
        status: 'active',
        createTime: '2024-03-20 10:35:00',
        parentId: 1,
        parentName: '企业客户',
      },
      {
        id: 4,
        name: '中小企业',
        code: 'ENTERPRISE_SME',
        sort: 2,
        status: 'active',
        createTime: '2024-03-20 10:36:00',
        parentId: 1,
        parentName: '企业客户',
      },
    ],
  },
  {
    id: 2,
    name: '个人客户',
    code: 'PERSONAL',
    sort: 2,
    status: 'active',
    createTime: '2024-03-20 10:31:00',
    children: [
      {
        id: 5,
        name: 'VIP客户',
        code: 'PERSONAL_VIP',
        sort: 1,
        status: 'active',
        createTime: '2024-03-20 10:37:00',
        parentId: 2,
        parentName: '个人客户',
      },
    ],
  },
])

// 对话框相关
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const formRef = ref<FormInstance>()
const form = reactive({
  name: '',
  code: '',
  sort: 0,
  status: 'active',
  remark: '',
  parentId: undefined as number | undefined,
  parentName: '',
})

const rules = reactive<FormRules>({
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入分类编码', trigger: 'blur' }],
  sort: [{ required: true, message: '请输入排序号', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
})

// 新增分类
const handleAdd = () => {
  dialogType.value = 'add'
  form.name = ''
  form.code = ''
  form.sort = 0
  form.status = 'active'
  form.remark = ''
  form.parentId = undefined
  form.parentName = ''
  dialogVisible.value = true
}

// 添加子分类
const handleAddSub = (row: Category) => {
  dialogType.value = 'add'
  form.name = ''
  form.code = ''
  form.sort = 0
  form.status = 'active'
  form.remark = ''
  form.parentId = row.id
  form.parentName = row.name
  dialogVisible.value = true
}

// 编辑分类
const handleEdit = (row: Category) => {
  dialogType.value = 'edit'
  Object.assign(form, row)
  dialogVisible.value = true
}

// 删除分类
const handleDelete = (row: Category) => {
  ElMessageBox.confirm('确认删除该分类吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    // TODO: 实现删除逻辑
    ElMessage.success('删除成功')
  })
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (valid) {
      // TODO: 实现提交逻辑
      ElMessage.success(dialogType.value === 'add' ? '新增成功' : '编辑成功')
      dialogVisible.value = false
    }
  })
}
</script>

<style scoped>
.customer-category-container {
  padding: 20px;
}

.operation-bar {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.table-card {
  margin-bottom: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
