<template>
  <el-card class="sales-list-container">
    <div class="sales-list-title">
      <div class="title">销售记录列表</div>
      <div class="total-amount">
        <div>总销售金额：<span class="amount">${{ customerTotalAmount }}</span></div>
        <el-button type="success" style="margin-left: 20px;" @click="handleExport">导出Excel</el-button>
      </div>
    </div>
    <div class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="创建人">
          <el-select v-model="searchForm.creator" placeholder="请选择创建人" clearable filterable style="width: 180px;">
            <el-option
              v-for="user in userOptions"
              :key="user.user_id"
              :label="user.real_name"
              :value="user.user_id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="付款状态">
          <el-select v-model="searchForm.payment_status" placeholder="请选择付款状态" clearable style="width: 180px;">
            <el-option label="待付款" value="待付款" />
            <el-option label="已付款部分" value="已付款部分" />
            <el-option label="已结清" value="已结清" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="searchForm.timeRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            style="width: 340px;"
          />
        </el-form-item>
        <el-form-item label="仓库">
          <el-select
            v-model="searchForm.warehouse_id"
            placeholder="请选择仓库"
            clearable
            filterable
            style="width: 180px;"
            @change="onWarehouseChange"
          >
            <el-option
              v-for="w in warehouseOptions"
              :key="w.warehouse_id"
              :label="w.warehouse_name"
              :value="w.warehouse_id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="仓库名称">
          <el-input
            v-model="searchForm.warehouse_name"
            placeholder="请输入仓库名称"
            :disabled="!!searchForm.warehouse_id"
            clearable
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div v-for="order in tableData" :key="order.sales_time" class="order-block">
      <div class="order-header">
        <span>销售时间：{{ order.sales_time }}</span>
        <span>总金额：${{ order.total_amount }}</span>
        <span>创建人：{{ order.creator_name }}</span>
        <span>付款状态：
          <el-tag :type="getPaymentStatusTag(order.payment_status)">
            {{ order.payment_status }}
          </el-tag>
        </span>
        <span v-if="order.payment_image">
          <span>付款凭证：</span>
          <el-image
            :src="order.payment_image"
            style="width: 40px; height: 40px; margin-left: 8px; vertical-align: middle"
            :preview-src-list="[order.payment_image]"
            fit="cover"
          />
        </span>
      </div>
      <el-table :data="order.products" size="small" class="order-products-table">
        <el-table-column label="图片" width="60">
          <template #default="{ row }">
            <img :src="row.product_image" style="width: 40px; height: 40px; object-fit: cover" />
          </template>
        </el-table-column>
        <el-table-column prop="product_title" label="商品名称" min-width="120" />
        <el-table-column prop="product_type" label="商品分类" width="80" />
        <el-table-column prop="product_sku" label="SKU" width="120" />
        <el-table-column prop="quantity" label="数量" width="60" />
        <el-table-column prop="unit_price" label="单价" width="80" />
        <el-table-column prop="total_price" label="总价" width="80" />
        <el-table-column prop="warehouse_name" label="仓库" min-width="120" />
        <el-table-column prop="product_size" label="尺码" min-width="120" />
        <el-table-column prop="remark" label="备注" min-width="120">
          <template #default="{ row }">
            <span v-if="row.remark">{{ row.remark }}</span>
            <span v-else style="color: #bbb;">-</span>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="pagination-container">
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
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getAllSalesRecords, exportSalesRecordsToCSV } from '@/api/customer/salesrecords'
import dayjs from 'dayjs'
import { getUserList } from '@/api/system/user'
import { getWarehouseList } from '@/api/warehouse/list'

defineOptions({ name: 'CustomerSaleList' })

interface Product {
  product_id: number
  product_title: string
  quantity: number
  product_image?: string
  product_sku?: string
  product_type?: string
  warehouse_name?: string
  unit_price?: number | string
  total_price?: number | string
}
interface SalesRecord {
  sales_time: string
  creator_name: string
  payment_status: string
  total_amount: number | string
  payment_image?: string | null
  products: Product[]
}

const loading = ref(false)
const tableData = ref<SalesRecord[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const customerTotalAmount = ref('0.00')

const searchForm = ref({
  creator: '',
  payment_status: '',
  timeRange: [],
  warehouse_id: '',
  warehouse_name: '',
})

const userOptions = ref<{ user_id: number; real_name: string }[]>([])
const warehouseOptions = ref<{ warehouse_id: number; warehouse_name: string }[]>([])

const fetchUserList = async () => {
  const res = await getUserList({ page: 1, limit: 1000 })
  userOptions.value = res.users || []
}

const fetchWarehouseList = async () => {
  const res = await getWarehouseList({ page: 1, limit: 1000 })
  warehouseOptions.value = res.warehouses || []
}

const fetchSalesRecords = async () => {
  loading.value = true
  try {
    const params: Record<string, any> = {
      page: currentPage.value,
      limit: pageSize.value,
    }
    if (searchForm.value.creator) params.creator = searchForm.value.creator
    if (searchForm.value.payment_status) params.payment_status = searchForm.value.payment_status
    if (searchForm.value.timeRange && searchForm.value.timeRange.length === 2) {
      const [start, end] = searchForm.value.timeRange
      params.start_time = typeof start === 'string' ? start : dayjs(start).format('YYYY-MM-DD HH:mm:ss')
      params.end_time = typeof end === 'string' ? end : dayjs(end).format('YYYY-MM-DD HH:mm:ss')
    }
    if (searchForm.value.warehouse_id) params.warehouse_id = searchForm.value.warehouse_id
    if (searchForm.value.warehouse_name) params.warehouse_name = searchForm.value.warehouse_name

    const res = await getAllSalesRecords(params)
    const list = (res.data && res.data.orders) || res.orders || []
    const pagination = (res.data && res.data.pagination) || res.pagination || { total: 0 }
    const totalAmount = (res.data && res.data.customer_total_amount) || res.customer_total_amount || '0.00'
    tableData.value = list
    total.value = pagination.total || 0
    customerTotalAmount.value = totalAmount
  } catch {
    ElMessage.error('获取销售记录失败')
  } finally {
    loading.value = false
  }
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  fetchSalesRecords()
}
const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchSalesRecords()
}

const handleSearch = () => {
  currentPage.value = 1
  fetchSalesRecords()
}
const resetSearch = () => {
  searchForm.value = {
    creator: '',
    payment_status: '',
    timeRange: [],
    warehouse_id: '',
    warehouse_name: '',
  }
  handleSearch()
}

const getPaymentStatusTag = (status: string) => {
  if (status === '已结清') return 'success'
  if (status === '已付款部分') return 'warning'
  if (status === '待付款') return 'info'
  return 'default'
}

const onWarehouseChange = (warehouseId: number) => {
  const selected = warehouseOptions.value.find(w => w.warehouse_id === warehouseId)
  searchForm.value.warehouse_name = selected ? selected.warehouse_name : ''
}

const handleExport = async () => {
  try {
    const params: Record<string, any> = {}
    if (searchForm.value.creator) params.creator = searchForm.value.creator
    if (searchForm.value.payment_status) params.payment_status = searchForm.value.payment_status
    if (searchForm.value.timeRange && searchForm.value.timeRange.length === 2) {
      const [start, end] = searchForm.value.timeRange
      params.start_time = typeof start === 'string' ? start : start.replace('T', ' ').replace(/\.\d+Z?$/, '')
      params.end_time = typeof end === 'string' ? end : end.replace('T', ' ').replace(/\.\d+Z?$/, '')
    }
    if (searchForm.value.warehouse_id) params.warehouse_id = searchForm.value.warehouse_id
    if (searchForm.value.warehouse_name) params.warehouse_name = searchForm.value.warehouse_name

    const res = await exportSalesRecordsToCSV(params)
    // 直接跳转到 downloadUrl 下载
    const url = res.data?.data?.downloadUrl || res.data?.downloadUrl
    if (url) {
      window.open(url, '_blank')
    } else {
      ElMessage.error('未获取到下载链接')
    }
  } catch {
    ElMessage.error('导出失败')
  }
}

onMounted(() => {
  fetchUserList()
  fetchWarehouseList()
  fetchSalesRecords()
})
</script>

<style scoped>
.sales-list-container {
  border-radius: 12px;
}
.sales-list-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.sales-list-title .title {
  font-size: 18px;
  font-weight: bold;
}
.total-amount {
  font-size: 16px;
  color: #333;
  display: flex;
  align-items: center;
}
.total-amount .amount {
  font-size: 20px;
  font-weight: bold;
  color: #f56c6c;
}
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
.order-block {
  margin-bottom: 24px;
  background: #f8fafd;
  border-radius: 8px;
  padding: 12px 8px 8px 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}
.order-header {
  display: flex;
  gap: 32px;
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
  font-weight: 500;
  align-items: center;
}
.order-products-table {
  background: #fff;
  border-radius: 6px;
}
.search-card {
  margin-bottom: 20px;
}
.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
</style>
