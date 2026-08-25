/**
 * Smart Reports Types
 */

export interface ReportInsight {
  id: string
  type: 'positive' | 'negative' | 'neutral' | 'suggestion'
  title: string
  description: string
  icon: string
  metric?: string
}

export interface ReportData {
  period: string
  totalSessions: number
  totalDuration: number
  averageDuration: number
  mostProductiveDay: string
  mostProductiveTime: string
  longestSession: any
  modeBreakdown: {
    mode: string
    count: number
    duration: number
    percentage: number
  }[]
  insights: ReportInsight[]
  trends: {
    label: string
    change: number
    isPositive: boolean
  }[]
}

export type ReportPeriod = 'week' | 'month' | 'quarter' | 'year' | 'all'
