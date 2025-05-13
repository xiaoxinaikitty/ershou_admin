<script setup lang="ts">
import { ref, onMounted, reactive, onUnmounted, shallowRef } from 'vue'
import { ElMessage, ElAlert } from 'element-plus'
import { Warning } from '@element-plus/icons-vue'
import * as dataAnalysisApi from '@/api/dataAnalysis'

// 动态导入echarts，避免直接导入可能引发的问题
const echarts = shallowRef<any>(null)
const echartsError = ref(false)

// 数据加载状态
const loading = ref(true)
// 网络错误状态
const networkError = ref(false)
// 错误消息
const errorMessage = ref('')
// 数据摘要
const dataSummary = ref<any>(null)
// 图表DOM引用
const categoryChartRef = ref<HTMLElement | null>(null)
const priceRangeChartRef = ref<HTMLElement | null>(null)
const productStatusChartRef = ref<HTMLElement | null>(null)
const orderStatusChartRef = ref<HTMLElement | null>(null)
const productTrendChartRef = ref<HTMLElement | null>(null)
const orderTrendChartRef = ref<HTMLElement | null>(null)
const registerTrendChartRef = ref<HTMLElement | null>(null)
const orderAmountTrendChartRef = ref<HTMLElement | null>(null)

// 图表实例
const charts = reactive<Record<string, any>>({
  categoryChart: null,
  priceRangeChart: null,
  productStatusChart: null,
  orderStatusChart: null,
  productTrendChart: null,
  orderTrendChart: null,
  registerTrendChart: null,
  orderAmountTrendChart: null
})

// 动态加载echarts
const loadEcharts = async () => {
  try {
    const echartsModule = await import('echarts')
    echarts.value = echartsModule
    
    // 注册内置主题，避免使用可能带有外部图片URL的自定义主题
    echarts.value.registerTheme('custom', {
      color: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'],
      backgroundColor: 'rgba(0, 0, 0, 0)',
      textStyle: {},
      title: {
        textStyle: {
          color: '#464646'
        },
        subtextStyle: {
          color: '#6E7079'
        }
      },
      line: {
        itemStyle: {
          borderWidth: 1
        },
        lineStyle: {
          width: 2
        },
        symbolSize: 4,
        symbol: 'emptyCircle',
        smooth: false
      },
      radar: {
        itemStyle: {
          borderWidth: 1
        },
        lineStyle: {
          width: 2
        },
        symbolSize: 4,
        symbol: 'emptyCircle',
        smooth: false
      },
      bar: {
        itemStyle: {
          barBorderWidth: 0,
          barBorderColor: '#ccc'
        }
      },
      pie: {
        itemStyle: {
          borderWidth: 0,
          borderColor: '#ccc'
        }
      },
      scatter: {
        itemStyle: {
          borderWidth: 0,
          borderColor: '#ccc'
        }
      },
      boxplot: {
        itemStyle: {
          borderWidth: 0,
          borderColor: '#ccc'
        }
      },
      parallel: {
        itemStyle: {
          borderWidth: 0,
          borderColor: '#ccc'
        }
      },
      sankey: {
        itemStyle: {
          borderWidth: 0,
          borderColor: '#ccc'
        }
      },
      funnel: {
        itemStyle: {
          borderWidth: 0,
          borderColor: '#ccc'
        }
      },
      gauge: {
        itemStyle: {
          borderWidth: 0,
          borderColor: '#ccc'
        }
      },
      candlestick: {
        itemStyle: {
          color: '#eb5454',
          color0: '#47b262',
          borderColor: '#eb5454',
          borderColor0: '#47b262',
          borderWidth: 1
        }
      }
    })
    
    return true
  } catch (error) {
    console.error('Failed to load echarts:', error)
    echartsError.value = true
    ElMessage.error('图表库加载失败，请安装echarts依赖')
    return false
  }
}

// 日期范围选择
const dateRange = ref<[Date, Date]>([
  new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000),
  new Date()
])

// 加载数据摘要
const loadDataSummary = async () => {
  try {
    console.log('开始加载数据摘要')
    const res = await dataAnalysisApi.getDataSummary()
    // 统一处理成功响应，兼容code=0或code=200两种格式
    if ((res.code === 0 || res.code === 200) && res.data) {
      dataSummary.value = res.data
      console.log('数据摘要加载成功:', res.data)
    } else {
      console.error('获取数据摘要失败:', res.message)
      ElMessage.error(res.message || '获取数据摘要失败')
    }
  } catch (error) {
    console.error('获取数据摘要异常:', error)
    ElMessage.error('获取数据摘要失败')
  }
}

// 加载商品分类统计
const loadCategoryAnalysis = async () => {
  if (!echarts.value) {
    console.warn('加载商品分类统计失败: echarts未初始化')
    return
  }
  
  try {
    console.log('开始加载商品分类统计')
    const res = await dataAnalysisApi.getProductCategoryAnalysis()
    // 统一处理成功响应，兼容code=0或code=200两种格式
    if ((res.code === 0 || res.code === 200) && res.data && res.data.length > 0) {
      console.log('商品分类统计加载成功:', res.data)
      initCategoryChart(res.data)
    } else {
      console.warn('商品分类统计数据为空或返回错误:', res)
    }
  } catch (error) {
    console.error('获取商品分类统计异常:', error)
    ElMessage.error('获取商品分类统计失败')
  }
}

// 初始化商品分类图表
const initCategoryChart = (data: any[]) => {
  if (!categoryChartRef.value || !echarts.value) return
  
  // 使用自定义主题初始化图表，避免使用可能导致外部依赖的默认主题
  charts.categoryChart = echarts.value.init(categoryChartRef.value, 'custom')
  
  const option = {
    title: {
      text: '商品分类统计',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: data.map(item => item.categoryName)
    },
    series: [
      {
        name: '商品分类',
        type: 'pie',
        radius: '50%',
        data: data.map(item => ({
          name: item.categoryName,
          value: item.count
        })),
        itemStyle: {
          borderRadius: 5,
          borderColor: '#fff',
          borderWidth: 2
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        label: {
          formatter: '{b}: {c} ({d}%)',
          fontSize: 14
        }
      }
    ]
  }
  
  charts.categoryChart.setOption(option)
}

// 加载商品价格区间统计
const loadPriceRangeAnalysis = async () => {
  if (!echarts.value) {
    console.warn('加载商品价格区间统计失败: echarts未初始化')
    return
  }
  
  try {
    console.log('开始加载商品价格区间统计')
    const res = await dataAnalysisApi.getProductPriceRangeAnalysis()
    if ((res.code === 0 || res.code === 200) && res.data && res.data.length > 0) {
      console.log('商品价格区间统计加载成功:', res.data)
      initPriceRangeChart(res.data)
    } else {
      console.warn('商品价格区间统计数据为空或返回错误:', res)
    }
  } catch (error) {
    console.error('获取商品价格区间统计异常:', error)
    ElMessage.error('获取商品价格区间统计失败')
  }
}

// 初始化商品价格区间图表
const initPriceRangeChart = (data: any[]) => {
  if (!priceRangeChartRef.value || !echarts.value) return
  
  charts.priceRangeChart = echarts.value.init(priceRangeChartRef.value, 'custom')
  
  const option = {
    title: {
      text: '商品价格区间统计',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    xAxis: {
      type: 'category',
      data: data.map(item => item.range),
      axisLabel: {
        interval: 0,
        rotate: 30
      }
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '商品数量',
        type: 'bar',
        data: data.map(item => item.count),
        itemStyle: {
          color: new echarts.value.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#83bff6' },
            { offset: 0.5, color: '#188df0' },
            { offset: 1, color: '#188df0' }
          ])
        }
      }
    ]
  }
  
  charts.priceRangeChart.setOption(option)
}

// 加载商品状态统计
const loadProductStatusAnalysis = async () => {
  if (!echarts.value) {
    console.warn('加载商品状态统计失败: echarts未初始化')
    return
  }
  
  try {
    console.log('开始加载商品状态统计')
    const res = await dataAnalysisApi.getProductStatusAnalysis()
    if ((res.code === 0 || res.code === 200) && res.data && res.data.length > 0) {
      console.log('商品状态统计加载成功:', res.data)
      initProductStatusChart(res.data)
    } else {
      console.warn('商品状态统计数据为空或返回错误:', res)
    }
  } catch (error) {
    console.error('获取商品状态统计异常:', error)
    ElMessage.error('获取商品状态统计失败')
  }
}

// 初始化商品状态图表
const initProductStatusChart = (data: any[]) => {
  if (!productStatusChartRef.value || !echarts.value) return
  
  charts.productStatusChart = echarts.value.init(productStatusChartRef.value, 'custom')
  
  const option = {
    title: {
      text: '商品状态统计',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: data.map(item => item.statusDesc)
    },
    series: [
      {
        name: '商品状态',
        type: 'pie',
        radius: '50%',
        data: data.map(item => ({
          name: item.statusDesc,
          value: item.count
        })),
        itemStyle: {
          borderRadius: 5,
          borderColor: '#fff',
          borderWidth: 2
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        label: {
          formatter: '{b}: {c} ({d}%)',
          fontSize: 14
        }
      }
    ]
  }
  
  charts.productStatusChart.setOption(option)
}

// 加载订单状态统计
const loadOrderStatusAnalysis = async () => {
  if (!echarts.value) {
    console.warn('加载订单状态统计失败: echarts未初始化')
    return
  }
  
  try {
    console.log('开始加载订单状态统计')
    const res = await dataAnalysisApi.getOrderStatusAnalysis()
    if ((res.code === 0 || res.code === 200) && res.data && res.data.length > 0) {
      console.log('订单状态统计加载成功:', res.data)
      initOrderStatusChart(res.data)
    } else {
      console.warn('订单状态统计数据为空或返回错误:', res)
    }
  } catch (error) {
    console.error('获取订单状态统计异常:', error)
    ElMessage.error('获取订单状态统计失败')
  }
}

// 初始化订单状态图表
const initOrderStatusChart = (data: any[]) => {
  if (!orderStatusChartRef.value || !echarts.value) return
  
  charts.orderStatusChart = echarts.value.init(orderStatusChartRef.value, 'custom')
  
  const option = {
    title: {
      text: '订单状态统计',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: data.map(item => item.statusDesc)
    },
    series: [
      {
        name: '订单状态',
        type: 'pie',
        radius: '50%',
        data: data.map(item => ({
          name: item.statusDesc,
          value: item.count
        })),
        itemStyle: {
          borderRadius: 5,
          borderColor: '#fff',
          borderWidth: 2
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        label: {
          formatter: '{b}: {c} ({d}%)',
          fontSize: 14
        }
      }
    ]
  }
  
  charts.orderStatusChart.setOption(option)
}

// 加载各种趋势数据
const loadTrendData = async () => {
  if (!echarts.value) {
    console.warn('加载趋势数据失败: echarts未初始化')
    return
  }
  
  try {
    console.log('开始加载趋势数据')
    const days = Math.ceil((dateRange.value[1].getTime() - dateRange.value[0].getTime()) / (24 * 60 * 60 * 1000))
    
    // 加载商品发布趋势
    const productTrendRes = await dataAnalysisApi.getProductTrend(days)
    if ((productTrendRes.code === 0 || productTrendRes.code === 200) && productTrendRes.data) {
      console.log('商品发布趋势加载成功:', productTrendRes.data)
      initProductTrendChart(productTrendRes.data)
    } else {
      console.warn('商品发布趋势数据为空或返回错误:', productTrendRes)
    }
    
    // 加载用户注册趋势
    const registerTrendRes = await dataAnalysisApi.getUserRegisterTrend(days)
    if ((registerTrendRes.code === 0 || registerTrendRes.code === 200) && registerTrendRes.data) {
      console.log('用户注册趋势加载成功:', registerTrendRes.data)
      initRegisterTrendChart(registerTrendRes.data)
    } else {
      console.warn('用户注册趋势数据为空或返回错误:', registerTrendRes)
    }
    
    // 加载订单趋势
    const orderTrendRes = await dataAnalysisApi.getOrderTrend(days)
    if ((orderTrendRes.code === 0 || orderTrendRes.code === 200) && orderTrendRes.data) {
      console.log('订单趋势加载成功:', orderTrendRes.data)
      initOrderTrendChart(orderTrendRes.data)
    } else {
      console.warn('订单趋势数据为空或返回错误:', orderTrendRes)
    }
    
    // 加载订单金额趋势
    const orderAmountTrendRes = await dataAnalysisApi.getOrderAmountTrend(days)
    if ((orderAmountTrendRes.code === 0 || orderAmountTrendRes.code === 200) && orderAmountTrendRes.data) {
      console.log('订单金额趋势加载成功:', orderAmountTrendRes.data)
      initOrderAmountTrendChart(orderAmountTrendRes.data)
    } else {
      console.warn('订单金额趋势数据为空或返回错误:', orderAmountTrendRes)
    }
  } catch (error) {
    console.error('获取趋势数据异常:', error)
    ElMessage.error('获取趋势数据失败')
  }
}

// 初始化商品发布趋势图表
const initProductTrendChart = (data: any[]) => {
  if (!productTrendChartRef.value || !echarts.value) return
  
  charts.productTrendChart = echarts.value.init(productTrendChartRef.value, 'custom')
  
  const option = {
    title: {
      text: '商品发布趋势',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: data.map(item => item.date),
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '商品数量',
        type: 'line',
        data: data.map(item => item.count),
        smooth: true,
        lineStyle: {
          width: 3,
          color: new echarts.value.graphic.LinearGradient(0, 0, 1, 0, [
            {offset: 0, color: '#1890ff'},
            {offset: 1, color: '#39c8c8'}
          ])
        },
        areaStyle: {
          opacity: 0.3,
          color: new echarts.value.graphic.LinearGradient(0, 0, 0, 1, [
            {offset: 0, color: '#1890ff'},
            {offset: 1, color: 'rgba(0, 156, 217, 0.1)'}
          ])
        },
        markPoint: {
          data: [
            { type: 'max', name: '最大值' },
            { type: 'min', name: '最小值' }
          ],
          symbol: 'circle'
        }
      }
    ]
  }
  
  charts.productTrendChart.setOption(option)
}

// 初始化用户注册趋势图表
const initRegisterTrendChart = (data: any[]) => {
  if (!registerTrendChartRef.value || !echarts.value) return
  
  charts.registerTrendChart = echarts.value.init(registerTrendChartRef.value, 'custom')
  
  const option = {
    title: {
      text: '用户注册趋势',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: data.map(item => item.date),
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '注册人数',
        type: 'line',
        data: data.map(item => item.count),
        smooth: true,
        lineStyle: {
          width: 3,
          color: new echarts.value.graphic.LinearGradient(0, 0, 1, 0, [
            {offset: 0, color: '#ff7f50'},
            {offset: 1, color: '#ff4500'}
          ])
        },
        areaStyle: {
          opacity: 0.3,
          color: new echarts.value.graphic.LinearGradient(0, 0, 0, 1, [
            {offset: 0, color: '#ff7f50'},
            {offset: 1, color: 'rgba(255, 69, 0, 0.1)'}
          ])
        },
        markPoint: {
          data: [
            { type: 'max', name: '最大值' },
            { type: 'min', name: '最小值' }
          ],
          symbol: 'circle'
        }
      }
    ]
  }
  
  charts.registerTrendChart.setOption(option)
}

// 初始化订单趋势图表
const initOrderTrendChart = (data: any[]) => {
  if (!orderTrendChartRef.value || !echarts.value) return
  
  charts.orderTrendChart = echarts.value.init(orderTrendChartRef.value, 'custom')
  
  const option = {
    title: {
      text: '订单趋势',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: data.map(item => item.date),
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '订单数量',
        type: 'line',
        data: data.map(item => item.count),
        smooth: true,
        lineStyle: {
          width: 3,
          color: new echarts.value.graphic.LinearGradient(0, 0, 1, 0, [
            {offset: 0, color: '#7B68EE'},
            {offset: 1, color: '#9932CC'}
          ])
        },
        areaStyle: {
          opacity: 0.3,
          color: new echarts.value.graphic.LinearGradient(0, 0, 0, 1, [
            {offset: 0, color: '#7B68EE'},
            {offset: 1, color: 'rgba(153, 50, 204, 0.1)'}
          ])
        },
        markPoint: {
          data: [
            { type: 'max', name: '最大值' },
            { type: 'min', name: '最小值' }
          ],
          symbol: 'circle'
        }
      }
    ]
  }
  
  charts.orderTrendChart.setOption(option)
}

// 初始化订单金额趋势图表
const initOrderAmountTrendChart = (data: any[]) => {
  if (!orderAmountTrendChartRef.value || !echarts.value) return
  
  charts.orderAmountTrendChart = echarts.value.init(orderAmountTrendChartRef.value, 'custom')
  
  const option = {
    title: {
      text: '订单金额趋势',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      formatter: function(params: any) {
        const data = params[0].data
        return `${params[0].name}<br/>订单数量: ${data.count}<br/>交易金额: ${data.amount.toFixed(2)}元`
      }
    },
    xAxis: {
      type: 'category',
      data: data.map(item => item.date),
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '{value} 元'
      }
    },
    series: [
      {
        name: '交易金额',
        type: 'bar',
        data: data.map(item => ({
          value: item.amount,
          count: item.count
        })),
        itemStyle: {
          color: new echarts.value.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#91cc75' },
            { offset: 0.5, color: '#5c9d49' },
            { offset: 1, color: '#5c9d49' }
          ])
        }
      }
    ]
  }
  
  charts.orderAmountTrendChart.setOption(option)
}

// 处理日期范围变更
const handleDateRangeChange = () => {
  // 重新加载趋势数据
  loadTrendData()
}

// 加载所有数据
const loadAllData = async () => {
  loading.value = true
  networkError.value = false
  errorMessage.value = ''
  
  try {
    console.log('开始加载所有数据')
    // 先尝试加载echarts
    const echartsLoaded = await loadEcharts()
    if (!echartsLoaded) {
      console.error('echarts加载失败')
      loading.value = false
      return
    }
    
    // 并行加载所有数据，提高加载速度
    const promises = [
      loadDataSummary(),
      loadCategoryAnalysis(),
      loadPriceRangeAnalysis(),
      loadProductStatusAnalysis(),
      loadOrderStatusAnalysis(),
      loadTrendData()
    ]
    
    await Promise.allSettled(promises)
    console.log('所有数据加载完成')
  } catch (error: any) {
    console.error('加载数据失败:', error)
    networkError.value = true
    errorMessage.value = error.message || '加载数据失败，请检查网络连接'
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 处理窗口大小变化
const handleResize = () => {
  if (!echarts.value) return
  
  Object.values(charts).forEach(chart => {
    chart && chart.resize()
  })
}

// 组件挂载时加载数据
onMounted(() => {
  loadAllData()
  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
})

// 组件卸载时清理图表和事件监听
onUnmounted(() => {
  Object.values(charts).forEach(chart => {
    chart && chart.dispose()
  })
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <div class="data-analysis-container" v-loading="loading">
    <!-- echarts加载错误提示 -->
    <el-alert
      v-if="echartsError"
      title="图表库加载失败"
      type="error"
      description="请检查项目依赖并重新安装echarts: npm install echarts@^5.4.2"
      show-icon
      :closable="false"
      style="margin-bottom: 20px;"
    />
    
    <!-- 网络错误提示 -->
    <el-alert
      v-if="networkError"
      title="网络连接错误"
      type="error"
      :description="errorMessage || '无法连接到服务器，请检查网络设置或联系管理员'"
      show-icon
      :closable="false"
      style="margin-bottom: 20px;"
    >
      <template #default>
        <div>
          <p>可能的原因:</p>
          <ul>
            <li>后端服务器未启动或不可访问</li>
            <li>API路径配置错误</li>
            <li>网络连接问题</li>
          </ul>
          <el-button type="primary" size="small" @click="loadAllData">重试</el-button>
        </div>
      </template>
    </el-alert>
    
    <!-- 数据摘要卡片 -->
    <el-card v-if="dataSummary" class="summary-card">
      <template #header>
        <div class="card-header">
          <span>平台数据摘要</span>
        </div>
      </template>
      <div class="summary-grid">
        <div class="summary-item">
          <div class="item-value">{{ dataSummary.totalUsers }}</div>
          <div class="item-label">总用户数</div>
        </div>
        <div class="summary-item">
          <div class="item-value">{{ dataSummary.totalProducts }}</div>
          <div class="item-label">总商品数</div>
        </div>
        <div class="summary-item">
          <div class="item-value">{{ dataSummary.totalOrders }}</div>
          <div class="item-label">总订单数</div>
        </div>
        <div class="summary-item">
          <div class="item-value">{{ dataSummary.totalOrderAmount.toFixed(2) }}</div>
          <div class="item-label">总交易金额</div>
        </div>
        <div class="summary-item">
          <div class="item-value">{{ dataSummary.newUsersLast30Days }}</div>
          <div class="item-label">近30天新增用户</div>
        </div>
        <div class="summary-item">
          <div class="item-value">{{ dataSummary.newProductsLast30Days }}</div>
          <div class="item-label">近30天新增商品</div>
        </div>
        <div class="summary-item">
          <div class="item-value">{{ dataSummary.newOrdersLast30Days }}</div>
          <div class="item-label">近30天新增订单</div>
        </div>
        <div class="summary-item">
          <div class="item-value">{{ dataSummary.newOrderAmountLast30Days.toFixed(2) }}</div>
          <div class="item-label">近30天交易金额</div>
        </div>
      </div>
    </el-card>
    
    <!-- 图表区域，仅当echarts可用时显示 -->
    <template v-if="!echartsError">
      <!-- 日期范围选择器 -->
      <el-card class="filter-card">
        <div class="date-filter">
          <span>选择日期范围：</span>
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            @change="handleDateRangeChange"
          />
        </div>
      </el-card>
      
      <!-- 饼图区域 -->
      <div class="chart-grid pie-charts">
        <el-card class="chart-card">
          <div ref="categoryChartRef" class="chart"></div>
        </el-card>
        <el-card class="chart-card">
          <div ref="productStatusChartRef" class="chart"></div>
        </el-card>
        <el-card class="chart-card">
          <div ref="orderStatusChartRef" class="chart"></div>
        </el-card>
        <el-card class="chart-card">
          <div ref="priceRangeChartRef" class="chart"></div>
        </el-card>
      </div>
      
      <!-- 趋势图区域 -->
      <div class="chart-grid trend-charts">
        <el-card class="chart-card">
          <div ref="productTrendChartRef" class="chart"></div>
        </el-card>
        <el-card class="chart-card">
          <div ref="registerTrendChartRef" class="chart"></div>
        </el-card>
        <el-card class="chart-card">
          <div ref="orderTrendChartRef" class="chart"></div>
        </el-card>
        <el-card class="chart-card">
          <div ref="orderAmountTrendChartRef" class="chart"></div>
        </el-card>
      </div>
    </template>
    
    <!-- echarts不可用时显示的替代内容 -->
    <el-card v-else class="error-card">
      <div class="error-message">
        <el-icon><warning /></el-icon>
        <h2>图表库加载失败</h2>
        <p>请按照以下步骤解决：</p>
        <ol>
          <li>在项目根目录执行: <code>npm install echarts@^5.4.2</code></li>
          <li>重新启动开发服务器: <code>npm run dev</code></li>
        </ol>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.data-analysis-container {
  padding: 20px;
}

.summary-card,
.filter-card,
.error-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.summary-item {
  text-align: center;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.item-value {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
  margin-bottom: 8px;
}

.item-label {
  font-size: 14px;
  color: #606266;
}

.date-filter {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.date-filter span {
  margin-right: 10px;
}

.chart-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.chart-card {
  overflow: hidden;
}

.chart {
  height: 400px;
  width: 100%;
}

.error-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.error-message h2 {
  margin: 15px 0;
  color: #f56c6c;
}

.error-message p {
  margin-bottom: 15px;
}

.error-message ol {
  text-align: left;
  margin: 0 auto;
  max-width: 500px;
}

.error-message code {
  background-color: #f5f7fa;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
}

@media (max-width: 1200px) {
  .summary-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .chart-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }
}
</style> 