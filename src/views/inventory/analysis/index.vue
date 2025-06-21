<template>
  <el-card class="inventory-analysis">
    <template #header>
      <div class="analysis-header-title">
        <div class="title">出入库分析</div>
        <div class="refresh-controls">
          <span class="auto-refresh-label">自动刷新</span>
          <el-switch v-model="isAutoRefreshOn" />
          <el-button type="primary" :icon="Refresh" circle @click="fetchAllStats" />
        </div>
      </div>
    </template>
    <div class="content-inner">
      <div class="kpi-row-wrapper">
        <div class="kpi-side-info">
          <div class="welcome-msg">欢迎使用出入库分析仪表盘!</div>
          <div class="brand-slogan">
            这里为您提供库存调拨与操作的多维度可视化分析，助力企业高效洞察库存动态与业务趋势。
          </div>
          <div class="kpi-guide">
            您可以在右侧查看核心运营指标，下方图表支持多维度交互分析，帮助您发现更多业务机会。
          </div>
        </div>
        <div class="kpi-row">
          <div class="kpi-card">
            <div class="kpi-title">已操作仓库数</div>
            <div class="kpi-value">{{ kpi.totalWarehouses ?? '-' }}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-title">总调拨次数</div>
            <div class="kpi-value">{{ kpi.totalTransfers ?? '-' }}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-title">总操作次数</div>
            <div class="kpi-value">{{ kpi.totalOperations ?? '-' }}</div>
          </div>
        </div>
      </div>

      <el-row :gutter="20">
        <el-col :xs="24" :sm="24" :md="24" :lg="15">
          <div class="chart-wrapper">
            <div class="chart-title">各仓库出入库次数</div>
            <div ref="warehouseChartRef" style="height: 350px;"></div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="24" :md="24" :lg="9">
          <div class="chart-wrapper">
            <div class="chart-title">全系统：各类操作总览</div>
            <div ref="totalOrdersChartRef" style="height: 350px;"></div>
          </div>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :xs="24" :sm="24" :md="24" :lg="15">
          <div class="chart-wrapper">
            <div class="chart-title">热门商品排行 (Top 20)</div>
            <div ref="topProductsChartRef" style="height: 350px;"></div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="24" :md="24" :lg="9">
          <div class="chart-wrapper">
            <div class="chart-title">我的：各类操作总览</div>
            <div ref="myTotalOrdersChartRef" style="height: 350px;"></div>
          </div>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :xs="24" :sm="24" :md="24" :lg="8">
          <div class="chart-wrapper">
            <div class="chart-title">全系统月度调拨趋势</div>
            <div ref="monthlyChartRef" style="height: 350px;"></div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="24" :md="24" :lg="8">
          <div class="chart-wrapper">
            <div class="chart-title">我的月度调拨趋势</div>
            <div ref="myMonthlyChartRef" style="height: 350px;"></div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="24" :md="24" :lg="8">
          <div class="chart-wrapper">
            <div class="chart-title">我的：月度操作趋势</div>
            <div ref="myMonthlyOpsChartRef" style="height: 350px;"></div>
          </div>
        </el-col>
      </el-row>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, watch } from 'vue';
import type { Ref } from 'vue';
import { getInventoryTransferStats } from '@/api/inventory/transfers';
import { getInventoryStatsOperations } from '@/api/inventory/index';
import type { InventoryTransferStatsData, WarehouseTransferStats } from '@/api/inventory/transfers';
import type { InventoryStatsData, TotalOrderStats, MonthlyOrderStats, TopProductStats } from '@/api/inventory/index';
import * as echarts from 'echarts';
import { ElMessage } from 'element-plus';
import { Refresh } from '@element-plus/icons-vue';

defineOptions({ name: 'InventoryAnalysis' });

const colorPalette = ['#5B8FF9', '#61DDAA', '#F6BD16', '#E8684A', '#7262fd', '#78D3F8', '#9A60B4', '#EA7CCC'];

const isAutoRefreshOn = ref(false);
let autoRefreshTimer: ReturnType<typeof setInterval> | null = null;
const REFRESH_INTERVAL = 30000;

const loading = ref(true);
const opStatsLoading = ref(true);

const kpi = reactive<{
  totalWarehouses: number | null;
  totalTransfers: number | null;
  totalOperations: number | null;
}>({
  totalWarehouses: null,
  totalTransfers: null,
  totalOperations: null,
});

const warehouseChartRef = ref<HTMLElement | null>(null);
const monthlyChartRef = ref<HTMLElement | null>(null);
const myMonthlyChartRef = ref<HTMLElement | null>(null);
const totalOrdersChartRef = ref<HTMLElement | null>(null);
const topProductsChartRef = ref<HTMLElement | null>(null);
const myTotalOrdersChartRef = ref<HTMLElement | null>(null);
const myMonthlyOpsChartRef = ref<HTMLElement | null>(null);

let warehouseChart: echarts.ECharts | null = null;
let monthlyChart: echarts.ECharts | null = null;
let myMonthlyChart: echarts.ECharts | null = null;
let topProductsChart: echarts.ECharts | null = null;
let myMonthlyOpsChart: echarts.ECharts | null = null;

const chartManager = (() => {
    const instances: echarts.ECharts[] = [];

    const create = (el: HTMLElement | null): echarts.ECharts | null => {
        if (!el) return null;
        // A mounted component can be re-rendered, so we need to dispose of the old instance
        echarts.getInstanceByDom(el)?.dispose();
        const chart = echarts.init(el);
        instances.push(chart);
        return chart;
    };

    const disposeAll = () => {
        instances.forEach(c => c.dispose());
        instances.length = 0; // Clear the array
    };

    const resizeAll = () => {
        instances.forEach(c => c.resize());
    };

    return { create, disposeAll, resizeAll };
})();

interface TransformedMonthlyStats {
  month: string;
  count: number;
}

const fetchAllStats = () => {
  fetchTransferStats();
  fetchOpStats();
};

const fetchTransferStats = async () => {
  loading.value = true;
  try {
    const res = await getInventoryTransferStats();
    const data = res.data as InventoryTransferStatsData & { totalTransfers: number };
    initTransferCharts(data);
    kpi.totalWarehouses = data.warehouseStats.length;
    kpi.totalTransfers = data.totalTransfers;
  } catch {
    ElMessage.error('获取调拨统计数据失败');
  } finally {
    loading.value = false;
  }
};

const fetchOpStats = async () => {
  opStatsLoading.value = true;
  try {
    const res = await getInventoryStatsOperations();
    const data = res.data as InventoryStatsData & { totalOperations: number };
    initOpCharts(data);
    kpi.totalOperations = data.totalOperations;
  } catch {
    ElMessage.error('获取库存操作统计失败');
  } finally {
    opStatsLoading.value = false;
  }
};

const initTransferCharts = (data: InventoryTransferStatsData) => {
  initWarehouseChart(data.warehouseStats);
  const monthlyData = data.monthlyTransfers.map(item => ({
    month: `${item.year}-${String(item.month).padStart(2, '0')}`,
    count: item.monthly_transfers,
  }));
  initMonthlyChart(monthlyData);
  const myMonthlyData = data.myMonthlyTransfers.map(item => ({
    month: `${item.year}-${String(item.month).padStart(2, '0')}`,
    count: item.my_monthly_transfers,
  }));
  initMyMonthlyChart(myMonthlyData);
};

const initOpCharts = (data: InventoryStatsData) => {
    initTotalOrdersChart(totalOrdersChartRef, data.totalOrders, false);
    initTopProductsChart(data.topProducts);
    if (data.myStats) {
      initTotalOrdersChart(myTotalOrdersChartRef, data.myStats.totalOrders, true);
      initMonthlyOperationsChart(data.myStats.monthlyOrders);
    }
};

const baseChartOption = {
    grid: { left: 20, right: 40, bottom: 40, top: 50, containLabel: true },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    yAxis: { type: 'value', splitLine: { lineStyle: { type: 'dashed', color: '#eee' } } },
};

const initWarehouseChart = (data: WarehouseTransferStats[]) => {
  warehouseChart = chartManager.create(warehouseChartRef.value);
  if (!warehouseChart) return;

  const option = {
    ...baseChartOption,
    legend: { data: ['调出次数', '调入次数'], top: '2%', textStyle: { color: '#666' } },
    xAxis: { type: 'value' },
    yAxis: { type: 'category', data: data.map(item => item.warehouse_name)},
    series: [
      { name: '调出次数', type: 'bar', barWidth: 20, data: data.map(item => item.from_count), itemStyle: { color: colorPalette[3], borderRadius: [0, 8, 8, 0] } },
      { name: '调入次数', type: 'bar', barWidth: 20, data: data.map(item => item.to_count), itemStyle: { color: colorPalette[1], borderRadius: [0, 8, 8, 0] } },
    ],
  };
  warehouseChart.setOption(option);
};

const initMonthlyChart = (data: TransformedMonthlyStats[]) => {
  monthlyChart = chartManager.create(monthlyChartRef.value);
  if (!monthlyChart) return;

  const option = {
    ...baseChartOption,
    xAxis: { type: 'category', data: data.map(item => item.month)},
    series: [{ name: '调拨次数', data: data.map(item => item.count), type: 'bar', itemStyle: { borderRadius: [8, 8, 0, 0], color: colorPalette[0] }}],
  };
  monthlyChart.setOption(option);
};

const initMyMonthlyChart = (data: TransformedMonthlyStats[]) => {
  myMonthlyChart = chartManager.create(myMonthlyChartRef.value);
  if (!myMonthlyChart) return;

  const option = {
    ...baseChartOption,
    xAxis: { type: 'category', data: data.map(item => item.month)},
    series: [{ name: '调拨次数', data: data.map(item => item.count), type: 'bar', itemStyle: { borderRadius: [8, 8, 0, 0], color: colorPalette[2] }}],
  };
  myMonthlyChart.setOption(option);
};

const initTotalOrdersChart = (chartRef: Ref<HTMLElement | null>, data: TotalOrderStats[], isMyStats: boolean) => {
  const chart = chartManager.create(chartRef.value);
  if (!chart) return;

  let option;
  if (isMyStats) {
    option = {
      color: colorPalette,
      tooltip: { trigger: 'item', formatter: '{a} <br/>{b} : {c} ({d}%)' },
      series: [{ name: '操作类型', type: 'pie', radius: ['55%', '75%'], center: ['50%', '50%'], avoidLabelOverlap: false, padAngle: 5, itemStyle: { borderRadius: 8 }, data: data.map(item => ({ value: item.total_orders, name: item.operation_type_cn })) }],
    };
  } else {
    option = {
      ...baseChartOption,
      xAxis: { type: 'category', data: data.map(item => item.operation_type_cn) },
      series: [{ name: '操作次数', type: 'bar', data: data.map((item, index) => ({ value: item.total_orders, itemStyle: { color: colorPalette[index % colorPalette.length], borderRadius: [8, 8, 0, 0] } })) }],
    };
  }
  chart.setOption(option);
};

const initMonthlyOperationsChart = (data: MonthlyOrderStats[]) => {
  myMonthlyOpsChart = chartManager.create(myMonthlyOpsChartRef.value);
  if (!myMonthlyOpsChart) return;

  const transformedData: { [month: string]: { [type: string]: number } } = {};
  const allTypes = new Set<string>();
  const allTypeNames = new Map<string, string>();
  data.forEach(item => {
    const monthKey = `${item.year}-${String(item.month).padStart(2, '0')}`;
    if (!transformedData[monthKey]) transformedData[monthKey] = {};
    transformedData[monthKey][item.operation_type] = item.monthly_orders;
    allTypes.add(item.operation_type);
    if (!allTypeNames.has(item.operation_type)) {
      allTypeNames.set(item.operation_type, item.operation_type_cn);
    }
  });
  const months = Object.keys(transformedData).sort();
  const types = Array.from(allTypes);
  const series = types.map(type => ({ name: allTypeNames.get(type) || type, type: 'bar' as const, stack: 'total', emphasis: { focus: 'series' as const }, data: months.map(month => transformedData[month][type] || 0) }));
  const option = {
    ...baseChartOption,
    color: colorPalette,
    legend: { data: types.map(type => allTypeNames.get(type) || type), type: 'scroll', top: '2%'},
    xAxis: { type: 'category', data: months, boundaryGap: false },
    series: series,
  };
  myMonthlyOpsChart.setOption(option);
};

const initTopProductsChart = (data: TopProductStats[]) => {
  topProductsChart = chartManager.create(topProductsChartRef.value);
  if (!topProductsChart) return;

  const option = {
    ...baseChartOption,
    xAxis: { type: 'value' },
    yAxis: { type: 'category', data: data.map(item => item.product_title).reverse() },
    series: [{ name: '操作次数', type: 'bar', data: data.map(item => item.operation_count).reverse(), itemStyle: { borderRadius: [0, 8, 8, 0], color: colorPalette[0] }}],
  };
  topProductsChart.setOption(option);
};

onMounted(() => {
    fetchAllStats();
    window.addEventListener('resize', chartManager.resizeAll);
});

onUnmounted(() => {
    chartManager.disposeAll();
    window.removeEventListener('resize', chartManager.resizeAll);
    if (autoRefreshTimer) {
      clearInterval(autoRefreshTimer);
    }
});

watch(isAutoRefreshOn, (newValue) => {
  if (newValue) {
    ElMessage.success({ message: '自动刷新已开启 (每30秒)' });
    if (autoRefreshTimer) clearInterval(autoRefreshTimer);
    autoRefreshTimer = setInterval(fetchAllStats, REFRESH_INTERVAL);
  } else {
    if (autoRefreshTimer) {
      clearInterval(autoRefreshTimer);
      autoRefreshTimer = null;
    }
    ElMessage.info({ message: '自动刷新已关闭' });
  }
});
</script>

<style scoped>
.inventory-analysis {
  border-radius: 16px;
  background: #f8fafd;
  box-shadow: 0 2px 16px rgba(90, 120, 200, 0.06);
  padding-bottom: 32px;
}
.analysis-header-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.title {
  font-size: 22px;
  font-weight: 700;
  color: #222;
}
.refresh-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}
.auto-refresh-label {
  font-size: 14px;
  color: #606266;
  margin-right: -8px;
}
.content-inner {
  padding: 0 24px;
}
.kpi-row-wrapper {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 32px;
}
.kpi-row {
  display: flex;
  gap: 24px;
  flex-shrink: 0;
}
.kpi-card {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 24px rgba(90, 120, 200, 0.1);
  padding: 24px 32px;
  min-width: 180px;
  text-align: center;
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
  color: #409eff;
  letter-spacing: 1px;
}
.chart-wrapper {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(90, 120, 200, 0.07);
  padding: 24px 18px 12px 18px;
  margin-bottom: 20px;
}
.chart-title {
  font-size: 17px;
  font-weight: 600;
  color: #222;
  margin-bottom: 18px;
  text-align: left;
}
.kpi-side-info {
  flex: 1 1 320px;
  min-width: 260px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  padding-right: 32px;
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
  color: #409eff;
  font-weight: 500;
  margin-bottom: 6px;
  line-height: 1.7;
}
.kpi-guide {
  font-size: 15px;
  color: #888;
  line-height: 1.7;
}

@media (max-width: 1199px) {
  .kpi-row-wrapper {
    flex-direction: column;
    align-items: stretch;
    gap: 24px;
  }
  .kpi-side-info {
    padding-right: 0;
    text-align: center;
    align-items: center;
  }
  .kpi-row {
    justify-content: center;
    flex-wrap: wrap;
  }
}

@media (max-width: 767px) {
  .content-inner {
    padding: 0 16px;
  }
  .kpi-row {
    flex-direction: column;
    gap: 16px;
  }
  .analysis-header-title {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  .kpi-card {
    min-width: unset;
  }
}
</style>
