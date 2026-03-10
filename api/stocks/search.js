import { sql } from '../lib/db.js'

export const config = { runtime: 'nodejs' }

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'GET') return res.status(405).json({ code: 405, msg: 'Method not allowed' })

  const q = (req.query?.q || '').trim()
  if (!q) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    return res.status(200).json({ code: 0, data: [] })
  }
  const kw = `%${q}%`
  const rows = await sql`SELECT * FROM stocks WHERE symbol ILIKE ${kw} OR name ILIKE ${kw} LIMIT 20`
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.status(200).json({ code: 0, data: rows })
}
