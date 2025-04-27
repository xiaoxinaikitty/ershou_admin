<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as userApi from '@/api/user'
import { useUserStore } from '@/stores/user'

interface UserItem {
  userId: number
  username: string
  phone: string | null
  email: string | null
  role: string
  isLocked: boolean
  createTime: string
}

// 用户列表
const userList = ref<UserItem[]>([])
// 加载状态
const loading = ref(false)
// 搜索关键词
const searchKeyword = ref('')
// 用户商店
const userStore = useUserStore()

// 角色选项
const roleOptions = [
  { label: '普通用户', value: '普通用户' },
  { label: '系统管理员', value: '系统管理员' }
]

// 封禁理由表单
const banReasonForm = reactive({
  targetUserId: 0,
  banReason: ''
})

// 封禁原因对话框控制
const banDialogVisible = ref(false)

// 获取用户列表
const getUserList = async () => {
  loading.value = true
  try {
    // 调用真实接口
    const res = await userApi.getUserList({
      username: searchKeyword.value || undefined,
      pageNum: 1,
      pageSize: 10
    })
    
    if (res.code === 0) {
      userList.value = res.data.list
    } else {
      ElMessage.error(res.message || '获取用户列表失败')
    }
  } catch (error) {
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索用户
const handleSearch = () => {
  // 实际项目中可能需要调用后端接口进行搜索
  // 这里使用前端过滤模拟
  if (!searchKeyword.value) {
    getUserList()
    return
  }
  
  // 简单的前端搜索
  const keyword = searchKeyword.value.toLowerCase()
  getUserList().then(() => {
    userList.value = userList.value.filter(user => 
      user.username.toLowerCase().includes(keyword) || 
      (user.phone && user.phone.includes(keyword)) || 
      (user.email && user.email.toLowerCase().includes(keyword))
    )
  })
}

// 重置搜索
const resetSearch = () => {
  searchKeyword.value = ''
  getUserList()
}

// 修改用户角色
const handleRoleChange = async (userId: number, role: string) => {
  // 防止修改自己的角色
  if (userId === userStore.userInfo?.userId) {
    ElMessage.warning('不能修改自己的角色')
    // 恢复原始角色值
    getUserList()
    return
  }
  
  loading.value = true
  try {
    // 实际项目中调用接口
    // const res = await userApi.updateUserRole({ targetUserId: userId, role })
    // 模拟成功
    const user = userList.value.find(item => item.userId === userId)
    if (user) {
      user.role = role
      ElMessage.success('用户角色修改成功')
    }
  } catch (error) {
    ElMessage.error('修改用户角色失败')
    // 恢复原始角色值
    getUserList()
  } finally {
    loading.value = false
  }
}

// 打开封禁对话框
const openBanDialog = (userId: number) => {
  // 防止封禁自己
  if (userId === userStore.userInfo?.userId) {
    ElMessage.warning('不能封禁自己的账号')
    return
  }
  
  banReasonForm.targetUserId = userId
  banReasonForm.banReason = ''
  banDialogVisible.value = true
}

// 封禁用户
const banUser = async () => {
  loading.value = true
  try {
    // 实际项目中调用接口
    // const res = await userApi.banUser(banReasonForm)
    // 模拟成功
    const user = userList.value.find(item => item.userId === banReasonForm.targetUserId)
    if (user) {
      user.isLocked = true
      ElMessage.success('用户封禁成功')
      banDialogVisible.value = false
    }
  } catch (error) {
    ElMessage.error('封禁用户失败')
  } finally {
    loading.value = false
  }
}

// 解封用户
const unbanUser = async (userId: number) => {
  loading.value = true
  try {
    // 实际项目中调用接口
    // const res = await userApi.unbanUser(userId)
    // 模拟成功
    const user = userList.value.find(item => item.userId === userId)
    if (user) {
      user.isLocked = false
      ElMessage.success('用户解封成功')
    }
  } catch (error) {
    ElMessage.error('解封用户失败')
  } finally {
    loading.value = false
  }
}

// 页面加载时获取用户列表
onMounted(() => {
  getUserList()
})
</script>

<template>
  <div class="user-management-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
          <div class="search-box">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索用户名/手机/邮箱"
              clearable
              @keyup.enter="handleSearch"
            >
              <template #append>
                <el-button @click="handleSearch">
                  <el-icon><Search /></el-icon>
                </el-button>
              </template>
            </el-input>
            <el-button @click="resetSearch">重置</el-button>
          </div>
        </div>
      </template>
      
      <div v-loading="loading">
        <el-table
          :data="userList"
          style="width: 100%"
          stripe
          border
        >
          <el-table-column type="index" width="50" />
          
          <el-table-column prop="username" label="用户名" width="120" />
          
          <el-table-column prop="phone" label="手机号" width="120">
            <template #default="scope">
              {{ scope.row.phone || '-' }}
            </template>
          </el-table-column>
          
          <el-table-column prop="email" label="邮箱" width="200">
            <template #default="scope">
              {{ scope.row.email || '-' }}
            </template>
          </el-table-column>
          
          <el-table-column prop="role" label="角色" width="150">
            <template #default="scope">
              <el-select 
                v-model="scope.row.role" 
                placeholder="选择角色"
                @change="handleRoleChange(scope.row.userId, scope.row.role)"
                :disabled="scope.row.userId === userStore.userInfo?.userId"
              >
                <el-option
                  v-for="item in roleOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </template>
          </el-table-column>
          
          <el-table-column prop="isLocked" label="状态" width="100">
            <template #default="scope">
              <el-tag 
                :type="scope.row.isLocked ? 'danger' : 'success'"
                effect="dark"
              >
                {{ scope.row.isLocked ? '已封禁' : '正常' }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column prop="createTime" label="注册时间" width="180" />
          
          <el-table-column label="操作">
            <template #default="scope">
              <el-button
                v-if="!scope.row.isLocked"
                type="danger"
                link
                @click="openBanDialog(scope.row.userId)"
                :disabled="scope.row.userId === userStore.userInfo?.userId"
              >
                封禁
              </el-button>
              <el-button
                v-else
                type="primary"
                link
                @click="unbanUser(scope.row.userId)"
              >
                解封
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
    
    <!-- 封禁用户对话框 -->
    <el-dialog
      title="封禁用户"
      v-model="banDialogVisible"
      width="500px"
    >
      <el-form>
        <el-form-item label="封禁原因" label-width="100px">
          <el-input
            v-model="banReasonForm.banReason"
            type="textarea"
            placeholder="请输入封禁原因"
            :rows="4"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="banDialogVisible = false">取消</el-button>
        <el-button 
          type="primary" 
          :loading="loading"
          @click="banUser"
        >
          确定封禁
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.user-management-container {
  padding: 20px;
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

.search-box {
  display: flex;
  width: 300px;
}

.search-box .el-input {
  margin-right: 10px;
}
</style> 