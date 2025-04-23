<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const isCollapse = ref(false)

const activeMenu = computed(() => {
  return router.currentRoute.value.path
})

// 用户信息
const userInfo = computed(() => userStore.userInfo)

// 退出登录
const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}
</script>

<template>
  <el-container class="layout-container">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '200px'" class="sidebar">
      <div class="logo-container">
        <img src="@/assets/logo.svg" alt="Logo" class="logo" v-if="!isCollapse" />
        <span v-if="!isCollapse" class="title">二手市场管理</span>
      </div>
      
      <el-menu
        :default-active="activeMenu"
        class="sidebar-menu"
        :collapse="isCollapse"
        router
        background-color="#001529"
        text-color="#fff"
        active-text-color="#409EFF"
      >
        <el-menu-item index="/dashboard">
          <el-icon><HomeFilled /></el-icon>
          <template #title>首页</template>
        </el-menu-item>
        
        <el-sub-menu index="/products">
          <template #title>
            <el-icon><Goods /></el-icon>
            <span>商品管理</span>
          </template>
          <el-menu-item index="/product-management">
            <el-icon><List /></el-icon>
            <span>商品列表</span>
          </el-menu-item>
          <el-menu-item index="/favorite-management">
            <el-icon><Star /></el-icon>
            <span>我的收藏</span>
          </el-menu-item>
          <el-menu-item index="/product-report" v-if="userStore.isAdmin">
            <el-icon><Warning /></el-icon>
            <span>举报管理</span>
          </el-menu-item>
          <el-menu-item index="/trade-method" v-if="userStore.isAdmin">
            <el-icon><SwitchButton /></el-icon>
            <span>交易方式</span>
          </el-menu-item>
        </el-sub-menu>
        
        <el-menu-item index="/order-management">
          <el-icon><ShoppingCart /></el-icon>
          <template #title>订单管理</template>
        </el-menu-item>
        
        <el-menu-item index="/profile">
          <el-icon><User /></el-icon>
          <template #title>个人信息</template>
        </el-menu-item>
        
        <el-menu-item index="/password">
          <el-icon><Lock /></el-icon>
          <template #title>修改密码</template>
        </el-menu-item>
        
        <el-menu-item index="/address">
          <el-icon><Location /></el-icon>
          <template #title>地址管理</template>
        </el-menu-item>
        
        <el-menu-item index="/user-management" v-if="userStore.isAdmin">
          <el-icon><UserFilled /></el-icon>
          <template #title>用户管理</template>
        </el-menu-item>
      </el-menu>
      
      <div class="collapse-btn" @click="isCollapse = !isCollapse">
        <el-icon v-if="isCollapse"><DArrowRight /></el-icon>
        <el-icon v-else><DArrowLeft /></el-icon>
      </div>
    </el-aside>
    
    <!-- 主体内容 -->
    <el-container>
      <!-- 头部 -->
      <el-header class="header">
        <div class="header-left">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="router.currentRoute.value.meta.title">
              {{ router.currentRoute.value.meta.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        
        <div class="header-right">
          <el-dropdown @command="handleLogout">
            <div class="user-info">
              <el-avatar :size="32" v-if="userInfo?.avatar" :src="userInfo.avatar"></el-avatar>
              <el-avatar :size="32" v-else>{{ userInfo?.username?.substring(0, 1).toUpperCase() }}</el-avatar>
              <span class="username">{{ userInfo?.username }}</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      
      <!-- 内容区域 -->
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.layout-container {
  height: 100vh;
  overflow: hidden;
}

.sidebar {
  background-color: #001529;
  transition: width 0.3s;
  position: relative;
  overflow: hidden;
}

.logo-container {
  height: 60px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  color: #fff;
  overflow: hidden;
}

.logo {
  height: 32px;
  margin-right: 10px;
}

.title {
  font-size: 16px;
  font-weight: bold;
  white-space: nowrap;
}

.sidebar-menu {
  border-right: none;
}

.collapse-btn {
  position: absolute;
  bottom: 20px;
  width: 100%;
  text-align: center;
  color: #fff;
  cursor: pointer;
  padding: 8px 0;
}

.header {
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.header-left, .header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.username {
  margin: 0 8px;
}

.main-content {
  padding: 20px;
  overflow-y: auto;
  background-color: #f0f2f5;
}
</style> 