<script setup lang="ts">
import { ref, onMounted, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as orderApi from '@/api/order'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 订单状态枚举
enum OrderStatus {
  PENDING_PAYMENT = 0,
  PENDING_SHIPMENT = 1,
  PENDING_RECEIPT = 2,
  COMPLETED = 3,
  CANCELLED = 4,
  AFTER_SALE = 5
}

// 订单状态文本映射
const orderStatusText = {
  [OrderStatus.PENDING_PAYMENT]: '待付款',
  [OrderStatus.PENDING_SHIPMENT]: '待发货',
  [OrderStatus.PENDING_RECEIPT]: '待收货',
  [OrderStatus.COMPLETED]: '已完成',
  [OrderStatus.CANCELLED]: '已取消',
  [OrderStatus.AFTER_SALE]: '售后中'
}

// 订单状态标签类型
const orderStatusTagType = {
  [OrderStatus.PENDING_PAYMENT]: 'warning',
  [OrderStatus.PENDING_SHIPMENT]: 'primary',
  [OrderStatus.PENDING_RECEIPT]: 'info',
  [OrderStatus.COMPLETED]: 'success',
  [OrderStatus.CANCELLED]: 'danger',
  [OrderStatus.AFTER_SALE]: ''
}

// 支付方式映射
const paymentTypeText = {
  1: '在线支付',
  2: '货到付款'
}

// 配送方式映射
const deliveryTypeText = {
  1: '自提',
  2: '快递'
}

// 支付方式映射
const payMethodText = {
  1: '支付宝',
  2: '微信',
  3: '银行卡'
}

// 订单列表
interface Order {
  orderId: number
  orderNo: string
  userId: number
  sellerId: number
  productId: number
  productTitle: string
  orderAmount: number
  paymentAmount: number
  orderStatus: number
  paymentType: number
  deliveryType: number
  deliveryFee: number
  remark: string
  createdTime: string
  address: orderApi.AddressInfo
  deliveryInfo?: {
    expressCompany: string
    expressNo: string
    deliveryTime: string
  }
  paymentInfo?: {
    paymentId: number
    paymentMethod: number
    paymentTime: string
  }
}

const orderList = ref<Order[]>([])
const loading = ref(false)
const totalOrders = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

// 搜索表单
const searchForm = reactive({
  status: '',
  orderNo: '',
  startDate: '',
  endDate: '',
  sortField: 'createdTime', // 默认排序字段
  sortOrder: 'desc' // 默认排序顺序
})

// 重置搜索表单
const resetSearchForm = () => {
  searchForm.status = ''
  searchForm.orderNo = ''
  searchForm.startDate = ''
  searchForm.endDate = ''
  fetchOrderList()
}

// 获取订单列表
const fetchOrderList = async () => {
  loading.value = true
  try {
    // 构建请求参数
    const params: any = {
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      // 添加多种排序参数格式，增加与后端兼容性
      sortField: searchForm.sortField,
      sortOrder: searchForm.sortOrder,
      // 常见后端API排序参数名称
      sort: searchForm.sortField,
      order: searchForm.sortOrder,
      orderBy: searchForm.sortField,
      orderDir: searchForm.sortOrder,
      sortBy: searchForm.sortField,
      sortDirection: searchForm.sortOrder
    }

    if (searchForm.status !== '') {
      params.status = Number(searchForm.status)
    }

    if (searchForm.orderNo) {
      params.orderNo = searchForm.orderNo
    }

    if (searchForm.startDate) {
      params.startDate = formatDate(searchForm.startDate)
    }

    if (searchForm.endDate) {
      params.endDate = formatDate(searchForm.endDate)
    }

    console.log('获取订单列表请求参数:', params)
    const res = await orderApi.getOrderList(params)
    
    if (res.code === 0 && res.data) {
      console.log('获取到的订单数据:', res.data)
      
      // 处理每个订单，确保商品名称正确显示
      const orders = res.data
      const ordersWithProductInfo = []
      
      for (const order of orders) {
        // 检查是否有商品名称
        if (!order.productTitle || order.productTitle.trim() === '') {
          console.log(`订单 ${order.orderId} 的商品名称为空，尝试获取商品信息`)
          
          try {
            // 方法1: 尝试获取订单详情，因为订单详情中可能包含商品标题
            const detailRes = await orderApi.getOrderDetail(order.orderId)
            if (detailRes.code === 0 && detailRes.data && detailRes.data.productTitle) {
              order.productTitle = detailRes.data.productTitle
              console.log(`通过订单详情获取到商品名称: ${order.productTitle}`)
            } else {
              // 方法2: 如果订单详情没有，尝试通过商品ID直接获取商品详情
              console.log(`订单详情中无商品名称，尝试通过商品ID获取商品详情: ${order.productId}`)
              
              try {
                const productRes = await orderApi.getProductDetail(order.productId)
                if (productRes.code === 0 && productRes.data && productRes.data.title) {
                  order.productTitle = productRes.data.title
                  console.log(`通过商品详情获取到商品名称: ${order.productTitle}`)
                } else {
                  // 如果商品详情也没获取到，使用商品ID作为标识
                  order.productTitle = `商品ID: ${order.productId}`
                  console.log(`未能获取到商品名称，使用商品ID: ${order.productId}`)
                }
              } catch (productError) {
                console.error(`获取商品 ${order.productId} 的详情失败:`, productError)
                order.productTitle = `商品ID: ${order.productId}`
              }
            }
          } catch (error) {
            console.error(`获取订单 ${order.orderId} 的详情失败:`, error)
            order.productTitle = `商品ID: ${order.productId}`
          }
        }
        
        ordersWithProductInfo.push(order)
      }
      
      // 确保在前端进行排序，按照创建时间降序排列
      ordersWithProductInfo.sort((a, b) => {
        // 创建日期比较
        const dateA = parseDateTime(a.createdTime)
        const dateB = parseDateTime(b.createdTime)
        return dateB.getTime() - dateA.getTime() // 降序排列
      })
      
      console.log('前端排序后的订单数据:', ordersWithProductInfo)
      orderList.value = ordersWithProductInfo
      totalOrders.value = res.total || res.data.length
      
      console.log('处理后的订单数据:', orderList.value)
    } else {
      ElMessage.error(res.message || '获取订单列表失败')
    }
  } catch (error) {
    console.error('获取订单列表失败:', error)
    ElMessage.error('获取订单列表失败')
  } finally {
    loading.value = false
  }
}

// 解析日期字符串，支持多种格式
const parseDateTime = (dateStr: string): Date => {
  if (!dateStr) return new Date(0)
  
  try {
    // 尝试直接解析标准格式
    const parsedDate = new Date(dateStr)
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate
    }
    
    // 尝试解析常见格式: "yyyy-MM-dd HH:mm:ss"
    const pattern = /(\d{4})-(\d{1,2})-(\d{1,2})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/
    const match = dateStr.match(pattern)
    
    if (match) {
      const year = parseInt(match[1])
      const month = parseInt(match[2]) - 1 // 月份从0开始
      const day = parseInt(match[3])
      const hour = match[4] ? parseInt(match[4]) : 0
      const minute = match[5] ? parseInt(match[5]) : 0
      const second = match[6] ? parseInt(match[6]) : 0
      
      return new Date(year, month, day, hour, minute, second)
    }
    
    console.warn(`无法解析日期格式: ${dateStr}，使用当前时间`)
    return new Date() // 默认返回当前时间
  } catch (error) {
    console.error(`日期解析出错: ${error}，日期字符串: ${dateStr}`)
    return new Date() // 出错时返回当前时间
  }
}

// 格式化日期为 yyyy-MM-dd 格式
const formatDate = (date: Date): string => {
  if (!date) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 处理页码变化
const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchOrderList()
}

// 处理每页显示数量变化
const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  fetchOrderList()
}

// 订单详情对话框
const dialogVisible = ref(false)
const currentOrder = ref<Order | null>(null)

// 查看订单详情
const handleViewDetail = async (row: Order) => {
  try {
    console.log('获取订单详情，订单ID:', row.orderId)
    const res = await orderApi.getOrderDetail(row.orderId)
    
    if (res.code === 0) {
      console.log('获取到的订单详情数据:', res.data)
      
      // 确保订单详情中包含商品名称
      const orderDetail = {
        ...res.data,
      }
      
      // 处理商品标题：优先使用详情接口返回的标题，如果为空则使用列表中的标题
      if (!orderDetail.productTitle || orderDetail.productTitle.trim() === '') {
        console.log('订单详情中商品标题为空，使用列表中的商品标题')
        orderDetail.productTitle = row.productTitle || `商品ID: ${row.productId}`
      }
      
      currentOrder.value = orderDetail
      dialogVisible.value = true
    } else {
      ElMessage.error(res.message || '获取订单详情失败')
    }
  } catch (error) {
    console.error('获取订单详情失败:', error)
    ElMessage.error('获取订单详情失败')
  }
}

// 取消订单
const handleCancelOrder = (row: Order) => {
  ElMessageBox.confirm('确定要取消该订单吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await orderApi.cancelOrder(row.orderId)
      if (res.code === 0) {
        ElMessage.success('订单取消成功')
        fetchOrderList()
      } else {
        ElMessage.error(res.message || '订单取消失败')
      }
    } catch (error) {
      console.error('订单取消失败:', error)
      ElMessage.error('订单取消失败')
    }
  }).catch(() => {
    // 取消操作
  })
}

// 确认收货
const handleConfirmReceipt = (row: Order) => {
  ElMessageBox.confirm('确定要确认收货吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await orderApi.confirmOrder(row.orderId)
      if (res.code === 0) {
        ElMessage.success('确认收货成功')
        fetchOrderList()
      } else {
        ElMessage.error(res.message || '确认收货失败')
      }
    } catch (error) {
      console.error('确认收货失败:', error)
      ElMessage.error('确认收货失败')
    }
  }).catch(() => {
    // 取消操作
  })
}

// 支付对话框
const payDialogVisible = ref(false)
const payForm = reactive({
  orderId: 0,
  payMethod: 1,
  payAccount: ''
})

// 显示支付对话框
const showPayDialog = (row: Order) => {
  payForm.orderId = row.orderId
  payForm.payMethod = 1
  payForm.payAccount = ''
  payDialogVisible.value = true
}

// 提交支付
const handlePayOrder = async () => {
  try {
    const res = await orderApi.payOrder(payForm.orderId, {
      payMethod: payForm.payMethod,
      payAccount: payForm.payAccount
    })
    if (res.code === 0) {
      ElMessage.success('支付成功')
      payDialogVisible.value = false
      fetchOrderList()
    } else {
      ElMessage.error(res.message || '支付失败')
    }
  } catch (error) {
    console.error('支付失败:', error)
    ElMessage.error('支付失败')
  }
}

// 发货对话框
const shipDialogVisible = ref(false)
const shipForm = reactive({
  orderId: 0,
  expressCompany: '',
  expressNo: ''
})

// 发货表单验证规则
const shipRules = {
  expressCompany: [{ required: true, message: '请输入快递公司', trigger: 'blur' }],
  expressNo: [{ required: true, message: '请输入快递单号', trigger: 'blur' }]
}

// 显示发货对话框
const showShipDialog = (row: Order) => {
  shipForm.orderId = row.orderId
  shipForm.expressCompany = ''
  shipForm.expressNo = ''
  shipDialogVisible.value = true
}

// 提交发货
const shipFormRef = ref()
const handleShipOrder = async () => {
  if (!shipFormRef.value) return
  
  shipFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        const res = await orderApi.shipOrder(shipForm.orderId, {
          expressCompany: shipForm.expressCompany,
          expressNo: shipForm.expressNo
        })
        if (res.code === 0) {
          ElMessage.success('发货成功')
          shipDialogVisible.value = false
          fetchOrderList()
        } else {
          ElMessage.error(res.message || '发货失败')
        }
      } catch (error) {
        console.error('发货失败:', error)
        ElMessage.error('发货失败')
      }
    }
  })
}

// 格式化金额
const formatPrice = (price: number) => {
  return '¥' + price.toFixed(2)
}

// 是否显示操作按钮
const canCancel = (status: number) => status === OrderStatus.PENDING_PAYMENT
const canPay = (status: number) => status === OrderStatus.PENDING_PAYMENT
const canConfirm = (status: number) => status === OrderStatus.PENDING_RECEIPT
const canShip = (status: number, sellerId: number) => {
  return status === OrderStatus.PENDING_SHIPMENT && userStore.userInfo?.userId === sellerId
}

// 计算当前用户的订单角色
const getOrderRole = (order: Order) => {
  if (order.userId === userStore.userInfo?.userId) {
    return '买家'
  } else if (order.sellerId === userStore.userInfo?.userId) {
    return '卖家'
  }
  return '未知'
}

// 页面加载时获取订单列表
onMounted(() => {
  fetchOrderList()
})

// 表格排序事件处理函数
const handleSortChange = (sort: any) => {
  if (sort.prop) {
    // 用户选择了排序字段
    searchForm.sortField = sort.prop
    searchForm.sortOrder = sort.order === 'ascending' ? 'asc' : 'desc'
  } else {
    // 用户取消排序，恢复默认排序
    searchForm.sortField = 'createdTime'
    searchForm.sortOrder = 'desc'
  }
  
  console.log(`排序已更新: ${searchForm.sortField} ${searchForm.sortOrder}`)
  fetchOrderList() // 重新加载数据
}
</script>

<template>
  <div class="order-management">
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="订单状态">
          <el-select v-model="searchForm.status" placeholder="全部状态" clearable>
            <el-option v-for="(text, value) in orderStatusText" :key="value" :label="text" :value="value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="订单编号">
          <el-input v-model="searchForm.orderNo" placeholder="订单编号" clearable></el-input>
        </el-form-item>
        <el-form-item label="下单时间">
          <el-date-picker
            v-model="searchForm.startDate"
            type="date"
            placeholder="开始日期"
            style="width: 150px"
          ></el-date-picker>
          <span class="date-separator">至</span>
          <el-date-picker
            v-model="searchForm.endDate"
            type="date"
            placeholder="结束日期"
            style="width: 150px"
          ></el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchOrderList">搜索</el-button>
          <el-button @click="resetSearchForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <el-table 
        :data="orderList" 
        stripe 
        border 
        v-loading="loading"
        :default-sort="{ prop: 'createdTime', order: 'descending' }"
        @sort-change="handleSortChange">
        <el-table-column prop="orderNo" label="订单编号" min-width="170" show-overflow-tooltip></el-table-column>
        <el-table-column prop="productTitle" label="商品名称" min-width="120" show-overflow-tooltip>
          <template #default="{ row }">
            <el-tooltip :content="row.productTitle || `商品ID: ${row.productId}`" placement="top">
              <div class="product-title">
                <span v-if="row.productTitle">{{ row.productTitle }}</span>
                <span v-else class="no-title">
                  <el-icon><el-icon-warning /></el-icon>
                  商品ID: {{ row.productId }}
                </span>
              </div>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="paymentAmount" label="支付金额" width="120">
          <template #default="{ row }">
            <span class="price">{{ formatPrice(row.paymentAmount) }}</span>
            <div v-if="row.deliveryFee > 0" class="delivery-fee">
              含运费: {{ formatPrice(row.deliveryFee) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="orderStatus" label="订单状态" width="100">
          <template #default="{ row }">
            <el-tag :type="orderStatusTagType[row.orderStatus]">
              {{ orderStatusText[row.orderStatus] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="paymentType" label="支付方式" width="100">
          <template #default="{ row }">
            {{ paymentTypeText[row.paymentType] }}
          </template>
        </el-table-column>
        <el-table-column prop="deliveryType" label="配送方式" width="100">
          <template #default="{ row }">
            {{ deliveryTypeText[row.deliveryType] }}
          </template>
        </el-table-column>
        <el-table-column label="我的角色" width="80">
          <template #default="{ row }">
            <el-tag :type="row.userId === userStore.userInfo?.userId ? 'success' : 'info'">
              {{ getOrderRole(row) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column 
          prop="createdTime" 
          label="创建时间" 
          width="160"
          sortable="custom"
          :sort-orders="['descending', 'ascending', null]">
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="200">
          <template #default="{ row }">
            <el-button size="small" @click="handleViewDetail(row)">详情</el-button>
            <el-button 
              v-if="canCancel(row.orderStatus)" 
              size="small" 
              type="danger" 
              @click="handleCancelOrder(row)"
            >取消</el-button>
            <el-button 
              v-if="canPay(row.orderStatus)" 
              size="small" 
              type="primary" 
              @click="showPayDialog(row)"
            >付款</el-button>
            <el-button 
              v-if="canConfirm(row.orderStatus)" 
              size="small" 
              type="success" 
              @click="handleConfirmReceipt(row)"
            >确认收货</el-button>
            <el-button 
              v-if="canShip(row.orderStatus, row.sellerId)" 
              size="small" 
              type="warning" 
              @click="showShipDialog(row)"
            >发货</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalOrders"
          :page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :current-page="currentPage"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        ></el-pagination>
      </div>
    </el-card>

    <!-- 订单详情对话框 -->
    <el-dialog v-model="dialogVisible" title="订单详情" width="65%" destroy-on-close>
      <template v-if="currentOrder">
        <el-descriptions title="基本信息" :column="2" border>
          <el-descriptions-item label="订单编号">{{ currentOrder.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ currentOrder.createdTime }}</el-descriptions-item>
          <el-descriptions-item label="订单状态">
            <el-tag :type="orderStatusTagType[currentOrder.orderStatus]">
              {{ orderStatusText[currentOrder.orderStatus] }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="备注">{{ currentOrder.remark || '无' }}</el-descriptions-item>
        </el-descriptions>

        <el-divider></el-divider>

        <el-descriptions title="商品信息" :column="2" border>
          <el-descriptions-item label="商品名称">{{ currentOrder.productTitle }}</el-descriptions-item>
          <el-descriptions-item label="商品ID">{{ currentOrder.productId }}</el-descriptions-item>
          <el-descriptions-item v-if="currentOrder.productImage" label="商品图片">
            <el-image 
              style="width: 100px; height: 100px" 
              :src="currentOrder.productImage" 
              fit="cover"
              :preview-src-list="[currentOrder.productImage]"
            ></el-image>
          </el-descriptions-item>
        </el-descriptions>

        <el-divider></el-divider>

        <el-descriptions title="支付信息" :column="3" border>
          <el-descriptions-item label="商品金额">{{ formatPrice(currentOrder.orderAmount) }}</el-descriptions-item>
          <el-descriptions-item label="运费">{{ formatPrice(currentOrder.deliveryFee || 0) }}</el-descriptions-item>
          <el-descriptions-item label="实付金额">
            <span class="price">{{ formatPrice(currentOrder.paymentAmount) }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="支付方式">{{ paymentTypeText[currentOrder.paymentType] }}</el-descriptions-item>
          <el-descriptions-item v-if="currentOrder.paymentInfo" label="支付方式">
            {{ payMethodText[currentOrder.paymentInfo.paymentMethod] }}
          </el-descriptions-item>
          <el-descriptions-item v-if="currentOrder.paymentInfo" label="支付时间">
            {{ currentOrder.paymentInfo.paymentTime }}
          </el-descriptions-item>
        </el-descriptions>

        <el-divider></el-divider>

        <el-descriptions title="收货信息" :column="2" border>
          <el-descriptions-item label="收货人">{{ currentOrder.address.receiverName }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ currentOrder.address.receiverPhone }}</el-descriptions-item>
          <el-descriptions-item label="收货地址" :span="2">
            {{ currentOrder.address.province }}
            {{ currentOrder.address.city }}
            {{ currentOrder.address.district }}
            {{ currentOrder.address.detailAddress }}
          </el-descriptions-item>
          <el-descriptions-item label="配送方式">{{ deliveryTypeText[currentOrder.deliveryType] }}</el-descriptions-item>
        </el-descriptions>

        <div v-if="currentOrder.deliveryInfo" class="delivery-info">
          <el-divider></el-divider>
          <el-descriptions title="物流信息" :column="2" border>
            <el-descriptions-item label="快递公司">{{ currentOrder.deliveryInfo.expressCompany }}</el-descriptions-item>
            <el-descriptions-item label="快递单号">{{ currentOrder.deliveryInfo.expressNo }}</el-descriptions-item>
            <el-descriptions-item label="发货时间">{{ currentOrder.deliveryInfo.deliveryTime }}</el-descriptions-item>
          </el-descriptions>
        </div>
      </template>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">关闭</el-button>
          <el-button 
            v-if="currentOrder && canCancel(currentOrder.orderStatus)" 
            type="danger" 
            @click="handleCancelOrder(currentOrder)"
          >取消订单</el-button>
          <el-button 
            v-if="currentOrder && canPay(currentOrder.orderStatus)" 
            type="primary" 
            @click="showPayDialog(currentOrder)"
          >付款</el-button>
          <el-button 
            v-if="currentOrder && canConfirm(currentOrder.orderStatus)" 
            type="success" 
            @click="handleConfirmReceipt(currentOrder)"
          >确认收货</el-button>
          <el-button 
            v-if="currentOrder && canShip(currentOrder.orderStatus, currentOrder.sellerId)" 
            type="warning" 
            @click="showShipDialog(currentOrder)"
          >发货</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 支付对话框 -->
    <el-dialog v-model="payDialogVisible" title="订单支付" width="30%" destroy-on-close>
      <el-form :model="payForm" label-width="100px">
        <el-form-item label="支付方式">
          <el-radio-group v-model="payForm.payMethod">
            <el-radio :label="1">支付宝</el-radio>
            <el-radio :label="2">微信</el-radio>
            <el-radio :label="3">银行卡</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="payForm.payMethod === 3" label="银行卡号">
          <el-input v-model="payForm.payAccount" placeholder="请输入银行卡号"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="payDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handlePayOrder">确认支付</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 发货对话框 -->
    <el-dialog v-model="shipDialogVisible" title="订单发货" width="40%" destroy-on-close>
      <el-form :model="shipForm" :rules="shipRules" ref="shipFormRef" label-width="100px">
        <el-form-item label="快递公司" prop="expressCompany">
          <el-input v-model="shipForm.expressCompany" placeholder="请输入快递公司"></el-input>
        </el-form-item>
        <el-form-item label="快递单号" prop="expressNo">
          <el-input v-model="shipForm.expressNo" placeholder="请输入快递单号"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="shipDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleShipOrder">确认发货</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.order-management {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.table-card {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.price {
  color: #f56c6c;
  font-weight: bold;
}

.delivery-fee {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.date-separator {
  margin: 0 5px;
}

.delivery-info {
  margin-top: 20px;
}

.product-title {
  display: flex;
  align-items: center;
}

.no-title {
  display: flex;
  align-items: center;
  color: #909399;
  font-size: 12px;
}

.no-title .el-icon {
  margin-right: 4px;
  color: #E6A23C;
}
</style> 