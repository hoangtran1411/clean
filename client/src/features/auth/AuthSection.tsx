import React, { useState } from 'react'
import { api } from '@/api/axiosClient'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ShieldCheck, LogIn, LogOut, KeyRound, UserCheck } from 'lucide-react'

interface AuthResponse {
  succeeded: boolean
  message: string
  data?: {
    accessToken: string
    refreshToken: string
    userId: string
    email: string
    fullName: string
    roles: string[]
    permissions: string[]
  }
}

interface AuthSectionProps {
  currentUser: AuthResponse['data'] | null
  onAuthChange: (user: AuthResponse['data'] | null) => void
}

export const AuthSection: React.FC<AuthSectionProps> = ({ currentUser, onAuthChange }) => {
  const [email, setEmail] = useState('admin@example.com')
  const [password, setPassword] = useState('Admin@123456')
  const [loading, setLoading] = useState(false)
  const [statusMsg, setStatusMsg] = useState('')

  const handleLogin = async (loginEmail?: string, loginPass?: string) => {
    setLoading(true)
    setStatusMsg('')
    try {
      const response = await api.post<AuthResponse>('/api/auth/login', {
        email: loginEmail || email,
        password: loginPass || password,
      })

      if (response.data.succeeded && response.data.data) {
        localStorage.setItem('accessToken', response.data.data.accessToken)
        localStorage.setItem('refreshToken', response.data.data.refreshToken)
        onAuthChange(response.data.data)
        setStatusMsg(`Successfully logged in as ${response.data.data.email}!`)
      }
    } catch (err: unknown) {
      const error = err as { message?: string; response?: { data?: { message?: string; title?: string } } }
      const backendMsg = error.response?.data?.message || error.response?.data?.title || error.message || 'Invalid credentials'
      setStatusMsg(`Login failed: ${backendMsg}`)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.clear()
    onAuthChange(null)
    setStatusMsg('Logged out successfully.')
  }

  const handleRefreshToken = async () => {
    setLoading(true)
    try {
      const accessToken = localStorage.getItem('accessToken')
      const refreshToken = localStorage.getItem('refreshToken')
      const { data } = await api.post<AuthResponse>('/api/auth/refresh-token', {
        accessToken,
        refreshToken,
      })

      if (data.succeeded && data.data) {
        localStorage.setItem('accessToken', data.data.accessToken)
        localStorage.setItem('refreshToken', data.data.refreshToken)
        onAuthChange(data.data)
        setStatusMsg('Token refreshed successfully (Refresh Token Rotation executed)!')
      }
    } catch {
      setStatusMsg('Failed to refresh token.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <CardTitle>Authentication & JWT Security</CardTitle>
          </div>
          {currentUser && (
            <Badge variant="success" className="flex items-center gap-1">
              <UserCheck className="h-3.5 w-3.5" /> Authenticated
            </Badge>
          )}
        </div>
        <CardDescription>
          ASP.NET Core Identity + HMAC-SHA256 JWT Bearer + Refresh Token Rotation
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {currentUser ? (
          <div className="space-y-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base">{currentUser.fullName}</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">{currentUser.email}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleRefreshToken} disabled={loading}>
                  <KeyRound className="h-4 w-4 mr-1" /> Refresh Token
                </Button>
                <Button variant="destructive" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-1" /> Logout
                </Button>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Roles:</span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {(currentUser.roles ?? []).map((role) => (
                  <Badge key={role} variant="default">
                    {role}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Permissions:</span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {(currentUser.permissions ?? []).map((perm) => (
                  <Badge key={perm} variant="secondary">
                    {perm}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button onClick={() => handleLogin()} disabled={loading}>
                <LogIn className="h-4 w-4 mr-1" /> Sign In
              </Button>

              <span className="text-xs text-slate-400 dark:text-slate-500">Quick Test Accounts:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEmail('admin@example.com')
                  setPassword('Admin@123456')
                  handleLogin('admin@example.com', 'Admin@123456')
                }}
              >
                Admin
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEmail('manager@example.com')
                  setPassword('Manager@123456')
                  handleLogin('manager@example.com', 'Manager@123456')
                }}
              >
                Manager
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEmail('user@example.com')
                  setPassword('User@123456')
                  handleLogin('user@example.com', 'User@123456')
                }}
              >
                User
              </Button>
            </div>
          </div>
        )}

        {statusMsg && (
          <p className="text-xs text-blue-700 dark:text-blue-300 font-medium bg-blue-50 dark:bg-blue-950/40 p-2.5 rounded-lg border border-blue-100 dark:border-blue-900/60">
            {statusMsg}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
