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
      const todayIndex = days.findIndex((date) => isToday(date))
      if (todayIndex !== -1) {
        const itemWidth = 52
        const gap = 8
        const containerWidth = scrollRef.current.clientWidth
        const scrollPos = todayIndex * (itemWidth + gap) - containerWidth / 2 + itemWidth / 2
        scrollRef.current.scrollLeft = Math.max(0, scrollPos)
      }
    }
  }, [days])

  return (
    <div
      ref={scrollRef}
      className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto scroll-smooth px-4 py-2 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
    >
      {days.map((date) => {
        const isSelected =
          date.getDate() === selectedDate.getDate() && date.getMonth() === selectedDate.getMonth()
        const isTodayDate = isToday(date)

        return (
          <button
            key={date.toISOString()}
            onClick={() => onDateClick(date)}
            aria-label={format(date, 'EEEE, MMMM d, yyyy')}
            aria-current={isTodayDate ? 'date' : undefined}
            aria-pressed={isSelected}
            className={cn(
              'group relative flex h-[60px] min-w-[48px] cursor-pointer flex-col items-center justify-center rounded-xl transition-all duration-300',
              isSelected
                ? 'shadow-[0_8px_20px_-4px_rgba(20,184,166,0.3)]'
                : 'hover:-translate-y-0.5'
            )}
          >
            {/* Glass Background Layer */}
            <div
              className={cn(
                'absolute inset-0 rounded-xl border transition-all duration-300',
                isSelected
                  ? 'border-teal-400/50 bg-gradient-to-br from-teal-500 to-teal-400'
                  : 'border-white/5 bg-slate-800/40 group-hover:border-white/10 group-hover:bg-slate-700/50'
              )}
            />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center gap-0.5">
              <span
                className={cn(
                  'text-[9px] font-bold uppercase tracking-wider transition-colors duration-200',
                  isSelected ? 'text-teal-50' : 'text-slate-400 group-hover:text-slate-300'
                )}
              >
                {format(date, 'EEE')}
              </span>

              <div
                className={cn(
                  'w-5 border-b',
                  isSelected ? 'border-teal-300/50' : 'border-slate-600/50'
                )}
              />

              <span
                className={cn(
                  'text-base font-bold leading-none transition-colors duration-200',
                  isSelected ? 'text-white' : 'text-slate-200 group-hover:text-white'
                )}
              >
                {date.getDate()}
              </span>
            </div>

            {/* Today dot */}
            {isTodayDate && !isSelected && (
              <div className="absolute bottom-1.5 z-10">
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
                className="absolute -inset-0.5 -z-10 rounded-xl bg-teal-500/20 blur-sm"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
