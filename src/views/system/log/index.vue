<template>
  <el-card class="log-container">
    <div class="log-header">
      <div class="log-header-title">操作日志</div>
    </div>
    <!-- 操作类型说明 -->
    <div class="explain-card" style="margin-bottom: 20px">
      <div
        style="
          font-weight: 600;
          font-size: 16px;
          color: #222;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
        "
      >
        <el-icon style="font-size: 20px; color: #409eff; margin-right: 6px">
          <InfoFilled />
        </el-icon>
        操作类型说明
      </div>
      <div class="explain-list">
        <div class="explain-row">
          <el-tag type="success" effect="plain" class="explain-tag">Create</el-tag>
          <span class="explain-label">新增（创建一条新数据）</span>
        </div>
        <div class="explain-row">
          <el-tag type="warning" effect="plain" class="explain-tag">Update</el-tag>
          <span class="explain-label">修改（编辑已有数据）</span>
        </div>
        <div class="explain-row">
          <el-tag type="danger" effect="plain" class="explain-tag">Delete</el-tag>
          <span class="explain-label">删除（移除数据）</span>
        </div>
        <div class="explain-row">
          <el-tag type="info" effect="plain" class="explain-tag">Query</el-tag>
          <span class="explain-label">查询（查看/检索数据）</span>
        </div>
        <div class="explain-row">
          <el-tag type="primary" effect="plain" class="explain-tag">Export</el-tag>
          <span class="explain-label">导出（下载数据）</span>
        </div>
        <div class="explain-row">
          <el-tag type="primary" effect="plain" class="explain-tag">Import</el-tag>
          <span class="explain-label">导入（上传数据）</span>
        </div>
      </div>
    </div>

    <!-- 操作栏 -->
    <div class="operation-bar">
      <el-switch
        v-model="autoRefresh"
        active-text="自动刷新"
        inactive-text="手动刷新"
        style="margin-right: 16px"
      />
      <el-button type="primary" @click="fetchLogs" :disabled="autoRefresh">
        <el-icon><Refresh /></el-icon>
        刷新
      </el-button>
    </div>
    <!-- 自动清理提示 -->
    <div
      style="
        margin-bottom: 16px;
        color: #909399;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 6px;
      "
    >
      <el-icon style="font-size: 16px; color: #409eff"><InfoFilled /></el-icon>
      日志每天凌晨 2 点自动清理，仅保留最近 7 天记录。
    </div>

    <!-- 日志列表 -->
    <div class="table-card">
      <el-table v-loading="loading" :data="tableData" style="width: 100%">
        <template #empty>
          <div>当前操作日志为空</div>
        </template>
        <el-table-column prop="id" label="日志编号" width="100" />
        <el-table-column prop="module" label="操作模块" min-width="120" />
        <el-table-column prop="type" label="操作类型" width="300">
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
    </div>

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
        <el-descriptions-item label="操作时间">{{ detail.createTime }}</el-descriptions-item>
        <el-descriptions-item label="操作描述" :span="2">{{
          detail.description
        }}</el-descriptions-item>
        <el-descriptions-item label="请求方法" :span="2">{{ detail.method }}</el-descriptions-item>
        <el-descriptions-item label="请求参数" :span="2">
          <pre>{{ detail.params }}</pre>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </el-card>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, watch } from 'vue'
import { Refresh, InfoFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { queryOperationLogs } from '@/api/system/log'

// 表格数据
const loading = ref(false)
interface LogItem {
  log_id: number
  user_id: number
  operation: string
  method: string
  params: string
  ip: string
  create_time: string
}

interface TableLogItem {
  id: number
  type: string
  method: string
  params: string
  ip: string
  createTime: string
  operator: string
  description: string
  status: string
  module: string
  location: string
}

const tableData = ref<TableLogItem[]>([])

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

const autoRefresh = ref(true)
let autoRefreshTimer: number | undefined

const setupAutoRefresh = () => {
  if (autoRefresh.value) {
    autoRefreshTimer = window.setInterval(() => {
      fetchLogs()
    }, 60 * 1000)
  } else if (autoRefreshTimer) {
    clearInterval(autoRefreshTimer)
    autoRefreshTimer = undefined
  }
}

// 获取日志列表
const fetchLogs = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      limit: pageSize.value,
    }
    const res = await queryOperationLogs(params)
    // 直接从res解构
    const { logs = [], logsDesc = [], pagination = { total: 0, page: 1, limit: 10 } } = res || {}

    tableData.value = logs.map((item: LogItem, idx: number) => {
      let paramsObj = {}
      try {
        paramsObj = JSON.parse(item.params)
      } catch (e) {
        console.error('解析 params 失败:', e)
      }
      return {
        id: item.log_id,
        type: item.operation,
        method: item.method,
        params: JSON.stringify(paramsObj, null, 2),
        ip: item.ip,
        createTime: item.create_time.replace('T', ' ').replace('.000Z', ''),
        operator: 'admin',
        description: logsDesc[idx] || '',
        status: 'success',
        module: item.operation.includes('Role')
          ? '角色管理'
          : item.operation.includes('Menu')
            ? '菜单管理'
            : item.operation.includes('Dept')
              ? '部门管理'
              : item.operation.includes('Log')
                ? '操作日志'
                : item.operation.includes('Operation')
                  ? '操作日志'
                  : item.operation.includes('OperationLog')
                    ? '操作日志'
                    : item.operation.includes('OperationLog')
                      ? '操作日志'
                      : item.operation.includes('User')
                        ? '用户管理'
                        : '其他',
        location: '-',
      } as TableLogItem
    })
    total.value = pagination.total
    currentPage.value = pagination.page
    pageSize.value = pagination.limit
    console.log('tableData', tableData.value)
  } catch (error) {
    console.error('获取日志列表失败:', error)
    ElMessage.error('获取日志列表失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchLogs()
  setupAutoRefresh()
})

onUnmounted(() => {
  if (autoRefreshTimer) {
    clearInterval(autoRefreshTimer)
  }
})

watch(autoRefresh, () => {
  setupAutoRefresh()
})

const handleSearch = () => {
  currentPage.value = 1
  fetchLogs()
}

const handleReset = () => {
  currentPage.value = 1
  fetchLogs()
}

// 查看详情
const handleView = (row: (typeof tableData.value)[0]) => {
  Object.assign(detail, row)
  dialogVisible.value = true
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1
  fetchLogs()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchLogs()
}
</script>

<style scoped>
.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.log-header-title {
  font-size: 20px;
  font-weight: 600;
  color: #222;
}
.log-container {
  border-radius: 12px;
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

.explain-card {
  border-radius: 10px;
  border: none;
  padding: 5px;
}

.explain-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 32px;
}

.explain-row {
  display: flex;
  align-items: center;
  min-width: 220px;
  margin-bottom: 4px;
}

.explain-tag {
  width: 64px;
  text-align: center;
  font-size: 14px;
  margin-right: 10px;
  font-weight: 500;
  letter-spacing: 1px;
}

.explain-label {
  color: #888;
  font-size: 14px;
  line-height: 1.6;
}
</style>
