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

  const rows = await sql`SELECT id, username, email FROM users WHERE id = ${payload.user_id} AND status = 1 LIMIT 1`
  if (!rows.length) return res.status(401).json({ code: 401, msg: '用户不存在' })
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.status(200).json({ code: 0, data: rows[0] })
}
