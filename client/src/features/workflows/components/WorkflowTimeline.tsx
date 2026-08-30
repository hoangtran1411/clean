import { WorkflowApprovalActionDto, WorkflowActionType } from '../types/workflow'
import { CheckCircle2, XCircle, Send, CheckSquare } from 'lucide-react'

export function WorkflowTimeline({ history }: { history: WorkflowApprovalActionDto[] }) {
  if (!history || history.length === 0) return null

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-900">History</h3>
      <div className="relative border-l border-slate-200 ml-3 space-y-6">
        {history.map((item, idx) => {
          let Icon = Send
          let iconColor = 'text-blue-500'
          
          if (item.action === 'Approved') {
            Icon = CheckCircle2
            iconColor = 'text-green-500'
          } else if (item.action === 'Rejected') {
            Icon = XCircle
            iconColor = 'text-red-500'
          } else if (item.action === 'Completed') {
            Icon = CheckSquare
            iconColor = 'text-emerald-500'
          }

          return (
            <div key={idx} className="relative pl-6">
              <span className="absolute -left-3.5 top-1 bg-white rounded-full p-1 border border-slate-200">
                <Icon className={`h-4 w-4 ${iconColor}`} />
              </span>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-slate-900">
                  {item.action} by {item.actedByUserName} {item.approvalLevel > 0 && `(Level ${item.approvalLevel})`}
                </span>
                <span className="text-xs text-slate-500">
                  {new Date(item.createdAtUtc).toLocaleString()}
                </span>
                {item.comment && (
                  <p className="text-sm text-slate-700 mt-1 bg-slate-50 p-2 rounded border border-slate-100">
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
