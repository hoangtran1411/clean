import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { parseDocsRegistry, docModules, DocItem } from '../data/docsRegistry'
import { DocsSidebar } from '../components/DocsSidebar'
import { DocMarkdownViewer, DocFontSize } from '../components/DocMarkdownViewer'
import { TableOfContents } from '../components/TableOfContents'
import { DocShareModal } from '../components/DocShareModal'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Share2,
  Copy,
  Check,
  BookOpen,
  Sparkles,
  Menu,
  X,
  Type,
  Maximize2,
  Minimize2,
  Compass,
  Keyboard,
  Command,
} from 'lucide-react'

export const DocsPage: React.FC = () => {
  const { category, docSlug } = useParams<{ category?: string; docSlug?: string }>()
  const navigate = useNavigate()

  const categories = useMemo(() => parseDocsRegistry(), [])

  // Flatten all docs into a linear array for Next/Previous navigation
  const allDocs = useMemo(() => {
    return categories.flatMap((c) => c.docs)
  }, [categories])

  // Resolve current active doc based on URL parameters
  const activeDoc: DocItem | null = useMemo(() => {
    if (category && docSlug) {
      const match = allDocs.find(
        (d) => d.category === category && d.slug === docSlug.toLowerCase()
      )
      if (match) return match
    }

    if (category) {
      const firstInCat = categories.find((c) => c.id === category)?.docs[0]
      if (firstInCat) return firstInCat
    }

    // Default to the first doc in the first category
    return allDocs[0] || null
  }, [category, docSlug, allDocs, categories])

  const [markdownContent, setMarkdownContent] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [copiedLink, setCopiedLink] = useState<boolean>(false)
  const [copiedContent, setCopiedContent] = useState<boolean>(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false)
  const [showShortcutsModal, setShowShortcutsModal] = useState<boolean>(false)
  const [showShareModal, setShowShareModal] = useState<boolean>(false)

  // Persistent Font Scaling Mode for 2K / 4K / Mobile displays
  const [fontSize, setFontSize] = useState<DocFontSize>(() => {
    const saved = localStorage.getItem('docs_font_size')
    if (saved === 'normal' || saved === 'large' || saved === 'xlarge') {
      return saved
    }
    return 'large' // Default to large for comfortable 2K readability
  })

  // Persistent Wide Canvas Mode
  const [isWideCanvas, setIsWideCanvas] = useState<boolean>(() => {
    return localStorage.getItem('docs_wide_canvas') === 'true'
  })

  const handleFontSizeChange = (size: DocFontSize) => {
    setFontSize(size)
    localStorage.setItem('docs_font_size', size)
  }

  const handleToggleWideCanvas = () => {
    setIsWideCanvas((prev) => {
      const next = !prev
      localStorage.setItem('docs_wide_canvas', String(next))
      return next
    })
  }

  // Load document content via Vite raw glob
  useEffect(() => {
    if (!activeDoc) return

    let isMounted = true
    setLoading(true)

    const loader = docModules[activeDoc.path]
    if (loader) {
      loader()
        .then((content) => {
          if (isMounted) {
            setMarkdownContent(content as string)
            setLoading(false)
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }
        })
        .catch((err) => {
          console.error('Failed to load markdown doc:', err)
          if (isMounted) {
            setMarkdownContent('# Error Loading Document\n\nUnable to load document content.')
            setLoading(false)
          }
        })
    } else {
      setMarkdownContent('# Document Not Found\n\nThe requested documentation path was not found.')
      setLoading(false)
    }

    return () => {
      isMounted = false
    }
  }, [activeDoc])

  const handleSelectDoc = (doc: DocItem) => {
    navigate(`/docs/${doc.category}/${doc.slug}`)
    setMobileSidebarOpen(false)
  }

  // Calculate Next & Previous docs
  const currentIndex = activeDoc ? allDocs.findIndex((d) => d.id === activeDoc.id) : -1
  const prevDoc = currentIndex > 0 ? allDocs[currentIndex - 1] : null
  const nextDoc = currentIndex >= 0 && currentIndex < allDocs.length - 1 ? allDocs[currentIndex + 1] : null

  // Global keyboard shortcuts for navigation, zoom, wide canvas & modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore shortcut if user is typing in an input or textarea
      const target = e.target as HTMLElement
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return
      }

      // Next Document: Alt + Right, or ']'
      if ((e.altKey && e.key === 'ArrowRight') || e.key === ']') {
        e.preventDefault()
        if (nextDoc) handleSelectDoc(nextDoc)
      }
      // Previous Document: Alt + Left, or '['
      else if ((e.altKey && e.key === 'ArrowLeft') || e.key === '[') {
        e.preventDefault()
        if (prevDoc) handleSelectDoc(prevDoc)
      }
      // Zoom In (Increase Font Size): Alt + '+' or Alt + '=' or (Ctrl + '+' / Ctrl + '=')
      else if ((e.altKey || e.ctrlKey) && (e.key === '=' || e.key === '+')) {
        e.preventDefault()
        if (fontSize === 'normal') handleFontSizeChange('large')
        else if (fontSize === 'large') handleFontSizeChange('xlarge')
      }
      // Zoom Out (Decrease Font Size): Alt + '-' or (Ctrl + '-')
      else if ((e.altKey || e.ctrlKey) && e.key === '-') {
        e.preventDefault()
        if (fontSize === 'xlarge') handleFontSizeChange('large')
        else if (fontSize === 'large') handleFontSizeChange('normal')
      }
      // Reset Zoom: Alt + '0' or Ctrl + '0'
      else if ((e.altKey || e.ctrlKey) && e.key === '0') {
        e.preventDefault()
        handleFontSizeChange('normal')
      }
      // Wide Canvas Toggle: Alt + 'w' or Alt + 'W'
      else if (e.altKey && (e.key === 'w' || e.key === 'W')) {
        e.preventDefault()
        handleToggleWideCanvas()
      }
      // Keyboard Shortcuts Cheat Sheet: '?' or Shift + '/'
      else if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault()
        setShowShortcutsModal((prev) => !prev)
      }
      // Close Modals: Esc
      else if (e.key === 'Escape') {
        setShowShortcutsModal(false)
        setShowShareModal(false)
        setMobileSidebarOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [nextDoc, prevDoc, fontSize, isWideCanvas])

  // Reading time calculation (~200 words/min)
  const readingTime = useMemo(() => {
    const words = markdownContent.trim().split(/\s+/).length
    const minutes = Math.ceil(words / 200)
    return `${minutes} min read`
  }, [markdownContent])

  const currentCategoryMeta = categories.find((c) => c.id === activeDoc?.category)

  const handleCopyRawMarkdown = () => {
    navigator.clipboard.writeText(markdownContent)
    setCopiedContent(true)
    setTimeout(() => setCopiedContent(false), 2000)
  }

  return (
    <div className={`flex flex-col space-y-4 sm:space-y-6 ${isWideCanvas ? 'w-full' : 'max-w-7xl 2xl:max-w-[1720px] 3xl:max-w-[2100px] 4xl:max-w-[2560px] mx-auto'}`}>
      {/* Mobile Sticky Bar */}
      <div className="flex items-center justify-between lg:hidden bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm sticky top-16 z-30 transition-colors">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setMobileSidebarOpen(true)}
          className="flex items-center space-x-2 h-10 px-3 text-slate-800 dark:text-slate-200 font-semibold border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700"
        >
          <Compass className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span>Browse All ({allDocs.length})</span>
        </Button>

        <div className="flex items-center space-x-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowShortcutsModal(true)}
            className="h-9 px-2 text-slate-600 dark:text-slate-300"
            title="Keyboard Shortcuts (?)"
          >
            <Keyboard className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowShareModal(true)}
            className="h-9 px-2.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            title="Share Guide to Socials & Channels"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="w-[85vw] max-w-sm h-full bg-white dark:bg-slate-900 shadow-2xl animate-in slide-in-from-left duration-300 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <DocsSidebar
              categories={categories}
              selectedDoc={activeDoc}
              onSelectDoc={handleSelectDoc}
              totalDocsCount={allDocs.length}
              isMobileDrawer={true}
              onCloseDrawer={() => setMobileSidebarOpen(false)}
            />
          </div>
          <div className="flex-1" onClick={() => setMobileSidebarOpen(false)} />
        </div>
      )}

      {/* Main Layout Grid */}
      <div className="flex flex-col lg:flex-row gap-6 2xl:gap-8 3xl:gap-10 items-start">
        {/* Desktop Sidebar (Fixed on Desktop/iPad Landscape) */}
        <div className="hidden lg:block w-80 2xl:w-96 3xl:w-[420px] 4xl:w-[460px] shrink-0 z-20">
          <DocsSidebar
            categories={categories}
            selectedDoc={activeDoc}
            onSelectDoc={handleSelectDoc}
            totalDocsCount={allDocs.length}
          />
        </div>

        {/* Center Main Document Article */}
        <main className="flex-1 min-w-0 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-10 2xl:p-14 3xl:p-16 transition-colors">
          {loading ? (
            <div className="py-24 text-center text-slate-400 dark:text-slate-500 flex flex-col items-center justify-center space-y-4">
              <div className="h-10 w-10 border-4 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-base sm:text-lg font-medium">Loading documentation guide...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Document Header Metadata & Responsive Action Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
                {/* Category Badge & Breadcrumbs */}
                <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  <Badge variant="secondary" className="px-2.5 py-1 text-xs sm:text-sm font-semibold flex items-center gap-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                    <span>{currentCategoryMeta?.icon}</span>
                    <span>{currentCategoryMeta?.name}</span>
                  </Badge>
                  <span className="text-slate-300 dark:text-slate-700">/</span>
                  <span className="font-mono text-slate-600 dark:text-slate-300 text-xs sm:text-sm">{activeDoc?.slug}.md</span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="flex items-center text-xs sm:text-sm">
                    <Clock className="h-3.5 w-3.5 mr-1 text-slate-400" />
                    {readingTime}
                  </span>
                </div>

                {/* Document Actions & Ergonomic Tool Controls */}
                <div className="flex items-center flex-wrap gap-2">
                  {/* Font Scaler Mode */}
                  <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700">
                    <span className="text-xs text-slate-400 pl-2 pr-1 select-none flex items-center">
                      <Type className="h-3 w-3" />
                    </span>
                    <button
                      onClick={() => handleFontSizeChange('normal')}
                      className={`px-2.5 py-1 text-xs sm:text-sm font-semibold rounded transition-all min-h-[28px] ${
                        fontSize === 'normal'
                          ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                      title="Standard 100% Font Size (Alt+0)"
                    >
                      A
                    </button>
                    <button
                      onClick={() => handleFontSizeChange('large')}
                      className={`px-2.5 py-1 text-xs sm:text-sm font-bold rounded transition-all min-h-[28px] ${
                        fontSize === 'large'
                          ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                      title="Comfortable 2K 125% Font Size (Alt++)"
                    >
                      A+
                    </button>
                    <button
                      onClick={() => handleFontSizeChange('xlarge')}
                      className={`px-2.5 py-1 text-sm sm:text-base font-extrabold rounded transition-all min-h-[28px] ${
                        fontSize === 'xlarge'
                          ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                      title="Large 4K 150% Font Size"
                    >
                      A++
                    </button>
                  </div>

                  {/* Wide Canvas Toggle */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleToggleWideCanvas}
                    className="hidden sm:inline-flex text-xs sm:text-sm h-9 px-2.5 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700"
                    title={isWideCanvas ? 'Standard Layout (Alt+W)' : '2K Wide Canvas (Alt+W)'}
                  >
                    {isWideCanvas ? (
                      <>
                        <Minimize2 className="h-3.5 w-3.5 mr-1" />
                        <span>Standard</span>
                      </>
                    ) : (
                      <>
                        <Maximize2 className="h-3.5 w-3.5 mr-1" />
                        <span>Wide</span>
                      </>
                    )}
                  </Button>

                  {/* Keyboard Shortcuts Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowShortcutsModal(true)}
                    className="hidden md:inline-flex text-xs sm:text-sm h-9 px-2.5 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700"
                    title="Keyboard Shortcuts (?)"
                  >
                    <Keyboard className="h-3.5 w-3.5 mr-1 text-slate-500" />
                    <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">?</span>
                  </Button>

                  {/* Source & Share Buttons */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyRawMarkdown}
                    className="text-xs sm:text-sm h-9 px-2.5 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700"
                    title="Copy Markdown Source"
                  >
                    {copiedContent ? (
                      <>
                        <Check className="h-3.5 w-3.5 mr-1 text-green-600 dark:text-green-400" />
                        <span className="text-green-600 dark:text-green-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 mr-1" />
                        <span>Source</span>
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowShareModal(true)}
                    className="text-xs sm:text-sm h-9 px-2.5 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700"
                    title="Share Guide to Socials & Channels"
                  >
                    <Share2 className="h-3.5 w-3.5 mr-1" />
                    <span>Share</span>
                  </Button>
                </div>
              </div>

              {/* Rendered Document Body with Selected Font Scale */}
              <article className="py-6 sm:py-8 2xl:py-10">
                <DocMarkdownViewer content={markdownContent} fontSize={fontSize} />
              </article>

              {/* Document Pagination Footer (Previous / Next with Keyboard Hints) */}
              <div className="pt-8 sm:pt-10 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {prevDoc ? (
                  <button
                    onClick={() => handleSelectDoc(prevDoc)}
                    className="flex flex-col items-start p-4 sm:p-5 2xl:p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 hover:bg-blue-50/70 dark:bg-slate-800/80 dark:hover:bg-slate-800 hover:border-blue-300 dark:hover:border-blue-500 transition-all text-left group shadow-xs min-h-[76px]"
                  >
                    <div className="flex items-center justify-between w-full mb-1.5">
                      <span className="text-xs sm:text-sm 2xl:text-base text-slate-500 dark:text-slate-400 flex items-center group-hover:text-blue-600 dark:group-hover:text-blue-400 font-semibold transition-colors">
                        <ChevronLeft className="h-4 w-4 mr-1" /> Previous Guide
                      </span>
                      <kbd className="hidden sm:inline px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded border border-slate-200 dark:border-slate-600 shadow-2xs">
                        Alt + ←
                      </kbd>
                    </div>
                    <span className="text-sm sm:text-base 2xl:text-xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-1 transition-colors">
                      {prevDoc.title}
                    </span>
                  </button>
                ) : (
                  <div></div>
                )}

                {nextDoc ? (
                  <button
                    onClick={() => handleSelectDoc(nextDoc)}
                    className="flex flex-col items-end p-4 sm:p-5 2xl:p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 hover:bg-blue-50/70 dark:bg-slate-800/80 dark:hover:bg-slate-800 hover:border-blue-300 dark:hover:border-blue-500 transition-all text-right group shadow-xs min-h-[76px]"
                  >
                    <div className="flex items-center justify-between w-full mb-1.5">
                      <kbd className="hidden sm:inline px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded border border-slate-200 dark:border-slate-600 shadow-2xs">
                        Alt + →
                      </kbd>
                      <span className="text-xs sm:text-sm 2xl:text-base text-slate-500 dark:text-slate-400 flex items-center group-hover:text-blue-600 dark:group-hover:text-blue-400 font-semibold transition-colors">
                        Next Guide <ChevronRight className="h-4 w-4 ml-1" />
                      </span>
                    </div>
                    <span className="text-sm sm:text-base 2xl:text-xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-1 transition-colors">
                      {nextDoc.title}
                    </span>
                  </button>
                ) : (
                  <div></div>
                )}
              </div>
            </div>
          )}
        </main>

        {/* Right Sticky Table of Contents (Desktop) & Floating Modal (Mobile/iPad) */}
        {!loading && <TableOfContents content={markdownContent} />}
      </div>

      {/* Keyboard Shortcuts Dialog Modal */}
      {showShortcutsModal && (
        <div
          className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setShowShortcutsModal(false)}
        >
          <div
            className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/90">
              <div className="flex items-center space-x-2 text-slate-900 dark:text-slate-100 font-bold text-base">
                <Keyboard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span>Documentation Keyboard Shortcuts</span>
              </div>
              <button
                onClick={() => setShowShortcutsModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                title="Close (Esc)"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Shortcuts List */}
            <div className="p-5 space-y-3.5 text-sm divide-y divide-slate-100 dark:divide-slate-800">
              <div className="flex items-center justify-between pt-2 first:pt-0">
                <span className="text-slate-700 dark:text-slate-300">Navigate to Next Guide</span>
                <div className="flex items-center space-x-1 font-mono">
                  <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-xs text-slate-800 dark:text-slate-200 font-bold">Alt</kbd>
                  <span className="text-slate-400">+</span>
                  <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-xs text-slate-800 dark:text-slate-200 font-bold">→</kbd>
                  <span className="text-xs text-slate-400 font-sans mx-1">or</span>
                  <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-xs text-slate-800 dark:text-slate-200 font-bold">]</kbd>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3">
                <span className="text-slate-700 dark:text-slate-300">Navigate to Previous Guide</span>
                <div className="flex items-center space-x-1 font-mono">
                  <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-xs text-slate-800 dark:text-slate-200 font-bold">Alt</kbd>
                  <span className="text-slate-400">+</span>
                  <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-xs text-slate-800 dark:text-slate-200 font-bold">←</kbd>
                  <span className="text-xs text-slate-400 font-sans mx-1">or</span>
                  <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-xs text-slate-800 dark:text-slate-200 font-bold">[</kbd>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3">
                <span className="text-slate-700 dark:text-slate-300">Zoom In (Increase Font Size)</span>
                <div className="flex items-center space-x-1 font-mono">
                  <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-xs text-slate-800 dark:text-slate-200 font-bold">Alt</kbd>
                  <span className="text-slate-400">+</span>
                  <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-xs text-slate-800 dark:text-slate-200 font-bold">+</kbd>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3">
                <span className="text-slate-700 dark:text-slate-300">Zoom Out (Decrease Font Size)</span>
                <div className="flex items-center space-x-1 font-mono">
                  <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-xs text-slate-800 dark:text-slate-200 font-bold">Alt</kbd>
                  <span className="text-slate-400">+</span>
                  <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-xs text-slate-800 dark:text-slate-200 font-bold">-</kbd>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3">
                <span className="text-slate-700 dark:text-slate-300">Reset Zoom / Normal Font</span>
                <div className="flex items-center space-x-1 font-mono">
                  <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-xs text-slate-800 dark:text-slate-200 font-bold">Alt</kbd>
                  <span className="text-slate-400">+</span>
                  <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-xs text-slate-800 dark:text-slate-200 font-bold">0</kbd>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3">
                <span className="text-slate-700 dark:text-slate-300">Toggle 2K/4K Wide Canvas</span>
                <div className="flex items-center space-x-1 font-mono">
                  <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-xs text-slate-800 dark:text-slate-200 font-bold">Alt</kbd>
                  <span className="text-slate-400">+</span>
                  <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-xs text-slate-800 dark:text-slate-200 font-bold">W</kbd>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3">
                <span className="text-slate-700 dark:text-slate-300">Open Keyboard Shortcuts</span>
                <div className="flex items-center space-x-1 font-mono">
                  <kbd className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-xs text-slate-800 dark:text-slate-200 font-bold">?</kbd>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
              Press <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-slate-700 dark:text-slate-200 font-mono">Esc</kbd> anytime to dismiss modal
            </div>
          </div>
        </div>
      )}

      {/* Social & Channel Quick Share Modal */}
      <DocShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        docTitle={activeDoc?.title || ''}
        categoryName={currentCategoryMeta?.name || 'Clean Architecture'}
        url={window.location.href}
      />
    </div>
  )
}
