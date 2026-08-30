import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  PackagePlus,
  GitPullRequest,
  CreditCard,
  Download,
  KeyRound,
  BookOpen,
  Sparkles,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export const QuickActionsWidget: React.FC = () => {
  const navigate = useNavigate()

  return (
    <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          <CardTitle className="text-base sm:text-lg">ERP Executive Quick Actions</CardTitle>
        </div>
        <CardDescription>Instant launch shortcuts to key enterprise workflows and tools</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
        <Button
          variant="outline"
          onClick={() => navigate('/products')}
          className="flex flex-col items-center justify-center h-20 p-2 text-center border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 group"
        >
          <PackagePlus className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mb-1 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Add SKU</span>
        </Button>

        <Button
          variant="outline"
          onClick={() => navigate('/workflows/new')}
          className="flex flex-col items-center justify-center h-20 p-2 text-center border-slate-200 dark:border-slate-800 hover:border-orange-500 dark:hover:border-orange-500 hover:bg-orange-50/50 dark:hover:bg-orange-950/30 group"
        >
          <GitPullRequest className="h-5 w-5 text-orange-600 dark:text-orange-400 mb-1 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">New Approval</span>
        </Button>

        <Button
          variant="outline"
          onClick={() => navigate('/idempotency')}
          className="flex flex-col items-center justify-center h-20 p-2 text-center border-slate-200 dark:border-slate-800 hover:border-purple-500 dark:hover:border-purple-500 hover:bg-purple-50/50 dark:hover:bg-purple-950/30 group"
        >
          <CreditCard className="h-5 w-5 text-purple-600 dark:text-purple-400 mb-1 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Charge API</span>
        </Button>

        <Button
          variant="outline"
          onClick={() => navigate('/auth')}
          className="flex flex-col items-center justify-center h-20 p-2 text-center border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 group"
        >
          <KeyRound className="h-5 w-5 text-blue-600 dark:text-blue-400 mb-1 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Auth & Roles</span>
        </Button>

        <Button
          variant="outline"
          onClick={() => navigate('/workflow-templates/new')}
          className="flex flex-col items-center justify-center h-20 p-2 text-center border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 group"
        >
          <Download className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mb-1 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">New Template</span>
        </Button>

        <Button
          variant="outline"
          onClick={() => navigate('/docs')}
          className="flex flex-col items-center justify-center h-20 p-2 text-center border-slate-200 dark:border-slate-800 hover:border-cyan-500 dark:hover:border-cyan-500 hover:bg-cyan-50/50 dark:hover:bg-cyan-950/30 group"
        >
          <BookOpen className="h-5 w-5 text-cyan-600 dark:text-cyan-400 mb-1 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Knowledge Hub</span>
        </Button>
      </CardContent>
    </Card>
  )
}
