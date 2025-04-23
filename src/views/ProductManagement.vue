<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as productApi from '@/api/product'

// 商品状态枚举
enum ProductStatus {
  PENDING = 0,
  ON_SALE = 1,
  SOLD = 2,
  OFF_SHELF = 3
}

// 商品状态文本映射
const statusText = {
  [ProductStatus.PENDING]: '待审核',
  [ProductStatus.ON_SALE]: '在售',
  [ProductStatus.SOLD]: '已售出',
  [ProductStatus.OFF_SHELF]: '已下架'
}

// 商品状态标签类型
const statusTagType = {
  [ProductStatus.PENDING]: 'info',
  [ProductStatus.ON_SALE]: 'success',
  [ProductStatus.SOLD]: '',
  [ProductStatus.OFF_SHELF]: 'danger'
}

// 商品列表
interface Product {
  productId: number
  title: string
  description: string
  price: number
  originalPrice: number
  categoryId: number
  conditionLevel: number
  status: number
  location: string
  viewCount: number
  createdTime: string
}

const productList = ref<Product[]>([])
const loading = ref(false)
const totalProducts = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

// 搜索表单
const searchForm = reactive({
  title: '',
  status: '',
  categoryId: '',
  minPrice: '',
  maxPrice: ''
})

// 重置搜索表单
const resetSearchForm = () => {
  searchForm.title = ''
  searchForm.status = ''
  searchForm.categoryId = ''
  searchForm.minPrice = ''
  searchForm.maxPrice = ''
  fetchProductList()
}

// 获取商品列表
const fetchProductList = async () => {
  loading.value = true
  try {
    // 这里应该调用获取商品列表的API，目前API文档中没有提供，先模拟数据
    // const res = await productApi.getProductList(currentPage.value, pageSize.value, searchForm)
    // 模拟数据
    const mockProducts: Product[] = []
    for (let i = 1; i <= 10; i++) {
      mockProducts.push({
        productId: i,
        title: `测试商品 ${i}`,
        description: `这是一个测试商品描述 ${i}`,
        price: 100 + i * 10,
        originalPrice: 200 + i * 10,
        categoryId: i % 3 + 1,
        conditionLevel: i % 10 + 1,
        status: i % 4,
        location: '北京市',
        viewCount: i * 10,
        createdTime: '2025-01-01 12:00:00'
      })
    }
    productList.value = mockProducts
    totalProducts.value = 100 // 模拟总数据
    loading.value = false
  } catch (error) {
    console.error('获取商品列表失败:', error)
    ElMessage.error('获取商品列表失败')
    loading.value = false
  }
}

// 处理页码变化
const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchProductList()
}

// 处理每页显示数量变化
const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  fetchProductList()
}

// 查看商品详情
const handleViewDetail = (row: Product) => {
  productDetail.value = row
  dialogVisible.value = true
}

// 编辑商品
const handleEdit = (row: Product) => {
  // 实际应用中应该先获取最新的商品详情
  editForm.productId = row.productId
  editForm.title = row.title
  editForm.description = row.description
  editForm.price = row.price
  editForm.originalPrice = row.originalPrice
  editForm.categoryId = row.categoryId
  editForm.conditionLevel = row.conditionLevel
  editForm.location = row.location
  editDialogVisible.value = true
}

// 删除商品
const handleDelete = (row: Product) => {
  ElMessageBox.confirm('确定要删除该商品吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await productApi.deleteProduct(row.productId)
      ElMessage.success('删除成功')
      fetchProductList()
    } catch (error) {
      console.error('删除商品失败:', error)
      ElMessage.error('删除商品失败')
    }
  }).catch(() => {
    // 取消删除
  })
}

// 商品详情对话框
const dialogVisible = ref(false)
const productDetail = ref<Product | null>(null)

// 商品编辑对话框
const editDialogVisible = ref(false)
const editForm = reactive({
  productId: 0,
  title: '',
  description: '',
  price: 0,
  originalPrice: 0,
  categoryId: 0,
  conditionLevel: 0,
  location: ''
})

// 商品表单校验规则
const rules = {
  title: [{ required: true, message: '请输入商品标题', trigger: 'blur' }],
  description: [{ required: true, message: '请输入商品描述', trigger: 'blur' }],
  price: [
    { required: true, message: '请输入商品售价', trigger: 'blur' },
    { type: 'number', message: '售价必须为数字', trigger: 'blur' }
  ],
  originalPrice: [
    { required: true, message: '请输入商品原价', trigger: 'blur' },
    { type: 'number', message: '原价必须为数字', trigger: 'blur' }
  ],
  categoryId: [{ required: true, message: '请选择商品分类', trigger: 'change' }],
  conditionLevel: [{ required: true, message: '请选择商品新旧程度', trigger: 'change' }],
  location: [{ required: true, message: '请输入商品所在地', trigger: 'blur' }]
}

// 提交编辑表单
const editFormRef = ref()
const submitEditForm = async () => {
  if (!editFormRef.value) return
  
  editFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        await productApi.updateProduct(editForm)
        ElMessage.success('更新成功')
        editDialogVisible.value = false
        fetchProductList()
      } catch (error) {
        console.error('更新商品失败:', error)
        ElMessage.error('更新商品失败')
      }
    }
  })
}

// 获取商品分类名称（实际使用应从后端获取）
const getCategoryName = (categoryId: number) => {
  const categories = {
    1: '手机数码',
    2: '电脑办公',
    3: '家用电器',
    4: '服装鞋包',
    5: '图书音像'
  }
  return categories[categoryId as keyof typeof categories] || '未知分类'
}

// 添加商品对话框
const addDialogVisible = ref(false)
const addForm = reactive({
  title: '',
  description: '',
  price: 0,
  originalPrice: 0,
  categoryId: 0,
  conditionLevel: 5, // 默认中间值
  location: ''
})

// 提交添加表单
const addFormRef = ref()
const submitAddForm = async () => {
  if (!addFormRef.value) return

  addFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        await productApi.addProduct(addForm)
        ElMessage.success('添加成功')
        addDialogVisible.value = false
        fetchProductList()
        // 重置表单
        addForm.title = ''
        addForm.description = ''
        addForm.price = 0
        addForm.originalPrice = 0
        addForm.categoryId = 0
        addForm.conditionLevel = 5
        addForm.location = ''
      } catch (error) {
        console.error('添加商品失败:', error)
        ElMessage.error('添加商品失败')
      }
    }
  })
}

// 页面加载时获取商品列表
onMounted(() => {
  fetchProductList()
})
</script>

<template>
  <div class="product-management">
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="商品名称">
          <el-input v-model="searchForm.title" placeholder="商品名称" clearable></el-input>
        </el-form-item>
        <el-form-item label="商品状态">
          <el-select v-model="searchForm.status" placeholder="全部状态" clearable>
            <el-option v-for="(text, value) in statusText" :key="value" :label="text" :value="value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="商品分类">
          <el-select v-model="searchForm.categoryId" placeholder="全部分类" clearable>
            <el-option :value="1" label="手机数码"></el-option>
            <el-option :value="2" label="电脑办公"></el-option>
            <el-option :value="3" label="家用电器"></el-option>
            <el-option :value="4" label="服装鞋包"></el-option>
            <el-option :value="5" label="图书音像"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="价格区间">
          <el-input-number v-model="searchForm.minPrice" :min="0" placeholder="最低价" class="price-input"></el-input-number>
          <span class="price-separator">-</span>
          <el-input-number v-model="searchForm.maxPrice" :min="0" placeholder="最高价" class="price-input"></el-input-number>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchProductList">搜索</el-button>
          <el-button @click="resetSearchForm">重置</el-button>
          <el-button type="success" @click="addDialogVisible = true">添加商品</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <el-table :data="productList" stripe border v-loading="loading">
        <el-table-column prop="productId" label="ID" width="80"></el-table-column>
        <el-table-column prop="title" label="商品名称" min-width="120" show-overflow-tooltip></el-table-column>
        <el-table-column prop="price" label="售价" width="100">
          <template #default="{ row }">
            <span class="price">¥{{ row.price.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="originalPrice" label="原价" width="100">
          <template #default="{ row }">
            <span class="original-price">¥{{ row.originalPrice.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="categoryId" label="分类" width="100">
          <template #default="{ row }">
            {{ getCategoryName(row.categoryId) }}
          </template>
        </el-table-column>
        <el-table-column prop="conditionLevel" label="新旧程度" width="100">
          <template #default="{ row }">
            <el-rate :model-value="row.conditionLevel" disabled :max="10" :colors="['#99A9BF', '#F7BA2A', '#FF9900']"></el-rate>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusTagType[row.status]">{{ statusText[row.status] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="location" label="所在地" width="120"></el-table-column>
        <el-table-column prop="viewCount" label="浏览量" width="100"></el-table-column>
        <el-table-column prop="createdTime" label="发布时间" width="150"></el-table-column>
        <el-table-column fixed="right" label="操作" width="150">
          <template #default="{ row }">
            <el-button size="small" @click="handleViewDetail(row)">详情</el-button>
            <el-button size="small" type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
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

    <!-- 商品详情对话框 -->
    <el-dialog v-model="dialogVisible" title="商品详情" width="50%">
      <template v-if="productDetail">
        <el-descriptions column="2" border>
          <el-descriptions-item label="商品ID">{{ productDetail.productId }}</el-descriptions-item>
          <el-descriptions-item label="商品名称">{{ productDetail.title }}</el-descriptions-item>
          <el-descriptions-item label="商品价格" :span="2">
            <span class="price">¥{{ productDetail.price.toFixed(2) }}</span>
            <span class="original-price-detail">原价: ¥{{ productDetail.originalPrice.toFixed(2) }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="商品分类">{{ getCategoryName(productDetail.categoryId) }}</el-descriptions-item>
          <el-descriptions-item label="新旧程度">
            <el-rate :model-value="productDetail.conditionLevel" disabled :max="10" :colors="['#99A9BF', '#F7BA2A', '#FF9900']"></el-rate>
          </el-descriptions-item>
          <el-descriptions-item label="商品状态">
            <el-tag :type="statusTagType[productDetail.status]">{{ statusText[productDetail.status] }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="所在地">{{ productDetail.location }}</el-descriptions-item>
          <el-descriptions-item label="浏览量">{{ productDetail.viewCount }}</el-descriptions-item>
          <el-descriptions-item label="发布时间">{{ productDetail.createdTime }}</el-descriptions-item>
          <el-descriptions-item label="商品描述" :span="2">{{ productDetail.description }}</el-descriptions-item>
        </el-descriptions>
      </template>
    </el-dialog>

    <!-- 编辑商品对话框 -->
    <el-dialog v-model="editDialogVisible" title="编辑商品" width="50%">
      <el-form :model="editForm" :rules="rules" ref="editFormRef" label-width="100px">
        <el-form-item label="商品ID" prop="productId">
          <el-input v-model="editForm.productId" disabled></el-input>
        </el-form-item>
        <el-form-item label="商品名称" prop="title">
          <el-input v-model="editForm.title"></el-input>
        </el-form-item>
        <el-form-item label="商品描述" prop="description">
          <el-input v-model="editForm.description" type="textarea" :rows="4"></el-input>
        </el-form-item>
        <el-form-item label="商品售价" prop="price">
          <el-input-number v-model="editForm.price" :min="0" :precision="2" :step="10"></el-input-number>
        </el-form-item>
        <el-form-item label="商品原价" prop="originalPrice">
          <el-input-number v-model="editForm.originalPrice" :min="0" :precision="2" :step="10"></el-input-number>
        </el-form-item>
        <el-form-item label="商品分类" prop="categoryId">
          <el-select v-model="editForm.categoryId">
            <el-option :value="1" label="手机数码"></el-option>
            <el-option :value="2" label="电脑办公"></el-option>
            <el-option :value="3" label="家用电器"></el-option>
            <el-option :value="4" label="服装鞋包"></el-option>
            <el-option :value="5" label="图书音像"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="新旧程度" prop="conditionLevel">
          <el-rate v-model="editForm.conditionLevel" :max="10" :colors="['#99A9BF', '#F7BA2A', '#FF9900']"></el-rate>
        </el-form-item>
        <el-form-item label="所在地" prop="location">
          <el-input v-model="editForm.location"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitEditForm">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 添加商品对话框 -->
    <el-dialog v-model="addDialogVisible" title="添加商品" width="50%">
      <el-form :model="addForm" :rules="rules" ref="addFormRef" label-width="100px">
        <el-form-item label="商品名称" prop="title">
          <el-input v-model="addForm.title"></el-input>
        </el-form-item>
        <el-form-item label="商品描述" prop="description">
          <el-input v-model="addForm.description" type="textarea" :rows="4"></el-input>
        </el-form-item>
        <el-form-item label="商品售价" prop="price">
          <el-input-number v-model="addForm.price" :min="0" :precision="2" :step="10"></el-input-number>
        </el-form-item>
        <el-form-item label="商品原价" prop="originalPrice">
          <el-input-number v-model="addForm.originalPrice" :min="0" :precision="2" :step="10"></el-input-number>
        </el-form-item>
        <el-form-item label="商品分类" prop="categoryId">
          <el-select v-model="addForm.categoryId">
            <el-option :value="1" label="手机数码"></el-option>
            <el-option :value="2" label="电脑办公"></el-option>
            <el-option :value="3" label="家用电器"></el-option>
            <el-option :value="4" label="服装鞋包"></el-option>
            <el-option :value="5" label="图书音像"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="新旧程度" prop="conditionLevel">
          <el-rate v-model="addForm.conditionLevel" :max="10" :colors="['#99A9BF', '#F7BA2A', '#FF9900']"></el-rate>
        </el-form-item>
        <el-form-item label="所在地" prop="location">
          <el-input v-model="addForm.location"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitAddForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.product-management {
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

.original-price {
  color: #909399;
  text-decoration: line-through;
  margin-left: 5px;
  font-size: 12px;
}

.original-price-detail {
  color: #909399;
  margin-left: 10px;
}

.price-input {
  width: 120px;
}

.price-separator {
  margin: 0 5px;
}
</style> 