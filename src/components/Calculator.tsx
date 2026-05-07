import { useEffect } from 'react'
import { safeEvaluate, endsWithOperator } from '../lib/calculator'

interface Props {
  amount: string
  setAmount: (s: string) => void
}

type KeyDef = { key: string; label: string; variant: 'num' | 'op' | 'fn' | 'eq'; span?: 2 }

const KEYS: KeyDef[] = [
  { key: 'C', label: 'AC', variant: 'fn' },
  { key: 'BACK', label: '⌫', variant: 'fn' },
  { key: 'PCT', label: '%', variant: 'fn' },
  { key: '÷', label: '÷', variant: 'op' },
  { key: '7', label: '7', variant: 'num' },
  { key: '8', label: '8', variant: 'num' },
  { key: '9', label: '9', variant: 'num' },
  { key: '×', label: '×', variant: 'op' },
  { key: '4', label: '4', variant: 'num' },
  { key: '5', label: '5', variant: 'num' },
  { key: '6', label: '6', variant: 'num' },
  { key: '−', label: '−', variant: 'op' },
  { key: '1', label: '1', variant: 'num' },
  { key: '2', label: '2', variant: 'num' },
  { key: '3', label: '3', variant: 'num' },
  { key: '+', label: '+', variant: 'op' },
  { key: '0', label: '0', variant: 'num', span: 2 },
  { key: '.', label: '.', variant: 'num' },
  { key: 'EQ', label: '=', variant: 'eq' },
]

export function Calculator({ amount, setAmount }: Props) {
  const press = (key: string, variant: KeyDef['variant']) => {
    if (key === 'C') return setAmount('0')
    if (key === 'BACK') {
      return setAmount(amount.length <= 1 ? '0' : amount.slice(0, -1))
    }
    if (key === 'PCT') {
      const lastOpIdx = Math.max(
        amount.lastIndexOf('+'), amount.lastIndexOf('−'),
        amount.lastIndexOf('×'), amount.lastIndexOf('÷'),
      )
      if (lastOpIdx > 0) {
        const base = amount.slice(0, lastOpIdx)
        const op = amount[lastOpIdx]
        const tailNum = parseFloat(amount.slice(lastOpIdx + 1))
        const baseVal = safeEvaluate(base)
        if (baseVal != null && !isNaN(tailNum)) {
          const pctVal = (baseVal * tailNum) / 100
          const result = safeEvaluate(base + op + pctVal.toString())
          if (result != null) return setAmount(strip(result.toString()))
        }
      }
      const v = safeEvaluate(amount)
      if (v !== null) return setAmount(strip((v / 100).toString()))
      return
    }
    if (key === 'EQ') {
      const v = safeEvaluate(amount)
      return setAmount(v !== null ? strip(v.toString()) : '0')
    }
    if (variant === 'op') {
      if (amount === '0' && key !== '−') return
      if (endsWithOperator(amount)) return setAmount(amount.slice(0, -1) + key)
      return setAmount(amount + key)
    }
    if (key === '.') {
      const segs = amount.split(/[+\-−×÷]/)
      const last = segs[segs.length - 1]
      if (last.includes('.')) return
      if (last === '') return setAmount(amount + '0.')
      return setAmount(amount + '.')
    }
    return setAmount(amount === '0' ? key : amount + key)
  }

  // Physical keyboard support
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return
      const { key } = e
      if (key >= '0' && key <= '9') { e.preventDefault(); press(key, 'num') }
      else if (key === '.') { e.preventDefault(); press('.', 'num') }
      else if (key === '+') { e.preventDefault(); press('+', 'op') }
      else if (key === '-') { e.preventDefault(); press('−', 'op') }
      else if (key === '*') { e.preventDefault(); press('×', 'op') }
      else if (key === '/') { e.preventDefault(); press('÷', 'op') }
      else if (key === '%') { e.preventDefault(); press('PCT', 'fn') }
      else if (key === 'Enter' || key === '=') { e.preventDefault(); press('EQ', 'eq') }
      else if (key === 'Backspace') { e.preventDefault(); press('BACK', 'fn') }
      else if (key === 'Escape' || key === 'c' || key === 'C') { e.preventDefault(); press('C', 'fn') }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [amount]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="grid grid-cols-4 gap-2 pt-2">
      {KEYS.map((def) => (
        <button
          key={def.key}
          onClick={() => press(def.key, def.variant)}
          style={btnStyle(def.variant)}
          className={`${def.span === 2 ? 'col-span-2' : ''} h-[56px] rounded-xl text-[22px] font-medium transition-all active:scale-95 hover:brightness-110`}
        >
          {def.label}
        </button>
      ))}
    </div>
  )
}

function btnStyle(v: KeyDef['variant']): React.CSSProperties {
  if (v === 'op' || v === 'eq') return { backgroundColor: 'var(--color-accent)', color: '#fff' }
  if (v === 'fn') return { backgroundColor: 'var(--color-calc-fn-bg)', color: 'var(--color-calc-fn-text)' }
  return { backgroundColor: 'var(--color-calc-num-bg)', color: 'var(--color-calc-num-text)' }
}

function strip(s: string): string {
  if (!s.includes('.')) return s
  return s.replace(/\.?0+$/, '') || '0'
}
