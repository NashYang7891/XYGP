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
    res.setHeader('Access-Control-Allow-Origin', '*')
    return res.status(200).json({ code: 0, data: { list, total } })
  }
  if (req.method === 'POST') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {})
    const { symbol, name } = body
    if (!symbol?.trim()) return res.status(400).json({ code: 400, msg: '缺少股票代码' })
    const exist = await sql`SELECT id FROM stocks WHERE symbol = ${symbol.trim()} LIMIT 1`
    if (exist.length) return res.status(400).json({ code: 400, msg: '股票已存在' })
    const r = await sql`INSERT INTO stocks (symbol, name) VALUES (${symbol.trim()}, ${(name || symbol).trim()}) RETURNING id`
    res.setHeader('Access-Control-Allow-Origin', '*')
    return res.status(200).json({ code: 0, data: { id: r[0].id }, msg: '添加成功' })
  }
  res.status(405).json({ code: 405, msg: 'Method not allowed' })
}
