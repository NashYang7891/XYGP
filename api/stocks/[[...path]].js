import { sql } from '../lib/db.js'
import { verifyToken } from '../lib/auth.js'

export const config = { runtime: 'nodejs' }

const ITICK_TOKEN = process.env.ITICK_TOKEN || ''
const JP_STOCKS = [
  ['7203', 'トヨタ自動車'], ['9984', 'ソフトバンクG'], ['6758', 'ソニーG'],
  ['7974', '任天堂'], ['9983', 'ファーストリテイリング'], ['6861', 'キーエンス'],
  ['8306', '三菱UFJ'], ['9432', '日本電信電話'], ['9433', 'KDDI'], ['7267', '本田技研工業'],
]
const PERIOD_MAP = { '5d': [8, 5], '1mo': [8, 22], '3mo': [8, 66], '6mo': [8, 132], '1y': [8, 252] }

function getPathParts(req) {
  const path = (req.url || '').split('?')[0]
  const match = path.match(/\/api\/stocks(?:\/(.*))?$/)
  const rest = (match && match[1]) ? match[1].split('/').filter(Boolean) : []
  return rest
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(204).end()
  res.setHeader('Access-Control-Allow-Origin', '*')

  const parts = getPathParts(req)
  const p0 = parts[0]
  const p1 = parts[1]

  if (p0 === 'search') {
    if (req.method !== 'GET') return res.status(405).json({ code: 405, msg: 'Method not allowed' })
    const q = (req.query.q || '').trim()
    if (!q) return res.status(200).json({ code: 0, data: [] })
    const kw = `%${q}%`
    const rows = await sql`SELECT * FROM stocks WHERE symbol ILIKE ${kw} OR name ILIKE ${kw} LIMIT 20`
    return res.status(200).json({ code: 0, data: rows })
  }

  if (p0 === 'popular') {
    if (req.method !== 'GET') return res.status(405).json({ code: 405, msg: 'Method not allowed' })
    let rows = await sql`SELECT * FROM stocks ORDER BY id LIMIT 20`
    if (!rows.length) {
      for (const [s, n] of JP_STOCKS) {
        await sql`INSERT INTO stocks (symbol, name) VALUES (${s}, ${n}) ON CONFLICT (symbol) DO NOTHING`
      }
      rows = await sql`SELECT * FROM stocks ORDER BY id LIMIT 20`
    }
    return res.status(200).json({ code: 0, data: rows })
  }

  if (p0 && p1 === 'kline') {
    if (req.method !== 'GET') return res.status(405).json({ code: 405, msg: 'Method not allowed' })
    const symbol = p0
    if (!symbol) return res.status(400).json({ code: 400, msg: '缺少股票代码' })
    if (!ITICK_TOKEN) return res.status(500).json({ code: 500, msg: '未配置 ITICK_TOKEN' })
    const urlObj = req.url?.startsWith('http') ? new URL(req.url) : new URL('http://x' + (req.url || ''))
    const period = urlObj.searchParams.get('period') || '1mo'
    const [kType, limit] = PERIOD_MAP[period] || [8, 22]
    const code = symbol.replace(/\.T$/, '').replace(/\./g, '')
    const url = `https://api.itick.org/stock/kline?region=JP&code=${encodeURIComponent(code)}&kType=${kType}&limit=${limit}`
    try {
      const r = await fetch(url, { headers: { accept: 'application/json', token: ITICK_TOKEN } })
      const data = await r.json()
      if (data.code !== 0) throw new Error(data.msg || 'iTick API 错误')
      const raw = data.data || []
      const result = raw.map((item) => {
        const t = item.t
        const date = t ? new Date(t).toISOString().slice(0, 10) : ''
        return {
          date,
          open: item.o != null ? Math.round(item.o * 100) / 100 : null,
          high: item.h != null ? Math.round(item.h * 100) / 100 : null,
          low: item.l != null ? Math.round(item.l * 100) / 100 : null,
          close: item.c != null ? Math.round(item.c * 100) / 100 : null,
          volume: item.v != null ? Math.floor(item.v) : null,
        }
      })
      return res.status(200).json({ code: 0, data: result })
    } catch (e) {
      console.error(e)
      return res.status(500).json({ code: 500, msg: e.message })
    }
  }

  if (p0 && !p1) {
    if (req.method !== 'GET') return res.status(405).json({ code: 405, msg: 'Method not allowed' })
    const symbol = p0
    if (!symbol) return res.status(400).json({ code: 400, msg: '缺少股票代码' })
    let rows = await sql`SELECT * FROM stocks WHERE symbol = ${symbol} LIMIT 1`
    if (!rows.length) {
      await sql`INSERT INTO stocks (symbol, name) VALUES (${symbol}, ${symbol}) ON CONFLICT (symbol) DO NOTHING`
      rows = await sql`SELECT * FROM stocks WHERE symbol = ${symbol} LIMIT 1`
    }
    const stock = rows[0]
    if (!stock) return res.status(404).json({ code: 404, msg: '股票不存在' })
    let inWatchlist = false
    const auth = req.headers.authorization || ''
    const m = auth.match(/Bearer\s+(.+)/)
    if (m) {
      const payload = verifyToken(m[1].trim())
      if (payload?.user_id) {
        const wl = await sql`SELECT w.id FROM watchlists w WHERE w.user_id = ${payload.user_id} LIMIT 1`
        if (wl.length) {
          const chk = await sql`SELECT 1 FROM watchlist_items wi WHERE wi.watchlist_id = ${wl[0].id} AND wi.stock_id = ${stock.id} LIMIT 1`
          inWatchlist = chk.length > 0
        }
      }
    }
    const { created_at, ...rest } = stock
    return res.status(200).json({ code: 0, data: { ...rest, in_watchlist: inWatchlist } })
  }

  return res.status(404).json({ code: 404, msg: 'Not found' })
}
