/**
 * Compare Sessions Utilities
 */

import type { ComparisonMetric } from './types'

export function compareSessionMetrics(session1: any, session2: any): ComparisonMetric[] {
  const metrics: ComparisonMetric[] = []

  // Duration comparison
  const durationDiff = session2.duration - session1.duration
  const durationDiffPercent = ((durationDiff / session1.duration) * 100).toFixed(1)
  metrics.push({
    label: 'Duration',
    session1Value: formatDuration(session1.duration),
    session2Value: formatDuration(session2.duration),
    difference: `${durationDiff > 0 ? '+' : ''}${formatDuration(Math.abs(durationDiff))} (${durationDiffPercent}%)`,
    better: durationDiff > 0 ? 2 : durationDiff < 0 ? 1 : null,
  })

  // Mode comparison
  metrics.push({
    label: 'Mode',
    session1Value: session1.mode,
    session2Value: session2.mode,
  })

  // Date comparison
  metrics.push({
    label: 'Date',
    session1Value: new Date(session1.timestamp).toLocaleDateString(),
    session2Value: new Date(session2.timestamp).toLocaleDateString(),
  })

  // Time comparison
  metrics.push({
    label: 'Time',
    session1Value: new Date(session1.timestamp).toLocaleTimeString(),
    session2Value: new Date(session2.timestamp).toLocaleTimeString(),
  })

  // Session name comparison
  if (session1.sessionName || session2.sessionName) {
    metrics.push({
      label: 'Session Name',
      session1Value: session1.sessionName || 'N/A',
      session2Value: session2.sessionName || 'N/A',
    })
  }

  // Intervals-specific metrics
  if (session1.mode === 'Intervals' && session2.mode === 'Intervals') {
    if (session1.intervals && session2.intervals) {
      const s1WorkTime = session1.intervals.reduce((sum: number, i: any) => sum + (i.type === 'work' ? i.duration : 0), 0)
      const s2WorkTime = session2.intervals.reduce((sum: number, i: any) => sum + (i.type === 'work' ? i.duration : 0), 0)
      
      metrics.push({
        label: 'Work Time',
        session1Value: formatDuration(s1WorkTime),
        session2Value: formatDuration(s2WorkTime),
        difference: `${s2WorkTime - s1WorkTime > 0 ? '+' : ''}${formatDuration(Math.abs(s2WorkTime - s1WorkTime))}`,
        better: s2WorkTime > s1WorkTime ? 2 : s2WorkTime < s1WorkTime ? 1 : null,
      })

      const s1BreakTime = session1.intervals.reduce((sum: number, i: any) => sum + (i.type === 'break' ? i.duration : 0), 0)
      const s2BreakTime = session2.intervals.reduce((sum: number, i: any) => sum + (i.type === 'break' ? i.duration : 0), 0)
      
      metrics.push({
        label: 'Break Time',
        session1Value: formatDuration(s1BreakTime),
        session2Value: formatDuration(s2BreakTime),
        difference: `${s2BreakTime - s1BreakTime > 0 ? '+' : ''}${formatDuration(Math.abs(s2BreakTime - s1BreakTime))}`,
      })

      metrics.push({
        label: 'Intervals Count',
        session1Value: session1.intervals.length,
        session2Value: session2.intervals.length,
        difference: `${session2.intervals.length - session1.intervals.length > 0 ? '+' : ''}${session2.intervals.length - session1.intervals.length}`,
        better: session2.intervals.length > session1.intervals.length ? 2 : session2.intervals.length < session1.intervals.length ? 1 : null,
      })
    }
  }

  // Countdown-specific metrics
  if (session1.mode === 'Countdown' && session2.mode === 'Countdown') {
    if (session1.targetDuration && session2.targetDuration) {
      metrics.push({
        label: 'Target Duration',
        session1Value: formatDuration(session1.targetDuration),
        session2Value: formatDuration(session2.targetDuration),
      })

      const s1Completion = ((session1.duration / session1.targetDuration) * 100).toFixed(1)
      const s2Completion = ((session2.duration / session2.targetDuration) * 100).toFixed(1)
      
      metrics.push({
        label: 'Completion',
        session1Value: `${s1Completion}%`,
        session2Value: `${s2Completion}%`,
        difference: `${(parseFloat(s2Completion) - parseFloat(s1Completion)).toFixed(1)}%`,
        better: parseFloat(s2Completion) > parseFloat(s1Completion) ? 2 : parseFloat(s2Completion) < parseFloat(s1Completion) ? 1 : null,
      })
    }
  }

  return metrics
}

function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hrs > 0) {
    return `${hrs}h ${mins}m ${secs}s`
  }
  if (mins > 0) {
    return `${mins}m ${secs}s`
  }
  return `${secs}s`
}

export function calculateImprovementScore(session1: any, session2: any): number {
  // Simple improvement score based on duration increase
  const durationImprovement = ((session2.duration - session1.duration) / session1.duration) * 100
  return Math.round(durationImprovement)
}
