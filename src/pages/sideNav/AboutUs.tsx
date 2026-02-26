import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function AboutUs() {
  const navigate = useNavigate();
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

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
  ];

  const techStack = [
    { name: 'React', color: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300' },
    { name: 'TypeScript', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
    { name: 'Supabase', color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' },
    { name: 'Tailwind CSS', color: 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300' },
  ];

  const socialLinks = [
    { name: 'Twitter', icon: 'share', color: 'hover:text-black dark:hover:text-white' },
    { name: 'GitHub', icon: 'code', color: 'hover:text-slate-700 dark:hover:text-slate-300' },
    { name: 'Website', icon: 'language', color: 'hover:text-teal-600 dark:hover:text-teal-400' },
  ];

  const getStaggerDelay = (index: number) => (prefersReducedMotion ? 0 : index * 0.05);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.06,
        delayChildren: prefersReducedMotion ? 0 : 0.15,
      },
    },
  };

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
  };

  const cardHoverVariants = {
    rest: { scale: 1, boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' },
    hover: {
      scale: prefersReducedMotion ? 1 : 1.02,
      boxShadow: prefersReducedMotion
        ? '0 1px 3px rgba(0, 0, 0, 0.1)'
        : '0 10px 25px rgba(13, 148, 136, 0.15)',
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.5 }}
      className="min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900 text-slate-800 dark:text-white"
    >
      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.5 }}
        onClick={() => navigate(-1)}
        className="fixed top-6 left-6 z-50 p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all duration-200 hover:shadow-sm"
        aria-label="Go back"
      >
        <span className="material-symbols-outlined text-2xl">arrow_back</span>
      </motion.button>

      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Hero Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative mb-20"
        >
          {/* Gradient background circle */}
          <div className="absolute -top-32 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-gradient-to-br from-teal-400/20 via-emerald-400/10 to-transparent rounded-full blur-3xl pointer-events-none" />

          <motion.div variants={itemVariants} className="relative text-center mb-8">
            {/* App Icon with gradient background */}
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-lg">
                <span className="material-symbols-outlined text-5xl text-white">favorite</span>
              </div>
            </div>

            <h1 className="text-6xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 dark:from-teal-400 dark:to-emerald-400 bg-clip-text text-transparent mb-2">
              HabitFlow
            </h1>

            {/* Version Badge */}
            <div className="inline-block mb-4">
              <span className="px-3 py-1 text-sm font-medium bg-gradient-to-r from-teal-100 to-emerald-100 dark:from-teal-900/40 dark:to-emerald-900/40 text-teal-700 dark:text-teal-300 rounded-full border border-teal-200 dark:border-teal-800">
                v1.0.0
              </span>
            </div>
          </motion.div>

          {/* Mission Tagline */}
          <motion.p
            variants={itemVariants}
            className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed"
          >
            Build better habits, transform your life. HabitFlow is your personal habit tracking companion, designed to help you achieve consistency and reach your goals one day at a time.
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
            className="text-4xl font-bold text-center mb-12 text-slate-900 dark:text-white"
          >
            Key Features
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-max">
            {/* Large cards - span 2 columns */}
            {features
              .filter((f) => f.size === 'large')
              .map((feature, index) => (
                <motion.div
                  key={`large-${index}`}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: getStaggerDelay(index) }}
                  whileHover="hover"
                  whileRest="rest"
                  variants={cardHoverVariants}
                  className="md:col-span-2 bg-gradient-to-br from-slate-50/80 to-teal-50/30 dark:from-slate-900/50 dark:to-teal-900/20 rounded-2xl border border-teal-200/50 dark:border-teal-800/30 p-8 cursor-pointer transition-all duration-200"
                >
                  <div className="flex items-start gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-400 flex items-center justify-center flex-shrink-0 shadow-md">
                      <span className="material-symbols-outlined text-2xl text-white">
                        {feature.icon}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">
                        {feature.title}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
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
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: getStaggerDelay(index + 2) }}
                  whileHover="hover"
                  whileRest="rest"
                  variants={cardHoverVariants}
                  className="bg-gradient-to-br from-slate-50/80 to-teal-50/30 dark:from-slate-900/50 dark:to-teal-900/20 rounded-2xl border border-teal-200/50 dark:border-teal-800/30 p-6 cursor-pointer transition-all duration-200"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center mb-3 shadow-sm">
                    <span className="material-symbols-outlined text-lg text-white">
                      {feature.icon}
                    </span>
                  </div>
                  <h4 className="text-lg font-semibold mb-1 text-slate-900 dark:text-white">
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
            variants={itemVariants}
            whileHover="hover"
            whileRest="rest"
            variants={cardHoverVariants}
            className="bg-gradient-to-br from-emerald-50/80 to-teal-50/40 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-3xl border border-emerald-200/50 dark:border-emerald-800/30 p-12 text-center max-w-2xl mx-auto cursor-pointer transition-all duration-200"
          >
            {/* Avatar Placeholder */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-400 via-emerald-400 to-teal-500 shadow-lg" />
            </div>

            <h3 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">
              Built with ❤️
            </h3>
            <p className="text-lg text-slate-700 dark:text-slate-200 mb-4">
              by the HabitFlow Team
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Dedicated to helping you build lasting habits and achieve your goals.
            </p>
            <button
              onClick={() => navigate('/contribute')}
              className="mt-6 px-5 py-2 text-sm font-medium text-teal-700 dark:text-teal-300 hover:text-teal-800 dark:hover:text-teal-200 underline underline-offset-2 transition-colors"
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
            className="text-3xl font-bold text-center mb-10 text-slate-900 dark:text-white"
          >
            Built With
          </motion.h2>

          <div className="flex flex-wrap gap-3 justify-center">
            {techStack.map((tech, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: getStaggerDelay(index) }}
                whileHover={{ scale: prefersReducedMotion ? 1 : 1.05 }}
                whileTap={{ scale: prefersReducedMotion ? 1 : 0.95 }}
                className={`px-5 py-2.5 rounded-full font-semibold text-sm border ${tech.color} border-current border-opacity-20 transition-all duration-200 cursor-pointer`}
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
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button
              onClick={() => navigate('/terms')}
              className="px-6 py-3 rounded-xl font-semibold text-slate-700 dark:text-slate-200 bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800/60 dark:to-slate-800/40 border border-slate-200 dark:border-slate-700 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-slate-900/30 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              Terms of Service
            </button>
            <button
              onClick={() => navigate('/privacy')}
              className="px-6 py-3 rounded-xl font-semibold text-slate-700 dark:text-slate-200 bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800/60 dark:to-slate-800/40 border border-slate-200 dark:border-slate-700 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-slate-900/30 transition-all duration-200 hover:scale-105 active:scale-95"
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
          <motion.div variants={itemVariants} className="flex gap-3 justify-center">
            {socialLinks.map((social, index) => (
              <motion.button
                key={index}
                initial="hidden"
                animate="visible"
                transition={{ delay: getStaggerDelay(index) }}
                whileHover={{ scale: prefersReducedMotion ? 1 : 1.1, y: -2 }}
                whileTap={{ scale: prefersReducedMotion ? 1 : 0.95 }}
                className={`p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-50 to-slate-50/50 dark:from-slate-800/40 dark:to-slate-800/20 ${social.color} transition-all duration-200 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-slate-900/30`}
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
          className="text-center pt-12 border-t border-slate-200 dark:border-slate-800"
        >
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            © {currentYear} HabitFlow. All rights reserved.
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Making habit tracking simple, intuitive, and powerful.
          </p>
        </motion.footer>
      </div>
    </motion.div>
  );
}
