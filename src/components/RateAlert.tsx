import { useState, useEffect, useCallback } from 'react'
import { getCurrencyOrFallback, CURRENCIES } from '../data/currencies'
import { useUI } from '../i18n/LangContext'

export interface Alert {
  id: string
  base: string
  quote: string
  target: number
  direction: 'above' | 'below'
  createdAt: number
  triggered: boolean
}

const STORAGE_KEY = 'mc_rate_alerts'

function loadAlerts(): Alert[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}

function saveAlerts(alerts: Alert[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts))
}

async function fetchRate(base: string, quote: string): Promise<number | null> {
  try {
    const r = await fetch(`/api/rates?base=${base}&quote=${quote}&days=1`)
    const json = await r.json()
    if (Array.isArray(json) && json.length > 0) return json[json.length - 1].rate
  } catch {}
  return null
}

async function checkAlerts() {
  const alerts = loadAlerts().filter(a => !a.triggered)
  if (alerts.length === 0) return

  for (const alert of alerts) {
    const rate = await fetchRate(alert.base, alert.quote)
    if (rate === null) continue
    const hit = alert.direction === 'above' ? rate >= alert.target : rate <= alert.target
    if (hit) {
      const updated = loadAlerts().map(a =>
        a.id === alert.id ? { ...a, triggered: true } : a
      )
      saveAlerts(updated)
      if (Notification.permission === 'granted') {
        new Notification(`Rate Alert: ${alert.base}/${alert.quote}`, {
          body: `${alert.base}/${alert.quote} is now ${rate.toFixed(4)} (target: ${alert.direction === 'above' ? '≥' : '≤'} ${alert.target})`,
          icon: '/logo-192.png',
        })
      }
    }
  }
}

function FlagImg({ countryCode, fallback }: { countryCode?: string; fallback: string }) {
  const [failed, setFailed] = useState(false)
  if (!countryCode || failed) return <span style={{ fontSize: 16, lineHeight: 1 }}>{fallback}</span>
  return (
    <img src={`https://flagcdn.com/w40/${countryCode}.png`} alt="" width={20} height={15} loading="lazy"
      style={{ borderRadius: 3, objectFit: 'cover', flexShrink: 0 }}
      onError={() => setFailed(true)} />
  )
}

interface Props {
  defaultBase: string
  defaultQuote?: string
  isDark: boolean
  onClose: () => void
}

export function RateAlertModal({ defaultBase, defaultQuote, isDark, onClose }: Props) {
  const ui = useUI()
  const [base, setBase] = useState(defaultBase)
  const [quote, setQuote] = useState(defaultQuote && defaultQuote !== defaultBase ? defaultQuote : (defaultBase === 'USD' ? 'EUR' : 'USD'))
  const [targetStr, setTargetStr] = useState('')
  const [direction, setDirection] = useState<'above' | 'below'>('above')
  const [alerts, setAlerts] = useState<Alert[]>(loadAlerts)
  const [saving, setSaving] = useState(false)
  const [permDenied, setPermDenied] = useState(false)
  const [baseQuery, setBaseQuery] = useState('')
  const [quoteQuery, setQuoteQuery] = useState('')
  const [baseOpen, setBaseOpen] = useState(false)
  const [quoteOpen, setQuoteOpen] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const handleSave = useCallback(async () => {
    const target = parseFloat(targetStr)
    if (isNaN(target) || target <= 0) return

    setSaving(true)
    let perm = Notification.permission
    if (perm === 'default') {
      perm = await Notification.requestPermission()
    }
    if (perm === 'denied') { setPermDenied(true); setSaving(false); return }

    const alert: Alert = {
      id: Date.now().toString(),
      base, quote, target, direction,
      createdAt: Date.now(),
      triggered: false,
    }
    const updated = [...loadAlerts(), alert]
    saveAlerts(updated)
    setAlerts(updated)
    setTargetStr('')
    setSaving(false)
  }, [base, quote, targetStr, direction])

  const handleDelete = (id: string) => {
    const updated = loadAlerts().filter(a => a.id !== id)
    saveAlerts(updated)
    setAlerts(updated)
  }

  const bg = isDark ? '#111116' : '#ffffff'
  const border = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  const inputBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'

  const CurrencyPill = ({ value, onChange, query, setQuery, open, setOpen, exclude }: {
    value: string; onChange: (c: string) => void
    query: string; setQuery: (q: string) => void
    open: boolean; setOpen: (o: boolean) => void
    exclude: string
  }) => {
    const cur = getCurrencyOrFallback(value)
    const list = CURRENCIES.filter(c => c.code !== exclude && (!query || c.code.toLowerCase().includes(query.toLowerCase()) || c.name.toLowerCase().includes(query.toLowerCase()))).slice(0, 40)
    return (
      <div style={{ position: 'relative' }}>
        <button onClick={() => setOpen(!open)} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 10,
          backgroundColor: inputBg, border: `1px solid ${border}`,
        }}>
          <FlagImg countryCode={cur.countryCode} fallback={cur.flag} />
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)' }}>{value}</span>
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ color: 'var(--color-text-faint)' }}><polyline points="6 9 12 15 18 9" /></svg>
        </button>
        {open && (
          <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 100, backgroundColor: bg, border: `1px solid ${border}`, borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.25)', width: 200, overflow: 'hidden' }}>
            <div style={{ padding: '6px 8px', borderBottom: `1px solid ${border}` }}>
              <input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder={ui.search}
                style={{ width: '100%', boxSizing: 'border-box', backgroundColor: inputBg, border: `1px solid ${border}`, borderRadius: 7, padding: '5px 9px', fontSize: 12, color: 'var(--color-text)', outline: 'none' }} />
            </div>
            <div style={{ maxHeight: 180, overflowY: 'auto', padding: '3px 5px' }}>
              {list.map(c => (
                <button key={c.code} onClick={() => { onChange(c.code); setOpen(false); setQuery('') }}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 7, padding: '6px 7px', borderRadius: 7, backgroundColor: c.code === value ? 'rgba(255,149,0,0.1)' : 'transparent' }}>
                  <FlagImg countryCode={c.countryCode} fallback={c.flag} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text)', width: 32, flexShrink: 0 }}>{c.code}</span>
                  <span style={{ fontSize: 11, color: 'var(--color-text-faint)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', maxWidth: 420, backgroundColor: bg, border: `1px solid ${border}`,
        borderRadius: 24, overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{ padding: '18px 20px 14px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2.2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>{ui.alertTitle}</h2>
          </div>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 7, border: 'none', background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-dim)' }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Form */}
        <div style={{ padding: '16px 20px' }}>
          {/* Currency pair */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <CurrencyPill value={base} onChange={setBase} query={baseQuery} setQuery={setBaseQuery} open={baseOpen} setOpen={setBaseOpen} exclude={quote} />
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ color: 'var(--color-text-faint)', flexShrink: 0 }}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            <CurrencyPill value={quote} onChange={setQuote} query={quoteQuery} setQuery={setQuoteQuery} open={quoteOpen} setOpen={setQuoteOpen} exclude={base} />
          </div>

          {/* Direction + target */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            <div style={{ display: 'flex', gap: 3, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)', borderRadius: 10, padding: 3 }}>
              {(['above', 'below'] as const).map(d => (
                <button key={d} onClick={() => setDirection(d)} style={{
                  padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                  backgroundColor: direction === d ? (isDark ? 'rgba(255,255,255,0.12)' : '#ffffff') : 'transparent',
                  color: direction === d ? 'var(--color-text)' : 'var(--color-text-faint)',
                  boxShadow: direction === d && !isDark ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                }}>
                  {d === 'above' ? `≥ ${ui.above}` : `≤ ${ui.below}`}
                </button>
              ))}
            </div>
            <input
              type="number" step="any" value={targetStr}
              onChange={e => setTargetStr(e.target.value)}
              placeholder={ui.targetRate}
              style={{
                flex: 1, backgroundColor: inputBg, border: `1px solid ${border}`,
                borderRadius: 10, padding: '8px 12px', fontSize: 14, fontWeight: 600,
                color: 'var(--color-text)', outline: 'none', minWidth: 0,
              }}
            />
          </div>

          {permDenied && (
            <p style={{ fontSize: 12, color: '#ff453a', marginBottom: 10 }}>
              {ui.notifBlocked}
            </p>
          )}

          <button onClick={handleSave} disabled={saving || !targetStr}
            style={{
              width: '100%', padding: '11px', borderRadius: 12, fontSize: 14, fontWeight: 700,
              backgroundColor: 'var(--color-accent)', color: 'white',
              opacity: saving || !targetStr ? 0.5 : 1, transition: 'opacity 0.15s',
            }}>
            {saving ? ui.saving : ui.setAlert}
          </button>
        </div>

        {/* Active alerts */}
        {alerts.length > 0 && (
          <div style={{ borderTop: `1px solid ${border}`, padding: '12px 20px 16px' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-faint)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8 }}>{ui.activeAlerts}</p>
            {alerts.map(a => {
              const baseCur = getCurrencyOrFallback(a.base)
              const quoteCur = getCurrencyOrFallback(a.quote)
              return (
                <div key={a.id} style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 10,
                  backgroundColor: a.triggered ? 'rgba(52,199,89,0.08)' : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'),
                  marginBottom: 6,
                }}>
                  <FlagImg countryCode={baseCur.countryCode} fallback={baseCur.flag} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text)' }}>{a.base}/{a.quote}</span>
                  <span style={{ fontSize: 12, color: 'var(--color-text-faint)' }}>{a.direction === 'above' ? '≥' : '≤'} {a.target}</span>
                  {a.triggered && <span style={{ fontSize: 11, color: '#34c759', marginLeft: 2 }}>✓ {ui.triggered}</span>}
                  <button onClick={() => handleDelete(a.id)} style={{ marginLeft: 'auto', width: 22, height: 22, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)', color: 'var(--color-text-faint)' }}>
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// Background checker — call once on app mount
export function useAlertChecker() {
  useEffect(() => {
    if (Notification.permission !== 'granted') return
    const check = () => checkAlerts()
    check()
    const interval = setInterval(check, 30 * 60 * 1000)
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') check() })
    return () => clearInterval(interval)
  }, [])
}
