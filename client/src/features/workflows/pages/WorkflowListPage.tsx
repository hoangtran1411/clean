import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWorkflows } from '../hooks/useWorkflows'
import { WorkflowStatusBadge } from '../components/WorkflowStatusBadge'
import { WorkflowStatus } from '../types/workflow'
import { Button } from '@/components/ui/button'
import { PlusCircle, Settings } from 'lucide-react'

export function WorkflowListPage() {
  const navigate = useNavigate()
  const [filterStatus, setFilterStatus] = useState<WorkflowStatus | undefined>(undefined)
  const { data: response, isLoading, isError } = useWorkflows(filterStatus)

  const workflows = response?.data || []

  const tabs = [
    { label: 'All', value: undefined },
    { label: 'Draft', value: WorkflowStatus.Draft },
    { label: 'Submitted', value: WorkflowStatus.Submitted },
    { label: 'In Approval', value: WorkflowStatus.InApproval },
    { label: 'Approved', value: WorkflowStatus.Approved },
    { label: 'Rejected', value: WorkflowStatus.Rejected },
    { label: 'Completed', value: WorkflowStatus.Completed },
    { label: 'Obsolete', value: WorkflowStatus.Obsolescence }
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Workflows</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage and track your N-level approval workflows</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/workflow-templates/new')}>
            <Settings className="mr-2 h-4 w-4" /> New Template
          </Button>
          <Button onClick={() => navigate('/workflows/new')}>
            <PlusCircle className="mr-2 h-4 w-4" /> New Request
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xs border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
        <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 p-2 overflow-x-auto flex gap-1">
          {tabs.map(tab => (
            <button
              key={tab.label}
              onClick={() => setFilterStatus(tab.value)}
              className={`px-4 py-2 text-sm font-semibold rounded-lg whitespace-nowrap transition-colors ${
                filterStatus === tab.value
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs ring-1 ring-slate-200 dark:ring-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400 animate-pulse">Loading workflows...</div>
        ) : isError ? (
          <div className="p-12 text-center text-red-500 dark:text-red-400">Failed to load workflows.</div>
        ) : workflows.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400">
            <p className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">No workflows found</p>
            <p className="text-sm">Create a new request to get started.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {workflows.map(wf => (
              <div 
                key={wf.id} 
                onClick={() => navigate(`/workflows/${wf.id}`)}
                className="p-4 sm:px-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center gap-4 justify-between"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 truncate">{wf.title}</h3>
                    <WorkflowStatusBadge status={wf.status} />
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-4 flex-wrap">
                    <span>By: <span className="font-medium text-slate-700 dark:text-slate-300">{wf.requestedByUserName}</span></span>
                    <span>Template: <span className="font-medium text-slate-700 dark:text-slate-300">{wf.workflowTemplateName}</span></span>
                  </div>
                </div>
                
                <div className="flex flex-col sm:items-end gap-1 shrink-0">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 font-mono">
                    Level {wf.currentApprovalLevel} / {wf.totalApprovalLevels}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    {new Date(wf.createdAtUtc).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
