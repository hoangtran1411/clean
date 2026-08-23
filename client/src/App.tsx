import { useState, useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthSection } from '@/features/auth/AuthSection'
import { ProductsSection } from '@/features/products/ProductsSection'
import { IdempotencySection } from '@/features/payments/IdempotencySection'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Shield, Package, CreditCard, Sparkles, BookOpen } from 'lucide-react'

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

interface CurrentUser {
  userId: string
  email: string
  fullName: string
  roles: string[]
  permissions: string[]
  accessToken: string
  refreshToken: string
}

export function App() {
  const [activeTab, setActiveTab] = useState<'auth' | 'products' | 'idempotency'>('products')
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      setCurrentUser({
        userId: 'stored-session',
        email: 'admin@example.com',
        fullName: 'System Administrator',
        roles: ['Admin'],
        permissions: ['Users.View', 'Users.Create', 'Users.Delete', 'Reports.View', 'Reports.Export'],
        accessToken: token,
        refreshToken: localStorage.getItem('refreshToken') || '',
      })
    }
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
        {/* Header Navigation */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-md">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 leading-tight">
                  Clean Architecture Enterprise Dashboard
                </h1>
                <p className="text-xs text-slate-500">
                  React 19 • Tailwind CSS • shadcn/ui • Axios • TanStack Query • .NET 10
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="hidden sm:inline-flex bg-slate-50">
                .NET 10 Web API @ localhost:5000
              </Badge>
              {currentUser && (
                <Badge variant="success" className="font-mono text-xs">
                  {currentUser.email}
                </Badge>
              )}
            </div>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-2 py-2">
            <Button
              variant={activeTab === 'products' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('products')}
            >
              <Package className="h-4 w-4 mr-1.5 text-emerald-500" /> Catalog & EPPlus Excel
            </Button>
            <Button
              variant={activeTab === 'auth' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('auth')}
            >
              <Shield className="h-4 w-4 mr-1.5 text-blue-500" /> Identity & Dynamic Policies
            </Button>
            <Button
              variant={activeTab === 'idempotency' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('idempotency')}
            >
              <CreditCard className="h-4 w-4 mr-1.5 text-purple-500" /> Payments & Idempotency
            </Button>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {activeTab === 'products' && <ProductsSection />}
          {activeTab === 'auth' && (
            <AuthSection
              currentUser={currentUser}
              onAuthChange={(user) => setCurrentUser(user ? (user as CurrentUser) : null)}
            />
          )}
          {activeTab === 'idempotency' && <IdempotencySection />}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
          <div className="flex items-center justify-center gap-1">
            <BookOpen className="h-4 w-4 text-slate-400" />
            <span>
              Learning Guides available in <code className="bg-slate-100 px-1 py-0.5 rounded">docs-backend/</code> and{' '}
              <code className="bg-slate-100 px-1 py-0.5 rounded">docs-frontend/</code>
            </span>
          </div>
        </footer>
      </div>
    </QueryClientProvider>
  )
}

export default App
