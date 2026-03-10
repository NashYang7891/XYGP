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
  if (!payload?.admin_id) return res.status(401).json({ code: 401, msg: '登录已过期' })

  const page = Math.max(1, parseInt(req.query?.page, 10) || 1)
  const size = Math.min(50, Math.max(10, parseInt(req.query?.size, 10) || 20))
  const offset = (page - 1) * size

  const count = await sql`SELECT COUNT(*)::int as c FROM users`
  const list = await sql`SELECT id, username, email, invite_code, status, created_at FROM users ORDER BY id DESC LIMIT ${size} OFFSET ${offset}`
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.status(200).json({ code: 0, data: { list, total: count[0]?.c || 0 } })
}
