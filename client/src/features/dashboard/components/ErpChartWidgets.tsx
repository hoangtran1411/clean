import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BarChart3, LineChart, PieChart, ArrowUpRight } from 'lucide-react'

// 1. Revenue & Payment Velocity Chart
export const RevenueVelocityChart: React.FC<{
  dataPoints?: Array<{ label: string; revenue: number; orders: number }>
}> = ({ dataPoints }) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')

  const defaultPoints = [
    { label: 'Jan', revenue: 42000, orders: 120 },
    { label: 'Feb', revenue: 58000, orders: 145 },
    { label: 'Mar', revenue: 51000, orders: 132 },
    { label: 'Apr', revenue: 67000, orders: 180 },
    { label: 'May', revenue: 74000, orders: 195 },
    { label: 'Jun', revenue: 84250, orders: 228 },
  ]

  const points = dataPoints && dataPoints.length > 0 ? dataPoints : defaultPoints
  const maxRevenue = Math.max(...points.map((d) => d.revenue))
  const totalInvoiced = points.reduce((acc, curr) => acc + curr.revenue, 0)

  return (
    <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm h-full flex flex-col">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <LineChart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <CardTitle className="text-base sm:text-lg">Revenue & Order Velocity</CardTitle>
          </div>
          <CardDescription>
            Fiscal ERP Transactions via Idempotent Payment Pipeline (.NET 10)
          </CardDescription>
        </div>
        <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                timeRange === range
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col justify-between pt-2">
        {/* SVG Interactive Visual Bar & Trend Chart */}
        <div className="h-52 w-full flex items-end justify-between gap-2 sm:gap-4 pt-6 pb-2 px-1">
          {points.map((dp, idx) => {
            const heightPercent = maxRevenue > 0 ? (dp.revenue / maxRevenue) * 100 : 10
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                {/* Hover Tooltip */}
                <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 dark:bg-slate-800 text-white text-xs py-1 px-2 rounded pointer-events-none shadow-lg z-10 whitespace-nowrap font-mono">
                  ${dp.revenue.toLocaleString()} ({dp.orders} orders)
                </div>

                {/* Vertical Bar with Gradient */}
                <div className="w-full max-w-[48px] bg-slate-100 dark:bg-slate-800 rounded-t-lg overflow-hidden h-40 flex items-end justify-center">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full bg-gradient-to-t from-blue-600 to-indigo-500 group-hover:from-blue-500 group-hover:to-indigo-400 rounded-t-lg transition-all duration-300 shadow-xs"
                  />
                </div>

                {/* Label */}
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {dp.label}
                </span>
              </div>
            )
          })}
        </div>

        {/* Footer Summary Banner */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center space-x-2">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-600"></span>
            <span>Total Invoiced: <strong className="text-slate-900 dark:text-slate-100 font-bold">${totalInvoiced.toLocaleString()}</strong></span>
          </div>
          <div className="flex items-center text-emerald-600 dark:text-emerald-400 font-semibold">
            <ArrowUpRight className="h-4 w-4 mr-0.5" /> +24.8% YoY
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// 2. Catalog Category Distribution Widget
export const CategoryDistributionChart: React.FC<{
  categories?: Array<{ name: string; count: number; percentage: number; color: string }>
  totalCount?: number
}> = ({ categories, totalCount }) => {
  const defaultCategories = [
    { name: 'Enterprise Laptops', count: 48, percentage: 38, color: 'bg-blue-600' },
    { name: 'Server Hardware', count: 32, percentage: 25, color: 'bg-indigo-500' },
    { name: 'Displays & 4K Panels', count: 24, percentage: 19, color: 'bg-purple-500' },
    { name: 'Security Appliances', count: 14, percentage: 11, color: 'bg-emerald-500' },
    { name: 'Accessories & Cables', count: 10, percentage: 7, color: 'bg-amber-500' },
  ]

  const items = categories && categories.length > 0 ? categories : defaultCategories
  const total = totalCount || items.reduce((acc, c) => acc + c.count, 0)

  return (
    <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm h-full flex flex-col">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <PieChart className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <CardTitle className="text-base sm:text-lg">Catalog Category Breakdown</CardTitle>
          </div>
          <CardDescription>Inventory SKUs managed with EPPlus Excel synchronization</CardDescription>
        </div>
        <Badge variant="secondary" className="font-mono">{total} SKUs</Badge>
      </CardHeader>

      <CardContent className="flex-1 space-y-4 pt-2">
        {/* Progress distribution bar */}
        <div className="h-3.5 w-full rounded-full overflow-hidden flex bg-slate-100 dark:bg-slate-800 shadow-inner">
          {items.map((c, i) => (
            <div
              key={i}
              style={{ width: `${c.percentage}%` }}
              className={`${c.color || 'bg-blue-600'} h-full transition-all duration-500`}
              title={`${c.name}: ${c.count} items (${c.percentage}%)`}
            />
          ))}
        </div>

        {/* Breakdown List */}
        <div className="space-y-2.5 pt-1">
          {items.map((c, i) => (
            <div key={i} className="flex items-center justify-between text-xs sm:text-sm">
              <div className="flex items-center space-x-2 truncate">
                <span className={`h-2.5 w-2.5 rounded-full ${c.color || 'bg-blue-600'} shrink-0`} />
                <span className="font-medium text-slate-700 dark:text-slate-300 truncate">
                  {c.name}
                </span>
              </div>
              <div className="flex items-center space-x-3 shrink-0">
                <span className="text-slate-500 dark:text-slate-400 font-mono text-xs">{c.count} items</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 font-mono w-10 text-right">
                  {c.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// 3. Cache & Latency Efficiency Widget
export const CacheEfficiencyWidget: React.FC<{
  cacheHitRatio?: number
  dbLatencyMs?: number
}> = ({ cacheHitRatio = 94.8, dbLatencyMs = 14 }) => {
  return (
    <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm h-full flex flex-col">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <CardTitle className="text-base sm:text-lg">Caching & Throughput Efficiency</CardTitle>
          </div>
          <CardDescription>.NET 10 OutputCache vs IMemoryCache Performance</CardDescription>
        </div>
        <Badge variant="success" className="font-bold">{cacheHitRatio}% Hit Ratio</Badge>
      </CardHeader>

      <CardContent className="flex-1 space-y-4 pt-1">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">[OutputCache]</span>
            <span className="text-lg sm:text-xl font-extrabold text-blue-600 dark:text-blue-400 font-mono">1.2ms</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Response Time</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">IMemoryCache</span>
            <span className="text-lg sm:text-xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">3.4ms</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">In-Memory Store</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">EF Core DB Query</span>
            <span className="text-lg sm:text-xl font-extrabold text-slate-700 dark:text-slate-300 font-mono">{dbLatencyMs}ms</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Direct Query</span>
          </div>
        </div>

        <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
          <div className="flex justify-between items-center">
            <span>Cache Hit vs Miss Distribution</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">18,420 Hits / 1,020 Misses</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden flex">
            <div className="bg-emerald-500 h-full" style={{ width: `${cacheHitRatio}%` }} title={`Cache Hits: ${cacheHitRatio}%`} />
            <div className="bg-rose-500 h-full" style={{ width: `${(100 - cacheHitRatio).toFixed(1)}%` }} title={`Cache Misses: ${(100 - cacheHitRatio).toFixed(1)}%`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
