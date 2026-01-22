/**
 * Productivity Score Card - Main score display with breakdown
 */

import React from 'react'
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
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-600">
      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Score Ring */}
        <div className="relative flex-shrink-0">
          <svg className="w-40 h-40 transform -rotate-90">
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
                <stop offset="100%" className="text-purple-600" style={{ stopColor: 'currentColor' }} />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-4xl font-bold ${getScoreColor(score.overall)}`}>
              {score.overall}
            </span>
            <span className={`text-2xl font-bold bg-gradient-to-r ${getGradeColor(score.grade)} text-transparent bg-clip-text`}>
              {score.grade}
            </span>
          </div>
        </div>

        {/* Score Details */}
        <div className="flex-1 w-full">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
            Productivity Score
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
            {score.message}
          </p>

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
            <ScoreBreakdownBar
              label="Duration"
              value={score.breakdown.duration}
              icon="schedule"
            />
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
      <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 text-[18px]">
        {icon}
      </span>
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300 w-24">
        {label}
      </span>
      <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
        <div
          className={`h-full ${getBarColor(value)} transition-all duration-500 ease-out`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 w-10 text-right">
        {value}
      </span>
    </div>
  )
}
