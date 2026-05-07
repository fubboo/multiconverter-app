import { useState } from 'react'
import type { Currency } from '../data/currencies'
import { formatAmount, type DecimalMode } from '../lib/formatters'

interface Props {
  currency: Currency
  isBase: boolean
  rawExpression: string
  computedValue: number
  decimalMode: DecimalMode
  onSelectBase: () => void
  onEditFlag: () => void
  onRemove?: () => void
  showRemove?: boolean
}

function FlagImage({ countryCode, fallback }: { countryCode?: string; fallback: string }) {
  const [failed, setFailed] = useState(false)
  if (!countryCode || failed) return <span className="text-[16px] leading-none">{fallback}</span>
  return (
    <img
      src={`https://flagcdn.com/w40/${countryCode}.png`}
      srcSet={`https://flagcdn.com/w80/${countryCode}.png 2x`}
      alt="" width={24} height={18} loading="lazy"
      className="rounded-[3px] object-cover block"
      onError={() => setFailed(true)}
    />
  )
}

export function CurrencyCard({ currency, isBase, rawExpression, computedValue, decimalMode, onSelectBase, onEditFlag, onRemove, showRemove }: Props) {
  const display = isBase ? (rawExpression || '0') : formatAmount(computedValue, currency.code, decimalMode)

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelectBase}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectBase() } }}
      style={isBase ? {
        background: 'rgba(255,149,0,0.1)',
        border: '1.5px solid var(--color-accent)',
        boxShadow: '0 0 20px rgba(255,149,0,0.1)',
      } : {
        background: 'var(--color-card-bg)',
        border: '1px solid var(--color-card-border)',
      }}
      className="rounded-xl px-3 py-2.5 flex items-center gap-3 cursor-pointer transition-all duration-150 select-none hover:brightness-110 active:scale-[0.99] relative"
    >
      <button
        onClick={(e) => { e.stopPropagation(); onEditFlag() }}
        aria-label={`Change ${currency.code}`}
        style={{ background: 'rgba(0,0,0,0.2)' }}
        className="flex items-center gap-2 rounded-full px-2.5 py-1.5 transition-all hover:bg-black/30 active:scale-95 shrink-0"
      >
        <FlagImage countryCode={currency.countryCode} fallback={currency.flag} />
        <span className="font-semibold text-[13px] tracking-wide" style={{ color: 'var(--color-text)' }}>{currency.code}</span>
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4, color: 'var(--color-text)' }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      <div
        className={`flex-1 min-w-0 text-right leading-none truncate tabular ${isBase ? 'text-[28px] font-bold' : 'text-[22px] font-semibold'}`}
        style={{ color: isBase ? 'var(--color-text)' : 'var(--color-text-dim)' }}
      >
        {display}
      </div>

      {showRemove && onRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove() }}
          className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center shadow-lg"
          style={{ backgroundColor: 'var(--color-danger)' }}
        >✕</button>
      )}
    </div>
  )
}
