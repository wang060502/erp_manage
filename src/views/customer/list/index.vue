<template>
  <el-card class="customer-list-container">
    <div class="customer-list-title">
      <div class="title">客户列表</div>
    </div>
    <!-- 搜索栏 -->
    <div class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="客户名称">
          <el-input v-model="searchForm.name" placeholder="请输入客户名称" clearable />
        </el-form-item>
        <el-form-item label="客户状态" style="width: 220px">
          <el-select v-model="searchForm.status" placeholder="请选择客户状态" clearable>
            <el-option
              v-for="item in customerStatusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="客户级别" style="width: 220px">
          <el-select v-model="searchForm.customer_level" placeholder="请选择客户级别" clearable>
            <el-option
              v-for="item in customerLevelOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="付款状态" style="width: 220px">
          <el-select v-model="searchForm.payment_status" placeholder="请选择付款状态" clearable>
            <el-option
              v-for="item in paymentStatusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="创建者">
          <el-select
            v-model="searchForm.creator_id"
            placeholder="请选择创建者"
            clearable
            filterable
            style="width: 180px"
          >
            <el-option
              v-for="item in creatorOptions"
              :key="item.user_id"
              :label="item.username"
              :value="item.user_id"
            />
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
    </div>

    <!-- 操作栏 -->
    <div class="operation-bar">
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增客户
      </el-button>
      <el-button type="success" @click="handleExport">
        <el-icon><Download /></el-icon>
        导出数据
      </el-button>
      <el-button type="danger" @click="handleBatchDelete">
        <el-icon><Delete /></el-icon>
        批量删除
      </el-button>
    </div>

    <!-- 客户列表 -->
    <div class="table-card">
      <el-table v-loading="loading" :data="tableData" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" />
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="customer_name" label="客户名称" min-width="150">
          <template #default="{ row }">
            <el-link type="primary" @click="showDetail(row)">
              {{ row.customer_name }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column prop="customer_status" label="客户状态" width="120">
          <template #default="{ row }">
            <el-tag
              :type="
                row.customer_status === '成交客户'
                  ? 'warning'
                  : row.customer_status === '潜在客户'
                    ? 'info'
                    : row.customer_status === '战略合作'
                      ? 'success'
                      : row.customer_status === '无效客户'
                        ? 'danger'
                        : 'default'
              "
              effect="light"
            >
              {{ row.customer_status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="customer_level" label="客户级别" width="120">
          <template #default="{ row }">
            <el-tag :type="row.customer_level === '重要客户' ? 'danger' : 'success'" effect="light">
              {{ row.customer_level }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="payment_status" label="付款状态" width="120">
          <template #default="{ row }">
            <el-tag
              :type="
                row.payment_status === '已结清'
                  ? 'success'
                  : row.payment_status === '已付款部分'
                    ? 'warning'
                    : row.payment_status === '待付款'
                      ? 'info'
                      : 'default'
              "
              effect="light"
            >
              {{ row.payment_status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="customer_source" label="客户来源" width="120" />
        <el-table-column
          prop="customer_address"
          label="客户地址"
          min-width="200"
          show-overflow-tooltip
        />
        <el-table-column
          prop="customer_detail"
          label="客户详情"
          min-width="120"
          show-overflow-tooltip
        />
        <el-table-column prop="deal_price" label="成交金额" width="100" />
        <el-table-column prop="creator_name" label="创建者" width="120" />
        <el-table-column prop="create_time" label="创建时间" width="180">
          <template #default="{ row }">
            {{ row.create_time ? row.create_time.replace('T', ' ').replace(/\.\d+Z?$/, '') : '' }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="260" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
              <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
              <el-button type="info" link @click="showSalesRecord(row)">销售记录</el-button>
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
    </div>

    <!-- 新增/编辑客户对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增客户' : '编辑客户'"
      width="600px"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="客户名称" prop="customer_name">
          <el-input v-model="form.customer_name" placeholder="请输入客户名称" />
        </el-form-item>
        <el-form-item label="客户状态" prop="customer_status">
          <el-select v-model="form.customer_status" placeholder="请选择客户状态">
            <el-option
              v-for="item in customerStatusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="客户级别" prop="customer_level">
          <el-select v-model="form.customer_level" placeholder="请选择客户级别">
            <el-option
              v-for="item in customerLevelOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="付款状态" prop="payment_status">
          <el-select v-model="form.payment_status" placeholder="请选择付款状态">
            <el-option
              v-for="item in paymentStatusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="客户来源" prop="customer_source">
          <el-input v-model="form.customer_source" placeholder="请输入客户来源" />
        </el-form-item>
        <el-form-item label="客户地址" prop="customer_address">
          <el-input v-model="form.customer_address" placeholder="请输入客户地址" />
        </el-form-item>
        <el-form-item label="客户详情" prop="customer_detail">
          <el-input
            v-model="form.customer_detail"
            type="textarea"
            :rows="2"
            placeholder="请输入客户详情"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 客户详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="客户详情"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-descriptions :column="1" border>
        <el-descriptions-item label="客户名称">{{ detailData.customer_name }}</el-descriptions-item>
        <el-descriptions-item label="客户状态">
          <el-tag
            :type="
              detailData.customer_status === '成交客户'
                ? 'warning'
                : detailData.customer_status === '潜在客户'
                  ? 'info'
                  : detailData.customer_status === '战略合作'
                    ? 'success'
                    : detailData.customer_status === '无效客户'
                      ? 'danger'
                      : 'default'
            "
            effect="light"
          >
            {{ detailData.customer_status }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="客户级别">
          <el-tag
            :type="detailData.customer_level === '重要客户' ? 'danger' : 'success'"
            effect="light"
          >
            {{ detailData.customer_level }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="付款状态">
          <el-tag
            :type="
              detailData.payment_status === '已结清'
                ? 'success'
                : detailData.payment_status === '已付款部分'
                  ? 'warning'
                  : detailData.payment_status === '待付款'
                    ? 'info'
                    : 'default'
            "
            effect="light"
          >
            {{ detailData.payment_status }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="客户来源">{{
          detailData.customer_source
        }}</el-descriptions-item>
        <el-descriptions-item label="客户地址">{{
          detailData.customer_address
        }}</el-descriptions-item>
        <el-descriptions-item label="客户详情">{{
          detailData.customer_detail
        }}</el-descriptions-item>
        <el-descriptions-item label="成交金额">{{ detailData.deal_price }}</el-descriptions-item>
        <el-descriptions-item label="创建者">{{ detailData.creator_name }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{
            detailData.create_time
              ? detailData.create_time.replace('T', ' ').replace(/\.\d+Z?$/, '')
              : ''
          }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="detailData.status === 1 ? 'success' : 'info'">
            {{ detailData.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 销售记录弹窗 -->
    <el-dialog v-model="salesRecordDialogVisible" title="产品销售记录" width="800px">
      <div class="sales-record-header">
        <div class="total-amount">
          <span class="label">总销售金额：</span>
          <span class="amount">${{ customerTotalAmount }}</span>
        </div>
        <el-button type="primary" @click="handleAddSalesRecord">新增销售记录</el-button>
      </div>
      <div v-for="(order, oIdx) in salesOrders" :key="oIdx" class="order-block">
        <div class="order-header">
          <span>销售时间：{{ dayjs(order.sales_time).format('YYYY-MM-DD HH:mm:ss') }}</span>
          <span>总金额：${{ order.total_amount }}</span>
          <span>创建人：{{ order.creator_name }}</span>
          <el-button
            type="danger"
            size="small"
            @click="handleDeleteSalesRecord(order)"
            style="margin-left: auto"
            >删除</el-button
          >
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
          <el-table-column prop="remark" label="备注" min-width="120">
            <template #default="{ row }">
              <el-tooltip v-if="row.remark" :content="row.remark" placement="top" effect="dark">
                <span
                  style="
                    display: inline-block;
                    max-width: 100px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                  "
                >
                  {{ row.remark }}
                </span>
              </el-tooltip>
              <span v-else style="color: #bbb">-</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <el-pagination
        v-model:current-page="salesRecordPage"
        v-model:page-size="salesRecordLimit"
        :total="salesRecordTotal"
        :page-sizes="[5, 10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSalesRecordSizeChange"
        @current-change="handleSalesRecordPageChange"
        style="margin: 16px 0 0 0"
      />
      <template #footer>
        <el-button @click="handleCloseSalesRecord">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 新增销售记录弹窗 -->
    <el-dialog v-model="addSalesRecordDialogVisible" title="新增产品销售记录" width="700px">
      <el-form
        ref="addSalesRecordFormRef"
        :model="addSalesRecordForm"
        :rules="addSalesRecordRules"
        label-width="100px"
      >
        <el-form-item label="销售时间" prop="sales_time">
          <el-date-picker
            v-model="addSalesRecordForm.sales_time"
            type="datetime"
            placeholder="选择销售时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="产品明细" prop="products">
          <div class="product-detail-list">
            <div
              v-for="(prod, idx) in addSalesRecordForm.products"
              :key="idx"
              class="product-detail-card"
            >
              <div class="product-card-toolbar">
                <span class="product-index">{{ idx + 1 }}</span>
                <div class="product-toolbar-actions">
                  <el-button
                    icon="Plus"
                    @click="handleAddProductRow"
                    circle
                    type="success"
                    size="small"
                  />
                  <el-button
                    icon="Minus"
                    @click="() => handleRemoveProductRow(idx)"
                    circle
                    type="danger"
                    size="small"
                    :disabled="addSalesRecordForm.products.length === 1"
                  />
                </div>
              </div>
              <div class="product-detail-fields">
                <el-form-item label="商品名称" :required="true" class="product-form-item">
                  <el-autocomplete
                    v-model="prod.product_title"
                    :fetch-suggestions="(q, cb) => querySearchProductName(q, cb)"
                    placeholder="输入商品名"
                    @select="(val) => handleProductNameSelect(val, idx)"
                    class="product-input"
                  >
                    <template #default="{ item }">
                      <div class="product-autocomplete-item">
                        <img
                          v-if="item.product_image"
                          :src="item.product_image"
                          class="product-img"
                        />
                        <div>
                          <div class="product-title">{{ item.product_title }}</div>
                          <div class="product-sku">SKU: {{ item.product_sku }}</div>
                        </div>
                      </div>
                    </template>
                  </el-autocomplete>
                </el-form-item>
                <el-form-item label="SKU" :required="true" class="product-form-item">
                  <el-autocomplete
                    v-model="prod.product_sku"
                    :fetch-suggestions="(q, cb) => querySearchProductSku(q, cb)"
                    placeholder="输入SKU"
                    @select="(val) => handleProductSkuSelect(val, idx)"
                    class="product-input"
                  >
                    <template #default="{ item }">
                      <div class="product-autocomplete-item">
                        <img
                          v-if="item.product_image"
                          :src="item.product_image"
                          class="product-img"
                        />
                        <div>
                          <div class="product-title">{{ item.product_title }}</div>
                          <div class="product-sku">SKU: {{ item.product_sku }}</div>
                        </div>
                      </div>
                    </template>
                  </el-autocomplete>
                </el-form-item>
                <el-form-item label="数量" :required="true" class="product-form-item">
                  <el-input
                    v-model.number="prod.quantity"
                    type="number"
                    min="1"
                    @input="() => calcTotalPrice(idx)"
                    placeholder="数量"
                    class="product-input"
                  />
                </el-form-item>
                <el-form-item label="单价" :required="true" class="product-form-item">
                  <el-input
                    v-model.number="prod.unit_price"
                    type="number"
                    min="0"
                    step="0.01"
                    @input="() => calcTotalPrice(idx)"
                    placeholder="单价"
                    class="product-input"
                  />
                </el-form-item>
                <el-form-item label="总价" class="product-form-item">
                  <el-input
                    v-model.number="prod.total_price"
                    type="number"
                    readonly
                    placeholder="总价"
                    class="product-input product-total"
                  />
                </el-form-item>
                <el-form-item
                  label="备注"
                  class="product-form-item product-remark-item"
                  style="width: 100%"
                >
                  <el-input
                    v-model="prod.remark"
                    type="textarea"
                    :rows="2"
                    placeholder="可填写本产品的特殊说明"
                    class="product-input"
                  />
                </el-form-item>
              </div>
            </div>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addSalesRecordDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitAddSalesRecord">确定</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Search, Refresh, Plus, Download, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import dayjs from 'dayjs'
import {
  createCustomer,
  getCustomerList,
  updateCustomer,
  deleteCustomer,
  batchDeleteCustomers,
  getCustomerCreators,
} from '@/api/customer/customerlist'
import {
  getSalesRecordsByCustomer,
  addSalesRecord,
  deleteSalesRecordByCustomerAndTime,
} from '@/api/customer/salesrecords'
import { getProductList } from '@/api/product/list'

interface Customer {
  customer_id: number
  customer_name: string
  customer_status: string
  customer_level: string
  payment_status: string
  customer_source: string
  customer_address: string
  customer_detail: string
  deal_price: number
  status: number
  creator: number
  create_time: string
  update_time: string
  creator_name: string
}

// 搜索表单
const searchForm = reactive({
  name: '',
  status: '',
  payment_status: '',
  customer_level: '',
  creator_id: undefined as number | undefined,
})

// 表格数据
const loading = ref(false)
const tableData = ref<Customer[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const multipleSelection = ref<Customer[]>([])

// 对话框相关
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const formRef = ref<FormInstance>()
const form = reactive({
  customer_name: '',
  customer_status: '',
  customer_level: '',
  payment_status: '',
  customer_source: '',
  customer_address: '',
  customer_detail: '',
  deal_price: 0,
  status: 1,
  creator: 1,
})

const rules = reactive<FormRules>({
  customer_name: [{ required: true, message: '请输入客户名称', trigger: 'blur' }],
  customer_status: [{ required: true, message: '请选择客户状态', trigger: 'change' }],
  customer_level: [{ required: true, message: '请选择客户级别', trigger: 'change' }],
  payment_status: [{ required: true, message: '请选择付款状态', trigger: 'change' }],
  customer_source: [{ required: true, message: '请输入客户来源', trigger: 'blur' }],
  customer_address: [{ required: true, message: '请输入客户地址', trigger: 'blur' }],
  customer_detail: [{ required: true, message: '请输入客户详情', trigger: 'blur' }],
})

// 获取等级标签
const getLevelTag = (level: string) => {
  const map: Record<string, string> = {
    normal: 'info',
    vip: 'success',
    diamond: 'warning',
  }
  return map[level] || 'info'
}

const getLevelLabel = (level: string) => {
  const map: Record<string, string> = {
    normal: '普通',
    vip: 'VIP',
    diamond: '钻石',
  }
  return map[level] || '未知'
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchCustomers()
}

// 重置搜索
const resetSearch = () => {
  searchForm.name = ''
  searchForm.status = ''
  searchForm.payment_status = ''
  searchForm.customer_level = ''
  searchForm.creator_id = undefined
  handleSearch()
}

// 新增客户
const handleAdd = () => {
  dialogType.value = 'add'
  Object.assign(form, {
    customer_name: '',
    customer_status: '',
    customer_level: '',
    payment_status: '',
    customer_source: '',
    customer_address: '',
    customer_detail: '',
    deal_price: 0,
    status: 1,
    creator: 1, // 可根据实际登录用户ID赋值
  })
  dialogVisible.value = true
}

// 编辑客户
const handleEdit = (row: Customer) => {
  dialogType.value = 'edit'
  Object.assign(form, row)
  dialogVisible.value = true
}

// 删除客户
const handleDelete = (row: Customer) => {
  ElMessageBox.confirm(`确认删除客户【${row.customer_name}】吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    await deleteCustomer(row.customer_id)
    ElMessage.success('删除成功')
    fetchCustomers()
  })
}

// 导出数据
const handleExport = () => {
  // TODO: 实现导出逻辑
  ElMessage.success('开始导出数据')
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      if (dialogType.value === 'add') {
        await createCustomer(form)
        ElMessage.success('新增成功')
      } else {
        await updateCustomer(form.customer_id, form)
        ElMessage.success('编辑成功')
      }
      dialogVisible.value = false
      fetchCustomers()
    }
  })
}

// 分页大小变化
const handleSizeChange = (val: number) => {
  pageSize.value = val
  fetchCustomers()
}

// 页码变化
const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchCustomers()
}

// 处理表格选择变化
const handleSelectionChange = (val: Customer[]) => {
  multipleSelection.value = val
}

const handleBatchDelete = async () => {
  if (multipleSelection.value.length === 0) {
    ElMessage.warning('请先选择要删除的客户')
    return
  }
  const names = multipleSelection.value.map((item) => item.customer_name).join('，')
  ElMessageBox.confirm(
    `确认批量删除以下客户吗？<br><span style="color:#f56c6c">${names}</span>`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      dangerouslyUseHTMLString: true,
    },
  ).then(async () => {
    const ids = multipleSelection.value.map((item) => item.customer_id)
    await batchDeleteCustomers(ids)
    ElMessage.success('批量删除成功')
    fetchCustomers()
  })
}

const handleStatusChange = async (row) => {
  await updateCustomer(row.customer_id, { status: row.status })
  ElMessage.success('状态已更新')
  fetchCustomers()
}

const fetchCustomers = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      limit: pageSize.value,
      customer_name: searchForm.name || undefined,
      customer_status: searchForm.status || undefined,
      customer_level: searchForm.customer_level || undefined,
      payment_status: searchForm.payment_status || undefined,
      creator_id: searchForm.creator_id || undefined,
    }
    const res = await getCustomerList(params)
    tableData.value = res.data?.list || []
    total.value = res.data?.pagination?.total || 0
  } finally {
    loading.value = false
  }
}

const customerStatusOptions = [
  { label: '潜在客户', value: '潜在客户' },
  { label: '成交客户', value: '成交客户' },
  { label: '战略合作', value: '战略合作' },
  { label: '无效客户', value: '无效客户' },
]
const customerLevelOptions = [
  { label: '重要客户', value: '重要客户' },
  { label: '一般客户', value: '一般客户' },
]
const paymentStatusOptions = [
  { label: '待付款', value: '待付款' },
  { label: '已付款部分', value: '已付款部分' },
  { label: '已结清', value: '已结清' },
]

const creatorOptions = ref<{ user_id: number; username: string }[]>([])

const detailDialogVisible = ref(false)
const detailData = reactive<Partial<Customer>>({})

const showDetail = (row: Customer) => {
  Object.assign(detailData, row)
  detailDialogVisible.value = true
}

onMounted(async () => {
  await fetchCustomers()
  const res = await getCustomerCreators()
  creatorOptions.value = res.data || []
})

// 销售记录弹窗相关
const salesRecordDialogVisible = ref(false)
const salesOrders = ref([])
const salesRecordCustomerId = ref<number | null>(null)
const salesRecordLoading = ref(false)
const customerTotalAmount = ref('0.00')
const salesRecordPage = ref(1)
const salesRecordLimit = ref(5)
const salesRecordTotal = ref(0)

// 新增销售记录表单相关
const addSalesRecordDialogVisible = ref(false)
const addSalesRecordFormRef = ref<FormInstance>()
const addSalesRecordForm = reactive({
  sales_time: '',
  creator: 1,
  products: [
    {
      product_id: 0,
      product_sku: '',
      quantity: 1,
      unit_price: 0,
      total_price: 0,
      remark: '',
    },
  ],
})
const addSalesRecordRules = reactive<FormRules>({
  sales_time: [{ required: true, message: '请选择销售时间', trigger: 'change' }],
  products: [
    {
      validator: (rule, value, callback) => {
        if (!value || !Array.isArray(value) || value.length === 0) {
          callback(new Error('请至少添加一个产品'))
        } else {
          for (const prod of value) {
            if (!prod.product_id) return callback(new Error('请选择产品'))
            if (!prod.product_sku) return callback(new Error('请输入SKU'))
            if (!prod.quantity) return callback(new Error('请输入数量'))
            if (!prod.unit_price) return callback(new Error('请输入单价'))
            if (!prod.total_price) return callback(new Error('请输入总价'))
          }
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
})

// 产品选择相关
interface Product {
  product_id: number
  product_title: string
  product_sku: string
  product_image?: string
}

const querySearchProductName = async (queryString, cb) => {
  const res = await getProductList({ product_title: queryString, page: 1, page_size: 20 })
  cb(
    (res.data?.list || []).map((item) => ({
      product_id: item.product_id,
      product_title: item.product_title,
      product_sku: item.product_sku,
      product_image: item.product_image,
    })),
  )
}

const querySearchProductSku = async (queryString, cb) => {
  const res = await getProductList({ product_sku: queryString, page: 1, page_size: 20 })
  cb(
    (res.data?.list || []).map((item) => ({
      product_id: item.product_id,
      product_title: item.product_title,
      product_sku: item.product_sku,
      product_image: item.product_image,
    })),
  )
}

const handleProductNameSelect = (item, idx) => {
  const prod = addSalesRecordForm.products[idx]
  prod.product_id = item.product_id
  prod.product_title = item.product_title
  prod.product_sku = item.product_sku
  prod.product_image = item.product_image
}

const handleProductSkuSelect = (item, idx) => {
  const prod = addSalesRecordForm.products[idx]
  prod.product_id = item.product_id
  prod.product_title = item.product_title
  prod.product_sku = item.product_sku
  prod.product_image = item.product_image
}

const handleAddProductRow = () => {
  addSalesRecordForm.products.push({
    product_id: 0,
    product_sku: '',
    quantity: 1,
    unit_price: 0,
    total_price: 0,
    remark: '',
  })
}
const handleRemoveProductRow = (idx: number) => {
  if (addSalesRecordForm.products.length > 1) {
    addSalesRecordForm.products.splice(idx, 1)
  }
}

const calcTotalPrice = (idx: number) => {
  const prod = addSalesRecordForm.products[idx]
  prod.total_price = Number(prod.quantity) * Number(prod.unit_price)
}

const handleAddSalesRecord = () => {
  if (!salesRecordCustomerId.value) return
  Object.assign(addSalesRecordForm, {
    sales_time: '',
    creator: 1,
    products: [
      {
        product_id: 0,
        product_sku: '',
        quantity: 1,
        unit_price: 0,
        total_price: 0,
        remark: '',
      },
    ],
  })
  addSalesRecordDialogVisible.value = true
}

const handleSubmitAddSalesRecord = async () => {
  if (!addSalesRecordFormRef.value) return
  await addSalesRecordFormRef.value.validate(async (valid) => {
    if (valid && salesRecordCustomerId.value) {
      await addSalesRecord({
        customer_id: salesRecordCustomerId.value,
        products: addSalesRecordForm.products.map((p) => ({
          product_id: p.product_id,
          product_sku: p.product_sku,
          quantity: p.quantity,
          unit_price: p.unit_price,
          total_price: p.total_price,
          remark: p.remark,
        })),
        sales_time: addSalesRecordForm.sales_time,
        creator: addSalesRecordForm.creator,
      })
      ElMessage.success('新增销售记录成功')
      addSalesRecordDialogVisible.value = false
      await fetchSalesRecords(salesRecordCustomerId.value)
    }
  })
}

const showSalesRecord = async (row: Customer) => {
  salesRecordCustomerId.value = row.customer_id
  salesRecordPage.value = 1
  salesRecordDialogVisible.value = true
  await fetchSalesRecords(row.customer_id)
}

const fetchSalesRecords = async (customerId: number) => {
  salesRecordLoading.value = true
  try {
    const res = await getSalesRecordsByCustomer({
      customerId,
      page: salesRecordPage.value,
      limit: salesRecordLimit.value,
    })
    salesOrders.value = res.orders || []
    customerTotalAmount.value = res.customer_total_amount || '0.00'
    salesRecordTotal.value = res.pagination?.total || 0
  } finally {
    salesRecordLoading.value = false
  }
}

const handleCloseSalesRecord = () => {
  salesRecordDialogVisible.value = false
  fetchCustomers()
}

// 分页切换
const handleSalesRecordPageChange = (page: number) => {
  salesRecordPage.value = page
  if (salesRecordCustomerId.value) {
    fetchSalesRecords(salesRecordCustomerId.value)
  }
}
const handleSalesRecordSizeChange = (size: number) => {
  salesRecordLimit.value = size
  salesRecordPage.value = 1
  if (salesRecordCustomerId.value) {
    fetchSalesRecords(salesRecordCustomerId.value)
  }
}

const handleDeleteSalesRecord = async (order) => {
  await ElMessageBox.confirm('删除后客户总销售金额也会随之更新，是否确认删除该销售记录？', '警告', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning',
  })
  try {
    await deleteSalesRecordByCustomerAndTime(salesRecordCustomerId.value, order.sales_time)
    ElMessage.success('删除销售记录成功')
    if (salesRecordCustomerId.value) {
      await fetchSalesRecords(salesRecordCustomerId.value)
    }
  } catch (e) {
    ElMessage.error('删除失败，请重试')
  }
}

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  return dateStr.replace('T', ' ').replace(/\\.\\d+Z?$/, '')
}
</script>

<style scoped>
.customer-list-container {
  border-radius: 12px;
}

.customer-list-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.customer-list-title .title {
  font-size: 18px;
  font-weight: bold;
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

.product-detail-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.product-detail-card {
  background: #fff;
  border-bottom: 1px dashed #979899;
  padding: 32px 24px 12px 24px;
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 24px;
  flex-wrap: wrap;
}
.product-card-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: absolute;
  left: 0;
  top: 0;
  width: 95%;
  padding: 10px 16px 0 16px;
  z-index: 2;
}
.product-toolbar-actions {
  display: flex;
  gap: 8px;
}
.product-index {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  background: #e6f0fa;
  color: #409eff;
  border-radius: 50%;
  font-size: 13px;
  font-weight: bold;
  box-shadow: 0 1px 4px rgba(64, 158, 255, 0.08);
  margin-right: 4px;
}
.el-button {
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.2s;
}
.el-button:hover {
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.18);
}
.product-detail-fields {
  flex: 1;
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 18px 24px;
}
.product-form-item {
  min-width: 180px;
  flex: 1 1 180px;
  margin-bottom: 0 !important;
}
.product-input {
  width: 100%;
}
.product-total input {
  background: #f5f7fa !important;
  color: #222;
  font-weight: bold;
}
.product-autocomplete-item {
  display: flex;
  align-items: center;
}
.product-img {
  width: 32px;
  height: 32px;
  object-fit: cover;
  margin-right: 8px;
  border-radius: 4px;
}
.product-title {
  font-weight: 500;
}
.product-sku {
  font-size: 12px;
  color: #888;
}
@media (max-width: 600px) {
  .product-detail-card {
    flex-direction: column;
    padding: 32px 8px 12px 8px;
  }
  .product-card-toolbar {
    left: 0;
    top: 0;
    padding: 8px 8px 0 8px;
  }
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
}
.order-products-table {
  background: #fff;
  border-radius: 6px;
}
.product-remark-item {
  flex-basis: 100%;
  min-width: 0;
  margin-top: 8px;
}

.sales-record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 0 4px;
}

.total-amount {
  font-size: 16px;
  color: #333;
}

.total-amount .label {
  color: #666;
  margin-right: 8px;
}

.total-amount .amount {
  font-size: 20px;
  font-weight: bold;
  color: #f56c6c;
}
</style>
