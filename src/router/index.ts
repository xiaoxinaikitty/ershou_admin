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
        title: '地址管理',
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
