import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Activity, ShieldCheck, GitPullRequest, Package, CreditCard } from 'lucide-react'
import { ActivityItem } from '../types/dashboard'

interface RecentActivityWidgetProps {
  activities?: ActivityItem[]
}

const initialActivities: ActivityItem[] = [
  {
    id: 'act-1',
    type: 'workflow',
    title: 'Server Cluster Upgrade Approved',
    description: 'Level 2 Department Head signature verified via HMAC.',
    timestamp: '2 mins ago',
    status: 'success',
    user: 'admin@example.com',
  },
  {
    id: 'act-2',
    type: 'order',
    title: 'Bulk SKU Import Completed',
    description: 'EPPlus processed 35 catalog items with cache invalidation.',
    timestamp: '14 mins ago',
    status: 'info',
    user: 'manager@example.com',
  },
  {
    id: 'act-3',
    type: 'order',
    title: 'Idempotent Payment Processed',
    description: 'Charge $1,499.00 with Key: pay-key-849201 (Cached: None).',
    timestamp: '42 mins ago',
    status: 'success',
    user: 'user@example.com',
  },
  {
    id: 'act-4',
    type: 'auth',
    title: 'Refresh Token Rotated',
    description: 'Cryptographic PBKDF2 salt and token family validated.',
    timestamp: '1 hour ago',
    status: 'info',
    user: 'admin@example.com',
  },
  {
    id: 'act-5',
    type: 'workflow',
    title: 'Production Deployment Request Created',
    description: 'Workflow Ticket #14 assigned to Team Leader queue.',
    timestamp: '2 hours ago',
    status: 'pending',
    user: 'user@example.com',
  },
]

export const RecentActivityWidget: React.FC<RecentActivityWidgetProps> = ({ activities }) => {
  const [filterType, setFilterType] = useState<string>('all')

  const items = activities && activities.length > 0 ? activities : initialActivities
  const filtered = items.filter((a) => filterType === 'all' || a.type === filterType)

  const getIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'workflow':
        return <GitPullRequest className="h-4 w-4 text-orange-500" />
      case 'order':
        return <CreditCard className="h-4 w-4 text-purple-500" />
      case 'auth':
        return <ShieldCheck className="h-4 w-4 text-blue-500" />
      default:
        return <Package className="h-4 w-4 text-emerald-500" />
    }
  }

  return (
    <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm h-full flex flex-col">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <CardTitle className="text-base sm:text-lg">Real-Time Enterprise Activity Stream</CardTitle>
          </div>
          <CardDescription>Live audit events and state transitions from EF Core & MediatR</CardDescription>
        </div>

        <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
          {['all', 'workflow', 'order', 'auth'].map((f) => (
            <button
              key={f}
              onClick={() => setFilterType(f)}
              className={`px-2 py-1 text-xs font-semibold rounded-md capitalize transition-all ${
                filterType === f
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="flex-1 divide-y divide-slate-100 dark:divide-slate-800 pt-1">
        {filtered.map((item) => (
          <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-3 text-xs sm:text-sm">
            <div className="flex items-start space-x-3 min-w-0">
              <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0 mt-0.5">
                {getIcon(item.type)}
              </div>
              <div className="truncate">
                <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">{item.title}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{item.description}</div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-mono">By: {item.user}</div>
              </div>
            </div>

            <div className="flex flex-col items-end shrink-0 gap-1">
              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono whitespace-nowrap">
                {item.timestamp}
              </span>
              <Badge
                variant={
                  item.status === 'success'
                    ? 'success'
                    : item.status === 'pending'
                    ? 'warning'
                    : 'secondary'
                }
                className="text-[10px] px-1.5 py-0 capitalize"
              >
                {item.status}
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
