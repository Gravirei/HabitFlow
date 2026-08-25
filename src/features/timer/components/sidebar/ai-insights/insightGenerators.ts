/**
 * Insight Generators - Text Generation & Recommendations
 */

import {
  AIInsights,
  Recommendation,
  PeakHoursInsight,
  DurationPatternInsight,
  ModeMasteryInsight,
  ConsistencyInsight,
  ProductivityTrendInsight,
  ProductivityScore,
  WeeklySummary
} from './types'

/**
 * Generate all text messages and recommendations for insights
 */
export function generateInsightMessages(insights: AIInsights): AIInsights {
  return {
    ...insights,
    productivityScore: generateScoreMessage(insights.productivityScore),
    peakHours: insights.peakHours ? generatePeakHoursMessage(insights.peakHours) : undefined,
    durationPattern: insights.durationPattern ? generateDurationMessage(insights.durationPattern) : undefined,
    modeMastery: insights.modeMastery ? generateModeMasteryMessage(insights.modeMastery) : undefined,
    consistency: generateConsistencyMessage(insights.consistency),
    productivityTrend: insights.productivityTrend ? generateTrendMessage(insights.productivityTrend) : undefined,
    weeklySummary: generateWeeklySummaryMessage(insights.weeklySummary),
    recommendations: generateRecommendations(insights)
  }
}

/**
 * Generate productivity score message
 */
function generateScoreMessage(score: ProductivityScore): ProductivityScore {
  let message = ''
  
  if (score.overall >= 90) {
    message = `Outstanding! You're in the top tier with a ${score.grade} productivity grade. Keep up the excellent work! 🌟`
  } else if (score.overall >= 80) {
    message = `Great job! Your ${score.grade} grade shows strong productivity habits. You're doing excellent! 🎯`
  } else if (score.overall >= 70) {
    message = `Good work! Your ${score.grade} grade indicates solid productivity. Room for improvement! 💪`
  } else if (score.overall >= 60) {
    message = `You're making progress with a ${score.grade} grade. Keep building those habits! 📈`
  } else if (score.overall >= 50) {
    message = `Your ${score.grade} grade shows potential. Focus on consistency to improve! 🎓`
  } else {
    message = `Starting your journey with a ${score.grade} grade. Every expert was once a beginner! 🌱`
  }

  return { ...score, message }
}

/**
 * Generate peak hours message
 */
function generatePeakHoursMessage(insight: PeakHoursInsight): PeakHoursInsight {
  const { startHour, endHour, sessionsCount, completionRate } = insight.peakWindow
  
  const formatHour = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    return `${displayHour} ${period}`
  }

  const timeRange = `${formatHour(startHour)} - ${formatHour(endHour)}`
  const percentage = Math.round((sessionsCount / insight.hourlyDistribution.reduce((sum, h) => sum + h.sessions, 0)) * 100)
  
  let message = `Your peak productivity is between ${timeRange}. `
  message += `You complete ${Math.round(completionRate)}% of your sessions during this time `
  message += `(${sessionsCount} sessions, ${percentage}% of total). `
  
  if (completionRate >= 80) {
    message += `This is your power window! 🔥`
  } else if (completionRate >= 60) {
    message += `Focus your important work here! 🎯`
  } else {
    message += `Consider scheduling key tasks during these hours. ⏰`
  }

  return { ...insight, message }
}

/**
 * Generate duration pattern message
 */
function generateDurationMessage(insight: DurationPatternInsight): DurationPatternInsight {
  const { min, max, completionRate } = insight.optimalDuration
  const avgMinutes = Math.round(insight.optimalDuration.avgDuration / 60)
  
  const formatDuration = (seconds: number) => {
    const mins = Math.round(seconds / 60)
    if (mins < 60) return `${mins} minutes`
    const hours = Math.floor(mins / 60)
    const remainingMins = mins % 60
    return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours} hour${hours > 1 ? 's' : ''}`
  }

  const rangeText = formatDuration(min) + ' - ' + formatDuration(max)
  
  let message = `You work best in ${rangeText} sessions with a ${Math.round(completionRate)}% completion rate. `
  message += `Your average session is ${avgMinutes} minutes. `
  
  if (insight.trend === 'increasing') {
    message += `You're trending toward longer sessions. 📈`
  } else if (insight.trend === 'decreasing') {
    message += `You're trending toward shorter, focused sessions. ⚡`
  } else {
    message += `You've found your rhythm! 🎵`
  }

  return { ...insight, message }
}

/**
 * Generate mode mastery message
 */
function generateModeMasteryMessage(insight: ModeMasteryInsight): ModeMasteryInsight {
  const { mode, sessionsCount, completionRate } = insight.bestMode
  
  const modeEmoji = {
    Stopwatch: '⏱️',
    Countdown: '⏲️',
    Intervals: '🔄'
  }

  let message = `${modeEmoji[mode]} ${mode} mode works best for you! `
  message += `With ${sessionsCount} sessions and a ${Math.round(completionRate)}% completion rate, `
  message += `this mode helps you stay focused. `
  
  const otherModes = insight.modeComparison.filter(m => m.mode !== mode)
  const hasOtherModes = otherModes.some(m => m.sessions > 0)
  
  if (hasOtherModes) {
    message += `Consider using ${mode} mode more often for better results! 🎯`
  } else {
    message += `Keep leveraging this mode for maximum productivity! 💪`
  }

  return { ...insight, message }
}

/**
 * Generate consistency message
 */
function generateConsistencyMessage(insight: ConsistencyInsight): ConsistencyInsight {
  const { score, metrics, trend } = insight
  const { activeDays, totalDays, currentStreak, longestStreak } = metrics
  
  let message = ''
  
  if (score >= 80) {
    message = `Exceptional consistency! 🌟 `
  } else if (score >= 60) {
    message = `Strong consistency! 💪 `
  } else if (score >= 40) {
    message = `Building momentum! 📈 `
  } else {
    message = `Starting your journey! 🌱 `
  }

  message += `You've been active ${activeDays} out of ${totalDays} days. `
  
  if (currentStreak > 0) {
    message += `Current streak: ${currentStreak} day${currentStreak !== 1 ? 's' : ''} 🔥 `
  }
  
  if (longestStreak > currentStreak) {
    message += `Your longest streak was ${longestStreak} days. `
  }
  
  if (trend === 'improving') {
    message += `You're on an upward trajectory! Keep it up! 🚀`
  } else if (trend === 'declining') {
    message += `Time to get back on track! You've got this! 💪`
  } else {
    message += `Maintain this steady pace! 🎯`
  }

  return { ...insight, message }
}

/**
 * Generate productivity trend message
 */
function generateTrendMessage(insight: ProductivityTrendInsight): ProductivityTrendInsight {
  const { change, trend } = insight
  const avgChange = Math.round((change.sessions + change.duration) / 2)
  
  let message = ''
  
  if (trend === 'up') {
    message = `📈 You're on fire! Productivity up ${Math.abs(avgChange)}% compared to last week. `
    message += `Keep this momentum going! 🚀`
  } else if (trend === 'down') {
    message = `📉 Productivity dipped ${Math.abs(avgChange)}% this week. `
    message += `Don't worry - every journey has ups and downs. Let's bounce back! 💪`
  } else {
    message = `📊 Steady as she goes! Productivity remained stable this week. `
    message += `Consistency is key! 🎯`
  }

  return { ...insight, message }
}

/**
 * Generate weekly summary message
 */
function generateWeeklySummaryMessage(summary: WeeklySummary): WeeklySummary {
  const { highlights } = summary
  
  if (highlights.totalSessions === 0) {
    return {
      ...summary,
      message: 'No sessions recorded this week. Start your productivity journey today! 🌟'
    }
  }

  const hours = Math.floor(highlights.totalDuration / 3600)
  const minutes = Math.floor((highlights.totalDuration % 3600) / 60)
  const durationText = hours > 0 ? `${hours}h ${minutes}m` : `${minutes} minutes`
  
  let message = `This week: ${highlights.totalSessions} session${highlights.totalSessions !== 1 ? 's' : ''}, `
  message += `${durationText} focused time across ${highlights.activeDays} day${highlights.activeDays !== 1 ? 's' : ''}. `
  message += `Completion rate: ${Math.round(highlights.completionRate)}%. `
  
  if (highlights.completionRate >= 80) {
    message += `Outstanding! 🌟`
  } else if (highlights.completionRate >= 60) {
    message += `Great work! 🎯`
  } else {
    message += `Keep pushing! 💪`
  }

  return { ...summary, message }
}

/**
 * Generate personalized recommendations
 */
export function generateRecommendations(insights: AIInsights): Recommendation[] {
  const recommendations: Recommendation[] = []
  let id = 1

  // Check data quality first
  if (insights.dataQuality === 'insufficient') {
    recommendations.push({
      id: `rec-${id++}`,
      category: 'general',
      priority: 'high',
      icon: 'info',
      title: 'Build Your Data',
      description: 'Complete at least 5 sessions to unlock personalized insights and recommendations.',
      actionable: true
    })
    return recommendations
  }

  // Duration recommendations
  if (insights.durationPattern) {
    const avgMins = Math.round(insights.durationPattern.optimalDuration.avgDuration / 60)
    
    if (avgMins < 15) {
      recommendations.push({
        id: `rec-${id++}`,
        category: 'duration',
        priority: 'high',
        icon: 'schedule',
        title: 'Try Longer Sessions',
        description: 'Your average session is quite short. Try 25-minute focused sessions for better deep work.',
        actionable: true
      })
    } else if (avgMins > 60) {
      recommendations.push({
        id: `rec-${id++}`,
        category: 'duration',
        priority: 'medium',
        icon: 'coffee',
        title: 'Take More Breaks',
        description: 'Long sessions detected. Consider the Pomodoro technique: 25 min work + 5 min break.',
        actionable: true
      })
    }
  }

  // Peak hours recommendations
  if (insights.peakHours) {
    const peakCompletion = insights.peakHours.peakWindow.completionRate
    
    if (peakCompletion >= 70) {
      const formatHour = (hour: number) => {
        const period = hour >= 12 ? 'PM' : 'AM'
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
        return `${displayHour} ${period}`
      }
      
      recommendations.push({
        id: `rec-${id++}`,
        category: 'timing',
        priority: 'high',
        icon: 'schedule',
        title: 'Leverage Your Peak Hours',
        description: `Schedule your most important tasks between ${formatHour(insights.peakHours.peakWindow.startHour)} - ${formatHour(insights.peakHours.peakWindow.endHour)} when you're most productive.`,
        actionable: true
      })
    }
  }

  // Consistency recommendations
  const consistency = insights.consistency
  
  if (consistency.score < 50) {
    recommendations.push({
      id: `rec-${id++}`,
      category: 'consistency',
      priority: 'high',
      icon: 'calendar_today',
      title: 'Build Daily Habits',
      description: 'Set a goal to use the timer at least once per day. Consistency beats intensity!',
      actionable: true
    })
  }

  if (consistency.metrics.currentStreak === 0 && consistency.metrics.longestStreak > 0) {
    recommendations.push({
      id: `rec-${id++}`,
      category: 'consistency',
      priority: 'medium',
      icon: 'local_fire_department',
      title: 'Restart Your Streak',
      description: `You had a ${consistency.metrics.longestStreak}-day streak before. You can do it again! Start today.`,
      actionable: true
    })
  }

  // Mode recommendations
  if (insights.modeMastery) {
    const bestMode = insights.modeMastery.bestMode
    const totalSessions = insights.dataRange.sessionsAnalyzed
    const bestModePercentage = (bestMode.sessionsCount / totalSessions) * 100
    
    if (bestModePercentage < 50) {
      recommendations.push({
        id: `rec-${id++}`,
        category: 'mode',
        priority: 'medium',
        icon: 'star',
        title: `Use ${bestMode.mode} Mode More`,
        description: `${bestMode.mode} mode has your highest completion rate (${Math.round(bestMode.completionRate)}%). Try using it more often!`,
        actionable: true
      })
    }
  }

  // Productivity trend recommendations
  if (insights.productivityTrend) {
    if (insights.productivityTrend.trend === 'down') {
      recommendations.push({
        id: `rec-${id++}`,
        category: 'general',
        priority: 'high',
        icon: 'trending_up',
        title: 'Get Back on Track',
        description: 'Productivity dipped this week. Set a small goal for tomorrow - even 15 minutes counts!',
        actionable: true
      })
    }
  }

  // Completion rate recommendation
  const completedCount = insights.weeklySummary.highlights.completionRate
  
  if (completedCount < 60) {
    recommendations.push({
      id: `rec-${id++}`,
      category: 'general',
      priority: 'medium',
      icon: 'check_circle',
      title: 'Improve Completion Rate',
      description: 'Many sessions are being stopped early. Try starting with shorter, achievable session lengths.',
      actionable: true
    })
  }

  // General encouragement
  if (consistency.score >= 70 && insights.productivityScore.overall >= 75) {
    recommendations.push({
      id: `rec-${id++}`,
      category: 'general',
      priority: 'low',
      icon: 'emoji_events',
      title: 'You\'re Crushing It!',
      description: 'Your consistency and productivity scores are excellent. Keep up the amazing work!',
      actionable: false
    })
  }

  // Sort by priority
  const priorityOrder = { high: 1, medium: 2, low: 3 }
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

  // Return top 5 recommendations
  return recommendations.slice(0, 5)
}
