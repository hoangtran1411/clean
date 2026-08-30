import React, { useEffect, useState } from 'react'
import { ListTree, X, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TocItem {
  id: string
  text: string
  level: number
}

interface TableOfContentsProps {
  content: string
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({ content }) => {
  const [headings, setHeadings] = useState<TocItem[]>([])
  const [activeId, setActiveId] = useState<string>('')
  const [mobileTocOpen, setMobileTocOpen] = useState<boolean>(false)

  // Extract H2 and H3 headings from markdown text
  useEffect(() => {
    const lines = content.split('\n')
    const items: TocItem[] = []

    for (const line of lines) {
      const h2Match = line.match(/^##\s+(.+)$/)
      const h3Match = line.match(/^###\s+(.+)$/)

      if (h2Match) {
        const text = h2Match[1].replace(/\[!.*?\]/g, '').replace(/[*_`]/g, '').trim()
        const id = slugify(text)
        items.push({ id, text, level: 2 })
      } else if (h3Match) {
        const text = h3Match[1].replace(/\[!.*?\]/g, '').replace(/[*_`]/g, '').trim()
        const id = slugify(text)
        items.push({ id, text, level: 3 })
      }
    }

    setHeadings(items)
  }, [content])

  // Scroll spy to highlight active heading
  useEffect(() => {
    const handleScroll = () => {
      const headingElements = headings.map((h) => document.getElementById(h.id)).filter(Boolean)
      const scrollPosition = window.scrollY + 140

      for (let i = headingElements.length - 1; i >= 0; i--) {
        const el = headingElements[i]
        if (el && el.offsetTop <= scrollPosition) {
          setActiveId(el.id)
          break
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [headings])

  if (headings.length === 0) {
    return null
  }

  const handleMobileNav = (id: string) => {
    setMobileTocOpen(false)
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <>
      {/* 1. Desktop & 2K/4K Compact Sticky TOC (2/3 scale of previous width) */}
      <div className="w-48 2xl:w-60 3xl:w-[250px] 4xl:w-[280px] hidden xl:block shrink-0 sticky top-[120px] 2xl:top-[144px] h-[calc(100dvh-130px)] 2xl:h-[calc(100dvh-154px)] overflow-y-auto pl-3.5 border-l border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-1.5 text-[11px] 2xl:text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-3">
          <ListTree className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
          <span>On This Page</span>
        </div>

        <nav className="space-y-1 text-xs leading-snug">
          {headings.map((item, idx) => {
            const isActive = activeId === item.id

            return (
              <a
                key={idx}
                href={`#${item.id}`}
                className={`block transition-all py-1 leading-snug truncate ${
                  item.level === 3 ? 'pl-3 text-[11px] text-slate-500 dark:text-slate-400' : 'pl-0 font-medium text-slate-700 dark:text-slate-300'
                } ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400 font-bold border-l-2 border-blue-600 dark:border-blue-400 -ml-3.5 pl-3 bg-blue-50/60 dark:bg-blue-950/40 rounded-r'
                    : 'hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-r'
                }`}
                title={item.text}
              >
                {item.text}
              </a>
            )
          })}
        </nav>
      </div>

      {/* 2. Floating Quick Jump Button on Mobile & iPad / Tablet */}
      <div className="xl:hidden fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setMobileTocOpen(true)}
          className="rounded-full shadow-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2 px-4 py-3 h-12 text-sm font-semibold border-2 border-white dark:border-slate-800"
          title="On this page table of contents"
        >
          <ListTree className="h-4 w-4" />
          <span>Sections ({headings.length})</span>
        </Button>
      </div>

      {/* 3. Mobile / Tablet Bottom Sheet Modal */}
      {mobileTocOpen && (
        <div className="xl:hidden fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
          <div
            className="w-full sm:max-w-md bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[80vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/90">
              <div className="flex items-center space-x-2 text-slate-900 dark:text-slate-100 font-bold text-base">
                <ListTree className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span>Jump to Section</span>
              </div>
              <button
                onClick={() => setMobileTocOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Headings List */}
            <div className="overflow-y-auto p-3 space-y-1 divide-y divide-slate-100 dark:divide-slate-800">
              {headings.map((item, idx) => {
                const isActive = activeId === item.id

                return (
                  <button
                    key={idx}
                    onClick={() => handleMobileNav(item.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-left text-sm transition-colors ${
                      item.level === 3 ? 'pl-6 text-slate-600 dark:text-slate-400' : 'font-semibold text-slate-900 dark:text-slate-100'
                    } ${
                      isActive ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-bold' : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <span className="line-clamp-2">{item.text}</span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 ml-2" />
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}
