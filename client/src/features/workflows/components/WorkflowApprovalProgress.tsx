import { CheckCircle2, Circle, Clock } from 'lucide-react'

interface WorkflowApprovalProgressProps {
  currentApprovalLevel: number;
  totalApprovalLevels: number;
  status: string;
}

export function WorkflowApprovalProgress({ currentApprovalLevel, totalApprovalLevels, status }: WorkflowApprovalProgressProps) {
  const steps = Array.from({ length: totalApprovalLevels }, (_, i) => i + 1)
  const isRejected = status === 'Rejected'
  const isApprovedOrCompleted = status === 'Approved' || status === 'Completed'

  return (
    <div className="flex items-center gap-2">
      {steps.map(step => {
        let isCompleted = false
        let isCurrent = false

        if (isApprovedOrCompleted) {
          isCompleted = true
        } else if (isRejected) {
          if (step < currentApprovalLevel) isCompleted = true
        } else {
          if (step < currentApprovalLevel) isCompleted = true
          if (step === currentApprovalLevel && status === 'InApproval') isCurrent = true
        }

        return (
          <div key={step} className="flex flex-col items-center gap-1">
            {isCompleted ? (
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            ) : isCurrent ? (
              <Clock className="h-6 w-6 text-yellow-500" />
            ) : isRejected && step === currentApprovalLevel ? (
              <Circle className="h-6 w-6 text-red-500 fill-red-100" />
            ) : (
              <Circle className="h-6 w-6 text-slate-300" />
            )}
            <span className="text-[10px] font-medium text-slate-500">Level {step}</span>
          </div>
        )
      })}
    </div>
  )
}
