// Currency rates API: fawazahmed0/currency-api
// - Free, no API key, ~250 currencies
// - Sourced from public ECB / open data, updated daily
// - Two CDNs for redundancy (jsDelivr + Cloudflare Pages)
// Docs: https://github.com/fawazahmed0/exchange-api

const PRIMARY = (base: string) =>
  `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${base.toLowerCase()}.json`

const FALLBACK = (base: string) =>
  `https://latest.currency-api.pages.dev/v1/currencies/${base.toLowerCase()}.json`

export interface RatesResponse {
  date: string
  base: string
  rates: Record<string, number>
}

export async function fetchRates(base: string): Promise<RatesResponse> {
  let lastError: unknown
  for (const url of [PRIMARY(base), FALLBACK(base)]) {
    try {
      const res = await fetch(url, { cache: 'no-cache' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      const baseLower = base.toLowerCase()
      const rates = data[baseLower] as Record<string, number> | undefined
      if (!rates) throw new Error('Invalid response shape')
      return {
        date: data.date,
        base: base.toUpperCase(),
        rates: Object.fromEntries(
          Object.entries(rates).map(([k, v]) => [k.toUpperCase(), v]),
        ),
      }
    } catch (e) {
      lastError = e
    }
  }
  throw lastError instanceof Error ? lastError : new Error('Network error')
}
