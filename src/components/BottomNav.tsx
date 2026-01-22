import { useNavigate, useLocation } from 'react-router-dom'

interface NavItem {
  id: string
  label: string
  icon: string
  path: string
  filled?: boolean
}

const navItems: NavItem[] = [
  { id: 'today', label: 'Today', icon: 'grid_view', path: '/' },
  { id: 'habits', label: 'Habits', icon: 'check_circle', path: '/habits' },
  { id: 'tasks', label: 'Tasks', icon: 'list_alt', path: '/tasks' },
  { id: 'categories', label: 'Categories', icon: 'folder', path: '/categories' },
  { id: 'timer', label: 'Timer', icon: 'timer', path: '/timer' },
]

export function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-10 w-full border-t border-black/10 bg-background-light/80 px-4 pb-3 pt-2 backdrop-blur-lg dark:border-white/10 dark:bg-background-dark/80">
      <div className="mx-auto flex max-w-md items-center justify-around gap-2">
        {navItems.map((item) => {
          const active = isActive(item.path)
          
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`flex flex-1 flex-col items-center justify-end gap-1 ${
                active ? 'text-primary' : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <div className="flex h-8 items-center justify-center">
                <span 
                  className="material-symbols-outlined text-2xl"
                  style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {item.icon}
                </span>
              </div>
              <p className="text-xs font-medium leading-normal tracking-[0.015em]">
                {item.label}
              </p>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
