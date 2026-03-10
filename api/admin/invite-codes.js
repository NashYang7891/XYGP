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

  const list = await sql`SELECT * FROM invite_codes ORDER BY id DESC`
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.status(200).json({ code: 0, data: list })
}
