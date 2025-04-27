<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import * as userApi from '@/api/user'
import * as productApi from '@/api/product'
import { ElMessage } from 'element-plus'
import eventBus from '@/utils/eventBus'
import { Refresh } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

// 用户信息
const userInfo = computed(() => userStore.userInfo)
const isAdmin = computed(() => userStore.isAdmin)

// 系统统计数据
const stats = ref({
  userCount: 0, // 可能是数字或对象
  orderCount: 0,
  productCount: 0,
  messageCount: 0
})

// 计算实际显示的用户数量
const displayUserCount = computed(() => {
  const userCount = stats.value.userCount
  
  if (typeof userCount === 'number') {
    return userCount
  }
  
  if (userCount && typeof userCount === 'object') {
    if ('total' in userCount) {
      return userCount.total
    }
    
    // 尝试获取第一个数字属性
    for (const key in userCount) {
      if (typeof userCount[key] === 'number') {
        return userCount[key]
      }
    }
  }
  
  return 0
})

// 数据加载状态
const loading = ref(false)

// 自动刷新定时器
let refreshTimer: number | null = null

// 快捷导航菜单项
const quickNavItems = [
  { name: '个人信息', icon: 'User', route: '/profile', color: '#409EFF' },
  { name: '修改密码', icon: 'Lock', route: '/password', color: '#67C23A' },
  { name: '地址管理', icon: 'Location', route: '/address', color: '#E6A23C' }
]

// 管理员菜单项
const adminNavItems = [
  { name: '用户管理', icon: 'UserFilled', route: '/user-management', color: '#F56C6C' },
  { name: '商品管理', icon: 'Goods', route: '/product-management', color: '#E6A23C' }
]

// 跳转到指定路由
const navigateTo = (route: string) => {
  router.push(route)
}

// 获取用户总数
const fetchUserCount = async () => {
  if (!isAdmin.value) return
  
  try {
    const userCountRes = await userApi.getUserCount()
    if (userCountRes.code === 0) {
      // 不需要对返回的数据进行预处理，直接保存，
      // 由displayUserCount计算属性处理显示逻辑
      stats.value.userCount = userCountRes.data
    }
  } catch (error) {
    console.error('获取用户数量失败:', error)
  }
}

// 获取商品总数
const fetchProductCount = async () => {
  if (!isAdmin.value) return
  
  try {
    // 获取在售商品的数量（status=1）
    const productCountRes = await productApi.getProductCount(1)
    if (productCountRes.code === 0) {
      stats.value.productCount = productCountRes.data
    }
  } catch (error) {
    console.error('获取商品数量失败:', error)
  }
}

// 获取数据
const fetchData = async () => {
  if (!isAdmin.value) return
  
  loading.value = true
  try {
    // 获取用户数量
    await fetchUserCount()
    
    // 获取商品数量
    await fetchProductCount()
    
    // 这里可以添加其他统计数据的获取
    // 目前使用模拟数据
    stats.value.orderCount = 3650
    stats.value.messageCount = 56
    
  } catch (error) {
    ElMessage.error('获取统计数据失败')
  } finally {
    loading.value = false
  }
}

// 设置自动刷新
const setupAutoRefresh = () => {
  if (isAdmin.value && !refreshTimer) {
    // 每60秒自动刷新一次用户数量
    refreshTimer = window.setInterval(() => {
      fetchUserCount()
    }, 60000)
  }
}

// 清除自动刷新
const clearAutoRefresh = () => {
  if (refreshTimer) {
    window.clearInterval(refreshTimer)
    refreshTimer = null
  }
}

// 监听用户注册事件，更新用户统计数据
const handleUserRegistered = () => {
  // 立即更新用户数量
  fetchUserCount()
}

onMounted(() => {
  // 获取初始数据
  fetchData()
  
  // 设置自动刷新
  setupAutoRefresh()
  
  // 添加事件监听
  eventBus.on('user-registered', handleUserRegistered)
})

onUnmounted(() => {
  // 清除自动刷新
  clearAutoRefresh()
  
  // 移除事件监听
  eventBus.off('user-registered', handleUserRegistered)
})
</script>

<template>
  <div class="dashboard-container">
    <div class="welcome-section">
      <el-card class="welcome-card">
        <div class="welcome-content">
          <div class="welcome-text">
            <h2>欢迎使用二手市场管理系统</h2>
            <p>{{ isAdmin ? '您当前以管理员身份登录' : '您当前以普通用户身份登录' }}</p>
            <p v-if="userInfo">当前登录用户: {{ userInfo.username }}</p>
          </div>
          <div class="welcome-time">
            <p>{{ new Date().toLocaleString() }}</p>
          </div>
        </div>
      </el-card>
    </div>

    <div class="stats-section" v-if="isAdmin">
      <div class="stats-header">
        <h3>系统统计</h3>
        <el-button type="primary" size="small" :icon="Refresh" @click="fetchData" :loading="loading">
          刷新数据
        </el-button>
      </div>
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card" v-loading="loading">
            <div class="stat-item">
              <div class="stat-icon" style="background-color: #409EFF">
                <el-icon><User /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ displayUserCount }}</div>
                <div class="stat-label">用户数量</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card" v-loading="loading">
            <div class="stat-item">
              <div class="stat-icon" style="background-color: #67C23A">
                <el-icon><ShoppingCart /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.orderCount }}</div>
                <div class="stat-label">订单总数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card" v-loading="loading">
            <div class="stat-item">
              <div class="stat-icon" style="background-color: #E6A23C">
                <el-icon><Goods /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.productCount }}</div>
                <div class="stat-label">商品数量</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card" v-loading="loading">
            <div class="stat-item">
              <div class="stat-icon" style="background-color: #F56C6C">
                <el-icon><ChatDotRound /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.messageCount }}</div>
                <div class="stat-label">未读消息</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <div class="quick-nav-section">
      <el-card class="nav-card">
        <template #header>
          <div class="card-header">
            <span>快捷操作</span>
          </div>
        </template>
        
        <div class="nav-grid">
          <div 
            class="nav-item" 
            v-for="item in quickNavItems" 
            :key="item.name"
            @click="navigateTo(item.route)"
          >
            <div class="nav-icon" :style="{ backgroundColor: item.color }">
              <el-icon><component :is="item.icon" /></el-icon>
            </div>
            <div class="nav-name">{{ item.name }}</div>
          </div>
          
          <div 
            class="nav-item" 
            v-for="item in adminNavItems" 
            :key="item.name"
            @click="navigateTo(item.route)"
            v-if="isAdmin"
          >
            <div class="nav-icon" :style="{ backgroundColor: item.color }">
              <el-icon><component :is="item.icon" /></el-icon>
            </div>
            <div class="nav-name">{{ item.name }}</div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.welcome-section {
  margin-bottom: 20px;
}

.welcome-card {
  background: linear-gradient(135deg, #8E2DE2 0%, #4A00E0 100%);
  color: white;
}

.welcome-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.welcome-text h2 {
  margin-top: 0;
  font-size: 24px;
}

.welcome-time {
  font-size: 14px;
  text-align: right;
}

.stats-section {
  margin-bottom: 20px;
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.stats-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}

.stat-card {
  cursor: pointer;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-item {
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  color: white;
  margin-right: 15px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: #606266;
}

.card-header {
  font-size: 18px;
  font-weight: 500;
}

.nav-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 20px;
}

.nav-item {
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  padding: 15px;
  border-radius: 8px;
}

.nav-item:hover {
  background-color: #f5f7fa;
  transform: translateY(-5px);
}

.nav-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  color: white;
  margin: 0 auto 10px;
}

.nav-name {
  font-size: 14px;
  margin-top: 10px;
}
</style> 