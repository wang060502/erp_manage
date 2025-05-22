<template>
  <div class="order-create-container">
    <el-card class="form-card">
      <template #header>
        <div class="card-header">
          <span>创建订单</span>
          <el-button-group>
            <el-button @click="handleCancel">取消</el-button>
            <el-button type="primary" @click="handleSubmit">提交订单</el-button>
          </el-button-group>
        </div>
      </template>

      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" class="order-form">
        <!-- 客户信息 -->
        <el-divider content-position="left">客户信息</el-divider>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="客户" prop="customerId">
              <el-select
                v-model="form.customerId"
                filterable
                remote
                :remote-method="handleCustomerSearch"
                placeholder="请选择客户"
                @change="handleCustomerChange"
              >
                <el-option
                  v-for="item in customerOptions"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="联系人">
              <el-input v-model="form.contactName" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="联系电话">
              <el-input v-model="form.contactPhone" disabled />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 商品信息 -->
        <el-divider content-position="left">商品信息</el-divider>
        <div class="product-list">
          <el-table :data="form.products" border>
            <el-table-column label="商品" min-width="300">
              <template #default="{ row, $index }">
                <el-select
                  v-model="row.productId"
                  filterable
                  remote
                  :remote-method="(query) => handleProductSearch(query, $index)"
                  placeholder="请选择商品"
                  @change="(value) => handleProductChange(value, $index)"
                >
                  <el-option
                    v-for="item in productOptions"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column prop="sku" label="SKU" width="120" />
            <el-table-column label="单价" width="120">
              <template #default="{ row }">
                <el-input-number
                  v-model="row.price"
                  :min="0"
                  :precision="2"
                  :step="0.1"
                  @change="calculateRowTotal(row)"
                />
              </template>
            </el-table-column>
            <el-table-column label="数量" width="120">
              <template #default="{ row }">
                <el-input-number
                  v-model="row.quantity"
                  :min="1"
                  :step="1"
                  @change="calculateRowTotal(row)"
                />
              </template>
            </el-table-column>
            <el-table-column label="小计" width="120">
              <template #default="{ row }"> ¥{{ row.total.toFixed(2) }} </template>
            </el-table-column>
            <el-table-column label="操作" width="80" fixed="right">
              <template #default="{ $index }">
                <el-button type="danger" link @click="handleRemoveProduct($index)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="add-product">
            <el-button type="primary" link @click="handleAddProduct">
              <el-icon><Plus /></el-icon>
              添加商品
            </el-button>
          </div>
        </div>

        <!-- 订单信息 -->
        <el-divider content-position="left">订单信息</el-divider>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="订单类型" prop="type">
              <el-select v-model="form.type" placeholder="请选择订单类型">
                <el-option label="普通订单" value="normal" />
                <el-option label="预售订单" value="presale" />
                <el-option label="定制订单" value="custom" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="支付方式" prop="paymentMethod">
              <el-select v-model="form.paymentMethod" placeholder="请选择支付方式">
                <el-option label="银行转账" value="bank" />
                <el-option label="支付宝" value="alipay" />
                <el-option label="微信支付" value="wechat" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="配送方式" prop="deliveryMethod">
              <el-select v-model="form.deliveryMethod" placeholder="请选择配送方式">
                <el-option label="快递配送" value="express" />
                <el-option label="到店自提" value="self" />
                <el-option label="送货上门" value="delivery" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="收货地址" prop="address">
          <el-input v-model="form.address" type="textarea" :rows="2" placeholder="请输入收货地址" />
        </el-form-item>

        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="请输入订单备注" />
        </el-form-item>

        <!-- 订单金额 -->
        <el-divider content-position="left">订单金额</el-divider>
        <div class="order-amount">
          <div class="amount-item">
            <span>商品总额：</span>
            <span>¥{{ form.totalAmount.toFixed(2) }}</span>
          </div>
          <div class="amount-item">
            <span>运费：</span>
            <span>¥{{ form.freight.toFixed(2) }}</span>
          </div>
          <div class="amount-item">
            <span>优惠金额：</span>
            <span>-¥{{ form.discount.toFixed(2) }}</span>
          </div>
          <div class="amount-item total">
            <span>应付金额：</span>
            <span>¥{{ form.payableAmount.toFixed(2) }}</span>
          </div>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

// 表单数据
const formRef = ref<FormInstance>()
const form = reactive({
  customerId: '',
  contactName: '',
  contactPhone: '',
  products: [] as any[],
  type: 'normal',
  paymentMethod: '',
  deliveryMethod: '',
  address: '',
  remark: '',
  totalAmount: 0,
  freight: 0,
  discount: 0,
  payableAmount: 0,
})

// 表单验证规则
const rules = reactive<FormRules>({
  customerId: [{ required: true, message: '请选择客户', trigger: 'change' }],
  type: [{ required: true, message: '请选择订单类型', trigger: 'change' }],
  paymentMethod: [{ required: true, message: '请选择支付方式', trigger: 'change' }],
  deliveryMethod: [{ required: true, message: '请选择配送方式', trigger: 'change' }],
  address: [{ required: true, message: '请输入收货地址', trigger: 'blur' }],
})

// 客户选项
const customerOptions = ref([
  { id: 1, name: '张三公司', contactName: '张三', contactPhone: '13800138000' },
  { id: 2, name: '李四企业', contactName: '李四', contactPhone: '13800138001' },
])

// 商品选项
const productOptions = ref([
  { id: 1, name: '商品A', sku: 'SKU001', price: 1280.0 },
  { id: 2, name: '商品B', sku: 'SKU002', price: 980.0 },
])

// 搜索客户
const handleCustomerSearch = (query: string) => {
  // TODO: 实现客户搜索逻辑
  console.log('搜索客户：', query)
}

// 选择客户
const handleCustomerChange = (value: number) => {
  const customer = customerOptions.value.find((item) => item.id === value)
  if (customer) {
    form.contactName = customer.contactName
    form.contactPhone = customer.contactPhone
  }
}

// 搜索商品
const handleProductSearch = (query: string, index: number) => {
  // TODO: 实现商品搜索逻辑
  console.log('搜索商品：', query, index)
}

// 选择商品
const handleProductChange = (value: number, index: number) => {
  const product = productOptions.value.find((item) => item.id === value)
  if (product) {
    form.products[index].sku = product.sku
    form.products[index].price = product.price
    calculateRowTotal(form.products[index])
  }
}

// 添加商品
const handleAddProduct = () => {
  form.products.push({
    productId: '',
    sku: '',
    price: 0,
    quantity: 1,
    total: 0,
  })
}

// 删除商品
const handleRemoveProduct = (index: number) => {
  form.products.splice(index, 1)
  calculateTotal()
}

// 计算行小计
const calculateRowTotal = (row: any) => {
  row.total = row.price * row.quantity
  calculateTotal()
}

// 计算订单总额
const calculateTotal = () => {
  form.totalAmount = form.products.reduce((sum, item) => sum + item.total, 0)
  form.payableAmount = form.totalAmount + form.freight - form.discount
}

// 提交订单
const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (valid) {
      // TODO: 实现提交订单逻辑
      ElMessage.success('订单创建成功')
    }
  })
}

// 取消
const handleCancel = () => {
  // TODO: 实现取消逻辑
  ElMessage.info('已取消创建订单')
}
</script>

<style scoped>
.order-create-container {
  padding: 20px;
}

.form-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-form {
  margin-top: 20px;
}

.product-list {
  margin: 20px 0;
}

.add-product {
  margin-top: 10px;
  text-align: center;
}

.order-amount {
  margin-top: 20px;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.amount-item {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
}

.amount-item.total {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #dcdfe6;
  font-size: 18px;
  font-weight: bold;
}

.amount-item span:first-child {
  margin-right: 20px;
}
</style>
