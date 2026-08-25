/**
 * Smart Reports Utilities
 */

import type { ReportData, ReportInsight, ReportPeriod } from './types'

export function generateReport(sessions: any[], period: ReportPeriod): ReportData {
  const filteredSessions = filterSessionsByPeriod(sessions, period)
  
  const totalSessions = filteredSessions.length
  const totalDuration = filteredSessions.reduce((sum, s) => sum + s.duration, 0)
  const averageDuration = totalSessions > 0 ? Math.round(totalDuration / totalSessions) : 0

  // Mode breakdown
  const modeStats: Record<string, { count: number; duration: number }> = {}
  filteredSessions.forEach((session) => {
    if (!modeStats[session.mode]) {
      modeStats[session.mode] = { count: 0, duration: 0 }
    }
    modeStats[session.mode].count++
    modeStats[session.mode].duration += session.duration
  })

  const modeBreakdown = Object.entries(modeStats).map(([mode, stats]) => ({
    mode,
    count: stats.count,
    duration: stats.duration,
    percentage: Math.round((stats.count / totalSessions) * 100),
  }))

  // Most productive day and time
  const mostProductiveDay = findMostProductiveDay(filteredSessions)
  const mostProductiveTime = findMostProductiveTime(filteredSessions)

  // Longest session
  const longestSession = filteredSessions.reduce((longest, session) => {
    return session.duration > (longest?.duration || 0) ? session : longest
  }, null)

  // Generate insights
  const insights = generateInsights(filteredSessions, totalDuration, averageDuration, modeBreakdown)

  // Generate trends (compare with previous period)
  const trends = generateTrends(sessions, period, filteredSessions)

  return {
    period: getPeriodLabel(period),
    totalSessions,
    totalDuration,
    averageDuration,
    mostProductiveDay,
    mostProductiveTime,
    longestSession,
    modeBreakdown,
    insights,
    trends,
  }
}

function filterSessionsByPeriod(sessions: any[], period: ReportPeriod): any[] {
  const now = new Date()
  let startDate: Date

  switch (period) {
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case 'month':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      break
    case 'quarter':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
      break
    case 'year':
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
      break
    case 'all':
      return sessions
  }

  return sessions.filter((s) => s.timestamp >= startDate.getTime())
}

function findMostProductiveDay(sessions: any[]): string {
  const dayStats: Record<string, number> = {}
  
  sessions.forEach((session) => {
    const date = new Date(session.timestamp)
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' })
    dayStats[dayName] = (dayStats[dayName] || 0) + session.duration
  })

  const mostProductiveDay = Object.entries(dayStats).reduce((max, [day, duration]) => {
    return duration > (max[1] || 0) ? [day, duration] : max
  }, ['N/A', 0])

  return mostProductiveDay[0]
}

function findMostProductiveTime(sessions: any[]): string {
  const timeBlocks: Record<string, number> = {
    'Morning (6-12)': 0,
    'Afternoon (12-18)': 0,
    'Evening (18-24)': 0,
    'Night (0-6)': 0,
  }

  sessions.forEach((session) => {
    const hour = new Date(session.timestamp).getHours()
    
    if (hour >= 6 && hour < 12) {
      timeBlocks['Morning (6-12)'] += session.duration
    } else if (hour >= 12 && hour < 18) {
      timeBlocks['Afternoon (12-18)'] += session.duration
    } else if (hour >= 18 && hour < 24) {
      timeBlocks['Evening (18-24)'] += session.duration
    } else {
      timeBlocks['Night (0-6)'] += session.duration
    }
  })

  const mostProductiveTime = Object.entries(timeBlocks).reduce((max, [time, duration]) => {
    return duration > (max[1] || 0) ? [time, duration] : max
  }, ['N/A', 0])

  return mostProductiveTime[0]
}

function generateInsights(
  sessions: any[],
  totalDuration: number,
  averageDuration: number,
  modeBreakdown: any[]
): ReportInsight[] {
  const insights: ReportInsight[] = []

  // Total time insight
  if (totalDuration > 0) {
    const hours = Math.floor(totalDuration / 3600)
    insights.push({
      id: 'total-time',
      type: 'positive',
      title: 'Total Focus Time',
      description: `You've logged ${hours} hours of focused work. Great consistency!`,
      icon: 'schedule',
      metric: `${hours}h`,
    })
  }

  // Average session insight
  if (averageDuration >= 1800) {
    insights.push({
      id: 'avg-session',
      type: 'positive',
      title: 'Long Sessions',
      description: 'Your average session length is excellent for deep work.',
      icon: 'thumb_up',
      metric: formatDuration(averageDuration),
    })
  } else if (averageDuration < 900) {
    insights.push({
      id: 'avg-session',
      type: 'suggestion',
      title: 'Session Length',
      description: 'Try extending your sessions for better focus and productivity.',
      icon: 'lightbulb',
      metric: formatDuration(averageDuration),
    })
  }

  // Mode preference insight
  const favoriteMode = modeBreakdown.reduce((max, mode) => {
    return mode.count > (max?.count || 0) ? mode : max
  }, null)

  if (favoriteMode) {
    insights.push({
      id: 'favorite-mode',
      type: 'neutral',
      title: `${favoriteMode.mode} Mode Preferred`,
      description: `You use ${favoriteMode.mode} mode ${favoriteMode.percentage}% of the time.`,
      icon: 'star',
      metric: `${favoriteMode.percentage}%`,
    })
  }

  // Consistency insight
  if (sessions.length >= 7) {
    const daysWithSessions = new Set(
      sessions.map((s) => new Date(s.timestamp).toDateString())
    ).size
    
    if (daysWithSessions >= 5) {
      insights.push({
        id: 'consistency',
        type: 'positive',
        title: 'Great Consistency',
        description: `Active on ${daysWithSessions} different days. Keep it up!`,
        icon: 'verified',
        metric: `${daysWithSessions} days`,
      })
    }
  }

  // Completion rate for countdowns
  const countdowns = sessions.filter((s) => s.mode === 'Countdown')
  if (countdowns.length >= 3) {
    const completed = countdowns.filter((s) => s.completed !== false).length
    const completionRate = Math.round((completed / countdowns.length) * 100)
    
    if (completionRate >= 80) {
      insights.push({
        id: 'completion',
        type: 'positive',
        title: 'High Completion Rate',
        description: 'You finish most of your countdown sessions. Excellent discipline!',
        icon: 'check_circle',
        metric: `${completionRate}%`,
      })
    } else if (completionRate < 50) {
      insights.push({
        id: 'completion',
        type: 'suggestion',
        title: 'Improve Completion',
        description: 'Try setting more realistic countdown durations.',
        icon: 'flag',
        metric: `${completionRate}%`,
      })
    }
  }

  return insights
}

function generateTrends(allSessions: any[], period: ReportPeriod, currentPeriodSessions: any[]): any[] {
  // Calculate previous period sessions
  const now = new Date()
  let periodDays: number

  switch (period) {
    case 'week': periodDays = 7; break
    case 'month': periodDays = 30; break
    case 'quarter': periodDays = 90; break
    case 'year': periodDays = 365; break
    default: return []
  }

  const previousPeriodStart = new Date(now.getTime() - 2 * periodDays * 24 * 60 * 60 * 1000)
  const previousPeriodEnd = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000)

  const previousPeriodSessions = allSessions.filter(
    (s) => s.timestamp >= previousPeriodStart.getTime() && s.timestamp < previousPeriodEnd.getTime()
  )

  const currentTotal = currentPeriodSessions.reduce((sum, s) => sum + s.duration, 0)
  const previousTotal = previousPeriodSessions.reduce((sum, s) => sum + s.duration, 0)

  const trends = []

  if (previousTotal > 0) {
    const durationChange = ((currentTotal - previousTotal) / previousTotal) * 100
    trends.push({
      label: 'Total Duration',
      change: Math.round(durationChange),
      isPositive: durationChange > 0,
    })
  }

  const sessionCountChange = currentPeriodSessions.length - previousPeriodSessions.length
  if (previousPeriodSessions.length > 0) {
    trends.push({
      label: 'Session Count',
      change: Math.round((sessionCountChange / previousPeriodSessions.length) * 100),
      isPositive: sessionCountChange > 0,
    })
  }

  return trends
}

function getPeriodLabel(period: ReportPeriod): string {
  switch (period) {
    case 'week': return 'Last 7 Days'
    case 'month': return 'Last 30 Days'
    case 'quarter': return 'Last 90 Days'
    case 'year': return 'Last Year'
    case 'all': return 'All Time'
  }
}

function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  
  if (hrs > 0) {
    return `${hrs}h ${mins}m`
  }
  return `${mins}m`
}
