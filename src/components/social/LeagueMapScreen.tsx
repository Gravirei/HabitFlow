import { motion } from 'framer-motion'
import { useMemo, useEffect, useRef } from 'react'
import { getLeagueConfig, getLeagueTierColor, LEAGUE_CONFIGS } from './constants'
import type { LeagueTier } from './types'
import { useSocialStore } from './socialStore'

interface LeagueMapScreenProps {
  onSelectTier: (tier: LeagueTier) => void
}

const LEAGUE_TIERS: LeagueTier[] = LEAGUE_CONFIGS.map((c) => c.tier)
const TIER_COUNT = LEAGUE_TIERS.length
const TIER_HEIGHT = 252
const MAP_HEIGHT = TIER_COUNT * TIER_HEIGHT + 100
const MAP_WIDTH = 100

const POSITIONS = [
  { x: 50 },
  { x: 35 },
  { x: 65 },
  { x: 30 },
  { x: 70 },
  { x: 40 },
  { x: 60 },
  { x: 50 },
  { x: 50 },
  { x: 50 },
  { x: 50 },
  { x: 50 },
]

function getPosition(index: number) {
  return POSITIONS[index % POSITIONS.length] ?? POSITIONS[0]
}

export function LeagueMapScreen({ onSelectTier }: LeagueMapScreenProps) {
  const { currentLeagueTier } = useSocialStore()
  const scrollRef = useRef<HTMLDivElement>(null)

  const currentIdx = Math.max(0, LEAGUE_TIERS.indexOf(currentLeagueTier))

  useEffect(() => {
    if (scrollRef.current) {
      const scrollTarget = currentIdx * TIER_HEIGHT - scrollRef.current.clientHeight / 2 + 200
      scrollRef.current.scrollTop = Math.max(0, scrollTarget)
    }
  }, [currentLeagueTier, currentIdx])

  const particles = useMemo(() => {
    return Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 12 + 8,
      delay: Math.random() * -12,
      color: i % 3 === 0 ? '#7c3aed' : i % 3 === 1 ? '#06b6d4' : '#f43f5e',
    }))
  }, [])

  const getRoadPath = () => {
    const start = getPosition(0)
    let d = `M ${start.x},40`
    for (let i = 0; i < TIER_COUNT - 1; i++) {
      const currX = getPosition(i).x
      const nextX = getPosition(i + 1).x
      const currY = i * TIER_HEIGHT + 60
      const nextY = (i + 1) * TIER_HEIGHT + 60
      const midY = (currY + nextY) / 2
      d += ` C ${currX},${midY} ${nextX},${midY} ${nextX},${nextY}`
    }
    return d
  }

  const ROAD_PATH = getRoadPath()

  return (
    <div
      ref={scrollRef}
      className="relative flex min-h-[calc(100vh-12rem)] w-full flex-col items-center overflow-y-auto overflow-x-hidden bg-gray-950"
    >
      {/* Floating particles */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full opacity-0"
            style={{
              left: `${p.left}%`,
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
              top: '100%',
            }}
            animate={{
              y: [0, -1200],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              ease: 'linear',
              delay: p.delay,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="sticky top-0 z-30 mb-4 w-full bg-gray-950/90 px-4 pb-4 pt-6 text-center backdrop-blur-sm">
        <h2 className="text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">
          Spell <span className="text-[#7C3AED]">Mastery</span>
        </h2>
        <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 sm:mt-2 sm:text-xs">
          Climb the ranks from Reis to Ria Uruku
        </p>
      </div>

      {/* Map */}
      <div className="relative w-full max-w-sm" style={{ height: MAP_HEIGHT }}>
        {/* Road */}
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="roadAura" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#312e81" />
              <stop offset="50%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#111827" />
            </linearGradient>
            <linearGradient id="roadCore" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#7C3AED" />
              <stop offset="35%" stopColor="#8b5cf6" />
              <stop offset="70%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#f43f5e" />
            </linearGradient>
            <linearGradient id="roadCenterLine" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#c4b5fd" />
              <stop offset="55%" stopColor="#67e8f9" />
              <stop offset="100%" stopColor="#fda4af" />
            </linearGradient>
            <filter id="roadGlow" x="-30%" y="-5%" width="160%" height="110%">
              <feGaussianBlur stdDeviation="2.2" result="blur" />
              <feColorMatrix
                in="blur"
                type="matrix"
                values="1 0 0 0 0
                        0 1 0 0 0
                        0 0 1 0 0
                        0 0 0 0.8 0"
              />
            </filter>
            <filter id="checkpointGlow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="3" />
            </filter>
          </defs>

          <path
            d={ROAD_PATH}
            fill="none"
            stroke="#050816"
            strokeWidth="26"
            strokeLinecap="round"
            opacity="0.95"
          />

          <path
            d={ROAD_PATH}
            fill="none"
            stroke="url(#roadAura)"
            strokeWidth="18"
            strokeLinecap="round"
            opacity="0.95"
          />

          <path
            d={ROAD_PATH}
            fill="none"
            stroke="url(#roadCore)"
            strokeWidth="10"
            strokeLinecap="round"
            opacity="0.7"
            filter="url(#roadGlow)"
          />

          <motion.path
            d={ROAD_PATH}
            fill="none"
            stroke="url(#roadCenterLine)"
            strokeWidth="2"
            strokeDasharray="3 10"
            strokeLinecap="round"
            opacity="0.95"
            animate={{ strokeDashoffset: [0, -52] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'linear' }}
          />

          {currentIdx > 0 && (
            <>
              <path
                d={ROAD_PATH}
                fill="none"
                stroke="url(#roadCore)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${currentIdx * 330} 2400`}
                opacity="0.32"
                filter="url(#roadGlow)"
              />
              <path
                d={ROAD_PATH}
                fill="none"
                stroke="#f8fafc"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray={`${currentIdx * 330} 2400`}
                opacity="0.22"
              />
            </>
          )}
        </svg>

        {/* Tiers */}
        {LEAGUE_TIERS.map((tier, idx) => {
          const cfg = getLeagueConfig(tier)
          const isUnlocked = idx <= currentIdx
          const isCurrent = tier === currentLeagueTier
          const tierColor = getLeagueTierColor(tier)
          const position = getPosition(idx)
          const labelSide = position.x >= 50 ? 'left' : 'right'
          const y = idx * TIER_HEIGHT + 60

          return (
            <div
              key={tier}
              className="absolute"
              style={{
                left: `${position.x}%`,
                top: `${y}px`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <motion.button
                whileHover={isUnlocked ? { scale: 1.05, y: -2 } : {}}
                whileTap={isUnlocked ? { scale: 0.97 } : {}}
                onClick={() => isUnlocked && onSelectTier(tier)}
                className={`relative flex flex-col items-center ${
                  isUnlocked ? 'cursor-pointer' : 'cursor-not-allowed'
                }`}
              >
                <div
                  className="pointer-events-none absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70 blur-2xl"
                  style={{
                    background: isUnlocked ? `${tierColor}20` : 'rgba(51, 65, 85, 0.18)',
                  }}
                />

                {/* Checkpoint */}
                <div className="relative flex flex-col items-center">
                  <div
                    className={`relative flex h-[84px] w-[68px] items-center justify-center transition-all duration-300 sm:h-[92px] sm:w-[74px] ${
                      isUnlocked ? '' : 'grayscale'
                    }`}
                    style={{
                      boxShadow: isUnlocked
                        ? `0 18px 34px rgba(2,6,23,0.62)`
                        : undefined,
                    }}
                  >
                    <svg
                      viewBox="0 0 100 100"
                      className="absolute inset-0 h-full w-full"
                      aria-hidden="true"
                    >
                      <defs>
                        <linearGradient id={`checkpoint-shell-${tier}`} x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor={isUnlocked ? `${tierColor}` : '#64748b'} stopOpacity="0.95" />
                          <stop offset="100%" stopColor="#020617" stopOpacity="1" />
                        </linearGradient>
                        <linearGradient id={`checkpoint-face-${tier}`} x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor={isUnlocked ? `${tierColor}` : '#475569'} stopOpacity="0.18" />
                          <stop offset="100%" stopColor="#0f172a" stopOpacity="0.96" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M50 4 L82 18 L90 52 L74 92 L26 92 L10 52 L18 18 Z"
                        fill="url(#checkpoint-shell-${tier})"
                        opacity={isUnlocked ? 1 : 0.65}
                      />
                      <path
                        d="M50 14 L72 24 L79 51 L67 82 L33 82 L21 51 L28 24 Z"
                        fill="url(#checkpoint-face-${tier})"
                        stroke={isUnlocked ? `${tierColor}` : '#475569'}
                        strokeOpacity={isUnlocked ? 0.42 : 0.34}
                        strokeWidth="2.5"
                      />
                      <path
                        d="M50 26 L62 33 L66 50 L59 68 L41 68 L34 50 L38 33 Z"
                        fill={isUnlocked ? `${tierColor}15` : '#0f172a'}
                        stroke={isUnlocked ? `${tierColor}` : '#475569'}
                        strokeOpacity={isUnlocked ? 0.28 : 0.24}
                        strokeWidth="1.5"
                      />
                      <path
                        d="M50 14 L72 24"
                        stroke={isUnlocked ? '#ffffff' : '#94a3b8'}
                        strokeOpacity={0.18}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>

                    <div className="relative z-10 flex items-center justify-center">
                      <span
                        className="material-symbols-outlined text-[30px] sm:text-[34px]"
                        style={{
                          color: isUnlocked ? tierColor : '#475569',
                          fontVariationSettings: isUnlocked ? "'FILL' 1" : "'FILL' 0",
                          filter: isUnlocked ? `drop-shadow(0 0 12px ${tierColor}55)` : 'none',
                        }}
                      >
                        {cfg.icon}
                      </span>
                    </div>

                    {!isUnlocked && (
                      <div className="absolute inset-[11px] flex items-center justify-center rounded-[18px] bg-slate-950/58 backdrop-blur-[1px]">
                        <span className="material-symbols-outlined text-xl text-slate-500">lock</span>
                      </div>
                    )}

                    {isCurrent && (
                      <>
                        <motion.div
                          className="absolute inset-[-8px] rounded-[28px] border"
                          style={{ borderColor: `${tierColor}88` }}
                          animate={{ scale: [1, 1.08], opacity: [0.7, 0.12, 0.7] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                        <motion.div
                          className="absolute inset-[-12px] rounded-[30px]"
                          style={{ background: tierColor }}
                          filter="url(#checkpointGlow)"
                          animate={{ opacity: [0.18, 0.34, 0.18] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      </>
                    )}
                  </div>

                </div>

                <div
                  className={`absolute top-1/2 hidden min-w-[120px] max-w-[160px] -translate-y-1/2 items-center ${
                    labelSide === 'left' ? 'right-[calc(100%+18px)] justify-end text-right' : 'left-[calc(100%+18px)] justify-start text-left'
                  } sm:flex`}
                >
                  <div
                    className={`inline-flex min-w-[132px] items-center justify-center rounded-full border px-4 py-2 text-center ${
                      isUnlocked
                        ? 'bg-slate-950/75 text-white'
                        : 'border-slate-800/70 bg-slate-900/75 text-slate-500'
                    }`}
                    style={{
                      borderColor: isUnlocked ? `${tierColor}35` : undefined,
                      boxShadow: isUnlocked ? `inset 0 0 0 1px ${tierColor}12` : undefined,
                    }}
                  >
                    <span className="block w-full text-center text-[10px] font-black uppercase tracking-[0.16em]">
                      {cfg.label.replace(' League', '')}
                    </span>
                  </div>
                </div>

                <div
                  className={`mt-3 inline-flex min-w-[132px] items-center justify-center rounded-full border px-4 py-2 text-center sm:hidden ${
                    isUnlocked
                      ? 'bg-slate-950/75 text-white'
                      : 'border-slate-800/70 bg-slate-900/75 text-slate-500'
                  }`}
                  style={{
                    borderColor: isUnlocked ? `${tierColor}35` : undefined,
                    boxShadow: isUnlocked ? `inset 0 0 0 1px ${tierColor}12` : undefined,
                  }}
                >
                  <span className="block w-full text-center text-[10px] font-black uppercase tracking-[0.16em]">
                    {cfg.label.replace(' League', '')}
                  </span>
                </div>

                {/* You indicator */}
                {isCurrent && (
                  <motion.div
                    className="absolute -top-12"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-slate-950 text-white shadow-[0_0_18px_rgba(124,58,237,0.35)]">
                      <span className="material-symbols-outlined text-base">person</span>
                    </div>
                  </motion.div>
                )}
              </motion.button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
