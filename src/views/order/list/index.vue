<template>
  <div class="order-list-container">
    <!-- 搜索表单 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="订单编号">
          <el-input v-model="searchForm.orderNo" placeholder="请输入订单编号" clearable />
        </el-form-item>
        <el-form-item label="客户名称">
          <el-input v-model="searchForm.customerName" placeholder="请输入客户名称" clearable />
        </el-form-item>
        <el-form-item label="订单状态">
          <el-select v-model="searchForm.status" placeholder="请选择订单状态" clearable>
            <el-option label="待付款" value="pending" />
            <el-option label="待发货" value="paid" />
            <el-option label="已发货" value="shipped" />
            <el-option label="已完成" value="completed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
        <el-form-item label="下单时间">
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
        新增订单
      </el-button>
      <el-button type="success" @click="handleExport">
        <el-icon><Download /></el-icon>
        导出数据
      </el-button>
    </div>

    <!-- 订单列表 -->
    <el-card class="table-card">
      <el-table v-loading="loading" :data="tableData" border style="width: 100%">
        <el-table-column type="expand">
          <template #default="{ row }">
            <el-table :data="row.products" border>
              <el-table-column prop="name" label="商品名称" min-width="200" />
              <el-table-column prop="sku" label="SKU" width="120" />
              <el-table-column prop="price" label="单价" width="100">
                <template #default="{ row }"> ¥{{ row.price.toFixed(2) }} </template>
              </el-table-column>
              <el-table-column prop="quantity" label="数量" width="80" />
              <el-table-column prop="total" label="小计" width="100">
                <template #default="{ row }"> ¥{{ row.total.toFixed(2) }} </template>
              </el-table-column>
            </el-table>
          </template>
        </el-table-column>
        <el-table-column prop="orderNo" label="订单编号" width="180" />
        <el-table-column prop="customerName" label="客户名称" min-width="150" />
        <el-table-column prop="totalAmount" label="订单金额" width="120">
          <template #default="{ row }"> ¥{{ row.totalAmount.toFixed(2) }} </template>
        </el-table-column>
        <el-table-column prop="status" label="订单状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="下单时间" width="180" />
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button type="primary" link @click="handleView(row)">查看</el-button>
              <el-button
                v-if="row.status === 'pending'"
                type="success"
                link
                @click="handlePay(row)"
              >
                付款
              </el-button>
              <el-button v-if="row.status === 'paid'" type="warning" link @click="handleShip(row)">
                发货
              </el-button>
              <el-button
                v-if="row.status === 'shipped'"
                type="success"
                link
                @click="handleComplete(row)"
              >
                完成
              </el-button>
              <el-button
                v-if="row.status === 'pending'"
                type="danger"
                link
                @click="handleCancel(row)"
              >
                取消
              </el-button>
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Search, Refresh, Plus, Download } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 搜索表单
const searchForm = reactive({
  orderNo: '',
  customerName: '',
  status: '',
  dateRange: [],
})

// 表格数据
const loading = ref(false)
const tableData = ref([
  {
    orderNo: 'ORD202403200001',
    customerName: '张三公司',
    totalAmount: 12800.0,
    status: 'pending',
    createTime: '2024-03-20 10:30:00',
    products: [
      {
        name: '商品A',
        sku: 'SKU001',
        price: 1280.0,
        quantity: 10,
        total: 12800.0,
      },
    ],
  },
  {
    orderNo: 'ORD202403200002',
    customerName: '李四企业',
    totalAmount: 9800.0,
    status: 'paid',
    createTime: '2024-03-20 11:20:00',
    products: [
      {
        name: '商品B',
        sku: 'SKU002',
        price: 980.0,
        quantity: 10,
        total: 9800.0,
      },
    ],
  },
])

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)

// 获取状态类型
const getStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: 'warning',
    paid: 'primary',
    shipped: 'success',
    completed: 'success',
    cancelled: 'info',
  }
  return statusMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: '待付款',
    paid: '待发货',
    shipped: '已发货',
    completed: '已完成',
    cancelled: '已取消',
  }
  return statusMap[status] || status
}

// 搜索
const handleSearch = () => {
  // TODO: 实现搜索逻辑
  console.log('搜索条件：', searchForm)
}

// 重置
const handleReset = () => {
  searchForm.orderNo = ''
  searchForm.customerName = ''
  searchForm.status = ''
  searchForm.dateRange = []
}

// 新增订单
const handleAdd = () => {
  // TODO: 实现新增订单逻辑
  ElMessage.success('新增订单')
}

// 导出数据
const handleExport = () => {
  // TODO: 实现导出逻辑
  ElMessage.success('导出数据')
}

// 查看订单
const handleView = (row: any) => {
  // TODO: 实现查看订单逻辑
  console.log('查看订单：', row)
}

// 付款
const handlePay = (row: any) => {
  ElMessageBox.confirm('确认该订单已付款？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    // TODO: 实现付款逻辑
    ElMessage.success('付款成功')
  })
}

// 发货
const handleShip = (row: any) => {
  ElMessageBox.confirm('确认该订单已发货？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    // TODO: 实现发货逻辑
    ElMessage.success('发货成功')
  })
}

// 完成订单
const handleComplete = (row: any) => {
  ElMessageBox.confirm('确认完成该订单？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    // TODO: 实现完成订单逻辑
    ElMessage.success('订单已完成')
  })
}

// 取消订单
const handleCancel = (row: any) => {
  ElMessageBox.confirm('确认取消该订单？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    // TODO: 实现取消订单逻辑
    ElMessage.success('订单已取消')
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
.order-list-container {
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
</style>
