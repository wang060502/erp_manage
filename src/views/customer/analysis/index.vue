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
    <div class="content-inner">
      <div class="kpi-row-wrapper">
        <div class="kpi-side-info">
          <div class="welcome-msg">欢迎使用客户分析仪表盘！</div>
          <div class="brand-slogan">
            这里为您提供客户全生命周期的可视化分析，助力企业高效洞察客户结构与业务趋势。
          </div>
          <div class="kpi-guide">
            <span>
              您可以在右侧查看核心客户指标，快速了解当前客户总数、转化率及成交金额。
            </span>
          </div>
          <div class="kpi-support">
            下方图表支持多维度交互分析，点击图例或柱状可筛选细分数据，帮助您发现更多业务机会。
          </div>
        </div>
        <div class="kpi-row">
          <div class="kpi-card kpi-users">
            <i class="iconfont icon-user"></i>
            <div class="kpi-title">客户总数</div>
            <div class="kpi-value"><span class="kpi-num">{{ stats?.total ?? '-' }}</span></div>
          </div>
          <div class="kpi-card kpi-rate">
            <i class="iconfont icon-percent"></i>
            <div class="kpi-title">转化率</div>
            <div class="kpi-value"><span class="kpi-num">{{ stats?.conversion_rate ?? '-' }}</span></div>
          </div>
          <div class="kpi-card kpi-amount">
            <i class="iconfont icon-money"></i>
            <div class="kpi-title">总成交金额</div>
            <div class="kpi-value"><span class="kpi-unit">$</span><span class="kpi-num">{{ stats?.total_deal_amount ?? '-' }}</span></div>
          </div>
        </div>
      </div>
      <div class="main-chart-card">
        <div class="main-chart-title">客户分布总览</div>
        <v-chart v-if="statusOption" :option="statusOption" autoresize style="height: 340px" />
        <div v-else class="chart-placeholder">暂无数据</div>
      </div>
      <div class="sub-charts-row">
        <div class="sub-chart-card">
          <div class="sub-chart-title">客户消费排行榜</div>
          <v-chart
            v-if="consumptionBarOption"
            :option="consumptionBarOption"
            autoresize
            style="height: 320px"
          />
          <div v-else class="chart-placeholder">暂无数据</div>
        </div>
        <div class="sub-chart-card">
          <div class="sub-chart-title">客户销售业绩统计</div>
          <v-chart
            v-if="salesPerformanceOption"
            :option="salesPerformanceOption"
            autoresize
            style="height: 320px"
          />
          <div v-else class="chart-placeholder">暂无数据</div>
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
import { ElMessage } from 'element-plus'

defineOptions({ name: 'CustomerAnalysis' })

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

const stats = ref<Record<string, unknown> | null>(null)
const statusOption = ref<Record<string, unknown> | null>(null)
const consumptionBarOption = ref<Record<string, unknown> | null>(null)
const salesPerformanceOption = ref<Record<string, unknown> | null>(null)

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
  const statusStats = (stats.value?.status_stats as Record<string, number>) || {}
  const levelStats = (stats.value?.level_stats as Record<string, number>) || {}
  const paymentStats = (stats.value?.payment_stats as Record<string, number>) || {}

  const categories = ['客户状态', '客户等级', '付款状态']

  // 统计所有类型
  const allTypes = [
    ...Object.keys(statusStats),
    ...Object.keys(levelStats),
    ...Object.keys(paymentStats)
  ]

  // 颜色映射（可自定义品牌色系）
  const colorMap: Record<string, string> = {
    '潜在客户': '#5B8FF9',
    '成交客户': '#61DDAA',
    '战略合作': '#65789B',
    '无效客户': '#F6BD16',
    '重要客户': '#7262fd',
    '一般客户': '#78D3F8',
    '待付款': '#F6903D',
    '已付款部分': '#FF99C3',
    '已结清': '#6DC8EC'
  }

  // 构造series
  const series = allTypes.map((type: string) => ({
    name: type,
    type: 'bar',
    stack: null, // 分组，不堆叠
    barWidth: 28,
    itemStyle: {
      borderRadius: [8, 8, 0, 0],
      color: colorMap[type] || '#ccc',
      shadowColor: 'rgba(0,0,0,0.08)',
      shadowBlur: 6
    },
    label: {
      show: true,
      position: 'top',
      color: '#333',
      fontWeight: 600,
      fontSize: 14
    },
    data: [
      statusStats[type] || 0,
      levelStats[type] || 0,
      paymentStats[type] || 0
    ]
  }))

  const option = {
    title: {
      text: '客户分布总览',
      left: 'center',
      top: 16,
      textStyle: {
        fontSize: 20,
        fontWeight: 700,
        color: '#222'
      }
    },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: {
      top: 48,
      icon: 'roundRect',
      itemWidth: 18,
      itemHeight: 10,
      textStyle: { fontSize: 14, color: '#666' }
    },
    grid: { left: 40, right: 40, bottom: 40, top: 90 },
    xAxis: {
      type: 'category',
      data: categories,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { fontSize: 16, color: '#333', fontWeight: 600 }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { type: 'dashed', color: '#eee' } },
      axisLabel: { fontSize: 14, color: '#888' }
    },
    series
  }

  statusOption.value = option
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
    title: { text: '客户消费排行榜', left: 'center', top: 10 },
    grid: { left: 100, right: 40, bottom: 40, top: 60 },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        const item = data[params[0].dataIndex]
        return `${item.customer_name}<br/>成交金额: ${item.deal_price}<br/>占比: ${item.percentage}`
      }
    },
    xAxis: { type: 'value', name: '成交金额' },
    yAxis: {
      type: 'category',
      data: nameArr,
      axisLabel: { fontSize: 14 },
      inverse: true
    },
    series: [{
      type: 'bar',
      data: data.map((d: any) => ({
        value: d.deal_price,
        itemStyle: { color: levelColorMap[d.customer_level] || '#409EFF', borderRadius: [6, 6, 6, 6] },
        label: {
          show: true,
          position: 'right',
          formatter: (p: any) => `${p.value}（${data[p.dataIndex].percentage}）`,
          fontWeight: 600,
          fontSize: 14
        }
      })),
      barWidth: 28
    }]
  }
}

const fetchSalesPerformance = async () => {
  const res = await getCustomerSalesPerformance()
  const data = res.data?.performance_list || []
  if (!data.length) {
    salesPerformanceOption.value = null
    return
  }

  const names = data.map(d => d.real_name)
  const totalAmounts = data.map(d => Number(d.total_amount))
  const customerCounts = data.map(d => d.customer_count)

  salesPerformanceOption.value = {
    title: { text: '客户销售业绩统计', left: 'center', top: 10, textStyle: { fontSize: 18, fontWeight: 700 } },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { top: 40, data: ['成交总金额', '客户总数'] },
    grid: { left: 60, right: 40, bottom: 40, top: 80 },
    xAxis: { type: 'category', data: names, axisLabel: { rotate: 30 } },
    yAxis: { type: 'value', name: '金额/数量' },
    series: [
      {
        name: '成交总金额',
        type: 'bar',
        data: totalAmounts,
        barWidth: 32,
        itemStyle: { color: '#409EFF', borderRadius: [8, 8, 0, 0] },
        label: { show: true, position: 'top', fontWeight: 600 }
      },
      {
        name: '客户总数',
        type: 'bar',
        data: customerCounts,
        barWidth: 32,
        itemStyle: { color: '#67c23a', borderRadius: [8, 8, 0, 0] },
        label: { show: true, position: 'top', fontWeight: 600 }
      }
    ]
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
.refresh-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}
.customer-analysis {
  border-radius: 16px;
  background: #f8fafd;
  box-shadow: 0 2px 16px rgba(90,120,200,0.06);
  padding-bottom: 32px;
}
.customer-analysis-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.title {
  font-size: 22px;
  font-weight: 700;
  color: #222;
}
.content-inner {
  padding: 0 48px;
}
.kpi-row-wrapper {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 32px;
}
.kpi-row {
  display: flex;
  gap: 32px;
  flex-shrink: 0;
}
.kpi-card {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 24px rgba(90,120,200,0.10);
  padding: 28px 44px 22px 44px;
  min-width: 200px;
  text-align: center;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.kpi-card i {
  position: absolute;
  left: 24px;
  top: 18px;
  font-size: 32px;
  color: #e6ecf5;
}
.kpi-title {
  color: #888;
  font-size: 15px;
  margin-bottom: 10px;
  font-weight: 500;
}
.kpi-value {
  font-size: 40px;
  font-weight: 700;
  color: #409EFF;
  letter-spacing: 1px;
  display: flex;
  align-items: baseline;
  justify-content: center;
}
.kpi-num {
  font-size: 40px;
  font-weight: 700;
  color: #409EFF;
}
.kpi-unit {
  font-size: 22px;
  color: #b3c6e0;
  margin-right: 2px;
}
.customer-analysis-section {
  margin-bottom: 32px;
}
.main-chart-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(90,120,200,0.07);
  padding: 24px 18px 12px 18px;
  margin-bottom: 32px;
}
.main-chart-title {
  font-size: 18px;
  font-weight: 600;
  color: #222;
  margin-bottom: 18px;
  text-align: left;
}
.sub-charts-row {
  display: flex;
  gap: 32px;
  margin-top: 0;
}
.sub-chart-card {
  flex: 1 1 0;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(90,120,200,0.07);
  padding: 24px 18px 12px 18px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}
.sub-chart-title {
  font-size: 17px;
  font-weight: 600;
  color: #222;
  margin-bottom: 16px;
  text-align: left;
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
.kpi-side-info {
  flex: 1 1 320px;
  min-width: 260px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  padding-right: 32px;
  color: #888;
  font-size: 15px;
  line-height: 1.8;
  gap: 6px;
}
.welcome-msg {
  font-size: 20px;
  color: #222;
  font-weight: 700;
  margin-bottom: 10px;
  letter-spacing: 1px;
}
.brand-slogan {
  font-size: 16px;
  color: #409EFF;
  font-weight: 500;
  margin-bottom: 6px;
  line-height: 1.7;
}
.kpi-guide, .kpi-support, .kpi-help {
  font-size: 15px;
  color: #888;
  line-height: 1.7;
}
.kpi-logo {
  width: 48px;
  margin-top: 12px;
  opacity: 0.8;
}
@media (max-width: 1200px) {
  .kpi-row, .sub-charts-row {
    flex-direction: column;
    gap: 18px;
  }
  .main-chart-card, .sub-chart-card {
    padding: 18px 8px 8px 8px;
  }
}
</style>
