<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import * as userApi from '@/api/user'

interface AddressItem {
  addressId: number
  userId: number
  consignee: string
  region: string
  detail: string
  contactPhone: string
  isDefault: boolean
  createTime: string
}

// 地址列表
const addressList = ref<AddressItem[]>([])
// 加载状态
const loading = ref(false)
// 地址表单显示控制
const dialogVisible = ref(false)
// 是否是编辑模式
const isEdit = ref(false)

// 地址表单数据
const addressForm = reactive({
  addressId: 0,
  consignee: '',
  region: '',
  detail: '',
  contactPhone: '',
  isDefault: false
})

// 表单验证规则
const rules = reactive<FormRules>({
  consignee: [
    { required: true, message: '请输入收货人姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  region: [
    { required: true, message: '请选择所在地区', trigger: 'blur' }
  ],
  detail: [
    { required: true, message: '请输入详细地址', trigger: 'blur' },
    { min: 5, max: 100, message: '长度在 5 到 100 个字符', trigger: 'blur' }
  ],
  contactPhone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ]
})

// 引用表单
const addressFormRef = ref<FormInstance>()

// 获取地址列表
const getAddressList = async () => {
  loading.value = true
  try {
    // 调用API获取地址列表
    const res = await userApi.getUserAddressList()
    if (res.code === 0) {
      addressList.value = res.data || []
    } else {
      ElMessage.error(res.message || '获取地址列表失败')
    }
  } catch (error) {
    ElMessage.error('获取地址列表失败')
  } finally {
    loading.value = false
  }
}

// 打开新增地址对话框
const openAddDialog = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

// 打开编辑地址对话框
const openEditDialog = (address: AddressItem) => {
  isEdit.value = true
  // 复制数据到表单
  addressForm.addressId = address.addressId
  addressForm.consignee = address.consignee
  addressForm.region = address.region
  addressForm.detail = address.detail
  addressForm.contactPhone = address.contactPhone
  addressForm.isDefault = address.isDefault
  dialogVisible.value = true
}

// 重置表单
const resetForm = () => {
  addressForm.addressId = 0
  addressForm.consignee = ''
  addressForm.region = ''
  addressForm.detail = ''
  addressForm.contactPhone = ''
  addressForm.isDefault = false
}

// 提交地址表单
const submitAddressForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  
  await formEl.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        if (isEdit.value) {
          // 编辑现有地址 - 目前API中没有提供更新地址的方法
          ElMessage.info('当前API暂未提供更新地址的功能')
        } else {
          // 新增地址
          const res = await userApi.addUserAddressByUser({
            consignee: addressForm.consignee,
            region: addressForm.region,
            detail: addressForm.detail,
            contactPhone: addressForm.contactPhone,
            isDefault: addressForm.isDefault
          })
          
          if (res.code === 0) {
          ElMessage.success('地址添加成功')
            // 添加成功后重新获取地址列表
            await getAddressList()
        dialogVisible.value = false
        resetForm()
          } else {
            ElMessage.error(res.message || '添加地址失败')
          }
        }
      } catch (error) {
        ElMessage.error(isEdit.value ? '更新地址失败' : '添加地址失败')
      } finally {
        loading.value = false
      }
    }
  })
}

// 删除地址 - 目前API中没有提供删除地址的方法
const deleteAddress = (id: number) => {
  ElMessageBox.confirm('确定要删除该地址吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.info('当前API暂未提供删除地址的功能')
  }).catch(() => {
    // 用户取消删除
  })
}

// 设为默认地址 - 目前API中没有提供设置默认地址的方法
const setAsDefault = (id: number) => {
  ElMessage.info('当前API暂未提供设置默认地址的功能')
}

// 页面加载时获取地址列表
onMounted(() => {
  getAddressList()
})
</script>

<template>
  <div class="address-container">
    <el-card class="address-card">
      <template #header>
        <div class="card-header">
          <span>收货地址管理</span>
          <el-button type="primary" @click="openAddDialog">
            <el-icon><Plus /></el-icon>新增地址
          </el-button>
        </div>
      </template>
      
      <div v-loading="loading">
        <el-empty 
          description="暂无收货地址" 
          v-if="addressList.length === 0"
        >
          <el-button type="primary" @click="openAddDialog">添加地址</el-button>
        </el-empty>
        
        <div class="address-list" v-else>
          <el-card 
            v-for="item in addressList" 
            :key="item.addressId"
            class="address-item"
            :class="{ 'is-default': item.isDefault }"
            shadow="hover"
          >
            <div class="address-content">
              <div class="address-info">
                <div class="address-title">
                  <span class="name">{{ item.consignee }}</span>
                  <span class="phone">{{ item.contactPhone }}</span>
                  <el-tag size="small" type="danger" v-if="item.isDefault">默认</el-tag>
                </div>
                <div class="address-detail">
                  {{ item.region }} {{ item.detail }}
                </div>
              </div>
              
              <div class="address-actions">
                <el-button 
                  type="primary" 
                  link 
                  @click="openEditDialog(item)"
                >
                  编辑
                </el-button>
                <el-button 
                  type="primary" 
                  link 
                  @click="deleteAddress(item.addressId)"
                >
                  删除
                </el-button>
                <el-button 
                  type="primary" 
                  link 
                  @click="setAsDefault(item.addressId)"
                  v-if="!item.isDefault"
                >
                  设为默认
                </el-button>
              </div>
            </div>
          </el-card>
        </div>
      </div>
    </el-card>
    
    <!-- 新增/编辑地址对话框 -->
    <el-dialog
      :title="isEdit ? '编辑地址' : '新增地址'"
      v-model="dialogVisible"
      width="500px"
    >
      <el-form
        ref="addressFormRef"
        :model="addressForm"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="收货人" prop="consignee">
          <el-input 
            v-model="addressForm.consignee"
            placeholder="请输入收货人姓名"
          />
        </el-form-item>
        
        <el-form-item label="所在地区" prop="region">
          <el-input 
            v-model="addressForm.region"
            placeholder="请选择所在地区"
          />
        </el-form-item>
        
        <el-form-item label="详细地址" prop="detail">
          <el-input 
            v-model="addressForm.detail"
            type="textarea"
            placeholder="请输入详细地址"
            :rows="2"
          />
        </el-form-item>
        
        <el-form-item label="联系电话" prop="contactPhone">
          <el-input 
            v-model="addressForm.contactPhone"
            placeholder="请输入联系电话"
          />
        </el-form-item>
        
        <el-form-item label="默认地址">
          <el-switch v-model="addressForm.isDefault" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button 
          type="primary" 
          :loading="loading"
          @click="submitAddressForm(addressFormRef)"
        >
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.address-container {
  padding: 20px;
}

.address-card {
  max-width: 1000px;
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

.address-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.address-item {
  transition: all 0.3s;
  border: 1px solid #ebeef5;
}

.address-item.is-default {
  border-color: #f56c6c;
}

.address-content {
  display: flex;
  justify-content: space-between;
}

.address-info {
  flex: 1;
}

.address-title {
  margin-bottom: 8px;
}

.name {
  font-weight: bold;
  margin-right: 10px;
}

.phone {
  color: #606266;
  margin-right: 10px;
}

.address-detail {
  color: #606266;
  line-height: 1.5;
}

.address-actions {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
</style>