/**
 * Recommendations List
 */

import React from 'react'
import { Recommendation } from './types'

interface RecommendationsListProps {
  recommendations: Recommendation[]
}

export function RecommendationsList({ recommendations }: RecommendationsListProps) {
  return (
    <div className="space-y-3">
      {recommendations.map((rec) => (
        <RecommendationCard key={rec.id} recommendation={rec} />
      ))}
    </div>
  )
}

interface RecommendationCardProps {
  recommendation: Recommendation
}

function RecommendationCard({ recommendation }: RecommendationCardProps) {
  const priorityColors = {
    high: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      icon: 'text-red-600 dark:text-red-400',
      badge: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
    },
    medium: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      border: 'border-yellow-200 dark:border-yellow-800',
      icon: 'text-yellow-600 dark:text-yellow-400',
      badge: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
    },
    low: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      icon: 'text-blue-600 dark:text-blue-400',
      badge: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
    }
  }

  const colors = priorityColors[recommendation.priority]

  return (
    <div className={`${colors.bg} rounded-xl p-4 border ${colors.border}`}>
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-lg ${colors.icon} bg-white dark:bg-slate-700 flex items-center justify-center flex-shrink-0`}>
          <span className="material-symbols-outlined text-[22px]">
            {recommendation.icon}
          </span>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="font-semibold text-slate-800 dark:text-white">
              {recommendation.title}
            </h4>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${colors.badge} whitespace-nowrap`}>
              {recommendation.priority}
            </span>
          </div>
          
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {recommendation.description}
          </p>
          
          {recommendation.actionable && (
            <div className="mt-2 flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400">
              <span className="material-symbols-outlined text-[14px]">
                lightbulb
              </span>
              <span>Actionable tip</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
