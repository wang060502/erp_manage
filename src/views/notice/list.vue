<template>
  <el-card class="notice-container">
    <div class="notice-header">
      <div>通知列表</div>
      <el-button type="primary" @click="openCreateDialog">新建通知</el-button>
    </div>
    <div style="margin: 16px 0; display: flex; gap: 12px; flex-wrap: wrap;">
      <el-select v-model="query.type" placeholder="类型" style="width: 120px">
        <el-option label="全部" :value="-1" />
        <el-option label="通知" :value="0" />
        <el-option label="公告" :value="1" />
      </el-select>
      <el-select v-model="query.receiver_scope" placeholder="接收范围" style="width: 120px">
        <el-option label="全部" :value="-1" />
        <el-option label="全员" :value="0" />
        <el-option label="部门" :value="1" />
        <el-option label="指定用户" :value="2" />
      </el-select>
      <el-date-picker
        v-model="query.startDate"
        type="date"
        placeholder="开始日期"
        style="width: 140px"
        value-format="YYYY-MM-DD"
      />
      <el-date-picker
        v-model="query.endDate"
        type="date"
        placeholder="结束日期"
        style="width: 140px"
        value-format="YYYY-MM-DD"
      />
      <el-input v-model="query.keyword" placeholder="关键词" style="width: 200px" clearable />
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
      <el-table-column prop="receiver_scope" label="接收范围" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.receiver_scope === 0 ? 'success' : scope.row.receiver_scope === 1 ? 'warning' : 'info'">
            {{ scope.row.receiver_scope === 0 ? '全员' : scope.row.receiver_scope === 1 ? '部门' : '指定用户' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="target_details" label="接收对象" width="150" />
      <el-table-column prop="created_at" label="创建时间" width="100">
        <template #default="scope">
          {{ dayjs(scope.row.created_at).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
      </el-table-column>
      <el-table-column prop="creator_name" label="创建人" width="100" />
      <el-table-column prop="read_count" label="阅读量" width="100" />
      <el-table-column prop="total_receivers" label="总接收人数" width="100" />

      <el-table-column label="操作" width="180">
        <template #default="scope">
          <el-button size="small" @click="viewDetail(scope.row.id)">详情</el-button>
          <el-button size="small" type="danger" @click="handleDelete(scope.row.id)">删除</el-button>
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
            <span class="meta-label">接收对象</span>
            <span class="meta-value">{{ detail.target_details }}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">创建人</span>
            <span class="meta-value">{{ detail.creator_name }}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">阅读量</span>
            <span class="meta-value">{{ detail.is_read ?? '-' }}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">接收范围</span>
            <span :class="['meta-value',
              detail.receiver_scope === 0 ? 'scope-all' :
              detail.receiver_scope === 1 ? 'scope-dept' : 'scope-user']">
              {{ detail.receiver_scope === 0 ? '全员' : detail.receiver_scope === 1 ? '部门' : '指定用户' }}
            </span>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="showDetail = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 新建通知弹窗 -->
    <el-dialog v-model="showCreate" title="新建通知/公告" width="400px" :before-close="handleCreateDialogClose">
      <el-form :model="createForm" label-width="80px">
        <el-form-item label="标题">
          <el-input v-model="createForm.title" />
        </el-form-item>
        <el-form-item label="内容">
          <el-input v-model="createForm.content" type="textarea" />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="createForm.type" style="width: 100%">
            <el-option label="通知" :value="0" />
            <el-option label="公告" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="接收范围">
          <el-select v-model="createForm.receiver_scope" style="width: 100%">
            <el-option label="全员" :value="0" />
            <el-option label="部门" :value="1" />
            <el-option label="指定用户" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="createForm.receiver_scope === 1" label="选择部门">
          <el-tree-select
            v-model="selectedDepartments"
            :data="departments"
            multiple
            check-strictly
            node-key="dept_id"
            :props="{ label: 'dept_name', value: 'dept_id', children: 'children' }"
            placeholder="请选择部门"
            style="width: 100%"
            clearable
          />
        </el-form-item>
        <el-form-item v-if="createForm.receiver_scope === 2" label="选择用户">
          <el-select
            v-model="selectedUsers"
            multiple
            placeholder="请选择用户"
            style="width: 100%"
            clearable
          >
            <el-option
              v-for="user in users"
              :key="user.user_id"
              :label="user.real_name"
              :value="user.user_id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleCreateDialogClose">取消</el-button>
        <el-button type="primary" @click="handleCreate">提交</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import dayjs from 'dayjs';
import {
  getNotificationList,
  getNotificationDetail,
  createNotification,
  deleteNotification
} from '@/api/notice';
import { getDepartmentTree, type DepartmentTreeItem } from '@/api/system/department';
import { getUserList } from '@/api/system/user';

interface NoticeItem {
  id: number;
  title: string;
  content: string;
  type: number;
  created_at: string;
  creator_name: string;
  read_count: number;
  total_receivers: number;
  receiver_scope: number;
  target_details: string;
}

interface NoticeListParams {
  page?: number;
  pageSize?: number;
  type?: number;
  receiver_scope?: number;
  keyword?: string;
  startDate?: string;
  endDate?: string;
}

const loading = ref(false);
const list = ref<NoticeItem[]>([]);
const total = ref(0);
const query = reactive({
  page: 1,
  pageSize: 10,
  type: -1,
  receiver_scope: -1,
  keyword: '',
  startDate: '',
  endDate: ''
});

const showDetail = ref(false);
const detail = ref<NoticeItem | null>(null);
const showCreate = ref(false);
const createForm = reactive({
  title: '',
  content: '',
  type: 0,
  receiver_scope: 0
});

const departments = ref<DepartmentTreeItem[]>([]);
const selectedDepartments = ref<number[]>([]);
const users = ref([]);
const selectedUsers = ref([]);

const fetchList = async () => {
  loading.value = true;
  try {
    const params: NoticeListParams = {
      page: query.page,
      pageSize: query.pageSize
    };
    if (query.type !== -1) params.type = query.type;
    if (query.receiver_scope !== -1) params.receiver_scope = query.receiver_scope;
    if (query.keyword) params.keyword = query.keyword;
    if (query.startDate) params.startDate = query.startDate;
    if (query.endDate) params.endDate = query.endDate;
    const res = await getNotificationList(params);
    list.value = res.data.list || [];
    total.value = res.data.total || 0;
  } catch {
    ElMessage.error('获取通知列表失败');
  } finally {
    loading.value = false;
  }
};

const viewDetail = async (id: number) => {
  try {
    const res = await getNotificationDetail(id);
    detail.value = res.data;
    showDetail.value = true;
  } catch {
    ElMessage.error('获取详情失败');
  }
};

const handleDelete = (id: number) => {
  ElMessageBox.confirm('确定要删除该通知吗？', '提示', { type: 'warning' })
    .then(async () => {
      await deleteNotification(id);
      ElMessage.success('删除成功');
      fetchList();
    });
};

const openCreateDialog = async () => {
  showCreate.value = true;
  if (createForm.receiver_scope === 1 && departments.value.length === 0) {
    await fetchDepartments();
  }
};

const fetchDepartments = async () => {
  try {
    const res = await getDepartmentTree();
    departments.value = res.depts || [];
  } catch {
    ElMessage.error('获取部门树失败');
  }
};

const fetchUsers = async () => {
  try {
    const res = await getUserList({});
    users.value = res.users || [];
  } catch {
    ElMessage.error('获取用户列表失败');
  }
};

watch(
  () => createForm.receiver_scope,
  async (val) => {
    if (val === 1 && departments.value.length === 0) {
      await fetchDepartments();
    }
    if (val === 2 && users.value.length === 0) {
      await fetchUsers();
    }
    if (val !== 1 && val !== 2) {
      selectedDepartments.value = [];
      selectedUsers.value = [];
    }
  }
);

const handleCreateDialogClose = () => {
  showCreate.value = false;
  // 重置表单和部门选择
  createForm.title = '';
  createForm.content = '';
  createForm.type = 0;
  createForm.receiver_scope = 0;
  selectedDepartments.value = [];
  selectedUsers.value = [];
};

const handleCreate = async () => {
  if (!createForm.title || !createForm.content) {
    ElMessage.warning('请填写标题和内容');
    return;
  }
  let targets;
  if (createForm.receiver_scope === 1) {
    if (!selectedDepartments.value.length) {
      ElMessage.warning('请选择部门');
      return;
    }
    targets = selectedDepartments.value.map(id => ({ type: 1, id }));
  } else if (createForm.receiver_scope === 2) {
    if (!selectedUsers.value.length) {
      ElMessage.warning('请选择用户');
      return;
    }
    targets = selectedUsers.value.map(id => ({ type: 2, id }));
  }
  try {
    const res = await createNotification({
      ...createForm,
      ...(targets ? { targets } : {})
    });
    if (res.code === 200) {
      ElMessage.success('创建成功');
      handleCreateDialogClose();
      fetchList();
    } else {
      ElMessage.error('创建失败');
    }
  } catch {
    ElMessage.error('创建失败');
  }
};

const resetQuery = () => {
  query.type = -1;
  query.receiver_scope = -1;
  query.keyword = '';
  query.startDate = '';
  query.endDate = '';
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
.scope-all {
  color: #67c23a;
  background: #e8f5e9;
}
.scope-dept {
  color: #e6a23c;
  background: #fff7e6;
}
.scope-user {
  color: #409eff;
  background: #eaf4ff;
}
</style>
