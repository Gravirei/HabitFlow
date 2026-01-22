import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export function EditProfile() {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('Alex Doe')
  const [username, setUsername] = useState('alex.doe')
  const [email, setEmail] = useState('alex.doe@example.com')
  const [bio, setBio] = useState('')

  const handleSave = () => {
    // TODO: Implement save profile logic
    console.log('Saving profile:', { fullName, username, email, bio })
    navigate('/settings')
  }

  const handleChangePhoto = () => {
    // TODO: Implement photo upload
    console.log('Change photo clicked')
  }

  return (
    <div className="relative flex h-screen w-full max-w-md mx-auto flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden font-display transition-colors duration-300">
      {/* Glassmorphism Header */}
      <div className="sticky top-0 z-20 flex h-16 items-center justify-between px-4 pb-2 pt-safe shrink-0 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50">
        <button
          onClick={() => navigate('/')}
          className="group flex size-10 items-center justify-center rounded-full bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 shadow-sm border border-slate-200/50 dark:border-slate-700/50 transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-slate-700 dark:text-slate-200 group-hover:scale-110 transition-transform">arrow_back</span>
        </button>
        <h2 className="text-slate-900 dark:text-white text-lg font-bold tracking-tight">
          Edit Profile
        </h2>
        <div className="w-10"></div>
      </div>

      {/* Scrollable Content */}
      <div className="flex flex-1 flex-col overflow-y-auto no-scrollbar">
        {/* Hero Section with Profile Picture */}
        <div className="relative flex flex-col items-center pt-8 pb-10 px-6">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-tr from-violet-500 to-fuchsia-500 rounded-full opacity-75 blur group-hover:opacity-100 transition duration-500"></div>
            <div className="relative h-32 w-32 rounded-full p-1 bg-white dark:bg-slate-950">
              <div
                className="h-full w-full rounded-full bg-cover bg-center bg-no-repeat shadow-inner"
                style={{
                  backgroundImage: `url('https://ui-avatars.com/api/?name=Alex+Doe&size=256&background=13eca4&color=fff&bold=true')`
                }}
              />
            </div>
            <button
              onClick={handleChangePhoto}
              className="absolute bottom-1 right-1 flex h-9 w-9 items-center justify-center rounded-full bg-violet-600 text-white shadow-lg border-2 border-white dark:border-slate-950 hover:bg-violet-700 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">photo_camera</span>
            </button>
          </div>
          
          <div className="mt-4 text-center">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{fullName}</h3>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">@{username}</p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="flex flex-col gap-6 px-6 pb-32">
          {/* Full Name */}
          <div className="group">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 ml-1 group-focus-within:text-violet-600 dark:group-focus-within:text-violet-400 transition-colors">
              Full Name
            </label>
            <div className="relative">
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-2xl border-0 bg-white dark:bg-slate-900 py-4 px-5 text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-200 dark:ring-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-violet-500 transition-all"
                placeholder="Enter your full name"
              />
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">person</span>
            </div>
          </div>

          {/* Username */}
          <div className="group">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 ml-1 group-focus-within:text-violet-600 dark:group-focus-within:text-violet-400 transition-colors">
              Username
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-2xl border-0 bg-white dark:bg-slate-900 py-4 px-5 text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-200 dark:ring-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-violet-500 transition-all"
                placeholder="Choose a username"
              />
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">alternate_email</span>
            </div>
          </div>

          {/* Email */}
          <div className="group">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 ml-1 group-focus-within:text-violet-600 dark:group-focus-within:text-violet-400 transition-colors">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border-0 bg-white dark:bg-slate-900 py-4 px-5 text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-200 dark:ring-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-violet-500 transition-all"
                placeholder="Enter your email"
              />
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">mail</span>
            </div>
          </div>

          {/* Bio */}
          <div className="group">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 ml-1 group-focus-within:text-violet-600 dark:group-focus-within:text-violet-400 transition-colors">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full rounded-2xl border-0 bg-white dark:bg-slate-900 py-4 px-5 text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-200 dark:ring-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-violet-500 transition-all min-h-[120px] resize-none"
              placeholder="Tell us a bit about yourself..."
            />
          </div>
        </div>
      </div>

      {/* Floating Action Button Area */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent dark:from-slate-950 dark:via-slate-950 pt-20">
        <button
          onClick={handleSave}
          className="w-full group relative flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-violet-600 p-4 font-bold text-white shadow-xl shadow-violet-500/30 transition-all hover:bg-violet-700 hover:shadow-violet-500/50 active:scale-[0.98]"
        >
          <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-10"></div>
          <span className="relative z-20">Save Changes</span>
          <span className="material-symbols-outlined relative z-20 text-[20px]">check</span>
        </button>
      </div>
    </div>
  )
}
