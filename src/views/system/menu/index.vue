<template>
  <el-card class="menu-container">
    <!-- 页面标题 -->
    <div class="page-title">菜单管理</div>
    <!-- 搜索表单 -->
    <div class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="菜单名称">
          <el-input v-model="searchForm.menuName" placeholder="请输入菜单名称" clearable />
        </el-form-item>
        <el-form-item label="状态" style="width: 180px">
          <el-select v-model="searchForm.visible" placeholder="请选择状态" clearable>
            <el-option label="显示" value="1" />
            <el-option label="隐藏" value="0" />
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
    </div>

    <!-- 操作栏 -->
    <div class="operation-bar">
      <el-button type="primary" @click="handleAdd" class="add-btn">
        <el-icon><Plus /></el-icon>
        新增菜单
      </el-button>
      <el-tooltip :content="isExpandAll ? '全部收缩' : '全部展开'" placement="top">
        <el-button class="icon-btn" @click="handleExpandAll" circle>
          <el-icon>
            <component :is="isExpandAll ? 'Fold' : 'Expand'" />
          </el-icon>
        </el-button>
      </el-tooltip>
    </div>

    <!-- 菜单列表 -->
    <div class="table-card">
      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="tableData"
        row-key="id"
        :default-expand-all="isExpandAll"
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
        <el-table-column prop="permission" label="权限标识" min-width="180" />
        <el-table-column prop="sort" label="排序" width="80" />
        <el-table-column prop="visible" label="可见性" width="100">
          <template #default="{ row }">
            <el-tag :type="row.visible === 1 ? 'success' : 'info'">
              {{ row.visible === 1 ? '显示' : '隐藏' }}
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
    </div>

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
            :check-strictly="true"
            placeholder="请选择上级菜单"
            clearable
            @clear="form.parentId = undefined"
            @change="onParentChange"
          />
        </el-form-item>
        <el-form-item label="菜单类型" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio :label="1">目录</el-radio>
            <el-radio :label="2">菜单</el-radio>
            <el-radio :label="3">按钮</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="菜单名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入菜单名称" />
        </el-form-item>
        <el-form-item label="图标" prop="icon" v-if="form.type !== 3">
          <el-select v-model="form.icon" clearable placeholder="请选择图标" style="width: 100%">
            <el-option
              v-for="item in iconOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
              <span style="display: flex; align-items: center">
                <component
                  :is="item.icon"
                  style="font-size: 18px; width: 18px; height: 18px; margin-right: 8px"
                />
                {{ item.label }}
              </span>
            </el-option>
          </el-select>
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
        <el-form-item label="是否可见" prop="visible">
          <el-radio-group v-model="form.visible">
            <el-radio :label="1">显示</el-radio>
            <el-radio :label="0">隐藏</el-radio>
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
  </el-card>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { Search, Refresh, Plus, Expand } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { createMenu, getMenuList, updateMenu, deleteMenu } from '@/api/system/menu'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { computed } from 'vue'
import type { Component } from 'vue'

// 搜索表单
const searchForm = reactive({
  menuName: '',
  visible: undefined as number | undefined,
})

// 表格数据
const loading = ref(false)
const tableData = ref([])

const fetchMenuList = async () => {
  loading.value = true
  try {
    const params: any = {}
    if (searchForm.menuName) params.menuName = searchForm.menuName
    if (searchForm.visible !== undefined) params.visible = searchForm.visible
    const res = await getMenuList(params)
    tableData.value = adaptMenuData(res.menus || [])
    // 更新菜单树
    menuTree.value = [
      {
        id: 0,
        name: '顶级菜单',
        children: tableData.value,
      },
    ]
  } finally {
    loading.value = false
  }
}
onMounted(fetchMenuList)

// 菜单树
const menuTree = ref([
  {
    id: 0,
    name: '顶级菜单',
    children: tableData.value,
  },
])

// 对话框
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const formRef = ref<FormInstance>()
const form = reactive({
  id: undefined,
  parentId: undefined,
  name: '',
  type: 1,
  path: '',
  component: '',
  permission: '',
  icon: '',
  sort: 0,
  visible: 1,
})

// 表单验证规则
const rules: FormRules = {
  type: [{ required: true, message: '请选择菜单类型', trigger: 'change' }],
  name: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
  visible: [{ required: true, message: '请选择可见性', trigger: 'change' }],
}

// 获取菜单类型标签
const getMenuTypeTag = (type: number) => {
  switch (type) {
    case 1:
      return 'info'
    case 2:
      return 'success'
    case 3:
      return 'warning'
    default:
      return 'info'
  }
}

// 获取菜单类型文本
const getMenuTypeText = (type: number) => {
  switch (type) {
    case 1:
      return '目录'
    case 2:
      return '菜单'
    case 3:
      return '按钮'
    default:
      return type
  }
}

// 搜索
const handleSearch = () => {
  fetchMenuList()
}

// 重置
const handleReset = () => {
  searchForm.menuName = ''
  searchForm.visible = undefined
  fetchMenuList()
}

// 递归获取所有节点
function getAllRows(tree) {
  const result = []
  function traverse(nodes) {
    nodes.forEach((node) => {
      result.push(node)
      if (node.children && node.children.length) {
        traverse(node.children)
      }
    })
  }
  traverse(tree)
  return result
}

// 展开/折叠
const isExpandAll = ref(false)
const tableRef = ref()

const handleExpandAll = async () => {
  await nextTick()
  const rows = getAllRows(tableData.value)
  const target = !isExpandAll.value
  rows.forEach((row) => {
    tableRef.value.toggleRowExpansion(row, target)
  })
  isExpandAll.value = target
}

// 新增
const handleAdd = (row?: { id?: number }) => {
  dialogType.value = 'add'
  dialogVisible.value = true
  form.parentId = row?.id ?? undefined
  Object.assign(form, {
    name: '',
    type: 1,
    path: '',
    component: '',
    permission: '',
    icon: '',
    sort: 0,
    visible: 1,
  })
}

// 编辑
const handleEdit = (row: any) => {
  dialogType.value = 'edit'
  dialogVisible.value = true
  Object.assign(form, row)
}

// 删除
const handleDelete = (row: any) => {
  ElMessageBox.confirm('确认删除该菜单？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    await deleteMenu(row.id)
    ElMessage.success('删除成功')
    fetchMenuList()
  })
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      const payload = buildMenuPayload()
      if (dialogType.value === 'add') {
        await createMenu(payload)
        ElMessage.success('新增成功')
      } else {
        await updateMenu(form.id, payload)
        ElMessage.success('编辑成功')
      }
      dialogVisible.value = false
      fetchMenuList()
    }
  })
}

function adaptMenuData(data: any[]): any[] {
  return data.map((item) => {
    const adapted = {
      id: item.menu_id,
      parentId: item.parent_id,
      name: item.menu_name,
      type: item.menu_type, // 1-目录 2-菜单 3-按钮
      path: item.path,
      component: item.component,
      permission: item.perms,
      icon: item.icon,
      sort: item.sort,
      status: item.visible === 1 ? 'active' : 'inactive',
      visible: item.visible,
      children: item.children ? adaptMenuData(item.children) : [],
      raw: item, // 保留原始数据，方便编辑时回填
    }
    return adapted
  })
}

function onParentChange(val) {
  if (val === 0) {
    form.parentId = 0
  }
}

const iconOptions = Object.keys(ElementPlusIconsVue).map((name) => ({
  label: name,
  value: name,
  icon: ElementPlusIconsVue[name] as Component,
}))

const buildMenuPayload = () => ({
  parentId: form.parentId,
  menuName: form.name,
  menuType: form.type,
  path: form.path,
  component: form.component,
  perms: form.permission,
  icon: form.icon,
  sort: form.sort,
  visible: form.visible,
})
</script>

<style scoped>
.menu-container {
  border-radius: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.page-title {
  font-size: 18px;
  font-weight: bold;
  color: #222;
  margin-bottom: 24px;
  letter-spacing: 2px;
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

.add-btn {
  background-color: #409eff;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.add-btn:hover {
  background-color: #66b1ff;
}

.icon-btn {
  background-color: #fff;
  color: #409eff;
  border: 1px solid #409eff;
  padding: 10px;
  border-radius: 50%;
  transition: background-color 0.3s;
}

.icon-btn:hover {
  background-color: #f0f0f0;
}
</style>
