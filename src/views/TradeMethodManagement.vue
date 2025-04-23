<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as productApi from '@/api/product'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 交易方式接口
interface TradeMethod {
  methodId: number
  methodName: string
  methodDesc: string
}

const tradeMethodList = ref<TradeMethod[]>([])
const loading = ref(false)

// 获取交易方式列表
const fetchTradeMethodList = async () => {
  // 检查用户权限
  if (!userStore.isAdmin) {
    ElMessage.error('无权访问')
    return
  }

  loading.value = true
  try {
    // 这里应该调用获取交易方式列表的API，目前API文档中没有提供，先模拟数据
    // const res = await productApi.getTradeMethodList()
    // 模拟数据
    const mockMethods: TradeMethod[] = [
      {
        methodId: 1,
        methodName: '上门回收',
        methodDesc: '由回收人员上门进行商品回收交易'
      },
      {
        methodId: 2,
        methodName: '线下交易',
        methodDesc: '买卖双方约定时间地点见面交易'
      },
      {
        methodId: 3,
        methodName: '快递配送',
        methodDesc: '卖家通过快递寄送商品，买家确认收货后完成交易'
      }
    ]
    tradeMethodList.value = mockMethods
    loading.value = false
  } catch (error) {
    console.error('获取交易方式列表失败:', error)
    ElMessage.error('获取交易方式列表失败')
    loading.value = false
  }
}

// 添加交易方式对话框
const dialogVisible = ref(false)
const methodForm = ref({
  methodName: '',
  methodDesc: ''
})

// 表单校验规则
const rules = {
  methodName: [{ required: true, message: '请输入交易方式名称', trigger: 'blur' }],
  methodDesc: [{ required: true, message: '请输入交易方式描述', trigger: 'blur' }]
}

// 提交添加交易方式表单
const methodFormRef = ref()
const submitMethodForm = async () => {
  if (!methodFormRef.value) return

  methodFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        const res = await productApi.addTradeMethod({
          methodName: methodForm.value.methodName,
          methodDesc: methodForm.value.methodDesc
        })
        
        if (res.code === 0) {
          ElMessage.success('添加成功')
          dialogVisible.value = false
          fetchTradeMethodList()
          // 重置表单
          methodForm.value.methodName = ''
          methodForm.value.methodDesc = ''
        } else {
          ElMessage.error(res.message || '添加失败')
        }
      } catch (error) {
        console.error('添加交易方式失败:', error)
        ElMessage.error('添加交易方式失败')
      }
    }
  })
}

// 页面加载时获取列表
onMounted(() => {
  if (userStore.isAdmin) {
    fetchTradeMethodList()
  } else {
    ElMessage.error('无权访问此页面')
  }
})
</script>

<template>
  <div class="trade-method-management" v-if="userStore.isAdmin">
    <el-card class="method-card">
      <template #header>
        <div class="card-header">
          <span>商品交易方式管理</span>
          <el-button type="primary" @click="dialogVisible = true">添加交易方式</el-button>
        </div>
      </template>
      
      <el-table :data="tradeMethodList" stripe border v-loading="loading">
        <el-table-column prop="methodId" label="ID" width="80"></el-table-column>
        <el-table-column prop="methodName" label="交易方式名称" min-width="120"></el-table-column>
        <el-table-column prop="methodDesc" label="交易方式描述" min-width="200" show-overflow-tooltip></el-table-column>
      </el-table>
      
      <el-empty v-if="tradeMethodList.length === 0 && !loading" description="暂无交易方式">
        <el-button type="primary" @click="dialogVisible = true">添加交易方式</el-button>
      </el-empty>
    </el-card>

    <!-- 添加交易方式对话框 -->
    <el-dialog v-model="dialogVisible" title="添加交易方式" width="40%">
      <el-form :model="methodForm" :rules="rules" ref="methodFormRef" label-width="100px">
        <el-form-item label="方式名称" prop="methodName">
          <el-input v-model="methodForm.methodName" placeholder="请输入交易方式名称"></el-input>
        </el-form-item>
        <el-form-item label="方式描述" prop="methodDesc">
          <el-input v-model="methodForm.methodDesc" type="textarea" :rows="4" placeholder="请输入交易方式描述"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitMethodForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
  <el-empty v-else description="您没有权限访问此页面">
    <el-button type="primary" @click="$router.push('/dashboard')">返回首页</el-button>
  </el-empty>
</template>

<style scoped>
.trade-method-management {
  padding: 20px;
}

.method-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style> 