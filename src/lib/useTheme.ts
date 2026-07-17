import { useEffect } from 'react'
import { usePersistentState } from '../hooks/usePersistentState'

// Shared dark/light theme (same persisted key + class toggle the converter uses),
// so the blog matches the app and remembers the user's choice.
export function useTheme() {
  const [theme, setTheme] = usePersistentState<'dark' | 'light'>('web_theme', 'dark')
  const isDark = theme === 'dark'

  useEffect(() => {
    document.documentElement.classList.toggle('theme-light', !isDark)
  }, [isDark])

  return { theme, setTheme, isDark }
}
