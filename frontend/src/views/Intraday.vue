<template>

  <div class="page-intraday">

    <section class="hero">

      <h1>日内交易</h1>

      <p class="sub">日本市场盘中短线关注：下方可直接切换代码与 5/15/60 分钟 K 线（数据与个股页同源，来自后端 iTick）。</p>

    </section>



    <el-card class="chart-card" shadow="hover" v-loading="klineLoading">

      <template #header>

        <div class="chart-head">

          <span class="card-h">分钟 K 线</span>

          <div class="controls">

            <el-select v-model="symbol" placeholder="代码" style="width: 140px" @change="loadKline">

              <el-option v-for="o in symbolOptions" :key="o.symbol" :label="`${o.symbol} ${o.name}`" :value="o.symbol" />

            </el-select>

            <el-radio-group v-model="period" size="small" @change="loadKline">

              <el-radio-button label="5m">5分</el-radio-button>

              <el-radio-button label="15m">15分</el-radio-button>

              <el-radio-button label="60m">60分</el-radio-button>

            </el-radio-group>

            <el-button type="primary" plain size="small" @click="$router.push(`/stock/${symbol}`)">个股详情</el-button>

          </div>

        </div>

      </template>

      <KLineChart v-if="klineData.length" :data="klineData" :symbol="symbol" :minute="true" />

      <el-empty v-else-if="!klineLoading" description="暂无 K 线数据（请检查 ITICK_TOKEN 或稍后重试）" />

    </el-card>



    <el-row :gutter="16" class="cards">

      <el-col :xs="24" :sm="12" :md="8">

        <el-card shadow="hover" class="info-card">

          <template #header><span class="card-h">交易时段（JST）</span></template>

          <ul class="session-list">

            <li><strong>前場</strong> 09:00 – 11:30</li>

            <li><strong>後場</strong> 12:30 – 15:00</li>

            <li class="muted">午休 11:30 – 12:30 无连续竞价</li>

          </ul>

        </el-card>

      </el-col>

      <el-col :xs="24" :sm="12" :md="8">

        <el-card shadow="hover" class="info-card">

          <template #header><span class="card-h">说明</span></template>

          <p>分钟线展示最近若干根 K 线（条数由后端 limit 决定）；日 K 与更长周期请在个股详情切换。</p>

        </el-card>

      </el-col>

      <el-col :xs="24" :sm="12" :md="8">

        <el-card shadow="hover" class="info-card">

          <template #header><span class="card-h">风险提示</span></template>

          <p class="warn">日内波动大，请控制仓位，本系统不提供投资建议。</p>

        </el-card>

      </el-col>

    </el-row>



    <el-card class="table-card">

      <template #header>

        <div class="table-head">

          <span>快捷查看（点击进详情）</span>

          <el-button type="primary" plain size="small" @click="$router.push('/')">返回首页行情</el-button>

        </div>

      </template>

      <el-table :data="quickList" stripe @row-click="row => $router.push(`/stock/${row.symbol}`)">

        <el-table-column prop="symbol" label="代码" width="100" />

        <el-table-column prop="name" label="名称" />

        <el-table-column label="说明" width="160">

          <template #default="{ row }">

            <el-tag size="small" type="warning">{{ row.tag }}</el-tag>

          </template>

        </el-table-column>

      </el-table>

    </el-card>

  </div>

</template>



<script setup>

import { ref, onMounted } from 'vue'

import { ElMessage } from 'element-plus'

import { getStockKline } from '../api/stock'

import KLineChart from '../components/KLineChart.vue'



const quickList = [

  { symbol: '7203', name: 'トヨタ自動車', tag: '流动性高' },

  { symbol: '9984', name: 'ソフトバンクG', tag: '权重股' },

  { symbol: '6758', name: 'ソニーG', tag: '科技' },

]

const symbolOptions = quickList

const symbol = ref('7203')

const period = ref('5m')

const klineData = ref([])

const klineLoading = ref(false)



async function loadKline() {

  klineLoading.value = true

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

  } finally {

    klineLoading.value = false

  }

}



onMounted(() => loadKline())

</script>



<style scoped>

.page-intraday { max-width: 1100px; margin: 0 auto; }

.hero { margin-bottom: 20px; }

.hero h1 { font-size: 22px; color: var(--xy-text, #0f172a); margin-bottom: 8px; }

.sub { color: #64748b; font-size: 14px; line-height: 1.6; }

.chart-card { border-radius: 12px; margin-bottom: 20px; }

.chart-head { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; }

.controls { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; }

.card-h { font-weight: 600; color: #0f172a; }

.cards { margin-bottom: 20px; }

.info-card { border-radius: 12px; }

.session-list { margin: 0; padding-left: 18px; line-height: 1.8; }

.session-list .muted { color: #94a3b8; font-size: 13px; }

.warn { color: #b45309; margin: 0; }

.table-card { border-radius: 12px; }

.table-head { display: flex; justify-content: space-between; align-items: center; }

:deep(.el-table) { cursor: pointer; }

</style>

