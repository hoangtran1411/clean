import { CheckCircle2, Circle, Clock } from 'lucide-react'

interface WorkflowApprovalProgressProps {
  currentApprovalLevel: number;
  totalApprovalLevels: number;
  status: string;
}

export function WorkflowApprovalProgress({ currentApprovalLevel, totalApprovalLevels, status }: WorkflowApprovalProgressProps) {
  const steps = Array.from({ length: totalApprovalLevels }, (_, i) => i + 1)
  const isRejected = status === 'Rejected'
  const isObsolete = status === 'Obsolescence'
  const isApprovedOrCompleted = status === 'Approved' || status === 'Completed'

  return (
    <div className="flex items-center gap-3 overflow-x-auto py-2">
      {steps.map(step => {
        let isCompleted = false
        let isCurrent = false

        if (isApprovedOrCompleted) {
          isCompleted = true
        } else if (isRejected) {
          if (step < currentApprovalLevel) isCompleted = true
        } else if (isObsolete) {
          if (step < currentApprovalLevel) isCompleted = true
        } else {
          if (step < currentApprovalLevel) isCompleted = true
          if (step === currentApprovalLevel && status === 'InApproval') isCurrent = true
        }

        return (
          <div key={step} className="flex flex-col items-center gap-1.5">
            {isCompleted ? (
              <CheckCircle2 className="h-6 w-6 text-emerald-500" />
            ) : isCurrent ? (
              <Clock className="h-6 w-6 text-amber-500 animate-pulse" />
            ) : isRejected && step === currentApprovalLevel ? (
              <Circle className="h-6 w-6 text-rose-500 fill-rose-100 dark:fill-rose-950/50" />
            ) : (
              <Circle className="h-6 w-6 text-slate-300 dark:text-slate-700" />
            )}
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Level {step}</span>
          </div>
        )
      })}
    </div>
  )
}
