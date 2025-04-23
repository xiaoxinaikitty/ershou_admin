<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as productApi from '@/api/product'

// 收藏商品接口
interface FavoriteProduct {
  favoriteId: number
  productId: number
  productTitle: string
  productPrice: number
  createdTime: string
}

const favoriteList = ref<FavoriteProduct[]>([])
const loading = ref(false)

// 获取收藏列表
const fetchFavoriteList = async () => {
  loading.value = true
  try {
    const res = await productApi.getFavoriteList()
    if (res.code === 0) {
      favoriteList.value = res.data
    } else {
      ElMessage.error(res.message || '获取收藏列表失败')
    }
  } catch (error) {
    console.error('获取收藏列表失败:', error)
    ElMessage.error('获取收藏列表失败')
  } finally {
    loading.value = false
  }
}

// 取消收藏
const handleCancelFavorite = (row: FavoriteProduct) => {
  ElMessageBox.confirm('确定取消收藏该商品吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await productApi.removeFavorite(row.productId)
      if (res.code === 0) {
        ElMessage.success('取消收藏成功')
        fetchFavoriteList()
      } else {
        ElMessage.error(res.message || '取消收藏失败')
      }
    } catch (error) {
      console.error('取消收藏失败:', error)
      ElMessage.error('取消收藏失败')
    }
  }).catch(() => {
    // 取消操作
  })
}

// 查看商品详情
const handleViewDetail = (productId: number) => {
  // 实际项目中可以跳转到商品详情页面
  ElMessage.info(`查看商品ID: ${productId}的详情`)
}

// 页面加载时获取收藏列表
onMounted(() => {
  fetchFavoriteList()
})
</script>

<template>
  <div class="favorite-management">
    <el-card class="favorite-card">
      <template #header>
        <div class="card-header">
          <span>我的收藏</span>
          <el-button type="primary" size="small" @click="fetchFavoriteList">刷新</el-button>
        </div>
      </template>
      
      <el-table :data="favoriteList" stripe border v-loading="loading" empty-text="暂无收藏商品">
        <el-table-column type="index" label="序号" width="80"></el-table-column>
        <el-table-column prop="productTitle" label="商品名称" min-width="150" show-overflow-tooltip></el-table-column>
        <el-table-column prop="productPrice" label="价格" width="120">
          <template #default="{ row }">
            <span class="price">¥{{ row.productPrice.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createdTime" label="收藏时间" width="180"></el-table-column>
        <el-table-column fixed="right" label="操作" width="180">
          <template #default="{ row }">
            <el-button size="small" @click="handleViewDetail(row.productId)">查看详情</el-button>
            <el-button size="small" type="danger" @click="handleCancelFavorite(row)">取消收藏</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <el-empty v-if="favoriteList.length === 0 && !loading" description="暂无收藏商品">
        <el-button type="primary">去逛逛</el-button>
      </el-empty>
    </el-card>
  </div>
</template>

<style scoped>
.favorite-management {
  padding: 20px;
}

.favorite-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price {
  color: #f56c6c;
  font-weight: bold;
}
</style> 