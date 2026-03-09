import { sql } from '../../lib/db.js'
import { verifyToken } from '../../lib/auth.js'

export const config = { runtime: 'nodejs' }

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'GET') return res.status(405).json({ code: 405, msg: 'Method not allowed' })

  const pathParts = (req.url || '').split('?')[0].split('/').filter(Boolean)
  const stockId = parseInt(pathParts[pathParts.length - 1], 10)
  if (!stockId) return res.status(400).json({ code: 400, msg: '缺少股票ID' })

  const auth = req.headers.authorization || ''
  const m = auth.match(/Bearer\s+(.+)/)
  if (!m) return res.status(401).json({ code: 401, msg: '未登录' })
  const payload = verifyToken(m[1].trim())
  if (!payload?.user_id) return res.status(401).json({ code: 401, msg: '登录已过期' })

  const rows = await sql`
    SELECT 1 FROM watchlist_items wi
    JOIN watchlists w ON wi.watchlist_id = w.id
    WHERE w.user_id = ${payload.user_id} AND wi.stock_id = ${stockId} LIMIT 1
  `
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.status(200).json({ code: 0, data: { in_watchlist: rows.length > 0 } })
}
