<template>
  <el-card class="user-container">
    <div class="user-container-header">
      <div class="user-container-header-title">用户管理</div>
    </div>
    <!-- 搜索表单 -->
    <div class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="用户名">
          <el-input v-model="searchForm.username" placeholder="请输入用户名" clearable />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="searchForm.realName" placeholder="请输入姓名" clearable />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="searchForm.mobile" placeholder="请输入手机号" clearable />
        </el-form-item>
        <el-form-item label="状态" style="width: 180px">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="启用" value="1" />
            <el-option label="禁用" value="0" />
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
        新增用户
      </el-button>
      <el-button type="success" @click="handleExport">
        <el-icon><Download /></el-icon>
        导出数据
      </el-button>
    </div>

    <!-- 用户列表 -->
    <div class="table-card">
      <el-table v-loading="loading" :data="tableData" style="width: 100%">
        <el-table-column label="头像" width="70">
          <template #default="{ row }">
            <el-avatar
              :src="row.avatar"
              :size="36"
              style="background: #409eff; color: #fff; font-weight: bold"
            >
              {{ row.realName ? row.realName[0] : row.username[0] }}
            </el-avatar>
          </template>
        </el-table-column>
        <el-table-column prop="username" label="用户名" min-width="120" />
        <el-table-column prop="realName" label="姓名" min-width="100" />
        <el-table-column prop="mobile" label="手机号" width="120" />
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column prop="deptName" label="部门" width="380">
          <template #default="{ row }">
            <el-tag>{{ row.deptName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="roles" label="角色" min-width="180">
          <template #default="{ row }">
            <el-tag
              v-for="role in row.roles"
              :key="role.role_id"
              type="info"
              style="margin-right: 4px"
            >
              {{ role.role_name }}
            </el-tag>
            <span v-if="!row.roles || row.roles.length === 0" style="color: #bbb">无</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleToggleStatus(row)"
              :loading="row._statusLoading"
            />
          </template>
        </el-table-column>
        <el-table-column prop="lastLoginTime" label="最后登录时间" width="180" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
              <el-button type="success" link @click="handleResetPassword(row)">重置密码</el-button>
              <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
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
      :title="dialogType === 'add' ? '新增用户' : '编辑用户'"
      width="600px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        label-position="right"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="form.username"
            placeholder="请输入用户名"
            :disabled="dialogType === 'edit'"
          />
        </el-form-item>
        <el-form-item v-if="dialogType === 'add'" label="密码" prop="password">
          <el-input
            v-model="form.password"
            placeholder="请输入密码"
            show-password
            autocomplete="new-password"
          />
        </el-form-item>
        <el-form-item label="姓名" prop="realName">
          <el-input v-model="form.realName" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="form.mobile" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="部门" prop="deptId">
          <el-select
            v-model="form.deptId"
            placeholder="请选择部门"
            :loading="deptLoading"
            :disabled="deptLoading"
          >
            <el-option
              v-for="dept in deptOptions"
              :key="dept.id"
              :label="dept.name"
              :value="dept.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="角色" prop="roleId">
          <el-select v-model="form.roleId" placeholder="请选择角色" filterable>
            <el-option
              v-for="role in roleOptions"
              :key="role.role_id"
              :label="role.role_name"
              :value="role.role_id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入备注" />
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
import { ref, reactive, onMounted } from 'vue'
import { Search, Refresh, Plus, Download } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  registerUser,
  getUserList,
  updateUserStatus,
  resetUserPassword,
  updateUser,
} from '@/api/system/user'
import { getDepartmentTree, type DepartmentTreeItem } from '@/api/system/department'
import { getRoleList } from '@/api/system/role'
import dayjs from 'dayjs'

// 搜索表单
const searchForm = reactive({
  username: '',
  realName: '',
  mobile: '',
  status: undefined as number | undefined,
  deptId: undefined as number | undefined,
})

// 表格数据
const loading = ref(false)
const tableData = ref<any[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

// 对话框
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const formRef = ref<FormInstance>()
const form = reactive({
  username: '',
  password: '',
  realName: '',
  mobile: '',
  email: '',
  deptId: undefined as number | undefined,
  status: 1,
  remark: '',
  roleId: undefined as number | undefined,
})

// 表单验证规则
const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' },
  ],
  realName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  mobile: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' },
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' },
  ],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
  roleId: [{ required: true, message: '请选择角色', trigger: 'change' }],
}

// 部门选项
const deptOptions = ref<Array<{ id: number; name: string }>>([])
const deptLoading = ref(false)

// 角色选项
const roleOptions = ref<{ role_id: number; role_name: string }[]>([])

// 获取部门列表
const fetchDeptList = async () => {
  deptLoading.value = true
  try {
    const res = await getDepartmentTree()
    if (res.code === 200 && res.depts) {
      deptOptions.value = flattenDeptTree(res.depts)
    }
  } catch (error) {
    console.error('获取部门列表失败:', error)
    ElMessage.error('获取部门列表失败')
  } finally {
    deptLoading.value = false
  }
}

// 获取角色列表
const fetchRoleOptions = async () => {
  const res = await getRoleList({ page: 1, limit: 1000 })
  roleOptions.value = res.roles || []
}

// 将部门树转换为扁平结构
const flattenDeptTree = (tree: DepartmentTreeItem[]): Array<{ id: number; name: string }> => {
  const result: Array<{ id: number; name: string }> = []
  const flatten = (items: DepartmentTreeItem[], parentName = '') => {
    items.forEach((item) => {
      const fullName = parentName ? `${parentName} / ${item.dept_name}` : item.dept_name
      result.push({
        id: item.dept_id,
        name: fullName,
      })
      if (item.children && item.children.length > 0) {
        flatten(item.children, fullName)
      }
    })
  }
  flatten(tree)
  return result
}

// 获取用户列表
const fetchUsers = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      limit: pageSize.value,
      username: searchForm.username || undefined,
      realName: searchForm.realName || undefined,
      mobile: searchForm.mobile || undefined,
      status: searchForm.status,
      deptId: searchForm.deptId,
    }
    const res = await getUserList(params)
    const users = res.data?.users || res.users || []
    tableData.value = users.map((item: any) => ({
      id: item.user_id,
      username: item.username,
      realName: item.real_name,
      mobile: item.mobile,
      email: item.email,
      avatar: item.avatar,
      status: item.status,
      remark: item.remark,
      deptId: item.dept_id,
      deptName: deptOptions.value.find((dept) => dept.id === item.dept_id)?.name || '',
      lastLoginTime: item.last_login_time ? formatDate(item.last_login_time) : '',
      createTime: item.create_time ? formatDate(item.create_time) : '',
      roles: item.roles || [],
    }))
    const pagination = res.data?.pagination || res.pagination || {}
    total.value = pagination.total || 0
  } finally {
    loading.value = false
  }
}

function formatDate(val: string) {
  return val ? dayjs(val).format('YYYY-MM-DD HH:mm:ss') : ''
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchUsers()
}

// 重置
const handleReset = () => {
  searchForm.username = ''
  searchForm.realName = ''
  searchForm.mobile = ''
  searchForm.status = undefined
  searchForm.deptId = undefined
  currentPage.value = 1
  fetchUsers()
}

// 新增
const handleAdd = () => {
  dialogType.value = 'add'
  dialogVisible.value = true
  form.username = ''
  form.password = ''
  form.realName = ''
  form.mobile = ''
  form.email = ''
  form.deptId = undefined
  form.status = 1
  form.remark = ''
  form.roleId = undefined
}

// 编辑
const handleEdit = (row: any) => {
  dialogType.value = 'edit'
  dialogVisible.value = true
  Object.assign(form, {
    ...row,
    status: Number(row.status),
    remark: row.remark || '',
    roleId: row.roles && row.roles.length > 0 ? row.roles[0].role_id : undefined,
  })
  form.password = ''
}

// 重置密码
const handleResetPassword = async (row: any) => {
  ElMessageBox.prompt('请输入新密码', '重置密码', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputType: 'password',
    inputPattern: /^.{6,20}$/,
    inputErrorMessage: '密码长度为6-20位',
    showPassword: true,
  }).then(async ({ value }) => {
    await resetUserPassword(row.id, value)
    // 弹窗展示新密码，方便复制
    ElMessageBox.alert(
      `
      <div style="margin:auto;text-align:center;padding:16px 0;">
        <div style="font-size:16px;color:#333;margin-bottom:8px;">新密码已生成</div>
        <div id="reset-password-value" style="display:inline-block;padding:8px 24px;background:#f5f7fa;border-radius:6px;font-size:22px;color:#409EFF;font-weight:bold;letter-spacing:2px;margin-bottom:8px;">
          ${value}
        </div>
        <div>
          <button id="copy-password-btn" style="margin:10px 0 0 0;padding:4px 16px;background:#409EFF;color:#fff;border:none;border-radius:4px;cursor:pointer;">一键复制</button>
        </div>
        <div style="font-size:13px;color:#999;margin-top:8px;">请复制上方密码并发给用户</div>
      </div>
      `,
      '密码重置成功',
      {
        dangerouslyUseHTMLString: true,
        confirmButtonText: '我已复制',
        customClass: 'reset-password-alert',
        callback: () => {
          // 可选：关闭弹窗后的回调
        },
      },
    )

    // 监听弹窗渲染完成，绑定复制事件
    setTimeout(() => {
      const btn = document.getElementById('copy-password-btn')
      const pwd = document.getElementById('reset-password-value')
      if (btn && pwd) {
        btn.onclick = () => {
          navigator.clipboard
            .writeText(pwd.innerText)
            .then(() => {
              ElMessage.success('密码已复制到剪贴板')
            })
            .catch(() => {
              ElMessage.error('复制失败，请手动复制')
            })
        }
      }
    }, 100)

    fetchUsers()
  })
}

// 切换状态
const handleToggleStatus = async (row: any) => {
  row._statusLoading = true
  try {
    const newStatus = row.status
    await updateUserStatus(row.id, newStatus)
    ElMessage.success(newStatus === 1 ? '启用成功' : '禁用成功')
    fetchUsers()
  } finally {
    row._statusLoading = false
  }
}

// 删除
const handleDelete = (row: any) => {
  ElMessageBox.confirm(
    `确认删除用户 <b style="color:#f56c6c">${row.realName}</b>（${row.deptName}）？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      dangerouslyUseHTMLString: true, // 允许 HTML
    },
  ).then(() => {
    // TODO: 实现删除逻辑
    ElMessage.success('删除成功')
    fetchUsers()
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
        await registerUser({
          username: form.username,
          password: form.password,
          realName: form.realName,
          mobile: form.mobile,
          email: form.email,
          deptId: form.deptId,
          status: form.status,
          roleId: form.roleId,
        })
        ElMessage.success('新增成功')
      } else {
        // 调用更新用户信息接口
        await updateUser(form.id, {
          realName: form.realName,
          avatar: form.avatar,
          email: form.email,
          mobile: form.mobile,
          deptId: form.deptId,
          status: form.status,
          remark: form.remark,
          roleId: form.roleId,
        })
        ElMessage.success('编辑成功')
      }
      dialogVisible.value = false
      fetchUsers()
    }
  })
}

// 分页大小改变
const handleSizeChange = (val: number) => {
  pageSize.value = val
  fetchUsers()
}

// 当前页改变
const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchUsers()
}

onMounted(async () => {
  await fetchDeptList()
  await fetchRoleOptions()
  await fetchUsers()
})
</script>

<style scoped>
.user-container {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
}
.user-container-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.user-container-header-title {
  font-size: 20px;
  font-weight: bold;
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

.pagination {
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
