<template>
  <div class="menu-container">
    <!-- 搜索表单 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="菜单名称">
          <el-input v-model="searchForm.name" placeholder="请输入菜单名称" clearable />
        </el-form-item>
        <el-form-item label="菜单类型">
          <el-select v-model="searchForm.type" placeholder="请选择类型" clearable>
            <el-option label="目录" value="directory" />
            <el-option label="菜单" value="menu" />
            <el-option label="按钮" value="button" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="启用" value="active" />
            <el-option label="禁用" value="inactive" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
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
        新增菜单
      </el-button>
      <el-button type="success" @click="handleExpandAll">
        <el-icon><Expand /></el-icon>
        展开/折叠
      </el-button>
    </div>

    <!-- 菜单列表 -->
    <el-card class="table-card">
      <el-table
        v-loading="loading"
        :data="tableData"
        row-key="id"
        border
        default-expand-all
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      >
        <el-table-column prop="name" label="菜单名称" min-width="180" />
        <el-table-column prop="icon" label="图标" width="100">
          <template #default="{ row }">
            <el-icon v-if="row.icon">
              <component :is="row.icon" />
            </el-icon>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getMenuTypeTag(row.type)">{{ getMenuTypeText(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="path" label="路由路径" min-width="180" />
        <el-table-column prop="component" label="组件路径" min-width="180" />
        <el-table-column prop="permission" label="权限标识" min-width="180" />
        <el-table-column prop="sort" label="排序" width="80" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'">
              {{ row.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button type="primary" link @click="handleAdd(row)">新增</el-button>
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
      :title="dialogType === 'add' ? '新增菜单' : '编辑菜单'"
      width="600px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        label-position="right"
      >
        <el-form-item label="上级菜单">
          <el-tree-select
            v-model="form.parentId"
            :data="menuTree"
            :props="{ label: 'name', value: 'id', children: 'children' }"
            placeholder="请选择上级菜单"
            clearable
          />
        </el-form-item>
        <el-form-item label="菜单类型" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio value="directory">目录</el-radio>
            <el-radio value="menu">菜单</el-radio>
            <el-radio value="button">按钮</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="菜单名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入菜单名称" />
        </el-form-item>
        <el-form-item label="图标" prop="icon" v-if="form.type !== 'button'">
          <el-input v-model="form.icon" placeholder="请输入图标名称" />
        </el-form-item>
        <el-form-item label="路由路径" prop="path" v-if="form.type !== 'button'">
          <el-input v-model="form.path" placeholder="请输入路由路径" />
        </el-form-item>
        <el-form-item label="组件路径" prop="component" v-if="form.type === 'menu'">
          <el-input v-model="form.component" placeholder="请输入组件路径" />
        </el-form-item>
        <el-form-item label="权限标识" prop="permission" v-if="form.type !== 'directory'">
          <el-input v-model="form.permission" placeholder="请输入权限标识" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" :min="0" :max="999" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio value="active">启用</el-radio>
            <el-radio value="inactive">禁用</el-radio>
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
import { ref, reactive } from 'vue'
import { Search, Refresh, Plus, Expand } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

// 搜索表单
const searchForm = reactive({
  name: '',
  type: '',
  status: '',
})

// 表格数据
const loading = ref(false)
const tableData = ref([
  {
    id: 1,
    name: '系统管理',
    icon: 'Setting',
    type: 'directory',
    path: '/system',
    component: 'Layout',
    permission: '',
    sort: 1,
    status: 'active',
    children: [
      {
        id: 11,
        name: '用户管理',
        icon: 'User',
        type: 'menu',
        path: 'user',
        component: 'system/user/index',
        permission: 'system:user:list',
        sort: 1,
        status: 'active',
      },
      {
        id: 12,
        name: '角色管理',
        icon: 'UserFilled',
        type: 'menu',
        path: 'role',
        component: 'system/role/index',
        permission: 'system:role:list',
        sort: 2,
        status: 'active',
      },
      {
        id: 13,
        name: '菜单管理',
        icon: 'Menu',
        type: 'menu',
        path: 'menu',
        component: 'system/menu/index',
        permission: 'system:menu:list',
        sort: 3,
        status: 'active',
      },
    ],
  },
])

// 菜单树
const menuTree = ref([
  {
    id: 0,
    name: '主目录',
    children: tableData.value,
  },
])

// 对话框
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const formRef = ref<FormInstance>()
const form = reactive({
  parentId: '',
  type: 'menu',
  name: '',
  icon: '',
  path: '',
  component: '',
  permission: '',
  sort: 0,
  status: 'active',
})

// 表单验证规则
const rules: FormRules = {
  type: [{ required: true, message: '请选择菜单类型', trigger: 'change' }],
  name: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
  path: [{ required: true, message: '请输入路由路径', trigger: 'blur' }],
  component: [{ required: true, message: '请输入组件路径', trigger: 'blur' }],
  permission: [{ required: true, message: '请输入权限标识', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
}

// 获取菜单类型标签
const getMenuTypeTag = (type: string) => {
  const typeMap: Record<string, string> = {
    directory: 'info',
    menu: 'success',
    button: 'warning',
  }
  return typeMap[type] || 'info'
}

// 获取菜单类型文本
const getMenuTypeText = (type: string) => {
  const typeMap: Record<string, string> = {
    directory: '目录',
    menu: '菜单',
    button: '按钮',
  }
  return typeMap[type] || type
}

// 搜索
const handleSearch = () => {
  // TODO: 实现搜索逻辑
  console.log('搜索条件：', searchForm)
}

// 重置
const handleReset = () => {
  searchForm.name = ''
  searchForm.type = ''
  searchForm.status = ''
}

// 展开/折叠
const handleExpandAll = () => {
  // TODO: 实现展开/折叠逻辑
}

// 新增
const handleAdd = (row?: (typeof tableData.value)[0]) => {
  dialogType.value = 'add'
  dialogVisible.value = true
  form.parentId = row?.id || ''
  form.type = 'menu'
  form.name = ''
  form.icon = ''
  form.path = ''
  form.component = ''
  form.permission = ''
  form.sort = 0
  form.status = 'active'
}

// 编辑
const handleEdit = (row: (typeof tableData.value)[0]) => {
  dialogType.value = 'edit'
  dialogVisible.value = true
  Object.assign(form, row)
}

// 删除
const handleDelete = (row: (typeof tableData.value)[0]) => {
  ElMessageBox.confirm('确认删除该菜单？', '提示', {
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
.menu-container {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
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
