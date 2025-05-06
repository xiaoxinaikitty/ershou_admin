import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dashboard'
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/Login.vue'),
      meta: {
        title: '登录',
        requiresAuth: false
      }
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('@/views/AdminLogin.vue'),
      meta: {
        title: '管理员登录',
        requiresAuth: false
      }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/Register.vue'),
      meta: {
        title: '注册',
        requiresAuth: false
      }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/Dashboard.vue'),
      meta: {
        title: '控制台',
        requiresAuth: true
      }
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/Profile.vue'),
      meta: {
        title: '个人信息',
        requiresAuth: true
      }
    },
    {
      path: '/password',
      name: 'password',
      component: () => import('@/views/ChangePassword.vue'),
      meta: {
        title: '修改密码',
        requiresAuth: true
      }
    },
    {
      path: '/address',
      name: 'address',
      component: () => import('@/views/Address.vue'),
      meta: {
        title: '收货地址管理',
        requiresAuth: true
      }
    },
    {
      path: '/shipping-address',
      name: 'shippingAddress',
      component: () => import('@/views/ShippingAddress.vue'),
      meta: {
        title: '发货地址管理',
        requiresAuth: true
      }
    },
    {
      path: '/user-management',
      name: 'userManagement',
      component: () => import('@/views/UserManagement.vue'),
      meta: {
        title: '用户管理',
        requiresAuth: true,
        requiresAdmin: true
      }
    },
    // 商品管理相关路由
    {
      path: '/product-management',
      name: 'productManagement',
      component: () => import('@/views/ProductManagement.vue'),
      meta: {
        title: '商品管理',
        requiresAuth: true
      }
    },
    {
      path: '/favorite-management',
      name: 'favoriteManagement',
      component: () => import('@/views/FavoriteManagement.vue'),
      meta: {
        title: '我的收藏',
        requiresAuth: true
      }
    },
    {
      path: '/product-report',
      name: 'productReport',
      component: () => import('@/views/ProductReportManagement.vue'),
      meta: {
        title: '商品举报管理',
        requiresAuth: true,
        requiresAdmin: true
      }
    },
    {
      path: '/trade-method',
      name: 'tradeMethod',
      component: () => import('@/views/TradeMethodManagement.vue'),
      meta: {
        title: '交易方式管理',
        requiresAuth: true,
        requiresAdmin: true
      }
    },
    // 订单管理相关路由
    {
      path: '/order-management',
      name: 'orderManagement',
      component: () => import('@/views/OrderManagement.vue'),
      meta: {
        title: '订单管理',
        requiresAuth: true
      }
    },
    {
      path: '/create-order/:productId',
      name: 'createOrder',
      component: () => import('@/views/CreateOrder.vue'),
      meta: {
        title: '创建订单',
        requiresAuth: true
      },
      props: true
    }
  ]
})

// 全局路由守卫
router.beforeEach(async (to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 二手市场管理系统`
  }

  const userStore = useUserStore()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin)
  
  // 如果没有登录且需要认证，重定向到登录页
  if (requiresAuth && !userStore.isLoggedIn) {
    next({ name: 'login' })
    return
  }
  
  // 如果需要管理员权限但不是管理员，重定向到控制台
  if (requiresAdmin && !userStore.isAdmin) {
    next({ name: 'dashboard' })
    return
  }
  
  next()
})

export default router
