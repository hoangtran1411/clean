import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { workflowApi } from '@/features/workflows/api/workflowApi'

export function CreateWorkflowTemplatePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [levels, setLevels] = useState([
    { levelOrder: 1, levelName: '', requiredPermission: '' }
  ])

  const createMutation = useMutation({
    mutationFn: workflowApi.createWorkflowTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflowTemplates'] })
      navigate('/workflows')
    }
  })

  const addLevel = () => {
    setLevels([...levels, { levelOrder: levels.length + 1, levelName: '', requiredPermission: '' }])
  }

  const removeLevel = (index: number) => {
    const newLevels = [...levels]
    newLevels.splice(index, 1)
    // Reorder
    newLevels.forEach((level, i) => {
      level.levelOrder = i + 1
    })
    setLevels(newLevels)
  }

  const updateLevel = (index: number, field: string, value: string) => {
    const newLevels = [...levels]
    newLevels[index] = { ...newLevels[index], [field]: value }
    setLevels(newLevels)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate({ name, description, approvalLevels: levels })
  }

  return (
    <div className="bg-white rounded-lg shadow-xs border border-slate-200 overflow-hidden p-6 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold text-slate-900 mb-6">Create New Workflow Template</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Template Name</label>
          <Input 
            value={name} 
            onChange={e => setName(e.target.value)} 
            placeholder="e.g. Leave Request (3 Levels)" 
            required 
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Description</label>
          <Textarea 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
            placeholder="Describe what this workflow is used for" 
          />
        </div>

        <div className="pt-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Approval Levels</h3>
            <Button type="button" variant="outline" size="sm" onClick={addLevel}>
              ＋ Add Approval Level
            </Button>
          </div>
          
          <div className="space-y-4">
            {levels.map((level, idx) => (
              <div key={idx} className="flex items-start gap-4 p-4 border border-slate-200 rounded-md bg-slate-50">
                <div className="flex-none">
                  <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700">
                    {level.levelOrder}
                  </div>
                </div>
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">Level Name</label>
                    <Input 
                      value={level.levelName} 
                      onChange={e => updateLevel(idx, 'levelName', e.target.value)} 
                      placeholder="e.g. Team Leader" 
                      required 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">Required Permission</label>
                    <Input 
                      value={level.requiredPermission} 
                      onChange={e => updateLevel(idx, 'requiredPermission', e.target.value)} 
                      placeholder="e.g. Workflows.Approve.TeamLeader" 
                      required 
                    />
                  </div>
                </div>
                {levels.length > 1 && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeLevel(idx)} className="text-red-500 mt-5">
                    ✕ Remove
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={() => navigate('/workflows')}>
            Cancel
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Creating...' : 'Create Template'}
          </Button>
        </div>
      </form>
    </div>
  )
}
