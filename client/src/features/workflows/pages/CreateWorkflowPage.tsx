import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useCreateWorkflow, useWorkflowTemplates } from '../hooks/useWorkflows'

export function CreateWorkflowPage() {
  const navigate = useNavigate()
  const createMutation = useCreateWorkflow()
  const { data: templatesRes } = useWorkflowTemplates()
  
  const [templateId, setTemplateId] = useState<number>(0)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const templates = templatesRes?.data || []

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (templateId === 0) return alert('Select a template')
    createMutation.mutate({ workflowTemplateId: templateId, title, description }, {
      onSuccess: () => navigate('/workflows')
    })
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xs border border-slate-200 dark:border-slate-800 p-6 sm:p-8 max-w-2xl mx-auto transition-colors">
      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">New Workflow Request</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Workflow Template</label>
          <select 
            className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 text-sm shadow-xs focus:ring-2 focus:ring-blue-500 outline-none"
            value={templateId}
            onChange={e => setTemplateId(Number(e.target.value))}
            required
          >
            <option value={0}>-- Select a Template --</option>
            {templates.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Title</label>
          <Input 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            placeholder="e.g. Server Upgrade Approval" 
            required 
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
          <Textarea 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
            placeholder="Details about the request..." 
            rows={4}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={() => navigate('/workflows')}>Cancel</Button>
          <Button type="submit" disabled={createMutation.isPending || templateId === 0}>
            {createMutation.isPending ? 'Creating...' : 'Create Draft'}
          </Button>
        </div>
      </form>
    </div>
  )
}
