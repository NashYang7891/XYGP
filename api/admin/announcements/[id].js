import { sql } from '../../lib/db.js'
import { verifyToken } from '../../lib/auth.js'

export const config = { runtime: 'nodejs' }

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(204).end()
  const auth = req.headers.authorization || ''
  const m = auth.match(/Bearer\s+(.+)/)
  if (!m) return res.status(401).json({ code: 401, msg: '未登录' })
  const payload = verifyToken(m[1].trim())
  if (!payload?.admin_id) return res.status(401).json({ code: 401, msg: '登录已过期' })

  const pathParts = (req.url || '').split('?')[0].split('/').filter(Boolean)
  const id = parseInt(pathParts[pathParts.length - 1], 10)
  if (!id) return res.status(400).json({ code: 400, msg: '无效ID' })

  if (req.method === 'PUT') {
    const { title, content, is_active } = req.body || {}
    const row = await sql`SELECT * FROM announcements WHERE id = ${id} LIMIT 1`
    if (!row.length) return res.status(404).json({ code: 404, msg: '公告不存在' })
    const newTitle = title !== undefined ? title : row[0].title
    const newContent = content !== undefined ? content : row[0].content
    const newActive = is_active !== undefined ? is_active : row[0].is_active
    await sql`UPDATE announcements SET title = ${newTitle}, content = ${newContent}, is_active = ${newActive} WHERE id = ${id}`
    res.setHeader('Access-Control-Allow-Origin', '*')
    return res.status(200).json({ code: 0, msg: '更新成功' })
  }
  if (req.method === 'DELETE') {
    await sql`DELETE FROM announcements WHERE id = ${id}`
    res.setHeader('Access-Control-Allow-Origin', '*')
    return res.status(200).json({ code: 0, msg: '删除成功' })
  }
  res.status(405).json({ code: 405, msg: 'Method not allowed' })
}
