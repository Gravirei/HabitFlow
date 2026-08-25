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

const PRIORITY_COLORS: Record<string, { accent: string; bg: string; text: string; glow: string }> = {
  orange: { accent: '#F97316', bg: 'rgba(249,115,22,0.1)', text: '#F97316', glow: 'rgba(249,115,22,0.3)' }, // High Priority
  primary: { accent: '#2DD4BF', bg: 'rgba(45,212,191,0.1)', text: '#2DD4BF', glow: 'rgba(45,212,191,0.3)' }, // Normal
  blue: { accent: '#38BDF8', bg: 'rgba(56,189,248,0.1)', text: '#38BDF8', glow: 'rgba(56,189,248,0.3)' },
}

export function TaskCard({ task, index }: TaskCardProps) {
  const p = PRIORITY_COLORS[task.priorityColor] ?? PRIORITY_COLORS.primary

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 + 0.2, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "group relative overflow-hidden rounded-2xl p-5 flex items-start gap-4 isolate transition-all duration-300",
        "bg-slate-800/40 border border-white/5 hover:bg-slate-800/60 hover:border-white/10 hover:shadow-lg hover:shadow-black/20"
      )}
      style={{
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Priority Indicator Strip */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-current to-transparent opacity-60"
        style={{ color: p.accent }}
      />

      {/* Checkbox */}
      <label className="relative flex items-center justify-center size-6 mt-0.5 cursor-pointer shrink-0">
        <input className="peer sr-only" type="checkbox" />
        <div 
          className="size-5 rounded-md flex items-center justify-center transition-all duration-200 border-2 border-slate-600 peer-checked:bg-teal-500 peer-checked:border-teal-500 hover:border-slate-500"
        >
          <span className="material-symbols-outlined text-white text-[16px] font-bold scale-0 peer-checked:scale-100 transition-transform">
            check
          </span>
        </div>
      </label>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-base font-bold text-slate-100 leading-tight group-hover:text-white transition-colors truncate">
            {task.text}
          </p>
          {task.priority && (
            <span
              className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border border-current shadow-[0_0_10px_-2px_currentColor]"
              style={{ backgroundColor: p.bg, color: p.text, borderColor: `${p.accent}40` }}
            >
              {task.priority}
            </span>
          )}
        </div>
        
        <p className="text-sm text-slate-400 line-clamp-1 group-hover:text-slate-300 transition-colors">
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