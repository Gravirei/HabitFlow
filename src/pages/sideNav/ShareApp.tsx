import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export function ShareApp() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  
  const appUrl = window.location.origin;

  // Handle copy to clipboard with animated success state
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(appUrl);
      setCopied(true);
      toast.success('Link copied! 📋');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };
  
  // Handle Web Share API
  const handleQuickShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'HabitFlow - Build Better Habits',
          text: 'Check out HabitFlow! A beautiful habit tracking app to build better habits and stay consistent.',
          url: appUrl,
        });
      } else {
        await navigator.clipboard.writeText(appUrl);
        toast.success('Link copied to clipboard!');
      }
    } catch (err) {
      // User cancelled or error occurred
    }
  };
  
  // Social media share functions
  const shareOnWhatsApp = () => {
    const text = `Check out HabitFlow! ${appUrl}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };
  
  const shareOnTwitter = () => {
    const text = 'Check out HabitFlow!';
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(appUrl)}`;
    window.open(url, '_blank');
  };
  
  const shareOnFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(appUrl)}`;
    window.open(url, '_blank');
  };
  
  const shareOnLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(appUrl)}`;
    window.open(url, '_blank');
  };
  
  const shareOnTelegram = () => {
    const text = 'Check out HabitFlow!';
    const url = `https://t.me/share/url?url=${encodeURIComponent(appUrl)}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };
  
  const shareViaEmail = () => {
    const subject = 'Check out HabitFlow';
    const body = `I've been using HabitFlow to build better habits. Check it out: ${appUrl}`;
    const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(url, '_blank');
  };

  // Animation variants with reduced motion support
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.05,
        delayChildren: prefersReducedMotion ? 0 : 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: prefersReducedMotion ? 0 : 0.3, ease: 'easeOut' },
    },
  };

  const buttonHoverVariants = {
    hover: { scale: prefersReducedMotion ? 1 : 1.02 },
    tap: { scale: prefersReducedMotion ? 1 : 0.98 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white dark:from-slate-950 dark:to-slate-900/50 text-teal-950 dark:text-slate-100">
      {/* Sticky Header with Back Button */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/50 backdrop-blur-md border-b border-teal-100 dark:border-slate-800 px-4 py-3 shadow-sm"
      >
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-teal-700 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-slate-800/50 active:bg-teal-100 dark:active:bg-slate-700/50 transition-colors duration-150"
          >
            <span className="material-symbols-outlined text-xl">arrow_back</span>
            <span className="font-medium text-sm">Back</span>
          </button>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-2xl mx-auto px-4 py-8 space-y-8"
      >
        {/* Header Section */}
        <motion.div variants={itemVariants} className="text-center space-y-3 pt-4">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 dark:from-teal-400 dark:to-emerald-400 bg-clip-text text-transparent">
            Share HabitFlow
          </h1>
          <p className="text-base md:text-lg text-teal-700/80 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
            Inspire others to build better habits and transform their lives
          </p>
        </motion.div>

        {/* QR Code Section - Visually Prominent Card */}
        <motion.div variants={itemVariants}>
          <div className="relative group">
            {/* Gradient border effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-teal-400 via-emerald-300 to-cyan-400 dark:from-teal-600 dark:via-emerald-600 dark:to-cyan-600 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl" />
            
            <div className="relative bg-white dark:bg-slate-900/60 border border-teal-200 dark:border-slate-700 rounded-2xl p-8 flex flex-col items-center space-y-6 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex flex-col items-center space-y-2">
                <span className="material-symbols-outlined text-teal-600 dark:text-teal-400 text-3xl">qr_code_2</span>
                <h2 className="text-xl font-semibold text-teal-950 dark:text-slate-100">Scan to Download HabitFlow</h2>
                <p className="text-sm text-teal-700/70 dark:text-slate-400">Use your phone camera to get started instantly</p>
              </div>
              
              {/* QR Code SVG with enhanced styling */}
              <motion.div 
                className="bg-white p-6 rounded-xl border-2 border-teal-100 dark:border-slate-700 shadow-md"
                whileHover={{ scale: prefersReducedMotion ? 1 : 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <svg
                  width="200"
                  height="200"
                  viewBox="0 0 200 200"
                  className="w-48 h-48"
                >
                  {/* Border */}
                  <rect x="0" y="0" width="200" height="200" fill="white" />
                  
                  {/* Position detection patterns (3 corners) */}
                  {/* Top-left */}
                  <rect x="10" y="10" width="40" height="40" fill="none" stroke="black" strokeWidth="2" />
                  <rect x="14" y="14" width="32" height="32" fill="none" stroke="black" strokeWidth="2" />
                  <rect x="18" y="18" width="24" height="24" fill="black" />
                  
                  {/* Top-right */}
                  <rect x="150" y="10" width="40" height="40" fill="none" stroke="black" strokeWidth="2" />
                  <rect x="154" y="14" width="32" height="32" fill="none" stroke="black" strokeWidth="2" />
                  <rect x="158" y="18" width="24" height="24" fill="black" />
                  
                  {/* Bottom-left */}
                  <rect x="10" y="150" width="40" height="40" fill="none" stroke="black" strokeWidth="2" />
                  <rect x="14" y="154" width="32" height="32" fill="none" stroke="black" strokeWidth="2" />
                  <rect x="18" y="158" width="24" height="24" fill="black" />
                  
                  {/* Data pattern - random-like grid */}
                  {Array.from({ length: 12 }).map((_, i) =>
                    Array.from({ length: 12 }).map((_, j) => {
                      const x = 60 + i * 8;
                      const y = 60 + j * 8;
                      const isBlack = (i + j + Math.floor(i * j / 3)) % 2 === 0;
                      
                      return isBlack ? (
                        <rect
                          key={`${i}-${j}`}
                          x={x}
                          y={y}
                          width="6"
                          height="6"
                          fill="black"
                        />
                      ) : null;
                    })
                  )}
                </svg>
              </motion.div>

              {/* URL Display */}
              <div className="w-full pt-2 border-t border-teal-100 dark:border-slate-700">
                <p className="text-xs text-teal-600/70 dark:text-slate-400 break-all text-center font-mono">
                  {appUrl}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Share Button - Large & Prominent */}
        <motion.div variants={itemVariants}>
          <motion.button
            onClick={handleQuickShare}
            variants={buttonHoverVariants}
            whileHover="hover"
            whileTap="tap"
            className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 dark:from-teal-600 dark:to-emerald-600 dark:hover:from-teal-500 dark:hover:to-emerald-500 text-white font-semibold py-5 rounded-2xl flex items-center justify-center gap-3 transition-all duration-200 shadow-lg hover:shadow-xl active:shadow-md"
          >
            <span className="material-symbols-outlined text-2xl">share</span>
            <span className="text-lg">Quick Share</span>
          </motion.button>
        </motion.div>

        {/* Copy Link Section - Animated Success State */}
        <motion.div variants={itemVariants}>
          <div className="bg-white dark:bg-slate-900/60 border border-teal-200 dark:border-slate-700 rounded-2xl p-6 space-y-4 backdrop-blur-sm shadow-md">
            <h3 className="text-lg font-semibold text-teal-950 dark:text-slate-100">Copy Shareable Link</h3>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={appUrl}
                className="flex-1 px-4 py-3 bg-teal-50 dark:bg-slate-800/50 border border-teal-200 dark:border-slate-700 rounded-xl text-sm text-teal-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
              />
              <motion.button
                onClick={handleCopyLink}
                variants={buttonHoverVariants}
                whileHover="hover"
                whileTap="tap"
                className={`min-h-11 px-6 py-3 font-semibold rounded-xl flex items-center gap-2 transition-all duration-200 whitespace-nowrap ${
                  copied
                    ? 'bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white'
                    : 'bg-teal-500 hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700 text-white'
                } shadow-md hover:shadow-lg`}
              >
                <motion.span 
                  className="material-symbols-outlined text-lg"
                  key={copied ? 'check' : 'copy'}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {copied ? 'check_circle' : 'content_copy'}
                </motion.span>
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Social Media Share Buttons - 3-column Grid */}
        <motion.div variants={itemVariants}>
          <h3 className="text-lg font-semibold text-teal-950 dark:text-slate-100 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-teal-600 dark:text-teal-400">favorite</span>
            Share on Social Media
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {/* WhatsApp */}
            <motion.button
              onClick={shareOnWhatsApp}
              variants={buttonHoverVariants}
              whileHover="hover"
              whileTap="tap"
              className="min-h-20 bg-gradient-to-br from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 dark:from-emerald-600 dark:to-green-700 dark:hover:from-emerald-500 dark:hover:to-green-600 text-white font-semibold py-3 rounded-xl flex flex-col items-center justify-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <span className="material-symbols-outlined text-2xl">chat</span>
              <span className="text-xs font-medium">WhatsApp</span>
            </motion.button>

            {/* Twitter/X */}
            <motion.button
              onClick={shareOnTwitter}
              variants={buttonHoverVariants}
              whileHover="hover"
              whileTap="tap"
              className="min-h-20 bg-black dark:bg-slate-800 hover:bg-slate-900 dark:hover:bg-slate-700 text-white font-semibold py-3 rounded-xl flex flex-col items-center justify-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <span className="material-symbols-outlined text-2xl">forum</span>
              <span className="text-xs font-medium">Twitter</span>
            </motion.button>

            {/* Facebook */}
            <motion.button
              onClick={shareOnFacebook}
              variants={buttonHoverVariants}
              whileHover="hover"
              whileTap="tap"
              className="min-h-20 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-700 dark:to-blue-800 dark:hover:from-blue-600 dark:hover:to-blue-700 text-white font-semibold py-3 rounded-xl flex flex-col items-center justify-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <span className="material-symbols-outlined text-2xl">people</span>
              <span className="text-xs font-medium">Facebook</span>
            </motion.button>

            {/* LinkedIn */}
            <motion.button
              onClick={shareOnLinkedIn}
              variants={buttonHoverVariants}
              whileHover="hover"
              whileTap="tap"
              className="min-h-20 bg-gradient-to-br from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 dark:from-sky-700 dark:to-blue-800 dark:hover:from-sky-600 dark:hover:to-blue-700 text-white font-semibold py-3 rounded-xl flex flex-col items-center justify-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <span className="material-symbols-outlined text-2xl">work</span>
              <span className="text-xs font-medium">LinkedIn</span>
            </motion.button>

            {/* Telegram */}
            <motion.button
              onClick={shareOnTelegram}
              variants={buttonHoverVariants}
              whileHover="hover"
              whileTap="tap"
              className="min-h-20 bg-gradient-to-br from-cyan-500 to-sky-600 hover:from-cyan-600 hover:to-sky-700 dark:from-cyan-600 dark:to-sky-700 dark:hover:from-cyan-500 dark:hover:to-sky-600 text-white font-semibold py-3 rounded-xl flex flex-col items-center justify-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <span className="material-symbols-outlined text-2xl">send</span>
              <span className="text-xs font-medium">Telegram</span>
            </motion.button>

            {/* Email */}
            <motion.button
              onClick={shareViaEmail}
              variants={buttonHoverVariants}
              whileHover="hover"
              whileTap="tap"
              className="min-h-20 bg-gradient-to-br from-slate-500 to-slate-700 hover:from-slate-600 hover:to-slate-800 dark:from-slate-700 dark:to-slate-800 dark:hover:from-slate-600 dark:hover:to-slate-700 text-white font-semibold py-3 rounded-xl flex flex-col items-center justify-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <span className="material-symbols-outlined text-2xl">mail</span>
              <span className="text-xs font-medium">Email</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Invite Stats Card */}
        <motion.div
          variants={itemVariants}
          className="relative group"
        >
          {/* Subtle gradient border */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-300 to-teal-300 dark:from-orange-600 dark:to-teal-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
          
          <div className="relative bg-white dark:bg-slate-900/60 border border-teal-200 dark:border-slate-700 rounded-2xl p-6 space-y-4 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30">
                <span className="material-symbols-outlined text-orange-600 dark:text-orange-400 text-2xl">celebration</span>
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="text-lg font-semibold text-teal-950 dark:text-slate-100">Invite Stats</h3>
                <div className="space-y-1">
                  <p className="text-sm text-teal-700 dark:text-slate-300">
                    You've shared HabitFlow with <span className="font-bold text-teal-900 dark:text-white">0 friends</span>
                  </p>
                  <p className="text-sm text-teal-600/80 dark:text-slate-400">
                    Share more to unlock exclusive rewards!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
