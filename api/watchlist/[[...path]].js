import { sql } from '../../lib/db.js'
import { verifyToken } from '../../lib/auth.js'

export const config = { runtime: 'nodejs' }

function parseBody(req) {
  return typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {})
}

async function getAuth(req, res) {
  const auth = req.headers.authorization || ''
  const m = auth.match(/Bearer\s+(.+)/)
  if (!m) { res.status(401).json({ code: 401, msg: '未登录' }); return null }
  const payload = verifyToken(m[1].trim())
  if (!payload?.user_id) { res.status(401).json({ code: 401, msg: '登录已过期' }); return null }
  return payload
}

function getPathParts(req) {
  const path = (req.url || '').split('?')[0]
  const match = path.match(/\/api\/watchlist(?:\/(.*))?$/)
  const rest = (match && match[1]) ? match[1].split('/').filter(Boolean) : []
  return rest
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(204).end()
  res.setHeader('Access-Control-Allow-Origin', '*')

  const parts = getPathParts(req)
  const action = parts[0]

  if (!action || action === 'index') {
    if (req.method !== 'GET') return res.status(405).json({ code: 405, msg: 'Method not allowed' })
    const payload = await getAuth(req, res)
    if (!payload) return
    let wl = await sql`SELECT * FROM watchlists WHERE user_id = ${payload.user_id} LIMIT 1`
    if (!wl.length) {
      await sql`INSERT INTO watchlists (user_id, name) VALUES (${payload.user_id}, '默认自选')`
      wl = await sql`SELECT * FROM watchlists WHERE user_id = ${payload.user_id} LIMIT 1`
    }
    const items = await sql`
      SELECT s.id, s.symbol, s.name, wi.id as item_id
      FROM watchlist_items wi
      JOIN stocks s ON wi.stock_id = s.id
      WHERE wi.watchlist_id = ${wl[0].id}
      ORDER BY wi.sort_order, wi.id
    `
    return res.status(200).json({ code: 0, data: { watchlist: wl[0], items } })
  }

  if (action === 'add') {
    if (req.method !== 'POST') return res.status(405).json({ code: 405, msg: 'Method not allowed' })
    const payload = await getAuth(req, res)
    if (!payload) return
    const body = parseBody(req)
    const stockId = parseInt(body.stock_id, 10)
    if (!stockId) return res.status(400).json({ code: 400, msg: '缺少股票ID' })
    let wl = await sql`SELECT id FROM watchlists WHERE user_id = ${payload.user_id} LIMIT 1`
    if (!wl.length) {
      await sql`INSERT INTO watchlists (user_id, name) VALUES (${payload.user_id}, '默认自选')`
      wl = await sql`SELECT id FROM watchlists WHERE user_id = ${payload.user_id} LIMIT 1`
    }
    try { await sql`INSERT INTO watchlist_items (watchlist_id, stock_id) VALUES (${wl[0].id}, ${stockId}) ON CONFLICT (watchlist_id, stock_id) DO NOTHING` } catch {}
    return res.status(200).json({ code: 0, msg: '添加成功' })
  }

  if (action === 'remove') {
    if (req.method !== 'POST') return res.status(405).json({ code: 405, msg: 'Method not allowed' })
    const payload = await getAuth(req, res)
    if (!payload) return
    const body = parseBody(req)
    const stockId = parseInt(body.stock_id, 10)
    if (!stockId) return res.status(400).json({ code: 400, msg: '缺少股票ID' })
    await sql`
      DELETE FROM watchlist_items
      WHERE watchlist_id IN (SELECT id FROM watchlists WHERE user_id = ${payload.user_id})
      AND stock_id = ${stockId}
    `
    return res.status(200).json({ code: 0, msg: '移除成功' })
  }

  if (action === 'check') {
    if (req.method !== 'GET') return res.status(405).json({ code: 405, msg: 'Method not allowed' })
    const stockId = parseInt(parts[1], 10)
    if (!stockId) return res.status(400).json({ code: 400, msg: '缺少股票ID' })
    const payload = await getAuth(req, res)
    if (!payload) return
    const rows = await sql`
      SELECT 1 FROM watchlist_items wi
      JOIN watchlists w ON wi.watchlist_id = w.id
      WHERE w.user_id = ${payload.user_id} AND wi.stock_id = ${stockId} LIMIT 1
    `
    return res.status(200).json({ code: 0, data: { in_watchlist: rows.length > 0 } })
  }

  return res.status(404).json({ code: 404, msg: 'Not found' })
}
