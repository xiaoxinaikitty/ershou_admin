<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as productApi from '@/api/product'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 举报类型映射
const reportTypes = {
  1: '虚假商品',
  2: '违禁品',
  3: '侵权',
  4: '其他'
}

// 举报状态映射
const reportStatus = {
  0: '未处理',
  1: '已处理'
}

// 举报状态标签类型
const reportStatusTagType = {
  0: 'warning',
  1: 'success'
}

// 被举报商品接口
interface ReportedProduct {
  productId: number
  productTitle: string
  reportType: number
  reportTypeDesc: string
  createdTime: string
}

// 举报详情接口
interface ReportDetail {
  reportId: number
  productId: number
  productTitle: string
  userId: number
  username: string
  reportType: number
  reportTypeDesc: string
  reportContent: string
  status: number
  statusDesc: string
  createdTime: string
  handleTime: string | null
}

// 获取被举报商品列表
const productList = ref<ReportedProduct[]>([])
const loading = ref(false)
const totalProducts = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

// 搜索表单
const searchForm = reactive({
  reportType: '',
  status: '',
  startTime: '',
  endTime: ''
})

// 获取被举报商品列表
const fetchReportedProducts = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      status: searchForm.status ? Number(searchForm.status) : undefined,
      reportType: searchForm.reportType ? Number(searchForm.reportType) : undefined,
      startTime: searchForm.startTime,
      endTime: searchForm.endTime
    }
    
    const res = await productApi.getAllReportedProducts(params)
    if (res.code === 0) {
      // 处理举报类型映射
      productList.value = res.data.list.map((item: ReportedProduct) => ({
        ...item,
        reportTypeDesc: reportTypes[item.reportType] || '未知类型'
      }))
      totalProducts.value = res.data.total
    } else {
      ElMessage.error(res.message || '获取举报列表失败')
    }
  } catch (error) {
    console.error('获取举报列表失败:', error)
    ElMessage.error('获取举报列表失败')
  } finally {
    loading.value = false
  }
}

// 查看商品详情
const handleViewProduct = (productId: number) => {
  window.open(`/product-detail/${productId}`, '_blank')
}

// 查看举报详情
const handleViewReports = async (productId: number) => {
  try {
    const res = await productApi.getProductReportList(productId)
    if (res.code === 0) {
      // 这里可以打开一个弹窗显示举报详情
      ElMessageBox.alert(
        `<div>
          <h3>举报详情</h3>
          ${res.data.list.map((report: ReportDetail) => `
            <div style="margin-bottom: 10px; padding: 10px; border: 1px solid #eee; border-radius: 4px;">
              <p><strong>举报人：</strong>${report.username}</p>
              <p><strong>举报类型：</strong>${report.reportTypeDesc}</p>
              <p><strong>举报内容：</strong>${report.reportContent}</p>
              <p><strong>举报时间：</strong>${report.createdTime}</p>
              <p><strong>处理状态：</strong>${report.statusDesc}</p>
              ${report.handleTime ? `<p><strong>处理时间：</strong>${report.handleTime}</p>` : ''}
            </div>
          `).join('')}
        </div>`,
        '举报详情',
        {
          dangerouslyUseHTMLString: true,
          customClass: 'report-detail-dialog'
        }
      )
    } else {
      ElMessage.error(res.message || '获取举报详情失败')
    }
  } catch (error) {
    console.error('获取举报详情失败:', error)
    ElMessage.error('获取举报详情失败')
  }
}

// 重置搜索表单
const resetSearchForm = () => {
  searchForm.reportType = ''
  searchForm.status = ''
  searchForm.startTime = ''
  searchForm.endTime = ''
  currentPage.value = 1
  fetchReportedProducts()
}

// 处理页码变化
const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchReportedProducts()
}

// 处理每页显示数量变化
const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  fetchReportedProducts()
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
      fetchReportedProducts() // 刷新列表
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

// 页面加载时检查权限并获取举报列表
onMounted(() => {
  if (userStore.isAdmin) {
    fetchReportedProducts()
  } else {
    ElMessage.error('无权访问此页面')
  }
})
</script>

<template>
  <div class="report-management" v-if="userStore.isAdmin">
    <el-card class="search-card">
      <template #header>
        <div class="card-header">
          <span>商品举报管理</span>
        </div>
      </template>

      <el-form :model="searchForm" inline>
        <el-form-item label="举报类型">
          <el-select v-model="searchForm.reportType" placeholder="全部类型" clearable>
            <el-option
              v-for="(text, value) in reportTypes"
              :key="value"
              :label="text"
              :value="value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部状态" clearable>
            <el-option v-for="(text, value) in reportStatus" :key="value" :label="text" :value="value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="searchForm.startTime"
            type="datetime"
            placeholder="开始时间"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
          <span class="time-separator">-</span>
          <el-date-picker
            v-model="searchForm.endTime"
            type="datetime"
            placeholder="结束时间"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchReportedProducts">搜索</el-button>
          <el-button @click="resetSearchForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <el-table :data="productList" stripe border v-loading="loading" empty-text="暂无举报记录">
        <el-table-column prop="productId" label="商品ID" width="80"></el-table-column>
        <el-table-column prop="productTitle" label="商品名称" min-width="200" show-overflow-tooltip></el-table-column>
        <el-table-column prop="reportTypeDesc" label="举报类型" width="100"></el-table-column>
        <el-table-column prop="createdTime" label="举报时间" width="180"></el-table-column>
        <el-table-column fixed="right" label="操作" width="200">
          <template #default="{ row }">
            <el-button size="small" @click="handleViewProduct(row.productId)">查看商品</el-button>
            <el-button size="small" type="danger" @click="handleOffShelf(row.productId)">下架</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalProducts"
          :page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :current-page="currentPage"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        ></el-pagination>
      </div>
    </el-card>
  </div>
  <el-empty v-else description="您没有权限访问此页面">
    <el-button type="primary" @click="$router.push('/dashboard')">返回首页</el-button>
  </el-empty>
</template>

<style scoped>
.report-management {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
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

.time-separator {
  margin: 0 10px;
  color: #909399;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

:deep(.report-detail-dialog) {
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
}
</style> 