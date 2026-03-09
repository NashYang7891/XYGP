import { sql } from '../lib/db.js'
import { verifyToken } from '../lib/auth.js'

export const config = { runtime: 'nodejs' }

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'GET') return res.status(405).json({ code: 405, msg: 'Method not allowed' })

  const pathParts = (req.url || '').split('?')[0].split('/').filter(Boolean)
  const symbol = pathParts[pathParts.length - 1] || ''
  if (!symbol) return res.status(400).json({ code: 400, msg: '缺少股票代码' })

  let rows = await sql`SELECT * FROM stocks WHERE symbol = ${symbol} LIMIT 1`
  if (!rows.length) {
    await sql`INSERT INTO stocks (symbol, name) VALUES (${symbol}, ${symbol}) ON CONFLICT (symbol) DO NOTHING`
    rows = await sql`SELECT * FROM stocks WHERE symbol = ${symbol} LIMIT 1`
  }
  const stock = rows[0]
  let inWatchlist = false
  const auth = req.headers.authorization || ''
  const m = auth.match(/Bearer\s+(.+)/)
  if (m) {
    const payload = verifyToken(m[1].trim())
    if (payload?.user_id) {
      const wl = await sql`SELECT w.id FROM watchlists w WHERE w.user_id = ${payload.user_id} LIMIT 1`
      if (wl.length) {
        const chk = await sql`SELECT 1 FROM watchlist_items wi WHERE wi.watchlist_id = ${wl[0].id} AND wi.stock_id = ${stock.id} LIMIT 1`
        inWatchlist = chk.length > 0
      }
    }
  }
  const { created_at, ...rest } = stock
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.status(200).json({ code: 0, data: { ...rest, in_watchlist: inWatchlist } })
}
