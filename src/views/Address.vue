<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import * as userApi from '@/api/user'

interface AddressItem {
  id: number
  consignee: string
  region: string
  detail: string
  contactPhone: string
  isDefault: boolean
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
  id: 0,
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
    // 模拟接口，实际项目中需替换为真实接口
    // const res = await userApi.getAddressList()
    // 模拟数据
    setTimeout(() => {
      addressList.value = [
        {
          id: 1,
          consignee: '张三',
          region: '北京市海淀区',
          detail: '中关村科技园A座101室',
          contactPhone: '13812345678',
          isDefault: true
        },
        {
          id: 2,
          consignee: '李四',
          region: '上海市浦东新区',
          detail: '张江高科技园区博云路2号',
          contactPhone: '13987654321',
          isDefault: false
        }
      ]
      loading.value = false
    }, 500)
  } catch (error) {
    ElMessage.error('获取地址列表失败')
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
  Object.assign(addressForm, address)
  dialogVisible.value = true
}

// 重置表单
const resetForm = () => {
  addressForm.id = 0
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
          // 编辑现有地址，模拟更新成功
          const index = addressList.value.findIndex(item => item.id === addressForm.id)
          if (index !== -1) {
            // 如果设为默认地址，其他地址取消默认
            if (addressForm.isDefault) {
              addressList.value.forEach(item => {
                item.isDefault = false
              })
            }
            addressList.value[index] = { ...addressForm }
            ElMessage.success('地址更新成功')
          }
        } else {
          // 新增地址
          // 实际项目中使用后端返回的id
          // const res = await userApi.addUserAddress(addressForm)
          // 模拟新增成功
          const newAddress = { 
            ...addressForm,
            id: Date.now() // 使用时间戳模拟id
          }
          
          // 如果设为默认地址，其他地址取消默认
          if (newAddress.isDefault) {
            addressList.value.forEach(item => {
              item.isDefault = false
            })
          }
          
          addressList.value.push(newAddress)
          ElMessage.success('地址添加成功')
        }
        
        dialogVisible.value = false
        resetForm()
      } catch (error) {
        ElMessage.error(isEdit.value ? '更新地址失败' : '添加地址失败')
      } finally {
        loading.value = false
      }
    }
  })
}

// 删除地址
const deleteAddress = (id: number) => {
  ElMessageBox.confirm('确定要删除该地址吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 实际项目中调用删除接口
    // await userApi.deleteAddress(id)
    // 模拟删除成功
    addressList.value = addressList.value.filter(item => item.id !== id)
    ElMessage.success('地址删除成功')
  }).catch(() => {
    // 用户取消删除
  })
}

// 设为默认地址
const setAsDefault = (id: number) => {
  // 设置当前地址为默认
  addressList.value.forEach(item => {
    item.isDefault = item.id === id
  })
  ElMessage.success('默认地址设置成功')
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
            :key="item.id"
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
                  @click="deleteAddress(item.id)"
                >
                  删除
                </el-button>
                <el-button 
                  type="primary" 
                  link 
                  @click="setAsDefault(item.id)"
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