<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import * as userApi from '@/api/user'

const router = useRouter()

// 表单数据
const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: ''
})

// 表单验证规则
const validatePass = (rule: any, value: string, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

const rules = reactive<FormRules>({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validatePass, trigger: 'blur' }
  ]
})

// 引用表单
const registerFormRef = ref<FormInstance>()
// 加载状态
const loading = ref(false)

// 注册处理
const handleRegister = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  
  await formEl.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const res = await userApi.register(registerForm.username, registerForm.password)
        if (res.code === 0) {
          ElMessage.success('注册成功，请登录')
          router.push('/login')
        } else {
          ElMessage.error(res.message || '注册失败')
        }
      } catch (error) {
        ElMessage.error('注册失败，请检查网络连接')
      } finally {
        loading.value = false
      }
    }
  })
}

// 返回登录页
const goToLogin = () => {
  router.push('/login')
}
</script>

<template>
  <div class="register-container">
    <div class="register-box">
      <div class="register-header">
        <img src="@/assets/logo.svg" alt="Logo" class="logo" />
        <h2 class="title">二手市场管理系统</h2>
      </div>
      
      <div class="register-form">
        <h3>用户注册</h3>
        
        <el-form
          ref="registerFormRef"
          :model="registerForm"
          :rules="rules"
          label-position="top"
          size="large"
        >
          <el-form-item label="用户名" prop="username">
            <el-input 
              v-model="registerForm.username"
              placeholder="请输入用户名"
              prefix-icon="User"
            />
          </el-form-item>
          
          <el-form-item label="密码" prop="password">
            <el-input
              v-model="registerForm.password"
              type="password"
              placeholder="请输入密码"
              prefix-icon="Lock"
              show-password
            />
          </el-form-item>
          
          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input
              v-model="registerForm.confirmPassword"
              type="password"
              placeholder="请再次输入密码"
              prefix-icon="Check"
              show-password
            />
          </el-form-item>
          
          <el-form-item>
            <el-button 
              type="primary" 
              class="register-button" 
              :loading="loading"
              @click="handleRegister(registerFormRef)"
            >
              注册
            </el-button>
          </el-form-item>
        </el-form>
        
        <div class="register-options">
          <span>已有账号？</span>
          <el-button link type="primary" @click="goToLogin">
            返回登录
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #43cea2 0%, #185a9d 100%);
}

.register-box {
  width: 400px;
  padding: 30px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.register-header {
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

.register-form h3 {
  font-size: 18px;
  margin-bottom: 20px;
  color: #333;
  text-align: center;
}

.register-button {
  width: 100%;
}

.register-options {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 15px;
}
</style> 