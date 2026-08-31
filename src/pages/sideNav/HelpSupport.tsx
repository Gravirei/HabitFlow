import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

interface FAQItem {
  id: string
  category: string
  question: string
  answer: string
}

const faqData: FAQItem[] = [
  {
    id: 'gs1',
    category: 'Getting Started',
    question: 'How do I create a new habit?',
    answer:
      'To create a new habit, click the "New Habit" button on the dashboard. Fill in the habit name, select how often you want to track it (daily or weekly), and optionally add a description. Click "Create" to save your habit. It will appear on your dashboard immediately.',
  },
  {
    id: 'gs2',
    category: 'Getting Started',
    question: 'How do I set goals for my habits?',
    answer:
      "When creating or editing a habit, you can set a weekly or monthly goal. For example, you can set a goal to complete a habit 5 times per week. Your progress toward the goal will be displayed on your habit card, and you'll get notifications as you approach your target.",
  },
  {
    id: 'habits1',
    category: 'Habits',
    question: 'How do I track my daily habits?',
    answer:
      'Simply click on the habit card or the checkmark icon to mark the habit as complete for today. You can see your daily streak and history by clicking on the habit name. The app automatically tracks dates and shows your progress visually.',
  },
  {
    id: 'habits2',
    category: 'Habits',
    question: 'What are weekly habits and how do they work?',
    answer:
      'Weekly habits are tracked on a week-by-week basis instead of daily. When you create a habit, you can choose "Weekly" to track it 1-7 times per week. Your progress resets every Sunday, and you can see how many times you\'ve completed the habit in the current week.',
  },
  {
    id: 'habits3',
    category: 'Habits',
    question: 'How do I archive or delete a habit?',
    answer:
      'To archive a habit, swipe left on the habit card (mobile) or click the menu icon and select "Archive". Archived habits are hidden from your dashboard but saved in your history. To permanently delete a habit, go to Settings > Archived Habits and select "Delete Forever".',
  },
  {
    id: 'timer1',
    category: 'Timer',
    question: 'How do I use the timer feature?',
    answer:
      'Click on any habit that requires timing, such as "Meditation" or "Exercise". The timer will open with a default duration. You can adjust the time using the plus/minus buttons, then click "Start" to begin. The timer will run in the background, and you\'ll receive a notification when time is up.',
  },
  {
    id: 'timer2',
    category: 'Timer',
    question: 'What timer modes are available?',
    answer:
      'HabitFlow offers three timer modes: Pomodoro (focused work intervals), Countdown (custom duration), and Stopwatch (track actual time). Select your preferred mode when starting a timed habit. Each mode includes preset options for quick setup.',
  },
  {
    id: 'account1',
    category: 'Account',
    question: 'How do I change my password?',
    answer:
      'Go to Settings > Account Security > Change Password. Enter your current password, then your new password twice to confirm. Make sure your new password is at least 8 characters long and includes a mix of uppercase, lowercase, and numbers for security.',
  },
  {
    id: 'account2',
    category: 'Account',
    question: 'How do I delete my account?',
    answer:
      'To delete your account, go to Settings > Account Management > Delete Account. Please note that this action is permanent and cannot be undone. You will have the option to download your data before deletion. Your account and all associated habits will be permanently removed.',
  },
  {
    id: 'general1',
    category: 'General',
    question: 'Is my data secure?',
    answer:
      'Yes, your data is encrypted end-to-end and stored securely on our servers. We comply with GDPR and other data protection regulations. Your password is hashed using industry-standard algorithms, and we never store sensitive information in plain text.',
  },
  {
    id: 'general2',
    category: 'General',
    question: 'How can I export my data?',
    answer:
      'You can export your habit data as a CSV or JSON file from Settings > Data & Privacy > Export Data. This allows you to backup your data, analyze it with other tools, or migrate to another platform. The export includes all your habits, progress history, and streaks.',
  },
]

// Category color configurations
const categoryConfig: Record<string, { bgColor: string; textColor: string; accentColor: string }> =
  {
    'Getting Started': {
      bgColor: 'bg-teal-50 dark:bg-teal-950/30',
      textColor: 'text-teal-700 dark:text-teal-300',
      accentColor: 'border-l-4 border-l-teal-500',
    },
    Habits: {
      bgColor: 'bg-purple-50 dark:bg-purple-950/30',
      textColor: 'text-purple-700 dark:text-purple-300',
      accentColor: 'border-l-4 border-l-purple-500',
    },
    Timer: {
      bgColor: 'bg-amber-50 dark:bg-amber-950/30',
      textColor: 'text-amber-700 dark:text-amber-300',
      accentColor: 'border-l-4 border-l-amber-500',
    },
    Account: {
      bgColor: 'bg-rose-50 dark:bg-rose-950/30',
      textColor: 'text-rose-700 dark:text-rose-300',
      accentColor: 'border-l-4 border-l-rose-500',
    },
    General: {
      bgColor: 'bg-slate-50 dark:bg-slate-900/30',
      textColor: 'text-slate-700 dark:text-slate-300',
      accentColor: 'border-l-4 border-l-slate-500',
    },
  }

export function HelpSupport() {
  const navigate = useNavigate()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)

  // Filter FAQ items based on search query
  const filteredFAQ = faqData.filter(
    (item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Group filtered FAQ by category
  const groupedFAQ = filteredFAQ.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = []
      }
      acc[item.category].push(item)
      return acc
    },
    {} as Record<string, FAQItem[]>
  )

  const toggleFAQ = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const handleEmailSupport = () => {
    window.location.href = 'mailto:support@habitflow.app'
  }

  const handleCommunity = () => {
    toast.success('Opening Discord community...')
  }

  const handleReportBug = () => {
    toast.success('Bug report form opening...')
  }

  const categoryList = Object.keys(categoryConfig)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-50"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white bg-opacity-95 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950 dark:bg-opacity-95">
        <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 lg:px-8">
          {/* Back Button, Title & Search Icon */}
          <div className="flex items-center gap-3">
            <motion.button
              onClick={() => navigate(-1)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-xl p-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-900"
              aria-label="Go back"
            >
              <span className="material-symbols-outlined text-2xl">arrow_back</span>
            </motion.button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Help & Support</h1>
            </div>
            <motion.button
              onClick={() => {
                setSearchOpen(!searchOpen)
                if (searchOpen) setSearchQuery('')
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={`rounded-xl p-2.5 transition-colors ${
                searchOpen
                  ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900'
              }`}
              aria-label={searchOpen ? 'Close search' : 'Open search'}
            >
              <span className="material-symbols-outlined text-xl">
                {searchOpen ? 'close' : 'search'}
              </span>
            </motion.button>
          </div>

          {/* Expandable Search Bar */}
          <AnimatePresence>
            {searchOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="group relative pt-3">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 mt-[6px] -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-teal-500">
                    search
                  </span>
                  <input
                    type="text"
                    placeholder="Search FAQs, categories, or keywords..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    className="w-full rounded-xl border border-slate-300 bg-slate-100 py-3 pl-12 pr-4 text-slate-900 placeholder-slate-500 transition-all duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-50 dark:placeholder-slate-400 dark:focus:ring-teal-400"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        {/* FAQ Section */}
        <section className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <h2 className="mb-2 text-3xl font-bold text-slate-900 dark:text-white">
              Frequently Asked Questions
            </h2>
            <p className="mb-8 text-slate-600 dark:text-slate-400">
              {filteredFAQ.length} question{filteredFAQ.length !== 1 ? 's' : ''} found
            </p>
          </motion.div>

          {Object.keys(groupedFAQ).length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-16 text-center"
            >
              <span className="material-symbols-outlined mb-4 block text-6xl text-slate-300 dark:text-slate-700">
                search_off
              </span>
              <p className="mb-2 text-lg font-medium text-slate-500 dark:text-slate-400">
                No questions found
              </p>
              <p className="text-slate-400 dark:text-slate-500">Try adjusting your search terms</p>
            </motion.div>
          ) : (
            <div className="space-y-8">
              <AnimatePresence mode="wait">
                {categoryList
                  .filter((category) => groupedFAQ[category])
                  .map((category, categoryIndex) => {
                    const items = groupedFAQ[category]
                    const config = categoryConfig[category]

                    return (
                      <motion.div
                        key={category}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{
                          duration: 0.3,
                          delay: categoryIndex * 0.05,
                        }}
                      >
                        {/* Category Badge */}
                        <div className="mb-4 flex items-center gap-3">
                          <motion.span
                            className={`inline-block rounded-full px-3 py-1.5 text-sm font-semibold ${config.textColor} ${config.bgColor}`}
                            whileHover={{ scale: 1.05 }}
                          >
                            {category}
                          </motion.span>
                          <span className="text-xs text-slate-400 dark:text-slate-500">
                            {items.length} question{items.length !== 1 ? 's' : ''}
                          </span>
                        </div>

                        {/* FAQ Items */}
                        <div className="space-y-3">
                          {items.map((item, itemIndex) => (
                            <motion.div
                              key={item.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{
                                duration: 0.2,
                                delay: itemIndex * 0.03,
                              }}
                              className={`overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-200 dark:border-slate-800 dark:bg-slate-900/50 ${
                                expandedId === item.id
                                  ? 'shadow-lg ring-2 ring-teal-500 dark:ring-teal-400'
                                  : 'hover:border-slate-300 hover:shadow-md dark:hover:border-slate-700'
                              }`}
                            >
                              {/* Accordion Button */}
                              <button
                                onClick={() => toggleFAQ(item.id)}
                                className={`group flex min-h-[56px] w-full items-start justify-between gap-4 px-6 py-4 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                                  expandedId === item.id ? config.accentColor : ''
                                }`}
                                aria-expanded={expandedId === item.id}
                                aria-controls={`faq-answer-${item.id}`}
                              >
                                <span className="pr-4 font-bold leading-tight text-slate-900 transition-colors group-hover:text-teal-600 dark:text-white dark:group-hover:text-teal-400">
                                  {item.question}
                                </span>
                                <motion.span
                                  className="material-symbols-outlined flex-shrink-0 text-slate-400 transition-colors group-hover:text-slate-600 dark:group-hover:text-slate-300"
                                  animate={{
                                    rotate: expandedId === item.id ? 180 : 0,
                                  }}
                                  transition={{ duration: 0.2 }}
                                >
                                  expand_more
                                </motion.span>
                              </button>

                              {/* Accordion Content */}
                              <AnimatePresence>
                                {expandedId === item.id && (
                                  <motion.div
                                    id={`faq-answer-${item.id}`}
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                  >
                                    <div
                                      className={`border-t border-slate-200 px-6 py-4 dark:border-slate-800 ${config.bgColor}`}
                                    >
                                      <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                                        {item.answer}
                                      </p>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )
                  })}
              </AnimatePresence>
            </div>
          )}
        </section>

        {/* Contact Section */}
        <section className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <h2 className="mb-2 text-3xl font-bold text-slate-900 dark:text-white">Get in Touch</h2>
            <p className="mb-8 text-slate-600 dark:text-slate-400">
              Multiple ways to reach us and get support
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Email Support Card */}
            <motion.button
              onClick={handleEmailSupport}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.25 }}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="group rounded-2xl border border-slate-200 bg-white p-6 text-left transition-all duration-200 hover:border-teal-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-teal-700"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 transition-colors group-hover:bg-teal-200 dark:bg-teal-950/50 dark:group-hover:bg-teal-900/50">
                <span className="material-symbols-outlined text-xl text-teal-600 dark:text-teal-400">
                  mail
                </span>
              </div>
              <h3 className="mb-1 text-lg font-bold text-slate-900 dark:text-white">
                Email Support
              </h3>
              <p className="mb-2 text-sm font-medium text-teal-600 dark:text-teal-400">
                support@habitflow.app
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                We typically respond within 24 hours
              </p>
            </motion.button>

            {/* Community Card */}
            <motion.button
              onClick={handleCommunity}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="group rounded-2xl border border-slate-200 bg-white p-6 text-left transition-all duration-200 hover:border-purple-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-purple-700"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 transition-colors group-hover:bg-purple-200 dark:bg-purple-950/50 dark:group-hover:bg-purple-900/50">
                <span className="material-symbols-outlined text-xl text-purple-600 dark:text-purple-400">
                  group
                </span>
              </div>
              <h3 className="mb-1 text-lg font-bold text-slate-900 dark:text-white">Community</h3>
              <p className="mb-2 text-sm font-medium text-purple-600 dark:text-purple-400">
                Join our Discord
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Connect with other habit trackers
              </p>
            </motion.button>

            {/* Bug Report Card */}
            <motion.button
              onClick={handleReportBug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.35 }}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="group rounded-2xl border border-slate-200 bg-white p-6 text-left transition-all duration-200 hover:border-rose-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-rose-700"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 transition-colors group-hover:bg-rose-200 dark:bg-rose-950/50 dark:group-hover:bg-rose-900/50">
                <span className="material-symbols-outlined text-xl text-rose-600 dark:text-rose-400">
                  bug_report
                </span>
              </div>
              <h3 className="mb-1 text-lg font-bold text-slate-900 dark:text-white">
                Report a Bug
              </h3>
              <p className="mb-2 text-sm font-medium text-rose-600 dark:text-rose-400">
                Found an issue?
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Help us improve the app</p>
            </motion.button>
          </div>
        </section>

        {/* Quick Links Section */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <h2 className="mb-2 text-3xl font-bold text-slate-900 dark:text-white">Quick Links</h2>
            <p className="mb-8 text-slate-600 dark:text-slate-400">
              Important documents and policies
            </p>
          </motion.div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <motion.button
              onClick={() => navigate('/terms')}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.45 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 py-3.5 font-semibold text-white shadow-lg transition-all duration-200 hover:bg-teal-700 hover:shadow-xl dark:bg-teal-500 dark:hover:bg-teal-600"
            >
              <span className="material-symbols-outlined text-lg">description</span>
              Terms of Service
            </motion.button>

            <motion.button
              onClick={() => navigate('/privacy')}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3.5 font-semibold text-white shadow-lg transition-all duration-200 hover:bg-orange-600 hover:shadow-xl dark:bg-orange-600 dark:hover:bg-orange-700"
            >
              <span className="material-symbols-outlined text-lg">privacy_tip</span>
              Privacy Policy
            </motion.button>
          </div>
        </section>
      </div>
    </motion.div>
  )
}
