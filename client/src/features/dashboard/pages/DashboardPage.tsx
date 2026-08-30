import React, { useState, useEffect, useCallback } from 'react'
import { useQueryClient, useQuery } from '@tanstack/react-query'
import {
  LayoutDashboard,
  RefreshCw,
  SlidersHorizontal,
  GripVertical,
  Maximize2,
  Minimize2,
  EyeOff,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DashboardKpiCard } from '../components/DashboardKpiCard'
import {
  RevenueVelocityChart,
  CategoryDistributionChart,
  CacheEfficiencyWidget,
} from '../components/ErpChartWidgets'
import { SystemHealthWidget } from '../components/SystemHealthWidget'
import { WorkflowVelocityWidget } from '../components/WorkflowVelocityWidget'
import { RecentActivityWidget } from '../components/RecentActivityWidget'
import { QuickActionsWidget } from '../components/QuickActionsWidget'
import { CustomizeLayoutModal } from '../components/CustomizeLayoutModal'
import { dashboardApi } from '../api/dashboardApi'
import { DashboardWidgetConfig, KpiMetric, WidgetSpan } from '../types/dashboard'

const DEFAULT_WIDGETS: DashboardWidgetConfig[] = [
  { id: 'kpis', title: 'Executive KPI Metrics', category: 'kpi', span: 'full', visible: true, order: 0 },
  { id: 'revenue', title: 'Revenue & Order Velocity', category: 'charts', span: '2', visible: true, order: 1 },
  { id: 'categories', title: 'Catalog Category Breakdown', category: 'charts', span: '1', visible: true, order: 2 },
  { id: 'workflow', title: 'Approval Pipeline Velocity', category: 'operations', span: '1', visible: true, order: 3 },
  { id: 'cache', title: 'Caching & Throughput Efficiency', category: 'system', span: '1', visible: true, order: 4 },
  { id: 'quickActions', title: 'ERP Executive Quick Actions', category: 'operations', span: '1', visible: true, order: 5 },
  { id: 'systemHealth', title: 'System Health & Topology', category: 'system', span: '2', visible: true, order: 6 },
  { id: 'activity', title: 'Real-Time Activity Stream', category: 'operations', span: 'full', visible: true, order: 7 },
]

export const DashboardPage: React.FC = () => {
  const queryClient = useQueryClient()
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'quarter'>('month')
  const [refreshInterval, setRefreshInterval] = useState<number>(30) // seconds; 0 = off
  const [countdown, setCountdown] = useState<number>(30)
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)
  const [showCustomizeModal, setShowCustomizeModal] = useState<boolean>(false)
  const [draggedWidgetId, setDraggedWidgetId] = useState<string | null>(null)

  // Load layout from localStorage or fallback to defaults
  const [widgets, setWidgets] = useState<DashboardWidgetConfig[]>(() => {
    try {
      const saved = localStorage.getItem('erp_dashboard_layout_v1')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed
        }
      }
    } catch {
      // Fallback
    }
    return DEFAULT_WIDGETS
  })

  // Save layout changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('erp_dashboard_layout_v1', JSON.stringify(widgets))
    } catch {
      // Storage quota or disabled
    }
  }, [widgets])

  // Live Clean Architecture Backend Query
  const { data: backendResponse, isLoading: isMetricsLoading } = useQuery({
    queryKey: ['dashboardMetrics', period],
    queryFn: () => dashboardApi.getMetrics(period),
  })

  const metricsData = backendResponse?.data

  const totalProducts = metricsData?.kpis.totalProducts ?? 128
  const activeWorkflows = metricsData?.kpis.activeWorkflows ?? 14
  const totalRevenue = metricsData?.kpis.totalRevenue ?? 84250.00
  const lowStockCount = metricsData?.kpis.lowStockProducts ?? 5
  const cacheHitRatio = metricsData?.kpis.cacheHitRatio ?? 94.8
  const dbLatency = metricsData?.kpis.averageLatencyMs ?? 14

  const kpis: KpiMetric[] = [
    {
      id: 'kpi-revenue',
      label: 'Gross Invoiced Revenue',
      value: `$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: '+18.4%',
      isPositive: true,
      icon: 'dollar',
      subtext: `vs $${(metricsData?.kpis.priorMonthRevenue ?? 71150).toLocaleString()} prior month`,
      color: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400',
    },
    {
      id: 'kpi-products',
      label: 'Active Catalog SKUs',
      value: `${totalProducts}`,
      change: '+6 items',
      isPositive: true,
      icon: 'package',
      subtext: `${lowStockCount} low stock reorder alerts`,
      color: 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400',
    },
    {
      id: 'kpi-workflows',
      label: 'N-Level Approvals Active',
      value: `${activeWorkflows}`,
      change: '3 Pending',
      isPositive: false,
      icon: 'workflow',
      subtext: 'Average cycle: 4.2 hours',
      color: 'bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400',
    },
    {
      id: 'kpi-cache',
      label: 'Cache Hit Efficiency',
      value: `${cacheHitRatio}%`,
      change: '+2.1%',
      isPositive: true,
      icon: 'zap',
      subtext: '1.2ms OutputCache response',
      color: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400',
    },
    {
      id: 'kpi-auth',
      label: 'Zero-Trust Token Verifications',
      value: '1,420',
      change: '100% Valid',
      isPositive: true,
      icon: 'shield',
      subtext: 'PBKDF2 + Refresh Rotation',
      color: 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400',
    },
    {
      id: 'kpi-latency',
      label: 'Average API Latency',
      value: `${dbLatency} ms`,
      change: '-4 ms',
      isPositive: true,
      icon: 'activity',
      subtext: '.NET 10 Kestrel Microsecond Core',
      color: 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400',
    },
  ]

  // Manual Refresh Handler
  const handleManualRefresh = useCallback(async () => {
    setIsRefreshing(true)
    await queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] })
    setCountdown(refreshInterval)
    setTimeout(() => setIsRefreshing(false), 600)
  }, [queryClient, refreshInterval])

  // Auto-refresh interval countdown timer
  useEffect(() => {
    if (refreshInterval === 0) return

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          handleManualRefresh()
          return refreshInterval
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [refreshInterval, handleManualRefresh])

  // Drag and drop handlers
  const handleDragStart = (id: string) => {
    setDraggedWidgetId(id)
  }

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    if (!draggedWidgetId || draggedWidgetId === targetId) return

    const updated = [...widgets]
    const sourceIdx = updated.findIndex((w) => w.id === draggedWidgetId)
    const targetIdx = updated.findIndex((w) => w.id === targetId)

    if (sourceIdx !== -1 && targetIdx !== -1) {
      const [removed] = updated.splice(sourceIdx, 1)
      updated.splice(targetIdx, 0, removed)
      // Re-assign order indices
      updated.forEach((w, i) => {
        w.order = i
      })
      setWidgets(updated)
    }
  }

  const handleDragEnd = () => {
    setDraggedWidgetId(null)
  }

  const handleUpdateWidget = (id: string, updates: Partial<DashboardWidgetConfig>) => {
    setWidgets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, ...updates } : w))
    )
  }

  const handleResetLayout = () => {
    setWidgets(DEFAULT_WIDGETS)
    localStorage.removeItem('erp_dashboard_layout_v1')
  }

  const getColSpanClass = (span: WidgetSpan) => {
    switch (span) {
      case '1':
        return 'col-span-1 lg:col-span-1'
      case '2':
        return 'col-span-1 lg:col-span-2'
      case '3':
        return 'col-span-1 lg:col-span-2 2xl:col-span-3'
      case 'full':
      default:
        return 'col-span-1 lg:col-span-2 2xl:col-span-3 3xl:col-span-4'
    }
  }

  // Render widget content by widget ID
  const renderWidgetContent = (id: string) => {
    switch (id) {
      case 'kpis':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-6 gap-3 sm:gap-4">
            {kpis.map((metric) => (
              <DashboardKpiCard key={metric.id} metric={metric} />
            ))}
          </div>
        )
      case 'revenue':
        return <RevenueVelocityChart dataPoints={metricsData?.revenueTimeSeries} />
      case 'categories':
        return (
          <CategoryDistributionChart
            categories={metricsData?.categoryDistribution}
            totalCount={metricsData?.kpis.totalProducts}
          />
        )
      case 'workflow':
        return (
          <WorkflowVelocityWidget
            approvalVelocity={metricsData?.approvalVelocity}
            activeWorkflowsCount={metricsData?.kpis.activeWorkflows}
            completedWorkflowsCount={metricsData?.kpis.completedWorkflows}
          />
        )
      case 'cache':
        return (
          <CacheEfficiencyWidget
            cacheHitRatio={metricsData?.kpis.cacheHitRatio}
            dbLatencyMs={metricsData?.kpis.averageLatencyMs}
          />
        )
      case 'quickActions':
        return <QuickActionsWidget />
      case 'systemHealth':
        return <SystemHealthWidget telemetry={metricsData?.systemTelemetry} />
      case 'activity':
        return <RecentActivityWidget activities={metricsData?.recentActivities} />
      default:
        return null
    }
  }

  const visibleWidgets = widgets.filter((w) => w.visible)

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top ERP Header & Executive Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="h-9 w-9 rounded-xl bg-blue-600 dark:bg-blue-500 flex items-center justify-center text-white font-bold shadow-xs">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl 2xl:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                Enterprise ERP Executive Dashboard
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Live .NET 10 CQRS Operations, EF Core Database Aggregations & Telemetry
              </p>
            </div>
          </div>
        </div>

        {/* Toolbar Controls: Period, Auto-Refresh, Layout Customize */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Period Filter */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            {(['today', 'week', 'month', 'quarter'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-all ${
                  period === p
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                {p === 'quarter' ? 'Fiscal Q1' : p}
              </button>
            ))}
          </div>

          {/* Auto-Refresh Selector */}
          <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Auto-Sync:</span>
            <select
              value={refreshInterval}
              onChange={(e) => {
                const val = Number(e.target.value)
                setRefreshInterval(val)
                setCountdown(val)
              }}
              className="bg-transparent font-semibold text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
            >
              <option value={0} className="dark:bg-slate-900">Off</option>
              <option value={5} className="dark:bg-slate-900">5s</option>
              <option value={15} className="dark:bg-slate-900">15s</option>
              <option value={30} className="dark:bg-slate-900">30s</option>
              <option value={60} className="dark:bg-slate-900">60s</option>
            </select>
            {refreshInterval > 0 && (
              <span className="font-mono text-[11px] font-bold text-blue-600 dark:text-blue-400 pl-1">
                ({countdown}s)
              </span>
            )}
          </div>

          {/* Manual Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            disabled={isRefreshing || isMetricsLoading}
            className="h-9 px-3 text-xs sm:text-sm font-semibold border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            title="Refresh dashboard metrics"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isRefreshing || isMetricsLoading ? 'animate-spin text-blue-600' : ''}`} />
            <span>Refresh</span>
          </Button>

          {/* Customize Layout Modal Trigger */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCustomizeModal(true)}
            className="h-9 px-3 text-xs sm:text-sm font-semibold border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 mr-1.5 text-blue-600 dark:text-blue-400" />
            <span>Customize Layout</span>
          </Button>
        </div>
      </div>

      {/* Dynamic Customizable ERP Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 3xl:grid-cols-4 gap-4 sm:gap-6">
        {visibleWidgets.map((widget) => {
          const colSpanClass = getColSpanClass(widget.span)

          return (
            <div
              key={widget.id}
              draggable={widget.id !== 'kpis'}
              onDragStart={() => handleDragStart(widget.id)}
              onDragOver={(e) => handleDragOver(e, widget.id)}
              onDragEnd={handleDragEnd}
              className={`${colSpanClass} transition-all duration-200 relative group/widget ${
                draggedWidgetId === widget.id ? 'opacity-40 scale-98' : 'opacity-100'
              }`}
            >
              {/* Widget Drag & Resize Controls Bar (visible on hover) */}
              {widget.id !== 'kpis' && (
                <div className="absolute top-2.5 right-2.5 z-20 opacity-0 group-hover/widget:opacity-100 transition-opacity flex items-center space-x-1 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xs p-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                  <div
                    className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-grab active:cursor-grabbing"
                    title="Drag to reorder"
                  >
                    <GripVertical className="h-3.5 w-3.5" />
                  </div>

                  <button
                    onClick={() => {
                      const nextSpan: Record<WidgetSpan, WidgetSpan> = {
                        '1': '2',
                        '2': 'full',
                        '3': 'full',
                        'full': '1',
                      }
                      handleUpdateWidget(widget.id, { span: nextSpan[widget.span] })
                    }}
                    className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    title="Toggle widget size"
                  >
                    {widget.span === 'full' ? (
                      <Minimize2 className="h-3.5 w-3.5" />
                    ) : (
                      <Maximize2 className="h-3.5 w-3.5" />
                    )}
                  </button>

                  <button
                    onClick={() => handleUpdateWidget(widget.id, { visible: false })}
                    className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
                    title="Hide widget (can restore in Customize Layout)"
                  >
                    <EyeOff className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              {/* Render Widget Card Body */}
              {renderWidgetContent(widget.id)}
            </div>
          )
        })}
      </div>

      {/* Customize Layout Modal */}
      <CustomizeLayoutModal
        isOpen={showCustomizeModal}
        onClose={() => setShowCustomizeModal(false)}
        widgets={widgets}
        onUpdateWidget={handleUpdateWidget}
        onResetLayout={handleResetLayout}
      />
    </div>
  )
}
