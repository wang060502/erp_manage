<template>
  <el-card class="department-page">
    <div>
      <div class="header-bar">
        <span class="title">部门管理</span>
        <div>
          <el-tooltip :content="isAllExpanded ? '全部收缩' : '全部展开'" placement="top">
            <el-button size="small" @click="toggleExpandAll" circle>
              <el-icon>
                <component :is="isAllExpanded ? 'Fold' : 'Expand'" />
              </el-icon>
            </el-button>
          </el-tooltip>
          <el-button type="primary" @click="openDialog('add')">新增部门</el-button>
        </div>
      </div>
      <el-table
        ref="deptTable"
        :data="deptTree"
        style="width: 100%"
        row-key="deptId"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        default-expand-all
      >
        <el-table-column prop="deptName" label="部门名称" min-width="180" />
        <el-table-column prop="orderNum" label="排序" width="80" align="center" />
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="openDialog('edit', row)"
              >编辑</el-button
            >
            <el-button
              size="small"
              type="danger"
              link
              @click="deleteDepartmentConfirm(row.deptId, getDeptPath(row.deptId).join(' / '))"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      :title="dialogMode === 'add' ? '新增部门' : '编辑部门'"
      v-model="dialogVisible"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="上级部门" prop="parentId">
          <el-tree-select
            v-model="form.parentId"
            :data="treeSelectOptions"
            :props="treeProps"
            clearable
            placeholder="请选择上级部门"
            :check-strictly="true"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="部门名称" prop="deptName">
          <el-input v-model="form.deptName" placeholder="请输入部门名称" />
        </el-form-item>
        <el-form-item label="排序" prop="orderNum">
          <el-input-number v-model="form.orderNum" :min="0" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="onSubmit">保存</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, computed, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getDepartmentTree,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  DepartmentTreeItem,
  CreateDepartmentParams,
} from '@/api/system/department'
import { Fold, Expand } from '@element-plus/icons-vue'

const deptTree = ref<DepartmentTreeItem[]>([])
const treeProps = { children: 'children', label: 'deptName', value: 'deptId' }
const formRef = ref()
const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit'>('add')
const form = reactive<CreateDepartmentParams & { deptId?: number }>({
  parentId: undefined,
  deptName: '',
  orderNum: 0,
  status: 1,
  deptId: undefined,
})

const rules = {
  deptName: [{ required: true, message: '请输入部门名称', trigger: 'blur' }],
}

const deptTable = ref()

const isAllExpanded = ref(true)

function convertDeptTree(arr) {
  return arr.map((item) => ({
    deptId: item.dept_id,
    parentId: item.parent_id,
    deptName: item.dept_name,
    orderNum: item.order_num,
    status: item.status,
    children: item.children ? convertDeptTree(item.children) : [],
  }))
}

const fetchTree = async () => {
  const res = await getDepartmentTree()
  const raw = res.depts || []
  deptTree.value = convertDeptTree(raw)
  await expandAll()
}

const openDialog = (mode: 'add' | 'edit', row?: any) => {
  dialogMode.value = mode
  if (mode === 'add') {
    form.deptId = undefined
    form.parentId = undefined
    form.deptName = ''
    form.orderNum = 0
    form.status = 1
  } else if (row) {
    form.deptId = row.deptId
    form.parentId = row.parentId
    form.deptName = row.deptName
    form.orderNum = row.orderNum
    form.status = row.status
  }
  dialogVisible.value = true
}

const onSubmit = async () => {
  await formRef.value.validate()
  if (dialogMode.value === 'add') {
    await createDepartment(form)
    ElMessage.success('新增成功')
  } else if (dialogMode.value === 'edit' && form.deptId !== undefined) {
    const { deptId, ...updateData } = form
    await updateDepartment(deptId, updateData)
    ElMessage.success('更新成功')
  }
  dialogVisible.value = false
  fetchTree()
}

const deleteDepartmentConfirm = (deptId: number, deptPath: string) => {
  ElMessageBox.confirm(`确定要删除部门【${deptPath}】吗？`, '提示', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning',
    confirmButtonClass: 'el-button--danger',
  }).then(async () => {
    await deleteDepartment(deptId)
    ElMessage.success('删除成功')
    fetchTree()
  })
}

const treeSelectOptions = computed(() => [
  { deptId: undefined, deptName: '顶级部门', children: deptTree.value },
])

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

const toggleExpandAll = async () => {
  await nextTick()
  const rows = getAllRows(deptTree.value)
  const expand = !isAllExpanded.value
  rows.forEach((row) => {
    deptTable.value.toggleRowExpansion(row, expand)
  })
  isAllExpanded.value = expand
}

const expandAll = async () => {
  await nextTick()
  const rows = getAllRows(deptTree.value)
  rows.forEach((row) => {
    deptTable.value.toggleRowExpansion(row, true)
  })
  isAllExpanded.value = true
}

function getDeptPath(deptId: number, tree = deptTree.value, path: string[] = []): string[] {
  for (const node of tree) {
    if (node.deptId === deptId) {
      return [...path, node.deptName]
    }
    if (node.children && node.children.length) {
      const found = getDeptPath(deptId, node.children, [...path, node.deptName])
      if (found.length) return found
    }
  }
  return []
}

onMounted(fetchTree)
</script>

<style scoped>
.department-page {
  border-radius: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  gap: 10px;
}
.header-bar > div {
  display: flex;
  align-items: center;
  gap: 12px;
}
.title {
  font-size: 18px;
  font-weight: bold;
}
</style>
