import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useWorkflow, useSubmitWorkflow, useApproveWorkflow, useRejectWorkflow, useCompleteWorkflow } from '../hooks/useWorkflows'
import { WorkflowStatusBadge } from '../components/WorkflowStatusBadge'
import { WorkflowTimeline } from '../components/WorkflowTimeline'
import { WorkflowApprovalProgress } from '../components/WorkflowApprovalProgress'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

export function WorkflowDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const workflowId = Number(id)
  
  const { data: response, isLoading } = useWorkflow(workflowId)
  const submitMutation = useSubmitWorkflow()
  const approveMutation = useApproveWorkflow()
  const rejectMutation = useRejectWorkflow()
  const completeMutation = useCompleteWorkflow()
  
  const [comment, setComment] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectBox, setShowRejectBox] = useState(false)

  if (isLoading) return <div className="p-8 text-center text-slate-500 animate-pulse">Loading workflow...</div>
  if (!response?.data) return <div className="p-8 text-center text-red-500">Workflow not found</div>
  
  const workflow = response.data
  const isDraft = workflow.status === 'Draft'
  const isInApproval = workflow.status === 'InApproval'
  const isApproved = workflow.status === 'Approved'

  const handleApprove = () => {
    approveMutation.mutate({ id: workflowId, comment })
  }

  const handleReject = () => {
    if (!rejectionReason) return alert('Please provide a reason for rejection')
    rejectMutation.mutate({ id: workflowId, reason: rejectionReason }, {
      onSuccess: () => setShowRejectBox(false)
    })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/workflows')}>← Back to List</Button>
      </div>
      
      <div className="bg-white rounded-lg shadow-xs border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">{workflow.title}</h2>
              <div className="flex gap-4 text-sm text-slate-500">
                <span>Requested by: <strong>{workflow.requestedByUserName}</strong></span>
                <span>Template: <strong>{workflow.workflowTemplateName}</strong></span>
              </div>
            </div>
            <WorkflowStatusBadge status={workflow.status} />
          </div>
        </div>
        
        <div className="p-6 space-y-8">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-2">Description</h3>
            <p className="text-slate-700 whitespace-pre-wrap">{workflow.description}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Approval Progress</h3>
            <WorkflowApprovalProgress 
              currentApprovalLevel={workflow.currentApprovalLevel}
              totalApprovalLevels={workflow.totalApprovalLevels}
              status={workflow.status}
            />
          </div>

          <div className="border-t border-slate-100 pt-6">
            <WorkflowTimeline history={workflow.history} />
          </div>
        </div>
        
        {/* Actions based on status */}
        <div className="bg-slate-50 p-6 border-t border-slate-200 flex flex-col gap-4">
          {isDraft && (
            <div className="flex justify-end">
              <Button 
                onClick={() => submitMutation.mutate(workflowId)} 
                disabled={submitMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {submitMutation.isPending ? 'Submitting...' : 'Submit Request'}
              </Button>
            </div>
          )}

          {isInApproval && (
            <div className="space-y-4 bg-white p-4 rounded-md border border-slate-200 shadow-sm">
              <h4 className="text-sm font-semibold text-slate-900">Your Action Required</h4>
              <Textarea 
                value={comment} 
                onChange={e => setComment(e.target.value)} 
                placeholder="Optional comment..." 
                rows={2}
              />
              <div className="flex justify-end gap-3">
                <Button 
                  variant="outline" 
                  className="text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => setShowRejectBox(true)}
                >
                  Reject...
                </Button>
                <Button 
                  onClick={handleApprove}
                  disabled={approveMutation.isPending}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {approveMutation.isPending ? 'Approving...' : `Approve Level ${workflow.currentApprovalLevel}`}
                </Button>
              </div>

              {showRejectBox && (
                <div className="mt-4 p-4 border border-red-200 bg-red-50 rounded-md space-y-3">
                  <label className="text-sm font-medium text-red-900">Rejection Reason</label>
                  <Textarea 
                    value={rejectionReason} 
                    onChange={e => setRejectionReason(e.target.value)} 
                    placeholder="Provide a required reason for rejecting this workflow..." 
                    className="border-red-300 focus-visible:ring-red-500"
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

          {isApproved && (
            <div className="flex justify-end">
              <Button 
                onClick={() => completeMutation.mutate(workflowId)}
                disabled={completeMutation.isPending}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {completeMutation.isPending ? 'Completing...' : 'Mark as Completed'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
