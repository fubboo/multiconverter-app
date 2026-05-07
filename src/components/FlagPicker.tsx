import { useState, useEffect, useRef } from 'react'
import { CURRENCIES, type Currency } from '../data/currencies'

interface Props {
  excludeCodes: string[]
  highlightCode?: string
  title: string
  onPick: (code: string) => void
  onClose: () => void
}

function FlagImg({ countryCode, fallback }: { countryCode?: string; fallback: string }) {
  const [failed, setFailed] = useState(false)
  if (!countryCode || failed) return <span className="text-[18px]">{fallback}</span>
  return (
    <img src={`https://flagcdn.com/w40/${countryCode}.png`} srcSet={`https://flagcdn.com/w80/${countryCode}.png 2x`}
      alt="" width={26} height={20} loading="lazy"
      className="rounded-[3px] object-cover" onError={() => setFailed(true)} />
  )
}

export function FlagPicker({ excludeCodes, highlightCode, title, onPick, onClose }: Props) {
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="sheet-enter w-full max-w-md rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden"
        style={{ backgroundColor: '#111118', border: '1px solid rgba(255,255,255,0.08)', maxHeight: '80vh' }}
      >
        <div className="px-4 pt-4 pb-3 flex items-center justify-between shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>{title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-lg" style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: 'var(--color-text)' }}>✕</button>
        </div>
        <div className="px-3 py-2.5 shrink-0">
          <input
            ref={inputRef} value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search currency..."
            className="w-full px-3 py-2.5 rounded-xl text-[15px]"
            style={{ backgroundColor: 'rgba(255,255,255,0.07)', color: 'var(--color-text)', border: '1px solid rgba(255,255,255,0.1)' }}
          />
        </div>
        <div className="overflow-y-auto flex flex-col px-3 pb-4 gap-1">
          {filtered.map(c => (
            <button
              key={c.code}
              onClick={() => onPick(c.code)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all hover:bg-white/[0.06] active:scale-[0.99]"
              style={c.code === highlightCode ? { backgroundColor: 'rgba(255,149,0,0.1)', outline: '1px solid rgba(255,149,0,0.4)', outlineOffset: '-1px' } : {}}
            >
              <FlagImg countryCode={c.countryCode} fallback={c.flag} />
              <span className="font-semibold text-[14px]" style={{ color: 'var(--color-text)' }}>{c.code}</span>
              <span className="text-[13px] truncate" style={{ color: 'var(--color-text-dim)' }}>{c.name}</span>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="text-center py-8" style={{ color: 'var(--color-text-faint)' }}>No results</p>
          )}
        </div>
      </div>
    </div>
  )
}
