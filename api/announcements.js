import { sql } from '../lib/db.js'

export const config = { runtime: 'nodejs' }

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'GET') return res.status(405).json({ code: 405, msg: 'Method not allowed' })

  const rows = await sql`SELECT id, title, content, created_at FROM announcements WHERE is_active = 1 ORDER BY sort_order DESC, id DESC LIMIT 10`
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.status(200).json({ code: 0, data: rows })
}
