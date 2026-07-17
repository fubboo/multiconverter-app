import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, Reorder, useDragControls } from 'framer-motion'
import { FlagPicker } from './components/FlagPicker'
import { RateHistorySection } from './components/RateHistorySection'
import { RateAlertModal, useAlertChecker } from './components/RateAlert'
import { useExchangeRates } from './hooks/useExchangeRates'
import { usePersistentState } from './hooks/usePersistentState'
import { getCurrencyOrFallback } from './data/currencies'
import { effectiveDecimals, formatAmount, formatRelativeDate, type DecimalMode } from './lib/formatters'
import { safeEvaluate } from './lib/calculator'
import { useT, useUI, useLang } from './i18n/LangContext'
import { LANGS } from './i18n/translations'
import { setLangChoice } from './i18n/langPref'
import { usePageMeta } from './lib/usePageMeta'

// ─── Constants ───────────────────────────────────────────────────────────────

const DEFAULT_CODES = ['USD', 'EUR', 'AZN', 'GBP', 'TRY', 'JPY']
const MAX_SLOTS = 12
const PLAY_URL = 'https://play.google.com/store/apps/details?id=multiconverter.app'
const DOWNLOAD_LABEL: Record<string, string> = { en: 'Download', es: 'Descargar', fr: 'Télécharger', de: 'Herunterladen', pt: 'Baixar' }
const DECIMAL_OPTIONS: DecimalMode[] = ['auto', 0, 2, 4]
const REVIEW_AVATARS = [
  { initials: 'JD', bg: '#4a9eff' },
  { initials: 'SM', bg: '#ff6b9d' },
  { initials: 'AK', bg: '#34c759' },
  { initials: 'RB', bg: '#ff9500' },
  { initials: 'OT', bg: '#af52de' },
]
const OPERATORS = ['+', '−', '×', '÷'] as const

type PickerMode = { kind: 'closed' } | { kind: 'edit'; slotIndex: number } | { kind: 'add' }

function strip(s: string): string {
  if (!s.includes('.')) return s
  return s.replace(/\.?0+$/, '') || '0'
}

// Round float noise (110.00000000000001 → 110) and avoid exponential
// notation, since the expression evaluator can't parse "1e-7".
function numToStr(n: number): string {
  const c = parseFloat(n.toFixed(10))
  if (c !== 0 && Math.abs(c) < 1e-6) {
    return c.toFixed(10).replace(/0+$/, '').replace(/\.$/, '')
  }
  return c.toString()
}


// ─── FlagImg ─────────────────────────────────────────────────────────────────

function FlagImg({ countryCode, fallback, size = 32 }: { countryCode?: string; fallback: string; size?: number }) {
  const [failed, setFailed] = useState(false)
  if (!countryCode || failed) return <span style={{ fontSize: 22, lineHeight: 1 }}>{fallback}</span>
  return (
    <img
      src={`https://flagcdn.com/w40/${countryCode}.png`}
      srcSet={`https://flagcdn.com/w80/${countryCode}.png 2x`}
      alt="" width={size} height={Math.round(size * 0.75)} loading="lazy"
      style={{ borderRadius: 4, objectFit: 'cover', display: 'block', flexShrink: 0 }}
      onError={() => setFailed(true)}
    />
  )
}

// ─── SplitAmount — dims the decimal part ─────────────────────────────────────

function SplitAmount({ text }: { text: string }) {
  const dotIdx = text.indexOf('.')
  if (dotIdx === -1) return <>{text}</>
  return (
    <>
      {text.slice(0, dotIdx)}
      <span style={{ opacity: 0.38 }}>{text.slice(dotIdx)}</span>
    </>
  )
}

// ─── AnimatedHeadline ────────────────────────────────────────────────────────

function AnimatedHeadline() {
  const t = useT()
  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.09, delayChildren: 0.2 } },
  }
  const wordAnim = {
    hidden: { opacity: 0, y: 26 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] as [number, number, number, number] } },
  }

  const gradient = { background: 'linear-gradient(90deg, #ff9500 0%, #ffb84d 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' } as const

  return (
    <motion.h1
      variants={container}
      initial="hidden"
      animate="visible"
      style={{
        fontSize: 'clamp(42px, 6.5vw, 68px)',
        fontWeight: 800,
        lineHeight: 1.08,
        letterSpacing: '-2px',
        color: 'var(--color-text)',
        marginBottom: 24,
        textAlign: 'center',
      }}
    >
      <span style={{ display: 'block' }}>
        {t.hPre.split(' ').map((w, i) => (
          <motion.span key={i} variants={wordAnim} style={{ display: 'inline-block', marginRight: '0.27em' }}>
            {w}
          </motion.span>
        ))}
      </span>
      <span style={{ display: 'block' }}>
        {t.hAccent.split(' ').map((w, i) => (
          <motion.span key={i} variants={wordAnim} style={{ display: 'inline-block', marginRight: '0.27em', paddingBottom: '0.12em', ...gradient }}>
            {w}
          </motion.span>
        ))}
      </span>
      <span style={{ display: 'block' }}>
        {t.hPost.split(' ').map((w, i) => (
          <motion.span key={i} variants={wordAnim} style={{ display: 'inline-block', marginRight: '0.27em' }}>
            {w}
          </motion.span>
        ))}
      </span>
    </motion.h1>
  )
}

// ─── LegalModal ──────────────────────────────────────────────────────────────

function LegalModal({ type, isDark, onClose }: { type: 'privacy' | 'terms'; isDark: boolean; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const content = type === 'privacy' ? {
    title: 'Privacy Policy',
    updated: 'Last updated: June 2, 2026',
    sections: [
      { heading: 'Overview', body: 'Multi Converter ("the App") is operated by fubboo. We are committed to protecting your privacy. This policy explains what data the App does and does not collect.' },
      { heading: 'Data We Do Not Collect', body: 'We do not collect any personal information. The App does not require you to create an account, log in, or provide any personal details. We do not use analytics, tracking pixels, advertising SDKs, or any third-party data collection tools.' },
      { heading: 'Data Stored Locally on Your Device', body: 'The App stores the following data locally on your device using browser localStorage:\n• Your selected currencies and base currency\n• Your decimal precision preference\n• Your theme preference (dark/light)\n• Cached exchange rates (updated daily)\n\nThis data never leaves your device and is not transmitted to us or any third party.' },
      { heading: 'Exchange Rate API', body: 'To fetch live exchange rates, the App connects to a public, free API (cdn.jsdelivr.net / currency-api.pages.dev). This connection may expose your IP address to the CDN provider as part of a normal HTTP request. We have no access to this data.' },
      { heading: 'Flag Images', body: 'Country flag images are loaded from flagcdn.com, a public CDN. Your IP address may be visible to this service as part of loading the images.' },
      { heading: 'Children\'s Privacy', body: 'The App does not knowingly collect data from children under 13. Since we collect no personal data at all, the App is safe for all ages.' },
      { heading: 'Changes to This Policy', body: 'If we make material changes to this policy, we will update the "Last updated" date above. Continued use of the App constitutes acceptance of any changes.' },
      { heading: 'Contact', body: 'For any privacy-related questions, contact us at: hello@multiconverter.app' },
    ],
  } : {
    title: 'Terms of Use',
    updated: 'Last updated: June 2, 2026',
    sections: [
      { heading: 'Acceptance', body: 'By using Multi Converter ("the App"), you agree to these Terms. If you do not agree, please stop using the App.' },
      { heading: 'Use of the App', body: 'The App is provided free of charge for personal, non-commercial use. You may not reverse-engineer, copy, distribute, or create derivative works from the App without explicit permission from fubboo.' },
      { heading: 'Exchange Rates Disclaimer', body: 'Exchange rates displayed in the App are sourced from a free public dataset and are updated approximately once per day. Rates are provided for informational purposes only and should not be used as a basis for financial transactions. Always verify rates with your bank or financial institution before making decisions.' },
      { heading: 'No Financial Advice', body: 'The App is a currency conversion tool only. Nothing in the App constitutes financial, investment, or legal advice.' },
      { heading: 'Limitation of Liability', body: 'The App is provided "as is" without warranties of any kind. fubboo shall not be liable for any losses or damages arising from the use of the App or reliance on its exchange rate data.' },
      { heading: 'Availability', body: 'We reserve the right to modify, suspend, or discontinue the App at any time without notice.' },
      { heading: 'Contact', body: 'For any questions about these Terms, contact us at: hello@multiconverter.app' },
    ],
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0 0 0 0' }}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }} />
      {/* Sheet */}
      <div
        className="sheet-enter"
        onClick={e => e.stopPropagation()}
        style={{
          position: 'relative', zIndex: 1, width: '100%', maxWidth: 640,
          maxHeight: '88vh', overflowY: 'auto',
          backgroundColor: isDark ? '#111116' : '#ffffff',
          borderRadius: '20px 20px 0 0',
          padding: '0 0 40px',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.4)',
        }}
      >
        {/* Handle + header */}
        <div style={{ position: 'sticky', top: 0, backgroundColor: isDark ? '#111116' : '#ffffff', padding: '14px 24px 12px', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`, zIndex: 1 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.15)', margin: '0 auto 14px' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: 'var(--color-text)' }}>{content.title}</h2>
              <p style={{ fontSize: 11, color: 'var(--color-text-faint)', margin: '3px 0 0' }}>{content.updated}</p>
            </div>
            <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-dim)', fontFamily: 'inherit', fontSize: 16 }}>✕</button>
          </div>
        </div>
        {/* Content */}
        <div style={{ padding: '20px 24px 0' }}>
          {content.sections.map(({ heading, body }) => (
            <div key={heading} style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-accent)', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{heading}</h3>
              <p style={{ fontSize: 14, color: 'var(--color-text-dim)', lineHeight: 1.65, margin: 0, whiteSpace: 'pre-line' }}>{body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── SocialProof ─────────────────────────────────────────────────────────────

function SocialProof({ onClick }: { onClick?: () => void }) {
  const t = useT()
  return (
    <motion.button
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.75, duration: 0.5 }}
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 14, justifyContent: 'center',
        marginBottom: 32, background: 'none', cursor: onClick ? 'pointer' : 'default',
        padding: '8px 14px', borderRadius: 14,
        transition: 'background 0.15s',
      }}
      whileHover={onClick ? { scale: 1.02 } : {}}
      title={onClick ? 'Coming soon on App Store & Google Play' : undefined}
    >
      <div style={{ display: 'flex' }}>
        {REVIEW_AVATARS.map((a, i) => (
          <div key={i} style={{
            width: 38, height: 38, borderRadius: '50%',
            backgroundColor: a.bg, marginLeft: i > 0 ? -12 : 0,
            border: '2.5px solid var(--color-bg)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 800, color: 'white', flexShrink: 0,
          }}>{a.initials}</div>
        ))}
      </div>
      <div style={{ textAlign: 'left' }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)', margin: '0 0 1px', whiteSpace: 'nowrap' }}>
          {t.early1}
        </p>
        <p style={{ fontSize: 12.5, color: 'var(--color-text-dim)', whiteSpace: 'nowrap', margin: 0 }}>
          {t.early2}
        </p>
      </div>
    </motion.button>
  )
}

// ─── DraggableRow ─────────────────────────────────────────────────────────────

interface RowProps {
  code: string
  isBase: boolean
  amount: string
  computedValue: number
  decimalMode: DecimalMode
  isDark: boolean
  canRemove: boolean
  copied: string | null
  onSelectBase: () => void
  onEditCurrency: () => void
  onRemove: () => void
  onAmountChange?: (v: string) => void
  onCopy: (code: string, text: string) => void
  onEnter?: () => void
}

function DraggableRow(props: RowProps) {
  const { code, isBase, amount, computedValue, decimalMode, isDark, canRemove,
    copied, onSelectBase, onEditCurrency, onRemove, onAmountChange, onCopy, onEnter } = props
  const ui = useUI()
  const controls = useDragControls()
  const [rowHover, setRowHover] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const currency = getCurrencyOrFallback(code)
  const displayText = isBase ? (amount || '0') : formatAmount(computedValue, code, decimalMode)

  useEffect(() => {
    if (isBase && inputRef.current && document.activeElement !== inputRef.current) {
      inputRef.current.focus()
    }
  }, [isBase])

  return (
    <Reorder.Item
      value={code}
      dragListener={false}
      dragControls={controls}
      style={{ listStyle: 'none', position: 'relative' }}
      whileDrag={{ scale: 1.015, zIndex: 20, boxShadow: isDark ? '0 8px 40px rgba(0,0,0,0.5)' : '0 8px 32px rgba(0,0,0,0.15)' }}
    >
      <div
        onMouseEnter={() => setRowHover(true)}
        onMouseLeave={() => setRowHover(false)}
        onClick={isBase ? undefined : onSelectBase}
        style={{
          display: 'flex', alignItems: 'center',
          paddingLeft: 28, paddingRight: 20, paddingTop: 15, paddingBottom: 15,
          borderBottom: '1px solid var(--row-border)',
          backgroundColor: isBase ? 'var(--row-active-bg)' : (rowHover && !isBase ? (isDark ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.02)') : 'transparent'),
          cursor: isBase ? 'default' : 'pointer',
          transition: 'background-color 0.12s',
          position: 'relative', gap: 12,
        }}
      >
        {/* Drag handle */}
        <button
          onPointerDown={(e) => { e.preventDefault(); controls.start(e) }}
          onClick={(e) => e.stopPropagation()}
          aria-label={ui.dragToReorder}
          style={{
            position: 'absolute', left: 2, top: '50%', transform: 'translateY(-50%)',
            cursor: 'grab', touchAction: 'none', padding: '12px 9px',
            opacity: rowHover ? 0.5 : 0.12, transition: 'opacity 0.15s',
            color: 'var(--color-text)',
          }}
        >
          <svg width="10" height="16" viewBox="0 0 10 16" fill="currentColor">
            <circle cx="3" cy="2.5" r="1.5" /><circle cx="7" cy="2.5" r="1.5" />
            <circle cx="3" cy="8" r="1.5" /><circle cx="7" cy="8" r="1.5" />
            <circle cx="3" cy="13.5" r="1.5" /><circle cx="7" cy="13.5" r="1.5" />
          </svg>
        </button>

        {/* Flag + currency info */}
        <button
          onClick={(e) => { e.stopPropagation(); onEditCurrency() }}
          style={{
            display: 'flex', alignItems: 'center', gap: 11,
            borderRadius: 10, padding: '5px 10px', marginLeft: -6,
            background: rowHover ? (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)') : 'transparent',
            transition: 'background 0.12s', flexShrink: 0, minWidth: 146,
          }}
        >
          <FlagImg countryCode={currency.countryCode} fallback={currency.flag} size={34} />
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.25, color: 'var(--color-text)' }}>{code}</div>
            <div style={{ fontSize: 11, lineHeight: 1.25, color: 'var(--color-text-dim)', maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currency.name}</div>
          </div>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
            style={{ opacity: 0.28, color: 'var(--color-text)', flexShrink: 0 }}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {/* Remove button — inline, gray, next to currency selector */}
        {rowHover && canRemove && (
          <button
            onClick={(e) => { e.stopPropagation(); onRemove() }}
            aria-label={`${ui.removeCurrency} ${code}`}
            style={{
              width: 28, height: 28, borderRadius: 7, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
              color: 'var(--color-text-faint)',
              fontSize: 13, fontWeight: 700,
              marginLeft: -4,
            }}
          >×</button>
        )}

        <div style={{ flex: 1 }} />

        {/* Amount */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, maxWidth: '52%' }}>
          {isBase ? (
            <input
              ref={inputRef}
              type="text"
              inputMode="decimal"
              maxLength={40}
              aria-label={ui.amountLabel}
              value={amount}
              onChange={e => {
                const v = e.target.value
                if (v === '' || /^[\d.+\-×÷]*$/.test(v)) onAmountChange?.(v)
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') { e.preventDefault(); onEnter?.() }
              }}
              onClick={e => e.stopPropagation()}
              style={{
                background: 'transparent', border: 'none', outline: 'none',
                textAlign: 'right', fontSize: 28, fontWeight: 700,
                color: 'var(--color-text)', width: '100%',
                caretColor: 'var(--color-accent)',
                fontVariantNumeric: 'tabular-nums', fontFeatureSettings: '"tnum"',
              }}
            />
          ) : (
            <>
              <span style={{
                fontSize: 24, fontWeight: 600, color: 'var(--color-text-secondary)',
                fontVariantNumeric: 'tabular-nums', fontFeatureSettings: '"tnum"',
                textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
              }}>
                <SplitAmount text={displayText} />
              </span>
              {/* Copy button — always visible */}
              <button
                onClick={(e) => { e.stopPropagation(); onCopy(code, displayText) }}
                aria-label={copied === code ? ui.copied : `${ui.copyAmount} ${code}`}
                style={{
                  width: 26, height: 26, borderRadius: 7, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
                  opacity: copied === code ? 1 : 0.45,
                  transition: 'opacity 0.15s, color 0.15s',
                  color: copied === code ? '#34c759' : 'var(--color-text-dim)',
                }}
              >
                {copied === code ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                ) : (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                )}
              </button>
            </>
          )}
        </div>

      </div>
    </Reorder.Item>
  )
}

// ─── NavBtn ───────────────────────────────────────────────────────────────────

function NavBtn({ children, onClick, disabled, isDark, label }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean; isDark: boolean; label: string }) {
  return (
    <button onClick={onClick} disabled={disabled} aria-label={label} style={{
      width: 32, height: 32, borderRadius: '50%',
      backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      opacity: disabled ? 0.4 : 1, color: 'var(--color-text-dim)', transition: 'all 0.15s',
    }}>
      {children}
    </button>
  )
}

// ─── LangSwitcher ─────────────────────────────────────────────────────────────

function LangSwitcher({ isDark }: { isDark: boolean }) {
  const { lang } = useLang()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])
  const current = LANGS.find(l => l.code === lang) ?? LANGS[0]
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} aria-label="Language" style={{
        display: 'flex', alignItems: 'center', gap: 5, height: 32, padding: '0 10px', borderRadius: 16,
        backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)', color: 'var(--color-text-dim)', fontSize: 13, fontWeight: 600,
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
        {current.code.toUpperCase()}
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 100,
          backgroundColor: isDark ? '#16161e' : '#ffffff', border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
          borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.25)', overflow: 'hidden', minWidth: 150, padding: 5,
        }}>
          {LANGS.map(l => (
            <Link key={l.code} to={l.code === 'en' ? '/' : `/${l.code}`} onClick={() => { setLangChoice(l.code); setOpen(false) }}
              style={{
                display: 'block', padding: '8px 12px', borderRadius: 8, fontSize: 13, textDecoration: 'none',
                color: l.code === lang ? 'var(--color-accent)' : 'var(--color-text)',
                backgroundColor: l.code === lang ? 'rgba(255,149,0,0.1)' : 'transparent', fontWeight: l.code === lang ? 700 : 500,
              }}>
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── FeaturesSection ─────────────────────────────────────────────────────────

const FEATURES: { title: string; desc: string; path: string }[] = [
  { title: '100+ currencies', desc: 'Every major and minor world currency, each with its country flag.', path: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM2 12h20M12 2c2.5 2.7 4 6.3 4 10s-1.5 7.3-4 10c-2.5-2.7-4-6.3-4-10s1.5-7.3 4-10z' },
  { title: 'Live daily rates', desc: 'Mid-market exchange rates refreshed every day from a trusted public source.', path: 'M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15' },
  { title: 'Convert many at once', desc: 'See all your currencies update together as you type — not just one pair.', path: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z' },
  { title: 'Built-in calculator', desc: 'Add, subtract, multiply, divide and apply percentages right inside the converter.', path: 'M4 2h16a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM8 6h8M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M8 18h8' },
  { title: 'Works offline', desc: 'The latest rates are cached on your device, so you can convert without internet.', path: 'M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01' },
  { title: 'No ads, no tracking', desc: 'No accounts, no analytics, no advertising. Free forever and private by design.', path: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
]

function FeaturesSection({ isDark }: { isDark: boolean }) {
  const t = useT()
  return (
    <section style={{ maxWidth: 920, margin: '0 auto', width: '100%', padding: '80px 16px 0' }}>
      <motion.h2
        initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5 }}
        style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, letterSpacing: '-1px', textAlign: 'center', color: 'var(--color-text)', marginBottom: 12 }}
      >
        {t.featTitle}
      </motion.h2>
      <p style={{ textAlign: 'center', color: 'var(--color-text-dim)', fontSize: 16, maxWidth: 480, margin: '0 auto 44px', lineHeight: 1.6 }}>
        {t.featSub}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(248px, 1fr))', gap: 16 }}>
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.45, delay: (i % 3) * 0.08 }}
            style={{
              padding: '22px 22px 24px', borderRadius: 18,
              backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.7)',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'}`,
            }}
          >
            <div style={{
              width: 42, height: 42, borderRadius: 12, marginBottom: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backgroundColor: isDark ? 'rgba(255,149,0,0.12)' : 'rgba(255,149,0,0.1)',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={f.path} />
              </svg>
            </div>
            <h3 style={{ fontSize: 16.5, fontWeight: 700, color: 'var(--color-text)', margin: '0 0 7px' }}>{t.features[i].title}</h3>
            <p style={{ fontSize: 14, color: 'var(--color-text-dim)', lineHeight: 1.6, margin: 0 }}>{t.features[i].desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

// ─── FaqSection ──────────────────────────────────────────────────────────────

function FaqSection({ isDark }: { isDark: boolean }) {
  const t = useT()
  return (
    <section id="faq" style={{ maxWidth: 720, margin: '0 auto', width: '100%', padding: '80px 16px 0', scrollMarginTop: 70 }}>
      <motion.h2
        initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5 }}
        style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, letterSpacing: '-1px', textAlign: 'center', color: 'var(--color-text)', marginBottom: 14 }}
      >
        {t.faqTitle}
      </motion.h2>
      <p style={{ textAlign: 'center', color: 'var(--color-text-dim)', fontSize: 16, maxWidth: 520, margin: '0 auto 40px', lineHeight: 1.6 }}>
        {t.faqIntro}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {t.faqs.map((f, i) => (
          <motion.div
            key={f.q}
            initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.4, delay: (i % 4) * 0.05 }}
            style={{
              padding: '18px 22px', borderRadius: 16,
              backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.7)',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'}`,
            }}
          >
            <h3 style={{ fontSize: 15.5, fontWeight: 700, color: 'var(--color-text)', margin: '0 0 6px' }}>{f.q}</h3>
            <p style={{ fontSize: 14.5, color: 'var(--color-text-dim)', lineHeight: 1.65, margin: 0 }}>{f.a}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

// ─── PopularConversions ──────────────────────────────────────────────────────

const POPULAR_PAIRS: [string, string][] = [
  ['USD', 'EUR'], ['EUR', 'USD'], ['USD', 'GBP'], ['GBP', 'USD'], ['USD', 'JPY'], ['USD', 'TRY'],
  ['USD', 'AZN'], ['EUR', 'GBP'], ['USD', 'CAD'], ['USD', 'INR'], ['AUD', 'USD'], ['USD', 'CNY'],
]

function PopularConversions({ isDark, onPick }: { isDark: boolean; onPick: (base: string, quote: string) => void }) {
  const t = useT()
  return (
    <section style={{ maxWidth: 720, margin: '0 auto', width: '100%', padding: '80px 16px 0' }}>
      <motion.h2
        initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5 }}
        style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, letterSpacing: '-1px', textAlign: 'center', color: 'var(--color-text)', marginBottom: 12 }}
      >
        {t.popTitle}
      </motion.h2>
      <p style={{ textAlign: 'center', color: 'var(--color-text-dim)', fontSize: 16, maxWidth: 460, margin: '0 auto 36px', lineHeight: 1.6 }}>
        {t.popSub}
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
        {POPULAR_PAIRS.map(([base, quote]) => (
          <button
            key={`${base}-${quote}`}
            onClick={() => onPick(base, quote)}
            style={{
              fontSize: 14, fontWeight: 600, color: 'var(--color-text-dim)', fontFamily: 'inherit', cursor: 'pointer',
              padding: '9px 16px', borderRadius: 100,
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.7)',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.08)'}`,
              transition: 'color 0.15s, border-color 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-accent)'; e.currentTarget.style.borderColor = 'rgba(255,149,0,0.4)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-text-dim)'; e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.08)' }}
          >
            {base} → {quote}
          </button>
        ))}
      </div>
    </section>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [selectedCodes, setSelectedCodes] = usePersistentState<string[]>('web_codes', DEFAULT_CODES)
  const [baseCode, setBaseCode] = usePersistentState<string>('web_base', DEFAULT_CODES[0])
  const [decimalMode, setDecimalMode] = usePersistentState<DecimalMode>('web_decimal', 'auto')
  const [theme, setTheme] = usePersistentState<'dark' | 'light'>('web_theme', 'dark')
  const [amount, setAmount] = useState('1')
  const [picker, setPicker] = useState<PickerMode>({ kind: 'closed' })
  const [copied, setCopied] = useState<string | null>(null)
  const [legalModal, setLegalModal] = useState<'privacy' | 'terms' | null>(null)
  const [alertOpen, setAlertOpen] = useState(false)
  const [alertPair, setAlertPair] = useState<{ base: string; quote: string }>({ base: 'USD', quote: 'EUR' })
  useAlertChecker()

  const converterRef = useRef<HTMLDivElement>(null)
  const badgesRef = useRef<HTMLDivElement>(null)
  const isDark = theme === 'dark'

  const { lang } = useLang()
  const t = useT()
  const ui = useUI()
  const SITE = 'https://www.multiconverter.app'
  usePageMeta({
    title: t.metaTitle,
    description: t.metaDesc,
    canonical: SITE + (lang === 'en' ? '/' : `/${lang}`),
    image: SITE + '/og-image.png',
    htmlLang: t.htmlLang,
    alternates: [
      ...LANGS.map(l => ({ hreflang: l.code, href: SITE + (l.code === 'en' ? '/' : `/${l.code}`) })),
      { hreflang: 'x-default', href: SITE + '/' },
    ],
  })

  useEffect(() => {
    document.documentElement.classList.toggle('theme-light', !isDark)
    document.documentElement.style.setProperty('--row-border', isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)')
    document.documentElement.style.setProperty('--row-active-bg', isDark ? 'rgba(255,149,0,0.07)' : 'rgba(255,149,0,0.05)')
    document.documentElement.style.setProperty('--color-text-secondary', isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.45)')
  }, [isDark])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      document.documentElement.style.setProperty('--mx', `${e.clientX}px`)
      document.documentElement.style.setProperty('--my', `${e.clientY}px`)
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  const { rates: usdRates, loading, error, date, refresh } = useExchangeRates('USD')

  const rates = useMemo(() => {
    if (baseCode === 'USD') return usdRates
    const baseRate = usdRates[baseCode]
    if (!baseRate) return usdRates
    const derived: Record<string, number> = { [baseCode]: 1 }
    for (const [c, r] of Object.entries(usdRates)) {
      if (c !== baseCode) derived[c] = r / baseRate
    }
    derived['USD'] = 1 / baseRate
    return derived
  }, [usdRates, baseCode])

  const baseValue = useMemo(() => safeEvaluate(amount) ?? 0, [amount])

  const computeFor = useCallback((code: string) => {
    if (code === baseCode) return baseValue
    const rate = rates[code]
    return rate ? baseValue * rate : 0
  }, [baseCode, baseValue, rates])

  const handleSelectBase = (code: string) => {
    if (code === baseCode) return
    const raw = computeFor(code)
    const dec = effectiveDecimals(code, decimalMode)
    const snapped = parseFloat(raw.toFixed(dec))
    setBaseCode(code)
    setAmount(strip(snapped.toString()))
  }

  const handlePopularPick = (base: string, quote: string) => {
    setSelectedCodes(prev => [base, quote, ...prev.filter(c => c !== base && c !== quote)].slice(0, MAX_SLOTS))
    setBaseCode(base)
    setAmount('1')
    requestAnimationFrame(() => converterRef.current?.scrollIntoView({ behavior: 'smooth' }))
  }

  const handlePick = (code: string) => {
    if (picker.kind === 'add') {
      if (!selectedCodes.includes(code) && selectedCodes.length < MAX_SLOTS)
        setSelectedCodes([...selectedCodes, code])
    } else if (picker.kind === 'edit') {
      const next = [...selectedCodes]
      const old = next[picker.slotIndex]
      const ex = next.indexOf(code)
      if (ex !== -1 && ex !== picker.slotIndex) next[ex] = old
      next[picker.slotIndex] = code
      if (baseCode === old) setBaseCode(code)
      setSelectedCodes(next)
    }
    setPicker({ kind: 'closed' })
  }

  const handleRemove = (idx: number) => {
    if (selectedCodes.length <= 2) return
    const removed = selectedCodes[idx]
    const next = selectedCodes.filter((_, i) => i !== idx)
    if (baseCode === removed) setBaseCode(next[0])
    setSelectedCodes(next)
  }

  const handleCopy = useCallback(async (code: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text.replace(/,/g, ''))
      setCopied(code)
      setTimeout(() => setCopied(null), 1500)
    } catch { /* clipboard blocked */ }
  }, [])

  // Operator buttons for the calculator strip
  const appendOp = (op: string) => {
    setAmount(prev => {
      const lastChar = prev[prev.length - 1]
      if (['+', '−', '×', '÷'].includes(lastChar)) return prev.slice(0, -1) + op
      return prev + op
    })
    // After React re-renders, focus input and place cursor at end
    requestAnimationFrame(() => {
      const inputs = document.querySelectorAll<HTMLInputElement>('input[type="text"]')
      if (inputs.length > 0) {
        const input = inputs[0]
        input.focus()
        input.setSelectionRange(input.value.length, input.value.length)
      }
    })
  }

  const handleEnter = () => {
    const result = safeEvaluate(amount)
    if (result !== null) setAmount(strip(numToStr(result)))
  }

  // iOS calculator semantics: +/− → percent OF the running total; ×/÷ → plain factor.
  // "200+10%" → 220 · "200−10%" → 180 · "200×10%" → 20 · "200÷10%" → 2000 · "200%" → 2
  const handlePercent = () => {
    const lastOpIdx = Math.max(
      amount.lastIndexOf('+'),
      amount.lastIndexOf('−'),
      amount.lastIndexOf('×'),
      amount.lastIndexOf('÷'),
    )
    if (lastOpIdx > 0) {
      const base = amount.slice(0, lastOpIdx)
      const op = amount[lastOpIdx]
      const tailNum = parseFloat(amount.slice(lastOpIdx + 1))
      const baseVal = safeEvaluate(base)
      if (baseVal != null && !isNaN(tailNum)) {
        const pctVal = (op === '+' || op === '−')
          ? (baseVal * tailNum) / 100
          : tailNum / 100
        const result = safeEvaluate(base + op + numToStr(pctVal))
        if (result != null) return setAmount(strip(numToStr(result)))
      }
    }
    const v = safeEvaluate(amount)
    if (v === null) return
    setAmount(strip(numToStr(v / 100)))
  }

  const statusDot = error ? '#ff453a' : loading ? '#f0a500' : '#34c759'
  const friendlyDate = formatRelativeDate(date)
  const statusText = error ? ui.offline : loading ? ui.updating : `${ui.rates} · ${friendlyDate ?? ui.loading}`

  const calcBtnStyle = (isDark: boolean): React.CSSProperties => ({
    width: 36, height: 36, borderRadius: 10, fontSize: 16, fontWeight: 600,
    backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)',
    color: 'var(--color-accent)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.12s', flexShrink: 0,
  })

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh' }}>

      {/* ── Infinite grid background ── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div className="grid-base" />
        <div className="grid-spotlight" />
        {/* Ambient blobs — dark mode */}
        {isDark && <>
          <div style={{ position: 'absolute', width: 900, height: 900, top: -320, left: -280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(100,60,255,0.18) 0%, transparent 65%)' }} />
          <div style={{ position: 'absolute', width: 700, height: 700, bottom: -200, right: -200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,100,0,0.13) 0%, transparent 65%)' }} />
          <div style={{ position: 'absolute', width: 500, height: 500, top: '40%', right: '10%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,180,255,0.08) 0%, transparent 65%)' }} />
        </>}
        {/* Ambient blobs — light mode */}
        {!isDark && <>
          <div style={{ position: 'absolute', width: 800, height: 800, top: -280, left: -240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,149,0,0.13) 0%, transparent 65%)' }} />
          <div style={{ position: 'absolute', width: 600, height: 600, bottom: -150, right: -150, borderRadius: '50%', background: 'radial-gradient(circle, rgba(120,80,255,0.1) 0%, transparent 65%)' }} />
        </>}
      </div>

      {/* ── Fixed Nav ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        display: 'flex', justifyContent: 'center',
        padding: '0 16px', height: 58,
        backgroundColor: isDark ? 'rgba(7,7,15,0.82)' : 'rgba(240,240,248,0.88)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)'}`,
      }}>
        <div style={{
          width: '100%', maxWidth: 1040,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <img src="/favicon-32.png" alt="Multi Converter" width={30} height={30} style={{ borderRadius: 8, objectFit: 'cover' }} />
            <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.4px', color: 'var(--color-text)' }}>
              Multi Converter
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginRight: 8 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: statusDot, display: 'block', flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: 'var(--color-text-dim)' }} className="nav-status">{statusText}</span>
            </div>
            <LangSwitcher isDark={isDark} />
            <NavBtn onClick={refresh} disabled={loading} isDark={isDark} label={ui.refreshRates}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" />
              </svg>
            </NavBtn>
            <NavBtn onClick={() => setTheme(isDark ? 'light' : 'dark')} isDark={isDark} label={ui.toggleTheme}>
              {isDark ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </NavBtn>
          </div>
        </div>
      </nav>

      <main style={{ position: 'relative', zIndex: 1, paddingTop: 58 }}>

        {/* ── Hero Section ── */}
        <section className="snap-start" style={{
          height: 'calc(100vh - 58px)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '40px 24px 80px',
          textAlign: 'center', position: 'relative',
          overflow: 'hidden',
        }}>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              display: 'inline-block', fontSize: 12, fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              color: 'var(--color-accent)', marginBottom: 28,
              padding: '7px 18px', borderRadius: 100,
              backgroundColor: isDark ? 'rgba(255,149,0,0.1)' : 'rgba(255,149,0,0.08)',
              border: '1px solid rgba(255,149,0,0.3)',
            }}
          >
            {t.badge}
          </motion.div>

          <AnimatedHeadline />

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            style={{ fontSize: 19, color: 'var(--color-text-dim)', marginBottom: 36, maxWidth: 540, lineHeight: 1.7 }}
          >
            {t.subtitle}{' '}
            <span style={{ color: 'var(--color-accent)', fontWeight: 600 }}>{t.alwaysFree}</span>
          </motion.p>

          <SocialProof onClick={() => badgesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })} />

          {/* App store badges */}
          <motion.div
            ref={badgesRef}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}
          >
            {[
              {
                icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--color-text)"><path d="M3 20.5v-17c0-.83 1-.99 1.4-.5l15 8.5-15 8.5c-.4.49-1.4.33-1.4-.5z" /></svg>,
                label: 'Google Play',
                href: PLAY_URL as string | undefined,
                top: DOWNLOAD_LABEL[lang] ?? 'Download',
              },
              {
                icon: <svg width="16" height="18" viewBox="0 0 24 24" fill="var(--color-text)"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" /></svg>,
                label: 'App Store',
                href: undefined as string | undefined,
                top: t.comingSoon,
              },
            ].map(({ icon, label, href, top }) => {
              const inner = (
                <>
                  {icon}
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--color-text-dim)', lineHeight: 1, marginBottom: 2 }}>{top}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', lineHeight: 1 }}>{label}</div>
                  </div>
                </>
              )
              const style: React.CSSProperties = {
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '11px 22px', borderRadius: 13, textDecoration: 'none',
                backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.08)'}`,
                opacity: href ? 1 : 0.72,
              }
              return href
                ? <a key={label} href={href} target="_blank" rel="noopener noreferrer" style={style}>{inner}</a>
                : <div key={label} style={style}>{inner}</div>
            })}
          </motion.div>

          {/* Notify-at-launch CTA (honest, no backend / no tracking) */}
          <motion.a
            href="mailto:hello@multiconverter.app?subject=Notify%20me%20when%20Multi%20Converter%20launches"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.05, duration: 0.5 }}
            style={{ marginTop: 18, fontSize: 13, color: 'var(--color-text-dim)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-accent)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-dim)')}
          >
            {t.getNotified}
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </motion.a>

          {/* Scroll down arrow */}
          <motion.button
            onClick={() => converterRef.current?.scrollIntoView({ behavior: 'smooth' })}
            aria-label={ui.scrollDown}
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
            style={{
              position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
              width: 38, height: 38, borderRadius: '50%',
              backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--color-text-dim)',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </motion.button>
        </section>

        {/* ── Converter Section ── */}
        <div ref={converterRef} id="converter" className="snap-start" style={{ minHeight: '100vh', padding: 'clamp(48px, 8vh, 88px) 16px 0', display: 'flex', flexDirection: 'column' }}>

          {/* Converter card */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{
              width: '100%', maxWidth: 590,
              borderRadius: 24,
              backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.9)',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'}`,
              backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)',
              boxShadow: isDark ? '0 24px 80px rgba(0,0,0,0.45)' : '0 16px 60px rgba(0,0,0,0.1)',
              overflow: 'hidden',
            }}>
              {/* Card header */}
              <div style={{
                padding: '14px 20px',
                borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
              }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', marginRight: 'auto' }}>
                  {t.cardTitle}
                </span>
                {/* Decimal mode */}
                <div style={{ display: 'flex', gap: 3 }}>
                  {DECIMAL_OPTIONS.map(m => (
                    <button key={String(m)} onClick={() => setDecimalMode(m)} style={{
                      padding: '3px 9px', borderRadius: 7, fontSize: 11, fontWeight: 600,
                      backgroundColor: decimalMode === m ? 'var(--color-accent)' : (isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'),
                      color: decimalMode === m ? 'white' : 'var(--color-text-dim)', transition: 'all 0.15s',
                    }}>
                      {m === 'auto' ? 'Auto' : `.${m}`}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setPicker({ kind: 'add' })}
                  disabled={selectedCodes.length >= MAX_SLOTS}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    fontSize: 12, fontWeight: 600, color: 'var(--color-accent)',
                    padding: '5px 12px', borderRadius: 8,
                    backgroundColor: 'rgba(255,149,0,0.1)',
                    opacity: selectedCodes.length >= MAX_SLOTS ? 0.4 : 1,
                  }}
                >
                  <span style={{ fontSize: 15, lineHeight: 1 }}>+</span> {t.add}
                </button>
              </div>

              {/* ── Calculator operator strip ── */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '10px 20px',
                borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
              }}>
                <span style={{ fontSize: 11, color: 'var(--color-text-faint)', marginRight: 4, whiteSpace: 'nowrap' }}>{t.calculate}</span>
                {OPERATORS.map(op => (
                  <button key={op} onClick={() => appendOp(op)} style={calcBtnStyle(isDark)}>
                    {op}
                  </button>
                ))}
                <button onClick={handlePercent} style={{ ...calcBtnStyle(isDark), color: 'var(--color-text-dim)' }} title="Percent">
                  %
                </button>
                <button
                  onClick={() => setAmount(prev => prev.length > 1 ? prev.slice(0, -1) : '0')}
                  style={{ ...calcBtnStyle(isDark), color: 'var(--color-text-dim)' }}
                  title="Backspace"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
                    <line x1="18" y1="9" x2="13" y2="14" /><line x1="13" y1="9" x2="18" y2="14" />
                  </svg>
                </button>
                <button
                  onClick={() => setAmount('0')}
                  style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 600, color: 'var(--color-text-faint)', padding: '4px 8px', borderRadius: 7, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
                >
                  C
                </button>
              </div>

              {/* Draggable rows */}
              <Reorder.Group
                axis="y"
                values={selectedCodes}
                onReorder={setSelectedCodes}
                style={{ margin: 0, padding: 0, listStyle: 'none' }}
              >
                {selectedCodes.map((code, idx) => (
                  <DraggableRow
                    key={code}
                    code={code}
                    isBase={code === baseCode}
                    amount={amount}
                    computedValue={computeFor(code)}
                    decimalMode={decimalMode}
                    isDark={isDark}
                    canRemove={selectedCodes.length > 2}
                    copied={copied}
                    onSelectBase={() => handleSelectBase(code)}
                    onEditCurrency={() => setPicker({ kind: 'edit', slotIndex: idx })}
                    onRemove={() => handleRemove(idx)}
                    onAmountChange={setAmount}
                    onCopy={handleCopy}
                    onEnter={handleEnter}
                  />
                ))}
              </Reorder.Group>

              {/* Card footer */}
              <div style={{
                padding: '10px 20px',
                borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: 11, color: 'var(--color-text-dim)' }}>{t.midMarket}</span>
                <span style={{ fontSize: 11, color: 'var(--color-text-dim)', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: statusDot, display: 'inline-block' }} />
                  {friendlyDate ?? 'Loading'}
                </span>
              </div>
            </div>
          </div>

          {/* Rate History Section */}
          <RateHistorySection isDark={isDark} onOpenAlert={(b, q) => { setAlertPair({ base: b, quote: q }); setAlertOpen(true) }} />

          {/* Features + Popular conversions + FAQ (value + SEO content) */}
          <FeaturesSection isDark={isDark} />
          <PopularConversions isDark={isDark} onPick={handlePopularPick} />
          <FaqSection isDark={isDark} />

          {/* Push footer to bottom */}
          <div style={{ flex: 1 }} />

          {/* Footer */}
          <div style={{ textAlign: 'center', marginTop: 48, paddingBottom: 40, borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`, paddingTop: 28 }}>
            {/* Social icons */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 20 }}>
              {/* X / Twitter */}
              <a href="https://x.com/multiconvert" target="_blank" rel="noopener noreferrer"
                aria-label="X (Twitter)"
                style={{ width: 34, height: 34, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', color: 'var(--color-text-dim)', textDecoration: 'none', transition: 'background 0.15s, color 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-text)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-text-dim)' }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              {/* Instagram */}
              <a href="https://www.instagram.com/multiconverter.app/" target="_blank" rel="noopener noreferrer"
                aria-label="Instagram"
                style={{ width: 34, height: 34, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', color: 'var(--color-text-dim)', textDecoration: 'none', transition: 'background 0.15s, color 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-text)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-text-dim)' }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <circle cx="12" cy="12" r="4"/>
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
                </svg>
              </a>
            </div>
            {/* Links */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 16, flexWrap: 'wrap' }}>
              <Link to={lang === 'en' ? '/blog' : `/${lang}/blog`}
                style={{ fontSize: 12, color: 'var(--color-text-dim)', textDecoration: 'none', transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-accent)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-dim)')}
              >
                {t.blog}
              </Link>
              {([
                { label: t.privacy, action: () => setLegalModal('privacy') },
                { label: t.terms, action: () => setLegalModal('terms') },
                { label: t.contact, action: () => window.location.href = 'mailto:hello@multiconverter.app' },
              ] as { label: string; action: () => void }[]).map(({ label, action }) => (
                <button key={label} onClick={action}
                  style={{ fontSize: 12, color: 'var(--color-text-dim)', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 0, transition: 'color 0.15s', fontFamily: 'inherit' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-accent)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-dim)')}
                >
                  {label}
                </button>
              ))}
            </div>
            <p style={{ fontSize: 12, color: 'var(--color-text-faint)' }}>
              © 2026 multiconverter.app · by fubboo
            </p>
          </div>
        </div>
      </main>

      {picker.kind !== 'closed' && (
        <FlagPicker
          excludeCodes={picker.kind === 'edit' ? selectedCodes.filter((_, i) => i !== picker.slotIndex) : selectedCodes}
          highlightCode={picker.kind === 'edit' ? selectedCodes[picker.slotIndex] : undefined}
          title={picker.kind === 'add' ? ui.addCurrency : ui.changeCurrency}
          onPick={handlePick}
          onClose={() => setPicker({ kind: 'closed' })}
          isDark={isDark}
        />
      )}

      {legalModal && (
        <LegalModal type={legalModal} isDark={isDark} onClose={() => setLegalModal(null)} />
      )}

      {alertOpen && (
        <RateAlertModal defaultBase={alertPair.base} defaultQuote={alertPair.quote} isDark={isDark} onClose={() => setAlertOpen(false)} />
      )}
    </div>
  )
}
