import { sql } from '../lib/db.js'
import { signToken } from '../lib/auth.js'
import bcrypt from 'bcryptjs'

export const config = { runtime: 'nodejs' }

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') return res.status(405).json({ code: 405, msg: 'Method not allowed' })

  try {
    const { username, password } = req.body || {}
    if (!username || !password) {
      return res.status(400).json({ code: 400, msg: '请输入账号和密码' })
    }
    const rows = await sql`SELECT * FROM users WHERE (username = ${username} OR email = ${username}) AND status = 1 LIMIT 1`
    const u = rows[0]
    if (!u || !bcrypt.compareSync(password, u.password_hash)) {
      return res.status(401).json({ code: 401, msg: '账号或密码错误' })
    }
    const token = signToken({ user_id: u.id, username: u.username })
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.status(200).json({
      code: 0,
      data: {
        token,
        user: { id: u.id, username: u.username, email: u.email },
      },
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ code: 500, msg: e.message })
  }
}
