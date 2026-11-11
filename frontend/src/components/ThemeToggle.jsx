import { createContext, useContext, useEffect, useState } from 'react'

const STORAGE_KEY = 'who-r-u-theme'
const DARK_QUERY = '(prefers-color-scheme: dark)'
const ThemeContext = createContext(null)

function readPreference() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    return saved === 'light' || saved === 'dark' ? saved : 'system'
  } catch {
    return 'system'
  }
}

function systemPrefersDark() {
  return typeof window !== 'undefined' && Boolean(window.matchMedia?.(DARK_QUERY).matches)
}

// Follow the system by default. Switching back to its current appearance clears
// the manual override, so there is no separate automatic-mode control.
export function ThemeProvider({ children }) {
  const [preference, setPreference] = useState(readPreference)
  const [systemDark, setSystemDark] = useState(systemPrefersDark)
  const isDark = preference === 'system' ? systemDark : preference === 'dark'

  useEffect(() => {
    const media = window.matchMedia?.(DARK_QUERY)
    if (!media) return
    setSystemDark(media.matches)
    const updateSystemTheme = (event) => setSystemDark(event.matches)
    media.addEventListener('change', updateSystemTheme)
    return () => media.removeEventListener('change', updateSystemTheme)
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = isDark ? 'dark' : 'light'
    document.querySelector('meta[name="theme-color"]')?.setAttribute(
      'content', isDark ? '#0e0e0e' : '#f3f3ef',
    )

    try {
      if (preference === 'system') window.localStorage.removeItem(STORAGE_KEY)
      else window.localStorage.setItem(STORAGE_KEY, preference)
    } catch {
      // A blocked store still allows the theme to change for this visit.
    }
  }, [isDark, preference])

  function toggleTheme() {
    const nextDark = !isDark
    setPreference(nextDark === systemDark ? 'system' : nextDark ? 'dark' : 'light')
  }

  return <ThemeContext.Provider value={{ isDark, toggleTheme }}>{children}</ThemeContext.Provider>
}

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useContext(ThemeContext)
  const toggleLabel = isDark ? 'Switch to light mode' : 'Switch to dark mode'

  return (
    <div className="theme-control" role="group" aria-label="Appearance">
      <button
        className="theme-toggle"
        type="button"
        aria-pressed={isDark}
        aria-label={toggleLabel}
        onClick={toggleTheme}
        title={toggleLabel}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          {isDark ? (
            <>
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </>
          ) : (
            <path d="M20.8 13.2A9 9 0 0 1 10.8 3.2a9 9 0 1 0 10 10Z" />
          )}
        </svg>
      </button>
    </div>
  )
}
