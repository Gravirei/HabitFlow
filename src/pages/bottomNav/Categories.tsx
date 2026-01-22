import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BottomNav } from '@/components/BottomNav'
import { SideNav } from '@/components/SideNav'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'

// Define types for the category data
interface Category {
  id: string
  name: string
  count: string
  progress?: number
  icon: string
  color: string
  gradient?: string
  textColor?: string
  height?: string
  type?: 'progress' | 'simple' | 'icon-bg' | 'list' | 'progress-card' | 'simple-card' | 'image-card' | 'avatars'
  items?: string[]
}

// Mock data for the new design
const pinnedCategories: Category[] = [
  {
    id: '1',
    name: 'Morning Routine',
    count: '5 Habits • 2 Tasks',
    progress: 85,
    icon: 'wb_sunny',
    color: 'primary',
    gradient: 'from-gray-900 to-black dark:from-surface-card dark:to-surface-dark',
    textColor: 'text-white'
  },
  {
    id: '2',
    name: 'Work Projects',
    count: '3 Habits • 8 Tasks',
    progress: 40,
    icon: 'work',
    color: 'blue',
    gradient: 'from-gray-100 to-white dark:from-surface-card dark:to-surface-dark',
    textColor: 'text-black dark:text-white'
  }
]

const allCollections: Category[] = [
  {
    id: '3',
    name: 'Fitness',
    count: '5 Habits active',
    progress: 75,
    icon: 'directions_run',
    color: 'emerald',
    height: 'h-auto',
    type: 'progress'
  },
  {
    id: '4',
    name: 'Zen',
    count: '2 Habits',
    icon: 'self_improvement',
    color: 'purple',
    height: 'h-36',
    type: 'simple'
  },
  {
    id: '5',
    name: 'Finance',
    count: 'Budget Goals',
    icon: 'attach_money',
    color: 'yellow',
    height: 'h-40',
    type: 'icon-bg'
  },
  {
    id: '6',
    name: 'Read List',
    count: '4 Books queued',
    icon: 'menu_book',
    color: 'orange',
    height: 'h-56',
    type: 'list',
    items: ['bg-gray-300', 'bg-gray-400', 'bg-gray-500']
  },
  {
    id: '7',
    name: 'Learning',
    count: 'Course Progress',
    progress: 50,
    icon: 'school',
    color: 'indigo',
    height: 'h-auto',
    type: 'progress-card'
  },
  {
    id: '8',
    name: 'Home',
    count: 'Maintenance & Chores',
    icon: 'home',
    color: 'pink',
    height: 'h-auto',
    type: 'simple-card'
  },
  {
    id: '9',
    name: 'Health',
    count: 'Diet & Meds',
    icon: 'favorite',
    color: 'red',
    height: 'h-auto',
    type: 'simple-card'
  },
  {
    id: '10',
    name: 'Social',
    count: 'Events & Meetups',
    icon: 'groups',
    color: 'teal',
    height: 'h-36',
    type: 'avatars'
  },
  {
    id: '11',
    name: 'Work',
    count: 'Projects & Deadlines',
    icon: 'business_center',
    color: 'slate',
    height: 'h-auto',
    type: 'simple-card'
  },
  {
    id: '12',
    name: 'Outdoor',
    count: 'Running & Hiking',
    icon: 'hiking',
    color: 'sky',
    height: 'h-40',
    type: 'image-card',
    gradient: 'from-sky-400 to-blue-600'
  }
]

export function Categories() {
  const navigate = useNavigate()
  const [isSideNavOpen, setIsSideNavOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')

  const filters = ['All', 'Habits', 'Tasks', 'Favorites']

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white">
      {/* Header - Consistent with Habits Page */}
      <header className="shrink-0 flex flex-col gap-4 p-4 pb-2 bg-background-light dark:bg-background-dark z-20 sticky top-0">
        <div className="flex h-12 items-center justify-between">
          <div className="flex size-12 shrink-0 items-center">
            <button 
              onClick={() => setIsSideNavOpen(true)}
              className="flex size-10 items-center justify-center rounded-full text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-surface-dark transition-colors"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
          </div>
          
          {/* Title or Search Input */}
          <div className="flex-1 overflow-hidden px-2">
            <AnimatePresence mode="wait">
              {isSearchOpen ? (
                <motion.div
                  key="search"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="w-full"
                >
                  <input
                    type="text"
                    placeholder="Search categories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    className="w-full rounded-full border-none bg-slate-100 dark:bg-surface-dark px-4 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </motion.div>
              ) : (
                <motion.h2
                  key="title"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-lg font-bold text-center tracking-tight"
                >
                  Categories
                </motion.h2>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-end gap-2 size-12 shrink-0">
            <button 
              onClick={() => {
                setIsSearchOpen(!isSearchOpen)
                if (isSearchOpen) setSearchQuery('')
              }}
              className={`flex size-10 items-center justify-center rounded-full transition-colors ${
                isSearchOpen 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-surface-dark'
              }`}
            >
              <span className="material-symbols-outlined">
                {isSearchOpen ? 'close' : 'search'}
              </span>
            </button>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="w-full px-4 pb-2">
          <div className="grid grid-cols-4 gap-2">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={clsx(
                  "py-2.5 rounded-full font-bold text-xs sm:text-sm whitespace-nowrap transition-all duration-200",
                  activeFilter === filter
                    ? "bg-primary text-background-dark shadow-[0_4px_12px_rgba(19,236,91,0.3)]"
                    : "bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                )}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow overflow-y-auto px-4 pb-32 space-y-6">
        {/* Pinned Section */}
        <div>
          <div className="flex items-center justify-between px-2 mb-3">
            <h2 className="text-sm uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400">Pinned</h2>
            <span className="material-symbols-outlined text-gray-400 text-sm">more_horiz</span>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar px-2 pb-4 -mx-2 snap-x">
            {pinnedCategories.map((category) => (
              <div 
                key={category.id}
                className={clsx(
                  "min-w-[280px] h-40 rounded-3xl border border-white/10 relative overflow-hidden snap-center group bg-gradient-to-br",
                  category.gradient
                )}
              >
                {category.color === 'primary' && (
                  <>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(19,236,91,0.15),transparent_70%)] opacity-30"></div>
                    <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary/20 blur-3xl rounded-full"></div>
                  </>
                )}
                {category.color === 'blue' && (
                  <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full"></div>
                )}
                
                <div className="relative h-full flex flex-col justify-between p-5 z-10">
                  <div className="flex justify-between items-start">
                    <div className={clsx(
                      "p-2.5 rounded-xl backdrop-blur-sm",
                      category.color === 'primary' ? "bg-primary/20 text-primary" : "bg-blue-500/20 text-blue-500"
                    )}>
                      <span className="material-symbols-outlined">{category.icon}</span>
                    </div>
                    <span className="bg-white/10 text-black dark:text-white text-[10px] font-bold px-2 py-1 rounded-full backdrop-blur-sm">
                      {category.progress}% Done
                    </span>
                  </div>
                  <div>
                    <h3 className={clsx("text-xl font-bold mb-1", category.textColor)}>{category.name}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">{category.count}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* All Collections - Masonry Grid */}
        <div>
          <div className="px-2 mb-3">
            <h2 className="text-sm uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400">All Collections</h2>
          </div>
          <div className="columns-2 gap-4 space-y-4 px-2">
            {allCollections.map((category) => (
              <div key={category.id} className="break-inside-avoid">
                <CategoryCard category={category} />
              </div>
            ))}
            
            {/* New Category Button */}
            <div className="break-inside-avoid">
              <button className="w-full rounded-2xl border-2 border-dashed border-gray-300 dark:border-white/10 p-5 flex flex-col items-center justify-center gap-2 h-32 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">add</span>
                </div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">New Category</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* FAB */}
      <div className="fixed bottom-24 right-4 z-20">
        <button 
          onClick={() => navigate('/new-habit')}
          className="flex items-center justify-center rounded-full h-14 w-14 shadow-[0_8px_24px_rgba(19,236,91,0.4)] bg-primary text-background-dark active:scale-95 transition-transform group"
        >
          <span className="material-symbols-outlined text-3xl group-hover:rotate-90 transition-transform">add</span>
        </button>
      </div>

      <SideNav isOpen={isSideNavOpen} onClose={() => setIsSideNavOpen(false)} />
      <BottomNav />
    </div>
  )
}

function CategoryCard({ category }: { category: Category }) {
  const getColorClasses = (color: string) => {
    const map: Record<string, any> = {
      emerald: { bg: 'bg-emerald-100 dark:bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', ring: 'ring-emerald-500/20', bar: 'bg-emerald-500' },
      purple: { bg: 'bg-purple-100 dark:bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400', ring: 'ring-purple-500/20' },
      yellow: { bg: 'bg-yellow-100 dark:bg-yellow-500/10', text: 'text-yellow-600 dark:text-yellow-400', ring: 'ring-yellow-500/20' },
      orange: { bg: 'bg-orange-100 dark:bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400', ring: 'ring-orange-500/20' },
      indigo: { bg: 'bg-indigo-100 dark:bg-indigo-500/10', text: 'text-indigo-600 dark:text-indigo-400', ring: 'ring-indigo-500/20', bar: 'bg-indigo-500' },
      pink: { bg: 'bg-pink-100 dark:bg-pink-500/10', text: 'text-pink-600 dark:text-pink-400', ring: 'ring-pink-500/20' },
      red: { bg: 'bg-red-100 dark:bg-red-500/10', text: 'text-red-600 dark:text-red-400', ring: 'ring-red-500/20' },
      teal: { bg: 'bg-teal-100 dark:bg-teal-500/10', text: 'text-teal-600 dark:text-teal-400', ring: 'ring-teal-500/20' },
      slate: { bg: 'bg-white dark:bg-white/5', text: 'text-slate-600 dark:text-slate-300', ring: 'ring-white/5' },
    }
    return map[color] || map.slate
  }

  const colors = getColorClasses(category.color)

  if (category.type === 'image-card') {
    return (
      <div className={clsx("relative w-full rounded-3xl overflow-hidden p-5 flex flex-col justify-end transition-all duration-300 hover:scale-[1.02] bg-gradient-to-b", category.gradient, category.height)}>
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <h3 className="text-lg font-bold text-white">{category.name}</h3>
          <p className="text-xs text-white/80">{category.count}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={clsx(
      "relative w-full rounded-3xl overflow-hidden bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-none p-5 flex flex-col transition-all duration-300 hover:scale-[1.02]",
      category.height
    )}>
      {category.type === 'progress' && (
        <div className="flex flex-col items-center text-center gap-4">
          <div className={clsx("w-16 h-16 rounded-full flex items-center justify-center mb-1 ring-1", colors.bg, colors.text, colors.ring)}>
            <span className="material-symbols-outlined text-3xl">{category.icon}</span>
          </div>
          <div className="relative z-10">
            <h3 className="text-lg font-bold text-black dark:text-white">{category.name}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{category.count}</p>
          </div>
          <div className="w-full bg-gray-100 dark:bg-white/5 h-1.5 rounded-full overflow-hidden mt-1">
            <div className={clsx("h-full w-3/4", colors.bar)}></div>
          </div>
        </div>
      )}

      {category.type === 'simple' && (
        <div className="flex flex-col justify-between h-full">
          <div className="absolute top-0 right-0 p-4">
            <div className={clsx("w-10 h-10 rounded-full flex items-center justify-center ring-1", colors.bg, colors.text, colors.ring)}>
              <span className="material-symbols-outlined">{category.icon}</span>
            </div>
          </div>
          <div className="mt-auto">
            <h3 className="text-lg font-bold text-black dark:text-white">{category.name}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{category.count}</p>
          </div>
        </div>
      )}

      {category.type === 'icon-bg' && (
        <div className="flex flex-col justify-between h-full">
          <div className="absolute top-0 right-0 p-4 opacity-50">
             <span className="material-symbols-outlined text-[6rem] text-yellow-50 dark:text-yellow-500/5 absolute -top-8 -right-8 transform rotate-12 pointer-events-none">{category.icon}</span>
          </div>
          <div className={clsx("relative z-10 w-10 h-10 rounded-full flex items-center justify-center ring-1", colors.bg, colors.text, colors.ring)}>
            <span className="material-symbols-outlined">{category.icon}</span>
          </div>
          <div className="relative z-10 mt-auto pt-4">
            <h3 className="text-lg font-bold text-black dark:text-white">{category.name}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{category.count}</p>
          </div>
        </div>
      )}

      {category.type === 'list' && (
        <div className="flex flex-col justify-between h-full">
          <div className={clsx("w-12 h-12 rounded-xl flex items-center justify-center mb-4 ring-1", colors.bg, colors.text, colors.ring)}>
            <span className="material-symbols-outlined">{category.icon}</span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-black dark:text-white mb-2 leading-tight">Read<br/>List</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">{category.count}</p>
            <div className="flex -space-x-2 overflow-hidden">
              <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-surface-dark bg-gray-300"></div>
              <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-surface-dark bg-gray-400"></div>
              <div className="flex h-6 w-6 rounded-full ring-2 ring-white dark:ring-surface-dark bg-gray-500 items-center justify-center text-[8px] text-white">+2</div>
            </div>
          </div>
        </div>
      )}

      {category.type === 'progress-card' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className={clsx("w-12 h-12 rounded-xl flex items-center justify-center ring-1", colors.bg, colors.text, colors.ring)}>
              <span className="material-symbols-outlined">{category.icon}</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300">Daily</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-black dark:text-white">{category.name}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{category.count}</p>
            <div className="w-full bg-gray-100 dark:bg-white/5 h-1 rounded-full overflow-hidden mt-3">
              <div className={clsx("h-full w-1/2", colors.bar)}></div>
            </div>
          </div>
        </div>
      )}

      {category.type === 'simple-card' && (
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-start mb-2">
            <div className={clsx("w-10 h-10 rounded-full flex items-center justify-center ring-1", colors.bg, colors.text, colors.ring)}>
              <span className="material-symbols-outlined">{category.icon}</span>
            </div>
            {category.name === 'Home' && <span className="text-xs font-mono text-gray-400">06</span>}
          </div>
          <h3 className="text-lg font-bold text-black dark:text-white">{category.name}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">{category.count}</p>
        </div>
      )}

      {category.type === 'avatars' && (
        <div className="flex flex-col justify-between h-full">
          <div className="flex justify-between items-start">
            <div className={clsx("w-10 h-10 rounded-full flex items-center justify-center ring-1", colors.bg, colors.text, colors.ring)}>
              <span className="material-symbols-outlined">{category.icon}</span>
            </div>
            <div className="flex -space-x-2">
              <div className="h-5 w-5 rounded-full bg-gray-200 dark:bg-gray-600 border border-white dark:border-surface-card"></div>
              <div className="h-5 w-5 rounded-full bg-gray-300 dark:bg-gray-500 border border-white dark:border-surface-card"></div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-black dark:text-white">{category.name}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{category.count}</p>
          </div>
        </div>
      )}
    </div>
  )
}
