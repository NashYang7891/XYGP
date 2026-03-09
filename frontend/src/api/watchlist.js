import api from './request'

export function getWatchlist() {
  return api.get('/watchlist')
}

export function addToWatchlist(stockId) {
  return api.post('/watchlist/add', { stock_id: stockId })
}

export function removeFromWatchlist(stockId) {
  return api.post('/watchlist/remove', { stock_id: stockId })
}

export function checkWatchlist(stockId) {
  return api.get(`/watchlist/check/${stockId}`)
}
