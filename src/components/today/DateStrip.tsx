import { useRef, useEffect } from 'react'
import { format, isToday } from 'date-fns'
import { motion } from 'framer-motion'

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
      const itemWidth = 56
      const gap = 10
      const containerWidth = scrollRef.current.clientWidth
      const scrollPos = (today - 1) * (itemWidth + gap) - containerWidth / 2 + itemWidth / 2
      scrollRef.current.scrollLeft = Math.max(0, scrollPos)
    }
  }, [])

  return (
    <div
      ref={scrollRef}
      className="flex overflow-x-auto no-scrollbar gap-2.5 py-2 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 scroll-smooth"
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
            className="relative flex min-w-[52px] sm:min-w-[60px] cursor-pointer flex-col items-center justify-center gap-0.5 rounded-2xl py-2.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            style={
              isSelected
                ? {
                    background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
                    boxShadow: '0 4px 16px rgba(34,197,94,0.35)',
                    border: '1px solid rgba(34,197,94,0.6)',
                  }
                : {
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.07)',
                  }
            }
          >
            <span
              className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider"
              style={{ color: isSelected ? 'rgba(255,255,255,0.8)' : 'rgba(148,163,184,0.8)' }}
              aria-hidden="true"
            >
              {format(date, 'EEE')}
            </span>
            <span
              className="text-base sm:text-lg font-black leading-none"
              style={{ color: isSelected ? '#ffffff' : '#f1f5f9' }}
              aria-hidden="true"
            >
              {date.getDate()}
            </span>

            {/* Today dot */}
            {isTodayDate && !isSelected && (
              <motion.div
                layoutId="today-dot"
                className="mt-0.5 size-1 rounded-full bg-emerald-500"
                aria-hidden="true"
              />
            )}

            {/* Selected indicator */}
            {isSelected && (
              <motion.div
                layoutId="date-selection"
                className="absolute inset-0 rounded-2xl"
                style={{ boxShadow: '0 0 0 2px rgba(34,197,94,0.4)' }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
