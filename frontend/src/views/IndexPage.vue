<template>
  <div class="index-page" v-if="info">
    <el-page-header @back="$router.push('/')" title="返回">
      <template #content>
        <span class="page-title">{{ info.name }}（{{ info.code }}）</span>
      </template>
    </el-page-header>
    <p class="summary">{{ info.summary }}</p>
    <p v-if="info.note" class="note">{{ info.note }}</p>
    <el-card v-if="info.relatedEtfs?.length" class="etf-card" shadow="never">
      <template #header><span>相关 ETF（示例）</span></template>
      <p class="hint">以下为常见跟踪或近似标的，代码与名称请以交易所披露为准；点击可尝试查看行情。</p>
      <el-table :data="info.relatedEtfs" stripe @row-click="row => $router.push(`/stock/${row.symbol}`)">
        <el-table-column prop="symbol" label="代码" width="100" />
        <el-table-column prop="name" label="名称" />
      </el-table>
    </el-card>
    <el-card v-else class="etf-card" shadow="never">
      <template #header><span>相关 ETF</span></template>
      <el-empty description="暂无预设关联 ETF，可从 ETF 页浏览" />
      <el-button type="primary" plain @click="$router.push('/etf')">打开 ETF 页</el-button>
    </el-card>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { getIndex } from '../data/indices'

const route = useRoute()
const info = computed(() => getIndex(route.params.code))
</script>

<style scoped>
.index-page { max-width: 900px; margin: 0 auto; }
.page-title { font-size: 18px; font-weight: 600; color: var(--xy-text, #0f172a); }
.summary { color: #334155; line-height: 1.7; margin: 16px 0 8px; }
.note { color: #94a3b8; font-size: 13px; margin: 0 0 16px; }
.etf-card { margin-top: 16px; border-radius: 12px; }
.hint { font-size: 13px; color: #64748b; margin: 0 0 12px; }
:deep(.el-table) { cursor: pointer; }
</style>
