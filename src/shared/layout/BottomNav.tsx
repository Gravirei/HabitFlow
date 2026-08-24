import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

interface NavItem {
  id: string
  label: string
  icon: string
  path: string
  filled?: boolean
}

const navItems: NavItem[] = [
  { id: 'today', label: 'Today', icon: 'grid_view', path: '/today' },
  { id: 'habits', label: 'Habits', icon: 'check_circle', path: '/habits' },
  { id: 'tasks', label: 'Tasks', icon: 'list_alt', path: '/tasks' },
  { id: 'social', label: 'Social', icon: 'group', path: '/social' },
  { id: 'categories', label: 'Categories', icon: 'category', path: '/categories' },
  { id: 'timer', label: 'Timer', icon: 'timer', path: '/timer' },
]

export function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const leftItems = navItems.slice(0, 3)
  const rightItems = navItems.slice(3)

  const isActive = (path: string) => location.pathname === path
  const isSocialPage = location.pathname === '/social'

  const renderNavItem = (item: NavItem) => {
    const active = isActive(item.path)

    return (
      <button
        key={item.id}
        onClick={() => navigate(item.path)}
        className={`group flex min-w-[64px] flex-col items-center justify-center gap-0.5 rounded-lg px-2 py-1 transition-all duration-300 ${
          active
            ? 'text-primary'
            : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'
        }`}
      >
        <span
          className={`material-symbols-outlined transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-105'}`}
          style={{
            fontSize: '24px',
            fontVariationSettings: active ? "'FILL' 1, 'wght' 600" : "'FILL' 0, 'wght' 400",
          }}
        >
          {item.icon}
        </span>

        <span className={`text-[10px] font-medium transition-all duration-300 ${
          active ? 'font-bold tracking-wide' : 'font-normal'
        }`}>
          {item.label}
        </span>
      </button>
    )
  }

  return (
    <AnimatePresence>
      {!isSocialPage && (
        <motion.nav
          className="fixed bottom-6 left-0 right-0 z-50 flex justify-center"
          initial={{ y: 0, opacity: 1 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <div className="relative flex items-center justify-center rounded-full border border-white/20 bg-background-light/90 px-6 py-2 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/90 dark:shadow-black/50">
            <div className="flex items-center -space-x-2 pr-2">
              {leftItems.map(renderNavItem)}
            </div>

            <motion.button
              type="button"
              onClick={() => navigate('/new-habit')}
              whileTap={{ scale: 0.94 }}
              className="group relative mx-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-800/95 text-white shadow-[0_8px_18px_rgba(0,0,0,0.22)]"
              aria-label="Create new habit"
            >
              <span className="absolute inset-0 rounded-full bg-white/10 animate-ping" />
              <span className="absolute inset-0 rounded-full bg-white/5 animate-pulse" />
              <span
                className="material-symbols-outlined relative z-10 text-[16px] transition-transform duration-200 group-hover:scale-110"
                style={{ fontVariationSettings: "'FILL' 1, 'wght' 700" }}
              >
                add
              </span>
            </motion.button>

            <div className="flex items-center -space-x-2 pl-2">
              {rightItems.map(renderNavItem)}
            </div>
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  )
}
