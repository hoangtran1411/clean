import { api } from '@/api/axiosClient'

export interface DashboardApiResponse {
  succeeded: boolean
  message: string
  data: {
    kpis: {
      totalRevenue: number
      priorMonthRevenue: number
      revenueGrowthPercent: number
      totalProducts: number
      lowStockProducts: number
      activeWorkflows: number
      completedWorkflows: number
      totalPaymentsCount: number
      cacheHitRatio: number
      averageLatencyMs: number
    }
    categoryDistribution: Array<{
      name: string
      count: number
      percentage: number
      color: string
    }>
    revenueTimeSeries: Array<{
      label: string
      revenue: number
      orders: number
    }>
    approvalVelocity: Array<{
      level: number
      name: string
      avgHours: string
      pendingCount: number
      status: string
    }>
    recentActivities: Array<{
      id: string
      type: 'workflow' | 'order' | 'auth' | 'system'
      title: string
      description: string
      timestamp: string
      status: 'success' | 'pending' | 'warning' | 'info'
      user: string
    }>
    systemTelemetry: {
      uptime: string
      memoryUsageMb: number
      gcMode: string
      threadPoolWorkers: number
      dbLatencyMs: number
      environmentName: string
      dotNetVersion: string
      osDescription: string
    }
  }
}

export const dashboardApi = {
  getMetrics: async (period: string = 'month') => {
    const res = await api.get<DashboardApiResponse>(`/api/dashboard/metrics?period=${period}`)
    return res.data
  },
}
