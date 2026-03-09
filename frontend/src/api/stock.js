import api from './request'

export function searchStocks(q) {
  return api.get('/stocks/search', { params: { q } })
}

export function getPopularStocks() {
  return api.get('/stocks/popular')
}

export function getStockDetail(symbol) {
  return api.get(`/stocks/${symbol}`)
}

export function getStockKline(symbol, period = '1mo') {
  return api.get(`/stocks/${symbol}/kline`, { params: { period } })
}
