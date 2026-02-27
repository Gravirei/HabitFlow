import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useProfileStore, getAvatarFallbackUrl } from '@/store/useProfileStore'

export function EditProfile() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Read persisted profile
  const profile = useProfileStore()

  // Local form state initialised from the store
  const [fullName, setFullName] = useState(profile.fullName)
  const [username, setUsername] = useState(profile.username)
  const [email, setEmail] = useState(profile.email)
  const [bio, setBio] = useState(profile.bio)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatarUrl)

  // Keep local state in sync if the store changes externally
  useEffect(() => {
    setFullName(profile.fullName)
    setUsername(profile.username)
    setEmail(profile.email)
    setBio(profile.bio)
    setAvatarPreview(profile.avatarUrl)
  }, [profile.fullName, profile.username, profile.email, profile.bio, profile.avatarUrl])

  const displayAvatar = avatarPreview || getAvatarFallbackUrl(fullName)

  const handleChangePhoto = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5MB')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result as string
      setAvatarPreview(base64)
    }
    reader.onerror = () => {
      toast.error('Failed to read image file')
    }
    reader.readAsDataURL(file)

    // Reset the input so the same file can be re-selected
    e.target.value = ''
  }

  const handleRemovePhoto = () => {
    setAvatarPreview(null)
  }

  const handleSave = () => {
    if (!fullName.trim()) {
      toast.error('Full name is required')
      return
    }
    if (!username.trim()) {
      toast.error('Username is required')
      return
    }

    profile.updateProfile({
      fullName: fullName.trim(),
      username: username.trim(),
      email: email.trim(),
      bio: bio.trim(),
      avatarUrl: avatarPreview,
    })

    toast.success('Profile saved successfully!')
    navigate('/settings')
  }

  return (
    <div className="relative flex h-screen w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden font-display transition-colors duration-300">
      {/* Glassmorphism Header */}
      <div className="sticky top-0 z-20 flex h-16 items-center justify-between px-4 sm:px-6 pb-2 pt-safe shrink-0 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl">
        <button
          onClick={() => navigate('/')}
          className="group flex size-10 items-center justify-center transition-all active:scale-95"
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
        <div className="relative flex flex-col items-center pt-6 sm:pt-8 pb-8 sm:pb-10 px-4 sm:px-6">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-tr from-violet-500 to-fuchsia-500 rounded-full opacity-75 blur group-hover:opacity-100 transition duration-500"></div>
            <div className="relative h-28 w-28 sm:h-32 sm:w-32 md:h-36 md:w-36 rounded-full p-1 bg-white dark:bg-slate-950">
              <div
                className="h-full w-full rounded-full bg-cover bg-center bg-no-repeat shadow-inner"
                style={{
                  backgroundImage: `url('${displayAvatar}')`
                }}
              />
            </div>
            <button
              onClick={handleChangePhoto}
              className="absolute bottom-1 right-1 flex h-9 w-9 items-center justify-center rounded-full bg-violet-600 text-white shadow-lg border-2 border-white dark:border-slate-950 hover:bg-violet-700 active:scale-95 transition-all"
              aria-label="Change profile photo"
            >
              <span className="material-symbols-outlined text-[18px]">photo_camera</span>
            </button>
          </div>
          
          {/* Hidden file input for photo upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelected}
            className="hidden"
            aria-hidden="true"
          />

          {/* Remove photo button — only when a custom photo is set */}
          {avatarPreview && (
            <button
              onClick={handleRemovePhoto}
              className="mt-3 text-xs font-medium text-red-500 hover:text-red-600 transition-colors"
            >
              Remove Photo
            </button>
          )}
          
          <div className="mt-4 text-center">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">{fullName}</h3>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">@{username}</p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="flex flex-col gap-5 sm:gap-6 px-4 sm:px-6 md:px-8 pb-32">
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
                className="w-full rounded-2xl border-0 bg-white dark:bg-slate-900 py-3.5 sm:py-4 px-4 sm:px-5 text-sm sm:text-base text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-200 dark:ring-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-violet-500 transition-all"
                placeholder="Enter your full name"
              />
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[20px] sm:text-[24px]">person</span>
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
                className="w-full rounded-2xl border-0 bg-white dark:bg-slate-900 py-3.5 sm:py-4 px-4 sm:px-5 text-sm sm:text-base text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-200 dark:ring-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-violet-500 transition-all"
                placeholder="Choose a username"
              />
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[20px] sm:text-[24px]">alternate_email</span>
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
                className="w-full rounded-2xl border-0 bg-white dark:bg-slate-900 py-3.5 sm:py-4 px-4 sm:px-5 text-sm sm:text-base text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-200 dark:ring-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-violet-500 transition-all"
                placeholder="Enter your email"
              />
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[20px] sm:text-[24px]">mail</span>
            </div>
          </div>

          {/* Bio */}
          <div className="group">
            <div className="flex items-center justify-between mb-2 ml-1 mr-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 group-focus-within:text-violet-600 dark:group-focus-within:text-violet-400 transition-colors">
                Bio
              </label>
              <span className={`text-xs font-medium transition-colors ${
                bio.length >= 50
                  ? 'text-red-500'
                  : bio.length >= 40
                    ? 'text-amber-500'
                    : 'text-slate-400 dark:text-slate-500'
              }`}>
                {bio.length}/50
              </span>
            </div>
            <textarea
              value={bio}
              maxLength={50}
              onChange={(e) => setBio(e.target.value)}
              className={`w-full rounded-2xl border-0 bg-white dark:bg-slate-900 py-3.5 sm:py-4 px-4 sm:px-5 text-sm sm:text-base text-slate-900 dark:text-white shadow-sm ring-1 ring-inset placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-violet-500 transition-all min-h-[100px] sm:min-h-[120px] resize-none ${
                bio.length >= 50
                  ? 'ring-red-300 dark:ring-red-700'
                  : 'ring-slate-200 dark:ring-slate-800'
              }`}
              placeholder="Tell us a bit about yourself..."
            />
          </div>
        </div>
      </div>

      {/* Floating Action Button Area */}
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent dark:from-slate-950 dark:via-slate-950 pt-16 sm:pt-20">
        <button
          onClick={handleSave}
          className="w-full group relative flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-violet-600 p-3.5 sm:p-4 font-bold text-white shadow-xl shadow-violet-500/30 transition-all hover:bg-violet-700 hover:shadow-violet-500/50 active:scale-[0.98]"
        >
          <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-10"></div>
          <span className="relative z-20 text-sm sm:text-base">Save Changes</span>
          <span className="material-symbols-outlined relative z-20 text-[18px] sm:text-[20px]">check</span>
        </button>
      </div>
    </div>
  )
}
