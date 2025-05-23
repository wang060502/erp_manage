<template>
  <div class="user-profile-bg">
    <el-card class="welcome-card-pro" shadow="hover" v-if="user">
      <div class="welcome-section">
        <div class="welcome-title">欢迎回来，{{ user.real_name || user.username }}！</div>
        <div class="welcome-desc">祝您工作愉快，开启高效的一天。</div>
      </div>
    </el-card>
    <div class="user-main-layout">
      <div class="user-left">
        <div class="weather-card-pro" v-if="weather">
          <div class="weather-header">
            <svg class="weather-icon" viewBox="0 0 48 48" width="48" height="48">
              <defs>
                <linearGradient id="sunny" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#fbbf24" />
                  <stop offset="100%" stop-color="#f59e42" />
                </linearGradient>
              </defs>
              <circle cx="24" cy="24" r="14" fill="url(#sunny)" />
            </svg>
            <div class="weather-city-pro">{{ weather.city }}</div>
          </div>
          <div class="weather-main-pro">
            <div class="weather-temp-main">
              {{ weather.data.low }}<span>~</span>{{ weather.data.high }}
            </div>
            <div class="weather-type-pro">{{ weather.data.type }}</div>
            <div class="weather-date-pro">{{ weather.data.date }} {{ weather.data.week }}</div>
            <div class="weather-air-pro">
              空气质量：<span :class="['aqi-tag', 'aqi-' + weather.air.aqi_level]">{{
                weather.air.aqi_name
              }}</span>
              <span class="aqi-value">({{ weather.air.aqi }})</span>
            </div>
            <div class="weather-wind-pro">
              {{ weather.data.fengxiang }} {{ weather.data.fengli }}
            </div>
          </div>
          <div class="weather-tip-pro" v-if="weather.tip && weather.tip !== '-'">
            {{ weather.tip }}
          </div>
        </div>
        <div class="profile-card-pro glassy" v-if="user">
          <div class="profile-banner-pro"></div>
          <div class="profile-header-pro">
            <div class="avatar-ring-pro">
              <div class="avatar-glow"></div>
              <img v-if="user.avatar" :src="user.avatar" class="avatar-pro" alt="头像" />
              <div v-else class="avatar-pro avatar-text">{{ user.real_name ? user.real_name.charAt(0) : user.username.charAt(0) }}</div>
            </div>
            <div class="profile-main-pro">
              <div class="profile-name-pro">{{ user.real_name || user.username }}</div>
              <div class="profile-username-pro">用户名：{{ user.username }}</div>
            </div>
          </div>
          <div class="profile-info-pro">
            <div class="info-group">
              <div class="group-title">联系方式</div>
              <div class="info-row-pro"><span>邮箱</span>{{ user.email || '未填写' }}</div>
              <div class="info-row-pro"><span>手机号</span>{{ user.mobile || '未填写' }}</div>
              <div class="info-row-pro"><span>部门</span>{{ user.dept_name || '未填写' }}</div>
            </div>
            <div class="divider"></div>
            <div class="info-group">
              <div class="group-title">账号信息</div>
              <div class="info-row-pro">
                <span>状态</span>
                <el-tag :type="user.status === 1 ? 'success' : 'info'" size="small">
                  {{ user.status === 1 ? '启用' : '禁用' }}
                </el-tag>
              </div>
              <div class="info-row-pro"><span>注册时间</span>{{ formatTime(user.create_time) }}</div>
              <div class="info-row-pro">
                <span>最后登录</span>{{ formatTime(user.last_login_time) }}
              </div>
            </div>
            <div class="divider"></div>
            <div class="info-group">
              <div class="group-title">角色</div>
              <div class="info-row-pro">
                <span>角色</span>
                <el-tag
                  v-for="role in user.roles"
                  :key="role.role_id"
                  type="primary"
                  class="role-tag-pro"
                  size="small"
                  effect="dark"
                >
                  {{ role.role_name }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>
        <el-empty v-else description="暂无用户信息" />
      </div>
      <div class="user-right">
        <el-tabs :activeName="activeTab" class="user-tabs-underline">
          <el-tab-pane label="修改个人信息" name="0">
            <div class="tab-pane-anim tab-pane-card">
              <div class="tab-title">
                <el-icon><User /></el-icon>
                修改个人信息
              </div>
              <div class="tab-desc">请完善您的个人信息，便于账号安全和联系。</div>
              <el-divider />
              <el-form label-width="90px" class="edit-form form-card">
                <el-form-item label="真实姓名">
                  <el-input placeholder="请输入真实姓名" clearable />
                </el-form-item>
                <el-form-item label="邮箱">
                  <el-input placeholder="请输入邮箱" clearable />
                </el-form-item>
                <el-form-item label="手机号">
                  <el-input placeholder="请输入手机号" clearable />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" size="large" style="width: 100%">保存修改</el-button>
                </el-form-item>
              </el-form>
            </div>
          </el-tab-pane>
          <el-tab-pane label="修改密码" name="1">
            <div class="tab-pane-anim tab-pane-card">
              <div class="tab-title">
                <el-icon><Lock /></el-icon>
                修改密码
              </div>
              <div class="tab-desc">建议定期修改密码，保障账号安全。</div>
              <el-divider />
              <el-form label-width="90px" class="edit-form form-card">
                <el-form-item label="原密码">
                  <el-input type="password" placeholder="请输入原密码" clearable />
                </el-form-item>
                <el-form-item label="新密码">
                  <el-input type="password" placeholder="请输入新密码" clearable />
                </el-form-item>
                <el-form-item label="确认新密码">
                  <el-input type="password" placeholder="请再次输入新密码" clearable />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" size="large" style="width: 100%">修改密码</el-button>
                </el-form-item>
              </el-form>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getUserProfile } from '@/api/login/userinfo'
import { User, Lock } from '@element-plus/icons-vue'

const user = ref<any>(null)
const weather = ref<any>(null)
const defaultAvatar =
  'https://cdn.jsdelivr.net/gh/baimingxuan/media-host@master/img/avatar-default.png'

// Tabs默认选中第一个
const activeTab = ref('0')

function formatTime(time: string) {
  if (!time) return '未填写'
  return new Date(time).toLocaleString()
}

onMounted(async () => {
  // 获取用户信息
  try {
    const res = await getUserProfile()
    const data = res.data || res
    if (data.code === 200) {
      user.value = data
    } else {
      ElMessage.error(data.message || '获取用户信息失败')
    }
  } catch (e: unknown) {
    ElMessage.error((e as Error)?.message || '获取用户信息失败')
  }
  // 获取天气信息
  try {
    const resp = await fetch('https://api.vvhan.com/api/weather?mode=light')
    const w = await resp.json()
    if (w.success) {
      weather.value = w
    }
  } catch {}
})
</script>

<style scoped>
.user-profile-bg {
  min-height: 100vh;
  background: #f3f4f6;
  display: flex;
  flex-direction: column;
}
.welcome-card-pro {
  margin-bottom: 32px;
  border-radius: 20px;
  box-shadow: 0 8px 32px 0 rgba(59, 130, 246, 0.1);
  background: #fff;
  padding: 0;
  border: none;
}
.welcome-section {
  width: 100%;
  padding: 32px 0 18px 0;
  text-align: left;
}
.welcome-title {
  font-size: 2.1rem;
  font-weight: bold;
  color: #2563eb;
  margin-bottom: 8px;
  letter-spacing: 1px;
}
.welcome-desc {
  color: #64748b;
  font-size: 1.1rem;
  margin-bottom: 0;
}
.user-main-layout {
  flex: 1;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  justify-content: stretch;
  width: 100%;
  gap: 120px;
  min-height: 600px;
}
.user-left {
  flex: 0 0 420px;
  display: flex;
  flex-direction: column;
  gap: 32px;
  height: 100%;
  min-height: inherit;
}
.user-right {
  flex: 1 1 0;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 24px 0 rgba(0, 0, 0, 0.08);
  padding: 36px 40px 32px 40px;
  min-width: 0;
  height: 100%;
  min-height: inherit;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}
.user-tabs-underline {
  width: 100%;
  --el-tabs-header-height: 48px;
  --el-tabs-border-radius: 16px;
  --el-tabs-card-bg-color: transparent;
  --el-tabs-header-bg-color: transparent;
  --el-tabs-header-shadow: none;
  --el-tabs-active-color: #2563eb;
  --el-tabs-inactive-color: #64748b;
  --el-tabs-bar-color: #2563eb;
  --el-tabs-header-font-weight: 600;
  --el-tabs-header-font-size: 1.08rem;
  --el-tabs-header-padding: 0 24px;
  --el-tabs-header-margin: 0 0 18px 0;
}
.user-tabs-underline .el-tabs__header {
  background: transparent;
  border: none;
  box-shadow: none;
  margin-bottom: 18px;
  padding: 0;
  overflow: visible;
}
.user-tabs-underline .el-tabs__nav {
  border: none;
  background: transparent;
}
.user-tabs-underline .el-tabs__item {
  border: none !important;
  background: transparent !important;
  color: var(--el-tabs-inactive-color);
  font-weight: 500;
  font-size: 1.08rem;
  border-radius: 0 !important;
  margin-right: 32px;
  padding: 0 0 8px 0;
  height: 48px;
  line-height: 48px;
  position: relative;
  transition:
    color 0.18s,
    font-weight 0.18s;
  box-shadow: none;
}
.user-tabs-underline .el-tabs__item.is-active {
  color: #2563eb !important;
  font-weight: 700;
  background: transparent !important;
  position: relative;
}
.user-tabs-underline .el-tabs__item.is-active::after {
  content: '';
  display: block;
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 3px;
  border-radius: 2px;
  background: linear-gradient(90deg, #60a5fa 0%, #2563eb 100%);
  transition: width 0.25s cubic-bezier(0.4, 2, 0.6, 1);
  z-index: 2;
}
.user-tabs-underline .el-tabs__item:not(.is-active):hover {
  color: #2563eb;
  background: #e0e7ef22;
}
.user-tabs-underline .el-tabs__active-bar {
  display: none;
}
.user-tabs-underline .el-tabs__content {
  background: transparent;
  border-radius: 0 0 16px 16px;
  box-shadow: none;
  padding: 0;
}
.tab-pane-anim {
  animation: fadeInTab 0.5s cubic-bezier(0.4, 2, 0.6, 1);
  border-top: 1px solid #e0e7ef44;
  padding-top: 18px;
}
@keyframes fadeInTab {
  0% {
    opacity: 0;
    transform: translateY(24px);
  }
  100% {
    opacity: 1;
    transform: none;
  }
}
.tab-pane-card {
  max-width: 420px;
  margin: 0 auto;
  background: linear-gradient(135deg, #f6f8fa 0%, #e0e7ef 100%);
  border-radius: 18px;
  box-shadow: 0 4px 24px 0 rgba(59, 130, 246, 0.08);
  padding: 32px 32px 24px 32px;
  min-height: 340px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  animation: fadeInTab 0.5s cubic-bezier(0.4, 2, 0.6, 1);
}
.tab-title {
  display: flex;
  align-items: center;
  font-size: 1.25rem;
  font-weight: bold;
  color: #2563eb;
  margin-bottom: 6px;
  gap: 8px;
}
.tab-desc {
  color: #64748b;
  font-size: 1.02rem;
  margin-bottom: 10px;
}
.form-card {
  background: transparent;
  border-radius: 12px;
  box-shadow: none;
  padding: 0;
}
.edit-form .el-form-item {
  margin-bottom: 18px;
}
.edit-form .el-input__wrapper {
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 2px 8px 0 #e0e7ef22;
  transition: box-shadow 0.18s;
}
.edit-form .el-input__wrapper:focus-within {
  box-shadow: 0 4px 16px 0 #2563eb22;
}
.edit-form .el-button {
  border-radius: 10px;
  font-size: 1.08rem;
  font-weight: 600;
  letter-spacing: 1px;
  box-shadow: 0 2px 8px 0 #2563eb22;
  transition:
    box-shadow 0.18s,
    background 0.18s;
}
.edit-form .el-button:hover {
  box-shadow: 0 4px 16px 0 #2563eb44;
}
.weather-card-pro,
.profile-card-pro {
  width: 100%;
  max-width: 420px;
  margin: 0 auto 0 auto;
  box-sizing: border-box;
  padding-left: 0;
  padding-right: 0;
}
.weather-card-pro {
  background: linear-gradient(135deg, #60a5fa 0%, #2563eb 100%);
  color: #fff;
  border-radius: 20px;
  box-shadow: 0 8px 32px 0 rgba(59, 130, 246, 0.18);
  padding: 32px 32px 22px 32px;
  margin-bottom: 0;
  text-align: center;
  position: relative;
  overflow: hidden;
  transition: box-shadow 0.2s;
}
.weather-card-pro:hover {
  box-shadow: 0 12px 40px 0 rgba(59, 130, 246, 0.28);
}
.weather-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 10px;
}
.weather-icon {
  filter: drop-shadow(0 2px 8px #fbbf24aa);
}
.weather-city-pro {
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: 1px;
}
.weather-main-pro {
  margin-bottom: 4px;
}
.weather-temp-main {
  font-size: 2.2rem;
  font-weight: bold;
  margin-bottom: 2px;
  letter-spacing: 1px;
}
.weather-type-pro {
  font-size: 1.15rem;
  margin: 8px 0 2px 0;
  font-weight: 500;
}
.weather-date-pro {
  font-size: 1.02rem;
  opacity: 0.92;
  margin-bottom: 2px;
}
.weather-air-pro {
  font-size: 1.05rem;
  margin: 4px 0;
}
.weather-wind-pro {
  font-size: 0.98rem;
  opacity: 0.92;
}
.weather-tip-pro {
  margin-top: 10px;
  font-size: 1.02rem;
  color: #fffbe6;
  font-style: italic;
}
.aqi-tag {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 10px;
  font-size: 0.98rem;
  margin-left: 2px;
  margin-right: 2px;
  background: #fff;
  color: #2563eb;
  font-weight: bold;
}
.aqi-1 {
  color: #22c55e;
}
.aqi-2 {
  color: #a3e635;
}
.aqi-3 {
  color: #facc15;
}
.aqi-4 {
  color: #f59e42;
}
.aqi-5 {
  color: #ef4444;
}
.aqi-value {
  color: #ffffff;
  font-size: 0.98rem;
}
.profile-card-pro {
  background: rgba(255, 255, 255, 0.75);
  border-radius: 20px;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.1);
  padding: 0 0 32px 0;
  width: 100%;
  max-width: 420px;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(12px) saturate(1.2);
  transition:
    box-shadow 0.2s,
    transform 0.2s;
  border: 1.5px solid #e0e7ef44;
  animation: cardIn 0.7s cubic-bezier(0.4, 2, 0.6, 1) 1;
}
@keyframes cardIn {
  0% {
    opacity: 0;
    transform: translateY(40px) scale(0.98);
  }
  100% {
    opacity: 1;
    transform: none;
  }
}
.profile-card-pro:hover {
  box-shadow: 0 16px 48px 0 rgba(0, 0, 0, 0.16);
  transform: translateY(-2px) scale(1.01);
}
.profile-banner-pro {
  width: 100%;
  height: 60px;
  position: relative;
  z-index: 1;
  background: transparent;
}
.banner-svg {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 60px;
  z-index: 2;
  pointer-events: none;
}
.profile-header-pro {
  display: flex;
  align-items: center;
  margin-top: -36px;
  margin-bottom: 18px;
  padding: 0 32px;
  z-index: 3;
  position: relative;
}
.avatar-ring-pro {
  border-radius: 50%;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  position: relative;
}
.avatar-glow {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 90px;
  height: 90px;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: radial-gradient(circle, #60a5fa33 0%, #fff0 80%);
  z-index: 1;
  pointer-events: none;
}
.avatar-pro {
  width: 76px;
  height: 76px;
  border-radius: 50%;
  object-fit: cover;
  background: #fff;
  box-shadow: 0 2px 8px 0 #e0e7ef;
  position: relative;
  z-index: 2;
}
.avatar-text {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
  color: #2563eb;
  background: #e0e7ef;
}
.profile-main-pro {
  flex: 1;
}
.profile-name-pro {
  font-size: 1.35rem;
  font-weight: bold;
  color: #22223b;
  margin-bottom: 4px;
  letter-spacing: 1px;
}
.profile-username-pro {
  color: #64748b;
  font-size: 1.02rem;
}
.profile-info-pro {
  padding: 0 32px;
  margin-top: 8px;
}
.group-title {
  font-size: 0.98rem;
  color: #2563eb;
  font-weight: 600;
  margin-bottom: 4px;
  letter-spacing: 0.5px;
  opacity: 0.85;
}
.info-group {
  margin-bottom: 8px;
}
.info-row-pro {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  color: #374151;
  font-size: 1.05rem;
  font-weight: 500;
  border-radius: 8px;
  transition: background 0.18s;
  padding: 2px 8px 2px 0;
}
.info-row-pro:hover {
  background: linear-gradient(90deg, #e0e7ef22 0%, #fff0 100%);
}
.info-row-pro span {
  width: 90px;
  color: #64748b;
  font-size: 0.98rem;
  font-weight: 400;
}
.role-tag-pro {
  margin-right: 8px;
  border-radius: 8px;
  box-shadow: 0 2px 8px 0 #2563eb22;
  font-weight: 600;
  letter-spacing: 0.5px;
  background: linear-gradient(90deg, #60a5fa 0%, #2563eb 100%);
  color: #fff !important;
  border: none !important;
  padding: 0 12px;
  transition:
    box-shadow 0.18s,
    transform 0.18s;
}
.role-tag-pro:hover {
  box-shadow: 0 4px 16px 0 #2563eb44;
  transform: scale(1.06);
}
.divider {
  height: 1px;
  background: linear-gradient(90deg, #e0e7ef 0%, #fff 100%);
  margin: 8px 0 8px 0;
  border: none;
}
@media (max-width: 900px) {
  .user-main-layout {
    flex-direction: column;
    gap: 24px;
    align-items: stretch;
  }
  .user-left,
  .user-right {
    max-width: 98vw;
    width: 100%;
    height: auto;
    min-height: unset;
  }
  .profile-header-pro,
  .profile-info-pro {
    padding-left: 16px;
    padding-right: 16px;
  }
  .weather-card-pro,
  .profile-card-pro {
    max-width: 98vw;
    width: 98vw;
    min-width: 0;
  }
  .tab-pane-card {
    max-width: 98vw;
    padding: 18px 6vw 18px 6vw;
  }
}
@media (max-width: 600px) {
  .user-main-layout {
    flex-direction: column;
    gap: 12px;
    min-height: unset;
    padding: 0 4vw;
  }
  .user-left, .user-right {
    max-width: 100vw;
    width: 100vw;
    min-width: 0;
    padding: 0;
  }
  .profile-card-pro, .weather-card-pro {
    max-width: 100vw;
    width: 100vw;
    border-radius: 12px;
    box-shadow: 0 2px 8px 0 #2563eb11;
    margin: 0 0 12px 0;
    padding: 18px 8px 18px 8px;
  }
  .profile-header-pro, .profile-info-pro {
    padding-left: 8px;
    padding-right: 8px;
  }
  .welcome-card-pro {
    margin-bottom: 16px;
    border-radius: 12px;
    padding: 0 8px;
  }
  .welcome-title {
    font-size: 1.2rem;
  }
  .profile-name-pro {
    font-size: 1.1rem;
  }
  .avatar-pro, .avatar-text {
    width: 48px;
    height: 48px;
    font-size: 1.2rem;
  }
  .tab-pane-card {
    max-width: 100vw;
    padding: 12px 2vw 12px 2vw;
    border-radius: 10px;
  }
}
@media (min-width: 601px) and (max-width: 1024px) {
  .user-main-layout {
    flex-direction: column;
    gap: 24px;
    min-height: unset;
  }
  .user-left, .user-right {
    min-width: 0;
    padding: 10px;
  }
  .profile-card-pro, .weather-card-pro {
    max-width: 98vw;
    border-radius: 16px;
    margin: 0 0 18px 0;
    padding: 24px 12px 24px 12px;
  }
  .profile-header-pro, .profile-info-pro {
    padding-left: 12px;
    padding-right: 12px;
  }
  .welcome-card-pro {
    margin-bottom: 20px;
    border-radius: 16px;
    padding: 0 12px;
  }
  .welcome-title {
    font-size: 1.5rem;
  }
  .profile-name-pro {
    font-size: 1.2rem;
  }
  .avatar-pro, .avatar-text {
    width: 60px;
    height: 60px;
    font-size: 1.5rem;
  }
  .tab-pane-card {
    max-width: 98vw;
    padding: 18px 4vw 18px 4vw;
    border-radius: 14px;
  }

}
/* 桌面端大屏适配（可选，已基本覆盖） */
@media (min-width: 1025px) {
  .user-main-layout {
    gap: 120px;
    padding: 0;
  }
}
</style>
