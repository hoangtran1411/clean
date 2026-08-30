import { WorkflowApprovalActionDto } from '../types/workflow'
import { CheckCircle2, XCircle, Send, CheckSquare } from 'lucide-react'

export function WorkflowTimeline({ history }: { history: WorkflowApprovalActionDto[] }) {
  if (!history || history.length === 0) return null

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">History & Audit Trail</h3>
      <div className="relative border-l border-slate-200 dark:border-slate-800 ml-3 space-y-6">
        {history.map((item, idx) => {
          let Icon = Send
          let iconColor = 'text-blue-500 dark:text-blue-400'
          
          if (item.action === 'Approved') {
            Icon = CheckCircle2
            iconColor = 'text-green-500 dark:text-green-400'
          } else if (item.action === 'Rejected') {
            Icon = XCircle
            iconColor = 'text-red-500 dark:text-red-400'
          } else if (item.action === 'Completed') {
            Icon = CheckSquare
            iconColor = 'text-emerald-500 dark:text-emerald-400'
          }

          return (
            <div key={idx} className="relative pl-6">
              <span className="absolute -left-3.5 top-1 bg-white dark:bg-slate-900 rounded-full p-1 border border-slate-200 dark:border-slate-800 shadow-2xs">
                <Icon className={`h-4 w-4 ${iconColor}`} />
              </span>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {item.action} by {item.actedByUserName} {item.approvalLevel > 0 && `(Level ${item.approvalLevel})`}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {new Date(item.createdAtUtc).toLocaleString()}
                </span>
                {item.comment && (
                  <p className="text-sm text-slate-700 dark:text-slate-300 mt-1.5 bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700">
                    "{item.comment}"
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
