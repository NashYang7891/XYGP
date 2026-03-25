<template>
  <div class="stock-detail" v-loading="loading">
    <el-card v-if="stock">
      <template #header>
        <div class="header-row">
          <span class="title">{{ stock.name }} ({{ stock.symbol }})</span>
          <el-button v-if="userStore.isLoggedIn" :type="stock.in_watchlist ? 'warning' : 'primary'" @click="toggleWatch">
            {{ stock.in_watchlist ? '取消自选' : '加自选' }}
          </el-button>
        </div>
      </template>
      <div class="period-tabs">
        <el-radio-group v-model="period" size="small" @change="loadKline">
          <el-radio-button label="5m">5分</el-radio-button>
          <el-radio-button label="15m">15分</el-radio-button>
          <el-radio-button label="60m">60分</el-radio-button>
          <el-radio-button label="5d">5日</el-radio-button>
          <el-radio-button label="1mo">1月</el-radio-button>
          <el-radio-button label="3mo">3月</el-radio-button>
          <el-radio-button label="6mo">6月</el-radio-button>
          <el-radio-button label="1y">1年</el-radio-button>
        </el-radio-group>
      </div>
      <KLineChart :data="klineData" :symbol="stock.symbol" :minute="isMinutePeriod" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '../store/user'
import { getStockDetail, getStockKline } from '../api/stock'
import { addToWatchlist, removeFromWatchlist } from '../api/watchlist'
import KLineChart from '../components/KLineChart.vue'
import { ElMessage } from 'element-plus'

const route = useRoute()
const userStore = useUserStore()
const symbol = computed(() => route.params.symbol)
const stock = ref(null)
const klineData = ref([])
const period = ref('1mo')
const loading = ref(true)
const isMinutePeriod = computed(() => ['5m', '15m', '60m'].includes(period.value))

async function loadDetail() {
  try {
    const res = await getStockDetail(symbol.value)
    stock.value = res.data
  } catch (e) {
    ElMessage.error('加载失败')
  }
}

async function loadKline() {
  try {
    const res = await getStockKline(symbol.value, period.value)
    klineData.value = res.data || []
  } catch (e) {
    klineData.value = []
    const msg = e?.msg || e?.message || '行情加载失败'
    if (msg.includes('ITICK') || msg.includes('未配置')) {
      ElMessage.warning('行情服务未配置，请在 Vercel 环境变量中设置 ITICK_TOKEN')
    } else {
      ElMessage.warning(msg)
    }
  }
}

async function toggleWatch() {
  if (!userStore.isLoggedIn) return
  try {
    if (stock.value.in_watchlist) {
      await removeFromWatchlist(stock.value.id)
      stock.value.in_watchlist = false
      ElMessage.success('已移除自选')
    } else {
      await addToWatchlist(stock.value.id)
      stock.value.in_watchlist = true
      ElMessage.success('已添加自选')
    }
  } catch (e) {
    ElMessage.error(e.msg || '操作失败')
  }
}

async function reloadAll() {
  loading.value = true
  try {
    await loadDetail()
    await loadKline()
  } finally {
    loading.value = false
  }
}

onMounted(() => reloadAll())

watch(symbol, (v) => {
  if (v) reloadAll()
})
</script>

<style scoped>
.stock-detail { max-width: 1100px; margin: 0 auto; }
.header-row { display: flex; justify-content: space-between; align-items: center; }
.title { font-size: 18px; font-weight: bold; }
.period-tabs { margin-bottom: 16px; }
.period-tabs :deep(.el-radio-group) { display: flex; flex-wrap: wrap; gap: 4px; }
</style>
