import { useRef, useEffect } from 'react'
import { format, isToday } from 'date-fns'
import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'

interface DateStripProps {
  days: Date[]
  selectedDate: Date
  onDateClick: (date: Date) => void
}

export function DateStrip({ days, selectedDate, onDateClick }: DateStripProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      const today = new Date().getDate()
      const itemWidth = 60 // Slightly wider for elegance
      const gap = 12
      const containerWidth = scrollRef.current.clientWidth
      const scrollPos = (today - 1) * (itemWidth + gap) - containerWidth / 2 + itemWidth / 2
      scrollRef.current.scrollLeft = Math.max(0, scrollPos)
    }
  }, [])

  return (
    <div
      ref={scrollRef}
      className="flex overflow-x-auto no-scrollbar gap-3 py-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 scroll-smooth"
    >
      {days.map((date) => {
        const isSelected =
          date.getDate() === selectedDate.getDate() &&
          date.getMonth() === selectedDate.getMonth()
        const isTodayDate = isToday(date)

        return (
          <button
            key={date.toISOString()}
            onClick={() => onDateClick(date)}
            aria-label={format(date, 'EEEE, MMMM d, yyyy')}
            aria-current={isTodayDate ? 'date' : undefined}
            aria-pressed={isSelected}
            className={cn(
              "relative flex min-w-[56px] h-[72px] cursor-pointer flex-col items-center justify-center rounded-2xl transition-all duration-300 group",
              isSelected 
                ? "shadow-[0_8px_20px_-4px_rgba(20,184,166,0.3)]" 
                : "hover:-translate-y-0.5"
            )}
          >
            {/* Glass Background Layer */}
            <div 
              className={cn(
                "absolute inset-0 rounded-2xl border transition-all duration-300",
                isSelected
                  ? "bg-gradient-to-br from-teal-500 to-teal-400 border-teal-400/50"
                  : "bg-slate-800/40 border-white/5 group-hover:bg-slate-700/50 group-hover:border-white/10"
              )}
            />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center gap-1">
              <span
                className={cn(
                  "text-[10px] font-bold uppercase tracking-wider transition-colors duration-200",
                  isSelected ? "text-teal-50" : "text-slate-400 group-hover:text-slate-300"
                )}
              >
                {format(date, 'EEE')}
              </span>
              <span
                className={cn(
                  "text-lg font-bold leading-none transition-colors duration-200",
                  isSelected ? "text-white" : "text-slate-200 group-hover:text-white"
                )}
              >
                {date.getDate()}
              </span>
            </div>

            {/* Today dot */}
            {isTodayDate && !isSelected && (
              <div className="absolute bottom-2 z-10">
                <motion.div
                  layoutId="today-dot"
                  className="size-1 rounded-full bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.6)]"
                />
              </div>
            )}
            
            {/* Selected Indicator Glow */}
            {isSelected && (
              <motion.div
                layoutId="date-glow"
                className="absolute -inset-0.5 rounded-2xl bg-teal-500/20 blur-sm -z-10"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
