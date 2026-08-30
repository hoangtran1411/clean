import React from 'react'
import { X, Eye, EyeOff, RotateCcw, LayoutGrid, Check, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DashboardWidgetConfig, WidgetSpan } from '../types/dashboard'

interface CustomizeLayoutModalProps {
  isOpen: boolean
  onClose: () => void
  widgets: DashboardWidgetConfig[]
  onUpdateWidget: (id: string, updates: Partial<DashboardWidgetConfig>) => void
  onResetLayout: () => void
}

export const CustomizeLayoutModal: React.FC<CustomizeLayoutModalProps> = ({
  isOpen,
  onClose,
  widgets,
  onUpdateWidget,
  onResetLayout,
}) => {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/90 shrink-0">
          <div className="flex items-center space-x-2 text-slate-900 dark:text-slate-100 font-bold text-base">
            <LayoutGrid className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span>Customize ERP Dashboard Layout</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
            title="Close (Esc)"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content / Widget List */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 overscroll-contain">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Configure widget visibility, columns span width, and dashboard positioning. Your configuration is automatically saved in browser storage.
          </p>

          <div className="space-y-3">
            {widgets.map((widget) => (
              <div
                key={widget.id}
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850 dark:bg-slate-800/40 gap-3 text-xs sm:text-sm"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <GripVertical className="h-4 w-4 text-slate-400 shrink-0 cursor-grab" />
                  <div className="truncate">
                    <span className="font-semibold text-slate-900 dark:text-slate-100 block truncate">
                      {widget.title}
                    </span>
                    <span className="text-[11px] text-slate-400 uppercase font-mono">
                      Category: {widget.category}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  {/* Span Size Selector */}
                  <select
                    value={widget.span}
                    onChange={(e) =>
                      onUpdateWidget(widget.id, { span: e.target.value as WidgetSpan })
                    }
                    className="text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-800 dark:text-slate-200 outline-none font-medium shadow-2xs"
                  >
                    <option value="1">1 Col (Compact)</option>
                    <option value="2">2 Cols (Medium)</option>
                    <option value="3">3 Cols (Wide)</option>
                    <option value="full">Full Row (100%)</option>
                  </select>

                  {/* Visibility Toggle Button */}
                  <button
                    onClick={() => onUpdateWidget(widget.id, { visible: !widget.visible })}
                    className={`p-1.5 rounded-lg border transition-colors ${
                      widget.visible
                        ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400'
                        : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                    }`}
                    title={widget.visible ? 'Hide widget' : 'Show widget'}
                  >
                    {widget.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onResetLayout}
            className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset to Default ERP Layout
          </Button>

          <Button size="sm" onClick={onClose} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
            <Check className="h-4 w-4 mr-1" /> Save & Close
          </Button>
        </div>
      </div>
    </div>
  )
}
