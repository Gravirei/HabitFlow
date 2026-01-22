/**
 * Compare Sessions Types
 */

export interface ComparisonMetric {
  label: string
  session1Value: string | number
  session2Value: string | number
  difference?: string
  better?: 1 | 2 | null // Which session performed better
}

export interface SessionComparison {
  session1: any
  session2: any
  metrics: ComparisonMetric[]
}
