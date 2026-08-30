import React, { useState } from 'react'
import { DocCategory, DocItem } from '../data/docsRegistry'
import {
  Search,
  ChevronDown,
  ChevronRight,
  BookOpen,
  FileText,
  CheckCircle,
  X,
  ChevronsUpDown,
  ListCollapse,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface DocsSidebarProps {
  categories: DocCategory[]
  selectedDoc: DocItem | null
  onSelectDoc: (doc: DocItem) => void
  totalDocsCount: number
  isMobileDrawer?: boolean
  onCloseDrawer?: () => void
}

export const DocsSidebar: React.FC<DocsSidebarProps> = ({
  categories,
  selectedDoc,
  onSelectDoc,
  totalDocsCount,
  isMobileDrawer = false,
  onCloseDrawer,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {}
    categories.forEach((cat) => {
      init[cat.id] = true // Expand all by default
    })
    return init
  })

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }))
  }

  const handleExpandAll = () => {
    const allExpanded: Record<string, boolean> = {}
    categories.forEach((cat) => {
      allExpanded[cat.id] = true
    })
    setExpandedCategories(allExpanded)
  }

  const handleCollapseAll = () => {
    const allCollapsed: Record<string, boolean> = {}
    categories.forEach((cat) => {
      allCollapsed[cat.id] = false
    })
    setExpandedCategories(allCollapsed)
  }

  const isAllExpanded = Object.values(expandedCategories).every(Boolean)

  // Filter categories and docs based on search
  const filteredCategories = categories
    .map((cat) => {
      const matchingDocs = cat.docs.filter(
        (d) =>
          d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cat.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      return {
        ...cat,
        docs: matchingDocs,
      }
    })
    .filter((cat) => cat.docs.length > 0)

  return (
    <aside
      className={`bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden transition-colors ${
        isMobileDrawer
          ? 'w-full h-full max-h-[100dvh]'
          : 'w-full rounded-2xl border h-[calc(100dvh-130px)] 2xl:h-[calc(100dvh-154px)] sticky top-[120px] 2xl:top-[144px]'
      }`}
    >
      {/* Search & Drawer Header */}
      <div className="p-4 2xl:p-5 3xl:p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/90 space-y-3 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-slate-900 dark:text-slate-100 font-bold text-sm 2xl:text-base 3xl:text-lg">
            <BookOpen className="h-5 w-5 3xl:h-6 3xl:w-6 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="truncate">Documentation Hub</span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge
              variant="outline"
              className="text-xs 2xl:text-sm 3xl:text-base bg-white dark:bg-slate-800 font-mono text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 px-2 py-0.5"
            >
              {totalDocsCount} Guides
            </Badge>
            {isMobileDrawer && onCloseDrawer && (
              <button
                onClick={onCloseDrawer}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                title="Close drawer"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Search Input with Clear Button */}
        <div className="relative flex items-center">
          <Search className="absolute left-3 top-3 3xl:top-3.5 h-4 w-4 3xl:h-5 3xl:w-5 text-slate-400 dark:text-slate-500 pointer-events-none" />
          <Input
            placeholder="Search all 100+ guides..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-8 text-sm 2xl:text-base 3xl:text-lg h-10 2xl:h-11 3xl:h-12 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-lg"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              title="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Quick Expand / Collapse All Controls */}
        <div className="flex items-center justify-between text-xs 2xl:text-sm text-slate-500 dark:text-slate-400 pt-1">
          <span>Categories ({filteredCategories.length})</span>
          <button
            onClick={isAllExpanded ? handleCollapseAll : handleExpandAll}
            className="flex items-center space-x-1 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
            title={isAllExpanded ? 'Collapse All Categories' : 'Expand All Categories'}
          >
            {isAllExpanded ? (
              <>
                <ListCollapse className="h-3.5 w-3.5" />
                <span>Collapse All</span>
              </>
            ) : (
              <>
                <ChevronsUpDown className="h-3.5 w-3.5" />
                <span>Expand All</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Category & Docs List */}
      <div className="flex-1 overflow-y-auto p-2.5 2xl:p-4 3xl:p-5 space-y-3.5 divide-y divide-slate-100 dark:divide-slate-800 overscroll-contain">
        {filteredCategories.length === 0 ? (
          <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-sm 2xl:text-base">
            No guides found matching "{searchQuery}".
          </div>
        ) : (
          filteredCategories.map((category) => {
            const isExpanded = expandedCategories[category.id] ?? true
            const hasActiveDoc = category.docs.some((d) => d.id === selectedDoc?.id)

            return (
              <div key={category.id} className="pt-2.5 first:pt-0">
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-colors min-h-[44px] ${
                    hasActiveDoc
                      ? 'text-blue-900 dark:text-blue-300 font-bold bg-blue-50/70 dark:bg-blue-950/40'
                      : 'text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 font-semibold'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <span className="text-lg 2xl:text-xl 3xl:text-2xl">{category.icon}</span>
                    <span className="text-sm 2xl:text-base 3xl:text-lg font-bold truncate">{category.name}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 shrink-0">
                    <span className="text-xs 2xl:text-sm 3xl:text-base text-slate-400 dark:text-slate-500 font-mono">
                      {category.docs.length}
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 3xl:h-5 3xl:w-5 text-slate-400 dark:text-slate-500" />
                    ) : (
                      <ChevronRight className="h-4 w-4 3xl:h-5 3xl:w-5 text-slate-400 dark:text-slate-500" />
                    )}
                  </div>
                </button>

                {/* Docs Accordion Body */}
                {isExpanded && (
                  <div className="mt-1.5 ml-4 pl-2.5 border-l-2 border-slate-200 dark:border-slate-800 space-y-1">
                    {category.docs.map((doc) => {
                      const isSelected = selectedDoc?.id === doc.id

                      return (
                        <button
                          key={doc.id}
                          onClick={() => {
                            onSelectDoc(doc)
                            if (onCloseDrawer) onCloseDrawer()
                          }}
                          className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-lg text-left text-sm 2xl:text-base 3xl:text-lg transition-all min-h-[40px] ${
                            isSelected
                              ? 'bg-blue-600 text-white font-bold shadow-xs'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-950 dark:hover:text-slate-100 font-medium'
                          }`}
                        >
                          {isSelected ? (
                            <CheckCircle className="h-4 w-4 3xl:h-5 3xl:w-5 shrink-0 text-white" />
                          ) : (
                            <FileText className="h-4 w-4 3xl:h-5 3xl:w-5 shrink-0 text-slate-400 dark:text-slate-500" />
                          )}
                          <span className="truncate">{doc.title}</span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </aside>
  )
}
