/**
 * Achievements Panel Component
 * Main panel displaying achievements with filtering
 */

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { AchievementCard } from './AchievementCard'
import type { Achievement } from './types'
import { getAchievementStats } from './achievementTracking'

interface AchievementsPanelProps {
  achievements: Achievement[]
}

type FilterType = 'all' | 'unlocked' | 'locked' | 'common' | 'rare' | 'epic' | 'legendary'

export function AchievementsPanel({ achievements }: AchievementsPanelProps) {
  const [filter, setFilter] = useState<FilterType>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  const stats = getAchievementStats(achievements)

  // Filter achievements
  const filteredAchievements = achievements.filter((achievement) => {
    // Status filter
    if (filter === 'unlocked' && !achievement.unlocked) return false
    if (filter === 'locked' && achievement.unlocked) return false
    
    // Rarity filter
    if (filter === 'common' && achievement.rarity !== 'common') return false
    if (filter === 'rare' && achievement.rarity !== 'rare') return false
    if (filter === 'epic' && achievement.rarity !== 'epic') return false
    if (filter === 'legendary' && achievement.rarity !== 'legendary') return false

    // Category filter
    if (categoryFilter !== 'all' && achievement.category !== categoryFilter) return false

    return true
  })

  // Sort: unlocked first, then by rarity, then by progress
  const sortedAchievements = [...filteredAchievements].sort((a, b) => {
    if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1
    
    const rarityOrder = { legendary: 4, epic: 3, rare: 2, common: 1 }
    const rarityDiff = rarityOrder[b.rarity] - rarityOrder[a.rarity]
    if (rarityDiff !== 0) return rarityDiff

    const progressA = a.progress / a.requirement
    const progressB = b.progress / b.requirement
    return progressB - progressA
  })

  const filterButtons: { id: FilterType; label: string; icon: string }[] = [
    { id: 'all', label: 'All', icon: 'grid_view' },
    { id: 'unlocked', label: 'Unlocked', icon: 'check_circle' },
    { id: 'locked', label: 'Locked', icon: 'lock' },
  ]

  const rarityButtons: { id: FilterType; label: string; color: string }[] = [
    { id: 'common', label: 'Common', color: 'slate' },
    { id: 'rare', label: 'Rare', color: 'blue' },
    { id: 'epic', label: 'Epic', color: 'purple' },
    { id: 'legendary', label: 'Legendary', color: 'orange' },
  ]

  const categoryButtons: { id: string; label: string; icon: string }[] = [
    { id: 'all', label: 'All', icon: 'apps' },
    { id: 'time', label: 'Time', icon: 'schedule' },
    { id: 'sessions', label: 'Sessions', icon: 'event_repeat' },
    { id: 'streak', label: 'Streak', icon: 'local_fire_department' },
    { id: 'mode', label: 'Mode', icon: 'tune' },
    { id: 'special', label: 'Special', icon: 'star' },
  ]

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-100 dark:bg-slate-800/50 rounded-xl p-4">
          <div className="text-2xl font-bold text-slate-800 dark:text-white">
            {stats.unlockedAchievements}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            Unlocked
          </div>
        </div>
        <div className="bg-slate-100 dark:bg-slate-800/50 rounded-xl p-4">
          <div className="text-2xl font-bold text-slate-800 dark:text-white">
            {stats.totalAchievements}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            Total
          </div>
        </div>
        <div className="bg-slate-100 dark:bg-slate-800/50 rounded-xl p-4">
          <div className="text-2xl font-bold text-slate-800 dark:text-white">
            {Math.round(stats.completionRate)}%
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            Complete
          </div>
        </div>
        <div className="bg-slate-100 dark:bg-slate-800/50 rounded-xl p-4">
          <div className="text-2xl font-bold text-orange-500">
            {stats.legendaryUnlocked}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            Legendary
          </div>
        </div>
      </div>

      {/* Status Filters */}
      <div>
        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
          Status
        </label>
        <div className="flex flex-wrap gap-2">
          {filterButtons.map((btn) => (
            <button
              key={btn.id}
              onClick={() => setFilter(btn.id)}
              className={`
                px-4 py-2 rounded-xl font-medium text-sm transition-all flex items-center gap-2
                ${filter === btn.id
                  ? 'bg-primary text-white shadow-lg shadow-primary/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }
              `}
            >
              <span className="material-symbols-outlined text-[18px]">{btn.icon}</span>
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Rarity Filters */}
      <div>
        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
          Rarity
        </label>
        <div className="flex flex-wrap gap-2">
          {rarityButtons.map((btn) => (
            <button
              key={btn.id}
              onClick={() => setFilter(btn.id)}
              className={`
                px-4 py-2 rounded-xl font-medium text-sm transition-all
                ${filter === btn.id
                  ? `bg-${btn.color}-500 text-white shadow-lg shadow-${btn.color}-500/30`
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }
              `}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category Filters */}
      <div>
        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
          Category
        </label>
        <div className="flex flex-wrap gap-2">
          {categoryButtons.map((btn) => (
            <button
              key={btn.id}
              onClick={() => setCategoryFilter(btn.id)}
              className={`
                px-4 py-2 rounded-xl font-medium text-sm transition-all flex items-center gap-2
                ${categoryFilter === btn.id
                  ? 'bg-primary text-white shadow-lg shadow-primary/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }
              `}
            >
              <span className="material-symbols-outlined text-[18px]">{btn.icon}</span>
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Achievement Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800 dark:text-white">
            {sortedAchievements.length} Achievement{sortedAchievements.length !== 1 ? 's' : ''}
          </h3>
        </div>

        {sortedAchievements.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedAchievements.map((achievement, index) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-[48px] mb-3">
              emoji_events
            </span>
            <p className="text-slate-600 dark:text-slate-400 font-medium">
              No achievements match your filters
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
