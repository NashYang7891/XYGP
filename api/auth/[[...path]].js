import { sql } from '../lib/db.js'
import { signToken, verifyToken } from '../lib/auth.js'
import bcrypt from 'bcryptjs'

export const config = { runtime: 'nodejs' }

function parseBody(req) {
  return typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {})
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(204).end()
  res.setHeader('Access-Control-Allow-Origin', '*')

  const seg = (req.query?.path || [])
  const action = Array.isArray(seg) ? seg[0] : seg

  if (action === 'login') {
    if (req.method !== 'POST') return res.status(405).json({ code: 405, msg: 'Method not allowed' })
    try {
      const body = parseBody(req)
      const { username, password } = body
      if (!username || !password) return res.status(400).json({ code: 400, msg: '请输入账号和密码' })
      const rows = await sql`SELECT * FROM users WHERE (username = ${username} OR email = ${username}) AND status = 1 LIMIT 1`
      const u = rows[0]
      if (!u || !bcrypt.compareSync(password, u.password_hash)) return res.status(401).json({ code: 401, msg: '账号或密码错误' })
      const token = signToken({ user_id: u.id, username: u.username })
      return res.status(200).json({ code: 0, data: { token, user: { id: u.id, username: u.username, email: u.email } } })
    } catch (e) { console.error(e); return res.status(500).json({ code: 500, msg: e.message }) }
  }

  if (action === 'register') {
    if (req.method !== 'POST') return res.status(405).json({ code: 405, msg: 'Method not allowed' })
    try {
      const body = parseBody(req)
      const { username, password, invite_code } = body
      if (!username || !password || !invite_code) return res.status(400).json({ code: 400, msg: '请填写完整信息' })
      const ic = await sql`SELECT * FROM invite_codes WHERE code = ${invite_code} AND status = 1 LIMIT 1`
      if (!ic.length || (ic[0].total_count > 0 && ic[0].used_count >= ic[0].total_count)) return res.status(400).json({ code: 400, msg: '邀请码无效或已用完' })
      const email = username.includes('@') ? username : null
      const uname = username.includes('@') ? username.split('@')[0] : username
      const exist = await sql`SELECT id FROM users WHERE username = ${username} OR email = ${username} LIMIT 1`
      if (exist.length) return res.status(400).json({ code: 400, msg: '该账号已存在' })
      const hash = bcrypt.hashSync(password, 10)
      const r = await sql`INSERT INTO users (username, email, password_hash, invite_code) VALUES (${uname}, ${email}, ${hash}, ${invite_code}) RETURNING id, username, email`
      const u = r[0]
      await sql`UPDATE invite_codes SET used_count = used_count + 1 WHERE code = ${invite_code}`
      const token = signToken({ user_id: u.id, username: u.username })
      return res.status(200).json({ code: 0, data: { token, user: u } })
    } catch (e) { console.error(e); return res.status(500).json({ code: 500, msg: e.message }) }
  }

  if (action === 'me' || !action) {
    if (req.method !== 'GET') return res.status(405).json({ code: 405, msg: 'Method not allowed' })
    const auth = req.headers.authorization || ''
    const m = auth.match(/Bearer\s+(.+)/)
    if (!m) return res.status(401).json({ code: 401, msg: '未登录' })
    const payload = verifyToken(m[1].trim())
    if (!payload?.user_id) return res.status(401).json({ code: 401, msg: '登录已过期' })
    const rows = await sql`SELECT id, username, email FROM users WHERE id = ${payload.user_id} AND status = 1 LIMIT 1`
    if (!rows.length) return res.status(401).json({ code: 401, msg: '用户不存在' })
    return res.status(200).json({ code: 0, data: rows[0] })
  }

  return res.status(404).json({ code: 404, msg: 'Not found' })
}
