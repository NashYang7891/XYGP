import { sql } from '../lib/db.js'

const JP_STOCKS = [
  ['7203', 'トヨタ自動車'], ['9984', 'ソフトバンクG'], ['6758', 'ソニーG'],
  ['7974', '任天堂'], ['9983', 'ファーストリテイリング'], ['6861', 'キーエンス'],
  ['8306', '三菱UFJ'], ['9432', '日本電信電話'], ['9433', 'KDDI'], ['7267', '本田技研工業'],
]

export const config = { runtime: 'nodejs' }

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'GET') return res.status(405).json({ code: 405, msg: 'Method not allowed' })

  let rows = await sql`SELECT * FROM stocks ORDER BY id LIMIT 20`
  if (!rows.length) {
    for (const [s, n] of JP_STOCKS) {
      await sql`INSERT INTO stocks (symbol, name) VALUES (${s}, ${n}) ON CONFLICT (symbol) DO NOTHING`
    }
    rows = await sql`SELECT * FROM stocks ORDER BY id LIMIT 20`
  }
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.status(200).json({ code: 0, data: rows })
}
