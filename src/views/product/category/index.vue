<template>
  <div class="category-container">
    <el-card class="category-card">
      <template #header>
        <div class="card-header">
          <span>商品分类管理</span>
          <el-button type="primary" @click="handleAdd(null)">
            <el-icon><Plus /></el-icon>
            新增分类
          </el-button>
        </div>
      </template>

      <!-- 分类树形表格 -->
      <el-table
        v-loading="loading"
        :data="tableData"
        row-key="id"
        border
        default-expand-all
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      >
        <el-table-column prop="name" label="分类名称" min-width="200">
          <template #default="{ row }">
            <span>{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="code" label="分类编码" width="150" />
        <el-table-column prop="sort" label="排序" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button type="primary" link @click="handleAdd(row)"> 新增子分类 </el-button>
              <el-button type="primary" link @click="handleEdit(row)"> 编辑 </el-button>
              <el-button type="danger" link @click="handleDelete(row)"> 删除 </el-button>
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
        <el-form-item label="上级分类">
          <el-cascader
            v-model="form.parentId"
            :options="categoryOptions"
            :props="{
              checkStrictly: true,
              value: 'id',
              label: 'name',
              children: 'children',
              emitPath: false,
            }"
            clearable
            placeholder="请选择上级分类"
          />
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

// 表格数据
const loading = ref(false)
const tableData = ref([
  {
    id: 1,
    name: '电子产品',
    code: 'ELEC',
    sort: 1,
    status: 1,
    createTime: '2024-01-01 12:00:00',
    children: [
      {
        id: 11,
        name: '手机',
        code: 'ELEC-PHONE',
        sort: 1,
        status: 1,
        createTime: '2024-01-01 12:00:00',
      },
      {
        id: 12,
        name: '电脑',
        code: 'ELEC-PC',
        sort: 2,
        status: 1,
        createTime: '2024-01-01 12:00:00',
      },
    ],
  },
  {
    id: 2,
    name: '服装',
    code: 'CLOTH',
    sort: 2,
    status: 1,
    createTime: '2024-01-01 12:00:00',
    children: [
      {
        id: 21,
        name: '男装',
        code: 'CLOTH-MEN',
        sort: 1,
        status: 1,
        createTime: '2024-01-01 12:00:00',
      },
      {
        id: 22,
        name: '女装',
        code: 'CLOTH-WOMEN',
        sort: 2,
        status: 1,
        createTime: '2024-01-01 12:00:00',
      },
    ],
  },
])

// 表单相关
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const formRef = ref<FormInstance>()
const form = reactive({
  id: undefined as number | undefined,
  parentId: undefined as number | undefined,
  name: '',
  code: '',
  sort: 0,
  status: 1,
})

// 表单验证规则
const rules = reactive<FormRules>({
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' },
  ],
  code: [
    { required: true, message: '请输入分类编码', trigger: 'blur' },
    { pattern: /^[A-Z0-9-]+$/, message: '分类编码只能包含大写字母、数字和横杠', trigger: 'blur' },
  ],
  sort: [{ required: true, message: '请输入排序号', trigger: 'blur' }],
})

// 分类选项（用于级联选择器）
const categoryOptions = ref(tableData.value)

// 新增分类
const handleAdd = (row: any) => {
  dialogType.value = 'add'
  form.id = undefined
  form.parentId = row?.id
  form.name = ''
  form.code = ''
  form.sort = 0
  form.status = 1
  dialogVisible.value = true
}

// 编辑分类
const handleEdit = (row: any) => {
  dialogType.value = 'edit'
  form.id = row.id
  form.parentId = row.parentId
  form.name = row.name
  form.code = row.code
  form.sort = row.sort
  form.status = row.status
  dialogVisible.value = true
}

// 删除分类
const handleDelete = (row: any) => {
  ElMessageBox.confirm(
    `确定要删除分类"${row.name}"吗？${row.children?.length ? '该分类下还有子分类，删除后将一并删除！' : ''}`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    },
  ).then(() => {
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

// 初始化
onMounted(() => {
  // TODO: 加载分类数据
})
</script>

<style scoped>
.category-container {
  padding: 20px;
}

.category-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
