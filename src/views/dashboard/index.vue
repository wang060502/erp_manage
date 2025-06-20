<template>
  <el-card class="dashboard-container">
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
        <el-button type="primary" @click="snooze">暂不提醒（1小时）</el-button>
        <el-button type="primary" @click="goToNoticePage">去处理</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getUnreadNotificationCount } from '@/api/notice';
import { useRouter } from 'vue-router';

const router = useRouter();

const showUnreadDialog = ref(false);
const unreadCount = ref(0);
const SNOOZE_KEY = 'unread_notice_snooze_until';

const snooze = () => {
  showUnreadDialog.value = false;
  const until = Date.now() + 60 * 60 * 1000; // 1小时后
  localStorage.setItem(SNOOZE_KEY, until.toString());
};

const checkUnreadNotifications = async () => {
  try {
    const snoozeUntil = parseInt(localStorage.getItem(SNOOZE_KEY) || '0', 10);
    if (snoozeUntil > Date.now()) return;
    const res = await getUnreadNotificationCount();
    const count = res.data?.unread_count ?? 0;
    if (count > 0) {
      unreadCount.value = count;
      showUnreadDialog.value = true;
    }
  } catch {
    // 可选：忽略错误或提示
  }
};

const goToNoticePage = () => {
  showUnreadDialog.value = false;
  router.push('/notice/my');
};

onMounted(() => {
  checkUnreadNotifications();
});
</script>

<style scoped>
.dashboard-container {
  border-radius: 16px;
  background: #f8fafc;
  min-height: 100vh;
  box-shadow: 0 2px 16px 0 rgba(64,158,255,0.04);
}
.dashboard-hero {
  text-align: center;
  margin-top: 32px;
  margin-bottom: 32px;
}
.dashboard-hero-title {
  font-size: 32px;
  font-weight: 800;
  color: #409EFF;
  letter-spacing: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}
.dashboard-logo {
  font-size: 36px;
}
.dashboard-hero-desc {
  font-size: 18px;
  color: #222;
  margin-top: 8px;
  margin-bottom: 4px;
  font-weight: 600;
}
.dashboard-hero-welcome {
  color: #888;
  font-size: 15px;
  margin-bottom: 0;
}
.dashboard-main-row {
  margin-top: 12px;
}
.intro-card, .guide-card {
  border-radius: 16px;
  min-height: 340px;
  box-shadow: 0 4px 24px 0 rgba(64,158,255,0.08);
  background: linear-gradient(135deg, #fafdff 0%, #f3f8ff 100%);
  border: none;
}
.gradient-card {
  transition: box-shadow 0.3s;
}
.gradient-card:hover {
  box-shadow: 0 8px 32px 0 rgba(64,158,255,0.16);
}
.intro-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
}
.intro-content {
  font-size: 15px;
  color: #444;
  line-height: 1.8;
}
.intro-list {
  margin-top: 12px;
  padding-left: 0;
  list-style: none;
}
.intro-list li {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  font-size: 15px;
}
.el-steps {
  margin-top: 8px;
}
@media (max-width: 900px) {
  .dashboard-main-row {
    flex-direction: column;
  }
  .intro-card, .guide-card {
    min-height: 0;
    margin-bottom: 16px;
  }
  .dashboard-hero-title {
    font-size: 22px;
  }
}
:deep(.el-step__description) {
  color: #595959 !important;
  font-size: 15px;
}
:deep(.el-step__title) {
  color: #222 !important;
  font-weight: 600;
}
</style>
