<template>
  <div class="app-wrapper" :class="{ 'is-collapse': isCollapse }">
    <!-- 侧边栏 -->
    <div class="sidebar-container">
      <div class="logo-container">
        <h1 class="logo-title" v-show="!isCollapse">跨境仓储 ERP 系统</h1>
        <h1 class="logo-title" v-show="isCollapse">
          <img src="@/assets/ERP.png" alt="logo" class="logo-img" />
        </h1>
      </div>
      <el-menu
        class="sidebar-menu"
        :default-active="activeMenu"
        text-color="black"
        active-text-color="rgba(64, 158, 255)"
        active-background-color="rgba(236, 245, 255)"
        :collapse="isCollapse"
        :unique-opened="true"
        collapse-close-icon="ArrowDown"
        collapse-open-icon="ArrowUp"
        router
      >
        <!-- 首页 -->
        <el-menu-item index="/dashboard">
          <el-icon><HomeFilled /></el-icon>
          <span>首页</span>
        </el-menu-item>

        <!-- 通知管理 -->
        <el-sub-menu index="notice">
          <template #title>
            <el-icon><Bell /></el-icon>
            <span>通知管理</span>
          </template>
          <el-menu-item index="/notice/list">
            <el-icon><List /></el-icon>
            <span>通知列表</span>
          </el-menu-item>
          <el-menu-item index="/notice/my">
            <el-icon><Message /></el-icon>
            <span>我的通知</span>
          </el-menu-item>
        </el-sub-menu>

        <!-- 商品管理 -->
        <el-sub-menu index="product">
          <template #title>
            <el-icon><Goods /></el-icon>
            <span>商品管理</span>
          </template>
          <el-menu-item index="/product/list">
            <el-icon><List /></el-icon>
            <span>商品列表</span>
          </el-menu-item>
          <el-menu-item index="/product/category">
            <el-icon><Files /></el-icon>
            <span>商品分类</span>
          </el-menu-item>
          <el-menu-item index="/product/statistics">
            <el-icon><TrendCharts /></el-icon>
            <span>商品统计</span>
          </el-menu-item>
        </el-sub-menu>

        <!-- 仓库管理 -->
        <el-sub-menu index="warehouse">
          <template #title>
            <el-icon><House /></el-icon>
            <span>仓库管理</span>
          </template>
          <el-menu-item index="/warehouse/list">
            <el-icon><List /></el-icon>
            <span>仓库列表</span>
          </el-menu-item>
          <el-menu-item index="/warehouse/inventory">
            <el-icon><Box /></el-icon>
            <span>库存管理</span>
          </el-menu-item>
          <el-menu-item index="/warehouse/warning">
            <el-icon><Warning /></el-icon>
            <span>库存预警</span>
          </el-menu-item>
        </el-sub-menu>

        <!-- 出入库管理 -->
        <el-sub-menu index="inventory">
          <template #title>
            <el-icon><Operation /></el-icon>
            <span>出入库管理</span>
          </template>
          <el-menu-item index="/inventory/adjust">
            <el-icon><TopRight /></el-icon>
            <span>库存调整</span>
          </el-menu-item>
          <el-menu-item index="/inventory/myadjust">
            <el-icon><BottomLeft /></el-icon>
            <span>我的库存调整</span>
          </el-menu-item>
          <el-menu-item index="/inventory/transfer">
            <el-icon><Right /></el-icon>
            <span>调拨管理</span>
          </el-menu-item>
          <el-menu-item index="/inventory/mytransfer">
            <el-icon><Right /></el-icon>
            <span>我的调拨</span>
          </el-menu-item>
          <el-menu-item index="/inventory/analysis">
            <el-icon><DataLine /></el-icon>
            <span>出入库分析</span>
          </el-menu-item>
        </el-sub-menu>

        <!-- 客户管理 -->
        <el-sub-menu index="customer">
          <template #title>
            <el-icon><User /></el-icon>
            <span>客户管理</span>
          </template>
          <el-menu-item index="/customer/list">
            <el-icon><List /></el-icon>
            <span>客户列表</span>
          </el-menu-item>
          <el-menu-item index="/customer/analysis">
            <el-icon><DataLine /></el-icon>
            <span>客户分析</span>
          </el-menu-item>
          <el-menu-item index="/customer/salelist">
            <el-icon><List /></el-icon>
            <span>销售列表</span>
          </el-menu-item>
        </el-sub-menu>

        <!-- 订单管理
        <el-sub-menu index="order">
          <template #title>
            <el-icon><Document /></el-icon>
            <span>订单管理</span>
          </template>
          <el-menu-item index="/order/list">
            <el-icon><List /></el-icon>
            <span>订单列表</span>
          </el-menu-item>
          <el-menu-item index="/order/create">
            <el-icon><Plus /></el-icon>
            <span>创建订单</span>
          </el-menu-item>
          <el-menu-item index="/order/analysis">
            <el-icon><TrendCharts /></el-icon>
            <span>订单分析</span>
          </el-menu-item>
        </el-sub-menu> -->

        <!-- 物流管理
        <el-sub-menu index="logistics">
          <template #title>
            <el-icon><Van /></el-icon>
            <span>物流管理</span>
          </template>
          <el-menu-item index="/logistics/tracking">
            <el-icon><Location /></el-icon>
            <span>物流跟踪</span>
          </el-menu-item>
          <el-menu-item index="/logistics/carrier">
            <el-icon><Van /></el-icon>
            <span>承运商管理</span>
          </el-menu-item>
          <el-menu-item index="/logistics/cost">
            <el-icon><Money /></el-icon>
            <span>物流成本</span>
          </el-menu-item>
        </el-sub-menu> -->

        <!-- 系统管理 -->
        <el-sub-menu index="system">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>系统管理</span>
          </template>
          <el-menu-item index="/system/user">
            <el-icon><User /></el-icon>
            <span>用户管理</span>
          </el-menu-item>
          <el-menu-item index="/system/role">
            <el-icon><UserFilled /></el-icon>
            <span>角色管理</span>
          </el-menu-item>
          <el-menu-item index="/system/menu">
            <el-icon><Menu /></el-icon>
            <span>菜单管理</span>
          </el-menu-item>
          <el-menu-item index="/system/department">
            <el-icon><OfficeBuilding /></el-icon>
            <span>部门管理</span>
          </el-menu-item>
          <el-menu-item index="/system/log">
            <el-icon><Document /></el-icon>
            <span>操作日志</span>
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-container">
      <!-- 顶部导航栏 -->
      <div class="navbar">
        <div class="left-area">
          <el-icon class="collapse-btn" @click="toggleSidebar">
            <component :is="isCollapse ? 'Expand' : 'Fold'" />
          </el-icon>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-for="(item, index) in breadcrumbs" :key="item.path">
              {{ item.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="right-area">
          <el-tooltip :content="isFullscreen ? '退出全屏' : '全屏'" placement="bottom">
            <el-icon class="action-icon" @click="toggleFullscreen">
              <component :is="isFullscreen ? 'Close' : 'FullScreen'" />
            </el-icon>
          </el-tooltip>
          <el-dropdown>
            <span class="user-info">
              <el-avatar :size="32">
                <template v-if="userProfile.avatar">
                  <img :src="userProfile.avatar" />
                </template>
                <template v-else>
                  <div class="avatar-pro avatar-text">
                    {{
                      userProfile.real_name
                        ? userProfile.real_name.charAt(0)
                        : userProfile.username
                          ? userProfile.username.charAt(0)
                          : ''
                    }}
                  </div>
                </template>
              </el-avatar>
              <span class="username">{{
                userProfile.real_name || userProfile.username || ''
              }}</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="handleUserInfo">个人信息</el-dropdown-item>
                <el-dropdown-item @click="handleUserInfo">修改密码</el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="app-main">
        <router-view v-slot="{ Component }">
          <transition name="fade-transform" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  HomeFilled,
  Goods,
  List,
  Files,
  Money,
  House,
  Box,
  Warning,
  Operation,
  TopRight,
  BottomLeft,
  Right,
  Timer,
  User,
  UserFilled,
  Document,
  Plus,
  TrendCharts,
  Van,
  Location,
  Setting,
  Menu,
  OfficeBuilding,
  Expand,
  Fold,
  FullScreen,
  Close,
} from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { getUserProfile } from '@/api/login/userinfo'

const route = useRoute()
const router = useRouter()
const isCollapse = ref(false)
const isFullscreen = ref(false)

const userProfile = ref<{
  user_id?: number
  username?: string
  real_name?: string
  avatar?: string | null
}>({})

// 当前激活的菜单
const activeMenu = computed(() => route.path)

// 生成面包屑数据
const breadcrumbs = computed(() => {
  const matched = route.matched.filter((item) => item.meta && item.meta.title)
  const first = matched[0]

  if (!first) {
    return []
  }

  return matched.map((item) => ({
    path: item.path,
    title: item.meta.title,
  }))
})

// 切换侧边栏
const toggleSidebar = () => {
  isCollapse.value = !isCollapse.value
}

// 切换全屏
const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    isFullscreen.value = true
  } else {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}

// 监听全屏变化
document.addEventListener('fullscreenchange', () => {
  isFullscreen.value = !!document.fullscreenElement
})

// 退出登录
const handleLogout = () => {
  localStorage.removeItem('token')
  router.push('/login')
}

// 个人信息
const handleUserInfo = () => {
  router.push('/user/info')
}

onMounted(async () => {
  const res = await getUserProfile()
  userProfile.value = res
})
</script>

<style scoped>
.avatar-pro {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.logo-img {
  width: 32px;
  height: 32px;
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
  font-weight: bold;
  color: #2563eb;
  background: #e0e7ef;
}

.app-wrapper {
  display: flex;
  height: 100vh;
  width: 100%;
}

.sidebar-container {
  width: 240px;
  height: 100%;
  /* background-color: #304156; */
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  overflow-y: auto;
  transform: translateZ(0);
  will-change: width;
}

.app-wrapper.is-collapse .sidebar-container {
  width: 64px;
}

.logo-container {
  height: 60px;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-title {
  color: black;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  white-space: nowrap;
}

.sidebar-menu {
  border-top: 1px solid #e0e7ef;
  border-right: none;
}

.sidebar-menu:not(.el-menu--collapse) {
  width: 240px;
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.navbar {
  height: 60px;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.left-area {
  display: flex;
  align-items: center;
  gap: 16px;
}

.collapse-btn {
  font-size: 20px;
  cursor: pointer;
  color: #606266;
}

.collapse-btn:hover {
  color: #409eff;
}

.right-area {
  display: flex;
  align-items: center;
  gap: 16px;
}

.action-icon {
  font-size: 20px;
  cursor: pointer;
  color: #606266;
}

.action-icon:hover {
  color: #409eff;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.username {
  margin-left: 8px;
  font-size: 14px;
  color: #606266;
}

/* 路由切换动画 */
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.3s;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.app-main {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #f0f2f5;
}
</style>
