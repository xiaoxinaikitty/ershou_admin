<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import * as userApi from '@/api/user'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'

const router = useRouter()
const userStore = useUserStore()

// 表单数据
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 确认密码验证函数
const validateConfirmPassword = (rule: any, value: string, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入新密码'))
  } else if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

// 表单验证规则
const rules = reactive<FormRules>({
  oldPassword: [
    { required: true, message: '请输入旧密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
})

// 引用表单
const passwordFormRef = ref<FormInstance>()
// 加载状态
const loading = ref(false)

// 提交表单
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  
  await formEl.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const res = await userApi.updatePassword({
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword,
          confirmPassword: passwordForm.confirmPassword
        })
        if (res.code === 0) {
          ElMessage.success('密码修改成功，请重新登录')
          // 退出登录并返回登录页
          userStore.logout()
          router.push('/login')
        } else {
          ElMessage.error(res.message || '密码修改失败')
        }
      } catch (error) {
        ElMessage.error('密码修改失败，请检查网络连接')
      } finally {
        loading.value = false
      }
    }
  })
}

// 重置表单
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.resetFields()
}
</script>

<template>
  <div class="change-password-container">
    <el-card class="password-card">
      <template #header>
        <div class="card-header">
          <span>修改密码</span>
        </div>
      </template>

      <el-form
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="旧密码" prop="oldPassword">
          <el-input
            v-model="passwordForm.oldPassword"
            type="password"
            placeholder="请输入旧密码"
            show-password
          />
        </el-form-item>
        
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            placeholder="请输入新密码"
            show-password
          />
        </el-form-item>
        
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            show-password
          />
        </el-form-item>
        
        <el-form-item>
          <el-button 
            type="primary"
            :loading="loading"
            @click="submitForm(passwordFormRef)"
          >
            修改密码
          </el-button>
          <el-button @click="resetForm(passwordFormRef)">重置</el-button>
        </el-form-item>
      </el-form>
      
      <div class="password-tips">
        <p><el-icon><InfoFilled /></el-icon> 密码修改提示：</p>
        <ol>
          <li>密码长度必须在6-20个字符之间</li>
          <li>为保证安全，建议使用字母、数字和特殊字符的组合</li>
          <li>密码修改成功后，系统将自动退出并返回登录页</li>
        </ol>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.change-password-container {
  padding: 20px;
}

.password-card {
  max-width: 600px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header span {
  font-size: 18px;
  font-weight: 500;
}

.password-tips {
  margin-top: 20px;
  padding: 15px;
  background-color: #f2f6fc;
  border-radius: 4px;
}

.password-tips p {
  color: #409EFF;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  font-weight: 500;
}

.password-tips .el-icon {
  margin-right: 5px;
}

.password-tips ol {
  margin: 0;
  padding-left: 20px;
}

.password-tips li {
  line-height: 1.8;
  color: #606266;
}
</style> 