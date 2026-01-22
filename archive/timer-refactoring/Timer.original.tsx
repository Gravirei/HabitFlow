import { useState, useEffect, useRef } from 'react'
import { BottomNav } from '@/components/BottomNav'

export function Timer() {
  const [timeLeft, setTimeLeft] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [mode, setMode] = useState<'Stopwatch' | 'Countdown' | 'Intervals'>('Stopwatch')
  const [laps, setLaps] = useState<{id: number, time: string}[]>([])
  
  // For wheel picker
  const [selectedHours, setSelectedHours] = useState(0)
  const [selectedMinutes, setSelectedMinutes] = useState(1)
  const [selectedSeconds, setSelectedSeconds] = useState(30)
  
  // For intervals
  const [workMinutes, setWorkMinutes] = useState(25)
  const [breakMinutes, setBreakMinutes] = useState(5)
  const [currentInterval, setCurrentInterval] = useState<'work' | 'break'>('work')
  const [intervalCount, setIntervalCount] = useState(0)

  useEffect(() => {
    let interval: number | undefined

    if (isActive) {
      interval = setInterval(() => {
        if (mode === 'Stopwatch') {
          setTimeLeft(prev => prev + 10) // 10ms increment
        } else if (mode === 'Countdown' && timeLeft > 0) {
          setTimeLeft(prev => prev - 10)
        } else if (mode === 'Countdown' && timeLeft <= 0) {
          setIsActive(false)
        } else if (mode === 'Intervals' && timeLeft > 0) {
          setTimeLeft(prev => prev - 10)
        } else if (mode === 'Intervals' && timeLeft <= 0) {
          // Switch between work and break
          if (currentInterval === 'work') {
            setCurrentInterval('break')
            setTimeLeft(breakMinutes * 60 * 1000)
          } else {
            setCurrentInterval('work')
            setIntervalCount(prev => prev + 1)
            setTimeLeft(workMinutes * 60 * 1000)
          }
        }
      }, 10)
    }

    return () => clearInterval(interval)
  }, [isActive, timeLeft, mode, currentInterval, workMinutes, breakMinutes])

  const toggleTimer = () => {
    if (!isActive && mode === 'Countdown' && timeLeft === 0) {
      // Initialize countdown time from wheel picker
      setTimeLeft(selectedHours * 3600 * 1000 + selectedMinutes * 60 * 1000 + selectedSeconds * 1000)
      // Start the timer
      setIsActive(true)
    } else if (!isActive && mode === 'Intervals' && timeLeft === 0) {
      // Initialize interval time
      setTimeLeft(workMinutes * 60 * 1000)
      setCurrentInterval('work')
      // Start the timer
      setIsActive(true)
    } else {
      // Just toggle for pause/resume
      setIsActive(!isActive)
    }
  }

  const resetTimer = () => {
    setIsActive(false)
    if (mode === 'Countdown') {
      setTimeLeft(0)
    } else if (mode === 'Intervals') {
      setTimeLeft(0)
      setCurrentInterval('work')
      setIntervalCount(0)
    } else {
      setTimeLeft(0)
      setLaps([])
    }
  }

  const formatTime = (ms: number) => {
    const mins = Math.floor(ms / 60000)
    const secs = Math.floor((ms % 60000) / 1000)
    const centis = Math.floor((ms % 1000) / 10)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${centis.toString().padStart(2, '0')}`
  }

  const handleModeChange = (newMode: 'Stopwatch' | 'Countdown' | 'Intervals') => {
    setMode(newMode)
    setIsActive(false)
    setLaps([])
    setTimeLeft(0)
    setCurrentInterval('work')
    setIntervalCount(0)
  }

  const addLap = () => {
    if (mode === 'Stopwatch') {
      setLaps(prev => [{ id: prev.length + 1, time: formatTime(timeLeft) }, ...prev])
    }
  }

  const setPreset = (minutes: number) => {
    if (!isActive) {
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      setSelectedHours(hours)
      setSelectedMinutes(mins)
      setSelectedSeconds(0)
    }
  }

  // Calculate progress for circle (mock logic for stopwatch/countdown)
  const totalTime = mode === 'Countdown' 
    ? (selectedHours * 3600 * 1000 + selectedMinutes * 60 * 1000 + selectedSeconds * 1000)
    : (mode === 'Intervals' 
      ? (currentInterval === 'work' ? workMinutes * 60 * 1000 : breakMinutes * 60 * 1000)
      : 60000) // 1 min rotation for stopwatch
  const progress = mode === 'Countdown' || mode === 'Intervals'
    ? ((totalTime - timeLeft) / totalTime) * 301.59 
    : ((timeLeft % 60000) / 60000) * 301.59
  
  const strokeDashoffset = 301.59 - progress

  // Wheel Picker Component
  const WheelPicker = ({
    value,
    onChange,
    max,
    label
  }: {
    value: number
    onChange: (val: number) => void
    max: number
    label: string
  }) => {
    const [isDragging, setIsDragging] = useState(false)
    const [startY, setStartY] = useState(0)
    const containerRef = useRef<HTMLDivElement>(null)

    const items = Array.from({ length: max + 1 }, (_, i) => i)
    
    // Calculate which items to display based on current value
    const getDisplayItems = () => {
      return [
        items[(value - 2 + items.length) % items.length],
        items[(value - 1 + items.length) % items.length],
        value,
        items[(value + 1) % items.length],
        items[(value + 2) % items.length],
      ]
    }

    const displayItems = getDisplayItems()

    const handleStart = (clientY: number) => {
      if (!isActive) {
        setIsDragging(true)
        setStartY(clientY)
      }
    }

    const handleMove = (clientY: number) => {
      if (isDragging && !isActive) {
        const deltaY = startY - clientY
        const itemHeight = 60 // approximate height for sensitivity
        
        if (Math.abs(deltaY) > itemHeight / 2) {
          const steps = Math.floor(Math.abs(deltaY) / (itemHeight / 2))
          if (deltaY > 0) {
            // Scrolling up = increase value
            onChange((value + steps) % (max + 1))
          } else {
            // Scrolling down = decrease value
            onChange((value - steps + (max + 1)) % (max + 1))
          }
          setStartY(clientY)
        }
      }
    }

    const handleEnd = () => {
      setIsDragging(false)
    }

    const handleWheel = (e: React.WheelEvent) => {
      if (!isActive) {
        e.preventDefault()
        if (e.deltaY > 0) {
          // Scroll down = decrease
          onChange((value - 1 + (max + 1)) % (max + 1))
        } else {
          // Scroll up = increase
          onChange((value + 1) % (max + 1))
        }
      }
    }

    return (
      <div 
        ref={containerRef}
        className={`relative flex h-full flex-1 justify-center select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} group`}
        onMouseDown={(e) => handleStart(e.clientY)}
        onMouseMove={(e) => handleMove(e.clientY)}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={(e) => handleStart(e.touches[0].clientY)}
        onTouchMove={(e) => handleMove(e.touches[0].clientY)}
        onTouchEnd={handleEnd}
        onWheel={handleWheel}
      >
        <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-3 rotate-90 origin-center text-[10px] font-bold tracking-widest text-primary/40 pointer-events-none pt-0">
          {label}
        </div>
        <div className="flex w-full flex-col items-center justify-center space-y-5 py-6 text-center pointer-events-none">
          <button
            onClick={() => !isActive && onChange((value - 2 + (max + 1)) % (max + 1))}
            className="text-2xl font-medium text-white/5 scale-75 blur-[1px] pointer-events-auto"
            disabled={isActive}
          >
            {displayItems[0].toString().padStart(2, '0')}
          </button>
          <button
            onClick={() => !isActive && onChange((value - 1 + (max + 1)) % (max + 1))}
            className="text-4xl font-medium text-white/20 scale-90 hover:text-white/40 transition-colors pointer-events-auto"
            disabled={isActive}
          >
            {displayItems[1].toString().padStart(2, '0')}
          </button>
          <div className="text-6xl font-bold text-primary scale-110 tracking-tighter text-glow drop-shadow-lg z-10">
            {displayItems[2].toString().padStart(2, '0')}
          </div>
          <button
            onClick={() => !isActive && onChange((value + 1) % (max + 1))}
            className="text-4xl font-medium text-white/20 scale-90 hover:text-white/40 transition-colors pointer-events-auto"
            disabled={isActive}
          >
            {displayItems[3].toString().padStart(2, '0')}
          </button>
          <button
            onClick={() => !isActive && onChange((value + 2) % (max + 1))}
            className="text-2xl font-medium text-white/5 scale-75 blur-[1px] pointer-events-auto"
            disabled={isActive}
          >
            {displayItems[4].toString().padStart(2, '0')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col justify-between bg-background-light font-display dark:bg-background-dark">
      <main className="flex flex-grow flex-col">
        {/* Top App Bar */}
        <div className="flex items-center p-4">
          <div className="w-12"></div>
          <h2 className="flex-1 text-center text-lg font-bold leading-tight tracking-[-0.015em] text-black dark:text-white">Timer</h2>
          <div className="flex w-12 items-center justify-end">
            <button className="flex h-12 max-w-[480px] min-w-0 cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-full bg-transparent p-0 text-base font-bold leading-normal tracking-[0.015em] text-black/80 dark:text-white/80">
              <span className="material-symbols-outlined text-black/80 dark:text-white/80">more_vert</span>
            </button>
          </div>
        </div>

        {/* Segmented Buttons */}
        <div className="flex px-4 py-3">
          <div className="flex h-12 flex-1 items-center justify-center rounded-full bg-black/10 p-1 dark:bg-black/20">
            {(['Stopwatch', 'Countdown', 'Intervals'] as const).map((m) => (
              <label key={m} className={`flex h-full grow cursor-pointer items-center justify-center overflow-hidden rounded-full px-2 text-sm font-medium leading-normal transition-all duration-300 ${
                mode === m 
                  ? 'bg-primary text-background-dark' 
                  : 'text-black/80 dark:text-white/80'
              }`}>
                <span className="truncate">{m}</span>
                <input 
                  type="radio" 
                  name="timer-type" 
                  value={m} 
                  checked={mode === m}
                  onChange={() => handleModeChange(m)}
                  className="invisible w-0" 
                />
              </label>
            ))}
          </div>
        </div>

        {/* Stopwatch Mode */}
        {mode === 'Stopwatch' && (
          <>
            {/* Timer Display & Ring */}
            <div className="flex flex-grow items-center justify-center px-4 py-8">
              <div className="relative flex h-72 w-72 items-center justify-center sm:h-80 sm:w-80">
                <svg className="absolute inset-0" viewBox="0 0 100 100">
                  <circle className="stroke-current text-black/10 dark:text-white/10" cx="50" cy="50" fill="transparent" r="48" strokeWidth="4"></circle>
                  <circle 
                    className="stroke-current text-primary transition-all duration-100 ease-linear" 
                    cx="50" cy="50" 
                    fill="transparent" 
                    r="48" 
                    strokeDasharray="301.59" 
                    strokeDashoffset={strokeDashoffset} 
                    strokeLinecap="round" 
                    strokeWidth="4" 
                    transform="rotate(-90 50 50)"
                  ></circle>
                </svg>
                <h1 className="text-5xl font-bold tracking-tighter text-black dark:text-white tabular-nums">
                  {formatTime(timeLeft)}
                </h1>
              </div>
            </div>

            {/* Lap List */}
            <div className="h-28 overflow-y-auto px-4 pb-4">
              <div className="flex flex-col space-y-3 text-black/80 dark:text-white/80">
                {laps.map((lap) => (
                  <div key={lap.id} className="flex items-center justify-between text-lg">
                    <span className="text-black/60 dark:text-white/60">Lap {lap.id}</span>
                    <span>{lap.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Button Group */}
            <div className="flex justify-stretch px-4 py-4 pb-24">
              <div className="flex flex-1 items-center justify-center gap-4">
                <button 
                  onClick={addLap}
                  disabled={!isActive}
                  className="flex h-20 w-20 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-black/5 text-base font-bold leading-normal tracking-[0.015em] text-black transition-colors hover:bg-black/10 disabled:opacity-50 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
                >
                  <span className="material-symbols-outlined text-3xl">flag</span>
                </button>
                <button 
                  onClick={toggleTimer}
                  className="flex h-24 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-primary text-lg font-bold leading-normal tracking-[0.015em] text-background-dark shadow-lg transition-transform active:scale-95"
                >
                  <span className="truncate">{isActive ? 'Pause' : 'Start'}</span>
                </button>
                <button 
                  onClick={resetTimer}
                  className="flex h-20 w-20 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-black/5 text-base font-bold leading-normal tracking-[0.015em] text-black transition-colors hover:bg-black/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
                >
                  <span className="material-symbols-outlined text-3xl">restart_alt</span>
                </button>
              </div>
            </div>
          </>
        )}

        {/* Countdown Mode */}
        {mode === 'Countdown' && (
          <>
            <div className="relative flex w-full flex-grow flex-col items-center justify-center overflow-hidden">
              {/* Background glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none"></div>
              
              {/* Timer Display & Ring (shown when active or time is set) */}
              {(isActive || timeLeft > 0) ? (
                <div className="flex flex-grow items-center justify-center px-4 py-8">
                  <div className="relative flex h-72 w-72 items-center justify-center sm:h-80 sm:w-80">
                    <svg className="absolute inset-0" viewBox="0 0 100 100">
                      <circle className="stroke-current text-black/10 dark:text-white/10" cx="50" cy="50" fill="transparent" r="48" strokeWidth="4"></circle>
                      <circle 
                        className="stroke-current text-primary transition-all duration-100 ease-linear" 
                        cx="50" cy="50" 
                        fill="transparent" 
                        r="48" 
                        strokeDasharray="301.59" 
                        strokeDashoffset={strokeDashoffset} 
                        strokeLinecap="round" 
                        strokeWidth="4" 
                        transform="rotate(-90 50 50)"
                      ></circle>
                    </svg>
                    <h1 className="text-5xl font-bold tracking-tighter text-black dark:text-white tabular-nums">
                      {formatTime(timeLeft)}
                    </h1>
                  </div>
                </div>
              ) : (
                <>
                  {/* Wheel Picker */}
                  <div className="relative w-full max-w-sm h-96 flex items-center justify-center">
                {/* Top gradient */}
                <div className="absolute inset-x-0 top-0 h-32 z-20 pointer-events-none bg-gradient-to-b from-background-dark via-background-dark/90 to-transparent"></div>
                {/* Bottom gradient */}
                <div className="absolute inset-x-0 bottom-0 h-32 z-20 pointer-events-none bg-gradient-to-t from-background-dark via-background-dark/90 to-transparent"></div>
                
                {/* Center highlight box */}
                <div className="absolute top-1/2 left-4 right-4 -translate-y-1/2 h-20 bg-white/[0.03] rounded-2xl border border-white/[0.08] backdrop-blur-md z-0 shadow-[0_4px_30px_rgba(0,0,0,0.2)]">
                  <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-primary/40 rounded-l-2xl shadow-[0_0_10px_rgba(19,236,91,0.3)]"></div>
                  <div className="absolute top-0 bottom-0 right-0 w-1.5 bg-primary/40 rounded-r-2xl shadow-[0_0_10px_rgba(19,236,91,0.3)]"></div>
                </div>
                
                {/* Pickers */}
                <div className="flex w-full justify-between items-center h-full z-10 px-8 py-4">
                  <WheelPicker value={selectedHours} onChange={setSelectedHours} max={23} label="HRS" />
                  <div className="text-white/10 text-3xl font-light pb-2 select-none">:</div>
                  <WheelPicker value={selectedMinutes} onChange={setSelectedMinutes} max={59} label="MIN" />
                  <div className="text-white/10 text-3xl font-light pb-2 select-none">:</div>
                  <WheelPicker value={selectedSeconds} onChange={setSelectedSeconds} max={59} label="SEC" />
                </div>
              </div>

              {/* Preset buttons */}
              <div className="mt-6 mb-2 w-full z-10">
                <div className="flex gap-3 overflow-x-auto px-6 pb-2 no-scrollbar mask-gradient-x">
                  <button 
                    onClick={() => setPreset(25)}
                    className="shrink-0 px-5 py-2.5 rounded-full bg-white/5 border border-white/5 text-white/70 text-sm font-medium hover:bg-white/10 hover:text-white hover:border-white/20 transition-all active:scale-95 group"
                  >
                    <span className="group-hover:text-primary transition-colors duration-300">Focus</span> 25m
                  </button>
                  <button 
                    onClick={() => setPreset(5)}
                    className="shrink-0 px-5 py-2.5 rounded-full bg-white/5 border border-white/5 text-white/70 text-sm font-medium hover:bg-white/10 hover:text-white hover:border-white/20 transition-all active:scale-95 group"
                  >
                    <span className="group-hover:text-primary transition-colors duration-300">Break</span> 5m
                  </button>
                  <button 
                    onClick={() => setPreset(20)}
                    className="shrink-0 px-5 py-2.5 rounded-full bg-white/5 border border-white/5 text-white/70 text-sm font-medium hover:bg-white/10 hover:text-white hover:border-white/20 transition-all active:scale-95 group"
                  >
                    <span className="group-hover:text-primary transition-colors duration-300">Nap</span> 20m
                  </button>
                  <button 
                    onClick={() => setPreset(10)}
                    className="shrink-0 px-5 py-2.5 rounded-full bg-white/5 border border-white/5 text-white/70 text-sm font-medium hover:bg-white/10 hover:text-white hover:border-white/20 transition-all active:scale-95 group"
                  >
                    <span className="group-hover:text-primary transition-colors duration-300">Meditation</span> 10m
                  </button>
                </div>
              </div>
                </>
              )}
            </div>

            {/* Button Group */}
            <div className="flex justify-stretch px-4 py-6 pb-24">
              <div className="flex flex-1 gap-6 items-center justify-center">
                <button className="flex h-16 w-16 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-colors active:scale-90 border border-white/5">
                  <span className="material-symbols-outlined text-2xl">history</span>
                </button>
                <button 
                  onClick={toggleTimer}
                  className="flex h-24 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-primary text-background-dark text-xl font-bold leading-normal tracking-[0.015em] shadow-[0_0_20px_rgba(19,236,91,0.3)] hover:shadow-[0_0_40px_rgba(19,236,91,0.5)] transition-all hover:scale-105 active:scale-95"
                >
                  {isActive ? 'Pause' : 'Start'}
                </button>
                <button 
                  onClick={resetTimer}
                  className="flex h-16 w-16 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-colors active:scale-90 border border-white/5"
                >
                  <span className="material-symbols-outlined text-2xl">backspace</span>
                </button>
              </div>
            </div>
          </>
        )}

        {/* Intervals Mode */}
        {mode === 'Intervals' && (
          <>
            <div className="relative flex w-full flex-grow flex-col items-center justify-center overflow-hidden">
              {/* Background glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none"></div>
              
              {/* Timer Display & Ring (shown when active or time is set) */}
              {(isActive || timeLeft > 0) ? (
                <>
                  {/* Interval Status */}
                  <div className="text-center mb-4 z-10">
                    <p className="text-white/60 text-sm mb-1">Interval {intervalCount + 1}</p>
                    <p className="text-primary text-lg font-bold">
                      {currentInterval === 'work' ? 'Work Time' : 'Break Time'}
                    </p>
                  </div>
                  
                  <div className="flex flex-grow items-center justify-center px-4 py-8">
                    <div className="relative flex h-72 w-72 items-center justify-center sm:h-80 sm:w-80">
                      <svg className="absolute inset-0" viewBox="0 0 100 100">
                        <circle className="stroke-current text-black/10 dark:text-white/10" cx="50" cy="50" fill="transparent" r="48" strokeWidth="4"></circle>
                        <circle 
                          className="stroke-current text-primary transition-all duration-100 ease-linear" 
                          cx="50" cy="50" 
                          fill="transparent" 
                          r="48" 
                          strokeDasharray="301.59" 
                          strokeDashoffset={strokeDashoffset} 
                          strokeLinecap="round" 
                          strokeWidth="4" 
                          transform="rotate(-90 50 50)"
                        ></circle>
                      </svg>
                      <h1 className="text-5xl font-bold tracking-tighter text-black dark:text-white tabular-nums">
                        {formatTime(timeLeft)}
                      </h1>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Wheel Picker */}
                  <div className="relative w-full max-w-sm h-96 flex items-center justify-center">
                {/* Top gradient */}
                <div className="absolute inset-x-0 top-0 h-32 z-20 pointer-events-none bg-gradient-to-b from-background-dark via-background-dark/90 to-transparent"></div>
                {/* Bottom gradient */}
                <div className="absolute inset-x-0 bottom-0 h-32 z-20 pointer-events-none bg-gradient-to-t from-background-dark via-background-dark/90 to-transparent"></div>
                
                {/* Center highlight box */}
                <div className="absolute top-1/2 left-4 right-4 -translate-y-1/2 h-20 bg-white/[0.03] rounded-2xl border border-white/[0.08] backdrop-blur-md z-0 shadow-[0_4px_30px_rgba(0,0,0,0.2)]">
                  <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-primary/40 rounded-l-2xl shadow-[0_0_10px_rgba(19,236,91,0.3)]"></div>
                  <div className="absolute top-0 bottom-0 right-0 w-1.5 bg-primary/40 rounded-r-2xl shadow-[0_0_10px_rgba(19,236,91,0.3)]"></div>
                </div>
                
                {/* Pickers for Work and Break */}
                <div className="flex w-full flex-col items-center justify-center h-full z-10 px-8 py-4 space-y-4">
                  <div className="text-white/60 text-xs font-bold tracking-widest">WORK</div>
                  <div className="flex items-center justify-center">
                    <button
                      onClick={() => setWorkMinutes(Math.max(1, workMinutes - 1))}
                      disabled={isActive}
                      className="text-white/40 hover:text-white/80 disabled:opacity-30"
                    >
                      <span className="material-symbols-outlined">remove</span>
                    </button>
                    <div className="text-6xl font-bold text-primary scale-110 tracking-tighter text-glow mx-4">
                      {workMinutes.toString().padStart(2, '0')}
                    </div>
                    <button
                      onClick={() => setWorkMinutes(Math.min(60, workMinutes + 1))}
                      disabled={isActive}
                      className="text-white/40 hover:text-white/80 disabled:opacity-30"
                    >
                      <span className="material-symbols-outlined">add</span>
                    </button>
                  </div>
                  <div className="text-white/40 text-2xl">-</div>
                  <div className="text-white/60 text-xs font-bold tracking-widest">BREAK</div>
                  <div className="flex items-center justify-center">
                    <button
                      onClick={() => setBreakMinutes(Math.max(1, breakMinutes - 1))}
                      disabled={isActive}
                      className="text-white/40 hover:text-white/80 disabled:opacity-30"
                    >
                      <span className="material-symbols-outlined">remove</span>
                    </button>
                    <div className="text-6xl font-bold text-primary scale-110 tracking-tighter text-glow mx-4">
                      {breakMinutes.toString().padStart(2, '0')}
                    </div>
                    <button
                      onClick={() => setBreakMinutes(Math.min(30, breakMinutes + 1))}
                      disabled={isActive}
                      className="text-white/40 hover:text-white/80 disabled:opacity-30"
                    >
                      <span className="material-symbols-outlined">add</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Preset buttons */}
              <div className="mt-6 mb-2 w-full z-10">
                <div className="flex gap-3 overflow-x-auto px-6 pb-2 no-scrollbar mask-gradient-x">
                  <button 
                    onClick={() => { setWorkMinutes(25); setBreakMinutes(5); }}
                    disabled={isActive}
                    className="shrink-0 px-5 py-2.5 rounded-full bg-white/5 border border-white/5 text-white/70 text-sm font-medium hover:bg-white/10 hover:text-white hover:border-white/20 transition-all active:scale-95 group disabled:opacity-50"
                  >
                    <span className="group-hover:text-primary transition-colors duration-300">Pomodoro</span> 25/5
                  </button>
                  <button 
                    onClick={() => { setWorkMinutes(50); setBreakMinutes(10); }}
                    disabled={isActive}
                    className="shrink-0 px-5 py-2.5 rounded-full bg-white/5 border border-white/5 text-white/70 text-sm font-medium hover:bg-white/10 hover:text-white hover:border-white/20 transition-all active:scale-95 group disabled:opacity-50"
                  >
                    <span className="group-hover:text-primary transition-colors duration-300">Study</span> 50/10
                  </button>
                  <button 
                    onClick={() => { setWorkMinutes(45); setBreakMinutes(15); }}
                    disabled={isActive}
                    className="shrink-0 px-5 py-2.5 rounded-full bg-white/5 border border-white/5 text-white/70 text-sm font-medium hover:bg-white/10 hover:text-white hover:border-white/20 transition-all active:scale-95 group disabled:opacity-50"
                  >
                    <span className="group-hover:text-primary transition-colors duration-300">Work</span> 45/15
                  </button>
                </div>
              </div>
                </>
              )}
            </div>

            {/* Button Group */}
            <div className="flex justify-stretch px-4 py-6 pb-24">
              <div className="flex flex-1 gap-6 items-center justify-center">
                <button className="flex h-16 w-16 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-colors active:scale-90 border border-white/5">
                  <span className="material-symbols-outlined text-2xl">history</span>
                </button>
                <button 
                  onClick={toggleTimer}
                  className="flex h-24 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-primary text-background-dark text-xl font-bold leading-normal tracking-[0.015em] shadow-[0_0_20px_rgba(19,236,91,0.3)] hover:shadow-[0_0_40px_rgba(19,236,91,0.5)] transition-all hover:scale-105 active:scale-95"
                >
                  {isActive ? 'Pause' : 'Start'}
                </button>
                <button 
                  onClick={resetTimer}
                  className="flex h-16 w-16 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-colors active:scale-90 border border-white/5"
                >
                  <span className="material-symbols-outlined text-2xl">backspace</span>
                </button>
              </div>
            </div>
          </>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
