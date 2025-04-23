<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()

// 表单数据
const loginForm = reactive({
  username: '',
  password: ''
})

// 表单验证规则
const rules = reactive<FormRules>({
  username: [
    { required: true, message: '请输入管理员用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ]
})

// 引用表单
const loginFormRef = ref<FormInstance>()
// 加载状态
const loading = ref(false)

// 登录处理
const handleLogin = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  
  await formEl.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const res = await userStore.adminLogin(loginForm.username, loginForm.password)
        if (res.code === 0) {
          ElMessage.success('管理员登录成功')
          router.push('/dashboard')
        } else {
          ElMessage.error(res.message || '登录失败')
        }
      } catch (error) {
        ElMessage.error('登录失败，请检查网络连接')
      } finally {
        loading.value = false
      }
    }
  })
}

// 返回普通用户登录
const goToUserLogin = () => {
  router.push('/login')
}
</script>

<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <img src="@/assets/logo.svg" alt="Logo" class="logo" />
        <h2 class="title">二手市场管理系统</h2>
      </div>
      
      <div class="login-form">
        <h3>管理员登录</h3>
        
        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="rules"
          label-position="top"
          size="large"
        >
          <el-form-item label="管理员用户名" prop="username">
            <el-input 
              v-model="loginForm.username"
              placeholder="请输入管理员用户名"
              prefix-icon="User"
            />
          </el-form-item>
          
          <el-form-item label="密码" prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              prefix-icon="Lock"
              show-password
            />
          </el-form-item>
          
          <el-form-item>
            <el-button 
              type="primary" 
              class="login-button" 
              :loading="loading"
              @click="handleLogin(loginFormRef)"
            >
              管理员登录
            </el-button>
          </el-form-item>
        </el-form>
        
        <div class="login-options">
          <el-button link type="primary" @click="goToUserLogin">
            返回普通用户登录
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
}

.login-box {
  width: 400px;
  padding: 30px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.logo {
  width: 60px;
  height: 60px;
}

.title {
  margin-top: 10px;
  font-size: 24px;
  color: #333;
}

.login-form h3 {
  font-size: 18px;
  margin-bottom: 20px;
  color: #333;
  text-align: center;
}

.login-button {
  width: 100%;
}

.login-options {
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
}
</style> 