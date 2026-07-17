import { useState, useRef, useEffect, useCallback } from 'react'
import { useHistoricalRates, type RatePoint } from '../hooks/useHistoricalRates'
import { getCurrencyOrFallback, CURRENCIES } from '../data/currencies'
import { useExchangeRates } from '../hooks/useExchangeRates'
import { useT, useUI } from '../i18n/LangContext'

const TABS = [
  { label: '7D', days: 7 },
  { label: '1M', days: 30 },
  { label: '3M', days: 90 },
  { label: '1Y', days: 365 },
]

const POPULAR = ['USD', 'EUR', 'GBP', 'AZN', 'TRY', 'JPY', 'CNY', 'AED', 'RUB', 'CHF']

interface Props { isDark: boolean; onOpenAlert: (base: string, quote: string) => void }

function FlagImg({ countryCode, fallback }: { countryCode?: string; fallback: string }) {
  const [failed, setFailed] = useState(false)
  if (!countryCode || failed) return <span style={{ fontSize: 18, lineHeight: 1 }}>{fallback}</span>
  return (
    <img src={`https://flagcdn.com/w40/${countryCode}.png`} srcSet={`https://flagcdn.com/w80/${countryCode}.png 2x`}
      alt="" width={24} height={18} loading="lazy"
      style={{ borderRadius: 3, objectFit: 'cover', display: 'block', flexShrink: 0 }}
      onError={() => setFailed(true)} />
  )
}

function CurrencyDropdown({ value, onChange, exclude, isDark }: { value: string; onChange: (c: string) => void; exclude: string; isDark: boolean }) {
  const ui = useUI()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const currency = getCurrencyOrFallback(value)

  useEffect(() => {
    if (!open) return
    setTimeout(() => inputRef.current?.focus(), 50)
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  const filtered = CURRENCIES
    .filter(c => c.code !== exclude)
    .filter(c => !query || c.code.toLowerCase().includes(query.toLowerCase()) || c.name.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 40)

  const bg = isDark ? '#16161e' : '#ffffff'
  const border = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 14px', borderRadius: 14,
          backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
          border: `1px solid ${border}`,
          transition: 'all 0.15s', cursor: 'pointer',
          minWidth: 120,
        }}
      >
        <FlagImg countryCode={currency.countryCode} fallback={currency.flag} />
        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)' }}>{value}</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ color: 'var(--color-text-faint)', marginLeft: 2 }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 100,
          backgroundColor: bg, border: `1px solid ${border}`, borderRadius: 14,
          boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
          width: 220, overflow: 'hidden',
        }}>
          <div style={{ padding: '8px 10px', borderBottom: `1px solid ${border}` }}>
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={ui.search}
              style={{
                width: '100%', boxSizing: 'border-box', backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                border: `1px solid ${border}`, borderRadius: 8, padding: '6px 10px',
                fontSize: 13, color: 'var(--color-text)', outline: 'none',
              }}
            />
          </div>
          <div style={{ maxHeight: 220, overflowY: 'auto', padding: '4px 6px' }}>
            {!query && (
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-faint)', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '6px 6px 2px' }}>{ui.popular}</div>
            )}
            {(query ? filtered : POPULAR.filter(c => c !== exclude).map(code => getCurrencyOrFallback(code))).map(c => {
              const cur = typeof c === 'string' ? getCurrencyOrFallback(c) : c
              return (
                <button
                  key={cur.code}
                  onClick={() => { onChange(cur.code); setOpen(false); setQuery('') }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                    padding: '7px 8px', borderRadius: 8, textAlign: 'left',
                    backgroundColor: cur.code === value ? 'rgba(255,149,0,0.1)' : 'transparent',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => { if (cur.code !== value) (e.currentTarget as HTMLButtonElement).style.backgroundColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }}
                  onMouseLeave={e => { if (cur.code !== value) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent' }}
                >
                  <FlagImg countryCode={cur.countryCode} fallback={cur.flag} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)', width: 36, flexShrink: 0 }}>{cur.code}</span>
                  <span style={{ fontSize: 11, color: 'var(--color-text-faint)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cur.name}</span>
                </button>
              )
            })}
            {query && filtered.length === 0 && (
              <p style={{ fontSize: 12, color: 'var(--color-text-faint)', textAlign: 'center', padding: '16px 0' }}>{ui.noResults}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function niceTicks(min: number, max: number, count: number): number[] {
  const range = max - min || 1
  const rawStep = range / count
  const mag = Math.pow(10, Math.floor(Math.log10(rawStep)))
  const norm = rawStep / mag
  const niceStep = (norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10) * mag
  const start = Math.ceil(min / niceStep) * niceStep
  const ticks: number[] = []
  for (let v = start; v <= max + niceStep * 0.001; v += niceStep) ticks.push(v)
  return ticks
}

function LineChart({ data, isDark, width, height, days }: { data: RatePoint[]; isDark: boolean; width: number; height: number; days: number }) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [hover, setHover] = useState<{ x: number; y: number; point: RatePoint } | null>(null)

  const pad = { top: 16, right: 18, bottom: 30, left: 52 }
  const W = width - pad.left - pad.right
  const H = height - pad.top - pad.bottom

  if (data.length < 2) return null

  const rates = data.map(d => d.rate)
  const minR = Math.min(...rates)
  const maxR = Math.max(...rates)
  const range = maxR - minR || minR * 0.01 || 1
  const paddedMin = minR - range * 0.12
  const paddedMax = maxR + range * 0.12
  const paddedRange = paddedMax - paddedMin

  const px = (i: number) => pad.left + (i / (data.length - 1)) * W
  const py = (r: number) => pad.top + H - ((r - paddedMin) / paddedRange) * H

  const linePath = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${px(i).toFixed(1)},${py(d.rate).toFixed(1)}`).join(' ')
  const areaPath = linePath + ` L${px(data.length - 1).toFixed(1)},${(pad.top + H).toFixed(1)} L${pad.left},${(pad.top + H).toFixed(1)} Z`

  const isUp = data[data.length - 1].rate >= data[0].rate
  const lineColor = isUp ? '#34c759' : '#ff453a'

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const rect = svgRef.current!.getBoundingClientRect()
    const mx = e.clientX - rect.left - pad.left
    const idx = Math.max(0, Math.min(data.length - 1, Math.round((mx / W) * (data.length - 1))))
    setHover({ x: px(idx), y: py(data[idx].rate), point: data[idx] })
  }, [data, W])

  const fmtRate = (r: number) => r < 0.001 ? r.toFixed(6) : r < 1 ? r.toFixed(4) : r < 100 ? r.toFixed(3) : r.toFixed(2)
  // Compact Y-axis label (fewer decimals to fit)
  const fmtAxis = (r: number) => {
    if (r >= 1000) return r.toLocaleString('en-US', { maximumFractionDigits: 0 })
    if (r >= 1) return r.toFixed(2)
    if (r >= 0.01) return r.toFixed(3)
    return r.toFixed(4)
  }

  // X label format depends on period
  const fmtX = (d: string) => {
    const dt = new Date(d)
    if (days <= 7) return dt.toLocaleDateString('en-US', { weekday: 'short' })       // Mon, Tue
    if (days <= 90) return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) // Jun 2
    return dt.toLocaleDateString('en-US', { month: 'short' })                         // Jun
  }
  const fmtTip = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: days > 180 ? 'numeric' : undefined })

  // Y ticks
  const yTicks = niceTicks(paddedMin, paddedMax, 4).filter(t => t >= paddedMin && t <= paddedMax)

  // X labels — pick evenly spaced indices, dedupe consecutive identical labels
  const xCount = days <= 7 ? data.length : Math.min(5, data.length)
  const xIdxs: number[] = []
  for (let k = 0; k < xCount; k++) {
    xIdxs.push(Math.round((k / (xCount - 1)) * (data.length - 1)))
  }
  const seenLabels = new Set<string>()
  const xLabels = xIdxs.filter((idx, i) => {
    const lbl = fmtX(data[idx].date)
    if (days > 90 && seenLabels.has(lbl)) return false // dedupe months
    seenLabels.add(lbl)
    return xIdxs.indexOf(idx) === i
  })

  return (
    <svg ref={svgRef} width={width} height={height} style={{ display: 'block', cursor: 'crosshair' }}
      onMouseMove={handleMouseMove} onMouseLeave={() => setHover(null)}>
      <defs>
        <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={lineColor} stopOpacity="0.18" />
          <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Y gridlines + labels */}
      {yTicks.map((t, i) => {
        const y = py(t)
        return (
          <g key={i}>
            <line x1={pad.left} y1={y} x2={pad.left + W} y2={y}
              stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} strokeWidth="1" />
            <text x={pad.left - 8} y={y + 3.5} textAnchor="end"
              fontSize="10.5" fill={isDark ? 'rgba(255,255,255,0.32)' : 'rgba(0,0,0,0.32)'}>
              {fmtAxis(t)}
            </text>
          </g>
        )
      })}

      <path d={areaPath} fill="url(#area-grad)" />
      <path d={linePath} fill="none" stroke={lineColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* X labels */}
      {xLabels.map((idx, i) => {
        const x = px(idx)
        const anchor = i === 0 ? 'start' : i === xLabels.length - 1 ? 'end' : 'middle'
        return (
          <text key={idx} x={x} y={height - 6} textAnchor={anchor}
            fontSize="10.5" fill={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}>
            {fmtX(data[idx].date)}
          </text>
        )
      })}

      {/* Hover */}
      {hover && (
        <>
          <line x1={hover.x} y1={pad.top} x2={hover.x} y2={pad.top + H}
            stroke={isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'} strokeWidth="1" strokeDasharray="3,3" />
          <circle cx={hover.x} cy={hover.y} r="5" fill={lineColor} stroke={isDark ? '#111116' : '#fff'} strokeWidth="2.5" />
          {(() => {
            const tipW = 120
            const tipX = Math.max(pad.left + 2, Math.min(hover.x - tipW / 2, pad.left + W - tipW))
            const tipY = hover.y < pad.top + H / 2 ? hover.y + 14 : hover.y - 50
            return (
              <g>
                <rect x={tipX} y={tipY} width={tipW} height={38} rx="8"
                  fill={isDark ? '#1c1c28' : '#ffffff'}
                  stroke={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'} strokeWidth="1"
                  style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.2))' }} />
                <text x={tipX + tipW / 2} y={tipY + 14} textAnchor="middle"
                  fontSize="12" fontWeight="700" fill={isDark ? 'rgba(255,255,255,0.92)' : 'rgba(0,0,0,0.88)'}>
                  {fmtRate(hover.point.rate)}
                </text>
                <text x={tipX + tipW / 2} y={tipY + 29} textAnchor="middle"
                  fontSize="10.5" fill={isDark ? 'rgba(255,255,255,0.38)' : 'rgba(0,0,0,0.38)'}>
                  {fmtTip(hover.point.date)}
                </text>
              </g>
            )
          })()}
        </>
      )}
    </svg>
  )
}

export function RateHistorySection({ isDark, onOpenAlert }: Props) {
  const [from, setFrom] = useState('USD')
  const [to, setTo] = useState('EUR')
  const [days, setDays] = useState(30)
  const t = useT()
  const { data, loading, error } = useHistoricalRates(from, to, days)
  const { rates: liveRates } = useExchangeRates(from)
  const liveRate = liveRates[to] ?? null
  const chartRef = useRef<HTMLDivElement>(null)
  const [chartW, setChartW] = useState(0)

  useEffect(() => {
    if (!chartRef.current) return
    const obs = new ResizeObserver(e => setChartW(e[0].contentRect.width))
    obs.observe(chartRef.current)
    setChartW(chartRef.current.offsetWidth)
    return () => obs.disconnect()
  }, [])

  // Use the live mid-market rate (same source as the converter) for the headline value, so it
  // matches the converter and avoids stale/odd values from the historical provider (e.g. pegged AZN ≈ 1.70).
  const currentRate = liveRate ?? (data.length > 0 ? data[data.length - 1].rate : null)
  const firstRate = data.length > 0 ? data[0].rate : null
  const change = currentRate && firstRate ? ((currentRate - firstRate) / firstRate) * 100 : null
  const isUp = change !== null && change >= 0
  const fmtRate = (r: number) => r < 0.001 ? r.toFixed(6) : r < 1 ? r.toFixed(4) : r < 100 ? r.toFixed(4) : r.toFixed(2)

  const border = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'

  return (
    <section style={{ width: '100%', maxWidth: 590, margin: '0 auto', paddingTop: 'clamp(40px, 7vh, 72px)' }}>
      {/* Section header */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
          color: 'var(--color-accent)', marginBottom: 12,
          padding: '6px 14px', borderRadius: 100,
          backgroundColor: isDark ? 'rgba(255,149,0,0.1)' : 'rgba(255,149,0,0.08)',
          border: '1px solid rgba(255,149,0,0.25)',
        }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          {t.rhTag}
        </div>
        <h2 style={{ fontSize: 'clamp(22px, 3.5vw, 30px)', fontWeight: 800, color: 'var(--color-text)', margin: '0 0 8px', letterSpacing: '-0.5px' }}>
          {t.rhTitle}
        </h2>
        <p style={{ fontSize: 14, color: 'var(--color-text-dim)', margin: 0 }}>
          {t.rhSub}
        </p>
      </div>

      {/* Chart card */}
      <div style={{
        borderRadius: 24,
        backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.9)',
        border: `1px solid ${border}`,
        backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)',
        boxShadow: isDark ? '0 24px 80px rgba(0,0,0,0.35)' : '0 16px 60px rgba(0,0,0,0.08)',
        overflow: 'hidden',
      }}>
        {/* Rate display + tabs row */}
        <div style={{ padding: '18px 24px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          {/* Rate */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, minWidth: 0 }}>
            {currentRate !== null ? (
              <>
                <span style={{ fontSize: 32, fontWeight: 800, color: 'var(--color-text)', lineHeight: 1, fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
                  {fmtRate(currentRate)}
                </span>
                <span style={{ fontSize: 12, color: 'var(--color-text-faint)', marginBottom: 4, flexShrink: 0 }}>
                  {from}/{to}
                </span>
                {change !== null && (
                  <span style={{
                    fontSize: 12, fontWeight: 700, marginBottom: 3, flexShrink: 0,
                    color: isUp ? '#34c759' : '#ff453a',
                    padding: '2px 8px', borderRadius: 7,
                    backgroundColor: isUp ? 'rgba(52,199,89,0.12)' : 'rgba(255,69,58,0.12)',
                  }}>
                    {isUp ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
                  </span>
                )}
              </>
            ) : loading ? (
              <span style={{ fontSize: 28, color: 'var(--color-text-faint)' }}>—</span>
            ) : null}
          </div>

          {/* Period tabs — right side */}
          <div style={{ display: 'flex', gap: 2, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)', borderRadius: 10, padding: 3, flexShrink: 0 }}>
            {TABS.map(tab => (
              <button key={tab.label} onClick={() => setDays(tab.days)} style={{
                padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                backgroundColor: days === tab.days ? (isDark ? 'rgba(255,255,255,0.12)' : '#ffffff') : 'transparent',
                color: days === tab.days ? 'var(--color-text)' : 'var(--color-text-faint)',
                transition: 'all 0.15s',
                boxShadow: days === tab.days && !isDark ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              }}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Controls — currency pair */}
        <div style={{ padding: '0 24px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <CurrencyDropdown value={from} onChange={setFrom} exclude={to} isDark={isDark} />
          <button
            onClick={() => { setFrom(to); setTo(from) }}
            style={{
              width: 30, height: 30, borderRadius: 9, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)',
              color: 'var(--color-text-dim)', transition: 'all 0.15s',
            }}
            title="Swap"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 16V4m0 0L3 8m4-4 4 4" /><path d="M17 8v12m0 0 4-4m-4 4-4-4" />
            </svg>
          </button>
          <CurrencyDropdown value={to} onChange={setTo} exclude={from} isDark={isDark} />
        </div>

        {/* Chart */}
        <div ref={chartRef} style={{ padding: '4px 12px 0' }}>
          {loading && (
            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-faint)" strokeWidth="2" strokeLinecap="round" className="animate-spin">
                <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" />
              </svg>
            </div>
          )}
          {error && (
            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 13, color: 'var(--color-text-faint)' }}>Could not load data. Try again later.</span>
            </div>
          )}
          {!loading && !error && chartW > 0 && data.length > 1 && (
            <LineChart data={data} isDark={isDark} width={chartW} height={220} days={days} />
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 20px 16px', borderTop: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <button
            onClick={() => onOpenAlert(from, to)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 12.5, fontWeight: 700, color: 'var(--color-accent)',
              padding: '7px 14px', borderRadius: 10,
              backgroundColor: isDark ? 'rgba(255,149,0,0.1)' : 'rgba(255,149,0,0.08)',
              border: '1px solid rgba(255,149,0,0.25)',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,149,0,0.16)' : 'rgba(255,149,0,0.13)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,149,0,0.1)' : 'rgba(255,149,0,0.08)')}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            {t.setAlert}
          </button>
          <span style={{ fontSize: 11, color: 'var(--color-text-faint)' }}>
            {t.forReference}
          </span>
        </div>
      </div>
    </section>
  )
}
