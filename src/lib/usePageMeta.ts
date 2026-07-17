import { useEffect } from 'react'

interface Meta {
  title: string
  description: string
  canonical: string
  image?: string
  jsonLd?: object
  htmlLang?: string
  alternates?: { hreflang: string; href: string }[]
}

function upsertMeta(key: string, value: string, attr: 'name' | 'property' = 'name') {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  const prev = el.getAttribute('content')
  el.setAttribute('content', value)
  return prev
}

// Per-page SEO meta for client-rendered routes (Google renders JS and reads these).
export function usePageMeta({ title, description, canonical, image, jsonLd, htmlLang, alternates }: Meta) {
  useEffect(() => {
    const prevTitle = document.title
    document.title = title

    const prevHtmlLang = document.documentElement.lang
    if (htmlLang) document.documentElement.lang = htmlLang

    // hreflang alternates
    const altEls: HTMLLinkElement[] = []
    if (alternates) {
      for (const a of alternates) {
        const el = document.createElement('link')
        el.rel = 'alternate'
        el.setAttribute('hreflang', a.hreflang)
        el.href = a.href
        document.head.appendChild(el)
        altEls.push(el)
      }
    }
    upsertMeta('description', description)
    upsertMeta('og:title', title, 'property')
    upsertMeta('og:description', description, 'property')
    upsertMeta('og:url', canonical, 'property')
    upsertMeta('twitter:title', title)
    upsertMeta('twitter:description', description)
    if (image) {
      upsertMeta('og:image', image, 'property')
      upsertMeta('twitter:image', image)
    }

    let link = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
    const prevCanonical = link?.href
    if (!link) {
      link = document.createElement('link')
      link.rel = 'canonical'
      document.head.appendChild(link)
    }
    link.href = canonical

    let script: HTMLScriptElement | null = null
    if (jsonLd) {
      script = document.createElement('script')
      script.type = 'application/ld+json'
      script.text = JSON.stringify(jsonLd)
      document.head.appendChild(script)
    }

    return () => {
      document.title = prevTitle
      document.documentElement.lang = prevHtmlLang
      if (link && prevCanonical) link.href = prevCanonical
      if (script) script.remove()
      altEls.forEach(el => el.remove())
    }
  }, [title, description, canonical, image, htmlLang, JSON.stringify(jsonLd), JSON.stringify(alternates)])
}
