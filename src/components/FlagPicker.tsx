import { useState, useEffect, useRef } from 'react'
import { CURRENCIES, type Currency } from '../data/currencies'

interface Props {
  excludeCodes: string[]
  highlightCode?: string
  title: string
  onPick: (code: string) => void
  onClose: () => void
  isDark: boolean
}

function FlagImg({ countryCode, fallback }: { countryCode?: string; fallback: string }) {
  const [failed, setFailed] = useState(false)
  if (!countryCode || failed) return <span style={{ fontSize: 20, lineHeight: 1 }}>{fallback}</span>
  return (
    <img src={`https://flagcdn.com/w40/${countryCode}.png`} srcSet={`https://flagcdn.com/w80/${countryCode}.png 2x`}
      alt="" width={28} height={21} loading="lazy"
      style={{ borderRadius: 4, objectFit: 'cover', display: 'block', flexShrink: 0 }}
      onError={() => setFailed(true)} />
  )
}

export function FlagPicker({ excludeCodes, highlightCode, title, onPick, onClose, isDark }: Props) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50)
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const q = query.toLowerCase()
  const filtered: Currency[] = CURRENCIES
    .filter(c => !excludeCodes.includes(c.code))
    .filter(c => !q || c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q))
    .sort((a, b) => a.code.localeCompare(b.code))

  const bg = isDark ? '#16161e' : '#ffffff'
  const border = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  const inputBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'
  const hoverBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'
  const closeBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="sheet-enter"
        style={{
          width: '100%', maxWidth: 480,
          backgroundColor: bg,
          border: `1px solid ${border}`,
          borderRadius: '20px 20px 0 0',
          display: 'flex', flexDirection: 'column',
          maxHeight: '82vh', overflow: 'hidden',
        }}
      >
        {/* Pill handle */}
        <div style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.15)', margin: '12px auto 0' }} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px 12px', borderBottom: `1px solid ${border}`, flexShrink: 0 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{ width: 32, height: 32, borderRadius: 10, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: closeBg, color: 'var(--color-text-dim)', flexShrink: 0 }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: '10px 16px 8px', flexShrink: 0 }}>
          <input
            ref={inputRef} value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search currency..."
            style={{
              width: '100%', boxSizing: 'border-box',
              backgroundColor: inputBg,
              color: 'var(--color-text)',
              border: `1px solid ${border}`,
              borderRadius: 12, padding: '10px 14px',
              fontSize: 15, outline: 'none',
            }}
          />
        </div>

        {/* List */}
        <div style={{ overflowY: 'auto', padding: '4px 10px 16px', flex: 1 }}>
          {filtered.map(c => (
            <button
              key={c.code}
              onClick={() => onPick(c.code)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                padding: '9px 12px', borderRadius: 12, textAlign: 'left', border: 'none', cursor: 'pointer',
                backgroundColor: c.code === highlightCode ? 'rgba(255,149,0,0.10)' : 'transparent',
                outline: c.code === highlightCode ? '1px solid rgba(255,149,0,0.4)' : 'none',
                outlineOffset: -1,
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => { if (c.code !== highlightCode) (e.currentTarget as HTMLButtonElement).style.backgroundColor = hoverBg }}
              onMouseLeave={e => { if (c.code !== highlightCode) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent' }}
            >
              {/* Flag — fixed width */}
              <div style={{ width: 32, display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
                <FlagImg countryCode={c.countryCode} fallback={c.flag} />
              </div>
              {/* Code — fixed width */}
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)', width: 46, flexShrink: 0 }}>{c.code}</span>
              {/* Name */}
              <span style={{ fontSize: 13, color: 'var(--color-text-dim)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
            </button>
          ))}
          {filtered.length === 0 && (
            <p style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-faint)' }}>No results</p>
          )}
        </div>
      </div>
    </div>
  )
}
