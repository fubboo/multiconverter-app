// Remembers the visitor's language choice so auto-detection never fights the user.
// 'web_lang_choice' is set the first time we auto-redirect AND whenever the user
// picks a language manually in the switcher (manual choice always wins later).
import type { Lang } from './translations'

const KEY = 'web_lang_choice'
const SUPPORTED: Lang[] = ['en', 'es', 'fr', 'de', 'pt']

export function getLangChoice(): Lang | null {
  try {
    const v = localStorage.getItem(KEY)
    return SUPPORTED.includes(v as Lang) ? (v as Lang) : null
  } catch { return null }
}

export function setLangChoice(lang: Lang) {
  try { localStorage.setItem(KEY, lang) } catch { /* ignore */ }
}

export function detectBrowserLang(): Lang {
  const dev = (navigator.language || 'en').slice(0, 2).toLowerCase()
  return SUPPORTED.includes(dev as Lang) ? (dev as Lang) : 'en'
}
