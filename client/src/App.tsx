import { useState, useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation, Link } from 'react-router-dom'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'
import { AuthSection } from '@/features/auth/AuthSection'
import { ProductsSection } from '@/features/products/ProductsSection'
import { IdempotencySection } from '@/features/payments/IdempotencySection'
import { WorkflowListPage } from '@/features/workflows/pages/WorkflowListPage'
import { CreateWorkflowPage } from '@/features/workflows/pages/CreateWorkflowPage'
import { WorkflowDetailPage } from '@/features/workflows/pages/WorkflowDetailPage'
import { CreateWorkflowTemplatePage } from '@/features/workflows/pages/CreateWorkflowTemplatePage'
import { DocsPage } from '@/features/docs/pages/DocsPage'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Shield, Package, CreditCard, Sparkles, BookOpen, GitPullRequest, LayoutDashboard } from 'lucide-react'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import { ThemeToggle } from '@/components/theme/ThemeToggle'

// Initialize TanStack Query Client with global configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes fresh time
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

export interface CurrentUser {
  userId: string
  email: string
  fullName: string
  roles: string[]
  permissions: string[]
  accessToken: string
  refreshToken: string
}

function MainLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      setCurrentUser({
        userId: 'stored-session',
        email: 'admin@example.com',
        fullName: 'System Administrator',
        roles: ['Admin'],
        permissions: [
          'Users.View',
          'Users.Create',
          'Users.Delete',
          'Reports.View',
          'Reports.Export',
          'Workflows.View',
          'Workflows.Create',
          'Workflows.Submit',
          'Workflows.ManageTemplates',
          'Workflows.Reject',
          'Workflows.Complete',
          'Workflows.Approve.TeamLeader',
          'Workflows.Approve.DepartmentHead',
          'Workflows.Approve.DeputyDirector',
          'Workflows.Approve.TechnicalDirector',
        ],
        accessToken: token,
        refreshToken: localStorage.getItem('refreshToken') || '',
      })
    }
  }, [])

  const getActiveTab = () => {
    const path = location.pathname
    if (path === '/' || path.startsWith('/dashboard')) return 'dashboard'
    if (path.startsWith('/docs')) return 'docs'
    if (path.startsWith('/workflows') || path.startsWith('/workflow-templates')) return 'workflows'
    if (path.startsWith('/auth')) return 'auth'
    if (path.startsWith('/idempotency')) return 'idempotency'
    if (path.startsWith('/products')) return 'products'
    return 'dashboard'
  }

  const activeTab = getActiveTab()

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col font-sans transition-colors">
      {/* Header Navigation */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 shadow-xs transition-colors">
        <div className="max-w-7xl 2xl:max-w-[1720px] 3xl:max-w-[2100px] 4xl:max-w-[2560px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 3xl:px-16 4xl:px-20 h-16 2xl:h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 hover:opacity-90 transition-opacity">
            <div className="h-9 w-9 2xl:h-11 2xl:w-11 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md">
              <Sparkles className="h-5 w-5 2xl:h-6 2xl:w-6" />
            </div>
            <div>
              <h1 className="text-lg 2xl:text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                Clean Architecture Enterprise Dashboard
              </h1>
              <p className="text-xs 2xl:text-sm text-slate-500 dark:text-slate-400">
                React 19 • Tailwind CSS • shadcn/ui • Axios • TanStack Query • .NET 10
              </p>
            </div>
          </Link>

          <div className="flex items-center space-x-2 sm:space-x-3">
            <Badge variant="outline" className="hidden sm:inline-flex bg-slate-50 dark:bg-slate-800 text-xs 2xl:text-sm py-1 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
              .NET 10 Web API @ localhost:5000
            </Badge>
            {currentUser && (
              <Badge variant="success" className="font-mono text-xs 2xl:text-sm py-1">
                {currentUser.email}
              </Badge>
            )}

            {/* Dark / Light / System Theme Toggle */}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 sticky top-16 2xl:top-20 z-40 shadow-xs backdrop-blur-xs transition-colors">
        <div className="max-w-7xl 2xl:max-w-[1720px] 3xl:max-w-[2100px] 4xl:max-w-[2560px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 3xl:px-16 4xl:px-20 flex space-x-2 py-2 2xl:py-3 overflow-x-auto">
          <Button
            variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => navigate('/dashboard')}
            className={`text-xs sm:text-sm 2xl:text-base 2xl:py-2.5 ${
              activeTab !== 'dashboard' ? 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800' : ''
            }`}
          >
            <LayoutDashboard className="h-4 w-4 2xl:h-5 2xl:w-5 mr-1.5 text-blue-500" /> ERP Dashboard
          </Button>
          <Button
            variant={activeTab === 'products' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => navigate('/products')}
            className={`text-xs sm:text-sm 2xl:text-base 2xl:py-2.5 ${
              activeTab !== 'products' ? 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800' : ''
            }`}
          >
            <Package className="h-4 w-4 2xl:h-5 2xl:w-5 mr-1.5 text-emerald-500" /> Catalog & EPPlus Excel
          </Button>
          <Button
            variant={activeTab === 'auth' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => navigate('/auth')}
            className={`text-xs sm:text-sm 2xl:text-base 2xl:py-2.5 ${
              activeTab !== 'auth' ? 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800' : ''
            }`}
          >
            <Shield className="h-4 w-4 2xl:h-5 2xl:w-5 mr-1.5 text-blue-500" /> Identity & Dynamic Policies
          </Button>
          <Button
            variant={activeTab === 'idempotency' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => navigate('/idempotency')}
            className={`text-xs sm:text-sm 2xl:text-base 2xl:py-2.5 ${
              activeTab !== 'idempotency' ? 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800' : ''
            }`}
          >
            <CreditCard className="h-4 w-4 2xl:h-5 2xl:w-5 mr-1.5 text-purple-500" /> Payments & Idempotency
          </Button>
          <Button
            variant={activeTab === 'workflows' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => navigate('/workflows')}
            className={`text-xs sm:text-sm 2xl:text-base 2xl:py-2.5 ${
              activeTab !== 'workflows' ? 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800' : ''
            }`}
          >
            <GitPullRequest className="h-4 w-4 2xl:h-5 2xl:w-5 mr-1.5 text-orange-500" /> Workflows
          </Button>
          <Button
            variant={activeTab === 'docs' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => navigate('/docs')}
            className={`text-xs sm:text-sm 2xl:text-base 2xl:py-2.5 ${
              activeTab === 'docs'
                ? 'bg-blue-600 text-white'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <BookOpen className="h-4 w-4 2xl:h-5 2xl:w-5 mr-1.5 text-blue-500" /> Documentation Hub
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl 2xl:max-w-[1720px] 3xl:max-w-[2100px] 4xl:max-w-[2560px] w-full mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 3xl:px-16 4xl:px-20 py-6 2xl:py-10">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/products" element={<ProductsSection />} />
          <Route
            path="/auth"
            element={
              <AuthSection
                currentUser={currentUser}
                onAuthChange={(user) => setCurrentUser(user ? (user as CurrentUser) : null)}
              />
            }
          />
          <Route path="/idempotency" element={<IdempotencySection />} />
          <Route path="/workflows" element={<WorkflowListPage />} />
          <Route path="/workflows/new" element={<CreateWorkflowPage />} />
          <Route path="/workflows/:id" element={<WorkflowDetailPage />} />
          <Route path="/workflow-templates/new" element={<CreateWorkflowTemplatePage />} />

          {/* Documentation Hub Routes */}
          <Route path="/docs" element={<DocsPage />} />
          <Route path="/docs/:category" element={<DocsPage />} />
          <Route path="/docs/:category/:docSlug" element={<DocsPage />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-4 text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400 transition-colors">
        <div className="max-w-7xl 2xl:max-w-[1720px] 3xl:max-w-[2100px] 4xl:max-w-[2560px] mx-auto px-4 flex items-center justify-center gap-1.5">
          <BookOpen className="h-4 w-4 text-slate-400 dark:text-slate-500" />
          <span>
            100+ In-Depth Learning Guides available in{' '}
            <Link to="/docs" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
              Documentation Hub (/docs)
            </Link>
          </span>
        </div>
      </footer>
    </div>
  )
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system">
        <BrowserRouter>
          <MainLayout />
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
