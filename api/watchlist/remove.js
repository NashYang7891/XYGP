import { sql } from '../lib/db.js'
import { verifyToken } from '../lib/auth.js'

export const config = { runtime: 'nodejs' }

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') return res.status(405).json({ code: 405, msg: 'Method not allowed' })

  const auth = req.headers.authorization || ''
  const m = auth.match(/Bearer\s+(.+)/)
  if (!m) return res.status(401).json({ code: 401, msg: '未登录' })
  const payload = verifyToken(m[1].trim())
  if (!payload?.user_id) return res.status(401).json({ code: 401, msg: '登录已过期' })

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {})
  const stockId = parseInt(body.stock_id, 10)
  if (!stockId) return res.status(400).json({ code: 400, msg: '缺少股票ID' })

  await sql`
    DELETE FROM watchlist_items
    WHERE watchlist_id IN (SELECT id FROM watchlists WHERE user_id = ${payload.user_id})
    AND stock_id = ${stockId}
  `
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.status(200).json({ code: 0, msg: '移除成功' })
}
