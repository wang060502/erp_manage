<template>
  <el-card class="product-statistics">
    <div class="product-statistics-title">
      <div class="title">商品分类统计</div>
      <el-button
        type="primary"
        size="small"
        :loading="loading"
        @click="fetchStats"
        circle
        title="刷新"
      >
        <el-icon><Refresh /></el-icon>
      </el-button>
    </div>
    <div class="chart-container">
      <v-chart v-if="option" :option="option" autoresize style="height: 400px" />
      <div v-else class="chart-placeholder">暂无数据</div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getProductCategoryStats } from '@/api/product/list'
import { use } from 'echarts/core'
import VChart from 'vue-echarts'
import { BarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { Refresh } from '@element-plus/icons-vue'

use([BarChart, TitleComponent, TooltipComponent, GridComponent, LegendComponent, CanvasRenderer])

interface ProductCategoryStat {
  category_id: number
  category_name: string
  product_count: number
}

const option = ref<any>(null)
const loading = ref(false)

const fetchStats = async () => {
  loading.value = true
  try {
    const res = await getProductCategoryStats()
    const data: ProductCategoryStat[] = res.data || []
    if (!data.length) {
      option.value = null
      return
    }
    option.value = {
      title: {
        text: '各分类产品数量',
        left: 'center',
        top: 10,
      },
      tooltip: {},
      grid: { left: 40, right: 20, bottom: 40, top: 60 },
      xAxis: {
        type: 'category',
        data: data.map((item) => item.category_name),
        axisLabel: { rotate: 30 },
      },
      yAxis: {
        type: 'value',
        name: '产品数量',
      },
      series: [
        {
          name: '产品数量',
          type: 'bar',
          data: data.map((item) => item.product_count),
          itemStyle: {
            color: '#409EFF',
          },
          barWidth: 60,
          label: {
            show: true,
            position: 'top',
            formatter: '{c}款',
            fontSize: 14,
            color: '#333',
          },
        },
      ],
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchStats()
})
</script>

<style scoped>
.product-statistics {
  border-radius: 12px;
}

.product-statistics-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-size: 18px;
  font-weight: 600;
}

.chart-container {
  margin-top: 30px;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-placeholder {
  color: #909399;
  font-size: 14px;
}
</style>
