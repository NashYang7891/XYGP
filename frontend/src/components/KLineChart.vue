<template>
  <div ref="chartRef" class="kline-chart"></div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  data: { type: Array, default: () => [] },
  symbol: { type: String, default: '' },
})

const chartRef = ref()
let chart = null

function render() {
  if (!chartRef.value || !props.data.length) return
  if (!chart) chart = echarts.init(chartRef.value)

  const dates = props.data.map(d => d.date || d.trade_date)
  const ohlc = props.data.map(d => [
    d.open ?? d.open_price,
    d.close ?? d.close_price,
    d.low ?? d.low_price,
    d.high ?? d.high_price,
  ])
  const volumes = props.data.map(d => d.volume ?? 0)

  const option = {
    title: { text: props.symbol ? `${props.symbol} K线图` : 'K线图', left: 'center' },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
    },
    legend: { data: ['K线', '成交量'], top: 30 },
    grid: [
      { left: '10%', right: '8%', top: 60, height: '50%' },
      { left: '10%', right: '8%', top: '75%', height: '15%' },
    ],
    xAxis: [
      { type: 'category', data: dates, gridIndex: 0, axisLabel: { rotate: 45 } },
      { type: 'category', data: dates, gridIndex: 1, axisLabel: { show: false } },
    ],
    yAxis: [
      { type: 'value', gridIndex: 0, splitLine: { show: false }, scale: true },
      { type: 'value', gridIndex: 1, splitLine: { show: false } },
    ],
    dataZoom: [
      { type: 'inside', xAxisIndex: [0, 1], start: 70, end: 100 },
      { type: 'slider', xAxisIndex: [0, 1], start: 70, end: 100 },
    ],
    series: [
      {
        name: 'K线',
        type: 'candlestick',
        data: ohlc,
        xAxisIndex: 0,
        yAxisIndex: 0,
        itemStyle: {
          color: '#ef5350',
          color0: '#26a69a',
          borderColor: '#ef5350',
          borderColor0: '#26a69a',
        },
      },
      {
        name: '成交量',
        type: 'bar',
        data: volumes,
        xAxisIndex: 1,
        yAxisIndex: 1,
        itemStyle: {
          color: (params) => {
            const d = props.data[params.dataIndex]
            const close = d.close ?? d.close_price
            const open = d.open ?? d.open_price
            return close >= open ? '#ef5350' : '#26a69a'
          },
        },
      },
    ],
  }
  chart.setOption(option, true)
}

onMounted(() => {
  render()
})

watch(() => [props.data, props.symbol], () => render(), { deep: true })
</script>

<style scoped>
.kline-chart { width: 100%; height: 450px; }
</style>
