import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'

interface Task {
  id: string
  text: string
  description: string
  time: string
  folder: string
  priority: string | null
  priorityColor: string
}

interface TaskCardProps {
  task: Task
  index: number
}

const PRIORITY_COLORS: Record<string, { accent: string; bg: string; text: string; glow: string }> =
  {
    orange: {
      accent: '#F97316',
      bg: 'rgba(249,115,22,0.1)',
      text: '#F97316',
      glow: 'rgba(249,115,22,0.3)',
    }, // High Priority
    primary: {
      accent: '#2DD4BF',
      bg: 'rgba(45,212,191,0.1)',
      text: '#2DD4BF',
      glow: 'rgba(45,212,191,0.3)',
    }, // Normal
    blue: {
      accent: '#38BDF8',
      bg: 'rgba(56,189,248,0.1)',
      text: '#38BDF8',
      glow: 'rgba(56,189,248,0.3)',
    },
  }

export function TaskCard({ task, index }: TaskCardProps) {
  const p = PRIORITY_COLORS[task.priorityColor] ?? PRIORITY_COLORS.primary

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 + 0.2, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'group relative isolate flex items-start gap-4 overflow-hidden rounded-2xl p-5 transition-all duration-300',
        'border border-white/5 bg-slate-800/40 hover:border-white/10 hover:bg-slate-800/60 hover:shadow-lg hover:shadow-black/20'
      )}
      style={{
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Priority Indicator Strip */}
      <div
        className="absolute bottom-0 left-0 top-0 w-1 bg-gradient-to-b from-transparent via-current to-transparent opacity-60"
        style={{ color: p.accent }}
      />

      {/* Checkbox */}
      <label className="relative mt-0.5 flex size-6 shrink-0 cursor-pointer items-center justify-center">
        <input className="peer sr-only" type="checkbox" />
        <div className="flex size-5 items-center justify-center rounded-md border-2 border-slate-600 transition-all duration-200 hover:border-slate-500 peer-checked:border-teal-500 peer-checked:bg-teal-500">
          <span className="material-symbols-outlined scale-0 text-[16px] font-bold text-white transition-transform peer-checked:scale-100">
            check
          </span>
        </div>
      </label>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate text-base font-bold leading-tight text-slate-100 transition-colors group-hover:text-white">
            {task.text}
          </p>
          {task.priority && (
            <span
              className="shrink-0 rounded-full border border-current px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-[0_0_10px_-2px_currentColor]"
              style={{ backgroundColor: p.bg, color: p.text, borderColor: `${p.accent}40` }}
            >
              {task.priority}
            </span>
          )}
        </div>

        <p className="line-clamp-1 text-sm text-slate-400 transition-colors group-hover:text-slate-300">
          {task.description}
        </p>

        <div className="mt-3 flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <span className="material-symbols-outlined text-base text-teal-400/80">schedule</span>
            {task.time}
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <span className="material-symbols-outlined text-base text-blue-400/80">folder</span>
            {task.folder}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
