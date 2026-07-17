import { Component, type ReactNode } from 'react'

// Catches render-time errors so users never see a blank screen — they get a Reload option instead.
export class ErrorBoundary extends Component<{ children: ReactNode }, { error: boolean }> {
  state = { error: false }

  static getDerivedStateFromError() {
    return { error: true }
  }

  componentDidCatch(error: unknown) {
    console.error('App render error:', error)
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 16, padding: 24, background: '#0a0a0a', color: '#fff', textAlign: 'center',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}>
          <img src="/logo-192.png" alt="Multi Converter" width={56} height={56} style={{ borderRadius: 12 }} />
          <p style={{ fontSize: 16, opacity: 0.85, margin: 0, maxWidth: 320 }}>Something went wrong while loading the app.</p>
          <button
            onClick={() => window.location.reload()}
            style={{ padding: '11px 22px', borderRadius: 10, background: '#ff9500', color: '#fff', fontWeight: 700, border: 'none', fontSize: 14, cursor: 'pointer' }}
          >
            Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
