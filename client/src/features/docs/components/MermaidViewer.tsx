import React, { useEffect, useState, useRef } from 'react'
import mermaid from 'mermaid'
import { Code, Eye, Copy, Check, ZoomIn, ZoomOut, RotateCcw, AlertTriangle } from 'lucide-react'
import { useTheme } from '@/components/theme/ThemeProvider'

interface MermaidViewerProps {
  chart: string
}

export const MermaidViewer: React.FC<MermaidViewerProps> = ({ chart }) => {
  const { resolvedTheme } = useTheme()
  const containerRef = useRef<HTMLDivElement>(null)
  const [svgHtml, setSvgHtml] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [viewMode, setViewMode] = useState<'diagram' | 'code'>('diagram')
  const [copied, setCopied] = useState<boolean>(false)
  const [zoomLevel, setZoomLevel] = useState<number>(1)

  const isDark = resolvedTheme === 'dark'

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setError(null)

    // Re-initialize mermaid with current light/dark theme variables
    mermaid.initialize({
      startOnLoad: false,
      theme: isDark ? 'dark' : 'neutral',
      securityLevel: 'loose',
      fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      themeVariables: isDark
        ? {
            darkMode: true,
            background: '#0f172a',
            primaryColor: '#312e81',
            primaryTextColor: '#e0e7ff',
            primaryBorderColor: '#818cf8',
            lineColor: '#94a3b8',
            secondaryColor: '#1e293b',
            tertiaryColor: '#0f172a',
            noteBkgColor: '#1e293b',
            noteTextColor: '#cbd5e1',
          }
        : {
            darkMode: false,
            background: '#ffffff',
            primaryColor: '#e0e7ff',
            primaryTextColor: '#1e1b4b',
            primaryBorderColor: '#6366f1',
            lineColor: '#64748b',
            secondaryColor: '#f1f5f9',
            tertiaryColor: '#ffffff',
          },
    })

    const chartId = `mermaid-svg-${Math.random().toString(36).substring(2, 11)}`
    const cleanChart = chart.trim()

    mermaid
      .render(chartId, cleanChart)
      .then(({ svg }) => {
        if (isMounted) {
          setSvgHtml(svg)
          setLoading(false)
        }
      })
      .catch((err) => {
        console.warn('Mermaid rendering failed:', err)
        if (isMounted) {
          setError(err?.message || 'Unable to render Mermaid diagram.')
          setLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [chart, isDark])

  const handleCopyCode = () => {
    navigator.clipboard.writeText(chart)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.2, 2.5))
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.2, 0.6))
  const handleResetZoom = () => setZoomLevel(1)

  return (
    <div className="my-8 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-colors">
      {/* Top Diagram Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300 flex-wrap gap-2">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-indigo-600 dark:bg-indigo-400"></span>
            Architecture Diagram
          </span>
          <span className="text-slate-400 dark:text-slate-600">|</span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            {isDark ? 'Dark Theme' : 'Light Theme'}
          </span>
        </div>

        <div className="flex items-center space-x-1.5">
          {/* Zoom Controls (Active in diagram mode) */}
          {viewMode === 'diagram' && !error && (
            <div className="hidden sm:flex items-center space-x-1 mr-2 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
              <button
                onClick={handleZoomOut}
                className="p-1 rounded hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
              <span className="text-[11px] font-mono px-1 text-slate-600 dark:text-slate-300 min-w-[36px] text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                className="p-1 rounded hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
              {zoomLevel !== 1 && (
                <button
                  onClick={handleResetZoom}
                  className="p-1 rounded hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                  title="Reset Zoom"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Mode Switcher: Diagram vs Code */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('diagram')}
              className={`flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                viewMode === 'diagram'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Diagram</span>
            </button>
            <button
              onClick={() => setViewMode('code')}
              className={`flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                viewMode === 'code'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Code className="h-3.5 w-3.5" />
              <span>Source</span>
            </button>
          </div>

          {/* Copy Button */}
          <button
            onClick={handleCopyCode}
            className="flex items-center space-x-1 px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors ml-1"
            title="Copy Mermaid Code"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                <span className="text-green-600 dark:text-green-400 font-semibold">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Diagram Area */}
      <div className="p-4 sm:p-8 overflow-x-auto bg-slate-50/40 dark:bg-slate-950/60 min-h-[140px] flex items-center justify-center overscroll-contain">
        {viewMode === 'diagram' ? (
          loading ? (
            <div className="py-8 text-center text-sm text-slate-400 flex flex-col items-center gap-2 animate-pulse">
              <div className="h-6 w-6 border-2 border-indigo-600 dark:border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
              <span>Rendering visual diagram...</span>
            </div>
          ) : error ? (
            <div className="w-full p-4 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm">
                <p className="font-bold">Diagram Render Notice</p>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                  Showing source code fallback. You can toggle to 'Source' tab to inspect.
                </p>
                <pre className="mt-3 p-3 bg-slate-900 text-slate-200 rounded-lg overflow-x-auto text-xs font-mono">
                  {chart}
                </pre>
              </div>
            </div>
          ) : (
            <div
              ref={containerRef}
              style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
              className="transition-transform duration-150 ease-out max-w-full flex justify-center [&>svg]:max-w-none [&>svg]:h-auto [&>svg]:drop-shadow-xs"
              dangerouslySetInnerHTML={{ __html: svgHtml }}
            />
          )
        ) : (
          <div className="w-full">
            <pre className="p-4 bg-slate-950 text-slate-200 rounded-xl overflow-x-auto text-xs sm:text-sm font-mono leading-relaxed border border-slate-800">
              <code>{chart}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
