<template>
  <el-card class="customer-analysis">
    <template #header>
      <div class="customer-analysis-title">
        <div class="title">客户分析</div>
        <div class="refresh-controls">
          <el-switch
            v-model="autoRefresh"
            active-text="自动刷新"
            @change="handleAutoRefreshChange"
            :title="
              autoRefresh ? '已开启自动刷新，每30秒刷新一次' : '点击开启自动刷新，每30秒刷新一次'
            "
          />
          <el-button
            type="primary"
            :icon="Refresh"
            circle
            :loading="refreshing"
            @click="handleManualRefresh"
          />
        </div>
      </div>
    </template>

    <div class="customer-analysis-section">
      <div class="section-header">
        <div class="search-form-left">
          <el-form :inline="true" :model="searchForm" class="search-form" @submit.prevent>
            <el-form-item label="客户状态">
              <el-select
                v-model="searchForm.customer_status"
                placeholder="全部"
                clearable
                style="width: 140px"
              >
                <el-option label="潜在客户" value="潜在客户" />
                <el-option label="成交客户" value="成交客户" />
                <el-option label="战略合作" value="战略合作" />
                <el-option label="无效客户" value="无效客户" />
              </el-select>
            </el-form-item>
            <el-form-item label="客户等级">
              <el-select
                v-model="searchForm.customer_level"
                placeholder="全部"
                clearable
                style="width: 140px"
              >
                <el-option label="重要客户" value="重要客户" />
                <el-option label="一般客户" value="一般客户" />
              </el-select>
            </el-form-item>
            <el-form-item label="付款状态">
              <el-select
                v-model="searchForm.payment_status"
                placeholder="全部"
                clearable
                style="width: 140px"
              >
                <el-option label="待付款" value="待付款" />
                <el-option label="已付款部分" value="已付款部分" />
                <el-option label="已结清" value="已结清" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="fetchStats">查询</el-button>
              <el-button @click="resetSearch">重置</el-button>
            </el-form-item>
          </el-form>
        </div>

        <div class="overview-right">
          <div class="overview-item">
            <div class="overview-title">客户总数</div>
            <div class="overview-value">{{ stats?.total ?? '-' }}</div>
          </div>
          <div class="overview-item">
            <div class="overview-title">转化率</div>
            <div class="overview-value">{{ stats?.conversion_rate ?? '-' }}</div>
          </div>
        </div>
      </div>
      <div class="charts-row">
        <div class="chart-block">
          <div class="chart-title">客户状态分布</div>
          <v-chart v-if="statusOption" :option="statusOption" autoresize style="height: 300px" />
          <div v-else class="chart-placeholder">暂无数据</div>
        </div>
        <div class="chart-block">
          <div class="chart-title">客户等级分布</div>
          <v-chart v-if="levelOption" :option="levelOption" autoresize style="height: 300px" />
          <div v-else class="chart-placeholder">暂无数据</div>
        </div>
        <div class="chart-block">
          <div class="chart-title">付款状态分布</div>
          <v-chart v-if="paymentOption" :option="paymentOption" autoresize style="height: 300px" />
          <div v-else class="chart-placeholder">暂无数据</div>
        </div>
      </div>
      <div class="consumption-search-bar" style="margin-bottom: 12px; text-align: right; gap: 8px">
        <el-select
          v-model="consumptionSearchForm.customer_level"
          placeholder="请选择客户等级"
          clearable
          style="width: 160px; margin-right: 10px"
        >
          <el-option label="重要客户" value="重要客户" />
          <el-option label="一般客户" value="一般客户" />
        </el-select>
        <el-button type="primary" @click="handleConsumptionSearch">查询</el-button>
        <el-button @click="resetConsumptionSearch">重置</el-button>
      </div>
      <div class="customer-consumption-ranking">
        <v-chart
          v-if="consumptionBarOption"
          :option="consumptionBarOption"
          autoresize
          style="height: 400px"
        />
        <div v-else class="chart-placeholder">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            <rect x="8" y="20" width="48" height="28" rx="4" fill="#F5F7FA" />
            <rect x="8" y="20" width="48" height="28" rx="4" stroke="#E4E7ED" stroke-width="2" />
            <path d="M8 28H56" stroke="#E4E7ED" stroke-width="2" />
            <rect x="20" y="36" width="8" height="4" rx="2" fill="#E4E7ED" />
            <rect x="36" y="36" width="8" height="4" rx="2" fill="#E4E7ED" />
          </svg>
          <span>暂无数据</span>
        </div>
      </div>
      <div class="customer-sales-performance-ranking">
        <v-chart
          v-if="salesPerformanceOption"
          :option="salesPerformanceOption"
          autoresize
          style="height: 400px"
        />
        <div v-else class="chart-placeholder">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            <rect x="8" y="20" width="48" height="28" rx="4" fill="#F5F7FA" />
            <rect x="8" y="20" width="48" height="28" rx="4" stroke="#E4E7ED" stroke-width="2" />
            <path d="M8 28H56" stroke="#E4E7ED" stroke-width="2" />
            <rect x="20" y="36" width="8" height="4" rx="2" fill="#E4E7ED" />
            <rect x="36" y="36" width="8" height="4" rx="2" fill="#E4E7ED" />
          </svg>
          <span>暂无数据</span>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import {
  getCustomerStats,
  getCustomerConsumptionRanking,
  getCustomerSalesPerformance,
} from '@/api/customer/analysis'
import { use } from 'echarts/core'
import VChart from 'vue-echarts'
import { PieChart, BarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { Refresh } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

use([
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  CanvasRenderer,
  BarChart,
  GridComponent,
])

const searchForm = reactive({
  customer_status: '',
  customer_level: '',
  payment_status: '',
})

const stats = ref<any>(null)
const statusOption = ref<any>(null)
const levelOption = ref<any>(null)
const paymentOption = ref<any>(null)
const consumptionBarOption = ref<any>(null)
const salesPerformanceOption = ref<any>(null)

const consumptionSearchForm = reactive({
  customer_level: '',
})

// 刷新控制相关
const autoRefresh = ref(false)
const refreshing = ref(false)
const refreshInterval = ref<number | null>(null)

const fetchStats = async () => {
  const params: Record<string, string> = {}
  if (searchForm.customer_status) params.customer_status = searchForm.customer_status
  if (searchForm.customer_level) params.customer_level = searchForm.customer_level
  if (searchForm.payment_status) params.payment_status = searchForm.payment_status
  const res = await getCustomerStats(params)
  stats.value = res.data || {}
  // 客户状态分布
  const statusStats = stats.value.status_stats || {}
  const statusData = Object.keys(statusStats).map((k) => ({ name: k, value: statusStats[k] }))
  statusOption.value =
    statusData.length && statusData.some((d) => d.value > 0)
      ? {
          tooltip: { trigger: 'item' },
          legend: { top: 'bottom' },
          series: [
            {
              name: '客户状态',
              type: 'pie',
              radius: '60%',
              data: statusData,
              label: { formatter: '{b}: {c} ({d}%)' },
            },
          ],
          animation: true,
          animationDuration: 800,
          animationEasing: 'cubicOut',
        }
      : null
  // 客户等级分布
  const levelStats = stats.value.level_stats || {}
  const levelData = Object.keys(levelStats).map((k) => ({ name: k, value: levelStats[k] }))
  levelOption.value =
    levelData.length && levelData.some((d) => d.value > 0)
      ? {
          tooltip: { trigger: 'item' },
          legend: { top: 'bottom' },
          series: [
            {
              name: '客户等级',
              type: 'pie',
              radius: '60%',
              data: levelData,
              label: { formatter: '{b}: {c} ({d}%)' },
            },
          ],
          animation: true,
          animationDuration: 800,
          animationEasing: 'cubicOut',
        }
      : null
  // 付款状态分布
  const paymentStats = stats.value.payment_stats || {}
  const paymentData = Object.keys(paymentStats).map((k) => ({ name: k, value: paymentStats[k] }))
  paymentOption.value =
    paymentData.length && paymentData.some((d) => d.value > 0)
      ? {
          tooltip: { trigger: 'item' },
          legend: { top: 'bottom' },
          series: [
            {
              name: '付款状态',
              type: 'pie',
              radius: '60%',
              data: paymentData,
              label: { formatter: '{b}: {c} ({d}%)' },
            },
          ],
          animation: true,
          animationDuration: 800,
          animationEasing: 'cubicOut',
        }
      : null
}

const fetchConsumptionRanking = async () => {
  const params: Record<string, string> = {}
  if (consumptionSearchForm.customer_level)
    params.customer_level = consumptionSearchForm.customer_level
  const res = await getCustomerConsumptionRanking(params)
  const data = res.data?.ranking_list || []
  if (!data.length) {
    consumptionBarOption.value = null
    return
  }

  // 客户名称顺序
  const nameArr = data.map((item: any) => item.customer_name)

  // 客户等级颜色映射
  const levelColorMap: Record<string, string> = {
    重要客户: '#409EFF',
    一般客户: '#67c23a',
  }

  consumptionBarOption.value = {
    title: { text: '客户消费排行榜(Top 20)', left: 'center', top: 10 },
    legend: {
      data: Object.keys(levelColorMap),
      top: 40,
      right: 20,
      orient: 'vertical',
      formatter: (name: string) => name,
    },
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const item = data[params.dataIndex]
        return `
          <div>
            <strong>${item.customer_name}</strong><br/>
            状态：${item.customer_status}<br/>
            级别：${item.customer_level}<br/>
            成交金额：${item.deal_price}$<br/>
            占比：${item.percentage}
          </div>
        `
      },
    },
    grid: { left: 60, right: 100, bottom: 40, top: 70 },
    xAxis: {
      type: 'category',
      data: nameArr,
      name: '客户名称',
      axisLabel: { rotate: 30 },
    },
    yAxis: {
      type: 'value',
      name: '成交金额',
    },
    series: [
      {
        name: '成交金额',
        type: 'bar',
        data: data.map((item: any) => ({
          value: Number(item.deal_price),
          itemStyle: { color: levelColorMap[item.customer_level] || '#409EFF' },
        })),
        label: {
          show: true,
          position: 'top',
          formatter: (params: any) => `${params.value} $ (${data[params.dataIndex].percentage})`,
        },
        barWidth: 40,
      },
    ],
    animation: true,
    animationDuration: 800,
    animationEasing: 'cubicOut',
  }
}

const fetchSalesPerformance = async () => {
  const res = await getCustomerSalesPerformance()
  const data = res.data?.performance_list || []
  if (!data.length) {
    salesPerformanceOption.value = null
    return
  }
  // 按成交金额降序排序
  const sorted = [...data].sort((a, b) => b.total_amount - a.total_amount)
  const nameArr = sorted.map((item) => item.real_name || item.username)
  const amountArr = sorted.map((item) => item.total_amount)
  const customerCountArr = sorted.map((item) => item.customer_count)
  salesPerformanceOption.value = {
    title: { text: '客户销售业绩统计', left: 'center', top: 10 },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        const i = params[0].dataIndex
        return `
          <div>
            <strong>${nameArr[i]}</strong><br/>
            客户总数：${customerCountArr[i]}<br/>
            成交金额：${amountArr[i]} $
          </div>
        `
      },
    },
    grid: { left: 60, right: 80, bottom: 40, top: 70 },
    xAxis: {
      type: 'category',
      data: nameArr,
      name: '创建者',
      axisLabel: { rotate: 30 },
    },
    yAxis: {
      type: 'value',
      name: '成交金额',
    },
    series: [
      {
        name: '成交金额',
        type: 'bar',
        data: amountArr,
        label: {
          show: true,
          position: 'top',
          formatter: (params: any) =>
            `${params.value} $ (客户数: ${customerCountArr[params.dataIndex]})`,
        },
        barWidth: 40,
        itemStyle: { color: '#409EFF' },
      },
    ],
    animation: true,
    animationDuration: 800,
    animationEasing: 'cubicOut',
  }
}

const resetSearch = () => {
  searchForm.customer_status = ''
  searchForm.customer_level = ''
  searchForm.payment_status = ''
  fetchStats()
}

const handleConsumptionSearch = () => {
  fetchConsumptionRanking()
}

const resetConsumptionSearch = () => {
  consumptionSearchForm.customer_level = ''
  fetchConsumptionRanking()
}

// 手动刷新
const handleManualRefresh = async () => {
  if (refreshing.value) return
  refreshing.value = true
  try {
    await Promise.all([fetchStats(), fetchConsumptionRanking(), fetchSalesPerformance()])
    ElMessage.success('刷新成功')
  } catch (error) {
    ElMessage.error('刷新失败')
  } finally {
    refreshing.value = false
  }
}

// 自动刷新开关变化
const handleAutoRefreshChange = (val: boolean) => {
  if (val) {
    // 开启自动刷新，每30秒刷新一次
    refreshInterval.value = window.setInterval(() => {
      handleManualRefresh()
    }, 30000)
    ElMessage.success('已开启自动刷新，每30秒刷新一次')
  } else {
    // 关闭自动刷新
    if (refreshInterval.value) {
      clearInterval(refreshInterval.value)
      refreshInterval.value = null
      ElMessage.info('已关闭自动刷新')
    }
  }
}

// 组件卸载时清除定时器
onUnmounted(() => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
  }
})

onMounted(() => {
  fetchStats()
  fetchConsumptionRanking()
  fetchSalesPerformance()
})
</script>

<style scoped>
.customer-analysis {
  border-radius: 12px;
}

.customer-analysis-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-size: 18px;
  font-weight: 600;
}

.search-form {
  margin: 20px 0 10px 0;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.overview-row {
  display: flex;
  gap: 40px;
  margin-bottom: 20px;
}

.overview-item {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 18px 32px;
  min-width: 160px;
  text-align: center;
}

.overview-title {
  color: #909399;
  font-size: 14px;
  margin-bottom: 8px;
}

.overview-value {
  font-size: 22px;
  font-weight: bold;
  color: #303133;
}

.charts-row {
  display: flex;
  gap: 24px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.chart-block {
  flex: 1 1 320px;
  min-width: 260px;
  max-width: 100%;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.04);
  padding: 18px 10px 10px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 16px;
}

.chart-title {
  font-size: 15px;
  font-weight: 500;
  margin-bottom: 10px;
}

.chart-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 180px;
  color: #bfbfbf;
  font-size: 15px;
  letter-spacing: 1px;
  user-select: none;
  padding: 24px 0 12px 0;
  background: transparent;
}

.chart-placeholder svg {
  margin-bottom: 8px;
  display: block;
  width: 48px;
  height: 48px;
  opacity: 0.85;
  transition: opacity 0.2s;
}

.chart-placeholder:hover svg {
  opacity: 1;
}

.chart-placeholder span {
  color: #a0a0a0;
  font-size: 15px;
  margin-top: 2px;
  font-weight: 400;
  letter-spacing: 1px;
}

.customer-analysis-section {
  margin-bottom: 32px;
}
.section-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  margin-bottom: 18px;
  gap: 16px;
}
.section-title-center {
  flex: 1;
  text-align: center;
  font-size: 20px;
  font-weight: bold;
  color: #222;
}
.search-form-left {
  min-width: 260px;
  flex: 1 1 320px;
}
.overview-right {
  display: flex;
  gap: 24px;
  align-items: center;
  flex-wrap: wrap;
}
.overview-item {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 10px 24px;
  min-width: 100px;
  text-align: center;
}
.overview-title {
  color: #909399;
  font-size: 13px;
  margin-bottom: 4px;
}
.overview-value {
  font-size: 20px;
  font-weight: bold;
  color: #303133;
}
.customer-consumption-ranking {
  margin-top: 32px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.04);
  padding: 18px 10px 10px 10px;
  min-width: 0;
}
.customer-sales-performance-ranking {
  margin-top: 32px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.04);
  padding: 18px 10px 10px 10px;
  min-width: 0;
}
.refresh-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}
.refresh-controls .el-switch {
  margin-right: 8px;
}
</style>
