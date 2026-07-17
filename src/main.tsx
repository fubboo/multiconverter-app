import { StrictMode, useEffect, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import './index.css'
import App from './App'
import { BlogIndex } from './blog/BlogIndex'
import { BlogPost } from './blog/BlogPost'
import { LangProvider } from './i18n/LangContext'
import { LANGS } from './i18n/translations'
import { ErrorBoundary } from './ErrorBoundary'
import { getLangChoice, setLangChoice, detectBrowserLang } from './i18n/langPref'

// First visit to "/" with no saved choice: send the visitor to their browser
// language's homepage (es/fr/de/pt). Saved choice (auto or manual) wins forever.
function AutoLang({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  useEffect(() => {
    if (getLangChoice()) return
    const detected = detectBrowserLang()
    setLangChoice(detected)
    if (detected !== 'en') navigate(`/${detected}`, { replace: true })
  }, [navigate])
  return <>{children}</>
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AutoLang><LangProvider lang="en"><App /></LangProvider></AutoLang>} />
        {LANGS.filter(l => l.code !== 'en').map(l => (
          <Route key={l.code} path={`/${l.code}`} element={<LangProvider lang={l.code}><App /></LangProvider>} />
        ))}
        <Route path="/blog" element={<LangProvider lang="en"><BlogIndex /></LangProvider>} />
        <Route path="/blog/:slug" element={<LangProvider lang="en"><BlogPost /></LangProvider>} />
        {(['es', 'fr', 'de', 'pt'] as const).flatMap(lc => [
          <Route key={`${lc}-bi`} path={`/${lc}/blog`} element={<LangProvider lang={lc}><BlogIndex /></LangProvider>} />,
          <Route key={`${lc}-bp`} path={`/${lc}/blog/:slug`} element={<LangProvider lang={lc}><BlogPost /></LangProvider>} />,
        ])}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    <Analytics />
    <SpeedInsights />
    </ErrorBoundary>
  </StrictMode>,
)

// Register PWA service worker (installable + offline shell)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => { /* SW optional; ignore failures */ })
  })
}
