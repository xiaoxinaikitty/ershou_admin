<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as productApi from '@/api/product'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 举报类型映射
const reportTypes = {
  1: '虚假宣传',
  2: '违禁品',
  3: '诈骗',
  4: '其他'
}

// 举报状态映射
const reportStatus = {
  0: '待处理',
  1: '已处理',
  2: '已驳回'
}

// 举报状态标签类型
const reportStatusTagType = {
  0: 'warning',
  1: 'success',
  2: 'danger'
}

// 商品举报接口
interface ProductReport {
  reportId: number
  productId: number
  productTitle?: string
  reportType: number
  reportContent: string
  status: number
  createdTime: string
}

// 获取商品举报列表
const reportList = ref<ProductReport[]>([])
const loading = ref(false)
const totalReports = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

// 当前查看的商品ID
const currentProductId = ref<number | null>(null)

// 搜索表单
const searchForm = reactive({
  productId: '',
  reportType: '',
  status: ''
})

// 获取商品举报列表
const fetchReportList = async () => {
  // 检查用户权限
  if (!userStore.isAdmin) {
    ElMessage.error('无权访问')
    return
  }

  loading.value = true
  try {
    // 实际项目中应该有一个管理员获取所有举报的API，这里我们用模拟数据
    // 如果有商品ID，则获取该商品的举报列表
    if (currentProductId.value) {
      const res = await productApi.getProductReportList(currentProductId.value)
      if (res.code === 0) {
        reportList.value = res.data
        totalReports.value = res.data.length
      } else {
        ElMessage.error(res.message || '获取举报列表失败')
      }
    } else {
      // 模拟数据
      const mockReports: ProductReport[] = []
      for (let i = 1; i <= 10; i++) {
        mockReports.push({
          reportId: i,
          productId: i,
          productTitle: `测试商品 ${i}`,
          reportType: i % 4 + 1,
          reportContent: `这是举报内容 ${i}`,
          status: i % 3,
          createdTime: '2025-01-01 12:00:00'
        })
      }
      reportList.value = mockReports
      totalReports.value = 100 // 模拟总数据
    }
  } catch (error) {
    console.error('获取举报列表失败:', error)
    ElMessage.error('获取举报列表失败')
  } finally {
    loading.value = false
  }
}

// 处理页码变化
const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchReportList()
}

// 处理每页显示数量变化
const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  fetchReportList()
}

// 重置搜索表单
const resetSearchForm = () => {
  searchForm.productId = ''
  searchForm.reportType = ''
  searchForm.status = ''
  currentProductId.value = null
  fetchReportList()
}

// 处理举报处理
const handleProcessReport = (row: ProductReport, action: 'process' | 'reject') => {
  const statusText = action === 'process' ? '处理' : '驳回'
  ElMessageBox.confirm(`确定要${statusText}该举报吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      // 这里应该调用处理举报的API，目前API文档中没有提供，先模拟
      // const res = await productApi.processReport(row.reportId, action)
      const newStatus = action === 'process' ? 1 : 2
      // 模拟成功响应
      ElMessage.success(`${statusText}成功`)
      // 更新列表中的状态
      const index = reportList.value.findIndex(item => item.reportId === row.reportId)
      if (index !== -1) {
        reportList.value[index].status = newStatus
      }
    } catch (error) {
      console.error(`${statusText}举报失败:`, error)
      ElMessage.error(`${statusText}举报失败`)
    }
  }).catch(() => {
    // 取消操作
  })
}

// 查看商品详情
const handleViewProduct = (productId: number) => {
  // 实际项目中可以跳转到商品详情页面
  ElMessage.info(`查看商品ID: ${productId}的详情`)
}

// 页面加载时检查权限并获取举报列表
onMounted(() => {
  if (userStore.isAdmin) {
    fetchReportList()
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
        <el-form-item label="商品ID">
          <el-input v-model="searchForm.productId" placeholder="商品ID" clearable></el-input>
        </el-form-item>
        <el-form-item label="举报类型">
          <el-select v-model="searchForm.reportType" placeholder="全部类型" clearable>
            <el-option v-for="(text, value) in reportTypes" :key="value" :label="text" :value="value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部状态" clearable>
            <el-option v-for="(text, value) in reportStatus" :key="value" :label="text" :value="value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="currentProductId = Number(searchForm.productId) || null; fetchReportList()">搜索</el-button>
          <el-button @click="resetSearchForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <el-table :data="reportList" stripe border v-loading="loading" empty-text="暂无举报记录">
        <el-table-column prop="reportId" label="举报ID" width="80"></el-table-column>
        <el-table-column prop="productId" label="商品ID" width="80"></el-table-column>
        <el-table-column prop="productTitle" label="商品名称" min-width="120" show-overflow-tooltip></el-table-column>
        <el-table-column prop="reportType" label="举报类型" width="100">
          <template #default="{ row }">
            {{ reportTypes[row.reportType] }}
          </template>
        </el-table-column>
        <el-table-column prop="reportContent" label="举报内容" min-width="150" show-overflow-tooltip></el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="reportStatusTagType[row.status]">{{ reportStatus[row.status] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdTime" label="举报时间" width="150"></el-table-column>
        <el-table-column fixed="right" label="操作" width="200">
          <template #default="{ row }">
            <el-button size="small" @click="handleViewProduct(row.productId)">查看商品</el-button>
            <el-button 
              v-if="row.status === 0" 
              size="small" 
              type="success" 
              @click="handleProcessReport(row, 'process')"
            >处理</el-button>
            <el-button 
              v-if="row.status === 0" 
              size="small" 
              type="danger" 
              @click="handleProcessReport(row, 'reject')"
            >驳回</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalReports"
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

.search-card, .table-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style> 