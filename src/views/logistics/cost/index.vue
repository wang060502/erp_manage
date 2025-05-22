<template>
  <div class="logistics-cost-container">
    <!-- 搜索表单 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="订单编号">
          <el-input v-model="searchForm.orderNo" placeholder="请输入订单编号" clearable />
        </el-form-item>
        <el-form-item label="承运商">
          <el-select v-model="searchForm.carrierId" placeholder="请选择承运商" clearable>
            <el-option
              v-for="item in carrierOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="费用类型">
          <el-select v-model="searchForm.costType" placeholder="请选择费用类型" clearable>
            <el-option label="运费" value="freight" />
            <el-option label="包装费" value="packaging" />
            <el-option label="保险费" value="insurance" />
            <el-option label="其他费用" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="费用时间">
          <el-date-picker
            v-model="searchForm.dateRange"
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
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增费用
      </el-button>
      <el-button type="success" @click="handleExport">
        <el-icon><Download /></el-icon>
        导出数据
      </el-button>
    </div>

    <!-- 费用列表 -->
    <el-card class="table-card">
      <el-table v-loading="loading" :data="tableData" border style="width: 100%">
        <el-table-column prop="orderNo" label="订单编号" width="180" />
        <el-table-column prop="carrierName" label="承运商" min-width="150" />
        <el-table-column prop="costType" label="费用类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getCostTypeTag(row.costType)">
              {{ getCostTypeText(row.costType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="费用金额" width="120">
          <template #default="{ row }"> ¥{{ row.amount.toFixed(2) }} </template>
        </el-table-column>
        <el-table-column prop="paymentStatus" label="支付状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.paymentStatus === 'paid' ? 'success' : 'warning'">
              {{ row.paymentStatus === 'paid' ? '已支付' : '未支付' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="paymentTime" label="支付时间" width="180" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column prop="remark" label="备注" min-width="200" show-overflow-tooltip />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
              <el-button
                v-if="row.paymentStatus === 'unpaid'"
                type="success"
                link
                @click="handlePay(row)"
              >
                支付
              </el-button>
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
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增费用' : '编辑费用'"
      width="600px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        label-position="right"
      >
        <el-form-item label="订单编号" prop="orderNo">
          <el-input v-model="form.orderNo" placeholder="请输入订单编号" />
        </el-form-item>
        <el-form-item label="承运商" prop="carrierId">
          <el-select v-model="form.carrierId" placeholder="请选择承运商">
            <el-option
              v-for="item in carrierOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="费用类型" prop="costType">
          <el-select v-model="form.costType" placeholder="请选择费用类型">
            <el-option label="运费" value="freight" />
            <el-option label="包装费" value="packaging" />
            <el-option label="保险费" value="insurance" />
            <el-option label="其他费用" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="费用金额" prop="amount">
          <el-input-number
            v-model="form.amount"
            :precision="2"
            :step="0.1"
            :min="0"
            placeholder="请输入费用金额"
          />
        </el-form-item>
        <el-form-item label="支付状态" prop="paymentStatus">
          <el-radio-group v-model="form.paymentStatus">
            <el-radio label="paid">已支付</el-radio>
            <el-radio label="unpaid">未支付</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="支付时间" prop="paymentTime">
          <el-date-picker
            v-model="form.paymentTime"
            type="datetime"
            placeholder="请选择支付时间"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Search, Refresh, Plus, Download } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

// 搜索表单
const searchForm = reactive({
  orderNo: '',
  carrierId: '',
  costType: '',
  dateRange: [],
})

// 承运商选项
const carrierOptions = ref([
  { id: 1, name: '顺丰速运' },
  { id: 2, name: '中通快递' },
  { id: 3, name: '圆通速递' },
  { id: 4, name: '韵达快递' },
  { id: 5, name: '申通快递' },
])

// 表格数据
const loading = ref(false)
const tableData = ref([
  {
    id: 1,
    orderNo: 'ORD202403200001',
    carrierName: '顺丰速运',
    costType: 'freight',
    amount: 25.0,
    paymentStatus: 'paid',
    paymentTime: '2024-03-20 10:30:00',
    createTime: '2024-03-20 10:00:00',
    remark: '标准快递',
  },
  {
    id: 2,
    orderNo: 'ORD202403200002',
    carrierName: '中通快递',
    costType: 'packaging',
    amount: 10.0,
    paymentStatus: 'unpaid',
    paymentTime: '',
    createTime: '2024-03-20 11:00:00',
    remark: '包装材料费',
  },
])

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)

// 对话框
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const formRef = ref<FormInstance>()
const form = reactive({
  orderNo: '',
  carrierId: '',
  costType: '',
  amount: 0,
  paymentStatus: 'unpaid',
  paymentTime: '',
  remark: '',
})

// 表单验证规则
const rules: FormRules = {
  orderNo: [{ required: true, message: '请输入订单编号', trigger: 'blur' }],
  carrierId: [{ required: true, message: '请选择承运商', trigger: 'change' }],
  costType: [{ required: true, message: '请选择费用类型', trigger: 'change' }],
  amount: [{ required: true, message: '请输入费用金额', trigger: 'blur' }],
  paymentStatus: [{ required: true, message: '请选择支付状态', trigger: 'change' }],
  paymentTime: [{ required: true, message: '请选择支付时间', trigger: 'change' }],
}

// 获取费用类型标签类型
const getCostTypeTag = (type: string) => {
  const typeMap: Record<string, string> = {
    freight: 'primary',
    packaging: 'success',
    insurance: 'warning',
    other: 'info',
  }
  return typeMap[type] || 'info'
}

// 获取费用类型文本
const getCostTypeText = (type: string) => {
  const typeMap: Record<string, string> = {
    freight: '运费',
    packaging: '包装费',
    insurance: '保险费',
    other: '其他费用',
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
  searchForm.orderNo = ''
  searchForm.carrierId = ''
  searchForm.costType = ''
  searchForm.dateRange = []
}

// 新增
const handleAdd = () => {
  dialogType.value = 'add'
  dialogVisible.value = true
  form.orderNo = ''
  form.carrierId = ''
  form.costType = ''
  form.amount = 0
  form.paymentStatus = 'unpaid'
  form.paymentTime = ''
  form.remark = ''
}

// 编辑
const handleEdit = (row: (typeof tableData.value)[0]) => {
  dialogType.value = 'edit'
  dialogVisible.value = true
  Object.assign(form, row)
}

// 支付
const handlePay = (row: (typeof tableData.value)[0]) => {
  ElMessageBox.confirm('确认支付该费用？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    // TODO: 实现支付逻辑
    ElMessage.success('支付成功')
  })
}

// 删除
const handleDelete = (row: (typeof tableData.value)[0]) => {
  ElMessageBox.confirm('确认删除该费用记录？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    // TODO: 实现删除逻辑
    ElMessage.success('删除成功')
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
  await formRef.value.validate((valid) => {
    if (valid) {
      // TODO: 实现提交逻辑
      ElMessage.success(dialogType.value === 'add' ? '新增成功' : '编辑成功')
      dialogVisible.value = false
    }
  })
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
.logistics-cost-container {
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

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
