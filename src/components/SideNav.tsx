import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { logout } from '@/lib/auth/logout'
import { LogoutConfirmDialog, type LogoutOptions } from '@/components/auth/LogoutConfirmDialog'

interface SideNavProps {
  isOpen: boolean
  onClose: () => void
}

export function SideNav({ isOpen, onClose }: SideNavProps) {
  const navigate = useNavigate()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const menuItems = [
    { icon: 'dashboard', label: 'Dashboard', path: '/', active: true },
    { icon: 'checklist', label: 'All Habits', path: '/all-habits', comingSoon: true },
    { icon: 'bar_chart', label: 'Statistics', path: '/progress' },
  ]

  const premiumItems = [
    { icon: 'workspace_premium', label: 'Premium Features', comingSoon: true },
    { icon: 'integration_instructions', label: 'Integrations', comingSoon: true },
    { icon: 'settings', label: 'Settings', path: '/settings' },
  ]

  const supportItems = [
    { icon: 'feedback', label: 'Feedback', comingSoon: true },
    { icon: 'share', label: 'Share App', comingSoon: true },
    { icon: 'star', label: 'Rate this App', comingSoon: true },
    { icon: 'help', label: 'Help & Support', comingSoon: true },
    { icon: 'info', label: 'About Us', comingSoon: true },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-y-0 left-0 z-[110] h-full w-[85%] max-w-sm bg-slate-50 dark:bg-slate-950 p-6 text-slate-800 dark:text-white shadow-2xl rounded-r-[32px] border-r border-slate-200 dark:border-slate-800 overflow-hidden"
          >
            <div className="flex h-full flex-col">
              {/* Profile Section */}
              <div className="mb-8 flex flex-col items-start gap-4 px-2">
                <div className="relative">
                  <img 
                    alt="User avatar" 
                    className="size-16 rounded-full border-2 border-primary object-cover shadow-md" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuD3O0deTZZmipqTbvQJk-Efv-eRm5SrKc_3YJQ8H36L5aUKYH0OHfZUoes8OCX7oJf_88wzt3l7VsOYB2c6esourN1FwD-Hb6BuFc12glSWyI2o10_RjzgfF1_E7GwREPdravvQsnrzl4nzS4LTxaB0KmxqZufPXTbEq77Lc82AqP_I9F72CioY6ALHnkfDImzl0-PUB9IEtWu9mFbjVICnfbis_QGzgseVrvDDmVmXOgoCpE1kdaC2FHrJ5u3pfhl7RhTajfqpHVkY"
                  />
                  <div className="absolute bottom-0 right-0 size-4 rounded-full bg-green-500 border-2 border-white dark:border-slate-900"></div>
                </div>
                <div>
                  <p className="text-xl font-bold leading-tight text-slate-900 dark:text-white">Jane Doe</p>
                  <button 
                    onClick={() => {
                      navigate('/profile')
                      onClose()
                    }}
                    className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    View Profile
                  </button>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 overflow-y-auto no-scrollbar -mx-4 px-4">
                <div className="space-y-1">
                  {menuItems.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        if (item.path && !item.comingSoon) navigate(item.path)
                        else if (item.comingSoon) {
                          toast('Coming soon!', { icon: '🚀' })
                        }
                        if (!item.comingSoon) onClose()
                      }}
                      className={`flex h-12 w-full items-center gap-4 rounded-2xl px-4 transition-all active:scale-95 ${
                        item.active 
                          ? 'bg-primary/10 text-primary' 
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className={`material-symbols-outlined ${item.active ? 'text-primary' : ''}`}>
                        {item.icon}
                      </span>
                      <span className={`text-base font-medium ${item.active ? 'font-bold' : ''}`}>
                        {item.label}
                      </span>
                      {item.comingSoon && (
                        <span className="ml-auto text-[10px] font-bold bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 px-2 py-0.5 rounded-full">
                          SOON
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="my-4 h-px bg-slate-200 dark:bg-slate-800 mx-2" />

                <div className="space-y-1">
                  {premiumItems.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        if (item.path && !item.comingSoon) navigate(item.path)
                        else if (item.comingSoon) {
                          toast('Coming soon!', { icon: '🚀' })
                        }
                        if (!item.comingSoon) onClose()
                      }}
                      className="flex h-12 w-full items-center gap-4 rounded-2xl px-4 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95"
                    >
                      <span className="material-symbols-outlined">{item.icon}</span>
                      <span className="text-base font-medium">{item.label}</span>
                      {item.comingSoon && (
                        <span className="ml-auto text-[10px] font-bold bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 px-2 py-0.5 rounded-full">
                          SOON
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="my-4 h-px bg-slate-200 dark:bg-slate-800 mx-2" />

                <div className="space-y-1">
                  {supportItems.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        if (item.comingSoon) {
                          toast('Coming soon!', { icon: '🚀' })
                        }
                      }}
                      className="flex h-12 w-full items-center gap-4 rounded-2xl px-4 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95"
                    >
                      <span className="material-symbols-outlined">{item.icon}</span>
                      <span className="text-base font-medium">{item.label}</span>
                      {item.comingSoon && (
                        <span className="ml-auto text-[10px] font-bold bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 px-2 py-0.5 rounded-full">
                          SOON
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </nav>

              {/* Footer */}
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="flex h-12 w-full items-center gap-4 rounded-2xl px-4 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined">logout</span>
                  <span className="text-base font-medium">Logout</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Logout Confirmation Dialog */}
          <LogoutConfirmDialog
            isOpen={showLogoutConfirm}
            onClose={() => setShowLogoutConfirm(false)}
            onConfirm={async (options: LogoutOptions) => {
              try {
                await logout(options)
                toast.success(options.logoutAllDevices ? 'Logged out from all devices' : 'Logged out')
                onClose()
                navigate('/login')
              } catch (error: any) {
                console.error('Logout error:', error)
                toast.error(error?.message || 'Failed to log out')
                throw error // Re-throw to let the dialog handle loading state
              }
            }}
          />
        </>
      )}
    </AnimatePresence>
  )
}
