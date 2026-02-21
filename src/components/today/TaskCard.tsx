import { motion } from 'framer-motion'

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

const PRIORITY_COLORS: Record<string, { accent: string; bg: string; text: string }> = {
  orange: { accent: '#F97316', bg: 'rgba(249,115,22,0.12)', text: '#F97316' },
  primary: { accent: '#22C55E', bg: 'rgba(34,197,94,0.12)', text: '#22C55E' },
}

export function TaskCard({ task, index }: TaskCardProps) {
  const p = PRIORITY_COLORS[task.priorityColor] ?? PRIORITY_COLORS.primary

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="group relative overflow-hidden rounded-2xl p-4 flex gap-3"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Left accent strip */}
      <div className="absolute left-0 inset-y-0 w-[3px] rounded-r-full"
        style={{ backgroundColor: p.accent }} />

      {/* Checkbox */}
      <label className="relative flex items-start pt-0.5 cursor-pointer shrink-0">
        <input className="peer sr-only" type="checkbox" />
        <div className="size-5 rounded-lg flex items-center justify-center transition-all duration-200"
          style={{
            border: `2px solid rgba(255,255,255,0.15)`,
            background: 'transparent',
          }}>
          <span className="material-symbols-outlined text-white text-sm scale-0 peer-checked:scale-100 transition-transform font-bold" aria-hidden="true">check</span>
        </div>
      </label>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-bold text-white leading-tight group-hover:text-slate-300 transition-colors truncate">
            {task.text}
          </p>
          {task.priority && (
            <span
              className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
              style={{ backgroundColor: p.bg, color: p.text }}
            >
              {task.priority}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-[11px] text-slate-600 line-clamp-1">{task.description}</p>
        <div className="mt-2 flex items-center gap-3">
          <div className="flex items-center gap-1 text-[11px] font-medium text-slate-600">
            <span className="material-symbols-outlined text-[13px]" aria-hidden="true">schedule</span>
            {task.time}
          </div>
          <div className="flex items-center gap-1 text-[11px] font-medium text-slate-600">
            <span className="material-symbols-outlined text-[13px]" aria-hidden="true">folder</span>
            {task.folder}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
