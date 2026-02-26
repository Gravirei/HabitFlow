import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
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
      'When creating or editing a habit, you can set a weekly or monthly goal. For example, you can set a goal to complete a habit 5 times per week. Your progress toward the goal will be displayed on your habit card, and you\'ll get notifications as you approach your target.',
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
];

// Category color configurations
const categoryConfig: Record<string, { bgColor: string; textColor: string; accentColor: string }> = {
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
};

export function HelpSupport() {
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  // Filter FAQ items based on search query
  const filteredFAQ = faqData.filter(
    (item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group filtered FAQ by category
  const groupedFAQ = filteredFAQ.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<string, FAQItem[]>
  );

  const toggleFAQ = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleEmailSupport = () => {
    window.location.href = 'mailto:support@habitflow.app';
  };

  const handleCommunity = () => {
    toast.success('Opening Discord community...');
  };

  const handleReportBug = () => {
    toast.success('Bug report form opening...');
  };

  const categoryList = Object.keys(categoryConfig);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95">
        <div className="max-w-5xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          {/* Back Button, Title & Search Icon */}
          <div className="flex items-center gap-3">
            <motion.button
              onClick={() => navigate(-1)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
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
              className={`p-2.5 rounded-xl transition-colors ${
                searchOpen
                  ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400'
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
                <div className="relative group pt-3">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 mt-[6px] -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors">
                    search
                  </span>
                  <input
                    type="text"
                    placeholder="Search FAQs, categories, or keywords..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-50 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:focus:ring-teal-400 transition-all duration-200"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* FAQ Section */}
        <section className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <h2 className="text-3xl font-bold mb-2 text-slate-900 dark:text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8">
              {filteredFAQ.length} question{filteredFAQ.length !== 1 ? 's' : ''} found
            </p>
          </motion.div>

          {Object.keys(groupedFAQ).length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-700 block mb-4">
                search_off
              </span>
              <p className="text-lg text-slate-500 dark:text-slate-400 font-medium mb-2">
                No questions found
              </p>
              <p className="text-slate-400 dark:text-slate-500">
                Try adjusting your search terms
              </p>
            </motion.div>
          ) : (
            <div className="space-y-8">
              <AnimatePresence mode="wait">
                {categoryList
                  .filter((category) => groupedFAQ[category])
                  .map((category, categoryIndex) => {
                    const items = groupedFAQ[category];
                    const config = categoryConfig[category];

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
                        <div className="flex items-center gap-3 mb-4">
                          <motion.span
                            className={`inline-block px-3 py-1.5 rounded-full text-sm font-semibold ${config.textColor} ${config.bgColor}`}
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
                              className={`overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 transition-all duration-200 ${
                                expandedId === item.id
                                  ? 'ring-2 ring-teal-500 dark:ring-teal-400 shadow-lg'
                                  : 'hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md'
                              }`}
                            >
                              {/* Accordion Button */}
                              <button
                                onClick={() => toggleFAQ(item.id)}
                                className={`w-full px-6 py-4 flex items-start justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left group min-h-[56px] ${
                                  expandedId === item.id ? config.accentColor : ''
                                }`}
                                aria-expanded={expandedId === item.id}
                                aria-controls={`faq-answer-${item.id}`}
                              >
                                <span className="font-bold text-slate-900 dark:text-white leading-tight pr-4 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                                  {item.question}
                                </span>
                                <motion.span
                                  className="material-symbols-outlined flex-shrink-0 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors"
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
                                    <div className={`px-6 py-4 border-t border-slate-200 dark:border-slate-800 ${config.bgColor}`}>
                                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
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
                    );
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
            <h2 className="text-3xl font-bold mb-2 text-slate-900 dark:text-white">
              Get in Touch
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8">
              Multiple ways to reach us and get support
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Email Support Card */}
            <motion.button
              onClick={handleEmailSupport}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.25 }}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-teal-300 dark:hover:border-teal-700 hover:shadow-lg transition-all duration-200 text-left group"
            >
              <div className="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-950/50 flex items-center justify-center mb-4 group-hover:bg-teal-200 dark:group-hover:bg-teal-900/50 transition-colors">
                <span className="material-symbols-outlined text-teal-600 dark:text-teal-400 text-xl">
                  mail
                </span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1">
                Email Support
              </h3>
              <p className="text-sm text-teal-600 dark:text-teal-400 font-medium mb-2">
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
              className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-lg transition-all duration-200 text-left group"
            >
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-950/50 flex items-center justify-center mb-4 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
                <span className="material-symbols-outlined text-purple-600 dark:text-purple-400 text-xl">
                  group
                </span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1">
                Community
              </h3>
              <p className="text-sm text-purple-600 dark:text-purple-400 font-medium mb-2">
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
              className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-rose-300 dark:hover:border-rose-700 hover:shadow-lg transition-all duration-200 text-left group"
            >
              <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/50 flex items-center justify-center mb-4 group-hover:bg-rose-200 dark:group-hover:bg-rose-900/50 transition-colors">
                <span className="material-symbols-outlined text-rose-600 dark:text-rose-400 text-xl">
                  bug_report
                </span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1">
                Report a Bug
              </h3>
              <p className="text-sm text-rose-600 dark:text-rose-400 font-medium mb-2">
                Found an issue?
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Help us improve the app
              </p>
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
            <h2 className="text-3xl font-bold mb-2 text-slate-900 dark:text-white">
              Quick Links
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8">
              Important documents and policies
            </p>
          </motion.div>

          <div className="flex flex-col sm:flex-row gap-4">
            <motion.button
              onClick={() => navigate('/terms')}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.45 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 px-6 py-3.5 rounded-xl bg-teal-600 dark:bg-teal-500 text-white font-semibold hover:bg-teal-700 dark:hover:bg-teal-600 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 min-h-[44px]"
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
              className="flex-1 px-6 py-3.5 rounded-xl bg-orange-500 dark:bg-orange-600 text-white font-semibold hover:bg-orange-600 dark:hover:bg-orange-700 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 min-h-[44px]"
            >
              <span className="material-symbols-outlined text-lg">privacy_tip</span>
              Privacy Policy
            </motion.button>
          </div>
        </section>
      </div>
    </motion.div>
  );
}
