import { useParams, Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTheme } from '../lib/useTheme'
import { usePageMeta } from '../lib/usePageMeta'
import { useLang } from '../i18n/LangContext'
import { BlogLayout } from './BlogLayout'
import { LiveRateWidget } from './LiveRateWidget'
import { getPost, POSTS, type Block } from './posts'
import { getBlogUI, getLocalizedPost } from './postsLocalized'

const SITE = 'https://www.multiconverter.app'
const BLOG_LANGS = ['en', 'es', 'fr', 'de', 'pt']
const blogPath = (lang: string) => (lang === 'en' ? '/blog' : `/${lang}/blog`)

function BlockView({ block, isDark, cta }: { block: Block; isDark: boolean; cta: string }) {
  switch (block.t) {
    case 'h2':
      return <h2 style={{ fontSize: 'clamp(22px, 3.2vw, 28px)', fontWeight: 800, letterSpacing: '-0.5px', color: 'var(--color-text)', margin: '36px 0 12px' }}>{block.text}</h2>
    case 'p':
      return <p className="blog-prose" style={{ fontSize: 17, lineHeight: 1.75, color: 'var(--color-text-dim)', margin: '0 0 16px' }}>{block.text}</p>
    case 'ul':
      return (
        <ul style={{ margin: '0 0 18px', paddingLeft: 22 }}>
          {block.items.map((it, i) => (
            <li key={i} style={{ fontSize: 17, lineHeight: 1.7, color: 'var(--color-text-dim)', margin: '0 0 8px' }}>{it}</li>
          ))}
        </ul>
      )
    case 'rate':
      return <LiveRateWidget base={block.base} quote={block.quote} isDark={isDark} />
    case 'cta':
      return (
        <Link to="/" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, margin: '14px 0 8px',
          padding: '13px 22px', borderRadius: 12, fontSize: 15, fontWeight: 700,
          backgroundColor: 'var(--color-accent)', color: '#fff', textDecoration: 'none',
        }}>
          {block.text || cta}
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
        </Link>
      )
  }
}

export function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const { isDark, theme, setTheme } = useTheme()
  const { lang } = useLang()
  const post = slug ? getPost(slug) : undefined
  const loc = slug ? getLocalizedPost(lang, slug) : undefined
  const ui = getBlogUI(lang)

  const title = loc?.title ?? post?.title ?? ''
  const description = loc?.description ?? post?.description ?? ''
  const body = loc?.body ?? post?.body ?? []

  usePageMeta({
    title: post ? `${title} | Multi Converter` : 'Blog | Multi Converter',
    description,
    canonical: `${SITE}${blogPath(lang)}/${slug ?? ''}`,
    image: post ? `${SITE}/blog/${post.slug}.png` : undefined,
    htmlLang: lang,
    alternates: post ? [
      ...BLOG_LANGS.map(l => ({ hreflang: l, href: `${SITE}${blogPath(l)}/${post.slug}` })),
      { hreflang: 'x-default', href: `${SITE}/blog/${post.slug}` },
    ] : undefined,
    jsonLd: post ? {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: title,
      description,
      datePublished: post.date,
      dateModified: post.date,
      image: `${SITE}/blog/${post.slug}.png`,
      url: `${SITE}${blogPath(lang)}/${post.slug}`,
      mainEntityOfPage: `${SITE}${blogPath(lang)}/${post.slug}`,
      author: { '@type': 'Organization', name: 'fubboo' },
      publisher: { '@type': 'Organization', name: 'fubboo', url: SITE + '/' },
    } : undefined,
  })

  if (!post) return <Navigate to={blogPath(lang)} replace />

  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString(lang, { month: 'long', day: 'numeric', year: 'numeric' })
  const more = POSTS.filter(p => p.slug !== post.slug).slice(0, 2)

  return (
    <BlogLayout isDark={isDark} onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      <article style={{ maxWidth: 720, margin: '0 auto', padding: '40px 20px 0' }}>
        <Link to={blogPath(lang)} style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-dim)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5, marginBottom: 22 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
          {ui.allPosts}
        </Link>

        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-accent)' }}>{post.tag}</span>
        <motion.h1
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          style={{ fontSize: 'clamp(30px, 5vw, 46px)', fontWeight: 800, letterSpacing: '-1.5px', lineHeight: 1.12, color: 'var(--color-text)', margin: '10px 0 14px' }}
        >
          {title}
        </motion.h1>
        <p style={{ fontSize: 13, color: 'var(--color-text-faint)', marginBottom: 26 }}>{fmtDate(post.date)} · {post.readMins} {ui.minRead}</p>

        <img src={`/blog/${post.slug}.png`} alt={title}
          style={{ width: '100%', aspectRatio: '1200 / 600', objectFit: 'cover', borderRadius: 18, marginBottom: 30, border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'}` }} />

        <div>
          {body.map((block, i) => <BlockView key={i} block={block} isDark={isDark} cta={ui.allPosts} />)}
        </div>

        {/* More posts */}
        <div style={{ marginTop: 56, paddingTop: 30, borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}` }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-text)', marginBottom: 16 }}>{ui.keepReading}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
            {more.map(m => (
              <Link key={m.slug} to={`${blogPath(lang)}/${m.slug}`} style={{
                textDecoration: 'none', padding: '16px 18px', borderRadius: 14,
                backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.72)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'}`,
              }}>
                <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-accent)' }}>{m.tag}</span>
                <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)', margin: '6px 0 0', lineHeight: 1.35 }}>{getLocalizedPost(lang, m.slug)?.title ?? m.title}</p>
              </Link>
            ))}
          </div>
        </div>
      </article>
    </BlogLayout>
  )
}
