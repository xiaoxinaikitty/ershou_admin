<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import * as productApi from '@/api/product'

interface ShippingAddressItem {
  addressId: number
  userId: number
  shipperName: string
  region: string
  detail: string
  contactPhone: string
  isDefault: boolean
  createTime: string
}

// 地址列表
const addressList = ref<ShippingAddressItem[]>([])
// 加载状态
const loading = ref(false)
// 地址表单显示控制
const dialogVisible = ref(false)
// 是否是编辑模式
const isEdit = ref(false)

// 地址表单数据
const addressForm = reactive({
  addressId: 0,
  shipperName: '',
  region: '',
  detail: '',
  contactPhone: '',
  isDefault: false
})

// 表单验证规则
const rules = reactive<FormRules>({
  shipperName: [
    { required: true, message: '请输入发货人姓名', trigger: 'blur' },
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
    const res = await productApi.getShippingAddressList()
    if (res.code === 0) {
      addressList.value = res.data || []
    } else {
      ElMessage.error(res.message || '获取发货地址列表失败')
    }
  } catch (error) {
    ElMessage.error('获取发货地址列表失败')
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
const openEditDialog = (address: ShippingAddressItem) => {
  isEdit.value = true
  // 复制数据到表单
  addressForm.addressId = address.addressId
  addressForm.shipperName = address.shipperName
  addressForm.region = address.region
  addressForm.detail = address.detail
  addressForm.contactPhone = address.contactPhone
  addressForm.isDefault = address.isDefault
  dialogVisible.value = true
}

// 重置表单
const resetForm = () => {
  addressForm.addressId = 0
  addressForm.shipperName = ''
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
          ElMessage.info('当前API暂未提供更新发货地址的功能')
        } else {
          // 新增地址
          const res = await productApi.addShippingAddress({
            shipperName: addressForm.shipperName,
            region: addressForm.region,
            detail: addressForm.detail,
            contactPhone: addressForm.contactPhone,
            isDefault: addressForm.isDefault
          })
          
          if (res.code === 0) {
            ElMessage.success('发货地址添加成功')
            // 添加成功后重新获取地址列表
            await getAddressList()
            dialogVisible.value = false
            resetForm()
          } else {
            ElMessage.error(res.message || '添加发货地址失败')
          }
        }
      } catch (error) {
        ElMessage.error(isEdit.value ? '更新发货地址失败' : '添加发货地址失败')
      } finally {
        loading.value = false
      }
    }
  })
}

// 删除地址 - 目前API中没有提供删除地址的方法
const deleteAddress = (id: number) => {
  ElMessageBox.confirm('确定要删除该发货地址吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.info('当前API暂未提供删除发货地址的功能')
  }).catch(() => {
    // 用户取消删除
  })
}

// 设为默认地址 - 目前API中没有提供设置默认地址的方法
const setAsDefault = (id: number) => {
  ElMessage.info('当前API暂未提供设置默认发货地址的功能')
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
          <span>发货地址管理</span>
          <el-button type="primary" @click="openAddDialog">
            <el-icon><Plus /></el-icon>新增发货地址
          </el-button>
        </div>
      </template>
      
      <div v-loading="loading">
        <el-empty 
          description="暂无发货地址" 
          v-if="addressList.length === 0"
        >
          <el-button type="primary" @click="openAddDialog">添加发货地址</el-button>
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
                  <span class="name">{{ item.shipperName }}</span>
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
      :title="isEdit ? '编辑发货地址' : '新增发货地址'"
      v-model="dialogVisible"
      width="500px"
    >
      <el-form
        ref="addressFormRef"
        :model="addressForm"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="发货人" prop="shipperName">
          <el-input v-model="addressForm.shipperName" placeholder="请输入发货人姓名" />
        </el-form-item>
        
        <el-form-item label="所在地区" prop="region">
          <el-input v-model="addressForm.region" placeholder="请输入所在地区" />
        </el-form-item>
        
        <el-form-item label="详细地址" prop="detail">
          <el-input 
            v-model="addressForm.detail" 
            type="textarea" 
            :rows="2" 
            placeholder="请输入详细地址"
          />
        </el-form-item>
        
        <el-form-item label="联系电话" prop="contactPhone">
          <el-input v-model="addressForm.contactPhone" placeholder="请输入手机号码" />
        </el-form-item>
        
        <el-form-item label="设为默认" prop="isDefault">
          <el-switch 
            v-model="addressForm.isDefault" 
            active-text="是" 
            inactive-text="否"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitAddressForm(addressFormRef)">
            确认
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.address-container {
  padding: 20px;
}

.address-card {
  width: 100%;
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.address-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.address-item {
  position: relative;
  transition: all 0.3s;
}

.address-item.is-default {
  border: 1px solid #f56c6c;
}

.address-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.address-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 5px;
}

.name {
  font-weight: bold;
  font-size: 16px;
}

.phone {
  color: #666;
}

.address-detail {
  color: #333;
  line-height: 1.5;
}

.address-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style> 