import { Badge } from '@/components/ui/badge'
import { WorkflowStatus } from '../types/workflow'

export function WorkflowStatusBadge({ status }: { status: WorkflowStatus | string }) {
  const statusStr = typeof status === 'string' ? status : WorkflowStatus[status]

  switch (statusStr) {
    case 'Draft':
    case '0':
      return <Badge variant="secondary">Draft</Badge>
    case 'Submitted':
    case '1':
      return <Badge className="bg-blue-500 hover:bg-blue-600">Submitted</Badge>
    case 'InApproval':
    case '2':
      return <Badge className="bg-yellow-500 hover:bg-yellow-600">In Approval</Badge>
    case 'Rejected':
    case '3':
      return <Badge variant="destructive">Rejected</Badge>
    case 'Approved':
    case '4':
      return <Badge className="bg-green-500 hover:bg-green-600">Approved</Badge>
    case 'Completed':
    case '5':
      return <Badge variant="outline" className="border-emerald-500 text-emerald-600">Completed</Badge>
    case 'Obsolescence':
    case '6':
      return <Badge variant="outline" className="border-slate-400 text-slate-500 bg-slate-100 dark:bg-slate-800 line-through">Obsolete</Badge>
    default:
      return <Badge variant="outline">{statusStr}</Badge>
  }
}
