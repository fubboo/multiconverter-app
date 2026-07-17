import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTheme } from '../lib/useTheme'
import { usePageMeta } from '../lib/usePageMeta'
import { useLang } from '../i18n/LangContext'
import { BlogLayout } from './BlogLayout'
import { POSTS, getAccent } from './posts'
import { getBlogUI, getLocalizedPost } from './postsLocalized'

const SITE = 'https://www.multiconverter.app'
const BLOG_LANGS = ['en', 'es', 'fr', 'de', 'pt']
const blogPath = (lang: string) => (lang === 'en' ? '/blog' : `/${lang}/blog`)

export function BlogIndex() {
  const { isDark, theme, setTheme } = useTheme()
  const { lang } = useLang()
  const ui = getBlogUI(lang)
  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString(lang, { month: 'short', day: 'numeric', year: 'numeric' })

  usePageMeta({
    title: ui.metaTitle,
    description: ui.metaDesc,
    canonical: SITE + blogPath(lang),
    image: SITE + '/og-image.png',
    htmlLang: lang,
    alternates: [
      ...BLOG_LANGS.map(l => ({ hreflang: l, href: SITE + blogPath(l) })),
      { hreflang: 'x-default', href: SITE + '/blog' },
    ],
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: 'Multi Converter Blog',
      url: SITE + blogPath(lang),
      blogPost: POSTS.map(p => {
        const loc = getLocalizedPost(lang, p.slug)
        return {
          '@type': 'BlogPosting',
          headline: loc?.title ?? p.title,
          description: loc?.description ?? p.description,
          datePublished: p.date,
          url: `${SITE}${blogPath(lang)}/${p.slug}`,
        }
      }),
    },
  })

  return (
    <BlogLayout isDark={isDark} onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      <div style={{ maxWidth: 920, margin: '0 auto', padding: '56px 20px 0' }}>
        <motion.h1
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          style={{ fontSize: 'clamp(34px, 5vw, 52px)', fontWeight: 800, letterSpacing: '-1.5px', color: 'var(--color-text)', textAlign: 'center', marginBottom: 14 }}
        >
          {ui.indexTitle}
        </motion.h1>
        <p style={{ textAlign: 'center', color: 'var(--color-text-dim)', fontSize: 17, maxWidth: 540, margin: '0 auto 48px', lineHeight: 1.6 }}>
          {ui.indexIntro}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20, paddingBottom: 20 }}>
          {POSTS.map((p, i) => {
            const loc = getLocalizedPost(lang, p.slug)
            const acc = getAccent(p.slug)
            return (
              <motion.div key={p.slug}
                initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.45, delay: (i % 3) * 0.07 }}
              >
                <Link to={`${blogPath(lang)}/${p.slug}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
                  <article style={{
                    height: '100%', borderRadius: 18, overflow: 'hidden',
                    backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.72)',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'}`,
                    display: 'flex', flexDirection: 'column',
                  }}>
                    <div style={{
                      width: '100%', aspectRatio: '1200 / 520', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: `radial-gradient(circle at 18% 22%, ${acc.a}66, transparent 60%), radial-gradient(circle at 84% 86%, ${acc.b}55, transparent 60%), #0c0c14`,
                    }}>
                      <span style={{ fontSize: 14, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#ffffff', opacity: 0.95 }}>{p.tag}</span>
                    </div>
                    <div style={{ padding: '18px 20px 22px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)', lineHeight: 1.3, margin: '0 0 9px' }}>{loc?.title ?? p.title}</h2>
                      <p style={{ fontSize: 14, color: 'var(--color-text-dim)', lineHeight: 1.6, margin: '0 0 16px', flex: 1 }}>{loc?.excerpt ?? p.excerpt}</p>
                      <span style={{ fontSize: 12, color: 'var(--color-text-faint)' }}>{fmtDate(p.date)} · {p.readMins} {ui.minRead}</span>
                    </div>
                  </article>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </BlogLayout>
  )
}
