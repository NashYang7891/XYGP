export const config = { runtime: 'nodejs' }

const ITICK_TOKEN = process.env.ITICK_TOKEN || ''
const PERIOD_MAP = { '5d': [8, 5], '1mo': [8, 22], '3mo': [8, 66], '6mo': [8, 132], '1y': [8, 252] }

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'GET') return res.status(405).json({ code: 405, msg: 'Method not allowed' })

  const urlStr = req.url || ''
  const [path] = urlStr.split('?')
  const pathParts = path.split('/').filter(Boolean)
  const symbol = pathParts[pathParts.length - 2] || ''
  const urlObj = urlStr.startsWith('http') ? new URL(urlStr) : new URL('http://x' + urlStr)
  const period = urlObj.searchParams.get('period') || '1mo'
  if (!symbol) return res.status(400).json({ code: 400, msg: '缺少股票代码' })
  if (!ITICK_TOKEN) return res.status(500).json({ code: 500, msg: '未配置 ITICK_TOKEN' })

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
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.status(200).json({ code: 0, data: result })
  } catch (e) {
    console.error(e)
    res.status(500).json({ code: 500, msg: e.message })
  }
}
