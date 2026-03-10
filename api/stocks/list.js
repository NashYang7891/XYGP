/**
 * 合并 search + popular：/api/stocks/list?type=popular 或 ?q=xxx
 * 通过 vercel.json rewrites 映射 /api/stocks/search 和 /api/stocks/popular
 */
import { sql } from '../lib/db.js'

export const config = { runtime: 'nodejs' }

const JP_STOCKS = [
  ['7203', 'トヨタ自動車'], ['9984', 'ソフトバンクG'], ['6758', 'ソニーG'],
  ['7974', '任天堂'], ['9983', 'ファーストリテイリング'], ['6861', 'キーエンス'],
  ['8306', '三菱UFJ'], ['9432', '日本電信電話'], ['9433', 'KDDI'], ['7267', '本田技研工業'],
]

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'GET') return res.status(405).json({ code: 405, msg: 'Method not allowed' })

  res.setHeader('Access-Control-Allow-Origin', '*')

  const type = req.query?.type || ''
  const q = (req.query?.q || '').trim()

  if (type === 'popular' || (!q && !type)) {
    let rows = await sql`SELECT * FROM stocks ORDER BY id LIMIT 20`
    if (!rows.length) {
      for (const [s, n] of JP_STOCKS) {
        await sql`INSERT INTO stocks (symbol, name) VALUES (${s}, ${n}) ON CONFLICT (symbol) DO NOTHING`
      }
      rows = await sql`SELECT * FROM stocks ORDER BY id LIMIT 20`
    }
    return res.status(200).json({ code: 0, data: rows })
  }

  if (!q) return res.status(200).json({ code: 0, data: [] })
  const kw = `%${q}%`
  const rows = await sql`SELECT * FROM stocks WHERE symbol ILIKE ${kw} OR name ILIKE ${kw} LIMIT 20`
  return res.status(200).json({ code: 0, data: rows })
}
