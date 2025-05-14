<template>
  <div class="feedback-management-container">
    <div class="page-header">
      <h2>用户反馈管理</h2>
      <p>查看并回复用户的反馈信息</p>
    </div>

    <!-- 搜索过滤区域 -->
    <div class="search-container">
      <el-form :inline="true" :model="searchParams" class="search-form">
        <el-form-item label="反馈类型">
          <el-select v-model="searchParams.feedbackType" placeholder="全部" clearable>
            <el-option
              v-for="item in feedbackTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="处理状态">
          <el-select v-model="searchParams.status" placeholder="全部" clearable>
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 反馈列表 -->
    <div class="feedback-list">
      <el-table
        v-loading="loading"
        :data="feedbackList"
        stripe
        border
        style="width: 100%"
        :default-sort="{ prop: 'createdTime', order: 'descending' }"
      >
        <el-table-column prop="feedbackId" label="ID" width="80" sortable />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="feedbackTitle" label="反馈标题" min-width="200">
          <template #default="scope">
            <el-link type="primary" @click="openDetailDialog(scope.row.feedbackId)">
              {{ scope.row.feedbackTitle }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column label="反馈图片" width="120">
          <template #default="scope">
            <div v-if="scope.row.images">
              <el-image
                :src="scope.row.images.split(',')[0]"
                fit="cover"
                style="width: 60px; height: 60px; border-radius: 4px"
                :preview-src-list="scope.row.images.split(',')"
              >
                <template #error>
                  <div class="image-error">
                    <el-icon><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
              <span v-if="scope.row.images.split(',').length > 1" class="image-count">
                +{{ scope.row.images.split(',').length - 1 }}
              </span>
            </div>
            <span v-else>无</span>
          </template>
        </el-table-column>
        <el-table-column prop="feedbackTypeDesc" label="反馈类型" width="120" />
        <el-table-column label="处理状态" width="120">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ scope.row.statusDesc }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="优先级" width="100">
          <template #default="scope">
            <el-tag :type="getPriorityType(scope.row.priorityLevel)">
              {{ scope.row.priorityLevelDesc }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdTime" label="提交时间" width="180" sortable="custom" />
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="scope">
            <div class="operation-buttons">
              <el-button
                type="primary"
                size="small"
                @click="openDetailDialog(scope.row.feedbackId)"
              >
                <el-icon><View /></el-icon> 查看详情
              </el-button>
              <el-button
                type="success"
                size="small"
                @click="openReplyDialog(scope.row.feedbackId)"
                :disabled="scope.row.status === 2"
              >
                <el-icon><ChatLineRound /></el-icon> 回复
              </el-button>
              <el-dropdown @command="(command) => handleSetPriority(scope.row.feedbackId, command)">
                <el-button size="small" type="warning">
                  <el-icon><Star /></el-icon> 优先级
                  <el-icon class="el-icon--right"><arrow-down /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item :command="0">
                      <el-tag type="info" size="small">普通</el-tag>
                    </el-dropdown-item>
                    <el-dropdown-item :command="1">
                      <el-tag type="warning" size="small">重要</el-tag>
                    </el-dropdown-item>
                    <el-dropdown-item :command="2">
                      <el-tag type="danger" size="small">紧急</el-tag>
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.pageNum"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 反馈详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="反馈详情"
      width="700px"
      destroy-on-close
    >
      <div v-loading="detailLoading" class="feedback-detail" v-if="currentFeedback">
        <div class="detail-header">
          <h3>{{ currentFeedback.feedbackTitle }}</h3>
          <div class="meta-info">
            <span>用户: {{ currentFeedback.username }}</span>
            <span>提交时间: {{ currentFeedback.createdTime }}</span>
          </div>
          <div class="tags">
            <el-tag>{{ currentFeedback.feedbackTypeDesc }}</el-tag>
            <el-tag :type="getStatusType(currentFeedback.status)">{{ currentFeedback.statusDesc }}</el-tag>
            <el-tag :type="getPriorityType(currentFeedback.priorityLevel)">{{ currentFeedback.priorityLevelDesc }}</el-tag>
          </div>
        </div>
        
        <div class="detail-content">
          <h4>反馈内容</h4>
          <div class="content-text">{{ currentFeedback.feedbackContent }}</div>
          
          <template v-if="currentFeedback.images">
            <h4>附带图片</h4>
            <div class="image-list">
              <el-image 
                v-for="(url, index) in currentFeedback.images.split(',')" 
                :key="index"
                :src="url" 
                fit="cover"
                :preview-src-list="currentFeedback.images.split(',')"
                :initial-index="index"
                class="feedback-image"
              />
            </div>
          </template>
          
          <template v-if="currentFeedback.contactInfo">
            <h4>联系方式</h4>
            <div>{{ currentFeedback.contactInfo }}</div>
          </template>
        </div>
        
        <div class="reply-section" v-if="currentFeedback.adminReply">
          <h4>管理员回复</h4>
          <div class="reply-content">
            <div class="reply-text">{{ currentFeedback.adminReply }}</div>
            <div class="reply-time">回复时间: {{ currentFeedback.replyTime }}</div>
          </div>
        </div>
        
        <div class="reply-form" v-if="currentFeedback.status !== 2">
          <el-button type="primary" @click="openReplyDialog(currentFeedback.feedbackId)">回复反馈</el-button>
        </div>
      </div>
    </el-dialog>

    <!-- 回复对话框 -->
    <el-dialog
      v-model="replyDialogVisible"
      title="回复反馈"
      width="600px"
      destroy-on-close
    >
      <el-form
        ref="replyFormRef"
        :model="replyForm"
        :rules="replyRules"
        label-width="100px"
      >
        <el-form-item label="反馈ID">
          <el-input v-model="replyForm.feedbackId" disabled />
        </el-form-item>
        <el-form-item label="回复内容" prop="adminReply">
          <el-input
            v-model="replyForm.adminReply"
            type="textarea"
            :rows="5"
            placeholder="请输入回复内容"
          />
        </el-form-item>
        <el-form-item label="状态设置" prop="status">
          <el-radio-group v-model="replyForm.status">
            <el-radio :label="1">处理中</el-radio>
            <el-radio :label="2">已处理</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="replyDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitReply" :loading="submitting">
            提交回复
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowDown, View, ChatLineRound, Star, Picture } from '@element-plus/icons-vue'
import * as feedbackApi from '@/api/feedback'
import type { FormInstance, FormRules } from 'element-plus'

// 反馈列表
const feedbackList = ref<any[]>([])

// 当前查看的反馈详情
const currentFeedback = ref<any>(null)

// 分页数据
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
  pages: 0
})

// 搜索参数
const searchParams = reactive({
  feedbackType: undefined as number | undefined,
  status: undefined as number | undefined
})

// 加载状态
const loading = ref(false)
const detailLoading = ref(false)
const submitting = ref(false)

// 对话框显示状态
const detailDialogVisible = ref(false)
const replyDialogVisible = ref(false)

// 回复表单
const replyFormRef = ref<FormInstance>()
const replyForm = reactive({
  feedbackId: 0,
  adminReply: '',
  status: 2
})

// 回复表单校验规则
const replyRules = reactive<FormRules>({
  adminReply: [
    { required: true, message: '请输入回复内容', trigger: 'blur' },
    { min: 5, max: 500, message: '回复内容长度应在5到500个字符之间', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择处理状态', trigger: 'change' }
  ]
})

// 反馈类型选项
const feedbackTypeOptions = [
  { label: '全部', value: undefined },
  { label: '功能建议', value: feedbackApi.FeedbackTypeEnum.FEATURE_SUGGESTION },
  { label: '体验问题', value: feedbackApi.FeedbackTypeEnum.EXPERIENCE_ISSUE },
  { label: '商品相关', value: feedbackApi.FeedbackTypeEnum.PRODUCT_RELATED },
  { label: '物流相关', value: feedbackApi.FeedbackTypeEnum.LOGISTICS_RELATED },
  { label: '其他', value: feedbackApi.FeedbackTypeEnum.OTHER }
]

// 状态选项
const statusOptions = [
  { label: '全部', value: undefined },
  { label: '未处理', value: feedbackApi.FeedbackStatusEnum.UNPROCESSED },
  { label: '处理中', value: feedbackApi.FeedbackStatusEnum.PROCESSING },
  { label: '已处理', value: feedbackApi.FeedbackStatusEnum.PROCESSED }
]

// 获取状态类型
const getStatusType = (status: number) => {
  return feedbackApi.FeedbackStatusEnum.getStatusType(status)
}

// 获取优先级类型
const getPriorityType = (level: number) => {
  return feedbackApi.PriorityLevelEnum.getPriorityType(level)
}

// 获取反馈列表
const getFeedbackList = async () => {
  loading.value = true
  try {
    const params = {
      ...searchParams,
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      orderBy: 'createdTime',
      orderDirection: 'desc'
    }
    
    const res = await feedbackApi.getFeedbackList(params)
    feedbackList.value = res.list
    pagination.total = res.total
    pagination.pages = res.pages
  } catch (error) {
    console.error('获取反馈列表失败:', error)
    ElMessage.error('获取反馈列表失败，请检查网络连接或登录状态')
  } finally {
    loading.value = false
  }
}

// 打开详情对话框
const openDetailDialog = async (feedbackId: number) => {
  detailDialogVisible.value = true
  await loadFeedbackDetail(feedbackId)
}

// 加载反馈详情
const loadFeedbackDetail = async (feedbackId: number) => {
  detailLoading.value = true
  try {
    const res = await feedbackApi.getFeedbackDetail(feedbackId)
    currentFeedback.value = res
  } catch (error) {
    console.error('获取反馈详情失败:', error)
    ElMessage.error('获取反馈详情失败，请检查网络连接或登录状态')
  } finally {
    detailLoading.value = false
  }
}

// 打开回复对话框
const openReplyDialog = async (feedbackId: number) => {
  // 先获取反馈详情
  if (!currentFeedback.value || currentFeedback.value.feedbackId !== feedbackId) {
    await loadFeedbackDetail(feedbackId)
  }
  
  // 重置回复表单
  replyForm.feedbackId = feedbackId
  replyForm.adminReply = currentFeedback.value?.adminReply || ''
  replyForm.status = currentFeedback.value?.status === 1 ? 1 : 2
  
  replyDialogVisible.value = true
}

// 提交回复
const submitReply = async () => {
  if (!replyFormRef.value) return
  
  await replyFormRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        const res = await feedbackApi.replyFeedback(replyForm)
        ElMessage.success('回复成功')
        replyDialogVisible.value = false
        
        // 更新当前查看的反馈数据
        if (currentFeedback.value && currentFeedback.value.feedbackId === replyForm.feedbackId) {
          await loadFeedbackDetail(replyForm.feedbackId)
        }
        
        // 刷新列表
        getFeedbackList()
      } catch (error) {
        console.error('回复反馈失败:', error)
        ElMessage.error('回复反馈失败，请检查网络连接或登录状态')
      } finally {
        submitting.value = false
      }
    }
  })
}

// 设置优先级
const handleSetPriority = async (feedbackId: number, priorityLevel: number) => {
  try {
    const res = await feedbackApi.setPriorityLevel({
      feedbackId,
      priorityLevel
    })
    
    ElMessage.success('设置优先级成功')
    
    // 更新当前查看的反馈数据
    if (currentFeedback.value && currentFeedback.value.feedbackId === feedbackId) {
      await loadFeedbackDetail(feedbackId)
    }
    
    // 刷新列表
    getFeedbackList()
  } catch (error) {
    console.error('设置优先级失败:', error)
    ElMessage.error('设置优先级失败，请检查网络连接或登录状态')
  }
}

// 处理页码变更
const handleCurrentChange = (val: number) => {
  pagination.pageNum = val
  getFeedbackList()
}

// 处理每页条数变更
const handleSizeChange = (val: number) => {
  pagination.pageSize = val
  pagination.pageNum = 1
  getFeedbackList()
}

// 处理搜索
const handleSearch = () => {
  pagination.pageNum = 1
  getFeedbackList()
}

// 重置搜索
const resetSearch = () => {
  searchParams.feedbackType = undefined
  searchParams.status = undefined
  pagination.pageNum = 1
  getFeedbackList()
}

// 初始化
onMounted(() => {
  getFeedbackList()
})
</script>

<style scoped>
.feedback-management-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
}

.page-header p {
  color: #606266;
  margin: 0;
}

.search-container {
  margin-bottom: 20px;
  padding: 18px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.feedback-list {
  background-color: #fff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.feedback-detail {
  padding: 10px;
}

.detail-header {
  margin-bottom: 20px;
}

.detail-header h3 {
  margin: 0 0 10px 0;
  font-size: 18px;
}

.meta-info {
  display: flex;
  margin-bottom: 10px;
}

.meta-info span {
  margin-right: 15px;
  color: #606266;
  font-size: 14px;
}

.tags {
  margin-bottom: 15px;
}

.tags .el-tag {
  margin-right: 8px;
}

.detail-content {
  margin-bottom: 20px;
}

.detail-content h4 {
  font-size: 16px;
  margin: 10px 0;
  color: #303133;
}

.content-text {
  white-space: pre-wrap;
  line-height: 1.6;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 10px 0;
}

.feedback-image {
  width: 120px;
  height: 120px;
  border-radius: 4px;
  object-fit: cover;
}

.reply-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.reply-section h4 {
  font-size: 16px;
  margin: 0 0 10px 0;
  color: #303133;
}

.reply-content {
  background-color: #f0f9eb;
  padding: 15px;
  border-radius: 4px;
  position: relative;
}

.reply-text {
  white-space: pre-wrap;
  line-height: 1.6;
}

.reply-time {
  color: #909399;
  font-size: 12px;
  margin-top: 10px;
  text-align: right;
}

.reply-form {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
  text-align: center;
}

.operation-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

:deep(.el-dropdown-menu__item) {
  display: flex;
  justify-content: center;
  padding: 8px 16px;
}

:deep(.el-button .el-icon) {
  margin-right: 4px;
}

:deep(.el-table .cell) {
  padding: 8px;
}

:deep(.el-table--border .el-table__cell) {
  padding: 8px;
}

.image-error {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 60px;
  height: 60px;
  background-color: #f5f7fa;
  border-radius: 4px;
  color: #909399;
}

.image-count {
  display: inline-block;
  margin-left: 4px;
  font-size: 12px;
  color: #909399;
}
</style> 