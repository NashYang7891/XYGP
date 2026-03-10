<template>
  <div class="home">
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

const router = useRouter()
const userStore = useUserStore()
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
.announce-list { max-height: 400px; overflow: auto; }
.announce-item { padding: 8px 0; border-bottom: 1px solid #eee; }
.announce-item .title { font-weight: bold; margin-bottom: 4px; }
.announce-item .content { font-size: 12px; color: #666; }
.el-table { cursor: pointer; }
</style>
