import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { GitPullRequest, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

interface WorkflowVelocityWidgetProps {
  approvalVelocity?: Array<{
    level: number
    name: string
    avgHours: string
    pendingCount: number
    status: string
  }>
  activeWorkflowsCount?: number
  completedWorkflowsCount?: number
}

export const WorkflowVelocityWidget: React.FC<WorkflowVelocityWidgetProps> = ({
  approvalVelocity,
  activeWorkflowsCount = 4,
  completedWorkflowsCount = 38,
}) => {
  const defaultLevels = [
    { level: 1, name: 'Team Leader', avgHours: '1.4h', pendingCount: 2, status: 'normal' },
    { level: 2, name: 'Department Head', avgHours: '3.8h', pendingCount: 1, status: 'normal' },
    { level: 3, name: 'Deputy Director', avgHours: '6.2h', pendingCount: 0, status: 'fast' },
    { level: 4, name: 'Technical Director', avgHours: '8.5h', pendingCount: 1, status: 'review' },
  ]

  const levels = approvalVelocity && approvalVelocity.length > 0 ? approvalVelocity : defaultLevels

  return (
    <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm h-full flex flex-col">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <GitPullRequest className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            <CardTitle className="text-base sm:text-lg">Approval Pipeline Velocity</CardTitle>
          </div>
          <CardDescription>N-Level multi-tier approval state machine throughput</CardDescription>
        </div>
        <Link
          to="/workflows"
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center font-semibold"
        >
          View All <ArrowRight className="h-3.5 w-3.5 ml-0.5" />
        </Link>
      </CardHeader>

      <CardContent className="flex-1 space-y-4 pt-1">
        {/* Metric summary boxes */}
        <div className="grid grid-cols-3 gap-2.5 text-center">
          <div className="p-3 rounded-xl bg-orange-50/60 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/60">
            <span className="text-[11px] text-orange-700 dark:text-orange-300 font-semibold block">In Approval</span>
            <span className="text-xl sm:text-2xl font-black text-orange-900 dark:text-orange-100 font-mono">
              {activeWorkflowsCount}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60">
            <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold block">Completed</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-900 dark:text-emerald-100 font-mono">
              {completedWorkflowsCount}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold block">Avg Turnaround</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 font-mono">4.2h</span>
          </div>
        </div>

        {/* Level velocity list */}
        <div className="space-y-2 pt-1">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Tier Approval Latency
          </div>
          {levels.map((lvl) => (
            <div
              key={lvl.level}
              className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs sm:text-sm"
            >
              <div className="flex items-center space-x-2.5 truncate">
                <span className="h-5 w-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-mono font-bold text-xs text-slate-700 dark:text-slate-300">
                  {lvl.level}
                </span>
                <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                  {lvl.name}
                </span>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                  {lvl.avgHours} avg
                </span>
                {lvl.pendingCount > 0 ? (
                  <Badge variant="warning" className="text-[10px] font-mono px-1.5 py-0.5">
                    {lvl.pendingCount} pending
                  </Badge>
                ) : (
                  <Badge variant="success" className="text-[10px] font-mono px-1.5 py-0.5">
                    Clear
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
