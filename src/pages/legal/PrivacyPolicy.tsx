import { useNavigate } from 'react-router-dom'

export function PrivacyPolicy() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-white/20 dark:border-gray-700/50 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-white">shield</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Privacy Policy
            </h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-xl shadow-indigo-500/10 border border-white/50 dark:border-gray-700/50 p-10 space-y-8">
          {/* Introduction */}
          <section className="relative">
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-2xl"></div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-500">event</span>
              Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 rounded-2xl p-6 border border-indigo-100 dark:border-indigo-900/50">
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg">
                At <span className="font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">HabitFlow</span>, we take your privacy seriously. This Privacy Policy explains how we collect, use,
                disclose, and safeguard your information when you use our mobile application and services.
                Please read this policy carefully.
              </p>
            </div>
          </section>

          {/* 1. Information We Collect */}
          <section className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            <div className="relative bg-gradient-to-br from-white to-indigo-50/50 dark:from-gray-800 dark:to-indigo-950/20 rounded-2xl p-8 border border-indigo-100/50 dark:border-indigo-900/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
                  <span className="material-symbols-outlined text-white text-2xl">database</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">1. Information We Collect</h2>
              </div>

              <div className="space-y-6">
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-5 border border-indigo-100/50 dark:border-indigo-900/30">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                      <span className="material-symbols-outlined text-white text-sm">edit</span>
                    </span>
                    1.1 Information You Provide
                  </h3>
                  <ul className="space-y-3 text-slate-700 dark:text-slate-300">
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-indigo-500 mt-0.5">check_circle</span>
                      <span><strong className="text-slate-900 dark:text-white">Account Information:</strong> Email address, password, display name</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-indigo-500 mt-0.5">check_circle</span>
                      <span><strong className="text-slate-900 dark:text-white">Profile Information:</strong> Optional profile photo, preferences, settings</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-indigo-500 mt-0.5">check_circle</span>
                      <span><strong className="text-slate-900 dark:text-white">Habit Data:</strong> Habits you track, goals, progress, notes, and statistics</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-indigo-500 mt-0.5">check_circle</span>
                      <span><strong className="text-slate-900 dark:text-white">Timer Data:</strong> Timer sessions, durations, and activity logs</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-indigo-500 mt-0.5">check_circle</span>
                      <span><strong className="text-slate-900 dark:text-white">Communication:</strong> Messages you send to our support team</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-5 border border-indigo-100/50 dark:border-indigo-900/30">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <span className="material-symbols-outlined text-white text-sm">speed</span>
                    </span>
                    1.2 Information Collected Automatically
                  </h3>
                  <ul className="space-y-3 text-slate-700 dark:text-slate-300">
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-purple-500 mt-0.5">check_circle</span>
                      <span><strong className="text-slate-900 dark:text-white">Device Information:</strong> Device type, operating system, unique device identifiers</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-purple-500 mt-0.5">check_circle</span>
                      <span><strong className="text-slate-900 dark:text-white">Usage Data:</strong> Features used, screens viewed, time spent in app</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-purple-500 mt-0.5">check_circle</span>
                      <span><strong className="text-slate-900 dark:text-white">Log Data:</strong> IP address, browser type, timestamps, crash reports</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-purple-500 mt-0.5">check_circle</span>
                      <span><strong className="text-slate-900 dark:text-white">Analytics:</strong> App performance, user interactions, feature usage</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-5 border border-indigo-100/50 dark:border-indigo-900/30">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                      <span className="material-symbols-outlined text-white text-sm">link</span>
                    </span>
                    1.3 Information from Third Parties
                  </h3>
                  <ul className="space-y-3 text-slate-700 dark:text-slate-300">
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-orange-500 mt-0.5">check_circle</span>
                      <span><strong className="text-slate-900 dark:text-white">OAuth Providers:</strong> When you sign in with Google or Apple, we receive basic profile information</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-orange-500 mt-0.5">check_circle</span>
                      <span><strong className="text-slate-900 dark:text-white">Payment Processors:</strong> Transaction information (we don't store payment card details)</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* 2. How We Use Your Information */}
          <section className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            <div className="relative bg-gradient-to-br from-white to-purple-50/50 dark:from-gray-800 dark:to-purple-950/20 rounded-2xl p-8 border border-purple-100/50 dark:border-purple-900/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                  <span className="material-symbols-outlined text-white text-2xl">visibility</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">2. How We Use Your Information</h2>
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6 text-lg">
                We use the information we collect to:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  'Provide, maintain, and improve our Service',
                  'Create and manage your account',
                  'Process transactions and send related information',
                  'Send you notifications, reminders, and updates',
                  'Respond to your comments and questions',
                  'Analyze usage patterns to improve user experience',
                  'Detect, prevent, and address technical issues and fraud',
                  'Comply with legal obligations',
                  'Send marketing communications (with your consent)'
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3 bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 border border-purple-100/50 dark:border-purple-900/30">
                    <span className="material-symbols-outlined text-purple-500 mt-0.5">check</span>
                    <span className="text-slate-700 dark:text-slate-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 3. How We Share Your Information */}
          <section className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-rose-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            <div className="relative bg-gradient-to-br from-white to-pink-50/50 dark:from-gray-800 dark:to-pink-950/20 rounded-2xl p-8 border border-pink-100/50 dark:border-pink-900/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-pink-500/25">
                  <span className="material-symbols-outlined text-white text-2xl">share</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">3. How We Share Your Information</h2>
              </div>
              <div className="bg-rose-50 dark:bg-rose-950/30 rounded-xl p-4 mb-6 border border-rose-200 dark:border-rose-800/50">
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed flex items-center gap-2">
                  <span className="material-symbols-outlined text-rose-500">info</span>
                  <strong>We do not sell your personal information.</strong> We may share your information in the following circumstances:
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-5 border border-pink-100/50 dark:border-pink-900/30">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                      <span className="material-symbols-outlined text-white text-sm">groups</span>
                    </span>
                    3.1 Service Providers
                  </h3>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
                    We share information with third-party service providers who help us operate our Service:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {[
                      'Cloud hosting providers (e.g., Supabase)',
                      'Analytics services (e.g., Google Analytics)',
                      'Payment processors',
                      'Email service providers',
                      'Customer support tools'
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-pink-500 text-sm">arrow_forward</span>
                        <span className="text-slate-700 dark:text-slate-300">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-5 border border-pink-100/50 dark:border-pink-900/30">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
                      <span className="material-symbols-outlined text-white text-sm">gavel</span>
                    </span>
                    3.2 Legal Requirements
                  </h3>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    We may disclose your information if required by law or in response to valid requests by public authorities.
                  </p>
                </div>

                <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-5 border border-pink-100/50 dark:border-pink-900/30">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 bg-gradient-to-br from-purple-500 to-violet-500 rounded-lg flex items-center justify-center">
                      <span className="material-symbols-outlined text-white text-sm">sync_alt</span>
                    </span>
                    3.3 Business Transfers
                  </h3>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    If HabitFlow is involved in a merger, acquisition, or sale of assets, your information may be transferred.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 4. Data Security */}
          <section className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            <div className="relative bg-gradient-to-br from-white to-emerald-50/50 dark:from-gray-800 dark:to-emerald-950/20 rounded-2xl p-8 border border-emerald-100/50 dark:border-emerald-900/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
                  <span className="material-symbols-outlined text-white text-2xl">lock</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">4. Data Security</h2>
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                We implement appropriate technical and organizational measures to protect your information:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                {[
                  'Encryption of data in transit and at rest',
                  'Secure authentication and authorization',
                  'Regular security audits and updates',
                  'Limited access to personal information',
                  'Secure backup procedures'
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3 bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 border border-emerald-100/50 dark:border-emerald-900/30">
                    <span className="material-symbols-outlined text-emerald-500 mt-0.5">security</span>
                    <span className="text-slate-700 dark:text-slate-300">{item}</span>
                  </div>
                ))}
              </div>
              <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-4 border border-amber-200 dark:border-amber-800/50">
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-500">warning</span>
                  However, no method of transmission over the Internet is 100% secure. We cannot guarantee absolute security.
                </p>
              </div>
            </div>
          </section>

          {/* 5. Data Retention */}
          <section className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            <div className="relative bg-gradient-to-br from-white to-cyan-50/50 dark:from-gray-800 dark:to-cyan-950/20 rounded-2xl p-8 border border-cyan-100/50 dark:border-cyan-900/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/25">
                  <span className="material-symbols-outlined text-white text-2xl">schedule</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">5. Data Retention</h2>
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                We retain your information for as long as necessary to:
              </p>
              <div className="space-y-2 mb-4">
                {[
                  'Provide you with our Service',
                  'Comply with legal obligations',
                  'Resolve disputes and enforce agreements'
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-cyan-500">check_circle</span>
                    <span className="text-slate-700 dark:text-slate-300">{item}</span>
                  </div>
                ))}
              </div>
              <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 border border-blue-200 dark:border-blue-800/50">
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-500">info</span>
                  When you delete your account, we will delete or anonymize your personal information within 30 days,
                  except where we are required to retain it by law.
                </p>
              </div>
            </div>
          </section>

          {/* 6. Your Rights and Choices */}
          <section className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            <div className="relative bg-gradient-to-br from-white to-violet-50/50 dark:from-gray-800 dark:to-violet-950/20 rounded-2xl p-8 border border-violet-100/50 dark:border-violet-900/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/25">
                  <span className="material-symbols-outlined text-white text-2xl">verified_user</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">6. Your Rights and Choices</h2>
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                You have the following rights regarding your personal information:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                {[
                  { icon: 'search', title: 'Access', desc: 'Request a copy of your personal information' },
                  { icon: 'edit', title: 'Correction', desc: 'Update or correct inaccurate information' },
                  { icon: 'delete', title: 'Deletion', desc: 'Request deletion of your personal information' },
                  { icon: 'download', title: 'Export', desc: 'Download your data in a portable format' },
                  { icon: 'logout', title: 'Opt-out', desc: 'Unsubscribe from marketing communications' },
                  { icon: 'block', title: 'Withdraw Consent', desc: 'Withdraw consent for data processing' }
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3 bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 border border-violet-100/50 dark:border-violet-900/30">
                    <span className="material-symbols-outlined text-violet-500 mt-0.5">{item.icon}</span>
                    <div>
                      <strong className="text-slate-900 dark:text-white block">{item.title}:</strong>
                      <span className="text-slate-700 dark:text-slate-300 text-sm">{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-violet-50 dark:bg-violet-950/30 rounded-lg p-4 border border-violet-200 dark:border-violet-800/50">
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed flex items-center gap-2">
                  <span className="material-symbols-outlined text-violet-500">contact_support</span>
                  To exercise these rights, please contact us at <strong>privacy@habitflow.com</strong> or through your account settings.
                </p>
              </div>
            </div>
          </section>

          {/* 7. Children's Privacy */}
          <section className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            <div className="relative bg-gradient-to-br from-white to-amber-50/50 dark:from-gray-800 dark:to-amber-950/20 rounded-2xl p-8 border border-amber-100/50 dark:border-amber-900/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/25">
                  <span className="material-symbols-outlined text-white text-2xl">child_care</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">7. Children's Privacy</h2>
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg">
                HabitFlow is not intended for children under 13. We do not knowingly collect personal information
                from children under 13. If you are a parent or guardian and believe your child has provided us with
                personal information, please contact us so we can delete it.
              </p>
            </div>
          </section>

          {/* 8. International Data Transfers */}
          <section className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-sky-500 to-blue-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            <div className="relative bg-gradient-to-br from-white to-sky-50/50 dark:from-gray-800 dark:to-sky-950/20 rounded-2xl p-8 border border-sky-100/50 dark:border-sky-900/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-sky-500/25">
                  <span className="material-symbols-outlined text-white text-2xl">public</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">8. International Data Transfers</h2>
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg">
                Your information may be transferred to and processed in countries other than your country of residence.
                These countries may have different data protection laws. We take appropriate safeguards to ensure your
                information receives adequate protection.
              </p>
            </div>
          </section>

          {/* 9. Cookies and Tracking */}
          <section className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-fuchsia-500 to-pink-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            <div className="relative bg-gradient-to-br from-white to-fuchsia-50/50 dark:from-gray-800 dark:to-fuchsia-950/20 rounded-2xl p-8 border border-fuchsia-100/50 dark:border-fuchsia-900/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-fuchsia-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-fuchsia-500/25">
                  <span className="material-symbols-outlined text-white text-2xl">cookie</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">9. Cookies and Tracking Technologies</h2>
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                We use cookies and similar tracking technologies to:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                {[
                  'Maintain your session and remember your preferences',
                  'Understand how you use our Service',
                  'Improve performance and user experience',
                  'Provide personalized content'
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3 bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 border border-fuchsia-100/50 dark:border-fuchsia-900/30">
                    <span className="material-symbols-outlined text-fuchsia-500 mt-0.5">circle</span>
                    <span className="text-slate-700 dark:text-slate-300">{item}</span>
                  </div>
                ))}
              </div>
              <div className="bg-rose-50 dark:bg-rose-950/30 rounded-lg p-4 border border-rose-200 dark:border-rose-800/50">
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed flex items-center gap-2">
                  <span className="material-symbols-outlined text-rose-500">settings</span>
                  You can control cookies through your browser settings, but disabling them may affect functionality.
                </p>
              </div>
            </div>
          </section>

          {/* 10. Third-Party Links */}
          <section className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-slate-500 to-gray-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            <div className="relative bg-gradient-to-br from-white to-slate-50/50 dark:from-gray-800 dark:to-slate-950/20 rounded-2xl p-8 border border-slate-100/50 dark:border-slate-900/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-slate-500 to-gray-600 rounded-xl flex items-center justify-center shadow-lg shadow-slate-500/25">
                  <span className="material-symbols-outlined text-white text-2xl">link_off</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">10. Third-Party Links</h2>
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg">
                Our Service may contain links to third-party websites or services. We are not responsible for the
                privacy practices of these third parties. We encourage you to review their privacy policies.
              </p>
            </div>
          </section>

          {/* 11. Changes to Privacy Policy */}
          <section className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            <div className="relative bg-gradient-to-br from-white to-indigo-50/50 dark:from-gray-800 dark:to-indigo-950/20 rounded-2xl p-8 border border-indigo-100/50 dark:border-indigo-900/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
                  <span className="material-symbols-outlined text-white text-2xl">update</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">11. Changes to This Privacy Policy</h2>
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by
                posting the new policy on this page and updating the "Last Updated" date. We encourage you to review
                this Privacy Policy periodically.
              </p>
            </div>
          </section>

          {/* 12. Contact Us */}
          <section className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            <div className="relative bg-gradient-to-br from-white to-emerald-50/50 dark:from-gray-800 dark:to-emerald-950/20 rounded-2xl p-8 border border-emerald-100/50 dark:border-emerald-900/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
                  <span className="material-symbols-outlined text-white text-2xl">contact_mail</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">12. Contact Us</h2>
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                If you have any questions about this Privacy Policy or our privacy practices, please contact us:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { icon: 'email', title: 'Email', value: 'privacy@habitflow.com' },
                  { icon: 'support_agent', title: 'Support', value: 'support@habitflow.com' },
                  { icon: 'language', title: 'Website', value: 'www.habitflow.com' }
                ].map((item, index) => (
                  <div key={index} className="bg-white/70 dark:bg-gray-800/70 rounded-xl p-5 border border-emerald-100/50 dark:border-emerald-900/30 text-center">
                    <span className="material-symbols-outlined text-emerald-500 text-3xl mb-2 block">{item.icon}</span>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{item.title}</p>
                    <p className="text-slate-900 dark:text-white font-medium">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* GDPR Notice */}
          <section className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            <div className="relative bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-2xl p-8 border border-blue-200/50 dark:border-blue-800/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <span className="material-symbols-outlined text-white text-2xl">flag</span>
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                  Additional Information for EU/EEA Users (GDPR)
                </h2>
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                If you are located in the European Union or European Economic Area, you have additional rights under GDPR:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                {[
                  'Right to object to processing of your personal data',
                  'Right to data portability',
                  'Right to lodge a complaint with a supervisory authority',
                  'Right to restrict processing in certain circumstances'
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3 bg-white/70 dark:bg-gray-800/50 rounded-lg p-3 border border-blue-100/50 dark:border-blue-900/30">
                    <span className="material-symbols-outlined text-blue-600 mt-0.5">check</span>
                    <span className="text-slate-700 dark:text-slate-300">{item}</span>
                  </div>
                ))}
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 border border-blue-100/50 dark:border-blue-900/30">
                We process your data based on your consent, contractual necessity, legal obligations, or our legitimate interests.
              </p>
            </div>
          </section>

          {/* CCPA Notice */}
          <section className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            <div className="relative bg-gradient-to-br from-orange-50/50 to-red-50/50 dark:from-orange-950/30 dark:to-red-950/30 rounded-2xl p-8 border border-orange-200/50 dark:border-orange-800/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/25">
                  <span className="material-symbols-outlined text-white text-2xl">location_city</span>
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Additional Information for California Residents (CCPA)
                </h2>
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                California residents have specific rights under the California Consumer Privacy Act (CCPA):
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                {[
                  'Right to know what personal information is collected',
                  'Right to know if personal information is sold or disclosed',
                  'Right to say no to the sale of personal information',
                  'Right to access your personal information',
                  'Right to equal service and price, even if you exercise your privacy rights'
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3 bg-white/70 dark:bg-gray-800/50 rounded-lg p-3 border border-orange-100/50 dark:border-orange-900/30">
                    <span className="material-symbols-outlined text-orange-500 mt-0.5">check</span>
                    <span className="text-slate-700 dark:text-slate-300">{item}</span>
                  </div>
                ))}
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 border border-orange-100/50 dark:border-orange-900/30">
                We do not sell personal information. To exercise your CCPA rights, contact us at privacy@habitflow.com.
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
