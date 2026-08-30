import React from 'react'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  GitPullRequest,
  Zap,
  ShieldCheck,
  Activity,
  Layers,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { KpiMetric } from '../types/dashboard'

const iconMap: Record<string, React.ReactNode> = {
  dollar: <DollarSign className="h-5 w-5" />,
  package: <Package className="h-5 w-5" />,
  workflow: <GitPullRequest className="h-5 w-5" />,
  zap: <Zap className="h-5 w-5" />,
  shield: <ShieldCheck className="h-5 w-5" />,
  activity: <Activity className="h-5 w-5" />,
  layers: <Layers className="h-5 w-5" />,
}

export const DashboardKpiCard: React.FC<{ metric: KpiMetric }> = ({ metric }) => {
  return (
    <Card className="hover:shadow-md transition-all duration-200 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 group">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {metric.label}
          </span>
          <div
            className={`h-9 w-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${
              metric.color || 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
            }`}
          >
            {iconMap[metric.icon] || <Activity className="h-5 w-5" />}
          </div>
        </div>

        <div className="mt-3 flex items-baseline justify-between gap-2">
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            {metric.value}
          </div>
          <div
            className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-full ${
              metric.isPositive
                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300'
            }`}
          >
            {metric.isPositive ? (
              <TrendingUp className="h-3 w-3 mr-1 shrink-0" />
            ) : (
              <TrendingDown className="h-3 w-3 mr-1 shrink-0" />
            )}
            <span>{metric.change}</span>
          </div>
        </div>

        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 truncate">
          {metric.subtext}
        </div>
      </CardContent>
    </Card>
  )
}
