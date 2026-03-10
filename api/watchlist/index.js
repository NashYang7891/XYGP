import { sql } from '../lib/db.js'
import { verifyToken } from '../lib/auth.js'

export const config = { runtime: 'nodejs' }

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'GET') return res.status(405).json({ code: 405, msg: 'Method not allowed' })

  const auth = req.headers.authorization || ''
  const m = auth.match(/Bearer\s+(.+)/)
  if (!m) return res.status(401).json({ code: 401, msg: '未登录' })
  const payload = verifyToken(m[1].trim())
  if (!payload?.user_id) return res.status(401).json({ code: 401, msg: '登录已过期' })

  let wl = await sql`SELECT * FROM watchlists WHERE user_id = ${payload.user_id} LIMIT 1`
  if (!wl.length) {
    await sql`INSERT INTO watchlists (user_id, name) VALUES (${payload.user_id}, '默认自选')`
    wl = await sql`SELECT * FROM watchlists WHERE user_id = ${payload.user_id} LIMIT 1`
  }
  const items = await sql`
    SELECT s.id, s.symbol, s.name, wi.id as item_id
    FROM watchlist_items wi
    JOIN stocks s ON wi.stock_id = s.id
    WHERE wi.watchlist_id = ${wl[0].id}
    ORDER BY wi.sort_order, wi.id
  `
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.status(200).json({ code: 0, data: { watchlist: wl[0], items } })
}
