export type WidgetSpan = '1' | '2' | '3' | 'full'

export interface DashboardWidgetConfig {
  id: string
  title: string
  category: 'kpi' | 'charts' | 'operations' | 'system'
  span: WidgetSpan
  visible: boolean
  order: number
}

export interface KpiMetric {
  id: string
  label: string
  value: string
  change: string
  isPositive: boolean
  icon: string
  subtext: string
  color: string
}

export interface SystemServiceStatus {
  name: string
  status: 'healthy' | 'warning' | 'degraded'
  latencyMs: number
  endpoint: string
  detail: string
}

export interface ActivityItem {
  id: string
  type: 'order' | 'workflow' | 'auth' | 'system'
  title: string
  description: string
  timestamp: string
  status: 'success' | 'pending' | 'warning' | 'info'
  user: string
}
