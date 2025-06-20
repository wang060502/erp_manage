<template>
 <el-card class="notice-container">
  <div class="notice-header">
    <div>我的通知</div>
  </div>
  <div style="margin: 16px 0; display: flex; gap: 12px; flex-wrap: wrap;">
    <el-select v-model="query.type" placeholder="类型" style="width: 120px">
      <el-option label="全部" :value="-1" />
      <el-option label="通知" :value="0" />
      <el-option label="公告" :value="1" />
    </el-select>
    <el-button @click="fetchList" type="primary">查询</el-button>
    <el-button @click="resetQuery" type="default">重置</el-button>
  </div>
  <el-table :data="list" v-loading="loading" style="width: 100%; margin-bottom: 16px;">
    <el-table-column prop="id" label="ID" width="60" />
    <el-table-column prop="title" label="标题" />
    <el-table-column prop="type" label="类型" width="80">
      <template #default="scope">
        <el-tag :type="scope.row.type === 0 ? 'info' : 'success'">
          {{ scope.row.type === 0 ? '通知' : '公告' }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column prop="created_at" label="创建时间" width="140">
      <template #default="scope">
        {{ dayjs(scope.row.created_at).format('YYYY-MM-DD HH:mm:ss') }}
      </template>
    </el-table-column>
    <el-table-column prop="is_read" label="状态" width="80">
      <template #default="scope">
        <el-tag :type="scope.row.is_read ? 'success' : 'info'">
          {{ scope.row.is_read ? '已读' : '未读' }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column label="操作" width="120">
      <template #default="scope">
        <el-button size="small" @click="viewDetail(scope.row)">详情</el-button>
      </template>
    </el-table-column>
  </el-table>
  <el-pagination
    v-model:current-page="query.page"
    v-model:page-size="query.pageSize"
    :total="total"
    layout="total, prev, pager, next, sizes"
    @current-change="fetchList"
    @size-change="fetchList"
    style="text-align: right;"
  />

  <!-- 详情弹窗 -->
  <el-dialog v-model="showDetail" title="通知详情" width="420px" :before-close="() => showDetail = false">
    <div v-if="detail" class="notice-detail-custom">
      <div class="notice-detail-title">{{ detail.title }}</div>
      <div class="notice-detail-content">{{ detail.content }}</div>
      <div class="notice-detail-meta">
        <div class="meta-row">
          <span class="meta-label">类型</span>
          <span :class="['meta-value', detail.type === 0 ? 'type-notice' : 'type-announcement']">
            {{ detail.type === 0 ? '通知' : '公告' }}
          </span>
        </div>
        <div class="meta-row">
          <span class="meta-label">创建时间</span>
          <span class="meta-value">{{ dayjs(detail.created_at).format('YYYY-MM-DD HH:mm:ss') }}</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">内容</span>
          <span class="meta-value">{{ detail.content }}</span>
        </div>
      </div>
    </div>
    <template #footer>
      <el-button @click="showDetail = false">关闭</el-button>
    </template>
  </el-dialog>
 </el-card>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import dayjs from 'dayjs';
import { getUserNotificationList, getNotificationDetail, markNotificationAsRead } from '@/api/notice';

interface MyNoticeItem {
  id: number;
  title: string;
  content: string;
  type: number;
  created_at: string;
  is_read: boolean;
}

const loading = ref(false);
const list = ref<MyNoticeItem[]>([]);
const total = ref(0);
const query = reactive({
  page: 1,
  pageSize: 10,
  type: -1
});

const showDetail = ref(false);
const detail = ref<MyNoticeItem | null>(null);

const fetchList = async () => {
  loading.value = true;
  try {
    const params: any = {
      page: query.page,
      pageSize: query.pageSize
    };
    if (query.type !== -1) params.type = query.type;
    const res = await getUserNotificationList(params);
    list.value = res.data.list || [];
    total.value = res.data.total || 0;
  } catch {
    ElMessage.error('获取通知列表失败');
  } finally {
    loading.value = false;
  }
};

const viewDetail = async (row: MyNoticeItem) => {
  try {
    const res = await getNotificationDetail(row.id);
    detail.value = res.data;
    showDetail.value = true;
    if (!row.is_read) {
      await markNotificationAsRead(row.id);
      row.is_read = true;
    }
  } catch {
    ElMessage.error('获取详情失败');
  }
};

const resetQuery = () => {
  query.type = -1;
  fetchList();
};

onMounted(fetchList);
</script>

<style scoped>
.notice-container {
  border-radius: 12px;
}

.notice-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notice-header div {
  font-size: 18px;
  font-weight: bold;
}
.notice-detail-custom {
  padding: 8px 0 0 0;
  color: #222;
  font-size: 15px;
}
.notice-detail-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 8px;
  color: #222;
  letter-spacing: 1px;
}
.notice-detail-content {
  background: #f7f9fa;
  border-radius: 6px;
  padding: 12px 14px;
  margin-bottom: 18px;
  color: #444;
  font-size: 15px;
  line-height: 1.7;
  word-break: break-all;
}
.notice-detail-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.meta-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 2px 0;
}
.meta-label {
  min-width: 70px;
  color: #888;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 1px;
}
.meta-value {
  color: #222;
  padding: 2px 10px;
  border-radius: 4px;
}
.type-notice {
  color: #409eff;
  background: #eaf4ff;
}
.type-announcement {
  color: #67c23a;
  background: #e8f5e9;
}
</style>

