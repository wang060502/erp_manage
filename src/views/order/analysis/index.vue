<template>
  <div class="order-analysis-container">
    <!-- 数据概览 -->
    <el-row :gutter="20" class="data-overview">
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>订单总数</span>
              <el-tag type="success">较上月 +12%</el-tag>
            </div>
          </template>
          <div class="card-content">
            <div class="number">2,345</div>
            <div class="chart">
              <el-progress :percentage="75" :show-text="false" />
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>本月订单</span>
              <el-tag type="success">较上月 +8%</el-tag>
            </div>
          </template>
          <div class="card-content">
            <div class="number">189</div>
            <div class="chart">
              <el-progress :percentage="60" :show-text="false" type="warning" />
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>订单金额</span>
              <el-tag type="success">较上月 +15%</el-tag>
            </div>
          </template>
          <div class="card-content">
            <div class="number">¥128,560</div>
            <div class="chart">
              <el-progress :percentage="85" :show-text="false" type="success" />
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>客单价</span>
              <el-tag type="success">较上月 +5%</el-tag>
            </div>
          </template>
          <div class="card-content">
            <div class="number">¥680</div>
            <div class="chart">
              <el-progress :percentage="68" :show-text="false" type="info" />
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表分析 -->
    <el-row :gutter="20" class="chart-analysis">
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>订单趋势</span>
              <el-radio-group v-model="trendTimeRange" size="small">
                <el-radio-button label="week">本周</el-radio-button>
                <el-radio-button label="month">本月</el-radio-button>
                <el-radio-button label="year">本年</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div class="chart-container">
            <!-- TODO: 集成 ECharts 图表 -->
            <div class="chart-placeholder">订单趋势图表</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>订单分布</span>
              <el-select v-model="distributionType" size="small">
                <el-option label="按订单类型" value="type" />
                <el-option label="按支付方式" value="payment" />
                <el-option label="按配送方式" value="delivery" />
              </el-select>
            </div>
          </template>
          <div class="chart-container">
            <!-- TODO: 集成 ECharts 图表 -->
            <div class="chart-placeholder">订单分布饼图</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 订单排行 -->
    <el-row :gutter="20" class="order-ranking">
      <el-col :span="12">
        <el-card class="ranking-card">
          <template #header>
            <div class="card-header">
              <span>客户订单排行</span>
              <el-select v-model="customerTimeRange" size="small">
                <el-option label="本月" value="month" />
                <el-option label="本季度" value="quarter" />
                <el-option label="本年" value="year" />
              </el-select>
            </div>
          </template>
          <el-table :data="customerRanking" stripe>
            <el-table-column type="index" label="排名" width="80" />
            <el-table-column prop="name" label="客户名称" min-width="150" />
            <el-table-column prop="count" label="订单数" width="100" />
            <el-table-column prop="amount" label="订单金额" width="120">
              <template #default="{ row }"> ¥{{ row.amount.toLocaleString() }} </template>
            </el-table-column>
            <el-table-column prop="percentage" label="占比" width="100">
              <template #default="{ row }"> {{ row.percentage }}% </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="ranking-card">
          <template #header>
            <div class="card-header">
              <span>商品订单排行</span>
              <el-select v-model="productTimeRange" size="small">
                <el-option label="本月" value="month" />
                <el-option label="本季度" value="quarter" />
                <el-option label="本年" value="year" />
              </el-select>
            </div>
          </template>
          <el-table :data="productRanking" stripe>
            <el-table-column type="index" label="排名" width="80" />
            <el-table-column prop="name" label="商品名称" min-width="150" />
            <el-table-column prop="count" label="销量" width="100" />
            <el-table-column prop="amount" label="销售额" width="120">
              <template #default="{ row }"> ¥{{ row.amount.toLocaleString() }} </template>
            </el-table-column>
            <el-table-column prop="percentage" label="占比" width="100">
              <template #default="{ row }"> {{ row.percentage }}% </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 时间范围选择
const trendTimeRange = ref('month')
const distributionType = ref('type')
const customerTimeRange = ref('month')
const productTimeRange = ref('month')

// 客户订单排行数据
const customerRanking = ref([
  {
    name: '张三公司',
    count: 28,
    amount: 128000,
    percentage: 15.8,
  },
  {
    name: '李四企业',
    count: 25,
    amount: 98000,
    percentage: 12.1,
  },
  {
    name: '王五集团',
    count: 22,
    amount: 85000,
    percentage: 10.5,
  },
  {
    name: '赵六科技',
    count: 20,
    amount: 72000,
    percentage: 8.9,
  },
  {
    name: '钱七贸易',
    count: 18,
    amount: 65000,
    percentage: 8.0,
  },
])

// 商品订单排行数据
const productRanking = ref([
  {
    name: '商品A',
    count: 128,
    amount: 128000,
    percentage: 18.5,
  },
  {
    name: '商品B',
    count: 98,
    amount: 98000,
    percentage: 16.5,
  },
  {
    name: '商品C',
    count: 85,
    amount: 85000,
    percentage: 14.5,
  },
  {
    name: '商品D',
    count: 72,
    amount: 72000,
    percentage: 13.2,
  },
  {
    name: '商品E',
    count: 65,
    amount: 65000,
    percentage: 11.9,
  },
])
</script>

<style scoped>
.order-analysis-container {
  padding: 20px;
}

.data-overview {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-content {
  text-align: center;
}

.card-content .number {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
}

.chart-analysis {
  margin-bottom: 20px;
}

.chart-card {
  height: 400px;
}

.chart-container {
  height: 320px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.chart-placeholder {
  color: #909399;
  font-size: 14px;
}

.order-ranking {
  margin-bottom: 20px;
}

.ranking-card {
  height: 400px;
}

:deep(.el-card__body) {
  height: calc(100% - 55px);
  overflow: auto;
}
</style>
