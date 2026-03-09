import { sql } from '../lib/db.js'
import { signToken, verifyToken } from '../lib/auth.js'
import bcrypt from 'bcryptjs'

export const config = { runtime: 'nodejs' }

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
}

function requireAdmin(req) {
  const auth = req.headers.authorization || ''
  const m = auth.match(/Bearer\s+(.+)/)
  if (!m) return null
  const payload = verifyToken(m[1].trim())
  return payload?.admin_id ? payload : null
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(204).end()
  const path = Array.isArray(req.query.path) ? req.query.path : (req.query.path ? [req.query.path] : [])
  const seg0 = path[0]
  const seg1 = path[1]
  const body = req.body || {}
  const query = req.query || {}

  try {
    if (seg0 === 'auth' && seg1 === 'login' && req.method === 'POST') {
      const { username, password, security_code } = body
      if (!username || !password || !security_code) return res.status(400).json({ code: 400, msg: '请填写完整信息' })
      const rows = await sql`SELECT * FROM admin_users WHERE username = ${username} AND status = 1 LIMIT 1`
      const a = rows[0]
      if (!a || !bcrypt.compareSync(password, a.password_hash) || !bcrypt.compareSync(security_code, a.security_code_hash)) {
        return res.status(401).json({ code: 401, msg: '账号、密码或安全码错误' })
      }
      const token = signToken({ admin_id: a.id, username: a.username })
      cors(res)
      return res.status(200).json({ code: 0, data: { token, admin: { id: a.id, username: a.username } } })
    }

    const admin = requireAdmin(req)
    if (!admin) return res.status(401).json({ code: 401, msg: '未登录' })

    if (seg0 === 'users' && req.method === 'GET') {
      const page = Math.max(1, parseInt(query.page, 10) || 1)
      const size = Math.min(50, Math.max(10, parseInt(query.size, 10) || 20))
      const offset = (page - 1) * size
      const count = await sql`SELECT COUNT(*)::int as c FROM users`
      const list = await sql`SELECT id, username, email, invite_code, status, created_at FROM users ORDER BY id DESC LIMIT ${size} OFFSET ${offset}`
      cors(res)
      return res.status(200).json({ code: 0, data: { list, total: count[0]?.c || 0 } })
    }

    if (seg0 === 'stocks') {
      if (req.method === 'GET') {
        const q = (query.q || '').trim()
        const page = Math.max(1, parseInt(query.page, 10) || 1)
        const size = Math.min(50, Math.max(10, parseInt(query.size, 10) || 20))
        const offset = (page - 1) * size
        let list, total
        if (q) {
          const kw = `%${q}%`
          list = await sql`SELECT * FROM stocks WHERE symbol ILIKE ${kw} OR name ILIKE ${kw} ORDER BY id LIMIT ${size} OFFSET ${offset}`
          const c = await sql`SELECT COUNT(*)::int as c FROM stocks WHERE symbol ILIKE ${kw} OR name ILIKE ${kw}`
          total = c[0]?.c || 0
        } else {
          list = await sql`SELECT * FROM stocks ORDER BY id LIMIT ${size} OFFSET ${offset}`
          const c = await sql`SELECT COUNT(*)::int as c FROM stocks`
          total = c[0]?.c || 0
        }
        cors(res)
        return res.status(200).json({ code: 0, data: { list, total } })
      }
      if (req.method === 'POST') {
        const { symbol, name } = body
        if (!symbol?.trim()) return res.status(400).json({ code: 400, msg: '缺少股票代码' })
        const exist = await sql`SELECT id FROM stocks WHERE symbol = ${symbol.trim()} LIMIT 1`
        if (exist.length) return res.status(400).json({ code: 400, msg: '股票已存在' })
        const r = await sql`INSERT INTO stocks (symbol, name) VALUES (${symbol.trim()}, ${(name || symbol).trim()}) RETURNING id`
        cors(res)
        return res.status(200).json({ code: 0, data: { id: r[0].id }, msg: '添加成功' })
      }
    }

    if (seg0 === 'announcements') {
      if (!seg1 && req.method === 'GET') {
        const list = await sql`SELECT * FROM announcements ORDER BY sort_order DESC, id DESC`
        cors(res)
        return res.status(200).json({ code: 0, data: list })
      }
      if (!seg1 && req.method === 'POST') {
        const { title, content } = body
        if (!title?.trim()) return res.status(400).json({ code: 400, msg: '请填写标题' })
        const r = await sql`INSERT INTO announcements (title, content, is_active, sort_order) VALUES (${title.trim()}, ${content || ''}, 1, 0) RETURNING id`
        cors(res)
        return res.status(200).json({ code: 0, data: { id: r[0].id }, msg: '添加成功' })
      }
      const id = parseInt(seg1, 10)
      if (id && req.method === 'PUT') {
        const { title, content, is_active } = body
        const row = await sql`SELECT * FROM announcements WHERE id = ${id} LIMIT 1`
        if (!row.length) return res.status(404).json({ code: 404, msg: '公告不存在' })
        const newTitle = title !== undefined ? title : row[0].title
        const newContent = content !== undefined ? content : row[0].content
        const newActive = is_active !== undefined ? is_active : row[0].is_active
        await sql`UPDATE announcements SET title = ${newTitle}, content = ${newContent}, is_active = ${newActive} WHERE id = ${id}`
        cors(res)
        return res.status(200).json({ code: 0, msg: '更新成功' })
      }
      if (id && req.method === 'DELETE') {
        await sql`DELETE FROM announcements WHERE id = ${id}`
        cors(res)
        return res.status(200).json({ code: 0, msg: '删除成功' })
      }
    }

    if (seg0 === 'invite-codes' && req.method === 'GET') {
      const list = await sql`SELECT * FROM invite_codes ORDER BY id DESC`
      cors(res)
      return res.status(200).json({ code: 0, data: list })
    }

    return res.status(404).json({ code: 404, msg: 'Not Found' })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ code: 500, msg: e.message })
  }
}
