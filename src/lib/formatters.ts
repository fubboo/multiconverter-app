const NO_DECIMAL = new Set([
  'JPY', 'KRW', 'VND', 'IDR', 'CLP', 'ISK', 'HUF', 'TWD',
  'COP', 'PYG', 'UGX', 'LAK', 'KHR', 'MMK', 'IRR', 'IQD',
])

export type DecimalMode = 'auto' | 0 | 1 | 2 | 3 | 4

export function decimalsFor(code: string): number {
  return NO_DECIMAL.has(code) ? 0 : 2
}

export function effectiveDecimals(code: string, mode: DecimalMode): number {
  return mode === 'auto' ? decimalsFor(code) : mode
}

export function roundTo(value: number, decimals: number): number {
  if (!Number.isFinite(value)) return 0
  const factor = Math.pow(10, decimals)
  return Math.round(value * factor) / factor
}

export function formatAmount(
  value: number,
  code: string,
  mode: DecimalMode = 'auto',
): string {
  if (!Number.isFinite(value)) return '—'
  const decimals = effectiveDecimals(code, mode)
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export function formatRelativeDate(isoDate: string | null): string | null {
  if (!isoDate) return null
  const d = new Date(isoDate)
  if (Number.isNaN(d.getTime())) return null
  const now = new Date()
  const todayStr = now.toISOString().slice(0, 10)
  const yest = new Date(now.getTime() - 86400000).toISOString().slice(0, 10)
  if (isoDate === todayStr) return 'Today'
  if (isoDate === yest) return 'Yesterday'
  return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' })
}
