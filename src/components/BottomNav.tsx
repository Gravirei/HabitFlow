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
  { id: 'categories', label: 'Categories', icon: 'folder', path: '/categories' },
  { id: 'timer', label: 'Timer', icon: 'timer', path: '/timer' },
]

export function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path
  const isSocialPage = location.pathname === '/social'

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
          <div className="flex items-center justify-center -space-x-2 rounded-full border border-white/20 bg-background-light/90 px-6 py-2 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/90 dark:shadow-black/50">
            {navItems.map((item) => {
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
                      fontVariationSettings: active ? "'FILL' 1, 'wght' 600" : "'FILL' 0, 'wght' 400" 
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
            })}
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  )
}
