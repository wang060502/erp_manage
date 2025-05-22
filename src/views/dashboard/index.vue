<template>
  <div class="dashboard-container">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card shadow="hover" class="data-card">
          <template #header>
            <div class="card-header">
              <span>总销售额</span>
              <el-tag size="small" type="success">+12.5%</el-tag>
            </div>
          </template>
          <div class="card-value">¥ 128,930</div>
          <div class="card-footer">
            <span>日同比</span>
            <span class="up">+12.5%</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="data-card">
          <template #header>
            <div class="card-header">
              <span>订单量</span>
              <el-tag size="small" type="success">+8.2%</el-tag>
            </div>
          </template>
          <div class="card-value">1,234</div>
          <div class="card-footer">
            <span>日同比</span>
            <span class="up">+8.2%</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="data-card">
          <template #header>
            <div class="card-header">
              <span>库存量</span>
              <el-tag size="small" type="warning">-2.1%</el-tag>
            </div>
          </template>
          <div class="card-value">8,562</div>
          <div class="card-footer">
            <span>日同比</span>
            <span class="down">-2.1%</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="data-card">
          <template #header>
            <div class="card-header">
              <span>客户数</span>
              <el-tag size="small" type="success">+5.6%</el-tag>
            </div>
          </template>
          <div class="card-value">3,456</div>
          <div class="card-footer">
            <span>日同比</span>
            <span class="up">+5.6%</span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-20">
      <el-col :span="16">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>销售趋势</span>
              <el-radio-group v-model="salesType" size="small">
                <el-radio-button label="amount">销售额</el-radio-button>
                <el-radio-button label="count">订单量</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div class="chart-container">
            <!-- 这里将添加销售趋势图表 -->
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>库存预警</span>
            </div>
          </template>
          <el-table :data="stockWarnings" style="width: 100%" size="small">
            <el-table-column prop="name" label="商品名称" />
            <el-table-column prop="stock" label="库存" width="80" />
            <el-table-column prop="status" label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="row.status === '紧急' ? 'danger' : 'warning'" size="small">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const salesType = ref('amount')

// 模拟库存预警数据
const stockWarnings = [
  { name: 'iPhone 15 Pro', stock: 5, status: '紧急' },
  { name: 'MacBook Pro', stock: 8, status: '警告' },
  { name: 'AirPods Pro', stock: 10, status: '警告' },
]
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.mt-20 {
  margin-top: 20px;
}

.data-card {
  height: 160px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin: 10px 0;
}

.card-footer {
  font-size: 14px;
  color: #909399;
}

.up {
  color: #67c23a;
}

.down {
  color: #f56c6c;
}

.chart-container {
  height: 400px;
}
</style>
