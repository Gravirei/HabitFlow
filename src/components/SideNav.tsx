import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { logout } from '@/lib/auth/logout'
import { LogoutConfirmDialog, type LogoutOptions } from '@/components/auth/LogoutConfirmDialog'
import { useProfileStore, getAvatarFallbackUrl } from '@/store/useProfileStore'

interface SideNavProps {
  isOpen: boolean
  onClose: () => void
}

export function SideNav({ isOpen, onClose }: SideNavProps) {
  const navigate = useNavigate()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const { fullName, avatarUrl, bannerUrl, bio, loadImages } = useProfileStore()
  const truncatedBio = bio && bio.length > 50 ? bio.slice(0, 50) + '…' : bio
  const displayAvatar = avatarUrl || getAvatarFallbackUrl(fullName)

  // Hydrate avatar & banner from IndexedDB
  useEffect(() => {
    if (isOpen) loadImages()
  }, [isOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  const menuItems = [
    { icon: 'dashboard', label: 'Dashboard', path: '/today', active: true },
    { icon: 'checklist', label: 'All Habits', path: '/habits' },
    { icon: 'group', label: 'Social', path: '/social' },
    { icon: 'bar_chart', label: 'Statistics', path: '/progress' },
  ]

  const premiumItems = [
    { icon: 'workspace_premium', label: 'Premium Features', path: '/premium' },
    { icon: 'integration_instructions', label: 'Integrations', path: '/integrations' },
    { icon: 'settings', label: 'Settings', path: '/settings' },
  ]

  const supportItems = [
    { icon: 'feedback', label: 'Feedback', path: '/feedback' },
    { icon: 'share', label: 'Share App', path: '/share' },
    { icon: 'star', label: 'Rate this App', action: 'rate' },
    { icon: 'help', label: 'Help & Support', path: '/help' },
    { icon: 'info', label: 'About Us', path: '/about' },
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
              {/* Profile Section with Banner */}
              <div className="relative mb-6 -mx-6 -mt-6 overflow-hidden rounded-tr-[32px]">
                {/* Banner background */}
                <div className="relative h-28 sm:h-32 w-full">
                  {bannerUrl ? (
                    <img
                      src={bannerUrl}
                      alt="Cover banner"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    /* Default subtle pattern */
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
                      <div
                        className="absolute inset-0 opacity-[0.35] dark:opacity-[0.18]"
                        style={{
                          backgroundImage:
                            'radial-gradient(circle, currentColor 1px, transparent 1px)',
                          backgroundSize: '18px 18px',
                          color: '#8b5cf6',
                        }}
                      />
                    </div>
                  )}
                  {/* Bottom fade */}
                  <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-slate-50 dark:from-slate-950 to-transparent" />
                </div>

                {/* Avatar & info overlapping the banner bottom */}
                <div className="relative -mt-10 px-6 pb-2 flex flex-col items-start gap-3">
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-tr from-violet-500 to-fuchsia-500 rounded-full opacity-75 blur group-hover:opacity-100 transition duration-500"></div>
                    <div className="relative size-16 rounded-full p-0.5 bg-white dark:bg-slate-950">
                      <img 
                        alt="User avatar" 
                        className="size-full rounded-full object-cover" 
                        src={displayAvatar}
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-xl font-bold leading-tight text-slate-900 dark:text-white">{fullName}</p>
                    {truncatedBio && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug mt-0.5">{truncatedBio}</p>
                    )}
                    <button 
                      onClick={() => {
                        navigate('/profile')
                        onClose()
                      }}
                      className="text-sm font-medium text-primary hover:text-primary/80 transition-colors mt-0.5"
                    >
                      View Profile
                    </button>
                  </div>
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
                        if (item.path) {
                          navigate(item.path)
                          onClose()
                        } else if (item.action === 'share') {
                          if (navigator.share) {
                            navigator.share({
                              title: 'HabitFlow - Build Better Habits',
                              text: 'Check out HabitFlow! A beautiful habit tracking app to build better habits and stay consistent.',
                              url: window.location.origin,
                            }).catch(() => {})
                          } else {
                            navigator.clipboard.writeText(window.location.origin)
                            toast.success('Link copied to clipboard!')
                          }
                          onClose()
                        } else if (item.action === 'rate') {
                          toast('Thank you! App store rating coming soon 🌟', { icon: '⭐' })
                          onClose()
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
