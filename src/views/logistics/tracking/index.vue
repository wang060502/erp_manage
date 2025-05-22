<template>
  <div class="logistics-tracking-container">
    <!-- 搜索表单 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="订单编号">
          <el-input v-model="searchForm.orderNo" placeholder="请输入订单编号" clearable />
        </el-form-item>
        <el-form-item label="物流单号">
          <el-input v-model="searchForm.trackingNo" placeholder="请输入物流单号" clearable />
        </el-form-item>
        <el-form-item label="物流公司">
          <el-select v-model="searchForm.carrier" placeholder="请选择物流公司" clearable>
            <el-option label="顺丰速运" value="SF" />
            <el-option label="中通快递" value="ZTO" />
            <el-option label="圆通速递" value="YTO" />
            <el-option label="韵达快递" value="YD" />
            <el-option label="申通快递" value="STO" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 物流信息 -->
    <el-card v-if="trackingInfo" class="tracking-card">
      <template #header>
        <div class="card-header">
          <div class="tracking-header">
            <div class="tracking-info">
              <h3>物流信息</h3>
              <p>订单编号：{{ trackingInfo.orderNo }}</p>
              <p>物流单号：{{ trackingInfo.trackingNo }}</p>
              <p>物流公司：{{ trackingInfo.carrierName }}</p>
            </div>
            <div class="tracking-status">
              <el-tag :type="getStatusType(trackingInfo.status)">
                {{ trackingInfo.status }}
              </el-tag>
            </div>
          </div>
        </div>
      </template>

      <!-- 物流轨迹 -->
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in trackingInfo.activities"
          :key="index"
          :type="getTimelineItemType(index)"
          :timestamp="activity.time"
          :hollow="index !== 0"
        >
          <div class="timeline-content">
            <h4>{{ activity.status }}</h4>
            <p>{{ activity.location }}</p>
            <p v-if="activity.description">{{ activity.description }}</p>
          </div>
        </el-timeline-item>
      </el-timeline>

      <!-- 收货信息 -->
      <div class="delivery-info">
        <el-descriptions title="收货信息" :column="2" border>
          <el-descriptions-item label="收货人">
            {{ trackingInfo.receiver.name }}
          </el-descriptions-item>
          <el-descriptions-item label="联系电话">
            {{ trackingInfo.receiver.phone }}
          </el-descriptions-item>
          <el-descriptions-item label="收货地址" :span="2">
            {{ trackingInfo.receiver.address }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-card>

    <!-- 无数据提示 -->
    <el-empty v-else description="暂无物流信息" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Search, Refresh } from '@element-plus/icons-vue'

// 搜索表单
const searchForm = reactive({
  orderNo: '',
  trackingNo: '',
  carrier: '',
})

// 物流信息
const trackingInfo = ref({
  orderNo: 'ORD202403200001',
  trackingNo: 'SF1234567890',
  carrierName: '顺丰速运',
  status: '运输中',
  activities: [
    {
      time: '2024-03-20 15:30:00',
      status: '已签收',
      location: '广东省深圳市南山区',
      description: '签收人：张三',
    },
    {
      time: '2024-03-20 10:20:00',
      status: '派送中',
      location: '广东省深圳市南山区',
      description: '派送员：李四 电话：13800138000',
    },
    {
      time: '2024-03-20 08:15:00',
      status: '到达派送点',
      location: '广东省深圳市南山区',
    },
    {
      time: '2024-03-19 20:30:00',
      status: '运输中',
      location: '广东省深圳市',
    },
    {
      time: '2024-03-19 15:45:00',
      status: '已揽收',
      location: '广东省广州市',
    },
  ],
  receiver: {
    name: '张三',
    phone: '13800138000',
    address: '广东省深圳市南山区科技园南区8栋101',
  },
})

// 获取状态类型
const getStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    已签收: 'success',
    派送中: 'primary',
    运输中: 'warning',
    已揽收: 'info',
  }
  return statusMap[status] || 'info'
}

// 获取时间线项目类型
const getTimelineItemType = (index: number) => {
  if (index === 0) return 'success'
  if (index === 1) return 'primary'
  if (index === 2) return 'warning'
  return 'info'
}

// 搜索
const handleSearch = () => {
  // TODO: 实现搜索逻辑
  console.log('搜索条件：', searchForm)
}

// 重置
const handleReset = () => {
  searchForm.orderNo = ''
  searchForm.trackingNo = ''
  searchForm.carrier = ''
}
</script>

<style scoped>
.logistics-tracking-container {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.tracking-card {
  margin-bottom: 20px;
}

.card-header {
  padding: 0;
}

.tracking-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.tracking-info h3 {
  margin: 0 0 10px 0;
  font-size: 18px;
}

.tracking-info p {
  margin: 5px 0;
  color: #606266;
}

.timeline-content {
  h4 {
    margin: 0 0 5px 0;
    font-size: 16px;
  }
  p {
    margin: 5px 0;
    color: #606266;
  }
}

.delivery-info {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}
</style>
