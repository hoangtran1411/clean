import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  useWorkflow, 
  useSubmitWorkflow, 
  useApproveWorkflow, 
  useRejectWorkflow, 
  useCompleteWorkflow, 
  useObsoleteWorkflow,
  useResetWorkflowToDraft
} from '../hooks/useWorkflows'
import { WorkflowStatusBadge } from '../components/WorkflowStatusBadge'
import { WorkflowTimeline } from '../components/WorkflowTimeline'
import { WorkflowApprovalProgress } from '../components/WorkflowApprovalProgress'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { AlertCircle, ArchiveX, RotateCcw } from 'lucide-react'

export function WorkflowDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const workflowId = Number(id)
  
  const { data: response, isLoading } = useWorkflow(workflowId)
  const submitMutation = useSubmitWorkflow()
  const approveMutation = useApproveWorkflow()
  const rejectMutation = useRejectWorkflow()
  const completeMutation = useCompleteWorkflow()
  const obsoleteMutation = useObsoleteWorkflow()
  const resetMutation = useResetWorkflowToDraft()
  
  const [comment, setComment] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectBox, setShowRejectBox] = useState(false)
  const [obsolescenceReason, setObsolescenceReason] = useState('')
  const [showObsoleteBox, setShowObsoleteBox] = useState(false)
  const [resetReason, setResetReason] = useState('')
  const [showResetBox, setShowResetBox] = useState(false)

  if (isLoading) return <div className="p-8 text-center text-slate-500 dark:text-slate-400 animate-pulse">Loading workflow...</div>
  if (!response?.data) return <div className="p-8 text-center text-red-500 dark:text-red-400">Workflow not found</div>
  
  const workflow = response.data
  const isDraft = workflow.status === 'Draft'
  const isInApproval = workflow.status === 'InApproval'
  const isApproved = workflow.status === 'Approved'
  const isRejected = workflow.status === 'Rejected'
  const isObsolete = workflow.status === 'Obsolescence'
  const canBeObsoleted = isDraft || isInApproval || isApproved
  const canBeResetToDraft = !isDraft && workflow.status !== 'Completed'

  const handleApprove = () => {
    approveMutation.mutate({ id: workflowId, comment })
  }

  const handleReject = () => {
    if (!rejectionReason.trim()) return alert('Please provide a reason for rejection')
    rejectMutation.mutate({ id: workflowId, reason: rejectionReason }, {
      onSuccess: () => setShowRejectBox(false)
    })
  }

  const handleObsolete = () => {
    if (!obsolescenceReason.trim()) return alert('Please provide a reason for marking this workflow as obsolete')
    obsoleteMutation.mutate({ id: workflowId, reason: obsolescenceReason }, {
      onSuccess: () => setShowObsoleteBox(false)
    })
  }

  const handleResetToDraft = () => {
    if (!resetReason.trim()) return alert('Please provide a reason for revoking signatures and resetting this workflow to Draft')
    resetMutation.mutate({ id: workflowId, reason: resetReason }, {
      onSuccess: () => setShowResetBox(false)
    })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/workflows')}>← Back to List</Button>
      </div>
      
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xs border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">{workflow.title}</h2>
              <div className="flex gap-4 text-sm text-slate-500 dark:text-slate-400 flex-wrap">
                <span>Requested by: <strong className="text-slate-700 dark:text-slate-300">{workflow.requestedByUserName}</strong></span>
                <span>Template: <strong className="text-slate-700 dark:text-slate-300">{workflow.workflowTemplateName}</strong></span>
              </div>
            </div>
            <WorkflowStatusBadge status={workflow.status} />
          </div>
        </div>
        
        <div className="p-6 space-y-8">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">Description</h3>
            <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{workflow.description}</p>
          </div>

          {/* Obsolescence Banner */}
          {isObsolete && (
            <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex items-start gap-3">
              <ArchiveX className="w-5 h-5 text-slate-500 dark:text-slate-400 mt-0.5 shrink-0" />
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-slate-100">This workflow has been marked as Obsolete</h4>
                <p className="text-sm mt-1">{workflow.obsolescenceReason || 'No specific reason provided.'}</p>
                {workflow.obsoletedByUserName && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Marked by {workflow.obsoletedByUserName} on {workflow.obsoletedAtUtc ? new Date(workflow.obsoletedAtUtc).toLocaleString() : ''}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Rejection Banner */}
          {isRejected && (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 mt-0.5 shrink-0" />
              <div>
                <h4 className="font-semibold text-red-900 dark:text-red-200">Workflow Rejected</h4>
                <p className="text-sm mt-1">{workflow.rejectionReason || 'No specific reason provided.'}</p>
              </div>
            </div>
          )}

          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">Approval Progress</h3>
            <WorkflowApprovalProgress 
              currentApprovalLevel={workflow.currentApprovalLevel}
              totalApprovalLevels={workflow.totalApprovalLevels}
              status={workflow.status}
            />
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
            <WorkflowTimeline history={workflow.history} />
          </div>
        </div>
        
        {/* Actions based on status */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-6 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-4">
          {/* Main Contextual Actions */}
          <div className="flex justify-between items-center flex-wrap gap-2">
            <div className="flex gap-2">
              {canBeResetToDraft && !showResetBox && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                  onClick={() => setShowResetBox(true)}
                >
                  <RotateCcw className="w-4 h-4 mr-1.5" /> Revoke Signatures & Reset to Draft...
                </Button>
              )}

              {canBeObsoleted && !showObsoleteBox && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                  onClick={() => setShowObsoleteBox(true)}
                >
                  <ArchiveX className="w-4 h-4 mr-1.5" /> Mark Obsolete...
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              {isDraft && (
                <Button 
                  onClick={() => submitMutation.mutate(workflowId)} 
                  disabled={submitMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {submitMutation.isPending ? 'Submitting...' : 'Submit Request'}
                </Button>
              )}

              {isApproved && (
                <Button 
                  onClick={() => completeMutation.mutate(workflowId)}
                  disabled={completeMutation.isPending}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {completeMutation.isPending ? 'Completing...' : 'Mark as Completed'}
                </Button>
              )}
            </div>
          </div>

          {/* Reset to Draft Dialog Box */}
          {showResetBox && (
            <div className="p-4 border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-semibold text-sm">
                <RotateCcw className="w-4 h-4" /> Revoke Signatures & Reset to Draft (Highest Permission)
              </div>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                This will remove all approvals / signatures, reset the status to Draft, and allow the requester to edit details and re-submit.
              </p>
              <label className="text-sm font-medium text-amber-900 dark:text-amber-200">Reason for Resetting (Required)</label>
              <Textarea 
                value={resetReason} 
                onChange={e => setResetReason(e.target.value)} 
                placeholder="e.g. Product pricing/specifications incorrect - resetting to Draft for corrections..." 
                className="border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900"
                rows={3}
              />
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setShowResetBox(false)}>Cancel</Button>
                <Button 
                  variant="default"
                  size="sm" 
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                  onClick={handleResetToDraft} 
                  disabled={resetMutation.isPending}
                >
                  {resetMutation.isPending ? 'Resetting...' : 'Confirm Revocation & Reset'}
                </Button>
              </div>
            </div>
          )}

          {/* InApproval Action Card */}
          {isInApproval && (
            <div className="space-y-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Your Action Required</h4>
              <Textarea 
                value={comment} 
                onChange={e => setComment(e.target.value)} 
                placeholder="Optional review comment..." 
                rows={2}
              />
              <div className="flex justify-end gap-3">
                <Button 
                  variant="outline" 
                  className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950/40"
                  onClick={() => setShowRejectBox(true)}
                >
                  Reject...
                </Button>
                <Button 
                  onClick={handleApprove}
                  disabled={approveMutation.isPending}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {approveMutation.isPending ? 'Approving...' : `Approve Level ${workflow.currentApprovalLevel}`}
                </Button>
              </div>

              {/* Rejection Dialog Box */}
              {showRejectBox && (
                <div className="mt-4 p-4 border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 rounded-xl space-y-3">
                  <label className="text-sm font-medium text-red-900 dark:text-red-200">Rejection Reason (Required)</label>
                  <Textarea 
                    value={rejectionReason} 
                    onChange={e => setRejectionReason(e.target.value)} 
                    placeholder="Provide a reason for rejecting this workflow..." 
                    className="border-red-300 dark:border-red-700"
                    rows={3}
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setShowRejectBox(false)}>Cancel</Button>
                    <Button variant="destructive" size="sm" onClick={handleReject} disabled={rejectMutation.isPending}>
                      Confirm Rejection
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Obsolescence Dialog Box */}
          {showObsoleteBox && (
            <div className="p-4 border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 rounded-xl space-y-3">
              <label className="text-sm font-medium text-slate-900 dark:text-slate-100">Obsolescence Reason (Required)</label>
              <Textarea 
                value={obsolescenceReason} 
                onChange={e => setObsolescenceReason(e.target.value)} 
                placeholder="Explain why this workflow is being deprecated / marked obsolete..." 
                className="border-slate-300 dark:border-slate-700"
                rows={3}
              />
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setShowObsoleteBox(false)}>Cancel</Button>
                <Button 
                  variant="default"
                  size="sm" 
                  className="bg-slate-700 hover:bg-slate-800 text-white"
                  onClick={handleObsolete} 
                  disabled={obsoleteMutation.isPending}
                >
                  Confirm Obsolescence
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
