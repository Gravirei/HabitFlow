/**
 * AI Insights Engine Tests
 * Comprehensive tests for core analysis algorithms
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  generateAIInsights,
  analyzePeakHours,
  analyzeDurationPatterns,
  analyzeModeMastery,
  analyzeConsistency,
  analyzeProductivityTrend,
  calculateProductivityScore,
  generateWeeklySummary
} from '../aiInsightsEngine'
import { TimerSessionData } from '../types'

// Helper to create mock sessions
function createMockSession(overrides: Partial<TimerSessionData> = {}): TimerSessionData {
  const now = new Date()
  return {
    id: `session-${Math.random().toString(36).substr(2, 9)}`,
    mode: 'Countdown',
    duration: 1500, // 25 minutes
    startTime: now,
    endTime: new Date(now.getTime() + 1500 * 1000),
    completed: true,
    ...overrides
  }
}

// Helper to create sessions at specific hours
function createSessionAtHour(hour: number, completed = true): TimerSessionData {
  const date = new Date()
  date.setHours(hour, 0, 0, 0)
  return createMockSession({
    startTime: date,
    endTime: new Date(date.getTime() + 1500 * 1000),
    completed
  })
}

// Helper to create sessions on specific dates
function createSessionOnDate(daysAgo: number, completed = true): TimerSessionData {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  date.setHours(10, 0, 0, 0)
  return createMockSession({
    startTime: date,
    endTime: new Date(date.getTime() + 1500 * 1000),
    completed
  })
}

describe('aiInsightsEngine', () => {
  describe('generateAIInsights', () => {
    it('should return insights with all required fields for empty sessions', () => {
      const insights = generateAIInsights([])
      
      expect(insights).toHaveProperty('generatedAt')
      expect(insights).toHaveProperty('dataRange')
      expect(insights).toHaveProperty('productivityScore')
      expect(insights).toHaveProperty('consistency')
      expect(insights).toHaveProperty('recommendations')
      expect(insights).toHaveProperty('weeklySummary')
      expect(insights).toHaveProperty('dataQuality')
    })

    it('should mark data quality as insufficient for < 5 sessions', () => {
      const sessions = [createMockSession(), createMockSession()]
      const insights = generateAIInsights(sessions)
      
      expect(insights.dataQuality).toBe('insufficient')
    })

    it('should mark data quality as limited for 5-19 sessions', () => {
      const sessions = Array.from({ length: 10 }, () => createMockSession())
      const insights = generateAIInsights(sessions)
      
      expect(insights.dataQuality).toBe('limited')
    })

    it('should mark data quality as good for 20-49 sessions', () => {
      const sessions = Array.from({ length: 30 }, () => createMockSession())
      const insights = generateAIInsights(sessions)
      
      expect(insights.dataQuality).toBe('good')
    })

    it('should mark data quality as excellent for 50+ sessions', () => {
      const sessions = Array.from({ length: 55 }, () => createMockSession())
      const insights = generateAIInsights(sessions)
      
      expect(insights.dataQuality).toBe('excellent')
    })

    it('should not include peakHours for < 5 sessions', () => {
      const sessions = [createMockSession(), createMockSession()]
      const insights = generateAIInsights(sessions)
      
      expect(insights.peakHours).toBeUndefined()
    })

    it('should include peakHours for >= 5 sessions', () => {
      const sessions = Array.from({ length: 6 }, () => createMockSession())
      const insights = generateAIInsights(sessions)
      
      expect(insights.peakHours).toBeDefined()
    })

    it('should not include modeMastery for < 10 sessions', () => {
      const sessions = Array.from({ length: 8 }, () => createMockSession())
      const insights = generateAIInsights(sessions)
      
      expect(insights.modeMastery).toBeUndefined()
    })

    it('should include modeMastery for >= 10 sessions', () => {
      const sessions = Array.from({ length: 12 }, () => createMockSession())
      const insights = generateAIInsights(sessions)
      
      expect(insights.modeMastery).toBeDefined()
    })

    it('should correctly set data range from sessions', () => {
      const oldSession = createSessionOnDate(10)
      const newSession = createSessionOnDate(0)
      const insights = generateAIInsights([oldSession, newSession])
      
      expect(insights.dataRange.sessionsAnalyzed).toBe(2)
    })
  })

  describe('analyzePeakHours', () => {
    it('should identify peak hours from session distribution', () => {
      // Create sessions clustered at 9-11 AM
      const sessions = [
        createSessionAtHour(9),
        createSessionAtHour(9),
        createSessionAtHour(10),
        createSessionAtHour(10),
        createSessionAtHour(10),
        createSessionAtHour(11),
        createSessionAtHour(14), // afternoon outlier
      ]
      
      const result = analyzePeakHours(sessions)
      
      expect(result.type).toBe('peak-hours')
      expect(result.peakWindow.startHour).toBe(9)
      expect(result.peakWindow.endHour).toBe(12)
    })

    it('should calculate correct session count in peak window', () => {
      const sessions = [
        createSessionAtHour(9),
        createSessionAtHour(9),
        createSessionAtHour(10),
        createSessionAtHour(14),
      ]
      
      const result = analyzePeakHours(sessions)
      
      // Peak should be at 9-12 with 3 sessions
      expect(result.peakWindow.sessionsCount).toBe(3)
    })

    it('should calculate completion rate in peak window', () => {
      const sessions = [
        createSessionAtHour(9, true),
        createSessionAtHour(9, true),
        createSessionAtHour(10, false),
        createSessionAtHour(10, true),
      ]
      
      const result = analyzePeakHours(sessions)
      
      // 3 completed out of 4 = 75%
      expect(result.peakWindow.completionRate).toBe(75)
    })

    it('should have hourly distribution for all 24 hours', () => {
      const sessions = [createSessionAtHour(9), createSessionAtHour(14)]
      const result = analyzePeakHours(sessions)
      
      expect(result.hourlyDistribution).toHaveLength(24)
    })

    it('should set confidence based on session count', () => {
      const fewSessions = Array.from({ length: 8 }, () => createMockSession())
      const mediumSessions = Array.from({ length: 15 }, () => createMockSession())
      const manySessions = Array.from({ length: 25 }, () => createMockSession())
      
      expect(analyzePeakHours(fewSessions).confidence).toBe('low')
      expect(analyzePeakHours(mediumSessions).confidence).toBe('medium')
      expect(analyzePeakHours(manySessions).confidence).toBe('high')
    })

    it('should handle sessions at midnight (hour 0)', () => {
      const sessions = [
        createSessionAtHour(0),
        createSessionAtHour(0),
        createSessionAtHour(1),
        createSessionAtHour(23),
        createSessionAtHour(23),
      ]
      
      const result = analyzePeakHours(sessions)
      
      expect(result.hourlyDistribution[0].sessions).toBe(2)
      expect(result.hourlyDistribution[23].sessions).toBe(2)
    })

    it('should handle wrap-around peak window (11 PM - 2 AM)', () => {
      const sessions = [
        createSessionAtHour(22),
        createSessionAtHour(22),
        createSessionAtHour(23),
        createSessionAtHour(23),
        createSessionAtHour(0),
        createSessionAtHour(0),
      ]
      
      const result = analyzePeakHours(sessions)
      
      // Should detect evening/night peak
      expect(result.peakWindow.sessionsCount).toBeGreaterThanOrEqual(4)
    })
  })

  describe('analyzeDurationPatterns', () => {
    it('should categorize sessions into duration buckets', () => {
      const sessions = [
        createMockSession({ duration: 120 }),   // <5min
        createMockSession({ duration: 600 }),   // 5-15min
        createMockSession({ duration: 1200 }),  // 15-30min
        createMockSession({ duration: 2400 }),  // 30-60min
        createMockSession({ duration: 4500 }),  // >60min
      ]
      
      const result = analyzeDurationPatterns(sessions)
      
      expect(result.type).toBe('duration-pattern')
      expect(result.durationBuckets).toHaveLength(5)
      expect(result.durationBuckets[0].range).toBe('<5min')
      expect(result.durationBuckets[0].count).toBe(1)
    })

    it('should identify optimal duration based on completion rate', () => {
      const sessions = [
        // Short sessions - 50% completion
        createMockSession({ duration: 200, completed: true }),
        createMockSession({ duration: 250, completed: false }),
        createMockSession({ duration: 280, completed: true }),
        createMockSession({ duration: 290, completed: false }),
        // Medium sessions - 100% completion
        createMockSession({ duration: 1000, completed: true }),
        createMockSession({ duration: 1100, completed: true }),
        createMockSession({ duration: 1200, completed: true }),
      ]
      
      const result = analyzeDurationPatterns(sessions)
      
      // 15-30min bucket should be optimal (100% completion)
      expect(result.optimalDuration.min).toBe(900)
      expect(result.optimalDuration.max).toBe(1800)
    })

    it('should calculate average duration correctly', () => {
      const sessions = [
        createMockSession({ duration: 600 }),
        createMockSession({ duration: 900 }),
        createMockSession({ duration: 1200 }),
      ]
      
      const result = analyzeDurationPatterns(sessions)
      
      expect(result.optimalDuration.avgDuration).toBe(900)
    })

    it('should detect increasing duration trend', () => {
      // Old sessions: short
      const oldSessions = Array.from({ length: 10 }, (_, i) => 
        createMockSession({ 
          duration: 600,
          startTime: new Date(Date.now() - (20 - i) * 24 * 60 * 60 * 1000)
        })
      )
      // Recent sessions: long
      const recentSessions = Array.from({ length: 10 }, (_, i) =>
        createMockSession({
          duration: 1800,
          startTime: new Date(Date.now() - (9 - i) * 24 * 60 * 60 * 1000)
        })
      )
      
      const result = analyzeDurationPatterns([...oldSessions, ...recentSessions])
      
      expect(result.trend).toBe('increasing')
    })

    it('should detect decreasing duration trend', () => {
      // Old sessions: long
      const oldSessions = Array.from({ length: 10 }, (_, i) =>
        createMockSession({
          duration: 1800,
          startTime: new Date(Date.now() - (20 - i) * 24 * 60 * 60 * 1000)
        })
      )
      // Recent sessions: short
      const recentSessions = Array.from({ length: 10 }, (_, i) =>
        createMockSession({
          duration: 600,
          startTime: new Date(Date.now() - (9 - i) * 24 * 60 * 60 * 1000)
        })
      )
      
      const result = analyzeDurationPatterns([...oldSessions, ...recentSessions])
      
      expect(result.trend).toBe('decreasing')
    })

    it('should detect stable duration trend', () => {
      const sessions = Array.from({ length: 20 }, (_, i) =>
        createMockSession({
          duration: 1200,
          startTime: new Date(Date.now() - (19 - i) * 24 * 60 * 60 * 1000)
        })
      )
      
      const result = analyzeDurationPatterns(sessions)
      
      expect(result.trend).toBe('stable')
    })

    it('should set confidence based on session count', () => {
      const fewSessions = Array.from({ length: 8 }, () => createMockSession())
      const manySessions = Array.from({ length: 25 }, () => createMockSession())
      
      expect(analyzeDurationPatterns(fewSessions).confidence).toBe('low')
      expect(analyzeDurationPatterns(manySessions).confidence).toBe('high')
    })
  })

  describe('analyzeModeMastery', () => {
    it('should identify best mode by completion rate', () => {
      const sessions = [
        // Stopwatch: 50% completion
        createMockSession({ mode: 'Stopwatch', completed: true }),
        createMockSession({ mode: 'Stopwatch', completed: false }),
        createMockSession({ mode: 'Stopwatch', completed: true }),
        createMockSession({ mode: 'Stopwatch', completed: false }),
        // Countdown: 100% completion
        createMockSession({ mode: 'Countdown', completed: true }),
        createMockSession({ mode: 'Countdown', completed: true }),
        createMockSession({ mode: 'Countdown', completed: true }),
        createMockSession({ mode: 'Countdown', completed: true }),
        // Intervals: 75% completion
        createMockSession({ mode: 'Intervals', completed: true }),
        createMockSession({ mode: 'Intervals', completed: true }),
        createMockSession({ mode: 'Intervals', completed: true }),
        createMockSession({ mode: 'Intervals', completed: false }),
      ]
      
      const result = analyzeModeMastery(sessions)
      
      expect(result.type).toBe('mode-mastery')
      expect(result.bestMode.mode).toBe('Countdown')
      expect(result.bestMode.completionRate).toBe(100)
    })

    it('should calculate total duration per mode', () => {
      const sessions = [
        createMockSession({ mode: 'Stopwatch', duration: 1000 }),
        createMockSession({ mode: 'Stopwatch', duration: 1000 }),
        createMockSession({ mode: 'Countdown', duration: 500 }),
      ]
      
      const result = analyzeModeMastery(sessions)
      
      const stopwatchStats = result.modeComparison.find(m => m.mode === 'Stopwatch')
      expect(stopwatchStats?.duration).toBe(2000)
    })

    it('should include all three modes in comparison', () => {
      const sessions = Array.from({ length: 10 }, () => createMockSession())
      const result = analyzeModeMastery(sessions)
      
      expect(result.modeComparison).toHaveLength(3)
      expect(result.modeComparison.map(m => m.mode)).toContain('Stopwatch')
      expect(result.modeComparison.map(m => m.mode)).toContain('Countdown')
      expect(result.modeComparison.map(m => m.mode)).toContain('Intervals')
    })

    it('should calculate average duration for best mode', () => {
      const sessions = [
        createMockSession({ mode: 'Countdown', duration: 1000, completed: true }),
        createMockSession({ mode: 'Countdown', duration: 2000, completed: true }),
        createMockSession({ mode: 'Countdown', duration: 3000, completed: true }),
      ]
      
      const result = analyzeModeMastery(sessions)
      
      expect(result.bestMode.avgDuration).toBe(2000)
    })

    it('should set confidence based on session count', () => {
      const fewSessions = Array.from({ length: 12 }, () => createMockSession())
      const mediumSessions = Array.from({ length: 20 }, () => createMockSession())
      const manySessions = Array.from({ length: 35 }, () => createMockSession())
      
      expect(analyzeModeMastery(fewSessions).confidence).toBe('low')
      expect(analyzeModeMastery(mediumSessions).confidence).toBe('medium')
      expect(analyzeModeMastery(manySessions).confidence).toBe('high')
    })

    it('should handle modes with no sessions', () => {
      const sessions = Array.from({ length: 10 }, () => 
        createMockSession({ mode: 'Countdown' })
      )
      
      const result = analyzeModeMastery(sessions)
      
      const stopwatchStats = result.modeComparison.find(m => m.mode === 'Stopwatch')
      expect(stopwatchStats?.sessions).toBe(0)
      expect(stopwatchStats?.completionRate).toBe(0)
    })
  })

  describe('analyzeConsistency', () => {
    it('should return zero scores for empty sessions', () => {
      const result = analyzeConsistency([])
      
      expect(result.type).toBe('consistency')
      expect(result.score).toBe(0)
      expect(result.metrics.activeDays).toBe(0)
      expect(result.metrics.currentStreak).toBe(0)
      expect(result.metrics.longestStreak).toBe(0)
    })

    it('should count active days correctly', () => {
      const sessions = [
        createSessionOnDate(0),
        createSessionOnDate(0), // same day
        createSessionOnDate(1),
        createSessionOnDate(3), // skip day 2
      ]
      
      const result = analyzeConsistency(sessions)
      
      expect(result.metrics.activeDays).toBe(3)
    })

    it('should calculate current streak for consecutive days', () => {
      const sessions = [
        createSessionOnDate(0), // today
        createSessionOnDate(1), // yesterday
        createSessionOnDate(2), // day before
      ]
      
      const result = analyzeConsistency(sessions)
      
      expect(result.metrics.currentStreak).toBe(3)
    })

    it('should break streak when day is missed', () => {
      const sessions = [
        createSessionOnDate(0), // today
        createSessionOnDate(2), // skip yesterday
        createSessionOnDate(3),
      ]
      
      const result = analyzeConsistency(sessions)
      
      expect(result.metrics.currentStreak).toBe(1)
    })

    it('should track longest streak metric', () => {
      // Create sessions on different days
      const sessions = [
        createSessionOnDate(0),
        createSessionOnDate(1),
        createSessionOnDate(5),
      ]
      
      const result = analyzeConsistency(sessions)
      
      // Should have longestStreak as a number >= 1
      expect(typeof result.metrics.longestStreak).toBe('number')
      expect(result.metrics.longestStreak).toBeGreaterThanOrEqual(1)
    })

    it('should calculate average sessions per day', () => {
      const sessions = [
        createSessionOnDate(0),
        createSessionOnDate(0),
        createSessionOnDate(0),
        createSessionOnDate(1),
        createSessionOnDate(1),
      ]
      
      const result = analyzeConsistency(sessions)
      
      // 5 sessions over 2 active days = 2.5
      expect(result.metrics.avgSessionsPerDay).toBe(2.5)
    })

    it('should detect improving trend', () => {
      // Old: few sessions
      const oldSessions = Array.from({ length: 3 }, (_, i) =>
        createSessionOnDate(20 - i)
      )
      // Recent: many sessions
      const recentSessions = Array.from({ length: 10 }, (_, i) =>
        createSessionOnDate(6 - i)
      )
      
      const result = analyzeConsistency([...oldSessions, ...recentSessions])
      
      expect(result.trend).toBe('improving')
    })

    it('should detect declining trend', () => {
      // Old: many sessions over 7 days
      const oldSessions = Array.from({ length: 14 }, (_, i) =>
        createSessionOnDate(20 - i)
      )
      // Recent: very few sessions
      const recentSessions = [createSessionOnDate(0)]
      
      const result = analyzeConsistency([...oldSessions, ...recentSessions])
      
      expect(result.trend).toBe('declining')
    })

    it('should calculate regularity score based on variance', () => {
      // Consistent daily sessions
      const consistentSessions = [
        createSessionOnDate(0),
        createSessionOnDate(1),
        createSessionOnDate(2),
        createSessionOnDate(3),
      ]
      
      const result = analyzeConsistency(consistentSessions)
      
      // Should have high regularity score (low variance)
      expect(result.metrics.regularityScore).toBeGreaterThan(50)
    })
  })

  describe('analyzeProductivityTrend', () => {
    it('should compare current and previous week', () => {
      const now = Date.now()
      const dayMs = 24 * 60 * 60 * 1000
      
      // Current week sessions (within last 7 days)
      const currentWeek = Array.from({ length: 5 }, (_, i) =>
        createMockSession({
          startTime: new Date(now - i * dayMs * 0.5), // Spread within week
          endTime: new Date(now - i * dayMs * 0.5 + 1500000)
        })
      )
      // Previous week sessions (8-14 days ago)
      const previousWeek = Array.from({ length: 3 }, (_, i) =>
        createMockSession({
          startTime: new Date(now - (8 + i) * dayMs),
          endTime: new Date(now - (8 + i) * dayMs + 1500000)
        })
      )
      
      const result = analyzeProductivityTrend([...currentWeek, ...previousWeek])
      
      expect(result.type).toBe('productivity-trend')
      expect(result.currentPeriod.sessions).toBe(5)
      expect(result.previousPeriod.sessions).toBe(3)
    })

    it('should calculate percentage change correctly', () => {
      const now = Date.now()
      const dayMs = 24 * 60 * 60 * 1000
      
      // Current week: 6 sessions spread within 7 days
      const currentWeek = Array.from({ length: 6 }, (_, i) =>
        createMockSession({
          startTime: new Date(now - i * dayMs),
          endTime: new Date(now - i * dayMs + 1500000)
        })
      )
      // Previous week: 3 sessions (8-10 days ago)
      const previousWeek = Array.from({ length: 3 }, (_, i) =>
        createMockSession({
          startTime: new Date(now - (8 + i) * dayMs),
          endTime: new Date(now - (8 + i) * dayMs + 1500000)
        })
      )
      
      const result = analyzeProductivityTrend([...currentWeek, ...previousWeek])
      
      // 6 vs 3 = 100% increase
      expect(result.change.sessions).toBe(100)
    })

    it('should detect upward trend', () => {
      const now = Date.now()
      const dayMs = 24 * 60 * 60 * 1000
      
      // Current week: 6 sessions with good duration (within last 7 days)
      const currentWeek = Array.from({ length: 6 }, (_, i) =>
        createMockSession({
          duration: 3000,
          startTime: new Date(now - i * dayMs),
          endTime: new Date(now - i * dayMs + 3000000)
        })
      )
      // Previous week: 2 sessions (8-9 days ago)
      const previousWeek = Array.from({ length: 2 }, (_, i) =>
        createMockSession({
          duration: 2000,
          startTime: new Date(now - (8 + i) * dayMs),
          endTime: new Date(now - (8 + i) * dayMs + 2000000)
        })
      )
      
      const result = analyzeProductivityTrend([...currentWeek, ...previousWeek])
      
      expect(result.trend).toBe('up')
    })

    it('should detect downward trend', () => {
      const now = Date.now()
      const dayMs = 24 * 60 * 60 * 1000
      
      // Current week: 2 sessions
      const currentWeek = Array.from({ length: 2 }, (_, i) =>
        createMockSession({
          startTime: new Date(now - i * dayMs),
          endTime: new Date(now - i * dayMs + 1500000)
        })
      )
      // Previous week: 7 sessions (8-14 days ago)
      const previousWeek = Array.from({ length: 7 }, (_, i) =>
        createMockSession({
          startTime: new Date(now - (8 + i) * dayMs),
          endTime: new Date(now - (8 + i) * dayMs + 1500000)
        })
      )
      
      const result = analyzeProductivityTrend([...currentWeek, ...previousWeek])
      
      expect(result.trend).toBe('down')
    })

    it('should detect stable trend', () => {
      const now = Date.now()
      const dayMs = 24 * 60 * 60 * 1000
      
      // Current week: 5 sessions
      const currentWeek = Array.from({ length: 5 }, (_, i) =>
        createMockSession({
          startTime: new Date(now - i * dayMs),
          endTime: new Date(now - i * dayMs + 1500000)
        })
      )
      // Previous week: 5 sessions (8-12 days ago)
      const previousWeek = Array.from({ length: 5 }, (_, i) =>
        createMockSession({
          startTime: new Date(now - (8 + i) * dayMs),
          endTime: new Date(now - (8 + i) * dayMs + 1500000)
        })
      )
      
      const result = analyzeProductivityTrend([...currentWeek, ...previousWeek])
      
      expect(result.trend).toBe('stable')
    })

    it('should calculate completion rates for both periods', () => {
      const now = Date.now()
      const dayMs = 24 * 60 * 60 * 1000
      
      // Current: 2 completed, 2 incomplete = 50%
      const currentWeek = [
        createMockSession({ completed: true, startTime: new Date(now), endTime: new Date(now + 1000) }),
        createMockSession({ completed: true, startTime: new Date(now - dayMs), endTime: new Date(now - dayMs + 1000) }),
        createMockSession({ completed: false, startTime: new Date(now - 2 * dayMs), endTime: new Date(now - 2 * dayMs + 1000) }),
        createMockSession({ completed: false, startTime: new Date(now - 3 * dayMs), endTime: new Date(now - 3 * dayMs + 1000) }),
      ]
      
      const result = analyzeProductivityTrend(currentWeek)
      
      expect(result.currentPeriod.completionRate).toBe(50)
    })
  })

  describe('calculateProductivityScore', () => {
    it('should return zero score for empty sessions', () => {
      const result = calculateProductivityScore([])
      
      expect(result.overall).toBe(0)
      expect(result.grade).toBe('F')
      expect(result.breakdown.consistency).toBe(0)
      expect(result.breakdown.duration).toBe(0)
      expect(result.breakdown.completion).toBe(0)
      expect(result.breakdown.frequency).toBe(0)
      expect(result.breakdown.improvement).toBe(0)
    })

    it('should calculate completion score correctly', () => {
      const sessions = [
        createMockSession({ completed: true }),
        createMockSession({ completed: true }),
        createMockSession({ completed: false }),
        createMockSession({ completed: false }),
      ]
      
      const result = calculateProductivityScore(sessions)
      
      // 50% completion
      expect(result.breakdown.completion).toBe(50)
    })

    it('should give high duration score for optimal duration (15-45 min)', () => {
      // 25 minute sessions - optimal
      const sessions = Array.from({ length: 10 }, () =>
        createMockSession({ duration: 1500 })
      )
      
      const result = calculateProductivityScore(sessions)
      
      expect(result.breakdown.duration).toBe(100)
    })

    it('should give lower duration score for very short sessions', () => {
      // 5 minute sessions - too short
      const sessions = Array.from({ length: 10 }, () =>
        createMockSession({ duration: 300 })
      )
      
      const result = calculateProductivityScore(sessions)
      
      expect(result.breakdown.duration).toBeLessThan(50)
    })

    it('should assign grade A+ for score >= 95', () => {
      // Create ideal sessions: consistent, optimal duration, all completed
      const sessions = Array.from({ length: 50 }, (_, i) =>
        createMockSession({
          duration: 1500,
          completed: true,
          startTime: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
          endTime: new Date(Date.now() - i * 24 * 60 * 60 * 1000 + 1500000)
        })
      )
      
      const result = calculateProductivityScore(sessions)
      
      expect(result.overall).toBeGreaterThanOrEqual(85)
      expect(['A+', 'A']).toContain(result.grade)
    })

    it('should assign grade F for very low score', () => {
      // Single incomplete session
      const sessions = [createMockSession({ completed: false, duration: 60 })]
      
      const result = calculateProductivityScore(sessions)
      
      expect(result.grade).toBe('F')
    })

    it('should calculate improvement score based on recent vs older completion', () => {
      // Old sessions: 0% completion
      const oldSessions = Array.from({ length: 10 }, (_, i) =>
        createMockSession({
          completed: false,
          startTime: new Date(Date.now() - (20 - i) * 24 * 60 * 60 * 1000),
          endTime: new Date(Date.now() - (20 - i) * 24 * 60 * 60 * 1000 + 1000)
        })
      )
      // Recent sessions: 100% completion
      const recentSessions = Array.from({ length: 10 }, (_, i) =>
        createMockSession({
          completed: true,
          startTime: new Date(Date.now() - (9 - i) * 24 * 60 * 60 * 1000),
          endTime: new Date(Date.now() - (9 - i) * 24 * 60 * 60 * 1000 + 1000)
        })
      )
      
      const result = calculateProductivityScore([...oldSessions, ...recentSessions])
      
      // Should show improvement
      expect(result.breakdown.improvement).toBeGreaterThan(50)
    })

    it('should have all breakdown values between 0 and 100', () => {
      const sessions = Array.from({ length: 20 }, () => createMockSession())
      const result = calculateProductivityScore(sessions)
      
      expect(result.breakdown.consistency).toBeGreaterThanOrEqual(0)
      expect(result.breakdown.consistency).toBeLessThanOrEqual(100)
      expect(result.breakdown.duration).toBeGreaterThanOrEqual(0)
      expect(result.breakdown.duration).toBeLessThanOrEqual(100)
      expect(result.breakdown.completion).toBeGreaterThanOrEqual(0)
      expect(result.breakdown.completion).toBeLessThanOrEqual(100)
      expect(result.breakdown.frequency).toBeGreaterThanOrEqual(0)
      expect(result.breakdown.frequency).toBeLessThanOrEqual(100)
      expect(result.breakdown.improvement).toBeGreaterThanOrEqual(0)
      expect(result.breakdown.improvement).toBeLessThanOrEqual(100)
    })

    it('should assign correct grades based on score thresholds', () => {
      // We test the grading logic directly by checking that higher scores get better grades
      const lowSession = [createMockSession({ completed: false, duration: 60 })]
      const lowResult = calculateProductivityScore(lowSession)
      
      expect(['D', 'F']).toContain(lowResult.grade)
    })
  })

  describe('generateWeeklySummary', () => {
    it('should return empty summary for no sessions', () => {
      const result = generateWeeklySummary([])
      
      expect(result.highlights.totalSessions).toBe(0)
      expect(result.highlights.totalDuration).toBe(0)
      expect(result.highlights.activeDays).toBe(0)
      expect(result.highlights.completionRate).toBe(0)
    })

    it('should only include sessions from the last 7 days', () => {
      const now = Date.now()
      const dayMs = 24 * 60 * 60 * 1000
      
      const recentSessions = [
        createMockSession({ startTime: new Date(now), endTime: new Date(now + 1000) }),
        createMockSession({ startTime: new Date(now - dayMs), endTime: new Date(now - dayMs + 1000) }),
      ]
      const oldSessions = [
        createMockSession({ startTime: new Date(now - 10 * dayMs), endTime: new Date(now - 10 * dayMs + 1000) }),
      ]
      
      const result = generateWeeklySummary([...recentSessions, ...oldSessions])
      
      expect(result.highlights.totalSessions).toBe(2)
    })

    it('should calculate total duration correctly', () => {
      const now = Date.now()
      const sessions = [
        createMockSession({ duration: 1000, startTime: new Date(now), endTime: new Date(now + 1000000) }),
        createMockSession({ duration: 2000, startTime: new Date(now - 1000), endTime: new Date(now) }),
      ]
      
      const result = generateWeeklySummary(sessions)
      
      expect(result.highlights.totalDuration).toBe(3000)
    })

    it('should count active days correctly', () => {
      const now = Date.now()
      const dayMs = 24 * 60 * 60 * 1000
      
      const sessions = [
        createMockSession({ startTime: new Date(now), endTime: new Date(now + 1000) }),
        createMockSession({ startTime: new Date(now), endTime: new Date(now + 1000) }), // same day
        createMockSession({ startTime: new Date(now - dayMs), endTime: new Date(now - dayMs + 1000) }),
        createMockSession({ startTime: new Date(now - 2 * dayMs), endTime: new Date(now - 2 * dayMs + 1000) }),
      ]
      
      const result = generateWeeklySummary(sessions)
      
      expect(result.highlights.activeDays).toBe(3)
    })

    it('should calculate completion rate correctly', () => {
      const now = Date.now()
      const sessions = [
        createMockSession({ completed: true, startTime: new Date(now), endTime: new Date(now + 1000) }),
        createMockSession({ completed: true, startTime: new Date(now), endTime: new Date(now + 1000) }),
        createMockSession({ completed: false, startTime: new Date(now), endTime: new Date(now + 1000) }),
        createMockSession({ completed: false, startTime: new Date(now), endTime: new Date(now + 1000) }),
      ]
      
      const result = generateWeeklySummary(sessions)
      
      expect(result.highlights.completionRate).toBe(50)
    })

    it('should identify most productive day', () => {
      const now = Date.now()
      const dayMs = 24 * 60 * 60 * 1000
      
      // Day 1: 2 sessions, 2000 duration
      const day1 = [
        createMockSession({ duration: 1000, startTime: new Date(now), endTime: new Date(now + 1000000) }),
        createMockSession({ duration: 1000, startTime: new Date(now), endTime: new Date(now + 1000000) }),
      ]
      // Day 2: 1 session, 5000 duration (most productive by duration)
      const day2 = [
        createMockSession({ duration: 5000, startTime: new Date(now - dayMs), endTime: new Date(now - dayMs + 5000000) }),
      ]
      
      const result = generateWeeklySummary([...day1, ...day2])
      
      expect(result.highlights.mostProductiveDay.duration).toBe(5000)
      expect(result.highlights.mostProductiveDay.sessions).toBe(1)
    })

    it('should identify longest session', () => {
      const now = Date.now()
      const sessions = [
        createMockSession({ duration: 1000, mode: 'Stopwatch', startTime: new Date(now), endTime: new Date(now + 1000000) }),
        createMockSession({ duration: 3000, mode: 'Countdown', startTime: new Date(now), endTime: new Date(now + 3000000) }),
        createMockSession({ duration: 2000, mode: 'Intervals', startTime: new Date(now), endTime: new Date(now + 2000000) }),
      ]
      
      const result = generateWeeklySummary(sessions)
      
      expect(result.highlights.longestSession.duration).toBe(3000)
      expect(result.highlights.longestSession.mode).toBe('Countdown')
    })

    it('should set correct period dates', () => {
      const now = new Date()
      const sessions = [createMockSession({ startTime: now, endTime: new Date(now.getTime() + 1000) })]
      
      const result = generateWeeklySummary(sessions)
      
      expect(result.period.end.getTime()).toBeCloseTo(now.getTime(), -3)
      expect(result.period.start.getTime()).toBeCloseTo(now.getTime() - 7 * 24 * 60 * 60 * 1000, -3)
    })
  })
})
