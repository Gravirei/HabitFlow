/**
 * Performance Monitoring Utilities
 * 
 * Provides utilities for tracking performance metrics with Sentry
 */

import { startTransaction, addBreadcrumb } from './sentry'

/**
 * Measure the performance of an async operation
 * 
 * @example
 * await measurePerformance('loadHabits', 'data.fetch', async () => {
 *   return await fetchHabits()
 * })
 */
export async function measurePerformance<T>(
  name: string,
  op: string,
  operation: () => Promise<T>
): Promise<T> {
  const span = startTransaction(name, op)
  
  try {
    const result = await operation()
    // Span automatically finishes with Sentry's new API
    return result
  } catch (error) {
    // Error is automatically tracked by Sentry
    throw error
  }
}

/**
 * Track a user action as a breadcrumb
 * 
 * @example
 * trackUserAction('Started countdown timer', { duration: 300 })
 */
export function trackUserAction(action: string, data?: Record<string, any>) {
  addBreadcrumb(action, 'user-action', data)
}

/**
 * Track a navigation event
 * 
 * @example
 * trackNavigation('Timer', '/timer')
 */
export function trackNavigation(page: string, path: string) {
  addBreadcrumb(`Navigated to ${page}`, 'navigation', { path })
}

/**
 * Track a data operation
 * 
 * @example
 * trackDataOperation('Saved habit to localStorage', { habitId: '123' })
 */
export function trackDataOperation(operation: string, data?: Record<string, any>) {
  addBreadcrumb(operation, 'data', data)
}
