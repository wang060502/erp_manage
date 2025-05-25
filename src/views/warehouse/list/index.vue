<template>
  <el-card class="warehouse-container">
    <div class="warehouse-title">
      <div class="title">
        仓库列表
      </div>
    </div>

  <div style="color: #888; font-size: 13px; margin-bottom: 6px;  display: flex;align-items: center;">
        <el-icon style="font-size: 14px; color: #409eff; margin-right: 6px">
          <InfoFilled />
        </el-icon>点击标签可查看详细说明
  </div>
    <div class="warehouse-type-tags" style="margin-bottom: 25px;">
      <el-popover
        v-for="type in warehouseTypeList"
        :key="type.value"
        placement="bottom"
        width="350"
        trigger="click"
        :content="type.desc"
      >
        <template #reference>
          <el-tag
            :type="type.tagType"
            effect="plain"
            style="margin-right: 12px; cursor: pointer;"
          >
            {{ type.label }}
          </el-tag>
        </template>
        <div>
          <div style="font-weight:bold; margin-bottom: 4px;">{{ type.label }}</div>
          <div v-html="type.detail"></div>
        </div>
      </el-popover>
    </div>
    <!-- 搜索栏 -->
    <div class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="仓库名称">
          <el-input v-model="searchForm.warehouse_name" placeholder="请输入仓库名称" clearable />
        </el-form-item>
        <el-form-item label="仓库类型" style="width: 200px;">
          <el-select v-model="searchForm.warehouse_type" placeholder="请选择仓库类型" clearable>
            <el-option label="本地仓" :value="0" />
            <el-option label="海外仓" :value="1" />
            <el-option label="边境仓" :value="2" />
            <el-option label="平台仓" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" style="width: 160px;">
          <el-select v-model="searchForm.warehouse_status" placeholder="请选择状态" clearable>
            <el-option label="启用" :value="0" />
            <el-option label="禁用" :value="1" />
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
        新增仓库
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

    <!-- 仓库列表 -->
    <div class="table-card">
      <el-table
        v-loading="loading"
        :data="tableData"
        style="width: 100%"
        @selection-change="handleSelectionChange"
        :row-key="row => row.warehouse_id"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="warehouse_name" label="仓库名称" min-width="120">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleViewDetail(row)">{{ row.warehouse_name }}</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="warehouse_type" label="仓库分类" width="100">
          <template #default="{ row }">
            <el-tag
              :type="row.warehouse_type === 0 ? 'success' :
                     row.warehouse_type === 1 ? 'warning' :
                     row.warehouse_type === 2 ? 'info' : 'primary'"
            >
              {{
                row.warehouse_type === 0 ? '本地仓' :
                row.warehouse_type === 1 ? '海外仓' :
                row.warehouse_type === 2 ? '边境仓' :
                row.warehouse_type === 3 ? '平台仓' : ''
              }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="warehouse_address" label="地址" min-width="200" />
        <el-table-column prop="warehouse_manager" label="负责人" width="120" />
        <el-table-column prop="contact_number" label="联系电话" width="120" />
        <el-table-column prop="warehouse_status" label="状态" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.warehouse_status"
              :active-value="0"
              :inactive-value="1"
              @change="val => handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button type="primary" link @click="handleEdit(row)"> 编辑 </el-button>
              <el-button type="primary" link @click="handleInventory(row)"> 库存 </el-button>
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
    </div>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增仓库' : '编辑仓库'"
      width="600px"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="仓库名称" prop="warehouse_name">
          <el-input v-model="form.warehouse_name" placeholder="请输入仓库名称" />
        </el-form-item>
        <el-form-item label="仓库类型" prop="warehouse_type">
          <el-select v-model="form.warehouse_type" placeholder="请选择仓库类型">
            <el-option label="本地仓" :value="0" />
            <el-option label="海外仓" :value="1" />
            <el-option label="边境仓" :value="2" />
            <el-option label="平台仓" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="仓库地址" prop="warehouse_address">
          <el-input v-model="form.warehouse_address" type="textarea" :rows="2" placeholder="请输入仓库地址" />
        </el-form-item>
        <el-form-item label="负责人" prop="warehouse_manager">
          <el-input v-model="form.warehouse_manager" placeholder="请输入负责人姓名" />
        </el-form-item>
        <el-form-item label="联系电话" prop="contact_number">
          <el-input v-model="form.contact_number" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="状态" prop="warehouse_status">
          <el-select v-model="form.warehouse_status" placeholder="请选择状态">
            <el-option label="启用" :value="0" />
            <el-option label="禁用" :value="1" />
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

    <!-- 仓库详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="仓库详情"
      width="600px"
    >
      <div v-if="currentWarehouse">
        <p><strong>仓库名称：</strong>{{ currentWarehouse.warehouse_name }}</p>
        <p>
          <strong>仓库类型：</strong>
          <el-tag
              :type="currentWarehouse.warehouse_type === 0 ? 'success' :
                     currentWarehouse.warehouse_type === 1 ? 'warning' :
                     currentWarehouse.warehouse_type === 2 ? 'info' : 'primary'"
            >
              {{
                currentWarehouse.warehouse_type === 0 ? '本地仓' :
                currentWarehouse.warehouse_type === 1 ? '海外仓' :
                currentWarehouse.warehouse_type === 2 ? '边境仓' :
                currentWarehouse.warehouse_type === 3 ? '平台仓' : ''
              }}
            </el-tag>
        </p>
        <p><strong>仓库地址：</strong>{{ currentWarehouse.warehouse_address }}</p>
        <p><strong>负责人：</strong>{{ currentWarehouse.warehouse_manager }}</p>
        <p><strong>联系电话：</strong>{{ currentWarehouse.contact_number }}</p>
        <p><strong>状态：</strong>
          <el-tag :type="currentWarehouse.warehouse_status === 0 ? 'success' : 'danger'">{{ currentWarehouse.warehouse_status === 0 ? '启用' : '禁用' }}</el-tag>
        </p>
        <p><strong>备注：</strong>{{ currentWarehouse.remark }}</p>
      </div>
    </el-dialog>
  </el-card>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Search, Refresh, Plus, Download, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { addWarehouse, getWarehouseList, updateWarehouse, deleteWarehouse, batchDeleteWarehouses } from '@/api/warehouse/list'

// 搜索表单
const searchForm = reactive({
  warehouse_name: '',
  warehouse_type: undefined as number | undefined,
  warehouse_status: undefined as number | undefined,
})

// 表格数据
const loading = ref(false)
const tableData = ref<any[]>([])

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)

// 对话框相关
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const formRef = ref<FormInstance>()
const form = reactive({
  warehouse_id: undefined as number | undefined,
  warehouse_name: '',
  warehouse_address: '',
  warehouse_status: 0, // 0启用，1禁用
  warehouse_type: 0,   // 0本地仓、1海外仓、2边境仓、3平台仓
  product_quantity: 0,
  warehouse_manager: '',
  contact_number: '',
  remark: '',
})

// 表单验证规则
const rules = reactive<FormRules>({
  warehouse_name: [
    { required: true, message: '请输入仓库名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' },
  ],
  warehouse_type: [{ required: true, message: '请选择仓库类型', trigger: 'change' }],
  warehouse_address: [{ required: true, message: '请输入仓库地址', trigger: 'blur' }],
  warehouse_manager: [{ required: true, message: '请输入负责人', trigger: 'blur' }],
  warehouse_status: [{ required: true, message: '请选择状态', trigger: 'change' }],
})

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchWarehouses()
}

// 重置搜索
const resetSearch = () => {
  searchForm.warehouse_name = ''
  searchForm.warehouse_type = undefined
  searchForm.warehouse_status = undefined
  handleSearch()
}

// 新增仓库
const handleAdd = () => {
  dialogType.value = 'add'
  Object.assign(form, {
    warehouse_id: undefined,
    warehouse_name: '',
    warehouse_address: '',
    warehouse_status: 0,
    warehouse_type: 0,
    product_quantity: 0,
    warehouse_manager: '',
    contact_number: '',
    remark: '',
  })
  dialogVisible.value = true
}

// 编辑仓库
const handleEdit = (row: any) => {
  dialogType.value = 'edit'
  Object.assign(form, row)
  dialogVisible.value = true
}

// 删除仓库
const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确定要删除仓库"${row.warehouse_name}"吗？`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    await deleteWarehouse(row.warehouse_id)
    ElMessage.success('删除成功')
    fetchWarehouses()
  })
}

// 查看库存
const handleInventory = (row: any) => {
  // TODO: 实现查看库存逻辑
  ElMessage.info(`查看仓库"${row.warehouse_name}"的库存信息`)
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      if (dialogType.value === 'add') {
        await addWarehouse(form)
        ElMessage.success('新增成功')
      } else {
        await updateWarehouse(form.warehouse_id, form)
        ElMessage.success('编辑成功')
      }
      dialogVisible.value = false
      fetchWarehouses()
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
  currentPage.value = 1
  fetchWarehouses()
}

// 页码变化
const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchWarehouses()
}

const handleStatusChange = async (row: any) => {
  try {
    await updateWarehouse(row.warehouse_id, { ...row, warehouse_status: row.warehouse_status })
    ElMessage.success('状态已更新')
    fetchWarehouses()
  } catch (e) {
    ElMessage.error('状态更新失败')
    // 可选：回滚状态
    fetchWarehouses()
  }
}

const multipleSelection = ref<any[]>([])

const handleSelectionChange = (val: any[]) => {
  multipleSelection.value = val
}

const handleBatchDelete = async () => {
  if (multipleSelection.value.length === 0) {
    ElMessage.warning('请先选择要删除的仓库')
    return
  }
  const names = multipleSelection.value.map(item => item.warehouse_name).join('，')
  ElMessageBox.confirm(
    `确认批量删除以下仓库吗？<br><span style="color:#f56c6c">${names}</span>`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      dangerouslyUseHTMLString: true,
    }
  ).then(async () => {
    const ids = multipleSelection.value.map(item => item.warehouse_id)
    await batchDeleteWarehouses(ids)
    ElMessage.success('批量删除成功')
    fetchWarehouses()
  })
}

const warehouseTypeList = [
  {
    value: 0,
    label: '本地仓',
    tagType: 'success',
    desc: '本地仓（国内仓）',
    detail: `
      <b>定义：</b>位于中国的仓库，主要用于集中存储产品，方便进行批量生产和发货。<br>
      <b>优势：</b>成本低、灵活补货。<br>
      <b>适用场景：</b>初期出口业务或库存周转较慢的产品。
    `
  },
  {
    value: 1,
    label: '海外仓',
    tagType: 'warning',
    desc: '海外仓',
    detail: `
      <b>定义：</b>位于目标市场的仓库，通常建在主要消费国家或地区，如美国、欧洲、东南亚等地。<br>
      <b>优势：</b>缩短配送时间、降低物流成本、提高市场竞争力。<br>
      <b>适用场景：</b>销量稳定、物流成本高或对配送时效要求高的产品。
    `
  },
  {
    value: 2,
    label: '边境仓',
    tagType: 'info',
    desc: '边境仓',
    detail: `
      <b>定义：</b>位于中国与目标市场边境的仓库，如靠近东南亚的云南、广西等地区。<br>
      <b>优势：</b>结合本地仓与海外仓的优势。<br>
      <b>适用场景：</b>目标市场邻近中国的业务。
    `
  },
  {
    value: 3,
    label: '平台仓',
    tagType: 'primary',
    desc: '平台仓（第三方物流仓）',
    detail: `
      <b>定义：</b>由电商平台或第三方物流服务商提供的仓库，如亚马逊FBA仓、菜鸟仓等。<br>
      <b>优势：</b>方便快捷、提升曝光。<br>
      <b>适用场景：</b>通过跨境电商平台销售的产品。
    `
  }
]

const fetchWarehouses = async () => {
  loading.value = true
  try {
    const res = await getWarehouseList({
      page: currentPage.value,
      limit: pageSize.value,
      warehouse_name: searchForm.warehouse_name || undefined,
      warehouse_type: searchForm.warehouse_type,
      warehouse_status: searchForm.warehouse_status,
    })
    // 假设接口返回 { warehouses: [], pagination: { total: 100 } }
    tableData.value = (res.warehouses || []).map(item => ({
      ...item,
      warehouse_status: typeof item.warehouse_status === 'string' ? Number(item.warehouse_status) : item.warehouse_status,
      warehouse_type: typeof item.warehouse_type === 'string' ? Number(item.warehouse_type) : item.warehouse_type,
      product_quantity: typeof item.product_quantity === 'string' ? Number(item.product_quantity) : item.product_quantity,
    }))
    total.value = res.pagination?.total || tableData.value.length
  } finally {
    loading.value = false
  }
}

// 查看仓库详情
const detailDialogVisible = ref(false)
const currentWarehouse = ref<any>(null)

const handleViewDetail = (row: any) => {
  currentWarehouse.value = row
  detailDialogVisible.value = true
}

onMounted(fetchWarehouses)
</script>

<style scoped>
.warehouse-container {
  border-radius: 12px;
}
.warehouse-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.warehouse-title .title{
  font-size: 18px;
  font-weight: bold;
}

.search-card {
  margin-bottom: 10px;
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

.warehouse-type-tags {
  margin-bottom: 16px;
}

</style>
