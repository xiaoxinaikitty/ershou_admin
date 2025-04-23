<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as orderApi from '@/api/order'
import * as productApi from '@/api/product'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 商品ID
const productId = Number(route.params.productId || 0)
// 卖家ID
const sellerId = Number(route.query.sellerId || 0)

// 商品信息
interface Product {
  productId: number
  title: string
  description: string
  price: number
  originalPrice: number
  conditionLevel: number
  status: number
  location: string
  imageUrl?: string
}

const product = ref<Product | null>(null)
const loading = ref(false)

// 收货地址列表
interface Address {
  addressId: number
  consignee: string
  region: string
  detail: string
  contactPhone: string
  isDefault: boolean
}

const addressList = ref<Address[]>([])
const selectedAddressId = ref<number | null>(null)

// 订单表单
const orderForm = reactive({
  paymentType: 1, // 支付方式：1-在线支付，2-货到付款
  deliveryType: 2, // 配送方式：1-自提，2-快递
  deliveryFee: 0, // 运费
  remark: '', // 订单备注
  address: {
    receiverName: '',
    receiverPhone: '',
    province: '',
    city: '',
    district: '',
    detailAddress: ''
  }
})

// 获取商品详情
const fetchProductDetail = async () => {
  if (!productId) {
    ElMessage.error('商品ID不能为空')
    return
  }

  loading.value = true
  try {
    const res = await productApi.getProductDetail(productId)
    if (res.code === 0) {
      product.value = res.data
      
      // 检查是否是自己的商品
      if (product.value && product.value.sellerId === userStore.userInfo?.userId) {
        ElMessage.error('不能购买自己发布的商品')
        router.push('/product-management')
        return
      }
    } else {
      ElMessage.error(res.message || '获取商品信息失败')
      router.push('/product-management')
    }
  } catch (error) {
    console.error('获取商品信息失败:', error)
    ElMessage.error('获取商品信息失败')
    router.push('/product-management')
  } finally {
    loading.value = false
  }
}

// 获取用户地址列表
const fetchAddressList = async () => {
  try {
    // 这里调用获取地址列表的API，目前使用模拟数据
    // 实际开发中这里应该调用地址API
    // const res = await addressApi.getAddressList()
    
    // 模拟数据
    const mockAddresses: Address[] = [
      {
        addressId: 1,
        consignee: '张三',
        region: '北京市 北京市 海淀区',
        detail: '中关村大街1号',
        contactPhone: '13800138000',
        isDefault: true
      },
      {
        addressId: 2,
        consignee: '李四',
        region: '上海市 上海市 浦东新区',
        detail: '张江高科技园区',
        contactPhone: '13900139000',
        isDefault: false
      }
    ]
    
    addressList.value = mockAddresses
    
    // 默认选中默认地址
    const defaultAddress = addressList.value.find(addr => addr.isDefault)
    if (defaultAddress) {
      selectedAddressId.value = defaultAddress.addressId
      updateAddressForm(defaultAddress)
    } else if (addressList.value.length > 0) {
      selectedAddressId.value = addressList.value[0].addressId
      updateAddressForm(addressList.value[0])
    }
  } catch (error) {
    console.error('获取地址列表失败:', error)
    ElMessage.error('获取地址列表失败')
  }
}

// 更新地址表单
const updateAddressForm = (address: Address) => {
  const [province, city, district] = address.region.split(' ')
  orderForm.address.receiverName = address.consignee
  orderForm.address.receiverPhone = address.contactPhone
  orderForm.address.province = province
  orderForm.address.city = city
  orderForm.address.district = district
  orderForm.address.detailAddress = address.detail
}

// 选择地址
const handleSelectAddress = (addressId: number) => {
  selectedAddressId.value = addressId
  const selectedAddress = addressList.value.find(addr => addr.addressId === addressId)
  if (selectedAddress) {
    updateAddressForm(selectedAddress)
  }
}

// 配送方式改变
const handleDeliveryTypeChange = () => {
  // 如果是自提，运费为0
  if (orderForm.deliveryType === 1) {
    orderForm.deliveryFee = 0
  } else {
    // 如果是快递，根据距离计算运费(模拟)
    orderForm.deliveryFee = 15
  }
}

// 计算订单总金额
const calculateTotal = () => {
  if (!product.value) return 0
  return product.value.price + orderForm.deliveryFee
}

// 提交订单
const handleSubmitOrder = async () => {
  if (!product.value) {
    ElMessage.error('商品信息不完整')
    return
  }

  // 表单验证
  if (!orderForm.address.receiverName || !orderForm.address.receiverPhone) {
    ElMessage.error('收货人信息不完整')
    return
  }

  try {
    const res = await orderApi.createOrder({
      productId,
      sellerId,
      paymentType: orderForm.paymentType,
      deliveryType: orderForm.deliveryType,
      orderAmount: product.value.price,
      paymentAmount: calculateTotal(),
      deliveryFee: orderForm.deliveryFee,
      remark: orderForm.remark,
      address: orderForm.address
    })

    if (res.code === 0) {
      ElMessageBox.confirm('订单创建成功，是否立即支付？', '提示', {
        confirmButtonText: '立即支付',
        cancelButtonText: '稍后支付',
        type: 'success'
      }).then(() => {
        // 跳转到订单管理页面并打开支付对话框
        router.push({
          path: '/order-management',
          query: { 
            action: 'pay',
            orderId: res.data.orderId
          }
        })
      }).catch(() => {
        // 跳转到订单管理页面
        router.push('/order-management')
      })
    } else {
      ElMessage.error(res.message || '创建订单失败')
    }
  } catch (error) {
    console.error('创建订单失败:', error)
    ElMessage.error('创建订单失败')
  }
}

// 页面加载时获取数据
onMounted(() => {
  fetchProductDetail()
  fetchAddressList()
})
</script>

<template>
  <div class="create-order">
    <el-card class="order-card" v-loading="loading">
      <template #header>
        <div class="card-header">
          <span>确认订单信息</span>
        </div>
      </template>

      <div v-if="product" class="order-content">
        <!-- 商品信息 -->
        <el-card class="product-card">
          <div class="product-info">
            <div class="product-image" v-if="product.imageUrl">
              <el-image 
                :src="product.imageUrl" 
                fit="cover"
                style="width: 100px; height: 100px"
              ></el-image>
            </div>
            <div class="product-details">
              <h3 class="product-title">{{ product.title }}</h3>
              <p class="product-description">{{ product.description }}</p>
              <div class="product-price">
                <span class="current-price">¥{{ product.price.toFixed(2) }}</span>
                <span class="original-price">原价: ¥{{ product.originalPrice.toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 收货地址 -->
        <el-card class="address-card">
          <template #header>
            <div class="section-header">
              <span>收货地址</span>
              <el-button type="primary" size="small" link>管理收货地址</el-button>
            </div>
          </template>

          <div class="address-list" v-if="addressList.length > 0">
            <el-radio-group v-model="selectedAddressId" @change="handleSelectAddress">
              <div v-for="address in addressList" :key="address.addressId" class="address-item">
                <el-radio :label="address.addressId">
                  <div class="address-content">
                    <div class="address-info">
                      <span class="consignee">{{ address.consignee }}</span>
                      <span class="phone">{{ address.contactPhone }}</span>
                      <span v-if="address.isDefault" class="default-tag">默认</span>
                    </div>
                    <div class="address-detail">{{ address.region }} {{ address.detail }}</div>
                  </div>
                </el-radio>
              </div>
            </el-radio-group>
          </div>
          
          <el-empty v-else description="暂无收货地址" class="address-empty">
            <el-button type="primary">添加地址</el-button>
          </el-empty>
        </el-card>

        <!-- 配送方式 -->
        <el-card class="delivery-card">
          <template #header>
            <div class="section-header">
              <span>配送方式</span>
            </div>
          </template>

          <el-radio-group v-model="orderForm.deliveryType" @change="handleDeliveryTypeChange">
            <el-radio :label="1">自提</el-radio>
            <el-radio :label="2">快递</el-radio>
          </el-radio-group>
          
          <div v-if="orderForm.deliveryType === 2" class="delivery-fee">
            <span>运费: </span>
            <span class="fee">¥{{ orderForm.deliveryFee.toFixed(2) }}</span>
          </div>
        </el-card>

        <!-- 支付方式 -->
        <el-card class="payment-card">
          <template #header>
            <div class="section-header">
              <span>支付方式</span>
            </div>
          </template>

          <el-radio-group v-model="orderForm.paymentType">
            <el-radio :label="1">在线支付</el-radio>
            <el-radio :label="2">货到付款</el-radio>
          </el-radio-group>
        </el-card>

        <!-- 订单备注 -->
        <el-card class="remark-card">
          <template #header>
            <div class="section-header">
              <span>订单备注</span>
            </div>
          </template>

          <el-input 
            v-model="orderForm.remark" 
            type="textarea" 
            :rows="2" 
            placeholder="请输入订单备注信息"
            maxlength="100"
            show-word-limit
          ></el-input>
        </el-card>

        <!-- 订单金额 -->
        <el-card class="total-card">
          <div class="order-total">
            <div class="total-row">
              <span class="label">商品金额:</span>
              <span class="value">¥{{ product.price.toFixed(2) }}</span>
            </div>
            <div class="total-row">
              <span class="label">运费:</span>
              <span class="value">¥{{ orderForm.deliveryFee.toFixed(2) }}</span>
            </div>
            <div class="total-row total-amount">
              <span class="label">实付金额:</span>
              <span class="value price">¥{{ calculateTotal().toFixed(2) }}</span>
            </div>
          </div>
        </el-card>

        <!-- 提交订单 -->
        <div class="submit-bar">
          <div class="submit-info">
            <span class="submit-total">实付金额: <span class="price">¥{{ calculateTotal().toFixed(2) }}</span></span>
          </div>
          <el-button type="primary" size="large" @click="handleSubmitOrder">提交订单</el-button>
        </div>
      </div>

      <el-empty v-else-if="!loading" description="商品信息不存在">
        <el-button type="primary" @click="router.push('/product-management')">返回商品列表</el-button>
      </el-empty>
    </el-card>
  </div>
</template>

<style scoped>
.create-order {
  padding: 20px;
}

.order-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-card {
  margin-bottom: 20px;
}

.product-info {
  display: flex;
  gap: 20px;
}

.product-details {
  flex: 1;
}

.product-title {
  margin: 0 0 10px 0;
  font-size: 18px;
}

.product-description {
  color: #606266;
  margin-bottom: 10px;
}

.product-price {
  display: flex;
  align-items: center;
  gap: 10px;
}

.current-price {
  color: #f56c6c;
  font-size: 18px;
  font-weight: bold;
}

.original-price {
  color: #909399;
  text-decoration: line-through;
  font-size: 14px;
}

.address-card, .delivery-card, .payment-card, .remark-card, .total-card {
  margin-bottom: 20px;
}

.address-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.address-item {
  padding: 10px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.address-item:hover {
  background-color: #f5f7fa;
}

.address-content {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.address-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.consignee {
  font-weight: bold;
}

.phone {
  color: #606266;
}

.default-tag {
  background-color: #f56c6c;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}

.address-detail {
  color: #606266;
}

.delivery-fee {
  margin-top: 10px;
  color: #606266;
}

.fee {
  color: #f56c6c;
  font-weight: bold;
}

.order-total {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-end;
}

.total-row {
  display: flex;
  gap: 10px;
}

.total-amount {
  font-size: 16px;
  font-weight: bold;
}

.price {
  color: #f56c6c;
  font-weight: bold;
}

.submit-bar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 20px;
  margin-top: 20px;
  padding: 15px;
  background-color: #f8f8f8;
  border-radius: 4px;
}

.submit-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.submit-total {
  font-size: 16px;
}

.address-empty {
  padding: 20px 0;
}
</style> 