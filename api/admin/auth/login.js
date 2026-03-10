import { sql } from '../../../lib/db.js'
import { signToken } from '../../../lib/auth.js'
import bcrypt from 'bcryptjs'

export const config = { runtime: 'nodejs' }

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') return res.status(405).json({ code: 405, msg: 'Method not allowed' })

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {})
    const { username, password, security_code } = body
    if (!username || !password || !security_code) {
      return res.status(400).json({ code: 400, msg: '请填写完整信息' })
    }
    const rows = await sql`SELECT * FROM admin_users WHERE username = ${username} AND status = 1 LIMIT 1`
    const a = rows[0]
    if (!a || !bcrypt.compareSync(password, a.password_hash) || !bcrypt.compareSync(security_code, a.security_code_hash)) {
      return res.status(401).json({ code: 401, msg: '账号、密码或安全码错误' })
    }
    const token = signToken({ admin_id: a.id, username: a.username })
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.status(200).json({ code: 0, data: { token, admin: { id: a.id, username: a.username } } })
  } catch (e) {
    console.error(e)
    res.status(500).json({ code: 500, msg: e.message })
  }
}
