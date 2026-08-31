/**
 * Productivity Score Card - Main score display with breakdown
 */

import { ProductivityScore } from './types'

interface ProductivityScoreCardProps {
  score: ProductivityScore
}

export function ProductivityScoreCard({ score }: ProductivityScoreCardProps) {
  const getGradeColor = (grade: string) => {
    if (grade === 'A+' || grade === 'A') return 'from-green-500 to-emerald-600'
    if (grade === 'B') return 'from-blue-500 to-cyan-600'
    if (grade === 'C') return 'from-yellow-500 to-orange-500'
    if (grade === 'D') return 'from-orange-500 to-red-500'
    return 'from-red-500 to-pink-600'
  }

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600 dark:text-green-400'
    if (score >= 70) return 'text-blue-600 dark:text-blue-400'
    if (score >= 55) return 'text-yellow-600 dark:text-yellow-400'
    if (score >= 40) return 'text-orange-600 dark:text-orange-400'
    return 'text-red-600 dark:text-red-400'
  }

  const circumference = 2 * Math.PI * 70
  const strokeDashoffset = circumference - (score.overall / 100) * circumference

  return (
    <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 p-6 dark:border-slate-600 dark:from-slate-700 dark:to-slate-800">
      <div className="flex flex-col items-center gap-6 md:flex-row">
        {/* Score Ring */}
        <div className="relative flex-shrink-0">
          <svg className="h-40 w-40 -rotate-90 transform">
            {/* Background circle */}
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="currentColor"
              strokeWidth="12"
              fill="none"
              className="text-slate-200 dark:text-slate-600"
            />
            {/* Progress circle */}
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="url(#gradient)"
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" className="text-primary" style={{ stopColor: 'currentColor' }} />
                <stop
                  offset="100%"
                  className="text-purple-600"
                  style={{ stopColor: 'currentColor' }}
                />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-4xl font-bold ${getScoreColor(score.overall)}`}>
              {score.overall}
            </span>
            <span
              className={`bg-gradient-to-r text-2xl font-bold ${getGradeColor(score.grade)} bg-clip-text text-transparent`}
            >
              {score.grade}
            </span>
          </div>
        </div>

        {/* Score Details */}
        <div className="w-full flex-1">
          <h3 className="mb-2 text-xl font-bold text-slate-800 dark:text-white">
            Productivity Score
          </h3>
          <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">{score.message}</p>

          {/* Breakdown */}
          <div className="space-y-2">
            <ScoreBreakdownBar
              label="Consistency"
              value={score.breakdown.consistency}
              icon="local_fire_department"
            />
            <ScoreBreakdownBar
              label="Completion"
              value={score.breakdown.completion}
              icon="check_circle"
            />
            <ScoreBreakdownBar label="Duration" value={score.breakdown.duration} icon="schedule" />
            <ScoreBreakdownBar
              label="Frequency"
              value={score.breakdown.frequency}
              icon="calendar_today"
            />
            <ScoreBreakdownBar
              label="Improvement"
              value={score.breakdown.improvement}
              icon="trending_up"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

interface ScoreBreakdownBarProps {
  label: string
  value: number
  icon: string
}

function ScoreBreakdownBar({ label, value, icon }: ScoreBreakdownBarProps) {
  const getBarColor = (val: number) => {
    if (val >= 80) return 'bg-green-500'
    if (val >= 60) return 'bg-blue-500'
    if (val >= 40) return 'bg-yellow-500'
    return 'bg-orange-500'
  }

  return (
    <div className="flex items-center gap-3">
      <span className="material-symbols-outlined text-[18px] text-slate-500 dark:text-slate-400">
        {icon}
      </span>
      <span className="w-24 text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-600">
        <div
          className={`h-full ${getBarColor(value)} transition-all duration-500 ease-out`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="w-10 text-right text-sm font-semibold text-slate-700 dark:text-slate-300">
        {value}
      </span>
    </div>
  )
}
