import React, { useEffect, useState, useRef, useCallback } from 'react'
import mermaid from 'mermaid'
import {
  Code,
  Eye,
  Copy,
  Check,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  AlertTriangle,
  Maximize2,
  Minimize2,
  X,
  Move,
} from 'lucide-react'
import { useTheme } from '@/components/theme/ThemeProvider'

interface MermaidViewerProps {
  chart: string
}

export const MermaidViewer: React.FC<MermaidViewerProps> = ({ chart }) => {
  const { resolvedTheme } = useTheme()
  const [svgHtml, setSvgHtml] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [viewMode, setViewMode] = useState<'diagram' | 'code'>('diagram')
  const [copied, setCopied] = useState<boolean>(false)
  const [zoomLevel, setZoomLevel] = useState<number>(1)
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false)

  // Pan state for fullscreen exploration
  const [panPosition, setPanPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })

  const isDark = resolvedTheme === 'dark'

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setError(null)

    // Re-initialize mermaid with larger, high-resolution typography and expansive spacing
    mermaid.initialize({
      startOnLoad: false,
      theme: isDark ? 'dark' : 'neutral',
      securityLevel: 'loose',
      fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: 18,
      flowchart: {
        useMaxWidth: false,
        htmlLabels: true,
        curve: 'basis',
        nodeSpacing: 60,
        rankSpacing: 60,
        padding: 24,
      },
      sequence: {
        useMaxWidth: false,
        actorFontSize: 18,
        messageFontSize: 16,
        boxMargin: 12,
        boxTextMargin: 6,
      },
      themeVariables: isDark
        ? {
            darkMode: true,
            fontSize: '18px',
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
            fontSize: '18px',
            background: '#ffffff',
            primaryColor: '#f1f5f9',
            primaryTextColor: '#0f172a',
            primaryBorderColor: '#3b82f6',
            lineColor: '#475569',
            secondaryColor: '#f8fafc',
            tertiaryColor: '#ffffff',
            noteBkgColor: '#fef3c7',
            noteTextColor: '#78350f',
            noteBorderColor: '#f59e0b',
            actorBkg: '#ffffff',
            actorTextColor: '#0f172a',
            actorBorder: '#3b82f6',
            signalColor: '#1e293b',
            signalTextColor: '#0f172a',
            labelBoxBkgColor: '#f8fafc',
            labelBoxBorderColor: '#cbd5e1',
            labelTextColor: '#0f172a',
          },
    })

    const chartId = `mermaid-svg-${Math.random().toString(36).substring(2, 11)}`
    const cleanChart = chart.trim()

    mermaid
      .render(chartId, cleanChart)
      .then(({ svg }) => {
        if (isMounted) {
          // Normalize SVG to remove Mermaid's tiny inline max-width constraint (e.g. style="max-width: 400px;")
          // and allow it to render at large, crisp, high-resolution vector scale
          const normalizedSvg = svg
            .replace(/style="max-width:\s*[^;"]+;?"/gi, 'style="width: 100%; height: auto; max-width: 100%;"')
            .replace(/max-width:\s*\d+(\.\d+)?px;?/gi, '')

          setSvgHtml(normalizedSvg)
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

  // Handle ESC key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFullscreen])

  const handleCopyCode = () => {
    navigator.clipboard.writeText(chart)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 6.0))
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.4))
  const handleResetZoom = () => {
    setZoomLevel(1)
    setPanPosition({ x: 0, y: 0 })
  }

  const openFullscreen = () => {
    setIsFullscreen(true)
    setZoomLevel(1.5)
    setPanPosition({ x: 0, y: 0 })
  }

  const closeFullscreen = () => {
    setIsFullscreen(false)
    setZoomLevel(1)
    setPanPosition({ x: 0, y: 0 })
  }

  // Pan handlers for fullscreen drag
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true)
    dragStartRef.current = {
      x: e.clientX - panPosition.x,
      y: e.clientY - panPosition.y,
    }
  }, [panPosition])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return
    setPanPosition({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    })
  }, [isDragging])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Wheel zoom in fullscreen
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey || isFullscreen) {
      e.preventDefault()
      const delta = e.deltaY < 0 ? 0.2 : -0.2
      setZoomLevel((prev) => Math.min(Math.max(prev + delta, 0.4), 6.0))
    }
  }, [isFullscreen])

  return (
    <>
      {/* 1. In-Page Diagram Card with Hover Action Overlay */}
      <div className="my-8 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-colors group relative">
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
                <span className="text-[11px] font-mono px-1.5 text-slate-600 dark:text-slate-300 min-w-[42px] text-center font-bold">
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
                    title="Reset Zoom (100%)"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            )}

            {/* Fullscreen Button */}
            {viewMode === 'diagram' && !error && (
              <button
                onClick={openFullscreen}
                className="flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 transition-colors border border-indigo-200 dark:border-indigo-800"
                title="Open Fullscreen Zoom"
              >
                <Maximize2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Fullscreen</span>
              </button>
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

        {/* Main Diagram Area with Hover Overlay */}
        <div className="p-6 sm:p-10 overflow-x-auto bg-slate-50/40 dark:bg-slate-950/60 min-h-[180px] flex items-center justify-center overscroll-contain relative">
          {viewMode === 'diagram' ? (
            loading ? (
              <div className="py-12 text-center text-sm text-slate-400 flex flex-col items-center gap-2 animate-pulse">
                <div className="h-6 w-6 border-2 border-indigo-600 dark:border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                <span>Rendering high-resolution diagram...</span>
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
              <>
                {/* Visual Diagram - Expands naturally with crisp vector scale */}
                <div
                  onClick={openFullscreen}
                  style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
                  className="transition-transform duration-150 ease-out w-full flex justify-center [&>svg]:w-full [&>svg]:!max-w-none [&>svg]:min-w-[650px] sm:[&>svg]:min-w-[800px] 2xl:[&>svg]:min-w-[1050px] 3xl:[&>svg]:min-w-[1300px] [&>svg]:h-auto [&>svg]:drop-shadow-xs cursor-pointer py-2"
                  title="Click to Zoom Fullscreen"
                  dangerouslySetInnerHTML={{ __html: svgHtml }}
                />

                {/* Floating Hover Badge on Desktop */}
                <button
                  onClick={openFullscreen}
                  className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-slate-900/90 dark:bg-slate-800/90 text-white text-xs px-3 py-1.5 rounded-lg backdrop-blur-xs flex items-center space-x-1.5 shadow-lg pointer-events-auto hover:bg-indigo-600 dark:hover:bg-indigo-600"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                  <span>Click to Expand Fullscreen</span>
                </button>
              </>
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

      {/* 2. Fullscreen Interactive Lightbox Modal */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex flex-col animate-in fade-in duration-200 select-none"
          onWheel={handleWheel}
        >
          {/* Fullscreen Header Control Bar */}
          <div className="flex items-center justify-between px-6 py-4 bg-slate-900/80 border-b border-slate-800 text-white z-10">
            <div className="flex items-center space-x-3">
              <span className="font-bold text-base flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
                Architecture Diagram Viewport
              </span>
              <span className="text-slate-500 text-sm hidden md:inline">|</span>
              <span className="text-xs text-slate-400 font-mono hidden md:flex items-center gap-1">
                <Move className="h-3.5 w-3.5 text-slate-500" />
                Click & Drag to Pan • Mouse Wheel to Zoom (up to 600%)
              </span>
            </div>

            {/* Fullscreen Action Controls */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Zoom In / Out / Reset */}
              <div className="flex items-center bg-slate-800 rounded-xl p-1 border border-slate-700">
                <button
                  onClick={handleZoomOut}
                  className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
                <span className="text-xs font-mono px-2 text-slate-300 min-w-[48px] text-center font-bold">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  onClick={handleZoomIn}
                  className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
                <button
                  onClick={handleResetZoom}
                  className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white transition-colors ml-1 border-l border-slate-700"
                  title="Reset Position & Zoom (100%)"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>

              {/* Copy Code */}
              <button
                onClick={handleCopyCode}
                className="hidden sm:flex items-center space-x-1.5 px-3 py-2 text-xs font-medium rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                title="Copy Mermaid Code"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-green-400" />
                    <span className="text-green-400 font-semibold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Copy</span>
                  </>
                )}
              </button>

              {/* Close Button */}
              <button
                onClick={closeFullscreen}
                className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/40 text-red-300 border border-red-500/30 transition-colors flex items-center space-x-1"
                title="Close Fullscreen (Esc)"
              >
                <X className="h-5 w-5" />
                <span className="text-xs font-semibold hidden sm:inline pr-1">Exit</span>
              </button>
            </div>
          </div>

          {/* Fullscreen Interactive Canvas Area (Pan & Zoom) */}
          <div
            className={`flex-1 overflow-hidden flex items-center justify-center p-8 relative ${
              isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <div
              style={{
                transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${zoomLevel})`,
                transformOrigin: 'center center',
              }}
              className="transition-transform duration-75 ease-out max-w-none flex justify-center [&>svg]:w-auto [&>svg]:min-w-[900px] 2xl:[&>svg]:min-w-[1400px] 3xl:[&>svg]:min-w-[1800px] [&>svg]:h-auto [&>svg]:drop-shadow-2xl"
              dangerouslySetInnerHTML={{ __html: svgHtml }}
            />
          </div>

          {/* Fullscreen Bottom Helper Tip */}
          <div className="py-2.5 px-6 bg-slate-900/60 border-t border-slate-800/80 text-center text-xs text-slate-400 flex items-center justify-center gap-4">
            <span>
              Tip: Press <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300 font-mono">Esc</kbd> to exit fullscreen • Mouse Wheel zooms from 40% up to 600%
            </span>
          </div>
        </div>
      )}
    </>
  )
}
