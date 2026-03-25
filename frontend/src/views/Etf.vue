<template>
  <div class="page-etf">
    <section class="hero">
      <h1>ETF 专区</h1>
      <p class="sub">日本市场主流 ETF 一览（示例数据，可后续对接行情与筛选）</p>
    </section>

    <el-card class="filter-card">
      <el-input v-model="kw" placeholder="按代码或名称筛选" clearable style="max-width: 320px" />
    </el-card>

    <el-card class="table-card">
      <el-table :data="filtered" stripe @row-click="row => $router.push(`/stock/${row.symbol}`)">
        <el-table-column prop="symbol" label="代码" width="100" />
        <el-table-column prop="name" label="名称" />
        <el-table-column prop="underlying" label="跟踪标的" width="180" />
        <el-table-column prop="type" label="类型" width="120">
          <template #default="{ row }">
            <el-tag size="small" type="success">{{ row.type }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
      <p class="foot-note">提示：若个股未在库中打开详情，系统将自动尝试建档；ETF 走势仍以 K 线展示。</p>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const kw = ref('')

const etfList = [
  { symbol: '1321', name: 'NEXT FUNDS 日経225', underlying: '日経225', type: '指数ETF' },
  { symbol: '1306', name: 'NEXT TOPIX', underlying: 'TOPIX', type: '指数ETF' },
  { symbol: '1348', name: 'MAXIS トピックス', underlying: 'TOPIX', type: '指数ETF' },
  { symbol: '2558', name: 'S&P500 ETF', underlying: 'S&P500', type: '海外指数' },
  { symbol: '2630', name: '野村 TOPIX ETF', underlying: 'TOPIX', type: '指数ETF' },
  { symbol: '1591', name: 'NEXT 日経平均レバレッジ', underlying: '日経225 2x', type: '杠杆' },
]

const filtered = computed(() => {
  const q = kw.value.trim().toLowerCase()
  if (!q) return etfList
  return etfList.filter(
    (r) => r.symbol.includes(q) || r.name.toLowerCase().includes(q) || r.underlying.toLowerCase().includes(q)
  )
})
</script>

<style scoped>
.page-etf { max-width: 1100px; margin: 0 auto; }
.hero { margin-bottom: 16px; }
.hero h1 { font-size: 22px; color: var(--xy-text, #0f172a); margin-bottom: 8px; }
.sub { color: #64748b; font-size: 14px; }
.filter-card { margin-bottom: 16px; border-radius: 12px; }
.table-card { border-radius: 12px; }
.foot-note { margin-top: 12px; font-size: 12px; color: #94a3b8; }
:deep(.el-table) { cursor: pointer; }
</style>
