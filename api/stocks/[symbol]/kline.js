/**
 * K线行情 - 独立路由，直接调用 iTick API
 * GET /api/stocks/:symbol/kline?period=1mo
 */
export const config = { runtime: 'nodejs' }

const ITICK_TOKEN = process.env.ITICK_TOKEN || ''
const PERIOD_MAP = { '5d': [8, 5], '1mo': [8, 22], '3mo': [8, 66], '6mo': [8, 132], '1y': [8, 252] }

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'GET') return res.status(405).json({ code: 405, msg: 'Method not allowed' })

  res.setHeader('Access-Control-Allow-Origin', '*')

  let symbol = req.query?.symbol || ''
  if (!symbol && req.url) {
    const m = (req.url || '').match(/\/api\/stocks\/([^/?]+)\/kline/)
    if (m) symbol = m[1]
  }
  if (!symbol) return res.status(400).json({ code: 400, msg: '缺少股票代码' })
  if (!ITICK_TOKEN) return res.status(500).json({ code: 500, msg: '未配置 ITICK_TOKEN，请在 Vercel 环境变量中设置' })

  const period = (req.query?.period || '1mo').toLowerCase()
  const [kType, limit] = PERIOD_MAP[period] || [8, 22]
  const code = String(symbol).replace(/\.T$/i, '').replace(/\./g, '')

  const url = `https://api.itick.org/stock/kline?region=JP&code=${encodeURIComponent(code)}&kType=${kType}&limit=${limit}`

  try {
    const r = await fetch(url, { headers: { accept: 'application/json', token: ITICK_TOKEN } })
    const data = await r.json()

    if (data.code !== 0) {
      throw new Error(data.msg || 'iTick API 错误')
    }

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
    console.error('[kline]', symbol, e)
    return res.status(500).json({ code: 500, msg: e.message || '行情请求失败' })
  }
}
