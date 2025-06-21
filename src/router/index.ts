import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dashboard',
      component: () => import('@/views/layout/index.vue'),
      children: [
        {
          path: '/dashboard',
          component: () => import('@/views/dashboard/index.vue'),
          meta: {
            title: '首页',
            icon: 'HomeFilled',
          },
        },
        {
          path: '/403',
          component: () => import('@/views/layout/403.vue'),
          meta: {
            title: '403',
          },
        },
        {
          path: '/user/info',
          component: () => import('@/views/user/index.vue'),
          meta: {
            title: '个人信息',
            icon: 'User',
          },
        },
       // 通知管理
       {
        path: '/notice/list',
        component: () => import('@/views/notice/list.vue'),
        meta: {
          title: '通知列表',
          icon: 'Bell',
        },
      },
      {
        path: '/notice/my',
        component: () => import('@/views/notice/my.vue'),
        meta: {
          title: '我的通知',
          icon: 'Message',
        },
      },
        // 商品管理
        {
          path: '/product',
          meta: {
            title: '商品管理',
            icon: 'Goods',
          },
          children: [
            {
              path: 'list',
              component: () => import('@/views/product/list/index.vue'),
              meta: {
                title: '商品列表',
                icon: 'List',
              },
            },
            {
              path: 'category',
              component: () => import('@/views/product/category/index.vue'),
              meta: {
                title: '商品分类',
                icon: 'Files',
              },
            },
            {
              path: 'statistics',
              component: () => import('@/views/product/statistics/index.vue'),
              meta: {
                title: '商品统计',
                icon: 'TrendCharts',
              },
            },
          ],
        },
        // 仓库管理
        {
          path: '/warehouse',
          meta: {
            title: '仓库管理',
            icon: 'House',
          },
          children: [
            {
              path: 'list',
              component: () => import('@/views/warehouse/list/index.vue'),
              meta: {
                title: '仓库列表',
                icon: 'List',
              },
            },
            {
              path: 'inventory',
              component: () => import('@/views/warehouse/inventory/index.vue'),
              meta: {
                title: '库存管理',
                icon: 'Box',
              },
            },
            {
              path: 'warning',
              component: () => import('@/views/warehouse/warning/index.vue'),
              meta: {
                title: '库存预警',
                icon: 'Warning',
              },
            },
          ],
        },
        // 出入库管理
        {
          path: '/inventory',
          meta: {
            title: '出入库管理',
            icon: 'Box',
          },
          children: [
            {
              path: 'adjust',
              component: () => import('@/views/inventory/adjust/list.vue'),
              meta: {
                title: '库存调整',
                icon: 'TopRight',
              },
            },
            {
              path: 'myadjust',
              component: () => import('@/views/inventory/adjust/my.vue'),
              meta: {
                title: '我的库存调整',
                icon: 'BottomLeft',
              },
            },
            {
              path: 'transfer',
              component: () => import('@/views/inventory/transfer/list.vue'),
              meta: {
                title: '调拨管理',
                icon: 'Right',
              },
            },
            {
              path: 'mytransfer',
              component: () => import('@/views/inventory/transfer/my.vue'),
              meta: {
                title: '我的调拨',
                icon: 'BottomLeft',
              },
            },
            {
              path: 'analysis',
              component: () => import('@/views/inventory/analysis/index.vue'),
              meta: {
                title: '出入库分析',
                icon: 'DataLine',
              },
            },
          ],
        },
        // 客户管理
        {
          path: '/customer',
          meta: {
            title: '客户管理',
            icon: 'User',
          },
          children: [
            {
              path: 'list',
              component: () => import('@/views/customer/list/index.vue'),
              meta: {
                title: '客户列表',
                icon: 'List',
              },
            },
            {
              path: 'analysis',
              component: () => import('@/views/customer/analysis/index.vue'),
              meta: {
                title: '客户分析',
                icon: 'DataLine',
              },
            },
            {
              path: 'salelist',
              component: () => import('@/views/customer/salelist/index.vue'),
              meta: {
                title: '销售列表',
                icon: 'List',
              },
            },
          ],
        },
        // 订单管理
        {
          path: '/order',
          meta: {
            title: '订单管理',
            icon: 'Document',
          },
          children: [
            {
              path: 'list',
              component: () => import('@/views/order/list/index.vue'),
              meta: {
                title: '订单列表',
                icon: 'List',
              },
            },
            {
              path: 'create',
              component: () => import('@/views/order/create/index.vue'),
              meta: {
                title: '创建订单',
                icon: 'Plus',
              },
            },
            {
              path: 'analysis',
              component: () => import('@/views/order/analysis/index.vue'),
              meta: {
                title: '订单分析',
                icon: 'TrendCharts',
              },
            },
          ],
        },
        // 物流管理
        {
          path: '/logistics',
          meta: {
            title: '物流管理',
            icon: 'Van',
          },
          children: [
            {
              path: 'tracking',
              component: () => import('@/views/logistics/tracking/index.vue'),
              meta: {
                title: '物流跟踪',
                icon: 'Location',
              },
            },
            {
              path: 'carrier',
              component: () => import('@/views/logistics/carrier/index.vue'),
              meta: {
                title: '承运商管理',
                icon: 'Van',
              },
            },
            {
              path: 'cost',
              component: () => import('@/views/logistics/cost/index.vue'),
              meta: {
                title: '物流成本',
                icon: 'Money',
              },
            },
          ],
        },
        // 系统管理
        {
          path: '/system',
          meta: {
            title: '系统管理',
            icon: 'Setting',
          },
          children: [
            {
              path: 'user',
              component: () => import('@/views/system/user/index.vue'),
              meta: {
                title: '用户管理',
                icon: 'User',
              },
            },
            {
              path: 'role',
              component: () => import('@/views/system/role/index.vue'),
              meta: {
                title: '角色管理',
                icon: 'UserFilled',
              },
            },
            {
              path: 'menu',
              component: () => import('@/views/system/menu/index.vue'),
              meta: {
                title: '菜单管理',
                icon: 'Menu',
              },
            },
            {
              path: 'department',
              component: () => import('@/views/system/department/index.vue'),
              meta: {
                title: '部门管理',
                icon: 'OfficeBuilding',
              },
            },
            {
              path: 'log',
              component: () => import('@/views/system/log/index.vue'),
              meta: {
                title: '操作日志',
                icon: 'Document',
              },
            },
          ],
        },
      ],
    },
    {
      path: '/login',
      component: () => import('@/views/login/index.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/views/layout/404.vue'),
    },
  ],
})

export default router
