import React, { useState, useRef, useEffect } from 'react'
import { useTheme, Theme } from './ThemeProvider'
import { Sun, Moon, Laptop, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="h-9 w-9 2xl:h-11 2xl:w-11 p-0 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
        title={`Theme: ${theme} (Current: ${resolvedTheme})`}
        aria-label="Toggle theme"
      >
        {resolvedTheme === 'dark' ? (
          <Moon className="h-4 w-4 2xl:h-5 2xl:w-5 text-indigo-400" />
        ) : (
          <Sun className="h-4 w-4 2xl:h-5 2xl:w-5 text-amber-500" />
        )}
      </Button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1 z-50 text-xs sm:text-sm font-medium animate-in fade-in-80 zoom-in-95">
          <button
            onClick={() => {
              setTheme('light')
              setDropdownOpen(false)
            }}
            className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800 ${
              theme === 'light' ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-700 dark:text-slate-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Sun className="h-4 w-4 text-amber-500" />
              <span>Light</span>
            </div>
            {theme === 'light' && <Check className="h-3.5 w-3.5" />}
          </button>

          <button
            onClick={() => {
              setTheme('dark')
              setDropdownOpen(false)
            }}
            className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800 ${
              theme === 'dark' ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-700 dark:text-slate-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Moon className="h-4 w-4 text-indigo-400" />
              <span>Dark</span>
            </div>
            {theme === 'dark' && <Check className="h-3.5 w-3.5" />}
          </button>

          <button
            onClick={() => {
              setTheme('system')
              setDropdownOpen(false)
            }}
            className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800 ${
              theme === 'system' ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-700 dark:text-slate-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Laptop className="h-4 w-4 text-slate-400" />
              <span>System</span>
            </div>
            {theme === 'system' && <Check className="h-3.5 w-3.5" />}
          </button>
        </div>
      )}
    </div>
  )
}
