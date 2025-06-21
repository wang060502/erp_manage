<template>
  <div class="dashboard-page">
    <el-dialog
      v-model="showUnreadDialog"
      title="未读通知提醒"
      width="340px"
      :close-on-click-modal="false"
      :show-close="true"
    >
      <div style="font-size: 16px; color: #e6a23c; text-align: center;">
        您有 <b style="font-size: 22px; color: #f56c6c;">{{ unreadCount }}</b> 条未读通知，请及时处理！
      </div>
      <template #footer>
        <el-button @click="snooze">暂不提醒（1小时）</el-button>
        <el-button type="primary" @click="goToNoticePage">去处理</el-button>
      </template>
    </el-dialog>

    <el-row :gutter="24">
      <!-- Main Content -->
      <el-col :xs="24" :md="17">
        <div class="main-content">
          <div class="dashboard-hero glass-card">
            <div class="hero-text">
              <h1 class="dashboard-hero-title">欢迎使用跨境仓储 ERP 系统</h1>
              <p class="dashboard-hero-desc">高效 · 智能 · 一体化，全面管理商品、库存、客户与订单，赋能企业腾飞出海</p>
            </div>
          </div>

          <div class="my-stats-kpi-section">
            <el-row :gutter="20">
              <el-col :xs="12" :sm="12" :md="6">
                <div class="kpi-card glass-card">
                  <div class="kpi-label">我的客户</div>
                  <div class="kpi-value">{{ myStats.customerCount }}</div>
                </div>
              </el-col>
              <el-col :xs="12" :sm="12" :md="6">
                <div class="kpi-card glass-card">
                  <div class="kpi-label">我的销售订单</div>
                  <div class="kpi-value">{{ myStats.salesOrderCount }}</div>
                </div>
              </el-col>
              <el-col :xs="12" :sm="12" :md="6">
                <div class="kpi-card glass-card">
                  <div class="kpi-label">我的销售额</div>
                  <div class="kpi-value">${{ myStats.totalSalesAmount }}</div>
                </div>
              </el-col>
              <el-col :xs="12" :sm="12" :md="6">
                <div class="kpi-card glass-card">
                  <div class="kpi-label">我的转化率</div>
                  <div class="kpi-value">{{ myStats.conversionRate }}</div>
                </div>
              </el-col>
            </el-row>
          </div>

          <div class="category-stats-section glass-card">
            <h2 class="section-title">商品分类统计</h2>
            <v-chart
              v-if="categoryStatsOption"
              :option="categoryStatsOption"
              autoresize
              style="height: 320px"
            />
            <div v-else class="chart-placeholder">
              <span>{{ categoryStatsLoading ? '正在加载...' : '暂无数据' }}</span>
            </div>
          </div>

          <el-row :gutter="24" style="margin-top: 24px;">
            <el-col :xs="24" :lg="12">
              <div class="glass-card">
                <h2 class="section-title">我的出入库统计</h2>
                <v-chart
                  v-if="inventoryStatsOption"
                  :option="inventoryStatsOption"
                  autoresize
                  style="height: 320px"
                />
                <div v-else class="chart-placeholder">
                  <span>{{ inventoryStatsLoading ? '正在加载...' : '暂无数据' }}</span>
                </div>
              </div>
            </el-col>
            <el-col :xs="24" :lg="12">
              <div class="glass-card">
                <h2 class="section-title">各仓库统计</h2>
                <v-chart
                  v-if="warehouseStatsOption"
                  :option="warehouseStatsOption"
                  autoresize
                  style="height: 320px"
                />
                <div v-else class="chart-placeholder">
                  <span>{{ warehouseStatsLoading ? '正在加载...' : '暂无数据' }}</span>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-col>

      <!-- Side Content -->
      <el-col :xs="24" :md="7">
        <div class="side-content">
           <div class="system-status-card glass-card">
             <h2 class="section-title">系统状态</h2>
             <div class="status-item">
               <span class="status-label">未读通知</span>
               <span class="status-value" :class="{'has-unread': unreadCount > 0}">{{ unreadCount }} 条</span>
             </div>
             <div class="status-item">
               <span class="status-label">产品预警数</span>
               <span class="status-value" :class="{'has-warning': productWarningCount > 0}">{{ productWarningCount }} 个</span>
             </div>
              <div class="status-item">
               <span class="status-label">我的客户</span>
               <span class="status-value has-my-data">{{ myStats.customerCount }} 个</span>
             </div>
              <div class="status-item">
               <span class="status-label">我的销售额</span>
               <span class="status-value has-my-data">${{ myStats.totalSalesAmount }}</span>
             </div>
              <div class="status-item">
               <span class="status-label">当前版本</span>
               <span class="status-value">v1.0.0</span>
             </div>
              <div class="status-item">
               <span class="status-label">服务器状态</span>
               <span class="status-value status-ok">● 正常</span>
             </div>
           </div>
           <div class="quick-menu-section glass-card">
            <h2 class="section-title">快捷菜单</h2>
            <div class="quick-menu-grid">
              <div
                v-for="item in quickMenu"
                :key="item.path"
                class="quick-menu-item"
                @click="goTo(item.path)"
              >
                  <div class="quick-menu-icon" :style="{ color: item.color }">
                    <el-icon><component :is="item.icon" /></el-icon>
                  </div>
                <span class="quick-menu-label">{{ item.title }}</span>
              </div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { getUnreadNotificationCount } from '@/api/notice';
import { useRouter } from 'vue-router';
import {
  Bell,
  Goods,
  Box,
  Warning,
  TopRight,
  Right,
  User,
  DataLine,
  TrendCharts,
} from '@element-plus/icons-vue';
import { use } from 'echarts/core';
import VChart from 'vue-echarts';
import { BarChart, PieChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { getProductCategoryStats } from '@/api/product/list';
import type { EChartsOption } from 'echarts';
import { getProductWarehouseWarningList } from '@/api/warehouse/inventory';
import { getMyCustomerStats } from '@/api/customer/analysis';
import { getMyInventoryStats } from '@/api/inventory';
import { getProductWarehouseStats, type WarehouseStat } from '@/api/warehouse/list';

defineOptions({ name: 'DashboardHome' });

use([
  BarChart,
  PieChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  CanvasRenderer,
]);

const router = useRouter();

const quickMenu = ref([
  { title: '我的通知', path: '/notice/my', icon: Bell, color: '#409EFF' },
  { title: '商品列表', path: '/product/list', icon: Goods, color: '#67C23A' },
  { title: '库存管理', path: '/warehouse/inventory', icon: Box, color: '#E6A23C' },
  { title: '库存预警', path: '/warehouse/warning', icon: Warning, color: '#F56C6C' },
  { title: '我的库存调整', path: '/inventory/myadjust', icon: TopRight, color: '#7262fd' },
  { title: '我的调拨', path: '/inventory/mytransfer', icon: Right, color: '#78D3F8' },
  { title: '客户列表', path: '/customer/list', icon: User, color: '#5B8FF9' },
  { title: '出入库分析', path: '/inventory/analysis', icon: DataLine, color: '#61DDAA' },
  { title: '客户分析', path: '/customer/analysis', icon: TrendCharts, color: '#F6BD16' },
]);

const categoryStatsOption = ref<EChartsOption | null>(null);
const categoryStatsLoading = ref(true);
const inventoryStatsOption = ref<EChartsOption | null>(null);
const inventoryStatsLoading = ref(true);
const warehouseStatsOption = ref<EChartsOption | null>(null);
const warehouseStatsLoading = ref(true);
const productWarningCount = ref(0);
const myStats = reactive({
  customerCount: 0,
  salesOrderCount: 0,
  totalSalesAmount: '0.00',
  conversionRate: '0.00%',
});
const showUnreadDialog = ref(false);
const unreadCount = ref(0);
const SNOOZE_KEY = 'unread_notice_snooze_until';

const snooze = () => {
  showUnreadDialog.value = false;
  const until = Date.now() + 60 * 60 * 1000; // 1小时后
  localStorage.setItem(SNOOZE_KEY, until.toString());
};

interface ProductCategoryStat {
  category_id: number
  category_name: string
  product_count: number
}

const fetchCategoryStats = async () => {
  categoryStatsLoading.value = true;
  try {
    const res = await getProductCategoryStats();
    const data: ProductCategoryStat[] = res.data || [];
    if (!data.length) {
      categoryStatsOption.value = null;
      return;
    }
    categoryStatsOption.value = {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: '3%', right: '4%', bottom: '3%', top: '15%', containLabel: true },
      xAxis: {
        type: 'category',
        data: data.map((item) => item.category_name),
        axisLabel: { color: '#666' },
        axisTick: { show: false },
        axisLine: { lineStyle: { color: '#ddd' } },
      },
      yAxis: {
        type: 'value',
        nameTextStyle: { color: '#666' },
        axisLabel: { color: '#666' },
        splitLine: { lineStyle: { type: 'dashed', color: '#eee' } },
      },
      series: [{
        name: '产品数量',
        type: 'bar',
        data: data.map((item) => item.product_count),
        itemStyle: { color: '#409EFF', borderRadius: [10, 10, 0, 0] },
        barWidth: '40%',
        label: { show: true, position: 'top', formatter: '{c}', fontSize: 12, color: '#333', fontWeight: 500 },
      }],
    };
  } finally {
    categoryStatsLoading.value = false;
  }
};

interface MyInventoryStats {
  inbound_count?: number;
  outbound_count?: number;
  adjustment_count?: number;
  transfer_count?: number;
}

interface WarningResponse {
  pagination?: {
    total: number;
  };
}

const fetchMyInventoryStats = async () => {
  inventoryStatsLoading.value = true;
  try {
    const res = await getMyInventoryStats();
    const statsData = res.data as MyInventoryStats;

    const chartData = [
      { name: '入库', value: statsData?.inbound_count || 0 },
      { name: '出库', value: statsData?.outbound_count || 0 },
      { name: '调整', value: statsData?.adjustment_count || 0 },
      { name: '调拨', value: statsData?.transfer_count || 0 },
    ].filter((item) => item.value > 0);

    if (chartData.length === 0) {
      inventoryStatsOption.value = null;
      return;
    }

    // Sort for better visualization
    chartData.sort((a, b) => a.value - b.value);

    inventoryStatsOption.value = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'value',
        boundaryGap: [0, 0.01],
        splitLine: { lineStyle: { type: 'dashed' } },
      },
      yAxis: {
        type: 'category',
        data: chartData.map((item) => item.name),
      },
      series: [
        {
          name: '操作次数',
          type: 'bar',
          data: chartData.map((item) => item.value),
          itemStyle: {
            borderRadius: [0, 10, 10, 0],
            color: '#409EFF',
          },
          barWidth: '60%',
          label: {
            show: true,
            position: 'right',
          },
        },
      ],
    };
  } catch (error) {
    console.error('Failed to fetch inventory stats:', error);
    inventoryStatsOption.value = null;
  } finally {
    inventoryStatsLoading.value = false;
  }
};

const fetchWarehouseStats = async () => {
  warehouseStatsLoading.value = true;
  try {
    const res = await getProductWarehouseStats();
    const data: WarehouseStat[] = res.data || [];

    if (data.length === 0) {
      warehouseStatsOption.value = null;
      return;
    }

    warehouseStatsOption.value = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      legend: {
        data: ['产品种类数量', '总库存数量'],
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: data.map((item) => item.warehouse_name),
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { type: 'dashed' } },
      },
      series: [
        {
          name: '产品种类数量',
          type: 'bar',
          data: data.map((item) => item.product_count),
          itemStyle: { color: '#5B8FF9', borderRadius: [10, 10, 0, 0] },
          barWidth: '30%',
        },
        {
          name: '总库存数量',
          type: 'bar',
          data: data.map((item) => item.total_stock_quantity),
          itemStyle: { color: '#61DDAA', borderRadius: [10, 10, 0, 0] },
          barWidth: '30%',
        },
      ],
    };
  } catch (error) {
    console.error('Failed to fetch warehouse stats:', error);
    warehouseStatsOption.value = null;
  } finally {
    warehouseStatsLoading.value = false;
  }
};

const fetchProductWarningCount = async () => {
  try {
    const res = (await getProductWarehouseWarningList({
      page: 1,
      limit: 1,
    })) as WarningResponse;
    productWarningCount.value = res.pagination?.total || 0;
  } catch {
    productWarningCount.value = 0;
  }
};

const fetchMyStats = async () => {
  try {
    const res = await getMyCustomerStats();
    if (res.data) {
      myStats.customerCount = res.data.my_customer_count || 0;
      myStats.salesOrderCount = res.data.my_sales_order_count || 0;
      myStats.totalSalesAmount = res.data.my_total_sales_amount || '0.00';
      myStats.conversionRate = res.data.my_conversion_rate || '0.00%';
    }
  } catch {
    //
  }
};

const checkUnreadNotifications = async () => {
  try {
    // Always fetch the count to display in the system status
    const res = await getUnreadNotificationCount();
    const count = res.data?.unread_count ?? 0;
    unreadCount.value = count;

    // Only show the dialog if there are unread notifications AND it's not snoozed
    if (count > 0) {
      const snoozeUntil = parseInt(localStorage.getItem(SNOOZE_KEY) || '0', 10);
      if (snoozeUntil < Date.now()) {
        showUnreadDialog.value = true;
      }
    }
  } catch {
    // 可选：忽略错误或提示
  }
};

const goTo = (path: string) => {
  router.push(path);
};

const goToNoticePage = () => {
  showUnreadDialog.value = false;
  router.push('/notice/my');
};

onMounted(() => {
  checkUnreadNotifications();
  fetchCategoryStats();
  fetchProductWarningCount();
  fetchMyStats();
  fetchMyInventoryStats();
  fetchWarehouseStats();
});
</script>

<style scoped>
.dashboard-page {
  padding: 24px;
  background: #f8fafd;
  min-height: calc(100vh - 100px);
  color: #333;
}

.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #eef0f2;
  transition: all 0.3s ease;
  margin-bottom: 24px;
}

.glass-card:hover {
  border-color: #dcdfe6;
  box-shadow: 0 8px 24px rgba(90, 120, 200, 0.1);
}

.dashboard-hero {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dashboard-hero-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: #222;
}

.dashboard-hero-desc {
  font-size: 16px;
  color: #555;
  margin: 0;
}

.hero-image img {
  width: 150px;
  height: auto;
  opacity: 0.8;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 20px 0;
  color: #333;
  text-align: center;
}

.quick-menu-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(3, 1fr);
}

.quick-menu-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px 8px;
  border-radius: 12px;
  cursor: pointer;
  background: #fff;
  border: 1px solid #eef0f2;
  transition: all 0.2s ease-in-out;
  min-height: 100px;
}

.quick-menu-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 20px rgba(90, 120, 200, 0.12);
}

.quick-menu-icon {
  font-size: 24px;
  margin-bottom: 12px;
}
.quick-menu-icon .el-icon {
  vertical-align: middle;
}

.quick-menu-label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  text-align: center;
}

.system-status-card .status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  font-size: 14px;
  border-bottom: 1px solid #f0f2f5;
}
.system-status-card .status-item:last-child {
  border-bottom: none;
}
.status-label {
  color: #888;
}
.status-value {
  color: #333;
  font-weight: 500;
}
.status-value.has-unread {
  color: #f56c6c;
  font-weight: 700;
}
.status-value.has-warning {
  color: #e6a23c;
  font-weight: 700;
}
.status-value.has-my-data {
  color: #7262fd;
  font-weight: 700;
}
.status-ok {
  color: #67c23a;
}

@media (min-width: 768px) {
  /* No longer need multi-column for quick menu */
}
@media (min-width: 992px) {
  /* No longer need multi-column for quick menu */
}
@media (min-width: 1400px) {
  /* No longer need multi-column for quick menu */
}

@media (max-width: 992px) {
  .main-content, .side-content {
    margin-bottom: 0;
  }
  .hero-image {
    display: none;
  }
}

.chart-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 320px;
  color: #909399;
  font-size: 14px;
}

.kpi-card {
  padding: 20px;
  text-align: center;
}
.kpi-label {
  font-size: 14px;
  color: #555;
  margin-bottom: 12px;
}
.kpi-value {
  font-size: 28px;
  font-weight: 700;
  color: #409eff;
  font-family: 'D-DIN', 'DIN Alternate', 'Helvetica Neue';
}

.side-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.quick-menu-section.glass-card {
  flex-grow: 1;
}
</style>
<style>
/* No longer need dark mode dialog styles */
</style>
