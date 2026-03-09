import { sql } from '../lib/db.js'
import { signToken } from '../lib/auth.js'
import bcrypt from 'bcryptjs'

export const config = { runtime: 'nodejs' }

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') return res.status(405).json({ code: 405, msg: 'Method not allowed' })

  try {
    const { username, password, invite_code } = req.body || {}
    if (!username || !password || !invite_code) {
      return res.status(400).json({ code: 400, msg: '请填写完整信息' })
    }
    const ic = await sql`SELECT * FROM invite_codes WHERE code = ${invite_code} AND status = 1 LIMIT 1`
    if (!ic.length || (ic[0].total_count > 0 && ic[0].used_count >= ic[0].total_count)) {
      return res.status(400).json({ code: 400, msg: '邀请码无效或已用完' })
    }
    const login = username
    let email = username.includes('@') ? username : null
    let uname = username.includes('@') ? username.split('@')[0] : username
    const exist = await sql`SELECT id FROM users WHERE username = ${login} OR email = ${login} LIMIT 1`
    if (exist.length) return res.status(400).json({ code: 400, msg: '该账号已存在' })

    const hash = bcrypt.hashSync(password, 10)
    const r = await sql`INSERT INTO users (username, email, password_hash, invite_code) VALUES (${uname}, ${email}, ${hash}, ${invite_code}) RETURNING id, username, email`
    const u = r[0]
    await sql`UPDATE invite_codes SET used_count = used_count + 1 WHERE code = ${invite_code}`
    const token = signToken({ user_id: u.id, username: u.username })
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.status(200).json({ code: 0, data: { token, user: u } })
  } catch (e) {
    console.error(e)
    res.status(500).json({ code: 500, msg: e.message })
  }
}
