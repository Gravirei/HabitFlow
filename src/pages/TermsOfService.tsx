import { useNavigate } from 'react-router-dom'

export function TermsOfService() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-white/20 dark:border-gray-700/50 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-white">description</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Terms of Service
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
                Welcome to <span className="font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">HabitFlow</span>! These Terms of Service ("Terms") govern your access to and use of HabitFlow's 
                mobile application, website, and services (collectively, the "Service"). By accessing or using the 
                Service, you agree to be bound by these Terms.
              </p>
            </div>
          </section>

          {/* 1. Acceptance of Terms */}
          <section className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            <div className="relative bg-gradient-to-br from-white to-indigo-50/50 dark:from-gray-800 dark:to-indigo-950/20 rounded-2xl p-8 border border-indigo-100/50 dark:border-indigo-900/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
                  <span className="material-symbols-outlined text-white text-2xl">check_circle</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">1. Acceptance of Terms</h2>
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg">
                By creating an account or using HabitFlow, you acknowledge that you have read, understood, and agree 
                to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, please do not 
                use our Service.
              </p>
            </div>
          </section>

          {/* 2. Eligibility */}
          <section className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            <div className="relative bg-gradient-to-br from-white to-purple-50/50 dark:from-gray-800 dark:to-purple-950/20 rounded-2xl p-8 border border-purple-100/50 dark:border-purple-900/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                  <span className="material-symbols-outlined text-white text-2xl">person</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">2. Eligibility</h2>
              </div>
              <div className="space-y-4">
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg">
                  You must be at least 13 years old to use HabitFlow. If you are under 18, you must have permission 
                  from a parent or guardian to use the Service.
                </p>
                <div className="bg-purple-50 dark:bg-purple-950/30 rounded-lg p-4 border border-purple-200 dark:border-purple-800/50">
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed flex items-center gap-2">
                    <span className="material-symbols-outlined text-purple-500">info</span>
                    By using the Service, you represent and warrant that you meet these eligibility requirements.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 3. User Accounts */}
          <section className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-rose-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            <div className="relative bg-gradient-to-br from-white to-pink-50/50 dark:from-gray-800 dark:to-pink-950/20 rounded-2xl p-8 border border-pink-100/50 dark:border-pink-900/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-pink-500/25">
                  <span className="material-symbols-outlined text-white text-2xl">account_circle</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">3. User Accounts</h2>
              </div>
              <div className="space-y-3">
                {[
                  'You are responsible for maintaining the confidentiality of your account credentials',
                  'You are responsible for all activities that occur under your account',
                  'You must provide accurate and complete information when creating your account',
                  'You must notify us immediately of any unauthorized use of your account',
                  'We reserve the right to suspend or terminate accounts that violate these Terms'
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3 bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 border border-pink-100/50 dark:border-pink-900/30">
                    <span className="material-symbols-outlined text-pink-500 mt-0.5">check_circle</span>
                    <span className="text-slate-700 dark:text-slate-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 4. Use of Service */}
          <section className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            <div className="relative bg-gradient-to-br from-white to-emerald-50/50 dark:from-gray-800 dark:to-emerald-950/20 rounded-2xl p-8 border border-emerald-100/50 dark:border-emerald-900/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
                  <span className="material-symbols-outlined text-white text-2xl">rocket_launch</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">4. Use of Service</h2>
              </div>
              
              <div className="space-y-6">
                <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-xl p-5 border border-emerald-200 dark:border-emerald-800/50">
                  <p className="text-slate-900 dark:text-white font-semibold mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-500">check</span>
                    You may use HabitFlow to:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {[
                      'Track and manage your habits',
                      'Set goals and monitor progress',
                      'Use timer and productivity features',
                      'Access insights and analytics about your habits'
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-emerald-500 text-sm">arrow_forward</span>
                        <span className="text-slate-700 dark:text-slate-300">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-red-50 dark:bg-red-950/30 rounded-xl p-5 border border-red-200 dark:border-red-800/50">
                  <p className="text-slate-900 dark:text-white font-semibold mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-red-500">block</span>
                    You may NOT:
                  </p>
                  <div className="space-y-2">
                    {[
                      'Use the Service for any illegal or unauthorized purpose',
                      'Violate any laws in your jurisdiction',
                      'Infringe on the rights of others',
                      'Transmit any viruses, malware, or harmful code',
                      'Attempt to gain unauthorized access to our systems',
                      'Reverse engineer or copy any features or functionality',
                      'Use automated systems to access the Service without permission'
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-red-500 text-sm mt-0.5">close</span>
                        <span className="text-slate-700 dark:text-slate-300">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 5. User Content */}
          <section className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            <div className="relative bg-gradient-to-br from-white to-cyan-50/50 dark:from-gray-800 dark:to-cyan-950/20 rounded-2xl p-8 border border-cyan-100/50 dark:border-cyan-900/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/25">
                  <span className="material-symbols-outlined text-white text-2xl">folder</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">5. User Content</h2>
              </div>
              <div className="space-y-4">
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg">
                  You retain all rights to the content you create using HabitFlow (habit data, notes, goals, etc.). 
                  By using our Service, you grant us a limited license to store, process, and display your content 
                  solely for the purpose of providing the Service to you.
                </p>
                <div className="bg-cyan-50 dark:bg-cyan-950/30 rounded-lg p-4 border border-cyan-200 dark:border-cyan-800/50">
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed flex items-center gap-2">
                    <span className="material-symbols-outlined text-cyan-500">info</span>
                    We do not claim ownership of your content, and you may delete it at any time through your account settings.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 6. Premium Features */}
          <section className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            <div className="relative bg-gradient-to-br from-white to-violet-50/50 dark:from-gray-800 dark:to-violet-950/20 rounded-2xl p-8 border border-violet-100/50 dark:border-violet-900/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/25">
                  <span className="material-symbols-outlined text-white text-2xl">diamond</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">6. Premium Features</h2>
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                HabitFlow offers premium features through in-app purchases or subscriptions. Payment terms include:
              </p>
              <div className="space-y-3">
                {[
                  'Prices are displayed clearly before purchase',
                  'Subscriptions auto-renew unless cancelled',
                  'Refunds are subject to our refund policy and app store policies',
                  'We reserve the right to modify pricing with notice'
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3 bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 border border-violet-100/50 dark:border-violet-900/30">
                    <span className="material-symbols-outlined text-violet-500 mt-0.5">monetization_on</span>
                    <span className="text-slate-700 dark:text-slate-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 7. Intellectual Property */}
          <section className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            <div className="relative bg-gradient-to-br from-white to-amber-50/50 dark:from-gray-800 dark:to-amber-950/20 rounded-2xl p-8 border border-amber-100/50 dark:border-amber-900/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/25">
                  <span className="material-symbols-outlined text-white text-2xl">copyright</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">7. Intellectual Property</h2>
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg">
                HabitFlow and its original content, features, and functionality are owned by HabitFlow and are 
                protected by international copyright, trademark, patent, trade secret, and other intellectual 
                property laws.
              </p>
            </div>
          </section>

          {/* 8. Termination */}
          <section className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-rose-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            <div className="relative bg-gradient-to-br from-white to-red-50/50 dark:from-gray-800 dark:to-red-950/20 rounded-2xl p-8 border border-red-100/50 dark:border-red-900/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/25">
                  <span className="material-symbols-outlined text-white text-2xl">cancel</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">8. Termination</h2>
              </div>
              <div className="space-y-4">
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg">
                  We may terminate or suspend your account and access to the Service immediately, without prior 
                  notice, for any reason, including if you breach these Terms.
                </p>
                <div className="bg-red-50 dark:bg-red-950/30 rounded-lg p-4 border border-red-200 dark:border-red-800/50">
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed flex items-center gap-2">
                    <span className="material-symbols-outlined text-red-500">info</span>
                    You may delete your account at any time through the app settings. Upon termination, your right 
                    to use the Service will immediately cease.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 9. Disclaimer of Warranties */}
          <section className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-slate-500 to-gray-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            <div className="relative bg-gradient-to-br from-white to-slate-50/50 dark:from-gray-800 dark:to-slate-950/20 rounded-2xl p-8 border border-slate-100/50 dark:border-slate-900/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-slate-500 to-gray-600 rounded-xl flex items-center justify-center shadow-lg shadow-slate-500/25">
                  <span className="material-symbols-outlined text-white text-2xl">warning</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">9. Disclaimer of Warranties</h2>
              </div>
              <div className="bg-slate-100 dark:bg-slate-900/50 rounded-lg p-5 border border-slate-200 dark:border-slate-800/50">
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS 
                  OR IMPLIED. WE DO NOT GUARANTEE THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.
                </p>
              </div>
            </div>
          </section>

          {/* 10. Limitation of Liability */}
          <section className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            <div className="relative bg-gradient-to-br from-white to-orange-50/50 dark:from-gray-800 dark:to-orange-950/20 rounded-2xl p-8 border border-orange-100/50 dark:border-orange-900/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/25">
                  <span className="material-symbols-outlined text-white text-2xl">gavel</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">10. Limitation of Liability</h2>
              </div>
              <div className="bg-orange-100 dark:bg-orange-900/30 rounded-lg p-5 border border-orange-200 dark:border-orange-800/50">
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, HABITFLOW SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, 
                  SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED 
                  DIRECTLY OR INDIRECTLY.
                </p>
              </div>
            </div>
          </section>

          {/* 11. Changes to Terms */}
          <section className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-sky-500 to-blue-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            <div className="relative bg-gradient-to-br from-white to-sky-50/50 dark:from-gray-800 dark:to-sky-950/20 rounded-2xl p-8 border border-sky-100/50 dark:border-sky-900/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-sky-500/25">
                  <span className="material-symbols-outlined text-white text-2xl">update</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">11. Changes to Terms</h2>
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg">
                We reserve the right to modify these Terms at any time. We will notify users of any material 
                changes via email or through the Service. Your continued use of the Service after such modifications 
                constitutes acceptance of the updated Terms.
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
                If you have any questions about these Terms, please contact us:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { icon: 'email', title: 'Email', value: 'support@habitflow.com' },
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
        </div>
      </main>
    </div>
  )
}
