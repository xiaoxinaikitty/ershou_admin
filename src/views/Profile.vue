<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import * as userApi from '@/api/user'

const userStore = useUserStore()

// 表单数据
const profileForm = reactive({
  username: '',
  phone: '',
  email: '',
  avatar: '',
  role: '',
  balance: 0,
  createTime: ''
})

// 表单验证规则
const rules = reactive<FormRules>({
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
  ]
})

// 引用表单
const profileFormRef = ref<FormInstance>()
// 加载状态
const loading = ref(false)
// 是否只读模式
const isReadOnly = ref(true)

// 用户角色文本
const roleText = computed(() => {
  return profileForm.role === '系统管理员' ? '管理员' : '普通用户'
})

// 加载用户信息
const loadUserInfo = async () => {
  loading.value = true
  try {
    const userInfo = await userStore.fetchUserInfo()
    if (userInfo) {
      profileForm.username = userInfo.username || ''
      profileForm.phone = userInfo.phone || ''
      profileForm.email = userInfo.email || ''
      profileForm.avatar = userInfo.avatar || ''
      profileForm.role = userInfo.role || ''
      profileForm.balance = userInfo.balance || 0
      profileForm.createTime = userInfo.createTime || ''
    }
  } catch (error) {
    ElMessage.error('获取用户信息失败')
  } finally {
    loading.value = false
  }
}

// 切换编辑模式
const toggleEditMode = () => {
  isReadOnly.value = !isReadOnly.value
}

// 提交表单
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  
  await formEl.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const res = await userApi.updateUserInfo({
          phone: profileForm.phone,
          email: profileForm.email,
          avatar: profileForm.avatar
        })
        if (res.code === 0) {
          ElMessage.success('个人信息更新成功')
          // 重新获取用户信息
          await userStore.fetchUserInfo()
          isReadOnly.value = true
        } else {
          ElMessage.error(res.message || '更新失败')
        }
      } catch (error) {
        ElMessage.error('更新失败，请检查网络连接')
      } finally {
        loading.value = false
      }
    }
  })
}

// 取消编辑
const cancelEdit = () => {
  loadUserInfo()
  isReadOnly.value = true
}

// 页面加载时获取用户信息
onMounted(() => {
  loadUserInfo()
})
</script>

<template>
  <div class="profile-container">
    <el-card class="profile-card">
      <template #header>
        <div class="card-header">
          <span>个人信息</span>
          <div>
            <el-button v-if="isReadOnly" type="primary" @click="toggleEditMode">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <template v-else>
              <el-button type="primary" @click="submitForm(profileFormRef)">
                <el-icon><Check /></el-icon>
                保存
              </el-button>
              <el-button @click="cancelEdit">
                <el-icon><Close /></el-icon>
                取消
              </el-button>
            </template>
          </div>
        </div>
      </template>

      <el-form 
        ref="profileFormRef"
        :model="profileForm"
        :rules="rules"
        label-width="100px"
        :disabled="isReadOnly"
      >
        <el-row :gutter="20">
          <el-col :span="16">
            <el-form-item label="用户名">
              <el-input v-model="profileForm.username" disabled />
            </el-form-item>

            <el-form-item label="手机号" prop="phone">
              <el-input v-model="profileForm.phone" placeholder="请输入手机号" />
            </el-form-item>

            <el-form-item label="邮箱" prop="email">
              <el-input v-model="profileForm.email" placeholder="请输入邮箱" />
            </el-form-item>

            <el-form-item label="头像URL" prop="avatar">
              <el-input v-model="profileForm.avatar" placeholder="请输入头像URL" />
            </el-form-item>

            <el-form-item label="用户角色">
              <el-tag :type="profileForm.role === '系统管理员' ? 'danger' : 'info'">
                {{ roleText }}
              </el-tag>
            </el-form-item>

            <el-form-item label="账户余额">
              <span>{{ profileForm.balance.toFixed(2) }} 元</span>
            </el-form-item>

            <el-form-item label="注册时间">
              <span>{{ profileForm.createTime }}</span>
            </el-form-item>
          </el-col>
          
          <el-col :span="8">
            <div class="avatar-container">
              <el-avatar 
                :size="120" 
                :src="profileForm.avatar" 
                v-if="profileForm.avatar"
              />
              <el-avatar 
                :size="120" 
                v-else
              >
                {{ profileForm.username.substring(0, 1).toUpperCase() }}
              </el-avatar>
              <div class="avatar-tip" v-if="!isReadOnly">
                <p>提示：修改头像请输入图片URL</p>
              </div>
            </div>
          </el-col>
        </el-row>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.profile-container {
  padding: 20px;
}

.profile-card {
  max-width: 900px;
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

.avatar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
}

.avatar-tip {
  margin-top: 15px;
  color: #909399;
  font-size: 12px;
  text-align: center;
}
</style> 