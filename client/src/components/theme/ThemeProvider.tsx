import React, { createContext, useContext, useEffect, useState } from 'react'

export type Theme = 'light' | 'dark' | 'system'

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

interface ThemeProviderState {
  theme: Theme
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const initialState: ThemeProviderState = {
  theme: 'system',
  resolvedTheme: 'light',
  setTheme: () => null,
  toggleTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'clean-arch-theme',
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem(storageKey) as Theme) || defaultTheme
  })

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const root = window.document.documentElement
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const applyTheme = (currentTheme: Theme) => {
      root.classList.remove('light', 'dark')

      let effectiveTheme: 'light' | 'dark'
      if (currentTheme === 'system') {
        effectiveTheme = mediaQuery.matches ? 'dark' : 'light'
      } else {
        effectiveTheme = currentTheme
      }

      root.classList.add(effectiveTheme)
      setResolvedTheme(effectiveTheme)
    }

    applyTheme(theme)

    const handleMediaChange = () => {
      if (theme === 'system') {
        applyTheme('system')
      }
    }

    mediaQuery.addEventListener('change', handleMediaChange)
    return () => mediaQuery.removeEventListener('change', handleMediaChange)
  }, [theme])

  const value = {
    theme,
    resolvedTheme,
    setTheme: (newTheme: Theme) => {
      localStorage.setItem(storageKey, newTheme)
      setTheme(newTheme)
    },
    toggleTheme: () => {
      const nextTheme = resolvedTheme === 'dark' ? 'light' : 'dark'
      localStorage.setItem(storageKey, nextTheme)
      setTheme(nextTheme)
    },
  }

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
