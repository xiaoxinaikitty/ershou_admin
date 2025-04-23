<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'

const router = useRouter()
const userStore = useUserStore()

// 用户信息
const userInfo = computed(() => userStore.userInfo)
const isAdmin = computed(() => userStore.isAdmin)

// 系统统计数据（模拟）
const stats = ref({
  userCount: 1024,
  orderCount: 3650,
  productCount: 278,
  messageCount: 56
})

// 快捷导航菜单项
const quickNavItems = [
  { name: '个人信息', icon: 'User', route: '/profile', color: '#409EFF' },
  { name: '修改密码', icon: 'Lock', route: '/password', color: '#67C23A' },
  { name: '地址管理', icon: 'Location', route: '/address', color: '#E6A23C' }
]

// 管理员菜单项
const adminNavItems = [
  { name: '用户管理', icon: 'UserFilled', route: '/user-management', color: '#F56C6C' }
]

// 跳转到指定路由
const navigateTo = (route: string) => {
  router.push(route)
}

// 获取数据
const fetchData = () => {
  // 实际项目中这里应该调用API获取实际数据
  // 这里使用模拟数据
}

onMounted(() => {
  fetchData()
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
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card">
            <div class="stat-item">
              <div class="stat-icon" style="background-color: #409EFF">
                <el-icon><User /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.userCount }}</div>
                <div class="stat-label">用户数量</div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="6">
          <el-card shadow="hover" class="stat-card">
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
          <el-card shadow="hover" class="stat-card">
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
          <el-card shadow="hover" class="stat-card">
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