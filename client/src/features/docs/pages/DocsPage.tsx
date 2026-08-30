import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { parseDocsRegistry, docModules, DocItem } from '../data/docsRegistry'
import { DocsSidebar } from '../components/DocsSidebar'
import { DocMarkdownViewer, DocFontSize } from '../components/DocMarkdownViewer'
import { TableOfContents } from '../components/TableOfContents'
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

    // Default to first doc in first category (e.g. frontend overview)
    return allDocs[0] || null
  }, [category, docSlug, allDocs, categories])

  const [markdownContent, setMarkdownContent] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [copiedLink, setCopiedLink] = useState<boolean>(false)
  const [copiedContent, setCopiedContent] = useState<boolean>(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false)

  // Font Size scale state with localStorage persistence
  const [fontSize, setFontSize] = useState<DocFontSize>(() => {
    return (localStorage.getItem('docs_font_size') as DocFontSize) || 'large'
  })

  // Full-width canvas toggle for 2K/4K monitors
  const [isWideCanvas, setIsWideCanvas] = useState<boolean>(() => {
    return localStorage.getItem('docs_wide_canvas') === 'true' || true
  })

  const handleFontSizeChange = (size: DocFontSize) => {
    setFontSize(size)
    localStorage.setItem('docs_font_size', size)
  }

  const handleToggleWideCanvas = () => {
    const next = !isWideCanvas
    setIsWideCanvas(next)
    localStorage.setItem('docs_wide_canvas', String(next))
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

  // Reading time calculation (~200 words/min)
  const readingTime = useMemo(() => {
    const words = markdownContent.trim().split(/\s+/).length
    const minutes = Math.ceil(words / 200)
    return `${minutes} min read`
  }, [markdownContent])

  const currentCategoryMeta = categories.find((c) => c.id === activeDoc?.category)

  const handleShareLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const handleCopyRawMarkdown = () => {
    navigator.clipboard.writeText(markdownContent)
    setCopiedContent(true)
    setTimeout(() => setCopiedContent(false), 2000)
  }

  return (
    <div className={`flex flex-col space-y-4 sm:space-y-6 ${isWideCanvas ? 'w-full' : 'max-w-7xl mx-auto'}`}>
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

        <div className="flex items-center space-x-1.5 overflow-hidden">
          <Badge variant="outline" className="text-xs bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 truncate max-w-[150px]">
            {currentCategoryMeta?.icon} {activeDoc?.title}
          </Badge>
        </div>
      </div>

      {/* Mobile Drawer Overlay & Modal */}
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
      <div className="flex flex-col lg:flex-row gap-6 2xl:gap-8 items-start">
        {/* Desktop Sidebar (Fixed on Desktop/iPad Landscape) */}
        <div className="hidden lg:block w-80 2xl:w-96 shrink-0 z-20">
          <DocsSidebar
            categories={categories}
            selectedDoc={activeDoc}
            onSelectDoc={handleSelectDoc}
            totalDocsCount={allDocs.length}
          />
        </div>

        {/* Center Main Document Article */}
        <main className="flex-1 min-w-0 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden w-full transition-colors">
          {loading ? (
            <div className="p-8 sm:p-12 2xl:p-16 space-y-6 animate-pulse">
              <div className="h-10 2xl:h-12 bg-slate-200 dark:bg-slate-800 rounded w-2/3"></div>
              <div className="h-6 bg-slate-100 dark:bg-slate-850 rounded w-1/3"></div>
              <div className="space-y-3 pt-8">
                <div className="h-5 bg-slate-100 dark:bg-slate-800 rounded w-full"></div>
                <div className="h-5 bg-slate-100 dark:bg-slate-800 rounded w-5/6"></div>
                <div className="h-5 bg-slate-100 dark:bg-slate-800 rounded w-4/6"></div>
              </div>
            </div>
          ) : (
            <div className="p-5 sm:p-8 md:p-10 2xl:p-14">
              {/* Document Breadcrumb & Action Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 2xl:pb-8 border-b border-slate-100 dark:border-slate-800">
                {/* Breadcrumbs */}
                <div className="flex items-center space-x-2 text-xs sm:text-sm 2xl:text-base text-slate-500 dark:text-slate-400 flex-wrap">
                  <span className="flex items-center space-x-1.5 font-bold text-slate-800 dark:text-slate-200">
                    <BookOpen className="h-4 w-4 2xl:h-5 2xl:w-5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>Docs</span>
                  </span>
                  <span>/</span>
                  <Badge variant="outline" className="text-xs sm:text-sm 2xl:text-base bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 px-2.5 py-0.5">
                    {currentCategoryMeta?.icon} {currentCategoryMeta?.name}
                  </Badge>
                  <span>/</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100 truncate max-w-[200px] sm:max-w-[280px] 2xl:max-w-[420px]">
                    {activeDoc?.title}
                  </span>
                </div>

                {/* Top Action & Display Controls */}
                <div className="flex items-center flex-wrap gap-2 sm:gap-3">
                  {/* Reading Time */}
                  <div className="flex items-center text-xs sm:text-sm 2xl:text-base text-slate-500 dark:text-slate-400 font-medium mr-1">
                    <Clock className="h-4 w-4 mr-1 text-slate-400 dark:text-slate-500" />
                    <span>{readingTime}</span>
                  </div>

                  {/* Font Size Switcher */}
                  <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
                    <Type className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400 ml-1 mr-1" />
                    <button
                      onClick={() => handleFontSizeChange('normal')}
                      className={`px-2 py-1 text-xs font-semibold rounded transition-all min-h-[28px] ${
                        fontSize === 'normal'
                          ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                      title="Standard Font Size"
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
                      title="Comfortable 2K Font Size"
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
                      title="Large 4K Font Size"
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
                    title={isWideCanvas ? 'Standard Layout' : '2K Wide Canvas'}
                  >
                    {isWideCanvas ? (
                      <>
                        <Minimize2 className="h-3.5 w-3.5 mr-1" />
                        <span>Standard</span>
                      </>
                    ) : (
                      <>
                        <Maximize2 className="h-3.5 w-3.5 mr-1" />
                        <span>2K Wide</span>
                      </>
                    )}
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
                    onClick={handleShareLink}
                    className="text-xs sm:text-sm h-9 px-2.5 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700"
                    title="Share link to this guide"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="h-3.5 w-3.5 mr-1 text-green-600 dark:text-green-400" />
                        <span className="text-green-600 dark:text-green-400">Link Copied</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="h-3.5 w-3.5 mr-1" />
                        <span>Share</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Rendered Document Body with Selected Font Scale */}
              <article className="py-6 sm:py-8 2xl:py-10">
                <DocMarkdownViewer content={markdownContent} fontSize={fontSize} />
              </article>

              {/* Document Pagination Footer (Previous / Next) */}
              <div className="pt-8 sm:pt-10 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {prevDoc ? (
                  <button
                    onClick={() => handleSelectDoc(prevDoc)}
                    className="flex flex-col items-start p-4 sm:p-5 2xl:p-6 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-600 bg-white dark:bg-slate-850 hover:bg-blue-50/40 dark:hover:bg-slate-800 transition-all text-left group shadow-xs min-h-[70px]"
                  >
                    <span className="text-xs sm:text-sm 2xl:text-base text-slate-400 dark:text-slate-400 flex items-center mb-1.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 font-semibold">
                      <ChevronLeft className="h-4 w-4 mr-1" /> Previous Guide
                    </span>
                    <span className="text-sm sm:text-base 2xl:text-xl font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-900 dark:group-hover:text-white line-clamp-1">
                      {prevDoc.title}
                    </span>
                  </button>
                ) : (
                  <div></div>
                )}

                {nextDoc ? (
                  <button
                    onClick={() => handleSelectDoc(nextDoc)}
                    className="flex flex-col items-end p-4 sm:p-5 2xl:p-6 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-600 bg-white dark:bg-slate-850 hover:bg-blue-50/40 dark:hover:bg-slate-800 transition-all text-right group shadow-xs min-h-[70px]"
                  >
                    <span className="text-xs sm:text-sm 2xl:text-base text-slate-400 dark:text-slate-400 flex items-center mb-1.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 font-semibold">
                      Next Guide <ChevronRight className="h-4 w-4 ml-1" />
                    </span>
                    <span className="text-sm sm:text-base 2xl:text-xl font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-900 dark:group-hover:text-white line-clamp-1">
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
    </div>
  )
}
