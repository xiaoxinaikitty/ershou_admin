<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as productApi from '@/api/product'
import ImageUrlUtil from '@/utils/imageUrlUtil'  // 导入图片URL处理工具

// 商品列表数据接口
interface ProductItem {
  productId: number
  title: string
  price: number
  originalPrice: number
  categoryId: number
  categoryName: string
  userId: number
  username: string
  conditionLevel: number
  location: string
  viewCount: number
  createdTime: string
  mainImageUrl: string
  status?: number
  statusText?: string
}

// 商品列表
const productList = ref<ProductItem[]>([])

// 分页数据
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
  pages: 0
})

// 搜索参数
const searchParams = reactive({
  keyword: '',
  categoryId: undefined as number | undefined,
  minPrice: undefined as number | undefined,
  maxPrice: undefined as number | undefined,
  status: 1, // 默认查询在售商品
  sortField: 'time',
  sortOrder: 'desc'
})

// 加载状态
const loading = ref(false)

// 商品状态选项
const statusOptions = [
  { label: '全部', value: undefined },
  { label: '在售', value: 1 },
  { label: '已售', value: 2 },
  { label: '下架', value: 0 }
]

// 商品状态操作选项
const statusActionOptions = {
  0: { label: '上架', value: 1, type: 'success' }, // 下架 -> 在售
  1: { label: '下架', value: 0, type: 'warning' }, // 在售 -> 下架
  2: { label: '重新上架', value: 1, type: 'success' } // 已售 -> 在售
}

// 商品分类选项（实际项目中应该从接口获取）
const categoryOptions = [
  { label: '全部分类', value: undefined },
  { label: '手机数码', value: 2 },
  { label: '电脑办公', value: 3 },
  { label: '家用电器', value: 4 },
  { label: '生活百货', value: 5 },
  { label: '服装鞋帽', value: 6 },
  { label: '图书音像', value: 7 },
  { label: '其他', value: 99 }
]

// 排序字段选项
const sortFieldOptions = [
  { label: '发布时间', value: 'time' },
  { label: '价格', value: 'price' },
  { label: '浏览量', value: 'view' }
]

// 商品成色描述
const getConditionText = (level: number) => {
  if (level >= 9) return '几乎全新'
  if (level >= 7) return '品相良好'
  if (level >= 5) return '正常使用痕迹'
  if (level >= 3) return '明显使用痕迹'
  return '品相一般'
}

// 获取商品状态标签类型
const getStatusType = (status?: number) => {
  switch (status) {
    case 0: return 'info'    // 下架
    case 1: return 'success' // 在售
    case 2: return 'warning' // 已售
    default: return 'info'   // 默认
  }
}

// 获取商品状态文本
const getStatusText = (status?: number) => {
  switch (status) {
    case 0: return '下架'
    case 1: return '在售'
    case 2: return '已售'
    default: return '未知'
  }
}

// 格式化价格
const formatPrice = (price: number) => {
  return price.toFixed(2)
}

// 获取商品列表
const getProductList = async () => {
  loading.value = true
  try {
    const params = {
      ...searchParams,
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      status: searchParams.status // 确保状态参数正确传递
    }
    
    const res = await productApi.getProductList(params)
    if (res.code === 0) {
      // 处理商品列表数据，包括处理图片URL
      productList.value = res.data.list.map(item => ({
        ...item,
        status: item.status || 1, // 确保状态字段有默认值
        mainImageUrl: ImageUrlUtil.processImageUrl(item.mainImageUrl) // 处理图片URL
      }))
      pagination.total = res.data.total
      pagination.pages = res.data.pages
    } else {
      ElMessage.error(res.message || '获取商品列表失败')
    }
  } catch (error) {
    console.error('获取商品列表失败:', error)
    ElMessage.error('获取商品列表失败')
  } finally {
    loading.value = false
  }
}

// 处理页码变更
const handleCurrentChange = (val: number) => {
  pagination.pageNum = val
  getProductList()
}

// 处理每页条数变更
const handleSizeChange = (val: number) => {
  pagination.pageSize = val
  pagination.pageNum = 1
  getProductList()
}

// 处理搜索
const handleSearch = () => {
  pagination.pageNum = 1
  getProductList()
}

// 重置搜索
const resetSearch = () => {
  // 重置搜索参数
  searchParams.keyword = ''
  searchParams.categoryId = undefined
  searchParams.minPrice = undefined
  searchParams.maxPrice = undefined
  searchParams.status = 1
  searchParams.sortField = 'time'
  searchParams.sortOrder = 'desc'
  
  // 重新加载数据
  pagination.pageNum = 1
  getProductList()
}

// 修改商品状态
const handleStatusChange = async (productId: number, currentStatus: number) => {
  const action = statusActionOptions[currentStatus]
  if (!action) return

  try {
    const res = await productApi.updateProductStatus(productId, action.value)
    if (res.code === 0) {
      ElMessage.success('商品状态修改成功')
      getProductList() // 刷新列表
    } else {
      ElMessage.error(res.message || '商品状态修改失败')
    }
  } catch (error) {
    console.error('修改商品状态失败:', error)
    ElMessage.error('商品状态修改失败')
  }
}

// 排序方式切换
const toggleSortOrder = () => {
  searchParams.sortOrder = searchParams.sortOrder === 'desc' ? 'asc' : 'desc'
  handleSearch()
}

// 下架商品
const handleOffShelf = async (productId: number) => {
  try {
    await ElMessageBox.confirm('确定要下架该商品吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const res = await productApi.offShelfProduct(productId)
    if (res.code === 0) {
      ElMessage.success('商品下架成功')
      getProductList() // 刷新列表
    } else {
      ElMessage.error(res.message || '商品下架失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('商品下架失败:', error)
      ElMessage.error('商品下架失败')
    }
  }
}

// 初始化加载数据
onMounted(() => {
  getProductList()
})
</script>

<template>
  <div class="product-management-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>商品管理</span>
        </div>
      </template>
      
      <!-- 搜索部分 -->
      <div class="search-section">
        <el-form :inline="true" :model="searchParams" class="search-form">
          <el-form-item label="关键词">
            <el-input v-model="searchParams.keyword" placeholder="商品标题关键词" clearable />
          </el-form-item>
          
          <el-form-item label="分类">
            <el-select v-model="searchParams.categoryId" placeholder="商品分类" clearable>
              <el-option
                v-for="item in categoryOptions"
                :key="item.value || ''"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          
          <el-form-item label="价格区间">
            <div class="price-range">
              <el-input v-model="searchParams.minPrice" placeholder="最低价" type="number" />
              <span class="price-separator">-</span>
              <el-input v-model="searchParams.maxPrice" placeholder="最高价" type="number" />
            </div>
          </el-form-item>
          
          <el-form-item label="商品状态">
            <el-select v-model="searchParams.status" placeholder="商品状态">
              <el-option
                v-for="item in statusOptions"
                :key="item.value || ''"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          
          <el-form-item label="排序方式">
            <div class="sort-control">
              <el-select v-model="searchParams.sortField" placeholder="排序字段">
                <el-option
                  v-for="item in sortFieldOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
              <el-button @click="toggleSortOrder">
                <el-icon>
                  <component :is="searchParams.sortOrder === 'desc' ? 'Sort' : 'Sort'" />
                </el-icon>
                {{ searchParams.sortOrder === 'desc' ? '降序' : '升序' }}
              </el-button>
            </div>
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <!-- 商品列表 -->
      <div v-loading="loading">
        <el-table
          :data="productList"
          style="width: 100%"
          stripe
          border
        >
          <el-table-column type="index" width="50" />
          
          <el-table-column label="商品信息" min-width="300">
            <template #default="scope">
              <div class="product-info">
                <el-image 
                  :src="scope.row.mainImageUrl" 
                  class="product-image"
                  fit="cover"
                  :preview-src-list="[scope.row.mainImageUrl]"
                />
                <div class="product-detail">
                  <div class="product-title">{{ scope.row.title }}</div>
                  <div class="product-meta">
                    <span>分类: {{ scope.row.categoryName }}</span>
                    <span>成色: {{ getConditionText(scope.row.conditionLevel) }} ({{ scope.row.conditionLevel }}成新)</span>
                  </div>
                  <div class="product-price">
                    <span class="current-price">¥{{ formatPrice(scope.row.price) }}</span>
                    <span class="original-price">¥{{ formatPrice(scope.row.originalPrice) }}</span>
                  </div>
                </div>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column prop="username" label="发布用户" width="120" />
          
          <el-table-column prop="location" label="商品位置" width="180" />
          
          <el-table-column prop="viewCount" label="浏览量" width="80" />
          
          <el-table-column label="状态" width="120">
            <template #default="scope">
              <el-tag 
                :type="getStatusType(scope.row.status)"
                effect="dark"
              >
                {{ getStatusText(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column prop="createdTime" label="发布时间" width="180" />
          
          <el-table-column label="操作" width="200">
            <template #default="scope">
              <el-button
                type="primary"
                size="small"
                @click="$router.push(`/product-detail/${scope.row.productId}`)"
              >
                查看
              </el-button>
              <el-button
                size="small"
                type="danger"
                @click="handleOffShelf(scope.row.productId)"
              >
                下架
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <!-- 分页控件 -->
        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="pagination.pageNum"
            v-model:page-size="pagination.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="pagination.total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.product-management-container {
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

.search-section {
  margin-bottom: 20px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
}

.price-range {
  display: flex;
  align-items: center;
  width: 200px;
}

.price-separator {
  margin: 0 5px;
}

.sort-control {
  display: flex;
  align-items: center;
}

.sort-control .el-select {
  margin-right: 10px;
}

.product-info {
  display: flex;
  align-items: center;
}

.product-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  margin-right: 15px;
  border-radius: 4px;
  border: 1px solid #eee;
}

.product-detail {
  flex: 1;
}

.product-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
  color: #303133;
}

.product-meta {
  font-size: 12px;
  color: #606266;
  margin-bottom: 8px;
}

.product-meta span {
  margin-right: 10px;
}

.product-price {
  font-size: 14px;
}

.current-price {
  font-weight: 500;
  color: #f56c6c;
  margin-right: 10px;
}

.original-price {
  text-decoration: line-through;
  color: #909399;
  font-size: 12px;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style> 