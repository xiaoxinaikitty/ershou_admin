<template>
  <div class="promotion-management">
    <h1>营销活动管理</h1>

    <!-- 搜索区域 -->
    <div class="search-container">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="活动标题">
          <el-input v-model="searchForm.title" placeholder="请输入活动标题"></el-input>
        </el-form-item>
        <el-form-item label="活动类型">
          <el-select v-model="searchForm.promotionType" clearable placeholder="请选择活动类型">
            <el-option v-for="item in promotionTypes" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="活动状态">
          <el-select v-model="searchForm.status" clearable placeholder="请选择活动状态">
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="开始时间">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD HH:mm:ss"
            :default-time="['00:00:00', '23:59:59']"
          ></el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
          <el-button type="success" @click="openAddDialog">添加营销活动</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 表格 -->
    <el-table
      v-loading="loading"
      :data="promotionList"
      border
      style="width: 100%"
      max-height="650"
    >
      <el-table-column prop="promotionId" label="ID" width="80"></el-table-column>
      <el-table-column prop="title" label="活动标题" width="200" show-overflow-tooltip></el-table-column>
      <el-table-column prop="promotionTypeDesc" label="活动类型" width="100"></el-table-column>
      <el-table-column prop="statusDesc" label="状态" width="80">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">{{ scope.row.statusDesc }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="startTime" label="开始时间" width="160"></el-table-column>
      <el-table-column prop="endTime" label="结束时间" width="160"></el-table-column>
      <el-table-column label="图片预览" width="120">
        <template #default="scope">
          <el-image 
            v-if="scope.row.images && scope.row.images.length > 0"
            style="width: 80px; height: 40px"
            :src="scope.row.images[0].imageUrl"
            fit="cover"
            :preview-src-list="getImageUrlList(scope.row.images)"
          ></el-image>
          <span v-else>无图片</span>
        </template>
      </el-table-column>
      <el-table-column prop="createdByUsername" label="创建人" width="100"></el-table-column>
      <el-table-column prop="createdTime" label="创建时间" width="160"></el-table-column>
      <el-table-column label="操作" fixed="right" width="240">
        <template #default="scope">
          <el-button size="small" @click="handleDetail(scope.row)">详情</el-button>
          <el-button size="small" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button 
            size="small" 
            :type="scope.row.status === 0 ? 'success' : 'warning'"
            @click="handleChangeStatus(scope.row)"
          >
            {{ scope.row.status === 0 ? '上线' : '下线' }}
          </el-button>
          <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      ></el-pagination>
    </div>

    <!-- 添加/编辑营销活动对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="700px"
      :before-close="handleDialogClose"
    >
      <el-form
        ref="promotionFormRef"
        :model="promotionForm"
        :rules="rules"
        label-width="100px"
        class="promotion-form"
      >
        <el-form-item label="活动标题" prop="title">
          <el-input v-model="promotionForm.title" placeholder="请输入活动标题"></el-input>
        </el-form-item>
        <el-form-item label="活动描述" prop="description">
          <el-input
            v-model="promotionForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入活动描述"
          ></el-input>
        </el-form-item>
        <el-form-item label="活动类型" prop="promotionType">
          <el-select v-model="promotionForm.promotionType" placeholder="请选择活动类型">
            <el-option
              v-for="item in promotionTypes"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="活动时间" prop="timeRange">
          <el-date-picker
            v-model="promotionForm.timeRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="YYYY-MM-DD HH:mm:ss"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="活动状态" prop="status">
          <el-radio-group v-model="promotionForm.status">
            <el-radio :label="1">上线</el-radio>
            <el-radio :label="0">下线</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="排序值" prop="sortOrder">
          <el-input-number
            v-model="promotionForm.sortOrder"
            :min="0"
            :max="999"
            placeholder="值越大越靠前"
          ></el-input-number>
        </el-form-item>
        <el-form-item label="跳转链接" prop="urlLink">
          <el-input v-model="promotionForm.urlLink" placeholder="点击活动后的跳转链接，如：/pages/detail/1"></el-input>
        </el-form-item>
        <el-form-item label="活动图片">
          <div class="upload-list">
            <div
              v-for="(image, index) in promotionForm.images"
              :key="index"
              class="upload-item"
            >
              <el-image :src="image.imageUrl" class="preview-image"></el-image>
              <div class="upload-item-actions">
                <el-select v-model="image.imageType" placeholder="图片类型" style="width: 120px;">
                  <el-option label="轮播图" :value="1"></el-option>
                  <el-option label="展示图" :value="2"></el-option>
                </el-select>
                <el-input-number
                  v-model="image.sortOrder"
                  :min="0"
                  :max="999"
                  size="small"
                  controls-position="right"
                  placeholder="排序"
                  style="width: 80px; margin: 0 10px;"
                ></el-input-number>
                <el-button type="danger" size="small" icon="Delete" circle @click="removeImage(index)"></el-button>
              </div>
            </div>
            <el-upload
              class="upload-button"
              action="#"
              list-type="picture-card"
              :auto-upload="false"
              :show-file-list="false"
              :on-change="handleImageChange"
            >
              <el-icon><Plus /></el-icon>
            </el-upload>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleDialogClose">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitLoading">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 活动详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="活动详情"
      width="700px"
    >
      <div v-if="currentPromotion">
        <div class="detail-item">
          <span class="detail-label">活动ID：</span>
          <span>{{ currentPromotion.promotionId }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">活动标题：</span>
          <span>{{ currentPromotion.title }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">活动描述：</span>
          <span>{{ currentPromotion.description }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">活动类型：</span>
          <span>{{ currentPromotion.promotionTypeDesc }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">活动状态：</span>
          <el-tag :type="currentPromotion.status === 1 ? 'success' : 'info'">
            {{ currentPromotion.statusDesc }}
          </el-tag>
        </div>
        <div class="detail-item">
          <span class="detail-label">开始时间：</span>
          <span>{{ currentPromotion.startTime }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">结束时间：</span>
          <span>{{ currentPromotion.endTime }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">排序值：</span>
          <span>{{ currentPromotion.sortOrder }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">跳转链接：</span>
          <span>{{ currentPromotion.urlLink }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">创建人：</span>
          <span>{{ currentPromotion.createdByUsername }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">创建时间：</span>
          <span>{{ currentPromotion.createdTime }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">更新时间：</span>
          <span>{{ currentPromotion.updatedTime }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">活动图片：</span>
          <div class="detail-images">
            <div v-for="(image, index) in currentPromotion.images" :key="index" class="detail-image-item">
              <el-image
                :src="image.imageUrl"
                style="width: 120px; height: 80px"
                fit="cover"
                :preview-src-list="[image.imageUrl]"
              ></el-image>
              <div class="image-info">
                <p>类型：{{ image.imageTypeDesc }}</p>
                <p>排序值：{{ image.sortOrder }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox, FormInstance } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import * as promotionApi from '@/api/promotion'
import { PromotionImageAddRequest } from '@/api/promotion'
import axios from 'axios'

// 图片转base64
const getBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = error => reject(error)
  })
}

// 查询条件
const searchForm = reactive({
  title: '',
  promotionType: undefined,
  status: undefined,
  startTimeBegin: '',
  startTimeEnd: '',
  endTimeBegin: '',
  endTimeEnd: '',
  pageNum: 1,
  pageSize: 10
})

// 日期范围
const dateRange = ref<[string, string] | null>(null)

// 列表数据
const loading = ref(false)
const promotionList = ref<promotionApi.Promotion[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 对话框状态
const dialogVisible = ref(false)
const dialogTitle = ref('添加营销活动')
const submitLoading = ref(false)

// 详情对话框
const detailDialogVisible = ref(false)
const currentPromotion = ref<promotionApi.Promotion | null>(null)

// 表单引用
const promotionFormRef = ref<FormInstance>()

// 活动类型选项
const promotionTypes = [
  { value: 1, label: '促销活动' },
  { value: 2, label: '折扣' },
  { value: 3, label: '满减' },
  { value: 4, label: '优惠券' }
]

// 状态选项
const statusOptions = [
  { value: 1, label: '上线' },
  { value: 0, label: '下线' }
]

// 表单数据
const promotionForm = reactive({
  promotionId: undefined as number | undefined,
  title: '',
  description: '',
  promotionType: 1,
  timeRange: [] as [string, string] | [],
  status: 1,
  sortOrder: 0,
  urlLink: '',
  images: [] as PromotionImageAddRequest[]
})

// 表单校验规则
const rules = {
  title: [
    { required: true, message: '请输入活动标题', trigger: 'blur' },
    { max: 100, message: '标题最多100个字符', trigger: 'blur' }
  ],
  promotionType: [
    { required: true, message: '请选择活动类型', trigger: 'change' }
  ],
  timeRange: [
    { required: true, message: '请选择活动时间范围', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择活动状态', trigger: 'change' }
  ]
}

// 获取列表数据
const fetchData = async () => {
  try {
    loading.value = true
    
    // 处理查询参数
    const params = { ...searchForm }
    params.pageNum = currentPage.value
    params.pageSize = pageSize.value
    
    const result = await promotionApi.getPromotionList(params)
    promotionList.value = result.list
    total.value = result.total
  } catch (error) {
    console.error('获取营销活动列表失败', error)
    ElMessage.error('获取营销活动列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  // 处理日期范围
  if (dateRange.value) {
    searchForm.startTimeBegin = dateRange.value[0]
    searchForm.startTimeEnd = dateRange.value[1]
  } else {
    searchForm.startTimeBegin = ''
    searchForm.startTimeEnd = ''
  }
  
  currentPage.value = 1
  fetchData()
}

// 重置搜索
const resetSearch = () => {
  // 重置查询条件
  searchForm.title = ''
  searchForm.promotionType = undefined
  searchForm.status = undefined
  searchForm.startTimeBegin = ''
  searchForm.startTimeEnd = ''
  searchForm.endTimeBegin = ''
  searchForm.endTimeEnd = ''
  dateRange.value = null
  
  currentPage.value = 1
  fetchData()
}

// 页码变化
const handleSizeChange = (size: number) => {
  pageSize.value = size
  fetchData()
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
  fetchData()
}

// 获取图片预览列表
const getImageUrlList = (images: promotionApi.PromotionImage[]) => {
  return images.map(img => img.imageUrl)
}

// 打开添加对话框
const openAddDialog = () => {
  dialogTitle.value = '添加营销活动'
  // 重置表单
  promotionForm.promotionId = undefined
  promotionForm.title = ''
  promotionForm.description = ''
  promotionForm.promotionType = 1
  promotionForm.timeRange = []
  promotionForm.status = 1
  promotionForm.sortOrder = 0
  promotionForm.urlLink = ''
  promotionForm.images = []
  
  dialogVisible.value = true
}

// 处理编辑
const handleEdit = (row: promotionApi.Promotion) => {
  dialogTitle.value = '编辑营销活动'
  promotionForm.promotionId = row.promotionId
  promotionForm.title = row.title
  promotionForm.description = row.description || ''
  promotionForm.promotionType = row.promotionType
  promotionForm.timeRange = [row.startTime, row.endTime]
  promotionForm.status = row.status
  promotionForm.sortOrder = row.sortOrder || 0
  promotionForm.urlLink = row.urlLink || ''
  
  // 处理图片
  promotionForm.images = []
  if (row.images && row.images.length > 0) {
    row.images.forEach(img => {
      promotionForm.images.push({
        imageUrl: img.imageUrl,
        imageType: img.imageType,
        sortOrder: img.sortOrder || 0
      })
    })
  }
  
  dialogVisible.value = true
}

// 处理详情
const handleDetail = async (row: promotionApi.Promotion) => {
  try {
    const detail = await promotionApi.getPromotionDetail(row.promotionId!)
    currentPromotion.value = detail
    detailDialogVisible.value = true
  } catch (error) {
    console.error('获取活动详情失败', error)
    ElMessage.error('获取活动详情失败')
  }
}

// 处理状态变更
const handleChangeStatus = (row: promotionApi.Promotion) => {
  const newStatus = row.status === 1 ? 0 : 1
  const statusText = newStatus === 1 ? '上线' : '下线'
  
  ElMessageBox.confirm(
    `确定要${statusText}该活动吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await promotionApi.updateStatus(row.promotionId!, newStatus)
      ElMessage.success(`${statusText}成功`)
      // 刷新列表
      fetchData()
    } catch (error) {
      console.error(`${statusText}失败`, error)
      ElMessage.error(`${statusText}失败`)
    }
  }).catch(() => {})
}

// 处理删除
const handleDelete = (row: promotionApi.Promotion) => {
  ElMessageBox.confirm(
    '确定要删除该活动吗？删除后不可恢复！',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await promotionApi.deletePromotion(row.promotionId!)
      ElMessage.success('删除成功')
      // 刷新列表
      if (promotionList.value.length === 1 && currentPage.value > 1) {
        currentPage.value--
      }
      fetchData()
    } catch (error) {
      console.error('删除失败', error)
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

// 关闭对话框
const handleDialogClose = () => {
  dialogVisible.value = false
  // 重置表单验证
  if (promotionFormRef.value) {
    promotionFormRef.value.resetFields()
  }
}

// 处理图片变更
const handleImageChange = async (file: any) => {
  try {
    // 验证文件类型
    const isImage = file.raw.type.indexOf('image/') !== -1
    if (!isImage) {
      ElMessage.error('只能上传图片文件!')
      return
    }
    
    // 验证文件大小
    const isLt2M = file.raw.size / 1024 / 1024 < 2
    if (!isLt2M) {
      ElMessage.error('图片大小不能超过2MB!')
      return
    }
    
    // 创建FormData对象
    const formData = new FormData()
    formData.append('file', file.raw)
    formData.append('type', 'promotion')
    
    // 调用文件上传API
    const response = await axios.post('/api/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    
    // 处理响应
    if (response.data.code === 0) {
      const imageUrl = response.data.data
      
      // 添加到图片列表
      promotionForm.images.push({
        imageUrl: imageUrl,
        imageType: 1,
        sortOrder: 0
      })
    } else {
      ElMessage.error(response.data.message || '上传失败')
    }
  } catch (error) {
    console.error('图片处理失败', error)
    ElMessage.error('图片处理失败')
  }
}

// 移除图片
const removeImage = (index: number) => {
  promotionForm.images.splice(index, 1)
}

// 提交表单
const submitForm = async () => {
  if (!promotionFormRef.value) return
  
  await promotionFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        submitLoading.value = true
        
        // 构建请求数据
        const formData: any = {
          title: promotionForm.title,
          description: promotionForm.description,
          promotionType: promotionForm.promotionType,
          startTime: promotionForm.timeRange[0],
          endTime: promotionForm.timeRange[1],
          status: promotionForm.status,
          sortOrder: promotionForm.sortOrder,
          urlLink: promotionForm.urlLink,
          images: promotionForm.images
        }
        
        if (promotionForm.promotionId) {
          // 更新
          formData.promotionId = promotionForm.promotionId
          await promotionApi.updatePromotion(formData)
          ElMessage.success('更新成功')
        } else {
          // 新增
          await promotionApi.addPromotion(formData)
          ElMessage.success('添加成功')
        }
        
        // 关闭对话框
        dialogVisible.value = false
        // 刷新列表
        fetchData()
      } catch (error) {
        console.error('保存失败', error)
        ElMessage.error('保存失败')
      } finally {
        submitLoading.value = false
      }
    } else {
      return false
    }
  })
}

// 生命周期
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.promotion-management {
  padding: 20px;
}

.search-container {
  margin-bottom: 20px;
  padding: 20px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}

.upload-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.upload-item {
  width: 180px;
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 8px;
  position: relative;
}

.preview-image {
  width: 100%;
  height: 100px;
  object-fit: cover;
}

.upload-item-actions {
  margin-top: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.upload-button {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 180px;
}

.detail-item {
  margin-bottom: 15px;
  display: flex;
}

.detail-label {
  font-weight: bold;
  width: 100px;
}

.detail-images {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 10px;
}

.detail-image-item {
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 8px;
}

.image-info {
  margin-top: 5px;
  font-size: 12px;
}

.image-info p {
  margin: 3px 0;
}
</style> 