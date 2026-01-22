/**
 * AI Insights - Main Entry Point
 */

import { generateAIInsights } from './aiInsightsEngine'
import { generateInsightMessages } from './insightGenerators'
import { AIInsights, TimerSessionData, InsightsCache } from './types'

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
const CACHE_KEY = 'timer-ai-insights-cache'

/**
 * Get AI insights with caching
 */
export function getAIInsights(sessions: TimerSessionData[]): AIInsights {
  // Check cache first
  const cached = getCachedInsights()
  if (cached && cached.insights.dataRange.sessionsAnalyzed === sessions.length) {
    return cached.insights
  }

  // Generate new insights
  const rawInsights = generateAIInsights(sessions)
  const insights = generateInsightMessages(rawInsights)

  // Cache the results
  cacheInsights(insights)

  return insights
}

/**
 * Get cached insights if available and not expired
 */
function getCachedInsights(): InsightsCache | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (!cached) return null

    const cache: InsightsCache = JSON.parse(cached)
    const now = Date.now()

    if (now >= cache.expiresAt) {
      localStorage.removeItem(CACHE_KEY)
      return null
    }

    return cache
  } catch (error) {
    console.error('Failed to load cached insights:', error)
    return null
  }
}

/**
 * Cache insights
 */
function cacheInsights(insights: AIInsights): void {
  try {
    const now = Date.now()
    const cache: InsightsCache = {
      insights,
      cachedAt: now,
      expiresAt: now + CACHE_DURATION
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch (error) {
    console.error('Failed to cache insights:', error)
  }
}

/**
 * Clear cached insights
 */
export function clearInsightsCache(): void {
  try {
    localStorage.removeItem(CACHE_KEY)
  } catch (error) {
    console.error('Failed to clear insights cache:', error)
  }
}

// Export types
export type * from './types'

// Export components (will be added)
export { AIInsightsModal } from './AIInsightsModal'
