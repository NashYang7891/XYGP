<template>
  <div class="home">
    <!-- 功能模块网格 -->
    <div class="module-grid">
      <div v-for="m in featureModules" :key="m.key" class="module-item" @click="onModuleClick(m)">
        <el-icon :size="28" class="module-icon"><component :is="m.icon" /></el-icon>
        <span class="module-label">{{ m.label }}</span>
      </div>
    </div>

    <!-- 指数列表 -->
    <div class="index-section">
      <h3 class="section-title">指数列表</h3>
      <div class="index-scroll">
        <div v-for="idx in indexList" :key="idx.code" class="index-card" @click="onIndexClick(idx)">
          <div class="index-name">{{ idx.name }}</div>
          <div class="index-code">{{ idx.code }}</div>
        </div>
      </div>
    </div>

    <!-- 热门股票 & 公告 -->
    <el-row :gutter="20">
      <el-col :span="16">
        <el-card>
          <template #header>
            <span>日本热门股票</span>
            <el-input v-model="searchKey" placeholder="搜索日股代码 如7203" style="width:200px;float:right" clearable @input="onSearch" />
          </template>
          <el-table :data="displayList" stripe @row-click="goDetail">
            <el-table-column prop="symbol" label="代码" width="100" />
            <el-table-column prop="name" label="名称" />
            <el-table-column label="操作" width="100">
              <template #default="{ row }">
                <el-button v-if="userStore.isLoggedIn" type="primary" size="small" @click.stop="toggleWatch(row)">
                  {{ inWatch(row.id) ? '取消自选' : '加自选' }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <template #header><span>系统公告</span></template>
          <el-empty v-if="!announcements.length" description="暂无公告" />
          <div v-else class="announce-list">
            <div v-for="a in announcements" :key="a.id" class="announce-item">
              <div class="title">{{ a.title }}</div>
              <div class="content">{{ a.content }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../store/user'
import { getPopularStocks, searchStocks } from '../api/stock'
import { getAnnouncements } from '../api/announcement'
import { getWatchlist, addToWatchlist, removeFromWatchlist } from '../api/watchlist'
import { ElMessage } from 'element-plus'
import {
  DataLine, Clock, User, Wallet, ScaleToOriginal, Money, Plus, TrendCharts,
} from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

// 8 个功能模块
const featureModules = [
  { key: 'block', label: '大宗交易', icon: DataLine },
  { key: 'intraday', label: '日内交易', icon: Clock },
  { key: 'internal', label: '内部交易', icon: User },
  { key: 'lending', label: '借贷服务', icon: Wallet },
  { key: 'stock-lend', label: '股票出借', icon: ScaleToOriginal },
  { key: 'leverage', label: '杠杆交易', icon: Money },
  { key: 'ipo', label: '新股交易', icon: Plus },
  { key: 'limit', label: '每日涨停', icon: TrendCharts },
]

// 指数列表
const indexList = [
  { name: 'Nikkei 300', code: 'N300' },
  { name: 'TOPIX', code: 'TOPY' },
  { name: 'JPX-Nikkei 400', code: 'IPYNK400' },
  { name: 'Nikkei Volatility Index', code: 'INIW' },
]

function onModuleClick(m) {
  ElMessage.info(`${m.label} 功能开发中`)
}

function onIndexClick(idx) {
  ElMessage.info(`${idx.name} 指数详情开发中`)
}
const stocks = ref([])
const searchResult = ref([])
const searchKey = ref('')
const announcements = ref([])
const watchlistIds = ref(new Set())

const displayList = computed(() => {
  if (searchKey.value.trim()) return searchResult.value
  return stocks.value
})

function inWatch(id) {
  return watchlistIds.value.has(id)
}

function goDetail(row) {
  router.push(`/stock/${row.symbol}`)
}

async function toggleWatch(row) {
  if (!userStore.isLoggedIn) return
  try {
    if (inWatch(row.id)) {
      await removeFromWatchlist(row.id)
      watchlistIds.value.delete(row.id)
      watchlistIds.value = new Set(watchlistIds.value)
      ElMessage.success('已移除自选')
    } else {
      await addToWatchlist(row.id)
      watchlistIds.value.add(row.id)
      watchlistIds.value = new Set(watchlistIds.value)
      ElMessage.success('已添加自选')
    }
  } catch (e) {
    ElMessage.error(e.msg || '操作失败')
  }
}

let searchTimer = null
function onSearch() {
  clearTimeout(searchTimer)
  if (!searchKey.value.trim()) {
    searchResult.value = []
    return
  }
  searchTimer = setTimeout(async () => {
    try {
      const res = await searchStocks(searchKey.value)
      searchResult.value = res.data || []
    } catch {
      searchResult.value = []
    }
  }, 300)
}

async function loadWatchlist() {
  if (!userStore.isLoggedIn) return
  try {
    const res = await getWatchlist()
    const items = res.data?.items || []
    watchlistIds.value = new Set(items.map(i => i.id))
  } catch {}
}

onMounted(async () => {
  try {
    const [sRes, aRes] = await Promise.all([
      getPopularStocks().catch(e => { console.error('popular', e); return { data: [] } }),
      getAnnouncements().catch(e => { console.error('announcements', e); return { data: [] } }),
    ])
    stocks.value = sRes?.data || []
    announcements.value = aRes?.data || []
  } catch (e) {
    console.error('load', e)
    ElMessage.error(e?.msg || '加载失败')
  }
  try {
    await loadWatchlist()
  } catch {}
})
</script>

<style scoped>
.home { max-width: 1200px; margin: 0 auto; }

/* 功能模块网格 */
.module-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}
.module-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px 16px;
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}
.module-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
.module-icon { color: #2e7d32; margin-bottom: 8px; }
.module-label { font-size: 14px; font-weight: 500; color: #1b5e20; }

/* 指数列表 */
.index-section { margin-bottom: 24px; }
.section-title { font-size: 16px; margin-bottom: 12px; color: #333; }
.index-scroll {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 8px;
  scrollbar-width: thin;
}
.index-scroll::-webkit-scrollbar { height: 6px; }
.index-scroll::-webkit-scrollbar-thumb { background: #ddd; border-radius: 3px; }
.index-card {
  flex-shrink: 0;
  width: 140px;
  padding: 16px;
  background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%);
  border-radius: 10px;
  color: #fff;
  cursor: pointer;
  transition: transform 0.2s;
}
.index-card:hover { transform: scale(1.02); }
.index-name { font-size: 14px; font-weight: 600; margin-bottom: 4px; }
.index-code { font-size: 12px; opacity: 0.9; }

.announce-list { max-height: 400px; overflow: auto; }
.announce-item { padding: 8px 0; border-bottom: 1px solid #eee; }
.announce-item .title { font-weight: bold; margin-bottom: 4px; }
.announce-item .content { font-size: 12px; color: #666; }
.el-table { cursor: pointer; }
</style>
