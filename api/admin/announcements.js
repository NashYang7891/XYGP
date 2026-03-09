import { sql } from '../lib/db.js'
import { verifyToken } from '../lib/auth.js'

export const config = { runtime: 'nodejs' }

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(204).end()
  const auth = req.headers.authorization || ''
  const m = auth.match(/Bearer\s+(.+)/)
  if (!m) return res.status(401).json({ code: 401, msg: '未登录' })
  const payload = verifyToken(m[1].trim())
  if (!payload?.admin_id) return res.status(401).json({ code: 401, msg: '登录已过期' })

  if (req.method === 'GET') {
    const list = await sql`SELECT * FROM announcements ORDER BY sort_order DESC, id DESC`
    res.setHeader('Access-Control-Allow-Origin', '*')
    return res.status(200).json({ code: 0, data: list })
  }
  if (req.method === 'POST') {
    const { title, content } = req.body || {}
    if (!title?.trim()) return res.status(400).json({ code: 400, msg: '请填写标题' })
    const r = await sql`INSERT INTO announcements (title, content, is_active, sort_order) VALUES (${title.trim()}, ${content || ''}, 1, 0) RETURNING id`
    res.setHeader('Access-Control-Allow-Origin', '*')
    return res.status(200).json({ code: 0, data: { id: r[0].id }, msg: '添加成功' })
  }
  res.status(405).json({ code: 405, msg: 'Method not allowed' })
}
