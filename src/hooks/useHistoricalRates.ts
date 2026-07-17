import { useState, useEffect } from 'react'

export interface RatePoint {
  date: string
  rate: number
}

const cache = new Map<string, RatePoint[]>()

export function useHistoricalRates(base: string, quote: string, days: number) {
  const [data, setData] = useState<RatePoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (base === quote) { setData([]); setLoading(false); return }

    const key = `${base}-${quote}-${days}`
    if (cache.has(key)) {
      setData(cache.get(key)!)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(false)
    setData([])

    fetch(`/api/rates?base=${base}&quote=${quote}&days=${days}`)
      .then(r => r.json())
      .then(json => {
        if (!Array.isArray(json) || json.length === 0) throw new Error('empty')
        cache.set(key, json)
        setData(json)
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }, [base, quote, days])

  return { data, loading, error }
}
