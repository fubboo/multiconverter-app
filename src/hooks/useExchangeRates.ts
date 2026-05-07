import { useState, useEffect, useCallback, useRef } from 'react'
import { fetchRates } from '../lib/api'

interface CachedRates {
  base: string
  date: string
  rates: Record<string, number>
  fetchedAt: number
}

const FRESH_MS = 1000 * 60 * 60 * 6 // 6h

export function useExchangeRates(base: string) {
  const [rates, setRates] = useState<Record<string, number>>({ [base]: 1 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [date, setDate] = useState<string | null>(null)
  const inFlight = useRef(false)

  const cacheKey = `rates:${base}`

  const refresh = useCallback(async () => {
    if (inFlight.current) return
    inFlight.current = true
    setLoading(true)
    setError(null)
    try {
      const data = await fetchRates(base)
      const merged = { ...data.rates, [data.base]: 1 }
      setRates(merged)
      setDate(data.date)
      const cache: CachedRates = {
        base: data.base,
        date: data.date,
        rates: merged,
        fetchedAt: Date.now(),
      }
      try { localStorage.setItem(cacheKey, JSON.stringify(cache)) } catch {}
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch rates')
    } finally {
      setLoading(false)
      inFlight.current = false
    }
  }, [base, cacheKey])

  useEffect(() => {
    let usedCache = false
    try {
      const raw = localStorage.getItem(cacheKey)
      if (raw) {
        const parsed = JSON.parse(raw) as CachedRates
        if (parsed && parsed.rates) {
          setRates({ ...parsed.rates, [base]: 1 })
          setDate(parsed.date)
          usedCache = true
          if (Date.now() - parsed.fetchedAt < FRESH_MS) return
        }
      }
    } catch {}
    if (!usedCache) {
      // no cache → ensure base=1 at minimum
      setRates({ [base]: 1 })
    }
    refresh()
  }, [base, cacheKey, refresh])

  return { rates, loading, error, date, refresh }
}
