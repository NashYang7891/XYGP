import { sql } from '../lib/db.js'
import { verifyToken } from '../lib/auth.js'

export const config = { runtime: 'nodejs' }

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(204).end()
  const path = Array.isArray(req.query.path) ? req.query.path : (req.query.path ? [req.query.path] : [])
  const seg0 = path[0]
  const seg1 = path[1]
  const body = req.body || {}

  const auth = req.headers.authorization || ''
  const m = auth.match(/Bearer\s+(.+)/)
  if (!m) return res.status(401).json({ code: 401, msg: '未登录' })
  const payload = verifyToken(m[1].trim())
  if (!payload?.user_id) return res.status(401).json({ code: 401, msg: '登录已过期' })

  try {
    if ((path.length === 0 || !seg0) && req.method === 'GET') {
      let wl = await sql`SELECT * FROM watchlists WHERE user_id = ${payload.user_id} LIMIT 1`
      if (!wl.length) {
        await sql`INSERT INTO watchlists (user_id, name) VALUES (${payload.user_id}, '默认自选')`
        wl = await sql`SELECT * FROM watchlists WHERE user_id = ${payload.user_id} LIMIT 1`
      }
      const items = await sql`
        SELECT s.id, s.symbol, s.name, wi.id as item_id
        FROM watchlist_items wi JOIN stocks s ON wi.stock_id = s.id
        WHERE wi.watchlist_id = ${wl[0].id} ORDER BY wi.sort_order, wi.id
      `
      cors(res)
      return res.status(200).json({ code: 0, data: { watchlist: wl[0], items } })
    }

    if (seg0 === 'add' && req.method === 'POST') {
      const stockId = parseInt(body.stock_id, 10)
      if (!stockId) return res.status(400).json({ code: 400, msg: '缺少股票ID' })
      let wl = await sql`SELECT id FROM watchlists WHERE user_id = ${payload.user_id} LIMIT 1`
      if (!wl.length) {
        await sql`INSERT INTO watchlists (user_id, name) VALUES (${payload.user_id}, '默认自选')`
        wl = await sql`SELECT id FROM watchlists WHERE user_id = ${payload.user_id} LIMIT 1`
      }
      await sql`INSERT INTO watchlist_items (watchlist_id, stock_id) VALUES (${wl[0].id}, ${stockId}) ON CONFLICT (watchlist_id, stock_id) DO NOTHING`
      cors(res)
      return res.status(200).json({ code: 0, msg: '添加成功' })
    }

    if (seg0 === 'remove' && req.method === 'POST') {
      const stockId = parseInt(body.stock_id, 10)
      if (!stockId) return res.status(400).json({ code: 400, msg: '缺少股票ID' })
      await sql`DELETE FROM watchlist_items WHERE watchlist_id IN (SELECT id FROM watchlists WHERE user_id = ${payload.user_id}) AND stock_id = ${stockId}`
      cors(res)
      return res.status(200).json({ code: 0, msg: '移除成功' })
    }

    if (seg0 === 'check' && seg1 && req.method === 'GET') {
      const stockId = parseInt(seg1, 10)
      if (!stockId) return res.status(400).json({ code: 400, msg: '缺少股票ID' })
      const rows = await sql`SELECT 1 FROM watchlist_items wi JOIN watchlists w ON wi.watchlist_id = w.id WHERE w.user_id = ${payload.user_id} AND wi.stock_id = ${stockId} LIMIT 1`
      cors(res)
      return res.status(200).json({ code: 0, data: { in_watchlist: rows.length > 0 } })
    }

    return res.status(404).json({ code: 404, msg: 'Not Found' })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ code: 500, msg: e.message })
  }
}
