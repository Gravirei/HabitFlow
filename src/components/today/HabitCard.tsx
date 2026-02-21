import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'

// ─── Color map ────────────────────────────────────────────────────────────────
const ICON_COLORS: Record<string, { accent: string; glow: string; bg: string }> = {
  directions_run:  { accent: '#2DD4BF', glow: 'rgba(45,212,191,0.3)',   bg: 'rgba(45,212,191,0.1)'   }, // Teal 400
  auto_stories:    { accent: '#38BDF8', glow: 'rgba(56,189,248,0.3)',  bg: 'rgba(56,189,248,0.1)'  }, // Sky 400
  menu_book:       { accent: '#38BDF8', glow: 'rgba(56,189,248,0.3)',  bg: 'rgba(56,189,248,0.1)'  },
  self_improvement:{ accent: '#A78BFA', glow: 'rgba(167,139,250,0.3)',  bg: 'rgba(167,139,250,0.1)'  }, // Violet 400
  water_drop:      { accent: '#22D3EE', glow: 'rgba(34,211,238,0.3)',   bg: 'rgba(34,211,238,0.1)'   }, // Cyan 400
  fitness_center:  { accent: '#FB923C', glow: 'rgba(251,146,60,0.3)',  bg: 'rgba(251,146,60,0.1)'  }, // Orange 400
  bedtime:         { accent: '#818CF8', glow: 'rgba(129,140,248,0.3)',  bg: 'rgba(129,140,248,0.1)'  }, // Indigo 400
  edit_note:       { accent: '#F472B6', glow: 'rgba(244,114,182,0.3)',  bg: 'rgba(244,114,182,0.1)'  }, // Pink 400
  directions_walk: { accent: '#34D399', glow: 'rgba(52,211,153,0.3)',  bg: 'rgba(52,211,153,0.1)'  }, // Emerald 400
  default:         { accent: '#94A3B8', glow: 'rgba(148,163,184,0.3)', bg: 'rgba(148,163,184,0.1)' },
}

const getColors = (icon: string) => ICON_COLORS[icon] ?? ICON_COLORS.default

// ─── Regular Habit Card ───────────────────────────────────────────────────────
interface HabitCardProps {
  habit: any
  isCompleted: boolean
  index: number
  onToggle: () => void
}

export function HabitCard({ habit, isCompleted, index, onToggle }: HabitCardProps) {
  const c = getColors(habit.icon)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "group relative overflow-hidden rounded-2xl p-4 flex items-center gap-4 cursor-pointer transition-all duration-300 isolate",
        isCompleted 
          ? "bg-slate-900/40 border-teal-500/20" 
          : "bg-slate-800/40 border-white/5 hover:bg-slate-800/60 hover:border-white/10 hover:shadow-lg hover:shadow-black/20"
      )}
      style={{
        backdropFilter: 'blur(12px)',
        borderWidth: '1px',
      }}
      onClick={onToggle}
      role="checkbox"
      aria-checked={isCompleted}
      aria-label={`${isCompleted ? 'Unmark' : 'Mark'} ${habit.name} as complete`}
    >
      {/* Background Gradient on Complete */}
      <div 
        className={cn(
          "absolute inset-0 transition-opacity duration-500 -z-10",
          isCompleted ? "opacity-100" : "opacity-0"
        )}
        style={{ 
          background: `linear-gradient(135deg, ${c.bg} 0%, transparent 100%)` 
        }} 
      />

      {/* Icon */}
      <div
        className={cn(
          "relative flex size-12 shrink-0 items-center justify-center rounded-xl transition-all duration-300",
          isCompleted ? "scale-95 opacity-80" : "group-hover:scale-110 shadow-inner shadow-white/10"
        )}
        style={{ 
          backgroundColor: isCompleted ? 'rgba(0,0,0,0.2)' : c.bg,
          boxShadow: isCompleted ? 'none' : `0 0 20px ${c.glow}`
        }}
      >
        <span className="material-symbols-outlined text-2xl" style={{ color: c.accent }}>
          {habit.icon}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <p className={cn(
          "text-base font-bold leading-tight truncate transition-all duration-300",
          isCompleted ? "text-slate-500 line-through decoration-slate-600 decoration-2" : "text-white group-hover:text-teal-50"
        )}>
          {habit.name}
        </p>
        <div className="flex items-center gap-2">
          <span 
            className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-950/30 border border-white/5 text-slate-400"
          >
            {habit.category || 'General'}
          </span>
          {habit.goal && (
            <span className="text-xs text-slate-500 tabular-nums font-medium">
              {habit.goal} {habit.goalPeriod}
            </span>
          )}
        </div>
      </div>

      {/* Checkbox */}
      <div
        className={cn(
          "relative flex size-8 shrink-0 items-center justify-center rounded-full transition-all duration-300 border-2",
          isCompleted 
            ? "border-teal-500 bg-teal-500 shadow-[0_0_15px_rgba(20,184,166,0.4)]" 
            : "border-slate-600 bg-slate-950/20 group-hover:border-slate-500"
        )}
      >
        <motion.span 
          className="material-symbols-outlined text-lg text-white font-bold"
          initial={false}
          animate={{ scale: isCompleted ? 1 : 0, opacity: isCompleted ? 1 : 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          check
        </motion.span>
      </div>
    </motion.div>
  )
}

// ─── Hydration Card ───────────────────────────────────────────────────────────
interface HydrationCardProps {
  habit: any
  isCompleted: boolean
  waterCount: number
  index: number
  onAddWater: () => void
}

export function HydrationCard({ habit, isCompleted, waterCount, index, onAddWater }: HydrationCardProps) {
  const maxCups = habit.goal || 8
  const pct = (waterCount / maxCups) * 100

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "group relative overflow-hidden rounded-2xl p-5 flex flex-col gap-4 isolate",
        "bg-cyan-950/20 border border-cyan-500/20 backdrop-blur-xl shadow-lg shadow-cyan-900/10"
      )}
    >
      {/* Background Liquid Effect (Simplified) */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-transparent to-cyan-500/10 -z-10"
        style={{ transform: `scaleY(${pct/100})`, transformOrigin: 'bottom', transition: 'transform 0.5s ease-out' }}
      />

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-400/20 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
            <span className="material-symbols-outlined text-2xl text-cyan-400">water_drop</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white leading-tight">{habit.name}</h3>
            <p className="text-sm font-medium text-cyan-200/60 tabular-nums">
              {waterCount} / {maxCups} cups
            </p>
          </div>
        </div>

        <button
          onClick={onAddWater}
          disabled={isCompleted}
          className={cn(
            "flex size-10 cursor-pointer items-center justify-center rounded-full transition-all duration-200 active:scale-90 disabled:cursor-not-allowed disabled:opacity-50",
            isCompleted 
              ? "bg-cyan-500 text-white shadow-[0_0_15px_rgba(34,211,238,0.4)]" 
              : "bg-cyan-500/20 border border-cyan-400/50 text-cyan-400 hover:bg-cyan-500 hover:text-white hover:shadow-[0_0_15px_rgba(34,211,238,0.3)]"
          )}
        >
          <span className="material-symbols-outlined text-xl">
            {isCompleted ? 'check' : 'add'}
          </span>
        </button>
      </div>

      {/* Cups Indicators */}
      <div className="flex items-center justify-between gap-1">
        {Array.from({ length: maxCups }).map((_, i) => (
          <motion.div
            key={i}
            className={cn(
              "h-8 flex-1 rounded-full relative overflow-hidden bg-cyan-950/40 border border-cyan-500/10"
            )}
            initial={false}
            animate={{ 
              backgroundColor: i < waterCount ? 'rgba(34,211,238,0.2)' : 'rgba(8,51,68,0.4)',
              borderColor: i < waterCount ? 'rgba(34,211,238,0.4)' : 'rgba(34,211,238,0.1)'
            }}
          >
             <motion.div 
               className="absolute bottom-0 left-0 right-0 bg-cyan-400"
               initial={{ height: '0%' }}
               animate={{ height: i < waterCount ? '100%' : '0%' }}
               transition={{ type: 'spring', stiffness: 100, damping: 20 }}
             />
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}