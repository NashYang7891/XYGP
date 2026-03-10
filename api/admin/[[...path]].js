import { sql } from '../../lib/db.js'
import { signToken, verifyToken } from '../../lib/auth.js'
import bcrypt from 'bcryptjs'

export const config = { runtime: 'nodejs' }

function parseBody(req) {
  return typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {})
}

async function getAdminAuth(req, res) {
  const auth = req.headers.authorization || ''
  const m = auth.match(/Bearer\s+(.+)/)
  if (!m) { res.status(401).json({ code: 401, msg: '未登录' }); return null }
  const payload = verifyToken(m[1].trim())
  if (!payload?.admin_id) { res.status(401).json({ code: 401, msg: '登录已过期' }); return null }
  return payload
}

function getPathParts(req) {
  const path = (req.url || '').split('?')[0]
  const match = path.match(/\/api\/admin(?:\/(.*))?$/)
  const rest = (match && match[1]) ? match[1].split('/').filter(Boolean) : []
  return rest
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(204).end()
  res.setHeader('Access-Control-Allow-Origin', '*')

  const parts = getPathParts(req)
  const p0 = parts[0]
  const p1 = parts[1]

  if (p0 === 'auth' && p1 === 'login') {
    if (req.method !== 'POST') return res.status(405).json({ code: 405, msg: 'Method not allowed' })
    const body = parseBody(req)
    const { username, password, security_code } = body
    if (!username || !password || !security_code) return res.status(400).json({ code: 400, msg: '请填写完整信息' })
    const rows = await sql`SELECT * FROM admin_users WHERE username = ${username} AND status = 1 LIMIT 1`
    const a = rows[0]
    if (!a || !bcrypt.compareSync(password, a.password_hash) || !bcrypt.compareSync(security_code, a.security_code_hash)) {
      return res.status(401).json({ code: 401, msg: '账号、密码或安全码错误' })
    }
    const token = signToken({ admin_id: a.id, username: a.username })
    return res.status(200).json({ code: 0, data: { token, admin: { id: a.id, username: a.username } } })
  }

  const admin = await getAdminAuth(req, res)
  if (!admin) return

  if (p0 === 'users') {
    if (req.method !== 'GET') return res.status(405).json({ code: 405, msg: 'Method not allowed' })
    const page = Math.max(1, parseInt(req.query?.page, 10) || 1)
    const size = Math.min(50, Math.max(10, parseInt(req.query?.size, 10) || 20))
    const offset = (page - 1) * size
    const count = await sql`SELECT COUNT(*)::int as c FROM users`
    const list = await sql`SELECT id, username, email, invite_code, status, created_at FROM users ORDER BY id DESC LIMIT ${size} OFFSET ${offset}`
    return res.status(200).json({ code: 0, data: { list, total: count[0]?.c || 0 } })
  }

  if (p0 === 'stocks') {
    if (req.method === 'GET') {
      const q = (req.query?.q || '').trim()
      const page = Math.max(1, parseInt(req.query?.page, 10) || 1)
      const size = Math.min(50, Math.max(10, parseInt(req.query?.size, 10) || 20))
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
      return res.status(200).json({ code: 0, data: { list, total } })
    }
    if (req.method === 'POST') {
      const body = parseBody(req)
      const { symbol, name } = body
      if (!symbol?.trim()) return res.status(400).json({ code: 400, msg: '缺少股票代码' })
      const exist = await sql`SELECT id FROM stocks WHERE symbol = ${symbol.trim()} LIMIT 1`
      if (exist.length) return res.status(400).json({ code: 400, msg: '股票已存在' })
      const r = await sql`INSERT INTO stocks (symbol, name) VALUES (${symbol.trim()}, ${(name || symbol).trim()}) RETURNING id`
      return res.status(200).json({ code: 0, data: { id: r[0].id }, msg: '添加成功' })
    }
    return res.status(405).json({ code: 405, msg: 'Method not allowed' })
  }

  if (p0 === 'announcements') {
    if (!p1) {
      if (req.method === 'GET') {
        const list = await sql`SELECT * FROM announcements ORDER BY sort_order DESC, id DESC`
        return res.status(200).json({ code: 0, data: list })
      }
      if (req.method === 'POST') {
        const body = parseBody(req)
        const { title, content } = body
        if (!title?.trim()) return res.status(400).json({ code: 400, msg: '请填写标题' })
        const r = await sql`INSERT INTO announcements (title, content, is_active, sort_order) VALUES (${title.trim()}, ${content || ''}, 1, 0) RETURNING id`
        return res.status(200).json({ code: 0, data: { id: r[0].id }, msg: '添加成功' })
      }
    } else {
      const id = parseInt(p1, 10)
      if (!id) return res.status(400).json({ code: 400, msg: '无效ID' })
      if (req.method === 'PUT') {
        const body = parseBody(req)
        const { title, content, is_active } = body
        const row = await sql`SELECT * FROM announcements WHERE id = ${id} LIMIT 1`
        if (!row.length) return res.status(404).json({ code: 404, msg: '公告不存在' })
        const newTitle = title !== undefined ? title : row[0].title
        const newContent = content !== undefined ? content : row[0].content
        const newActive = is_active !== undefined ? is_active : row[0].is_active
        await sql`UPDATE announcements SET title = ${newTitle}, content = ${newContent}, is_active = ${newActive} WHERE id = ${id}`
        return res.status(200).json({ code: 0, msg: '更新成功' })
      }
      if (req.method === 'DELETE') {
        await sql`DELETE FROM announcements WHERE id = ${id}`
        return res.status(200).json({ code: 0, msg: '删除成功' })
      }
    }
    return res.status(405).json({ code: 405, msg: 'Method not allowed' })
  }

  if (p0 === 'invite-codes' || p0 === 'invite_codes') {
    if (req.method !== 'GET') return res.status(405).json({ code: 405, msg: 'Method not allowed' })
    const list = await sql`SELECT * FROM invite_codes ORDER BY id DESC`
    return res.status(200).json({ code: 0, data: list })
  }

  return res.status(404).json({ code: 404, msg: 'Not found' })
}
