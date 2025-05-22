<template>
  <div class="log-container">
    <!-- 搜索表单 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="操作模块">
          <el-input v-model="searchForm.module" placeholder="请输入操作模块" clearable />
        </el-form-item>
        <el-form-item label="操作类型">
          <el-select v-model="searchForm.type" placeholder="请选择操作类型" clearable>
            <el-option label="查询" value="query" />
            <el-option label="新增" value="create" />
            <el-option label="修改" value="update" />
            <el-option label="删除" value="delete" />
            <el-option label="导出" value="export" />
            <el-option label="导入" value="import" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="操作状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="成功" value="success" />
            <el-option label="失败" value="error" />
          </el-select>
        </el-form-item>
        <el-form-item label="操作时间">
          <el-date-picker
            v-model="searchForm.timeRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
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
      <el-button type="success" @click="handleExport">
        <el-icon><Download /></el-icon>
        导出数据
      </el-button>
      <el-button type="danger" @click="handleClear">
        <el-icon><Delete /></el-icon>
        清空日志
      </el-button>
    </div>

    <!-- 日志列表 -->
    <el-card class="table-card">
      <el-table v-loading="loading" :data="tableData" border style="width: 100%">
        <el-table-column prop="id" label="日志编号" width="100" />
        <el-table-column prop="module" label="操作模块" min-width="120" />
        <el-table-column prop="type" label="操作类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getOperationTypeTag(row.type)">{{
              getOperationTypeText(row.type)
            }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="description"
          label="操作描述"
          min-width="200"
          show-overflow-tooltip
        />
        <el-table-column prop="operator" label="操作人员" width="120" />
        <el-table-column prop="ip" label="操作IP" width="140" />
        <el-table-column prop="location" label="操作地点" min-width="140" show-overflow-tooltip />
        <el-table-column prop="status" label="操作状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'success' ? 'success' : 'danger'">
              {{ row.status === 'success' ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="操作时间" width="180" />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row)">详情</el-button>
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
    </el-card>

    <!-- 详情对话框 -->
    <el-dialog v-model="dialogVisible" title="操作日志详情" width="800px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="日志编号">{{ detail.id }}</el-descriptions-item>
        <el-descriptions-item label="操作模块">{{ detail.module }}</el-descriptions-item>
        <el-descriptions-item label="操作类型">
          <el-tag :type="getOperationTypeTag(detail.type)">{{
            getOperationTypeText(detail.type)
          }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="操作状态">
          <el-tag :type="detail.status === 'success' ? 'success' : 'danger'">
            {{ detail.status === 'success' ? '成功' : '失败' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="操作人员">{{ detail.operator }}</el-descriptions-item>
        <el-descriptions-item label="操作IP">{{ detail.ip }}</el-descriptions-item>
        <el-descriptions-item label="操作地点">{{ detail.location }}</el-descriptions-item>
        <el-descriptions-item label="操作时间">{{ detail.createTime }}</el-descriptions-item>
        <el-descriptions-item label="操作描述" :span="2">{{
          detail.description
        }}</el-descriptions-item>
        <el-descriptions-item label="请求方法" :span="2">{{ detail.method }}</el-descriptions-item>
        <el-descriptions-item label="请求参数" :span="2">
          <pre>{{ detail.params }}</pre>
        </el-descriptions-item>
        <el-descriptions-item label="返回结果" :span="2">
          <pre>{{ detail.result }}</pre>
        </el-descriptions-item>
        <el-descriptions-item label="错误信息" :span="2" v-if="detail.status === 'error'">
          <pre class="error-message">{{ detail.error }}</pre>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Search, Refresh, Download, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 搜索表单
const searchForm = reactive({
  module: '',
  type: '',
  status: '',
  timeRange: [],
})

// 表格数据
const loading = ref(false)
const tableData = ref([
  {
    id: 1,
    module: '用户管理',
    type: 'create',
    description: '新增用户：admin',
    operator: 'admin',
    ip: '192.168.1.1',
    location: '广东省深圳市',
    status: 'success',
    createTime: '2024-03-20 10:00:00',
  },
  {
    id: 2,
    module: '角色管理',
    type: 'update',
    description: '修改角色：管理员',
    operator: 'admin',
    ip: '192.168.1.1',
    location: '广东省深圳市',
    status: 'error',
    createTime: '2024-03-20 11:00:00',
  },
])

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)

// 详情对话框
const dialogVisible = ref(false)
const detail = reactive({
  id: '',
  module: '',
  type: '',
  description: '',
  operator: '',
  ip: '',
  location: '',
  status: '',
  createTime: '',
  method: '',
  params: '',
  result: '',
  error: '',
})

// 获取操作类型标签
const getOperationTypeTag = (type: string) => {
  const typeMap: Record<string, string> = {
    query: 'info',
    create: 'success',
    update: 'warning',
    delete: 'danger',
    export: 'primary',
    import: 'primary',
    other: 'info',
  }
  return typeMap[type] || 'info'
}

// 获取操作类型文本
const getOperationTypeText = (type: string) => {
  const typeMap: Record<string, string> = {
    query: '查询',
    create: '新增',
    update: '修改',
    delete: '删除',
    export: '导出',
    import: '导入',
    other: '其他',
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
  searchForm.module = ''
  searchForm.type = ''
  searchForm.status = ''
  searchForm.timeRange = []
}

// 导出
const handleExport = () => {
  // TODO: 实现导出逻辑
  ElMessage.success('导出成功')
}

// 清空
const handleClear = () => {
  ElMessageBox.confirm('确认清空所有操作日志？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    // TODO: 实现清空逻辑
    ElMessage.success('清空成功')
  })
}

// 查看详情
const handleView = (row: (typeof tableData.value)[0]) => {
  Object.assign(detail, row)
  // TODO: 获取详细信息
  detail.method = 'POST'
  detail.params = JSON.stringify({ id: 1, name: 'admin' }, null, 2)
  detail.result = JSON.stringify({ code: 200, message: 'success' }, null, 2)
  if (row.status === 'error') {
    detail.error = '操作失败：权限不足'
  }
  dialogVisible.value = true
}

// 分页大小改变
const handleSizeChange = (val: number) => {
  pageSize.value = val
  // TODO: 重新加载数据
}

// 当前页改变
const handleCurrentChange = (val: number) => {
  currentPage.value = val
  // TODO: 重新加载数据
}
</script>

<style scoped>
.log-container {
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

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

pre {
  margin: 0;
  padding: 8px;
  background-color: #f5f7fa;
  border-radius: 4px;
  font-family: monospace;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.error-message {
  color: #f56c6c;
}
</style>
