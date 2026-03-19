/**
 * LeagueMapScreen — Visual roadmap of leagues
 * Shows a vertical curvy path with league checkpoints
 */

import { motion } from 'framer-motion'
import { getLeagueConfig, getLeagueTierColor } from './constants'
import type { LeagueTier } from './types'
import { useSocialStore } from './socialStore'

interface LeagueMapScreenProps {
  onSelectTier: (tier: LeagueTier) => void
}

const LEAGUE_TIERS: LeagueTier[] = ['diamond', 'platinum', 'gold', 'silver', 'bronze']

export function LeagueMapScreen({ onSelectTier }: LeagueMapScreenProps) {
  const { currentLeagueTier } = useSocialStore()

  // Find the index of the current tier to determine unlocked status
  const currentIdx = LEAGUE_TIERS.indexOf(currentLeagueTier)

  return (
    <div className="relative flex flex-col items-center py-10 min-h-[600px] overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-20 size-64 bg-primary/5 blur-[100px] rounded-full" />
        <div className="absolute bottom-1/4 -right-20 size-64 bg-emerald-500/5 blur-[100px] rounded-full" />
      </div>

      {/* Title */}
      <div className="text-center mb-12 relative z-10">
        <h2 className="text-2xl font-black text-white tracking-tight uppercase italic">
          League <span className="text-primary text-3xl">Road</span>
        </h2>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">
          Climb the ranks to reach Diamond
        </p>
      </div>

      {/* The Map Container */}
      <div className="relative w-full max-w-[320px] h-[800px] flex flex-col items-center">
        {/* SVG Path (Road) */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 200 800"
          preserveAspectRatio="none"
        >
          <motion.path
            d="M100,750 C180,650 20,550 100,450 C180,350 20,250 100,150 C180,50 20,-50 100,-150"
            fill="none"
            stroke="rgba(255,255,255,0.03)"
            strokeWidth="24"
            strokeLinecap="round"
          />
          <motion.path
            d="M100,750 C180,650 20,550 100,450 C180,350 20,250 100,150 C180,50 20,-50 100,-150"
            fill="none"
            stroke="url(#roadGradient)"
            strokeWidth="6"
            strokeDasharray="12 12"
            strokeLinecap="round"
            initial={{ strokeDashoffset: 0 }}
            animate={{ strokeDashoffset: -100 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          />
          <defs>
            <linearGradient id="roadGradient" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="50%" stopColor="#334155" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>
          </defs>
        </svg>

        {/* Checkpoints */}
        <div className="flex flex-col-reverse justify-between h-full py-10 w-full relative">
          {LEAGUE_TIERS.slice().reverse().map((tier, idx) => {
            const cfg = getLeagueConfig(tier)
            const tierIdx = LEAGUE_TIERS.indexOf(tier)
            const isUnlocked = tierIdx >= currentIdx
            const isCurrent = tier === currentLeagueTier
            const tierColor = getLeagueTierColor(tier)

            // Alternating X offsets
            const xOffset = idx % 2 === 0 ? 0 : (idx % 4 === 1 ? 60 : -60)

            return (
              <div
                key={tier}
                className="relative flex items-center justify-center w-full"
                style={{ height: '140px' }}
              >
                <div 
                  className="relative z-10"
                  style={{ transform: `translateX(${xOffset}px)` }}
                >
                  <motion.button
                    whileHover={isUnlocked ? { scale: 1.1 } : {}}
                    whileTap={isUnlocked ? { scale: 0.9 } : {}}
                    onClick={() => isUnlocked && onSelectTier(tier)}
                    className={`
                      relative size-20 rounded-[32px] flex items-center justify-center
                      border-4 transition-all duration-500
                      ${isUnlocked 
                        ? 'bg-slate-900 cursor-pointer' 
                        : 'bg-slate-950 opacity-40 grayscale cursor-not-allowed'
                      }
                    `}
                    style={{ 
                      borderColor: isUnlocked ? tierColor : '#1e293b',
                      boxShadow: isUnlocked ? `0 10px 40px ${tierColor}30` : 'none'
                    }}
                  >
                    <span 
                      className="material-symbols-outlined text-3xl"
                      style={{ 
                        color: isUnlocked ? tierColor : '#475569',
                        fontVariationSettings: isUnlocked ? "'FILL' 1" : "'FILL' 0"
                      }}
                    >
                      {cfg.icon}
                    </span>

                    {/* Locked Overlay */}
                    {!isUnlocked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-[28px]">
                        <span className="material-symbols-outlined text-xl text-slate-500">lock</span>
                      </div>
                    )}
                  </motion.button>

                  {/* Tier Label */}
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 whitespace-nowrap"
                    style={{ 
                      left: xOffset > 0 ? 'auto' : '100%',
                      right: xOffset > 0 ? '100%' : 'auto',
                      marginLeft: xOffset > 0 ? '0' : '24px',
                      marginRight: xOffset > 0 ? '24px' : '0',
                      textAlign: xOffset > 0 ? 'right' : 'left'
                    }}
                  >
                    <p className={`text-[11px] font-black uppercase tracking-[0.15em] ${isUnlocked ? 'text-white' : 'text-slate-600'}`}>
                      {cfg.label}
                    </p>
                    {isCurrent && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-1.5 mt-1"
                        style={{ justifyContent: xOffset > 0 ? 'flex-end' : 'flex-start' }}
                      >
                        <span className="size-1.5 rounded-full bg-primary animate-pulse" />
                        <span className="text-[10px] font-bold text-primary tracking-wide">ACTIVE NOW</span>
                      </motion.div>
                    )}
                  </div>

                  {/* GPS Indicator for Current Tier */}
                  {isCurrent && (
                    <div className="absolute -top-14 left-1/2 -translate-x-1/2">
                      <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        className="flex flex-col items-center"
                      >
                        <div className="bg-primary text-slate-950 size-10 rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/50 border-2 border-white/30">
                          <span className="material-symbols-outlined text-xl font-black">location_on</span>
                        </div>
                        <div className="w-1.5 h-3 bg-primary/40 rounded-full mt-1 blur-[1px]" />
                      </motion.div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Bottom Info */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-20 px-6 text-center"
      >
        <p className="text-[11px] text-slate-500 font-medium leading-relaxed max-w-[240px]">
          Tap a league to view its standings and promotion criteria.
        </p>
      </motion.div>
    </div>
  )
}
