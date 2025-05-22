<template>
  <div class="warning-container">
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="商品名称">
          <el-input v-model="searchForm.name" placeholder="请输入商品名称" clearable />
        </el-form-item>
        <el-form-item label="商品分类">
          <el-cascader
            v-model="searchForm.categoryId"
            :options="categoryOptions"
            :props="{
              checkStrictly: true,
              value: 'id',
              label: 'name',
              children: 'children',
              emitPath: false,
            }"
            clearable
            placeholder="请选择分类"
          />
        </el-form-item>
        <el-form-item label="预警级别">
          <el-select v-model="searchForm.level" placeholder="请选择预警级别" clearable>
            <el-option label="紧急" value="urgent" />
            <el-option label="警告" value="warning" />
            <el-option label="提示" value="notice" />
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
      <el-button type="primary" @click="handleSetting">
        <el-icon><Setting /></el-icon>
        预警设置
      </el-button>
      <el-button type="success" @click="handleExport">
        <el-icon><Download /></el-icon>
        导出数据
      </el-button>
    </div>

    <!-- 预警列表 -->
    <el-card class="table-card">
      <el-table v-loading="loading" :data="tableData" border>
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column label="商品信息" min-width="300">
          <template #default="{ row }">
            <div class="product-info">
              <el-image :src="row.image" class="product-image" />
              <div class="product-detail">
                <div class="product-name">{{ row.name }}</div>
                <div class="product-sku">SKU: {{ row.sku }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="分类" width="120" />
        <el-table-column label="库存信息" width="400">
          <template #default="{ row }">
            <div class="inventory-info">
              <div class="inventory-item">
                <span class="label">当前库存：</span>
                <span class="value">{{ row.quantity }}</span>
              </div>
              <div class="inventory-item">
                <span class="label">安全库存：</span>
                <span class="value">{{ row.safetyStock }}</span>
              </div>
              <div class="inventory-item">
                <span class="label">可用库存：</span>
                <span class="value">{{ row.availableQuantity }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="level" label="预警级别" width="100">
          <template #default="{ row }">
            <el-tag
              :type="
                row.level === 'urgent' ? 'danger' : row.level === 'warning' ? 'warning' : 'info'
              "
            >
              {{ row.level === 'urgent' ? '紧急' : row.level === 'warning' ? '警告' : '提示' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastWarningTime" label="最近预警时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button type="primary" link @click="handleDetail(row)"> 详情 </el-button>
              <el-button type="primary" link @click="handleHistory(row)"> 记录 </el-button>
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

    <!-- 预警设置对话框 -->
    <el-dialog v-model="settingDialogVisible" title="预警设置" width="600px">
      <el-form ref="settingFormRef" :model="settingForm" :rules="settingRules" label-width="120px">
        <el-form-item label="预警方式" prop="methods">
          <el-checkbox-group v-model="settingForm.methods">
            <el-checkbox label="email">邮件通知</el-checkbox>
            <el-checkbox label="sms">短信通知</el-checkbox>
            <el-checkbox label="system">系统通知</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="预警级别" prop="levels">
          <el-checkbox-group v-model="settingForm.levels">
            <el-checkbox label="urgent">紧急</el-checkbox>
            <el-checkbox label="warning">警告</el-checkbox>
            <el-checkbox label="notice">提示</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="预警时间" prop="time">
          <el-time-picker v-model="settingForm.time" format="HH:mm" placeholder="请选择预警时间" />
        </el-form-item>
        <el-form-item label="预警周期" prop="cycle">
          <el-select v-model="settingForm.cycle" placeholder="请选择预警周期">
            <el-option label="每天" value="daily" />
            <el-option label="每周" value="weekly" />
            <el-option label="每月" value="monthly" />
          </el-select>
        </el-form-item>
        <el-form-item label="通知接收人" prop="receivers">
          <el-select
            v-model="settingForm.receivers"
            multiple
            filterable
            placeholder="请选择通知接收人"
          >
            <el-option
              v-for="item in receiverOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="settingDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSettingSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Search, Refresh, Setting, Download } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

// 搜索表单
const searchForm = reactive({
  name: '',
  categoryId: undefined as number | undefined,
  level: '',
})

// 分类选项
const categoryOptions = ref([
  {
    id: 1,
    name: '电子产品',
    children: [
      { id: 11, name: '手机' },
      { id: 12, name: '电脑' },
    ],
  },
  {
    id: 2,
    name: '服装',
    children: [
      { id: 21, name: '男装' },
      { id: 22, name: '女装' },
    ],
  },
])

// 表格数据
const loading = ref(false)
const tableData = ref([
  {
    id: 1,
    name: 'iPhone 15 Pro',
    sku: 'IP15P-256-BLK',
    category: '电子产品',
    image: 'https://via.placeholder.com/50',
    quantity: 5,
    safetyStock: 50,
    availableQuantity: 3,
    level: 'urgent',
    lastWarningTime: '2024-03-20 10:30:00',
  },
  {
    id: 2,
    name: 'MacBook Pro',
    sku: 'MBP-14-M2',
    category: '电子产品',
    image: 'https://via.placeholder.com/50',
    quantity: 15,
    safetyStock: 30,
    availableQuantity: 12,
    level: 'warning',
    lastWarningTime: '2024-03-19 15:45:00',
  },
])

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)

// 预警设置相关
const settingDialogVisible = ref(false)
const settingFormRef = ref<FormInstance>()
const settingForm = reactive({
  methods: ['system'],
  levels: ['urgent', 'warning'],
  time: new Date(),
  cycle: 'daily',
  receivers: [],
})

const settingRules = reactive<FormRules>({
  methods: [{ required: true, message: '请选择预警方式', trigger: 'change' }],
  levels: [{ required: true, message: '请选择预警级别', trigger: 'change' }],
  time: [{ required: true, message: '请选择预警时间', trigger: 'change' }],
  cycle: [{ required: true, message: '请选择预警周期', trigger: 'change' }],
  receivers: [{ required: true, message: '请选择通知接收人', trigger: 'change' }],
})

// 通知接收人选项
const receiverOptions = ref([
  { id: 1, name: '张三' },
  { id: 2, name: '李四' },
  { id: 3, name: '王五' },
])

// 搜索
const handleSearch = () => {
  console.log('搜索条件：', searchForm)
  // TODO: 实现搜索逻辑
}

// 重置搜索
const resetSearch = () => {
  searchForm.name = ''
  searchForm.categoryId = undefined
  searchForm.level = ''
  handleSearch()
}

// 预警设置
const handleSetting = () => {
  settingDialogVisible.value = true
}

// 预警设置提交
const handleSettingSubmit = async () => {
  if (!settingFormRef.value) return
  await settingFormRef.value.validate((valid) => {
    if (valid) {
      // TODO: 实现预警设置保存逻辑
      ElMessage.success('设置保存成功')
      settingDialogVisible.value = false
    }
  })
}

// 查看详情
const handleDetail = (row: any) => {
  // TODO: 实现查看详情逻辑
  ElMessage.info(`查看商品"${row.name}"的预警详情`)
}

// 查看记录
const handleHistory = (row: any) => {
  // TODO: 实现查看记录逻辑
  ElMessage.info(`查看商品"${row.name}"的预警记录`)
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
.warning-container {
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

.product-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.product-image {
  width: 50px;
  height: 50px;
  border-radius: 4px;
}

.product-detail {
  display: flex;
  flex-direction: column;
}

.product-name {
  font-weight: bold;
  color: #303133;
}

.product-sku {
  font-size: 12px;
  color: #909399;
}

.inventory-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.inventory-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.inventory-item .label {
  color: #909399;
  width: 80px;
}

.inventory-item .value {
  color: #409eff;
  font-weight: bold;
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
