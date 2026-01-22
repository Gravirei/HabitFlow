import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const slides = [
  {
    id: 1,
    title: 'Build Consistent Habits',
    description: 'Transform your life one small, consistent action at a time. HabitFlow helps you create and track routines that stick.',
    visual: (
      <div className="relative w-full aspect-square max-w-[300px]">
        <div className="absolute inset-4 flex items-center justify-center">
          <svg className="overflow-visible w-full h-full" fill="none" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="46" stroke="#13ec5b" strokeOpacity="0.2" strokeWidth="4"></circle>
            <path d="M 50 4 A 46 46 0 1 1 10.7 25.8" stroke="#13ec5b" strokeLinecap="round" strokeWidth="4" fill="none"></path>
          </svg>
        </div>
        <div className="absolute inset-0 flex items-center justify-center text-primary">
          <span 
            className="material-symbols-outlined text-[#13ec5b]" 
            style={{ fontSize: '96px', fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 48" }}
          >
            trending_up
          </span>
        </div>
      </div>
    )
  },
  {
    id: 2,
    title: 'Set Goals & Track Progress',
    description: 'Define the habits you want to build. Our intuitive charts and stats make it easy to visualize your consistency and stay motivated on your journey.',
    visual: (
      <div className="w-full max-w-sm flex grow bg-background-light dark:bg-background-dark">
        <div className="w-full gap-1 overflow-hidden bg-background-light dark:bg-background-dark aspect-[1/1] flex">
          <div 
            className="w-full bg-center bg-no-repeat bg-contain aspect-auto rounded-none flex-1" 
            style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCgLjWVLYRmRa3d2_h-askJQUDZ-hrUTi6ebHYCDFi9gzyHumm5FvO2alK-Y6zo4YdCvsEEGQV5h91veIYXem-tqpguBbABDNiaIsrqq8EzUMSFvrlsLQ0JjZY6TP5qQ9vNTbPdjjVlqrRvMP_FdJmTSINLQTCye77eu9MrVf1twEwrs_ky8DDwoSGhydUrZfWW76tphonB7ztDgWXEf81PaD-OTDhoKkD5v7vG4BIKYkXQ3MCN1PpKIdV20ytXfpJGtVsf6p5VeZPu")' }}
          ></div>
        </div>
      </div>
    )
  },
  {
    id: 3,
    title: 'Intuitive Interface, Effortless Tracking',
    description: 'Designed to be simple and seamless. Spend less time organizing and more time building great habits.',
    visual: (
      <div className="flex w-full grow-0 bg-transparent py-3">
        <div className="mx-auto aspect-[1/1] w-full max-w-xs overflow-hidden rounded-xl bg-transparent">
          <div 
            className="h-full w-full bg-center bg-no-repeat bg-cover" 
            style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCDFzPnpFa1xYzfvqmr512Ey6L8UezmM5YNoOmipfrsnzmAxeK4yW_MiC0cWUnR7VReLrF18jL-MPE2KTR_9hRRnHFCCXls0Kglo6468t8vcEdnUV_r9R9XlXi6ATj8Dt8z0oGdUlRUrsKDnwjJBq5l_6gE0q2cRUfug2z5EXysjxkFIng0m_ttmohheHfcgvF4Nf_UAuNkkKb4Uyqe5TtVFRj0o3wBlV26rGXv2AX404FMxTzPQRw3oC1TK7MO6kXToC3TDbwM1SdH")' }}
          ></div>
        </div>
      </div>
    )
  },
  {
    id: 4,
    title: 'Customize Your Journey',
    description: 'Tailor HabitFlow to fit your life. Choose themes, create custom categories, and set flexible reminders that work for you.',
    visual: (
      <div className="flex w-full grow items-center justify-center py-3">
        <div className="relative flex h-72 w-72 items-center justify-center">
          <div className="flex h-40 w-40 items-center justify-center rounded-xl bg-primary/10 shadow-lg backdrop-blur-sm">
            <div className="flex h-32 w-32 items-center justify-center rounded-lg bg-primary/20">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: '64px' }}>tune</span>
            </div>
          </div>
          <div className="absolute -top-2 left-8 flex -rotate-12 transform flex-col items-center gap-2 rounded-lg bg-white/10 p-3 shadow-md backdrop-blur-sm">
            <div className="flex gap-2">
              <div className="h-5 w-5 rounded-full bg-primary"></div>
              <div className="h-5 w-5 rounded-full bg-[#3b82f6]"></div>
              <div className="h-5 w-5 rounded-full bg-[#ec4899]"></div>
            </div>
            <p className="text-xs font-medium text-white/80">Themes</p>
          </div>
          <div className="absolute -right-4 top-16 flex rotate-12 transform items-center gap-2 rounded-lg bg-white/10 p-3 shadow-md backdrop-blur-sm">
            <span className="material-symbols-outlined text-white/80" style={{ fontSize: '20px' }}>category</span>
            <p className="text-xs font-medium text-white/80">Categories</p>
          </div>
          <div className="absolute -bottom-4 right-4 flex -rotate-6 transform items-center gap-2 rounded-lg bg-white/10 p-3 shadow-md backdrop-blur-sm">
            <span className="material-symbols-outlined text-white/80" style={{ fontSize: '20px' }}>notifications</span>
            <p className="text-xs font-medium text-white/80">Reminders</p>
          </div>
          <div className="absolute -left-6 bottom-12 flex rotate-6 transform items-center gap-2 rounded-lg bg-white/10 p-3 shadow-md backdrop-blur-sm">
            <span className="material-symbols-outlined text-white/80" style={{ fontSize: '20px' }}>widgets</span>
            <p className="text-xs font-medium text-white/80">Widgets</p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 5,
    title: 'Stay Organized with Smart Reminders',
    description: "Personalize your experience and set smart reminders. We'll help you stay consistent and never miss a beat on your journey to building better habits.",
    visual: (
      <div className="flex flex-col items-center justify-center px-4 pt-4">
        <div className="relative flex h-64 w-64 items-center justify-center">
          <div className="absolute h-full w-full rounded-full bg-primary/10"></div>
          <div className="absolute h-48 w-48 rounded-full bg-primary/20"></div>
          <div className="absolute text-primary">
            <span className="material-symbols-outlined text-9xl !font-light" style={{ fontSize: '140px', fontVariationSettings: "'wght' 200" }}>notifications</span>
          </div>
        </div>
      </div>
    )
  }
]

export function Onboarding() {
  const navigate = useNavigate()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1)
    } else {
      navigate('/welcome')
    }
  }

  const handleBack = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    }
  }

  const handleSkip = () => {
    navigate('/welcome')
  }

  // Handle swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe && currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1)
    }
    
    if (isRightSwipe && currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    }

    setTouchStart(0)
    setTouchEnd(0)
  }

  return (
    <div className="relative flex h-screen w-full max-w-md mx-auto flex-col bg-background-light dark:bg-background-dark overflow-hidden font-display">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 pt-safe shrink-0 z-10">
        {currentSlide > 0 ? (
          <button
            onClick={handleBack}
            className="flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-2xl">arrow_back_ios_new</span>
            <span className="text-base font-bold">Back</span>
          </button>
        ) : (
          <div></div>
        )}
        <button
          onClick={handleSkip}
          className="text-slate-500 dark:text-slate-400 text-sm font-bold leading-normal touch-manipulation hover:text-primary transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Slides Container */}
      <div
        className="flex flex-1 flex-col px-4 min-h-0 overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Content Area - Centered */}
        <div className="flex flex-col justify-center items-center flex-1 min-h-0">
          {/* Visual */}
          <div className="w-full flex-shrink-0 mb-8 flex items-center justify-center">
            {slides[currentSlide].visual}
          </div>

          {/* Title */}
          <h1 className="text-slate-900 dark:text-white text-3xl font-bold leading-tight px-4 text-center mb-4 tracking-tight">
            {slides[currentSlide].title}
          </h1>

          {/* Description */}
          <p className="text-slate-600 dark:text-slate-300 text-base font-medium leading-relaxed px-6 text-center max-w-md">
            {slides[currentSlide].description}
          </p>
        </div>

        {/* Bottom Controls - Fixed at bottom */}
        <div className="flex flex-col items-center gap-6 pb-8 shrink-0">
          {/* Page Indicators */}
          <div className="flex w-full flex-row items-center justify-center gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 touch-manipulation ${
                  index === currentSlide
                    ? 'bg-primary w-8'
                    : 'bg-slate-300 dark:bg-slate-700 w-2 hover:bg-primary/50'
                }`}
              />
            ))}
          </div>

          {/* CTA Button */}
          <button
            onClick={handleNext}
            className="w-full h-14 rounded-full bg-primary text-background-dark text-lg font-bold shadow-lg shadow-primary/25 active:scale-[0.98] transition-all touch-manipulation hover:shadow-primary/40 flex items-center justify-center gap-2"
          >
            {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
            {currentSlide < slides.length - 1 && (
              <span className="material-symbols-outlined text-background-dark text-2xl">arrow_forward</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
