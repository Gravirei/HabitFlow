/**
 * AI Insights Types & Interfaces
 */

export interface PeakHoursInsight {
  type: 'peak-hours'
  peakWindow: {
    startHour: number  // 0-23
    endHour: number    // 0-23
    sessionsCount: number
    totalDuration: number
    completionRate: number
  }
  hourlyDistribution: {
    hour: number
    sessions: number
    duration: number
    completionRate: number
  }[]
  message: string
  confidence: 'low' | 'medium' | 'high'
}

export interface DurationPatternInsight {
  type: 'duration-pattern'
  optimalDuration: {
    min: number
    max: number
    avgDuration: number
    completionRate: number
  }
  durationBuckets: {
    range: string
    count: number
    completionRate: number
  }[]
  trend: 'increasing' | 'decreasing' | 'stable'
  message: string
  confidence: 'low' | 'medium' | 'high'
}

export interface ModeMasteryInsight {
  type: 'mode-mastery'
  bestMode: {
    mode: 'Stopwatch' | 'Countdown' | 'Intervals'
    sessionsCount: number
    totalDuration: number
    completionRate: number
    avgDuration: number
  }
  modeComparison: {
    mode: 'Stopwatch' | 'Countdown' | 'Intervals'
    sessions: number
    duration: number
    completionRate: number
  }[]
  message: string
  confidence: 'low' | 'medium' | 'high'
}

export interface ConsistencyInsight {
  type: 'consistency'
  score: number  // 0-100
  metrics: {
    activeDays: number
    totalDays: number
    currentStreak: number
    longestStreak: number
    avgSessionsPerDay: number
    regularityScore: number  // 0-100
  }
  message: string
  trend: 'improving' | 'declining' | 'stable'
}

export interface ProductivityTrendInsight {
  type: 'productivity-trend'
  currentPeriod: {
    sessions: number
    duration: number
    completionRate: number
  }
  previousPeriod: {
    sessions: number
    duration: number
    completionRate: number
  }
  change: {
    sessions: number  // percentage
    duration: number  // percentage
    completionRate: number  // percentage
  }
  trend: 'up' | 'down' | 'stable'
  message: string
}

export interface Recommendation {
  id: string
  category: 'duration' | 'timing' | 'consistency' | 'mode' | 'breaks' | 'general'
  priority: 'high' | 'medium' | 'low'
  icon: string
  title: string
  description: string
  actionable: boolean
}

export interface WeeklySummary {
  period: {
    start: Date
    end: Date
  }
  highlights: {
    totalSessions: number
    totalDuration: number
    activeDays: number
    completionRate: number
    mostProductiveDay: {
      date: Date
      sessions: number
      duration: number
    }
    longestSession: {
      duration: number
      date: Date
      mode: string
    }
  }
  message: string
}

export interface ProductivityScore {
  overall: number  // 0-100
  breakdown: {
    consistency: number  // 0-100
    duration: number     // 0-100
    completion: number   // 0-100
    frequency: number    // 0-100
    improvement: number  // 0-100
  }
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F'
  message: string
}

export interface AIInsights {
  generatedAt: Date
  dataRange: {
    start: Date
    end: Date
    sessionsAnalyzed: number
  }
  productivityScore: ProductivityScore
  peakHours?: PeakHoursInsight
  durationPattern?: DurationPatternInsight
  modeMastery?: ModeMasteryInsight
  consistency: ConsistencyInsight
  productivityTrend?: ProductivityTrendInsight
  recommendations: Recommendation[]
  weeklySummary: WeeklySummary
  dataQuality: 'insufficient' | 'limited' | 'good' | 'excellent'
}

export interface InsightsCache {
  insights: AIInsights
  cachedAt: number
  expiresAt: number
}

// Session data for analysis
export interface TimerSessionData {
  id: string
  mode: 'Stopwatch' | 'Countdown' | 'Intervals'
  duration: number  // seconds
  startTime: Date
  endTime: Date
  completed: boolean
  intervals?: {
    workDuration: number
    breakDuration: number
    rounds: number
  }
}
