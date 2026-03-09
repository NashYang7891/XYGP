<template>
  <div class="watchlist">
    <el-card>
      <template #header><span>我的自选股</span></template>
      <el-empty v-if="!items.length" description="暂无自选股，去首页添加吧" />
      <el-table v-else :data="items" stripe>
        <el-table-column prop="symbol" label="代码" width="100" />
        <el-table-column prop="name" label="名称" />
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="$router.push(`/stock/${row.symbol}`)">查看</el-button>
            <el-button type="danger" size="small" @click="remove(row)">移除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getWatchlist } from '../api/watchlist'
import { removeFromWatchlist } from '../api/watchlist'
import { ElMessage } from 'element-plus'

const items = ref([])

async function load() {
  try {
    const res = await getWatchlist()
    items.value = res.data?.items || []
  } catch (e) {
    ElMessage.error('加载失败')
  }
}

async function remove(row) {
  try {
    await removeFromWatchlist(row.id)
    items.value = items.value.filter(i => i.id !== row.id)
    ElMessage.success('已移除')
  } catch (e) {
    ElMessage.error(e.msg || '操作失败')
  }
}

onMounted(load)
</script>

<style scoped>
.watchlist { max-width: 800px; margin: 0 auto; }
</style>
