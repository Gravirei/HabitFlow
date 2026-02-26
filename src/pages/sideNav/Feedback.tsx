import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export function Feedback() {
  const navigate = useNavigate();
  const [feedbackType, setFeedbackType] = useState<'feature' | 'bug' | 'general' | null>(null);
  const [hoverRating, setHoverRating] = useState(0);
  const [rating, setRating] = useState(0);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const feedbackTypes = [
    { id: 'feature', icon: '💡', label: 'Feature Request' },
    { id: 'bug', icon: '🐛', label: 'Bug Report' },
    { id: 'general', icon: '💬', label: 'General' },
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!feedbackType) {
      newErrors.feedbackType = 'Please select a feedback type';
    }
    if (!subject.trim()) {
      newErrors.subject = 'Subject is required';
    }
    if (description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleScreenshotUpload = () => {
    toast.success('Screenshot attached!');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    // Simulate 1s submission delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Log feedback data
    const feedbackData = {
      type: feedbackType,
      rating,
      subject,
      description,
    };
    console.log('Feedback submitted:', feedbackData);

    setIsSubmitting(false);
    setSubmitted(true);

    // Reset form after 2 seconds
    setTimeout(() => {
      setFeedbackType(null);
      setRating(0);
      setSubject('');
      setDescription('');
      setSubmitted(false);
      setErrors({});
    }, 2000);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-white dark:bg-slate-950 text-slate-800 dark:text-white"
    >
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.05 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-8 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
        >
          <span className="material-symbols-outlined text-xl">arrow_back</span>
          <span className="text-sm font-medium">Back</span>
        </motion.button>

        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div
              key="form"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Header */}
              <motion.div variants={itemVariants} className="mb-10">
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-4xl">📝</span>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 dark:from-teal-400 dark:to-emerald-400 bg-clip-text text-transparent">
                      Share Your Feedback
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                      Help us make HabitFlow better. Your insights matter!
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Main Form */}
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Feedback Type Selector */}
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-semibold mb-4 text-slate-700 dark:text-slate-300">
                    What type of feedback?
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {feedbackTypes.map((type) => (
                      <motion.button
                        key={type.id}
                        type="button"
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setFeedbackType(type.id as 'feature' | 'bug' | 'general');
                          setErrors({ ...errors, feedbackType: '' });
                        }}
                        className={`p-4 rounded-2xl border-2 transition-all duration-200 min-h-[120px] flex flex-col items-center justify-center gap-2 ${
                          feedbackType === type.id
                            ? 'border-teal-500 bg-teal-500/10 dark:bg-teal-500/10 shadow-lg shadow-teal-500/20'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md'
                        }`}
                      >
                        <span className="text-3xl">{type.icon}</span>
                        <span className="text-sm font-semibold text-center">{type.label}</span>
                      </motion.button>
                    ))}
                  </div>
                  {errors.feedbackType && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 mt-2 text-red-500 text-xs"
                    >
                      <span className="material-symbols-outlined text-sm">error</span>
                      {errors.feedbackType}
                    </motion.div>
                  )}
                </motion.div>

                {/* Rating Section */}
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-semibold mb-4 text-slate-700 dark:text-slate-300">
                    How would you rate your experience?
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <motion.button
                        key={star}
                        type="button"
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                        className="transition-transform"
                      >
                        <motion.span
                          animate={{ scale: hoverRating >= star ? 1.2 : 1 }}
                          transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                          className={`material-symbols-outlined text-4xl transition-colors ${
                            (hoverRating || rating) >= star
                              ? 'text-amber-400 fill-current'
                              : 'text-slate-300 dark:text-slate-700'
                          }`}
                        >
                          star
                        </motion.span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

                {/* Subject Input */}
                <motion.div variants={itemVariants}>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300"
                  >
                    Subject
                  </label>
                  <motion.input
                    type="text"
                    id="subject"
                    value={subject}
                    onChange={(e) => {
                      setSubject(e.target.value);
                      if (e.target.value.trim()) {
                        setErrors({ ...errors, subject: '' });
                      }
                    }}
                    placeholder="What is your feedback about?"
                    aria-required="true"
                    className={`w-full px-4 py-3 rounded-xl border-2 bg-white dark:bg-slate-900/50 outline-none transition-all duration-200 ${
                      errors.subject
                        ? 'border-red-500 focus:ring-2 focus:ring-red-500/20'
                        : 'border-slate-200 dark:border-slate-800 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20'
                    }`}
                    whileFocus={{ scale: 1.01 }}
                  />
                  {errors.subject && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 mt-2 text-red-500 text-xs"
                    >
                      <span className="material-symbols-outlined text-sm">error</span>
                      {errors.subject}
                    </motion.div>
                  )}
                </motion.div>

                {/* Description Textarea */}
                <motion.div variants={itemVariants}>
                  <label
                    htmlFor="description"
                    className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300"
                  >
                    Description
                  </label>
                  <div className="relative">
                    <motion.textarea
                      id="description"
                      value={description}
                      onChange={(e) => {
                        setDescription(e.target.value);
                        if (e.target.value.trim().length >= 10) {
                          setErrors({ ...errors, description: '' });
                        }
                      }}
                      placeholder="Please provide details about your feedback..."
                      rows={4}
                      aria-required="true"
                      className={`w-full px-4 py-3 rounded-xl border-2 bg-white dark:bg-slate-900/50 outline-none transition-all duration-200 resize-none ${
                        errors.description
                          ? 'border-red-500 focus:ring-2 focus:ring-red-500/20'
                          : 'border-slate-200 dark:border-slate-800 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20'
                      }`}
                      whileFocus={{ scale: 1.01 }}
                    />
                    <div className="absolute bottom-3 right-4 text-xs text-slate-400 dark:text-slate-500">
                      {description.length} / 500
                    </div>
                  </div>
                  {errors.description && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 mt-2 text-red-500 text-xs"
                    >
                      <span className="material-symbols-outlined text-sm">error</span>
                      {errors.description}
                    </motion.div>
                  )}
                </motion.div>

                {/* Screenshot Upload */}
                <motion.div variants={itemVariants}>
                  <motion.button
                    type="button"
                    onClick={handleScreenshotUpload}
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-teal-500 dark:hover:border-teal-500 hover:bg-teal-500/5 transition-all"
                  >
                    <span className="material-symbols-outlined text-xl">image</span>
                    <span className="text-sm font-medium">Add Screenshot</span>
                  </motion.button>
                </motion.div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                  whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                  variants={itemVariants}
                  className={`w-full py-3 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 min-h-[44px] ${
                    isSubmitting
                      ? 'bg-gradient-to-r from-teal-500 to-emerald-500 opacity-70 cursor-not-allowed'
                      : 'bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 shadow-lg shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-500/40'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="material-symbols-outlined"
                      >
                        refresh
                      </motion.span>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined">send</span>
                      <span>Send Feedback</span>
                    </>
                  )}
                </motion.button>
              </form>

              {/* Previous Feedback Section */}
              <motion.div
                variants={itemVariants}
                className="mt-14 pt-8 border-t border-slate-200 dark:border-slate-800"
              >
                <h2 className="text-lg font-semibold mb-4 text-slate-700 dark:text-slate-300">
                  Your Previous Feedback
                </h2>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="p-8 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-center"
                >
                  <span className="text-4xl mb-3 inline-block">📭</span>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    No previous feedback yet. Share your first thoughts!
                  </p>
                </motion.div>
              </motion.div>
            </motion.div>
          ) : (
            /* Success State */
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, type: 'spring', stiffness: 100, damping: 15 }}
              className="flex flex-col items-center justify-center py-16"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 100, damping: 15 }}
                className="relative mb-6"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 1 }}
                  className="w-20 h-20 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-5xl text-white">check_circle</span>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center"
              >
                <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-teal-600 to-emerald-600 dark:from-teal-400 dark:to-emerald-400 bg-clip-text text-transparent">
                  Thank You! 🎉
                </h2>
                <p className="text-slate-600 dark:text-slate-400 max-w-sm mb-8">
                  Your feedback has been received and will help us improve HabitFlow.
                </p>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(-1)}
                  className="px-8 py-3 rounded-xl bg-teal-500/10 border-2 border-teal-500 text-teal-600 dark:text-teal-400 font-semibold hover:bg-teal-500/20 transition-colors"
                >
                  Back to App
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
