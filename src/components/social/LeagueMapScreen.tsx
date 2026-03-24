import { motion } from 'framer-motion'
import { useMemo, useEffect, useLayoutEffect, useRef } from 'react'
import { getLeagueConfig, getLeagueTierColor, LEAGUE_CONFIGS } from './constants'
import type { LeagueTier } from './types'
import { useSocialStore } from './socialStore'

interface LeagueMapScreenProps {
  onSelectTier: (tier: LeagueTier) => void
}

const LEAGUE_TIERS: LeagueTier[] = LEAGUE_CONFIGS.map((c) => c.tier)
const DISPLAY_LEAGUE_TIERS: LeagueTier[] = [...LEAGUE_TIERS].reverse()
const TIER_COUNT = LEAGUE_TIERS.length
const TIER_HEIGHT = 252
const MAP_TOP_OFFSET = 188
const MAP_HEIGHT = TIER_COUNT * TIER_HEIGHT + MAP_TOP_OFFSET + 100
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
  const markerRef = useRef<HTMLDivElement>(null)
  const markerTier: LeagueTier = 'reis'

  const currentIdx = Math.max(0, LEAGUE_TIERS.indexOf(currentLeagueTier))
  const markerDisplayIdx = Math.max(0, DISPLAY_LEAGUE_TIERS.indexOf(markerTier))
  const currentPosition = getPosition(markerDisplayIdx)
  const currentY = MAP_TOP_OFFSET + markerDisplayIdx * TIER_HEIGHT + 60

  useLayoutEffect(() => {
    if (scrollRef.current && markerRef.current) {
      const doScroll = () => {
        markerRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center',
        })
      }

      requestAnimationFrame(doScroll)
      window.setTimeout(doScroll, 100)
      window.setTimeout(doScroll, 300)
    }
  }, [])

  useEffect(() => {
    if (scrollRef.current && markerRef.current) {
      const timeoutId = window.setTimeout(() => {
        markerRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center',
        })
      }, 150)
      return () => window.clearTimeout(timeoutId)
    }
  }, [])

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
    const startIdx = TIER_COUNT - 1
    const start = getPosition(startIdx)
    const startY = MAP_TOP_OFFSET + startIdx * TIER_HEIGHT + 60
    let d = `M ${start.x},${startY}`
    for (let i = startIdx; i > 0; i--) {
      const currX = getPosition(i).x
      const nextX = getPosition(i - 1).x
      const currY = MAP_TOP_OFFSET + i * TIER_HEIGHT + 60
      const nextY = MAP_TOP_OFFSET + (i - 1) * TIER_HEIGHT + 60
      const midY = (currY + nextY) / 2
      d += ` C ${currX},${midY} ${nextX},${midY} ${nextX},${nextY}`
    }
    const topX = getPosition(0).x
    const topY = MAP_TOP_OFFSET + 60
    d += ` C ${topX},${topY - 42} ${topX},${MAP_TOP_OFFSET - 8} ${topX},86`
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

      {/* Map */}
      <div className="relative w-full max-w-sm" style={{ height: MAP_HEIGHT }}>
        {/* Cloud ceiling */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-56 overflow-hidden">
          <div className="via-slate-900/96 absolute inset-0 bg-gradient-to-b from-slate-950 to-transparent" />

          <motion.div
            className="absolute left-1/2 top-16 h-20 w-20 -translate-x-1/2 rounded-full bg-cyan-200/10 blur-2xl"
            animate={{ scale: [0.92, 1.16, 0.92], opacity: [0.18, 0.32, 0.18] }}
            transition={{ duration: 4.6, repeat: Infinity, ease: 'easeInOut' }}
          />

          <motion.div
            className="absolute left-1/2 top-24 flex -translate-x-1/2 flex-col items-center"
            animate={{ y: [0, -6, 0], opacity: [0.68, 1, 0.68] }}
            transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <motion.div
              className="h-px w-24 bg-gradient-to-r from-transparent via-cyan-100/70 to-transparent"
              animate={{ opacity: [0.22, 0.7, 0.22], scaleX: [0.9, 1.1, 0.9] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            />
            <span className="mt-3 text-[11px] font-black uppercase tracking-[0.52em] text-slate-100/85">
              Coming Soon
            </span>
            <motion.div
              className="mt-2 h-2 w-2 rounded-full bg-cyan-100/80 shadow-[0_0_18px_rgba(224,242,254,0.8)]"
              animate={{ opacity: [0.35, 1, 0.35], scale: [0.85, 1.35, 0.85] }}
              transition={{ duration: 2.1, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>

          <motion.div
            className="bg-white/28 absolute left-[-8%] top-10 h-24 w-40 rounded-full blur-xl"
            animate={{ x: [0, 16, 0], y: [0, -3, 0] }}
            transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="bg-slate-100/24 absolute left-[10%] top-8 h-28 w-52 rounded-full blur-xl"
            animate={{ x: [0, -10, 0], y: [0, 4, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="bg-white/24 absolute right-[8%] top-14 h-24 w-44 rounded-full blur-xl"
            animate={{ x: [0, -14, 0], y: [0, -4, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="bg-slate-200/22 absolute right-[-10%] top-8 h-28 w-52 rounded-full blur-xl"
            animate={{ x: [0, 12, 0], y: [0, 3, 0] }}
            transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut' }}
          />

          <div className="bg-white/28 absolute left-[2%] top-20 h-20 w-20 rounded-full blur-lg" />
          <div className="bg-white/22 absolute left-[18%] top-12 h-24 w-24 rounded-full blur-lg" />
          <div className="top-18 bg-slate-100/26 absolute left-[34%] h-24 w-24 rounded-full blur-lg" />
          <div className="bg-white/24 absolute left-[52%] top-12 h-28 w-28 rounded-full blur-lg" />
          <div className="top-18 bg-slate-100/24 absolute left-[70%] h-24 w-24 rounded-full blur-lg" />
          <div className="bg-white/22 absolute left-[82%] top-14 h-20 w-20 rounded-full blur-lg" />

          <div className="absolute inset-x-[-6%] top-24 h-20 rounded-[999px] bg-white/20 blur-xl" />
          <div className="bg-slate-100/18 absolute inset-x-[-2%] top-32 h-16 rounded-[999px] blur-xl" />
          <div className="via-slate-200/8 absolute inset-x-0 top-32 h-16 bg-gradient-to-b from-white/10 to-transparent blur-2xl" />
        </div>

        <div className="via-slate-200/6 pointer-events-none absolute inset-x-0 top-[96px] z-10 h-14 bg-gradient-to-b from-white/10 to-transparent blur-2xl" />

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
            <linearGradient id="fogFadeStroke" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#e2e8f0" stopOpacity="0" />
              <stop offset="18%" stopColor="#f8fafc" stopOpacity="0.12" />
              <stop offset="38%" stopColor="#06b6d4" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.82" />
            </linearGradient>
            <linearGradient id="cloudRoadStroke" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f8fafc" stopOpacity="0" />
              <stop offset="45%" stopColor="#e0f2fe" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#67e8f9" stopOpacity="0.92" />
            </linearGradient>
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
            stroke="url(#fogFadeStroke)"
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
            opacity="0.72"
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
        {DISPLAY_LEAGUE_TIERS.map((tier, idx) => {
          const cfg = getLeagueConfig(tier)
          const tierProgressIdx = LEAGUE_TIERS.indexOf(tier)
          const isUnlocked = tierProgressIdx <= currentIdx
          const isCurrent = tier === currentLeagueTier
          const tierColor = getLeagueTierColor(tier)
          const position = getPosition(idx)
          const labelSide = position.x >= 50 ? 'left' : 'right'
          const y = MAP_TOP_OFFSET + idx * TIER_HEIGHT + 60

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
                      boxShadow: isUnlocked ? `0 18px 34px rgba(2,6,23,0.62)` : undefined,
                    }}
                  >
                    <svg
                      viewBox="0 0 100 100"
                      className="absolute inset-0 h-full w-full"
                      aria-hidden="true"
                    >
                      <defs>
                        <linearGradient
                          id={`checkpoint-shell-${tier}`}
                          x1="0%"
                          y1="0%"
                          x2="0%"
                          y2="100%"
                        >
                          <stop
                            offset="0%"
                            stopColor={isUnlocked ? `${tierColor}` : '#64748b'}
                            stopOpacity="0.95"
                          />
                          <stop offset="100%" stopColor="#020617" stopOpacity="1" />
                        </linearGradient>
                        <linearGradient
                          id={`checkpoint-face-${tier}`}
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="100%"
                        >
                          <stop
                            offset="0%"
                            stopColor={isUnlocked ? `${tierColor}` : '#475569'}
                            stopOpacity="0.18"
                          />
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
                      <div className="bg-slate-950/58 absolute inset-[11px] flex items-center justify-center rounded-[18px] backdrop-blur-[1px]">
                        <span className="material-symbols-outlined text-xl text-slate-500">
                          lock
                        </span>
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
                          style={{ background: tierColor, filter: 'url(#checkpointGlow)' }}
                          animate={{ opacity: [0.18, 0.34, 0.18] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      </>
                    )}
                  </div>
                </div>

                <div
                  className={`absolute top-1/2 hidden min-w-[120px] max-w-[160px] -translate-y-1/2 items-center ${
                    labelSide === 'left'
                      ? 'right-[calc(100%+18px)] justify-end text-right'
                      : 'left-[calc(100%+18px)] justify-start text-left'
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
              </motion.button>
            </div>
          )
        })}

        <div
          ref={markerRef}
          className="pointer-events-none absolute z-40"
          style={{
            left: `${currentPosition.x}%`,
            top: `${currentY}px`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <motion.div
            className="absolute left-1/2 top-[-72px] flex -translate-x-1/2 items-center gap-2 sm:hidden"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="relative flex flex-col items-center">
              <motion.div
                className="bg-cyan-200/12 absolute top-1/2 h-12 w-12 -translate-y-1/2 rounded-full blur-xl"
                animate={{ opacity: [0.18, 0.42, 0.18], scale: [0.9, 1.18, 0.9] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="absolute top-1/2 h-8 w-8 -translate-y-1/2 rounded-full border border-cyan-100/25"
                animate={{ scale: [1, 1.8], opacity: [0.45, 0] }}
                transition={{ duration: 2.1, repeat: Infinity, ease: 'easeOut' }}
              />
              <div className="bg-slate-950/96 relative flex h-7 w-7 items-center justify-center rounded-full border border-cyan-200/40 shadow-[0_0_18px_rgba(34,211,238,0.16)]">
                <div className="h-2 w-2 rounded-full bg-cyan-200 shadow-[0_0_14px_rgba(165,243,252,0.95)]" />
              </div>
              <div className="mt-1 h-6 w-px bg-gradient-to-b from-cyan-200/85 to-transparent" />
            </div>
            <div className="border-cyan-200/18 bg-slate-950/88 rounded-full border px-3 py-1.5 shadow-[0_0_24px_rgba(34,211,238,0.08)] backdrop-blur-md">
              <div className="text-center text-[7px] font-black uppercase tracking-[0.3em] text-cyan-100/55">
                Current
              </div>
              <div className="mt-1 whitespace-nowrap text-[10px] font-black uppercase tracking-[0.16em] text-white">
                You Are Here
              </div>
            </div>
          </motion.div>

          <motion.div
            className="absolute right-[calc(100%+72px)] top-0 hidden -translate-y-1/2 items-center gap-4 sm:flex"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="flex flex-col items-start">
              <div className="border-cyan-200/18 bg-slate-950/84 rounded-full border px-4 py-2 shadow-[0_0_30px_rgba(34,211,238,0.08)] backdrop-blur-md">
                <div className="text-[8px] font-black uppercase tracking-[0.34em] text-cyan-100/55">
                  Current Position
                </div>
                <div className="mt-1 whitespace-nowrap text-[11px] font-black uppercase tracking-[0.18em] text-white">
                  You Are Here
                </div>
              </div>
              <div className="via-cyan-200/28 ml-4 h-px w-16 bg-gradient-to-r from-cyan-200/70 to-transparent" />
            </div>

            <div className="relative flex flex-col items-center">
              <motion.div
                className="bg-cyan-200/14 absolute top-1/2 h-14 w-14 -translate-y-1/2 rounded-full blur-xl"
                animate={{ opacity: [0.18, 0.42, 0.18], scale: [0.9, 1.18, 0.9] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="absolute top-1/2 h-9 w-9 -translate-y-1/2 rounded-full border border-cyan-100/30"
                animate={{ scale: [1, 1.8], opacity: [0.5, 0] }}
                transition={{ duration: 2.1, repeat: Infinity, ease: 'easeOut' }}
              />
              <motion.div
                className="absolute top-1/2 h-9 w-9 -translate-y-1/2 rounded-full border border-cyan-100/20"
                animate={{ scale: [1, 2.2], opacity: [0.34, 0] }}
                transition={{ duration: 2.1, repeat: Infinity, ease: 'easeOut', delay: 0.55 }}
              />
              <div className="bg-slate-950/96 relative flex h-8 w-8 items-center justify-center rounded-full border border-cyan-200/40 shadow-[0_0_24px_rgba(34,211,238,0.16)]">
                <motion.div
                  className="absolute inset-[3px] rounded-full border border-cyan-100/25"
                  animate={{ opacity: [0.2, 0.6, 0.2] }}
                  transition={{ duration: 1.7, repeat: Infinity, ease: 'easeInOut' }}
                />
                <div className="h-2.5 w-2.5 rounded-full bg-cyan-200 shadow-[0_0_16px_rgba(165,243,252,0.95)]" />
              </div>
              <div className="mt-1 h-8 w-px bg-gradient-to-b from-cyan-200/85 to-transparent" />
              <div className="h-0 w-0 border-l-[4px] border-r-[4px] border-t-[7px] border-l-transparent border-r-transparent border-t-cyan-200/85 drop-shadow-[0_0_8px_rgba(165,243,252,0.6)]" />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
