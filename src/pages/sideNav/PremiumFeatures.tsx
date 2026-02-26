import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { usePremiumStore } from '@/store/usePremiumStore';

export function PremiumFeatures() {
  const navigate = useNavigate();
  const { tier } = usePremiumStore();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: 'easeOut' },
    },
  };

  const tiers = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      period: '/month',
      description: 'Perfect for getting started',
      badge: null,
      features: [
        'Basic habit tracking',
        'Timer function',
        '5 categories',
        'Local storage',
      ],
      buttonText: tier === 'free' ? 'Current Plan' : 'Downgrade',
      buttonVariant: tier === 'free' ? 'current' : 'secondary',
      highlighted: false,
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$9',
      period: '/month',
      description: 'Most popular for individuals',
      badge: 'MOST POPULAR',
      features: [
        'Unlimited habits',
        'AI Insights',
        'Cloud sync',
        'Priority support',
        'Advanced analytics',
        'Custom themes',
      ],
      buttonText: tier === 'pro' ? 'Current Plan' : 'Upgrade',
      buttonVariant: tier === 'pro' ? 'current' : 'primary',
      highlighted: true,
    },
    {
      id: 'team',
      name: 'Team',
      price: '$19',
      period: '/user/month',
      description: 'Perfect for teams',
      badge: null,
      features: [
        'Everything in Pro',
        'Team sharing',
        'Admin dashboard',
        'API access',
        'SSO',
      ],
      buttonText: tier === 'team' ? 'Current Plan' : 'Contact Sales',
      buttonVariant: tier === 'team' ? 'current' : 'secondary',
      highlighted: false,
    },
  ];

  const comparisonRows = [
    { feature: 'Habits', free: '5', pro: 'Unlimited', team: 'Unlimited' },
    { feature: 'Categories', free: '5', pro: 'Unlimited', team: 'Unlimited' },
    { feature: 'Timer', free: true, pro: true, team: true },
    { feature: 'Statistics', free: true, pro: true, team: true },
    { feature: 'AI Insights', free: false, pro: true, team: true },
    { feature: 'Cloud Sync', free: false, pro: true, team: true },
    { feature: 'Export', free: 'CSV', pro: 'All formats', team: 'All formats' },
    { feature: 'Custom Themes', free: false, pro: true, team: true },
    { feature: 'Team Sharing', free: false, pro: false, team: true },
    { feature: 'API Access', free: false, pro: false, team: true },
    { feature: 'Priority Support', free: false, pro: true, team: true },
    { feature: 'SSO', free: false, pro: false, team: true },
  ];

  const faqs = [
    {
      question: 'Can I cancel anytime?',
      answer: 'Yes, no commitment. You can cancel your subscription at any time.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept Visa, Mastercard, and PayPal for all subscription tiers.',
    },
    {
      question: 'Is there a free trial?',
      answer: '14-day free trial available for Pro and Team plans. No credit card required.',
    },
    {
      question: 'What happens when I downgrade?',
      answer: 'You keep all your data, but lose access to premium features. You can upgrade anytime.',
    },
  ];

  const handleUpgrade = (tierId: string) => {
    if (tierId === 'team') {
      toast.success('Sales team will contact you soon!');
    } else if (tier !== tierId) {
      toast.success('Premium upgrade coming soon! 🚀');
    }
  };

  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const handleFaqToggle = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 dark:from-slate-950 dark:to-slate-950 pb-8">
      {/* Header with Back Button */}
      <div className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
            aria-label="Go back"
          >
            <span className="material-symbols-outlined text-xl">arrow_back</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Premium
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-12"
        >
          {/* Current Plan Banner */}
          <motion.div variants={itemVariants}>
            <div className="bg-gradient-to-r from-teal-500 to-emerald-500 dark:from-teal-600 dark:to-emerald-600 rounded-2xl p-6 sm:p-8 text-white shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-teal-50 text-sm font-medium mb-1">Your current plan</p>
                  <h2 className="text-2xl sm:text-3xl font-bold capitalize">
                    {tier === 'free' ? 'Free' : tier === 'pro' ? 'Pro' : 'Team'} Plan
                  </h2>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 w-fit">
                  <p className="text-sm font-semibold">Active</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Pricing Cards */}
          <motion.div variants={itemVariants}>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-8">
              Choose your plan
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 overflow-x-auto pb-4">
              {tiers.map((tierData, idx) => (
                <motion.div
                  key={tierData.id}
                  variants={itemVariants}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className={`relative rounded-2xl overflow-hidden flex flex-col h-full transition-all duration-200 ${
                    tierData.highlighted
                      ? 'md:scale-105 md:z-10'
                      : 'md:scale-100'
                  }`}
                >
                  {/* Card Background */}
                  <div
                    className={`absolute inset-0 ${
                      tierData.highlighted
                        ? 'bg-gradient-to-b from-white to-teal-50/50 dark:from-slate-800 dark:to-slate-900/50 border-2 border-transparent bg-clip-padding'
                        : 'bg-white dark:bg-slate-900/50'
                    }`}
                    style={
                      tierData.highlighted
                        ? {
                            borderImage:
                              'linear-gradient(135deg, #0D9488, #F97316) 1',
                          }
                        : {}
                    }
                  />

                  {/* Badge */}
                  {tierData.badge && (
                    <div className="absolute top-0 right-0 bg-gradient-to-r from-orange-400 to-orange-500 text-white px-4 py-1.5 text-xs font-bold rounded-bl-2xl shadow-lg">
                      {tierData.badge}
                    </div>
                  )}

                  {/* Card Content */}
                  <div className="relative p-6 sm:p-8 flex flex-col h-full">
                    <div className="mb-6">
                      <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">
                        {tierData.name}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {tierData.description}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="mb-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white">
                          {tierData.price}
                        </span>
                        <span className="text-slate-600 dark:text-slate-400 font-medium">
                          {tierData.period}
                        </span>
                      </div>
                    </div>

                    {/* Features List */}
                    <div className="mb-8 flex-1">
                      <ul className="space-y-3">
                        {tierData.features.map((feature, featureIdx) => (
                          <motion.li
                            key={featureIdx}
                            variants={itemVariants}
                            className="flex items-start gap-3"
                          >
                            <span className="material-symbols-outlined text-teal-500 dark:text-teal-400 flex-shrink-0 mt-0.5 text-lg">
                              check_circle
                            </span>
                            <span className="text-slate-700 dark:text-slate-300 text-sm sm:text-base">
                              {feature}
                            </span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>

                    {/* CTA Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleUpgrade(tierData.id)}
                      disabled={tierData.buttonVariant === 'current'}
                      className={`w-full py-3 sm:py-4 rounded-xl font-semibold transition-all duration-200 text-base sm:text-lg ${
                        tierData.buttonVariant === 'primary'
                          ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:shadow-lg disabled:opacity-75'
                          : tierData.buttonVariant === 'current'
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-not-allowed'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {tierData.buttonText}
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Feature Comparison Table */}
          <motion.div variants={itemVariants}>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-8">
              Feature Comparison
            </h2>
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">
                      Feature
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900 dark:text-white">
                      Free
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900 dark:text-white">
                      Pro
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900 dark:text-white">
                      Team
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                        {row.feature}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {typeof row.free === 'boolean' ? (
                          row.free ? (
                            <span className="material-symbols-outlined text-teal-500 dark:text-teal-400 inline text-lg">
                              check_circle
                            </span>
                          ) : (
                            <span className="material-symbols-outlined text-slate-400 dark:text-slate-600 inline text-lg">
                              cancel
                            </span>
                          )
                        ) : (
                          <span className="text-sm text-slate-700 dark:text-slate-300">
                            {row.free}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {typeof row.pro === 'boolean' ? (
                          row.pro ? (
                            <span className="material-symbols-outlined text-teal-500 dark:text-teal-400 inline text-lg">
                              check_circle
                            </span>
                          ) : (
                            <span className="material-symbols-outlined text-slate-400 dark:text-slate-600 inline text-lg">
                              cancel
                            </span>
                          )
                        ) : (
                          <span className="text-sm text-slate-700 dark:text-slate-300">
                            {row.pro}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {typeof row.team === 'boolean' ? (
                          row.team ? (
                            <span className="material-symbols-outlined text-teal-500 dark:text-teal-400 inline text-lg">
                              check_circle
                            </span>
                          ) : (
                            <span className="material-symbols-outlined text-slate-400 dark:text-slate-600 inline text-lg">
                              cancel
                            </span>
                          )
                        ) : (
                          <span className="text-sm text-slate-700 dark:text-slate-300">
                            {row.team}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* FAQ Section */}
          <motion.div variants={itemVariants}>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-8">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className="bg-white dark:bg-slate-900/50 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-600 transition-all duration-200"
                >
                  <button
                    onClick={() => handleFaqToggle(idx)}
                    className="w-full px-6 sm:px-8 py-4 sm:py-6 text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-150"
                    aria-expanded={expandedFaq === idx}
                  >
                    <h3 className="font-semibold text-slate-900 dark:text-white text-base sm:text-lg">
                      {faq.question}
                    </h3>
                    <motion.span
                      animate={{ rotate: expandedFaq === idx ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="material-symbols-outlined text-slate-600 dark:text-slate-400 flex-shrink-0 ml-4"
                    >
                      expand_more
                    </motion.span>
                  </button>
                  <AnimatePresence>
                    {expandedFaq === idx && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 sm:px-8 pb-4 sm:pb-6 border-t border-slate-200 dark:border-slate-700">
                          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed pt-4">
                            {faq.answer}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500 dark:from-teal-600 dark:via-emerald-600 dark:to-cyan-600 rounded-2xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden"
          >
            {/* Animated background elements */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full filter blur-3xl animate-pulse" />
            </div>

            <div className="relative z-10 text-center max-w-2xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Start your 14-day free trial
              </h2>
              <p className="text-teal-50 text-base sm:text-lg mb-8">
                No credit card required. Upgrade anytime. Cancel anytime.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleUpgrade('pro')}
                className="bg-white text-teal-600 font-bold px-8 sm:px-12 py-4 sm:py-5 rounded-xl hover:shadow-lg transition-all duration-200 text-base sm:text-lg inline-flex items-center gap-3"
              >
                <span>Start Free Trial</span>
                <span className="material-symbols-outlined">arrow_forward</span>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
