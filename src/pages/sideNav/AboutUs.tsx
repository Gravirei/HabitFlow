// @ts-nocheck
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export function AboutUs() {
  const navigate = useNavigate()
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const currentYear = new Date().getFullYear()

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  const features = [
    {
      icon: 'check_circle',
      title: 'Habit Tracking',
      description: 'Monitor your daily habits with an intuitive interface and real-time feedback.',
      size: 'large',
    },
    {
      icon: 'bar_chart',
      title: 'Analytics',
      description: 'Visualize progress with detailed insights and statistical analysis.',
      size: 'large',
    },
    {
      icon: 'target',
      title: 'Smart Goals',
      description: 'AI-powered recommendations',
      size: 'small',
    },
    {
      icon: 'schedule',
      title: 'Timer & Focus',
      description: 'Pomodoro sessions',
      size: 'small',
    },
    {
      icon: 'category',
      title: 'Categories',
      description: 'Organize & manage',
      size: 'small',
    },
    {
      icon: 'cloud_sync',
      title: 'Cloud Sync',
      description: 'Real-time sync',
      size: 'small',
    },
  ]

  const techStack = [
    { name: 'React', color: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300' },
    {
      name: 'TypeScript',
      color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    },
    {
      name: 'Supabase',
      color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
    },
    { name: 'Tailwind CSS', color: 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300' },
  ]

  const socialLinks = [
    { name: 'Twitter', icon: 'share', color: 'hover:text-black dark:hover:text-white' },
    { name: 'GitHub', icon: 'code', color: 'hover:text-slate-700 dark:hover:text-slate-300' },
    { name: 'Website', icon: 'language', color: 'hover:text-teal-600 dark:hover:text-teal-400' },
  ]

  const getStaggerDelay = (index: number) => (prefersReducedMotion ? 0 : index * 0.05)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.06,
        delayChildren: prefersReducedMotion ? 0 : 0.15,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: prefersReducedMotion ? 0 : 0.5,
        ease: 'easeOut',
      },
    },
  }

  const cardHoverVariants = {
    rest: { scale: 1, boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' },
    hover: {
      scale: prefersReducedMotion ? 1 : 1.02,
      boxShadow: prefersReducedMotion
        ? '0 1px 3px rgba(0, 0, 0, 0.1)'
        : '0 10px 25px rgba(13, 148, 136, 0.15)',
    },
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.5 }}
      className="min-h-screen bg-gradient-to-b from-white to-slate-50 text-slate-800 dark:from-slate-950 dark:to-slate-900 dark:text-white"
    >
      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.5 }}
        onClick={() => navigate(-1)}
        className="fixed left-6 top-6 z-50 rounded-xl p-2.5 transition-all duration-200 hover:bg-slate-100 hover:shadow-sm dark:hover:bg-slate-800/60"
        aria-label="Go back"
      >
        <span className="material-symbols-outlined text-2xl">arrow_back</span>
      </motion.button>

      <div className="mx-auto max-w-6xl px-6 py-16">
        {/* Hero Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative mb-20"
        >
          {/* Gradient background circle */}
          <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 transform rounded-full bg-gradient-to-br from-teal-400/20 via-emerald-400/10 to-transparent blur-3xl" />

          <motion.div variants={itemVariants} className="relative mb-8 text-center">
            {/* App Icon with gradient background */}
            <div className="mb-6 flex justify-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-teal-500 to-emerald-500 shadow-lg">
                <span className="material-symbols-outlined text-5xl text-white">favorite</span>
              </div>
            </div>

            <h1 className="mb-2 bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-6xl font-bold text-transparent dark:from-teal-400 dark:to-emerald-400">
              HabitFlow
            </h1>

            {/* Version Badge */}
            <div className="mb-4 inline-block">
              <span className="rounded-full border border-teal-200 bg-gradient-to-r from-teal-100 to-emerald-100 px-3 py-1 text-sm font-medium text-teal-700 dark:border-teal-800 dark:from-teal-900/40 dark:to-emerald-900/40 dark:text-teal-300">
                v1.0.0
              </span>
            </div>
          </motion.div>

          {/* Mission Tagline */}
          <motion.p
            variants={itemVariants}
            className="mx-auto max-w-3xl text-xl leading-relaxed text-slate-600 dark:text-slate-300"
          >
            Build better habits, transform your life. HabitFlow is your personal habit tracking
            companion, designed to help you achieve consistency and reach your goals one day at a
            time.
          </motion.p>
        </motion.div>

        {/* Bento Box Feature Grid */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-20"
        >
          <motion.h2
            variants={itemVariants}
            className="mb-12 text-center text-4xl font-bold text-slate-900 dark:text-white"
          >
            Key Features
          </motion.h2>

          <div className="grid auto-rows-max grid-cols-1 gap-6 md:grid-cols-4">
            {/* Large cards - span 2 columns */}
            {features
              .filter((f) => f.size === 'large')
              .map((feature, index) => (
                <motion.div
                  key={`large-${index}`}
                  variants={cardHoverVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: getStaggerDelay(index) }}
                  whileHover="hover"
                  className="cursor-pointer rounded-2xl border border-teal-200/50 bg-gradient-to-br from-slate-50/80 to-teal-50/30 p-8 transition-all duration-200 dark:border-teal-800/30 dark:from-slate-900/50 dark:to-teal-900/20 md:col-span-2"
                >
                  <div className="flex items-start gap-6">
                    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-400 shadow-md">
                      <span className="material-symbols-outlined text-2xl text-white">
                        {feature.icon}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">
                        {feature.title}
                      </h3>
                      <p className="leading-relaxed text-slate-600 dark:text-slate-300">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}

            {/* Small cards - span 1 column */}
            {features
              .filter((f) => f.size === 'small')
              .map((feature, index) => (
                <motion.div
                  key={`small-${index}`}
                  variants={cardHoverVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: getStaggerDelay(index + 2) }}
                  whileHover="hover"
                  className="cursor-pointer rounded-2xl border border-teal-200/50 bg-gradient-to-br from-slate-50/80 to-teal-50/30 p-6 transition-all duration-200 dark:border-teal-800/30 dark:from-slate-900/50 dark:to-teal-900/20"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-orange-500 shadow-sm">
                    <span className="material-symbols-outlined text-lg text-white">
                      {feature.icon}
                    </span>
                  </div>
                  <h4 className="mb-1 text-lg font-semibold text-slate-900 dark:text-white">
                    {feature.title}
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
          </div>
        </motion.section>

        {/* Team Section */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-20"
        >
          <motion.div
            variants={cardHoverVariants}
            whileHover="hover"
            className="mx-auto max-w-2xl cursor-pointer rounded-3xl border border-emerald-200/50 bg-gradient-to-br from-emerald-50/80 to-teal-50/40 p-12 text-center transition-all duration-200 dark:border-emerald-800/30 dark:from-emerald-900/20 dark:to-teal-900/20"
          >
            {/* Avatar Placeholder */}
            <div className="mb-6 flex justify-center">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-teal-400 via-emerald-400 to-teal-500 shadow-lg" />
            </div>

            <h3 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">
              Built with ❤️
            </h3>
            <p className="mb-4 text-lg text-slate-700 dark:text-slate-200">by the HabitFlow Team</p>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Dedicated to helping you build lasting habits and achieve your goals.
            </p>
            <button
              onClick={() => navigate('/contribute')}
              className="mt-6 px-5 py-2 text-sm font-medium text-teal-700 underline underline-offset-2 transition-colors hover:text-teal-800 dark:text-teal-300 dark:hover:text-teal-200"
              aria-label="Contribute to HabitFlow"
            >
              Learn how to contribute →
            </button>
          </motion.div>
        </motion.section>

        {/* Tech Stack Section */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-20"
        >
          <motion.h2
            variants={itemVariants}
            className="mb-10 text-center text-3xl font-bold text-slate-900 dark:text-white"
          >
            Built With
          </motion.h2>

          <div className="flex flex-wrap justify-center gap-3">
            {techStack.map((tech, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: getStaggerDelay(index) }}
                whileHover={{ scale: prefersReducedMotion ? 1 : 1.05 }}
                whileTap={{ scale: prefersReducedMotion ? 1 : 0.95 }}
                className={`rounded-full border px-5 py-2.5 text-sm font-semibold ${tech.color} cursor-pointer border-current border-opacity-20 transition-all duration-200`}
              >
                {tech.name}
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Legal Links Section */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-20"
        >
          <motion.div
            variants={itemVariants}
            className="flex flex-col justify-center gap-4 sm:flex-row"
          >
            <button
              onClick={() => navigate('/terms')}
              className="rounded-xl border border-slate-200 bg-gradient-to-r from-slate-100 to-slate-50 px-6 py-3 font-semibold text-slate-700 transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95 dark:border-slate-700 dark:from-slate-800/60 dark:to-slate-800/40 dark:text-slate-200 dark:hover:shadow-lg dark:hover:shadow-slate-900/30"
            >
              Terms of Service
            </button>
            <button
              onClick={() => navigate('/privacy')}
              className="rounded-xl border border-slate-200 bg-gradient-to-r from-slate-100 to-slate-50 px-6 py-3 font-semibold text-slate-700 transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95 dark:border-slate-700 dark:from-slate-800/60 dark:to-slate-800/40 dark:text-slate-200 dark:hover:shadow-lg dark:hover:shadow-slate-900/30"
            >
              Privacy Policy
            </button>
          </motion.div>
        </motion.section>

        {/* Social Links Section */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-16"
        >
          <motion.div variants={itemVariants} className="flex justify-center gap-3">
            {socialLinks.map((social, index) => (
              <motion.button
                key={index}
                initial="hidden"
                animate="visible"
                transition={{ delay: getStaggerDelay(index) }}
                whileHover={{ scale: prefersReducedMotion ? 1 : 1.1, y: -2 }}
                whileTap={{ scale: prefersReducedMotion ? 1 : 0.95 }}
                className={`rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-50/50 p-3 dark:border-slate-700 dark:from-slate-800/40 dark:to-slate-800/20 ${social.color} transition-all duration-200 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-slate-900/30`}
                aria-label={social.name}
                title={social.name}
              >
                <span className="material-symbols-outlined text-xl">{social.icon}</span>
              </motion.button>
            ))}
          </motion.div>
        </motion.section>

        {/* Footer */}
        <motion.footer
          variants={itemVariants}
          className="border-t border-slate-200 pt-12 text-center dark:border-slate-800"
        >
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            © {currentYear} HabitFlow. All rights reserved.
          </p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Making habit tracking simple, intuitive, and powerful.
          </p>
        </motion.footer>
      </div>
    </motion.div>
  )
}
