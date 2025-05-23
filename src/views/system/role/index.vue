<template>
  <el-card class="role-container">
    <!-- 页面标题 -->
    <div class="page-title">角色管理</div>
    <!-- 搜索表单 -->
    <div class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="角色名称">
          <el-input v-model="searchForm.name" placeholder="请输入角色名称" clearable />
        </el-form-item>
        <el-form-item label="角色编码">
          <el-input v-model="searchForm.code" placeholder="请输入角色编码" clearable />
        </el-form-item>
        <el-form-item label="数据权限" style="width: 200px">
          <el-select v-model="searchForm.dataScope" placeholder="请选择数据权限" clearable>
            <el-option label="本人" :value="1" />
            <el-option label="部门" :value="2" />
            <el-option label="全部" :value="3" />
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
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增角色
      </el-button>
      <el-button type="success" @click="handleExport">
        <el-icon><Download /></el-icon>
        导出数据
      </el-button>
    </div>

    <!-- 角色列表 -->
    <div class="table-card">
      <el-table v-loading="loading" :data="tableData" style="width: 100%">
        <el-table-column prop="name" label="角色名称" min-width="120" />
        <el-table-column prop="code" label="角色编码" width="120" />
        <el-table-column
          prop="description"
          label="角色描述"
          min-width="200"
          show-overflow-tooltip
        />
        <el-table-column prop="dataScope" label="数据权限" width="100">
          <template #default="{ row }">
            <el-tag :type="getDataScopeTag(row.dataScope)">
              {{ getDataScopeText(row.dataScope) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
              <el-button type="success" link @click="handlePermission(row)">权限设置</el-button>
              <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
              <el-button type="info" link @click="handleAssignUser(row)">分配用户</el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增角色' : '编辑角色'"
      width="600px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        label-position="right"
      >
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色编码" prop="code">
          <el-input
            v-model="form.code"
            placeholder="请输入角色编码"
            :disabled="dialogType === 'edit'"
          />
        </el-form-item>
        <el-form-item label="角色描述" prop="description">
          <el-input v-model="form.description" type="textarea" placeholder="请输入角色描述" />
        </el-form-item>
        <el-form-item label="数据权限" prop="dataScope">
          <el-radio-group v-model="form.dataScope">
            <el-radio :label="1">本人</el-radio>
            <el-radio :label="2">部门</el-radio>
            <el-radio :label="3">全部</el-radio>
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

    <!-- 权限设置对话框 -->
    <el-dialog v-model="permissionDialogVisible" title="权限设置" width="600px">
      <el-tree
        ref="permissionTreeRef"
        :data="permissionTree"
        show-checkbox
        node-key="menu_id"
        :props="{ label: 'menu_name', children: 'children' }"
        :default-checked-keys="checkedPermissions"
      />
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="permissionDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handlePermissionSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 分配用户对话框 -->
    <el-dialog v-model="assignDialogVisible" title="分配用户" width="700px">
      <el-form :inline="true" style="margin-bottom: 12px">
        <el-form-item label="用户名" style="width: 180px">
          <el-input v-model="assignUserSearch.username" placeholder="用户名" clearable />
        </el-form-item>
        <el-form-item label="姓名" style="width: 180px">
          <el-input v-model="assignUserSearch.realName" placeholder="姓名" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchUnassignedUsers">搜索</el-button>
          <el-button @click="handleAssignUserReset">重置</el-button>
        </el-form-item>
      </el-form>
      <el-table
        :data="assignUserTable"
        v-loading="assignLoading"
        @selection-change="handleAssignUserSelectionChange"
        style="width: 100%"
        height="320"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column label="头像" width="70">
          <template #default="{ row }">
            <el-avatar
              :src="row.avatar"
              :size="32"
              style="background: #409eff; color: #fff; font-weight: bold"
            >
              {{ row.realName ? row.realName[0] : row.username[0] }}
            </el-avatar>
          </template>
        </el-table-column>
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="realName" label="姓名" />
        <el-table-column prop="deptName" label="部门" min-width="120" />
      </el-table>
      <div class="pagination" style="margin-top: 12px">
        <el-pagination
          v-model:current-page="assignUserPage"
          v-model:page-size="assignUserPageSize"
          :total="assignUserTotal"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="fetchUnassignedUsers"
          @current-change="fetchUnassignedUsers"
        />
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="assignDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleAssignUserSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Search, Refresh, Plus, Download } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  createRole,
  getRoleList,
  updateRole,
  deleteRole,
  assignRoleMenus,
  getRoleMenus,
  getUnassignedUsers,
  assignRoleUsers,
} from '@/api/system/role'
import { getMenuList } from '@/api/system/menu'
import dayjs from 'dayjs'

// 定义菜单接口
interface MenuItem {
  menu_id: number
  parent_id: number
  menu_name: string
  menu_type: number
  path: string | null
  component: string | null
  perms: string | null
  icon: string | null
  sort: number
  visible: number
  create_time: string | null
  update_time: string | null
  children?: MenuItem[]
}

// 搜索表单
const searchForm = reactive({
  name: '',
  code: '',
  dataScope: undefined as number | undefined,
})

// 表格数据
const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

// 对话框
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const formRef = ref<FormInstance>()
const form = reactive({
  name: '',
  code: '',
  description: '',
  dataScope: 1,
})

// 表单验证规则
const rules: FormRules = {
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入角色编码', trigger: 'blur' }],
  dataScope: [{ required: true, message: '请选择数据权限', trigger: 'change' }],
}

// 权限树
const permissionDialogVisible = ref(false)
const permissionTreeRef = ref()
const checkedPermissions = ref<number[]>([])
const permissionTree = ref<MenuItem[]>([])
const currentRoleId = ref<number>()

// 分配用户相关
const assignDialogVisible = ref(false)
const assignLoading = ref(false)
const assignUserTable = ref<any[]>([])
const assignUserTotal = ref(0)
const assignUserPage = ref(1)
const assignUserPageSize = ref(10)
const assignUserSelection = ref<number[]>([])
const assignUserSearch = reactive({
  username: '',
  realName: '',
})
const currentAssignRoleId = ref<number>()

// 搜索
const handleSearch = () => {
  fetchRoles()
}

// 重置
const handleReset = () => {
  searchForm.name = ''
  searchForm.code = ''
  searchForm.dataScope = undefined
  fetchRoles()
}

// 新增
const handleAdd = () => {
  dialogType.value = 'add'
  dialogVisible.value = true
  form.name = ''
  form.code = ''
  form.description = ''
  form.dataScope = 1
}

// 编辑
const handleEdit = (row: (typeof tableData.value)[0]) => {
  dialogType.value = 'edit'
  dialogVisible.value = true
  Object.assign(form, row)
}

// 权限设置
const handlePermission = async (row: (typeof tableData.value)[0]) => {
  permissionDialogVisible.value = true
  currentRoleId.value = row.id
  await fetchMenuTree()
  const res = await getRoleMenus(row.id)
  checkedPermissions.value = extractMenuIds(res.menus || [])
}

// 提交权限设置
const handlePermissionSubmit = async () => {
  if (!permissionTreeRef.value) return
  const checkedKeys = permissionTreeRef.value.getCheckedKeys()
  const halfCheckedKeys = permissionTreeRef.value.getHalfCheckedKeys()
  const menuIds = [...checkedKeys, ...halfCheckedKeys]
  await assignRoleMenus(Number(currentRoleId.value), menuIds)
  ElMessage.success('权限设置成功')
  permissionDialogVisible.value = false
}

// 删除
const handleDelete = (row: (typeof tableData.value)[0]) => {
  ElMessageBox.confirm('确认删除该角色？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    await deleteRole(row.id)
    ElMessage.success('删除成功')
    fetchRoles()
  })
}

// 导出
const handleExport = () => {
  // TODO: 实现导出逻辑
  ElMessage.success('导出成功')
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      if (dialogType.value === 'add') {
        await createRole({
          roleCode: form.code,
          roleName: form.name,
          remark: form.description,
          dataScope: form.dataScope,
        })
        ElMessage.success('新增成功')
      } else {
        await updateRole(form.id, {
          roleName: form.name,
          remark: form.description,
          dataScope: form.dataScope,
        })
        ElMessage.success('编辑成功')
      }
      dialogVisible.value = false
      fetchRoles()
    }
  })
}

// 分页大小改变
const handleSizeChange = (val: number) => {
  pageSize.value = val
  fetchRoles()
}

// 当前页改变
const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchRoles()
}

const fetchRoles = async () => {
  loading.value = true
  try {
    const res = await getRoleList({
      page: currentPage.value,
      limit: pageSize.value,
      roleName: searchForm.name,
      roleCode: searchForm.code,
      dataScope: searchForm.dataScope,
    })
    tableData.value = (res.roles || []).map((item: any) => ({
      id: item.role_id,
      name: item.role_name,
      code: item.role_code,
      description: item.remark,
      status: item.data_scope === 1 ? 'active' : 'inactive',
      createTime: item.create_time,
      dataScope: item.data_scope,
      remark: item.remark,
    }))
    total.value = res.pagination?.total || 0
  } finally {
    loading.value = false
  }
}

const fetchMenuTree = async () => {
  try {
    const res = await getMenuList()
    permissionTree.value = res.menus || []
  } catch (error) {
    console.error('获取菜单列表失败:', error)
    ElMessage.error('获取菜单列表失败')
  }
}

const getDataScopeText = (scope: number) => {
  switch (scope) {
    case 1:
      return '本人'
    case 2:
      return '部门'
    case 3:
      return '全部'
    default:
      return scope
  }
}

const getDataScopeTag = (scope: number) => {
  switch (scope) {
    case 1:
      return 'info'
    case 2:
      return 'warning'
    case 3:
      return 'success'
    default:
      return 'info'
  }
}

function extractMenuIds(menus: MenuItem[]): number[] {
  let ids: number[] = []
  for (const menu of menus) {
    ids.push(menu.menu_id)
    if (menu.children && menu.children.length > 0) {
      ids = ids.concat(extractMenuIds(menu.children))
    }
  }
  return ids
}

function formatDate(val: string) {
  return val ? dayjs(val).format('YYYY-MM-DD HH:mm:ss') : ''
}

// 打开分配用户弹窗
const handleAssignUser = async (row: any) => {
  currentAssignRoleId.value = row.id
  assignDialogVisible.value = true
  assignUserSelection.value = []
  await fetchUnassignedUsers()
}

// 获取未绑定角色的用户
const fetchUnassignedUsers = async () => {
  assignLoading.value = true
  try {
    const res = await getUnassignedUsers({
      page: assignUserPage.value,
      limit: assignUserPageSize.value,
      username: assignUserSearch.username,
      realName: assignUserSearch.realName,
    })
    // 适配后端返回字段
    assignUserTable.value = (res.users || []).map((item: any) => ({
      userId: item.user_id,
      username: item.username,
      realName: item.real_name,
      avatar: item.avatar,
      deptName: item.dept_name,
    }))
    assignUserTotal.value = res.pagination?.total || 0
  } finally {
    assignLoading.value = false
  }
}

// 分配用户提交
const handleAssignUserSubmit = async () => {
  if (!currentAssignRoleId.value || assignUserSelection.value.length === 0) {
    ElMessage.warning('请选择要分配的用户')
    return
  }
  await assignRoleUsers(currentAssignRoleId.value, assignUserSelection.value)
  ElMessage.success('分配用户成功')
  assignDialogVisible.value = false
  fetchRoles()
}

const handleAssignUserReset = () => {
  assignUserSearch.username = ''
  assignUserSearch.realName = ''
  fetchUnassignedUsers()
}

const handleAssignUserSelectionChange = (val: any[]) => {
  assignUserSelection.value = val.map((u) => u.userId)
}

onMounted(() => {
  fetchRoles()
  fetchMenuTree()
})
</script>

<style scoped>
.role-container {
  /* padding: 32px 24px 24px 24px; */
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #222;
  margin-bottom: 24px;
  letter-spacing: 1px;
  line-height: 1.2;
  padding-left: 2px;
}

.search-card {
  margin-bottom: 24px;
  background: #fff;
  border-radius: 8px;
  /* box-shadow: 0 1px 4px rgba(0, 0, 0, 0.03); */
  /* padding: 18px 24px 6px 24px; */
}

.operation-bar {
  margin-bottom: 18px;
  display: flex;
  gap: 12px;
  align-items: center;
}

.table-card {
  margin-bottom: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.03);
  padding: 0 0 12px 0;
}

.pagination {
  margin-top: 18px;
  display: flex;
  justify-content: flex-end;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 按钮美化 */
.el-button {
  border-radius: 6px;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.el-button-group .el-button {
  margin-right: 2px;
}

/* 表格美化 */
.el-table {
  border-radius: 8px;
  overflow: hidden;
  font-size: 14px;
}

.el-table th {
  background: #f4f6fa;
  color: #333;
  font-weight: 600;
}

.el-table .el-tag {
  font-size: 13px;
  border-radius: 4px;
}
</style>
