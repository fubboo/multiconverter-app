import { createContext, useContext, type ReactNode } from 'react'
import { T, UI, type Lang, type Dict, type UIDict } from './translations'

const LangCtx = createContext<{ lang: Lang; t: Dict; ui: UIDict }>({ lang: 'en', t: T.en, ui: UI.en })

export function LangProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  return <LangCtx.Provider value={{ lang, t: T[lang], ui: UI[lang] }}>{children}</LangCtx.Provider>
}

export const useLang = () => useContext(LangCtx)
export const useT = () => useContext(LangCtx).t
export const useUI = () => useContext(LangCtx).ui
