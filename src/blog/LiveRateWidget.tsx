import { useEffect, useState } from 'react'
import { animate, motion } from 'framer-motion'
import { useExchangeRates } from '../hooks/useExchangeRates'
import { getCurrencyOrFallback } from '../data/currencies'

function Flag({ code }: { code: string }) {
  const cur = getCurrencyOrFallback(code)
  const [failed, setFailed] = useState(false)
  if (!cur.countryCode || failed) return <span style={{ fontSize: 20 }}>{cur.flag}</span>
  return (
    <img src={`https://flagcdn.com/w40/${cur.countryCode}.png`} srcSet={`https://flagcdn.com/w80/${cur.countryCode}.png 2x`}
      alt="" width={26} height={20} loading="lazy" onError={() => setFailed(true)}
      style={{ borderRadius: 4, objectFit: 'cover', display: 'block' }} />
  )
}

// Dynamic, animated live exchange-rate card used inside blog posts.
export function LiveRateWidget({ base, quote, isDark }: { base: string; quote: string; isDark: boolean }) {
  const { rates } = useExchangeRates(base)
  const rate = rates[quote] ?? null
  const [display, setDisplay] = useState<string | null>(null)

  useEffect(() => {
    if (rate == null) return
    const dp = rate < 100 ? 4 : 2
    const controls = animate(0, rate, {
      duration: 1.1,
      ease: [0.2, 0.7, 0.3, 1],
      onUpdate: v => setDisplay(v.toFixed(dp)),
    })
    return () => controls.stop()
  }, [rate])

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5 }}
      style={{
        margin: '28px 0', padding: '22px 24px', borderRadius: 18,
        backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.75)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.08)'}`,
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#34c759', display: 'block', boxShadow: '0 0 0 0 rgba(52,199,89,0.6)', animation: 'lr-pulse 1.8s infinite' }} />
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-dim)' }}>Live rate</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 18, fontWeight: 700, color: 'var(--color-text)' }}>
          <Flag code={base} /> 1 {base}
        </span>
        <span style={{ fontSize: 18, color: 'var(--color-text-faint)' }}>=</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
          <span className="tabular" style={{ fontSize: 34, fontWeight: 800, color: 'var(--color-accent)', letterSpacing: '-0.5px', lineHeight: 1 }}>
            {display ?? '—'}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 18, fontWeight: 700, color: 'var(--color-text)' }}>
            <Flag code={quote} /> {quote}
          </span>
        </span>
      </div>
      <p style={{ fontSize: 12, color: 'var(--color-text-faint)', margin: '14px 0 0' }}>
        Mid-market rate · updated daily · for reference only
      </p>
    </motion.div>
  )
}
