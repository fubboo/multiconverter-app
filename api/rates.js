async function yahooFetch(symbol, range) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=${range}&includePrePost=false`
  const r = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json',
    },
  })
  if (!r.ok) throw new Error(`Yahoo ${r.status}`)
  const json = await r.json()
  const result = json?.chart?.result?.[0]
  if (!result) throw new Error('no result')
  const { timestamp, indicators } = result
  const closes = indicators.quote[0].close
  return timestamp
    .map((ts, i) => ({ date: new Date(ts * 1000).toISOString().slice(0, 10), rate: closes[i] }))
    .filter(p => p.rate != null && isFinite(p.rate))
}

async function fawazFetch(b, q, n) {
  const step = n <= 7 ? 1 : n <= 30 ? 2 : n <= 90 ? 6 : n <= 180 ? 10 : 14
  const dates = []
  for (let i = n; i >= 0; i -= step) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    dates.push(d.toISOString().slice(0, 10))
  }
  const results = await Promise.all(dates.map(async date => {
    try {
      const r = await fetch(`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@${date}/v1/currencies/${b.toLowerCase()}.min.json`)
      if (!r.ok) return null
      const json = await r.json()
      const rate = json[b.toLowerCase()]?.[q.toLowerCase()]
      return rate != null ? { date, rate } : null
    } catch { return null }
  }))
  return results.filter(Boolean)
}

export default async function handler(req, res) {
  const { base = 'USD', quote = 'EUR', days = '30' } = req.query
  const b = base.toUpperCase()
  const q = quote.toUpperCase()
  const n = Math.min(parseInt(days) || 30, 365)
  const range = n <= 7 ? '7d' : n <= 30 ? '1mo' : n <= 90 ? '3mo' : n <= 180 ? '6mo' : '1y'

  if (b === q) return res.status(400).json({ error: 'same currency' })

  let points = []

  // 1. Try Yahoo Finance
  try {
    if (b === 'USD') {
      points = await yahooFetch(`USD${q}=X`, range)
    } else if (q === 'USD') {
      points = await yahooFetch(`${b}USD=X`, range)
    } else {
      const [baseRates, quoteRates] = await Promise.all([
        yahooFetch(`${b}USD=X`, range),
        yahooFetch(`USD${q}=X`, range),
      ])
      const quoteMap = new Map(quoteRates.map(p => [p.date, p.rate]))
      points = baseRates
        .map(p => ({ date: p.date, rate: quoteMap.has(p.date) ? p.rate * quoteMap.get(p.date) : null }))
        .filter(p => p.rate != null)
    }
  } catch {}

  // 2. Fallback to fawazahmed0
  if (points.length === 0) {
    try { points = await fawazFetch(b, q, n) } catch {}
  }

  if (points.length === 0) {
    return res.status(503).json({ error: 'No data available' })
  }

  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.json(points)
}
