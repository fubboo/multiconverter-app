import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useLang, useT, useUI } from '../i18n/LangContext'
import { LANGS } from '../i18n/translations'
import { setLangChoice } from '../i18n/langPref'

interface Props {
  children: ReactNode
  isDark: boolean
  onToggleTheme: () => void
}

function BlogLangSwitcher({ isDark }: { isDark: boolean }) {
  const { lang } = useLang()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])
  const blogPath = (l: string) => (l === 'en' ? '/blog' : `/${l}/blog`)
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} aria-label="Language" style={{
        display: 'flex', alignItems: 'center', gap: 5, height: 32, padding: '0 10px', borderRadius: 16,
        backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)', color: 'var(--color-text-dim)', fontSize: 13, fontWeight: 600,
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
        {lang.toUpperCase()}
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 100,
          backgroundColor: isDark ? '#16161e' : '#ffffff', border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
          borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.25)', overflow: 'hidden', minWidth: 150, padding: 5,
        }}>
          {LANGS.map(l => (
            <Link key={l.code} to={blogPath(l.code)} onClick={() => { setLangChoice(l.code); setOpen(false) }}
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

export function BlogLayout({ children, isDark, onToggleTheme }: Props) {
  const { lang } = useLang()
  const t = useT()
  const ui = useUI()
  const home = lang === 'en' ? '/' : `/${lang}`
  const blog = lang === 'en' ? '/blog' : `/${lang}/blog`
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      document.documentElement.style.setProperty('--mx', `${e.clientX}px`)
      document.documentElement.style.setProperty('--my', `${e.clientY}px`)
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  const navLink = { fontSize: 14, fontWeight: 600, color: 'var(--color-text-dim)', textDecoration: 'none' } as const

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh' }}>
      {/* Background */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div className="grid-base" />
        <div className="grid-spotlight" />
        {isDark && (
          <div style={{ position: 'absolute', width: 800, height: 800, top: -300, left: -250, borderRadius: '50%', background: 'radial-gradient(circle, rgba(100,60,255,0.16) 0%, transparent 65%)' }} />
        )}
        <div style={{ position: 'absolute', width: 600, height: 600, bottom: -200, right: -180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,149,0,0.1) 0%, transparent 65%)' }} />
      </div>

      {/* Nav */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        display: 'flex', justifyContent: 'center', padding: '0 16px', height: 58,
        backgroundColor: isDark ? 'rgba(7,7,15,0.82)' : 'rgba(240,240,248,0.88)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)'}`,
      }}>
        <div style={{ width: '100%', maxWidth: 1040, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <Link to={home} style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none', flexShrink: 0 }}>
            <img src="/favicon-32.png" alt="Multi Converter" width={30} height={30} style={{ borderRadius: 8, objectFit: 'cover' }} />
            <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.4px', color: 'var(--color-text)' }}>Multi Converter</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Link to={blog} style={navLink} className="nav-status">{t.blog}</Link>
            <Link to={`${home}#faq`} style={navLink} className="nav-status">{ui.navFaq}</Link>
            <Link to={home} style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-accent)', textDecoration: 'none', whiteSpace: 'nowrap' }}>{ui.openConverter} →</Link>
            <BlogLangSwitcher isDark={isDark} />
            <button onClick={onToggleTheme} aria-label="Toggle theme" style={{
              width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
              backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-dim)',
            }}>
              {isDark ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1, paddingTop: 58 }}>
        {children}

        {/* Footer */}
        <footer style={{ maxWidth: 760, margin: '0 auto', padding: '60px 20px 48px', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 22, marginBottom: 16, flexWrap: 'wrap' }}>
            <Link to={home} style={{ fontSize: 13, color: 'var(--color-text-dim)', textDecoration: 'none' }}>{ui.navConverter}</Link>
            <Link to={blog} style={{ fontSize: 13, color: 'var(--color-text-dim)', textDecoration: 'none' }}>{t.blog}</Link>
            <a href="/privacy.html" style={{ fontSize: 13, color: 'var(--color-text-dim)', textDecoration: 'none' }}>{t.privacy}</a>
            <a href="mailto:hello@multiconverter.app" style={{ fontSize: 13, color: 'var(--color-text-dim)', textDecoration: 'none' }}>{t.contact}</a>
          </div>
          <p style={{ fontSize: 12, color: 'var(--color-text-faint)' }}>© 2026 multiconverter.app · by fubboo</p>
        </footer>
      </div>
    </div>
  )
}
