<template>
  <div class="warehouse-container">
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="仓库名称">
          <el-input v-model="searchForm.name" placeholder="请输入仓库名称" clearable />
        </el-form-item>
        <el-form-item label="仓库类型">
          <el-select v-model="searchForm.type" placeholder="请选择仓库类型" clearable>
            <el-option label="主仓库" value="main" />
            <el-option label="分仓" value="branch" />
            <el-option label="虚拟仓库" value="virtual" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="正常" value="normal" />
            <el-option label="维护中" value="maintenance" />
            <el-option label="已关闭" value="closed" />
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
    </el-card>

    <!-- 操作栏 -->
    <div class="operation-bar">
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增仓库
      </el-button>
      <el-button type="success" @click="handleExport">
        <el-icon><Download /></el-icon>
        导出数据
      </el-button>
    </div>

    <!-- 仓库列表 -->
    <el-card class="table-card">
      <el-table v-loading="loading" :data="tableData" border style="width: 100%">
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column label="仓库信息" min-width="300">
          <template #default="{ row }">
            <div class="warehouse-info">
              <el-image :src="row.image" class="warehouse-image" />
              <div class="warehouse-detail">
                <div class="warehouse-name">{{ row.name }}</div>
                <div class="warehouse-code">编码：{{ row.code }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag
              :type="row.type === 'main' ? 'success' : row.type === 'branch' ? 'warning' : 'info'"
            >
              {{ row.type === 'main' ? '主仓库' : row.type === 'branch' ? '分仓' : '虚拟仓库' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="address" label="地址" min-width="200" show-overflow-tooltip />
        <el-table-column prop="manager" label="负责人" width="120" />
        <el-table-column prop="phone" label="联系电话" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag
              :type="
                row.status === 'normal'
                  ? 'success'
                  : row.status === 'maintenance'
                    ? 'warning'
                    : 'danger'
              "
            >
              {{
                row.status === 'normal'
                  ? '正常'
                  : row.status === 'maintenance'
                    ? '维护中'
                    : '已关闭'
              }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button type="primary" link @click="handleEdit(row)"> 编辑 </el-button>
              <el-button type="primary" link @click="handleInventory(row)"> 库存 </el-button>
              <el-button type="primary" link @click="handleMonitor(row)"> 监控 </el-button>
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
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增仓库' : '编辑仓库'"
      width="600px"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="仓库名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入仓库名称" />
        </el-form-item>
        <el-form-item label="仓库编码" prop="code">
          <el-input v-model="form.code" placeholder="请输入仓库编码" />
        </el-form-item>
        <el-form-item label="仓库类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择仓库类型">
            <el-option label="主仓库" value="main" />
            <el-option label="分仓" value="branch" />
            <el-option label="虚拟仓库" value="virtual" />
          </el-select>
        </el-form-item>
        <el-form-item label="仓库地址" prop="address">
          <el-input v-model="form.address" type="textarea" :rows="2" placeholder="请输入仓库地址" />
        </el-form-item>
        <el-form-item label="负责人" prop="manager">
          <el-input v-model="form.manager" placeholder="请输入负责人姓名" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态">
            <el-option label="正常" value="normal" />
            <el-option label="维护中" value="maintenance" />
            <el-option label="已关闭" value="closed" />
          </el-select>
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
import { Search, Refresh, Plus, Download } from '@element-plus/icons-vue'
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
    name: '上海主仓库',
    code: 'WH-SH-001',
    type: 'main',
    address: '上海市浦东新区张江高科技园区',
    manager: '张三',
    phone: '13800138000',
    status: 'normal',
    image: 'https://via.placeholder.com/50',
  },
  {
    id: 2,
    name: '北京分仓',
    code: 'WH-BJ-001',
    type: 'branch',
    address: '北京市海淀区中关村科技园',
    manager: '李四',
    phone: '13900139000',
    status: 'normal',
    image: 'https://via.placeholder.com/50',
  },
])

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)

// 对话框相关
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const formRef = ref<FormInstance>()
const form = reactive({
  id: undefined as number | undefined,
  name: '',
  code: '',
  type: '',
  address: '',
  manager: '',
  phone: '',
  status: 'normal',
  remark: '',
})

// 表单验证规则
const rules = reactive<FormRules>({
  name: [
    { required: true, message: '请输入仓库名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' },
  ],
  code: [
    { required: true, message: '请输入仓库编码', trigger: 'blur' },
    { pattern: /^[A-Z0-9-]+$/, message: '仓库编码只能包含大写字母、数字和横杠', trigger: 'blur' },
  ],
  type: [{ required: true, message: '请选择仓库类型', trigger: 'change' }],
  address: [{ required: true, message: '请输入仓库地址', trigger: 'blur' }],
  manager: [{ required: true, message: '请输入负责人', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' },
  ],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
})

// 搜索
const handleSearch = () => {
  console.log('搜索条件：', searchForm)
  // TODO: 实现搜索逻辑
}

// 重置搜索
const resetSearch = () => {
  searchForm.name = ''
  searchForm.type = ''
  searchForm.status = ''
  handleSearch()
}

// 新增仓库
const handleAdd = () => {
  dialogType.value = 'add'
  form.id = undefined
  form.name = ''
  form.code = ''
  form.type = ''
  form.address = ''
  form.manager = ''
  form.phone = ''
  form.status = 'normal'
  form.remark = ''
  dialogVisible.value = true
}

// 编辑仓库
const handleEdit = (row: any) => {
  dialogType.value = 'edit'
  form.id = row.id
  form.name = row.name
  form.code = row.code
  form.type = row.type
  form.address = row.address
  form.manager = row.manager
  form.phone = row.phone
  form.status = row.status
  form.remark = row.remark
  dialogVisible.value = true
}

// 删除仓库
const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确定要删除仓库"${row.name}"吗？`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    // TODO: 实现删除逻辑
    ElMessage.success('删除成功')
  })
}

// 查看库存
const handleInventory = (row: any) => {
  // TODO: 实现查看库存逻辑
  ElMessage.info(`查看仓库"${row.name}"的库存信息`)
}

// 查看监控
const handleMonitor = (row: any) => {
  // TODO: 实现查看监控逻辑
  ElMessage.info(`查看仓库"${row.name}"的监控信息`)
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
.warehouse-container {
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

.operation-bar {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.table-card {
  margin-bottom: 20px;
}

.warehouse-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.warehouse-image {
  width: 50px;
  height: 50px;
  border-radius: 4px;
}

.warehouse-detail {
  display: flex;
  flex-direction: column;
}

.warehouse-name {
  font-weight: bold;
  color: #303133;
}

.warehouse-code {
  font-size: 12px;
  color: #909399;
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
