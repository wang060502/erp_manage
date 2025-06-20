<template>
  <el-card class="inventory-container">
    <div class="inventory-container-title">
      <div class="title">库存管理</div>
    </div>
    <!-- 搜索栏 -->
    <div class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="产品名称">
          <el-input v-model="searchForm.product_name" placeholder="请输入产品名称" clearable />
        </el-form-item>
        <el-form-item label="产品SKU">
          <el-input v-model="searchForm.product_sku" placeholder="请输入产品SKU" clearable />
        </el-form-item>
        <el-form-item label="仓库" style="width: 200px">
          <el-select v-model="searchForm.warehouse_id" placeholder="请选择仓库" clearable>
            <el-option
              v-for="item in warehouseOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
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
      <el-button type="primary" @click="addDialogVisible = true">
        <el-icon><Plus /></el-icon>
        新增库存
      </el-button>
    </div>

    <!-- 库存列表卡片分组 -->
    <div class="table-card">
      <div class="inventory-card-list">
        <el-card
          v-for="prod in tableData"
          :key="prod.product_id"
          class="inventory-product-card"
          shadow="hover"
        >
          <div class="inventory-product-header">
            <el-image
              v-if="prod.product_image"
              :src="prod.product_image"
              class="inventory-product-image"
              fit="cover"
            />
            <div class="inventory-product-info">
              <div
                class="inventory-product-title"
                @click="openDetailDialog(prod)"
                style="cursor: pointer; color: #409eff"
              >
                {{ prod.product_name }}
              </div>
              <div class="inventory-product-sku">SKU: {{ prod.product_sku }}</div>
            </div>
            <div class="card-actions">
              <button class="icon-btn" @click="openBatchEditDialog(prod)" title="批量编辑">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M4 13.5V16h2.5l7.06-7.06-2.5-2.5L4 13.5z" fill="#409EFF" />
                  <path
                    d="M14.06 6.44a1.5 1.5 0 0 0 0-2.12l-1.38-1.38a1.5 1.5 0 0 0-2.12 0l-1.06 1.06 3.5 3.5 1.06-1.06z"
                    fill="#409EFF"
                  />
                </svg>
              </button>
              <button
                class="icon-btn"
                @click="handleDeleteProductWarehouse(prod.product_id, prod.product_name)"
                title="删除"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="10" fill="#F56C6C" />
                  <path
                    d="M7 7l6 6M13 7l-6 6"
                    stroke="#fff"
                    stroke-width="2"
                    stroke-linecap="round"
                  />
                </svg>
              </button>
            </div>
          </div>
          <el-table :data="prod.warehouses" class="inventory-warehouse-table" size="small">
            <el-table-column prop="warehouse_name" label="仓库" min-width="80" />
            <el-table-column label="库存明细">
              <template #default="{ row }">
                <el-table
                  :data="row.stocks"
                  size="mini"
                  style=" margin: 0; background: #f9fbfd;"
                  class="inner-stock-table"
                  :header-cell-style="{ background: '#f5f7fa', color: '#888', fontWeight: 500, fontSize: '13px' }"
                >
                  <el-table-column prop="product_size" label="尺码" min-width="60">
                    <template #default="{ row }">
                      <span style="color: #409eff; font-weight: bold;">{{ row.product_size }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="stock_quantity" label="库存" min-width="60">
                    <template #default="{ row }">
                      <span style="color: #222;">{{ row.stock_quantity }}</span>
                    </template>
                  </el-table-column>
                </el-table>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
        <div v-if="!tableData.length" style="color: #aaa; text-align: center; margin: 30px 0">
          暂无库存数据
        </div>
      </div>
      <div class="pagination-container">
        <el-pagination
          background
          layout="sizes, prev, pager, next, jumper, ->, total"
          :current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
          :page-sizes="[10, 20, 50, 100]"
          style="margin-top: 16px"
        />
      </div>
    </div>

    <!-- 新增库存弹窗 -->
    <el-dialog v-model="addDialogVisible" title="新增库存" width="800px">
      <div class="custom-dialog-header">
        <div class="header-icon">
          <el-icon style="font-size: 28px; color: #409eff;"><Plus /></el-icon>
        </div>
        <div class="header-content">
          <div class="header-title">新增库存</div>
          <div class="header-desc">请填写产品库存明细，支持批量设置安全库存，批量设置仓库</div>
        </div>
      </div>
      <div class="header-divider"></div>
      <!-- 产品自动完成选择区 -->
      <div class="product-search-bar">
        <ProductAutoComplete
          v-model="selectedProduct"
          placeholder="请输入产品名称或SKU"
          @select="handleProductSelect"
        />
      </div>
      <!-- 产品卡片区 -->
      <div class="product-card-list">
        <el-card
          v-for="(card, cardIdx) in productCards"
          :key="card.product.product_id"
          class="product-card"
          shadow="hover"
        >
          <div class="card-header-flex">
            <div class="product-info-flex">
              <el-image
                v-if="card.product.product_image"
                :src="card.product.product_image"
                class="product-image-thumb"
                fit="cover"
              />
              <div>
                <div class="product-title">{{ card.product.product_title }}</div>
                <div class="product-sku">SKU: {{ card.product.product_sku }}</div>
              </div>
            </div>
            <div class="card-actions">
              <div class="safe-stock-batch-set" style="display: flex; align-items: center; gap: 8px;">
                <el-input-number v-model="batchSafeStock" :min="0" :controls="false"  placeholder="批量设置安全库存" style="width: 150px;" />
                <el-button type="primary" @click="setAllSafeStock">应用到全部</el-button>
              </div>
              <el-select
                v-model="card.selectedWarehouseId"
                placeholder="卡片统一选择仓库"
                clearable
                class="card-warehouse-select"
                @change="(val: number | null) => handleCardWarehouseChange(cardIdx, val)"
              >
                <el-option
                  v-for="w in warehouseOptions"
                  :key="w.id"
                  :label="w.name"
                  :value="w.id"
                />
              </el-select>
              <button
                class="icon-btn card-delete-btn"
                @click="removeProductCard(cardIdx)"
                title="删除卡片"
              >
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <circle cx="11" cy="11" r="11" fill="#F56C6C" />
                  <path
                    d="M7.5 7.5L14.5 14.5M14.5 7.5L7.5 14.5"
                    stroke="#fff"
                    stroke-width="2"
                    stroke-linecap="round"
                  />
                </svg>
              </button>
            </div>
          </div>
          <div class="card-details-flex">
            <div
              v-for="(detail, idx) in card.details"
              :key="idx"
              class="detail-row-group"
            >
              <!-- 第一排：尺码、数量 -->
              <el-row :gutter="12" class="detail-row-flex">
                <el-col :span="12">
                  <el-form-item
                    :prop="`cards.${cardIdx}.details.${idx}.product_size`"
                    label="尺码"
                    class="form-item-flex"
                  >
                    <el-input v-model="detail.product_size" placeholder="尺码" class="input-flex" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item
                    :prop="`cards.${cardIdx}.details.${idx}.stock_quantity`"
                    label="数量"
                    class="form-item-flex"
                  >
                    <el-input-number
                      v-model.number="detail.stock_quantity"
                      :min="0"
                      placeholder="数量"
                      class="input-flex"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              <!-- 第二排：安全库存、仓库、操作按钮 -->
              <el-row :gutter="12" class="detail-row-flex">
                <el-col :span="8">
                  <el-form-item
                    :prop="`cards.${cardIdx}.details.${idx}.safe_stock_quantity`"
                    label="安全库存"
                    class="form-item-flex"
                  >
                    <el-input-number
                      v-model.number="detail.safe_stock_quantity"
                      :min="0"
                      placeholder="安全库存"
                      class="input-flex"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item
                    :prop="`cards.${cardIdx}.details.${idx}.warehouse_id`"
                    label="仓库ID"
                    class="form-item-flex"
                  >
                    <el-select
                      v-model.number="detail.warehouse_id"
                      placeholder="请选择仓库"
                      :disabled="!!card.selectedWarehouseId"
                      class="input-flex"
                    >
                      <el-option
                        v-for="w in warehouseOptions"
                        :key="w.id"
                        :label="w.name"
                        :value="w.id"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="4" class="detail-row-btn-col">
                  <button
                    class="icon-btn detail-row-add-btn"
                    @click="addDetailRow(cardIdx)"
                    title="新增一行"
                  >
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                      <circle cx="11" cy="11" r="11" fill="#409EFF" />
                      <path
                        d="M11 7V15M7 11H15"
                        stroke="#fff"
                        stroke-width="2"
                        stroke-linecap="round"
                      />
                    </svg>
                  </button>
                  <button
                    v-if="card.details.length > 1"
                    class="icon-btn detail-row-delete-btn"
                    @click="removeDetailRow(cardIdx, idx)"
                    title="删除本行"
                  >
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                      <circle cx="11" cy="11" r="11" fill="#F56C6C" />
                      <path
                        d="M7.5 7.5L14.5 14.5M14.5 7.5L7.5 14.5"
                        stroke="#fff"
                        stroke-width="2"
                        stroke-linecap="round"
                      />
                    </svg>
                  </button>
                </el-col>
              </el-row>
            </div>
          </div>
        </el-card>
        <div v-if="!productCards.length" style="color: #aaa; text-align: center; margin: 30px 0">
          请先搜索并选择产品
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleAddSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 批量编辑弹窗 -->
    <el-dialog v-model="batchEditDialogVisible" title="批量编辑库存" width="800px">
      <div v-if="currentBatchProduct" class="batch-edit-header">
        <el-image
          v-if="currentBatchProduct.product_image"
          :src="currentBatchProduct.product_image"
          class="product-image-thumb"
          fit="cover"
        />
        <div class="batch-edit-product-info">
          <div class="product-title">{{ currentBatchProduct.product_name }}</div>
          <div class="product-sku">SKU: {{ currentBatchProduct.product_sku }}</div>
        </div>
      </div>
      <!-- 新增按钮 -->
      <div style="margin-top: 20px; text-align: right">
        <el-button type="primary" @click="openAddBatchEditItemDialog">新增</el-button>
      </div>
      <el-table :data="batchEditItems" border style="margin-top: 20px">
        <el-table-column prop="warehouse_name" label="仓库" min-width="120" />
        <el-table-column prop="product_size" label="尺码" min-width="100" />
        <el-table-column label="库存数量" min-width="150">
          <template #default="{ row }">
            <el-input-number
              v-model="row.stock_quantity"
              :min="0"
              :precision="0"
              size="small"
              @change="handleStockQuantityChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="安全库存" min-width="120">
          <template #default="{ row }">
            <el-input-number
              v-model="row.safe_stock_quantity"
              :min="0"
              :precision="0"
              size="small"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="100">
          <template #default="{ $index }">
            <el-button type="danger" size="small" @click="removeBatchEditItem($index)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="batchEditDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleBatchEditSubmit">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 新增批量编辑项弹窗 -->
    <el-dialog v-model="addBatchEditItemDialogVisible" title="新增库存项" width="500px">
      <el-form :model="newBatchEditItem" label-width="100px">
        <el-form-item label="仓库">
          <el-select
            v-model="newBatchEditItem.warehouse_id"
            placeholder="请选择仓库"
            style="width: 100%"
          >
            <el-option v-for="w in warehouseOptions" :key="w.id" :label="w.name" :value="w.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="尺码">
          <el-input v-model="newBatchEditItem.product_size" placeholder="请输入尺码" />
        </el-form-item>
        <el-form-item label="库存数量">
          <el-input-number
            v-model.number="newBatchEditItem.stock_quantity"
            :min="0"
            :precision="0"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addBatchEditItemDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="addBatchEditItem">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 新增库存详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      :title="detailProduct?.product_name || '库存详情'"
      width="600px"
    >
      <div v-if="detailProduct">
        <div style="display: flex; align-items: center; gap: 18px; margin-bottom: 10px">
          <el-image
            v-if="detailProduct.product_image"
            :src="detailProduct.product_image"
            style="
              width: 48px;
              height: 48px;
              border-radius: 8px;
              object-fit: cover;
              background: #f5f7fa;
              box-shadow: 0 2px 8px #0001;
            "
            fit="cover"
          />
          <div>
            <div style="font-weight: bold; font-size: 18px; color: #222">
              {{ detailProduct.product_name }}
            </div>
            <div style="color: #888">SKU: {{ detailProduct.product_sku }}</div>
          </div>
        </div>
        <el-table :data="detailProduct.warehouses" border>
          <el-table-column prop="warehouse_name" label="仓库" min-width="120" />
          <el-table-column label="库存明细">
            <template #default="{ row }">
              <el-table
                :data="row.stocks"
                size="mini"
                border
                style="width: 100%; margin: 0; background: #f9fbfd;"
                class="inner-stock-table"
                :header-cell-style="{ background: '#f5f7fa', color: '#888', fontWeight: 500, fontSize: '13px' }"
              >
                <el-table-column prop="product_size" label="尺码" min-width="60">
                  <template #default="{ row }">
                    <span style="color: #409eff; font-weight: bold;">{{ row.product_size }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="stock_quantity" label="库存" min-width="60">
                  <template #default="{ row }">
                    <span style="color: #222;">{{ row.stock_quantity }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="safe_stock_quantity" label="安全库存" min-width="80">
                  <template #default="{ row }">
                    <span :style="{ color: row.safe_stock_quantity > 0 ? '#f56c6c' : '#bbb' }">
                      {{ row.safe_stock_quantity }}
                    </span>
                  </template>
                </el-table-column>
              </el-table>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Search, Refresh, Plus, Edit, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  addProductWarehouseRecords,
  getProductWarehouseList,
  updateProductWarehouseRecords,
  deleteProductWarehouseRecord,
} from '@/api/warehouse/inventory'
import ProductAutoComplete from '@/components/ProductAutoComplete.vue'
import { getWarehouseList } from '@/api/warehouse/list'

// 定义类型
interface ProductWarehouse {
  warehouse_id: number
  warehouse_name: string
  stocks: Array<{
    id: number
    product_size: string
    stock_quantity: number
  }>
}

interface Product {
  product_id: number
  product_name: string
  product_sku: string
  product_image?: string
  warehouses: ProductWarehouse[]
}

// 搜索表单
const searchForm = reactive({
  product_name: '',
  product_sku: '',
  warehouse_id: undefined as number | undefined,
})

// 表格数据
const tableData = ref<Product[]>([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 仓库选项
const warehouseOptions = ref<{ id: number; name: string }[]>([])

const fetchWarehouses = async () => {
  const res = await getWarehouseList({ page: 1, limit: 1000 })
  // 兼容多种返回结构
  const list =
    (res as unknown as Record<string, unknown>).warehouses ||
    res.data?.warehouses ||
    res.data?.list ||
    []
  warehouseOptions.value = (list as Array<{ warehouse_id: number; warehouse_name: string }>).map(
    (w) => ({
      id: w.warehouse_id,
      name: w.warehouse_name,
    }),
  )
}

// 新增弹窗
const addDialogVisible = ref(false)
const selectedProduct = ref<ProductSearchResult | null>(null)
const productCards = ref<ProductCard[]>([])
const batchSafeStock = ref<number | null>(null)

const handleProductSelect = (prod: ProductSearchResult) => {
  if (!prod) return
  // 已存在则不重复添加
  if (productCards.value.some((card) => card.product.product_id === prod.product_id)) return
  productCards.value.push({
    product: prod,
    details: [{ product_size: '', stock_quantity: 0, warehouse_id: undefined, safe_stock_quantity: 0 }],
    selectedWarehouseId: null,
  })
  selectedProduct.value = null
}

const handleCardWarehouseChange = (cardIdx: number, warehouseId: number | null) => {
  const card = productCards.value[cardIdx]
  if (warehouseId) {
    card.details.forEach((detail) => {
      detail.warehouse_id = warehouseId
    })
  }
}

const addDetailRow = (cardIdx: number) => {
  const card = productCards.value[cardIdx]
  card.details.push({
    product_size: '',
    stock_quantity: 0,
    warehouse_id:
      typeof card.selectedWarehouseId === 'number' ? card.selectedWarehouseId : undefined,
    safe_stock_quantity: 0,
  })
}

const removeDetailRow = (cardIdx: number, idx: number) => {
  productCards.value[cardIdx].details.splice(idx, 1)
}

const removeProductCard = (cardIdx: number) => {
  productCards.value.splice(cardIdx, 1)
}

const handleAddSubmit = async () => {
  // 校验所有卡片明细
  const items = productCards.value.flatMap((card) =>
    card.details.map((detail) => ({
      product_id: card.product.product_id,
      product_size: detail.product_size,
      stock_quantity: detail.stock_quantity,
      warehouse_id: detail.warehouse_id,
      safe_stock_quantity: detail.safe_stock_quantity,
    })),
  )
  if (!items.length) {
    ElMessage.warning('请添加至少一条库存明细')
    return
  }
  // 简单校验
  for (const item of items) {
    if (!item.product_id || !item.product_size || typeof item.warehouse_id !== 'number') {
      ElMessage.warning('请填写完整信息')
      return
    }
  }
  await addProductWarehouseRecords(
    items as Array<{
      product_id: number
      product_size: string
      stock_quantity: number
      warehouse_id: number
      safe_stock_quantity: number
    }>,
  )
  ElMessage.success('新增成功')
  addDialogVisible.value = false
  productCards.value = []
  fetchInventoryList()
}

const fetchInventoryList = async () => {
  loading.value = true
  try {
    const params: Record<string, unknown> = {
      page: currentPage.value,
      limit: pageSize.value,
      product_name: searchForm.product_name || undefined,
      product_sku: searchForm.product_sku || undefined,
      warehouse_id: searchForm.warehouse_id || undefined,
    }
    const res = await getProductWarehouseList(params)
    // 使用类型断言处理接口返回数据
    const responseData = res as unknown as { list: Product[]; pagination?: { total: number } }
    tableData.value = responseData.list || []
    total.value = responseData.pagination?.total || (responseData.list?.length ?? 0)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  fetchInventoryList()
}
const resetSearch = () => {
  searchForm.product_name = ''
  searchForm.product_sku = ''
  searchForm.warehouse_id = undefined
  handleSearch()
}

// 产品卡片结构
interface ProductCard {
  product: ProductSearchResult
  details: Array<{ product_size: string; stock_quantity: number; warehouse_id: number | undefined; safe_stock_quantity: number }>
  selectedWarehouseId?: number | null
}

// 商品搜索结果类型适配
interface ProductSearchResult {
  product_id: number
  product_title: string
  product_sku: string
  product_image?: string
}

// 批量编辑相关
const batchEditDialogVisible = ref(false)
const currentBatchProduct = ref<Product | null>(null)
const batchEditItems = ref<
  Array<{
    id?: number
    product_id: number
    warehouse_id: number
    warehouse_name: string
    product_size: string
    stock_quantity: number
    safe_stock_quantity: number
  }>
>([])

const openBatchEditDialog = (prod: Product) => {
  currentBatchProduct.value = prod
  // 将嵌套的仓库和库存数据扁平化处理，并带上 product_id
  batchEditItems.value = prod.warehouses.flatMap((warehouse) =>
    warehouse.stocks.map((stock) => ({
      id: stock.id,
      product_id: prod.product_id,
      warehouse_id: warehouse.warehouse_id,
      warehouse_name: warehouse.warehouse_name,
      product_size: stock.product_size,
      stock_quantity: stock.stock_quantity,
      safe_stock_quantity: stock.safe_stock_quantity,
    })),
  )
  batchEditDialogVisible.value = true
}

const handleStockQuantityChange = (row: { stock_quantity: number }) => {
  // 可以在这里添加数量变化的验证逻辑
  if (row.stock_quantity < 0) {
    row.stock_quantity = 0
  }
}

const handleBatchEditSubmit = async () => {
  try {
    // 构建更新数据，区分更新和新增的记录
    const updateItems = batchEditItems.value.map((item) => {
      const baseItem = {
        product_id: currentBatchProduct.value?.product_id ?? 0,
        product_size: item.product_size,
        warehouse_id: item.warehouse_id,
        stock_quantity: item.stock_quantity,
        safe_stock_quantity: item.safe_stock_quantity,
      }
      // 如果有id，说明是更新已有记录，需要包含id
      if (item.id) {
        return { ...baseItem, id: item.id }
      }
      // 如果没有id，说明是新增记录，不传id字段
      return baseItem
    })

    // 调用批量更新接口
    await updateProductWarehouseRecords(0, updateItems)
    ElMessage.success('批量更新成功')
    batchEditDialogVisible.value = false
    fetchInventoryList()
  } catch (error) {
    ElMessage.error('批量更新失败')
    console.error('批量更新失败:', error)
  }
}

// 新增批量编辑项弹窗状态
const addBatchEditItemDialogVisible = ref(false)
const newBatchEditItem = reactive<{
  product_id: number
  warehouse_id: number | undefined
  product_size: string
  stock_quantity: number
  safe_stock_quantity: number
}>({
  product_id: 0,
  warehouse_id: undefined,
  product_size: '',
  stock_quantity: 0,
  safe_stock_quantity: 0,
})

function openAddBatchEditItemDialog() {
  if (currentBatchProduct.value) {
    newBatchEditItem.product_id = currentBatchProduct.value.product_id
  } else {
    ElMessage.warning('未选择产品')
    return
  }
  newBatchEditItem.warehouse_id = undefined
  newBatchEditItem.product_size = ''
  newBatchEditItem.stock_quantity = 0
  newBatchEditItem.safe_stock_quantity = 0
  addBatchEditItemDialogVisible.value = true
}

function addBatchEditItem() {
  if (newBatchEditItem.warehouse_id === undefined || !newBatchEditItem.product_size) {
    ElMessage.warning('请填写完整信息')
    return
  }
  const w = warehouseOptions.value.find((w) => w.id === newBatchEditItem.warehouse_id)
  if (w) {
    batchEditItems.value.push({
      product_id: newBatchEditItem.product_id,
      warehouse_id: newBatchEditItem.warehouse_id,
      warehouse_name: w.name,
      product_size: newBatchEditItem.product_size,
      stock_quantity: newBatchEditItem.stock_quantity,
      safe_stock_quantity: newBatchEditItem.safe_stock_quantity,
    })
  }
  addBatchEditItemDialogVisible.value = false
}

function removeBatchEditItem(index: number) {
  batchEditItems.value.splice(index, 1)
}

const handleDeleteProductWarehouse = (product_id: number, product_name: string) => {
  ElMessageBox.confirm(
    `确定要删除产品 " ${product_name} " 的所有库存记录吗？此操作不可恢复！`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    },
  )
    .then(async () => {
      await deleteProductWarehouseRecord(product_id)
      ElMessage.success('删除成功')
      fetchInventoryList()
    })
    .catch(() => {})
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchInventoryList()
}
const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  fetchInventoryList()
}

const detailDialogVisible = ref(false)
const detailProduct = ref<Product | null>(null)
function openDetailDialog(prod: Product) {
  detailProduct.value = prod
  detailDialogVisible.value = true
}

function setAllSafeStock() {
  if (batchSafeStock.value === null || batchSafeStock.value < 0) return
  productCards.value.forEach(card => {
    card.details.forEach(detail => {
      detail.safe_stock_quantity = batchSafeStock.value!
    })
  })
}

onMounted(() => {
  fetchWarehouses()
  fetchInventoryList()
})
</script>

<script lang="ts">
export default {
  name: 'WarehouseInventory',
}
</script>

<style scoped>
.inventory-container {
  border-radius: 12px;
}
.inventory-container-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.title {
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
.batch-row {
  margin-bottom: 10px;
  background: #f8f8f8;
  padding: 10px 0 0 10px;
  border-radius: 6px;
}
.product-search-bar {
  margin-bottom: 18px;
  background: #f6f8fa;
  padding: 12px 18px 6px 18px;
  border-radius: 6px;
}
.product-card-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 10px;
}
.product-card {
  border-radius: 14px;
  box-shadow: 0 4px 24px #0001;
  padding: 0 0 18px 0;
  border: none;
}
.card-header-flex {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 24px 0 24px;
  gap: 16px;
}
.product-info-flex {
  display: flex;
  align-items: center;
  gap: 16px;
}
.product-image-thumb {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: cover;
  background: #f5f7fa;
  box-shadow: 0 2px 8px #0001;
}
.card-actions {
  position: absolute;
  top: 12px;
  right: 16px;
  display: flex;
  gap: 8px;
  z-index: 2;
}
.card-warehouse-select {
  min-width: 180px;
  max-width: 260px;
}
.icon-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f5f7fa;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.18s;
  padding: 0;
}
.icon-btn:hover {
  background: #e6f7ff;
}
.card-delete-btn {
  margin-left: 2px;
}
.card-details-flex {
  padding: 10px 32px 0 32px;
}
.detail-row-group {
  margin-bottom: 12px;
  border-bottom: 1px solid #ececec;
  padding-bottom: 12px;
}
.detail-row-group:last-child {
  border-bottom: none;
  padding-bottom: 0;
}
.detail-row-flex {
  margin-bottom: 8px;
  align-items: center;
}
.form-item-flex {
  margin-bottom: 0 !important;
  display: flex;
  align-items: center;
}
.input-flex {
  width: 100%;
  min-width: 80px;
  height: 36px;
  font-size: 15px;
}
.detail-row-btn-col {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 4px;
}
.detail-row-add-btn {
  margin-right: 2px;
}
.detail-row-delete-btn {
  margin-left: 0;
}
.product-title {
  font-weight: bold;
  font-size: 18px;
  color: #222;
}
.product-sku {
  color: #888;
  font-size: 13px;
}
.inventory-card-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  margin-bottom: 10px;
}
.inventory-product-card {
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
}
.inventory-product-header {
  position: relative;
}
.inventory-product-image {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: cover;
  background: #f5f7fa;
  box-shadow: 0 2px 8px #0001;
}
.inventory-product-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.inventory-product-title {
  font-weight: bold;
  font-size: 18px;
  color: #222;
}
.inventory-product-sku {
  color: #888;
  font-size: 13px;
}
.inventory-warehouse-table {
  margin: 12px 0px;
  border-radius: 8px;
}
.inventory-size-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.inventory-size-item {
  background: #f5f7fa;
  border-radius: 4px;
  padding: 2px 10px;
  font-size: 14px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 4px;
}
.inventory-size-item .size {
  font-weight: bold;
  color: #409eff;
}
.inventory-size-item .qty {
  margin-left: 2px;
  color: #222;
}
.batch-edit-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px 24px 0 24px;
}
.batch-edit-product-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.inner-stock-table {
  margin-top: 6px;
  border-radius: 6px;
  box-shadow: 0 1px 4px #0001;
}
.safe-stock-batch-set {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.custom-dialog-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 0 8px 0;
}
.header-icon {
  width: 44px;
  height: 44px;
  background: #eaf6ff;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.header-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.header-title {
  font-size: 20px;
  font-weight: bold;
  color: #222;
}
.header-desc {
  font-size: 13px;
  color: #888;
}
.header-divider {
  height: 1px;
  background: #f0f2f5;
  margin-bottom: 18px;
}
</style>
