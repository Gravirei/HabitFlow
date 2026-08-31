import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useProfileStore, getAvatarFallbackUrl } from '@/store/useProfileStore'

export function EditProfile() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)

  // Read persisted profile
  const profile = useProfileStore()

  // Local form state initialised from the store
  const [fullName, setFullName] = useState(profile.fullName)
  const [username, setUsername] = useState(profile.username)
  const [email, setEmail] = useState(profile.email)
  const [bio, setBio] = useState(profile.bio)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatarUrl)
  const [bannerPreview, setBannerPreview] = useState<string | null>(profile.bannerUrl)

  // Hydrate avatar & banner from IndexedDB on mount
  useEffect(() => {
    profile.loadImages()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Keep local state in sync if the store changes externally
  useEffect(() => {
    setFullName(profile.fullName)
    setUsername(profile.username)
    setEmail(profile.email)
    setBio(profile.bio)
    setAvatarPreview(profile.avatarUrl)
    setBannerPreview(profile.bannerUrl)
  }, [
    profile.fullName,
    profile.username,
    profile.email,
    profile.bio,
    profile.avatarUrl,
    profile.bannerUrl,
  ])

  const displayAvatar = avatarPreview || getAvatarFallbackUrl(fullName)

  const handleChangePhoto = () => {
    fileInputRef.current?.click()
  }

  /** Validate and read an image file, returning a base64 data URL via callback. */
  const processImageFile = (file: File, onSuccess: (base64: string) => void, maxSizeMB = 5) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`Image must be smaller than ${maxSizeMB}MB`)
      return
    }
    const reader = new FileReader()
    reader.onload = () => onSuccess(reader.result as string)
    reader.onerror = () => toast.error('Failed to read image file')
    reader.readAsDataURL(file)
  }

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    processImageFile(file, setAvatarPreview)
    e.target.value = ''
  }

  const handleRemovePhoto = () => {
    setAvatarPreview(null)
  }

  // ── Banner handlers ──────────────────────────────────────────────────
  const handleChangeBanner = () => {
    bannerInputRef.current?.click()
  }

  const handleBannerSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    processImageFile(file, setBannerPreview, 8)
    e.target.value = ''
  }

  const handleRemoveBanner = () => {
    setBannerPreview(null)
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
      bannerUrl: bannerPreview,
    })

    toast.success('Profile saved successfully!')
    navigate('/settings')
  }

  return (
    <div className="relative mx-auto flex h-screen w-full max-w-md flex-col overflow-hidden bg-slate-50 font-display transition-colors duration-300 dark:bg-slate-950 sm:max-w-lg md:max-w-xl lg:max-w-2xl">
      {/* Glassmorphism Header */}
      <div className="pt-safe sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between bg-white/70 px-4 pb-2 backdrop-blur-xl dark:bg-slate-950/70 sm:px-6">
        <button
          onClick={() => navigate('/today')}
          className="group flex size-10 items-center justify-center transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-slate-700 transition-transform group-hover:scale-110 dark:text-slate-200">
            arrow_back
          </span>
        </button>
        <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
          Edit Profile
        </h2>
        <div className="w-10"></div>
      </div>

      {/* Scrollable Content */}
      <div className="no-scrollbar flex flex-1 flex-col overflow-y-auto">
        {/* ── Cover Banner ──────────────────────────────────────────── */}
        <div className="relative h-36 w-full shrink-0 overflow-hidden sm:h-44 md:h-52 lg:h-60">
          {/* Banner image or default pattern */}
          {bannerPreview ? (
            <img
              src={bannerPreview}
              alt="Cover banner"
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            /* Default geometric dot-grid pattern */
            <div className="absolute inset-0 bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
              <div
                className="absolute inset-0 opacity-[0.35] dark:opacity-[0.18]"
                style={{
                  backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
                  backgroundSize: '18px 18px',
                  color: '#8b5cf6',
                }}
              />
              {/* Subtle diagonal accent lines */}
              <div
                className="absolute inset-0 opacity-[0.06] dark:opacity-[0.05]"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(135deg, transparent, transparent 40px, currentColor 40px, currentColor 41px)',
                  color: '#a78bfa',
                }}
              />
            </div>
          )}

          {/* Bottom fade into background */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-50 to-transparent dark:from-slate-950" />

          {/* Banner action buttons */}
          <div className="absolute right-3 top-3 flex items-center gap-2">
            {bannerPreview && (
              <button
                onClick={handleRemoveBanner}
                className="flex h-8 items-center gap-1 rounded-full bg-black/50 px-3 text-white backdrop-blur-md transition-all hover:bg-black/70 active:scale-95"
                aria-label="Remove cover photo"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
                <span className="hidden text-[11px] font-medium sm:inline">Remove</span>
              </button>
            )}
            <button
              onClick={handleChangeBanner}
              className="flex h-8 items-center gap-1 rounded-full bg-black/50 px-3 text-white backdrop-blur-md transition-all hover:bg-black/70 active:scale-95"
              aria-label="Change cover photo"
            >
              <span className="material-symbols-outlined text-[16px]">add_photo_alternate</span>
              <span className="hidden text-[11px] font-medium sm:inline">
                {bannerPreview ? 'Change' : 'Add Cover'}
              </span>
            </button>
          </div>

          {/* Hidden file input for banner upload */}
          <input
            ref={bannerInputRef}
            type="file"
            accept="image/*"
            onChange={handleBannerSelected}
            className="hidden"
            aria-hidden="true"
          />
        </div>

        {/* Hero Section with Profile Picture — overlaps the banner */}
        <div className="sm:-mt-18 relative -mt-16 flex flex-col items-center px-4 pb-6 sm:px-6 sm:pb-8">
          <div className="group relative">
            <div className="absolute -inset-0.5 rounded-full bg-gradient-to-tr from-violet-500 to-fuchsia-500 opacity-75 blur transition duration-500 group-hover:opacity-100"></div>
            <div className="relative h-28 w-28 rounded-full bg-white p-1 dark:bg-slate-950 sm:h-32 sm:w-32 md:h-36 md:w-36">
              <div
                className="h-full w-full rounded-full bg-cover bg-center bg-no-repeat shadow-inner"
                style={{
                  backgroundImage: `url('${displayAvatar}')`,
                }}
              />
            </div>
            <button
              onClick={handleChangePhoto}
              className="absolute bottom-1 right-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-violet-600 text-white shadow-lg transition-all hover:bg-violet-700 active:scale-95 dark:border-slate-950"
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
              className="mt-3 text-xs font-medium text-red-500 transition-colors hover:text-red-600"
            >
              Remove Photo
            </button>
          )}

          <div className="mt-4 text-center">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white sm:text-xl">
              {fullName}
            </h3>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">@{username}</p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="flex flex-col gap-5 px-4 pb-32 sm:gap-6 sm:px-6 md:px-8">
          {/* Full Name */}
          <div className="group">
            <label className="mb-2 ml-1 block text-xs font-bold uppercase tracking-wider text-slate-500 transition-colors group-focus-within:text-violet-600 dark:text-slate-400 dark:group-focus-within:text-violet-400">
              Full Name
            </label>
            <div className="relative">
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-2xl border-0 bg-white px-4 py-3.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 transition-all placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-violet-500 dark:bg-slate-900 dark:text-white dark:ring-slate-800 sm:px-5 sm:py-4 sm:text-base"
                placeholder="Enter your full name"
              />
              <span className="material-symbols-outlined pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[20px] text-slate-400 sm:text-[24px]">
                person
              </span>
            </div>
          </div>

          {/* Username */}
          <div className="group">
            <label className="mb-2 ml-1 block text-xs font-bold uppercase tracking-wider text-slate-500 transition-colors group-focus-within:text-violet-600 dark:text-slate-400 dark:group-focus-within:text-violet-400">
              Username
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-2xl border-0 bg-white px-4 py-3.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 transition-all placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-violet-500 dark:bg-slate-900 dark:text-white dark:ring-slate-800 sm:px-5 sm:py-4 sm:text-base"
                placeholder="Choose a username"
              />
              <span className="material-symbols-outlined pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[20px] text-slate-400 sm:text-[24px]">
                alternate_email
              </span>
            </div>
          </div>

          {/* Email */}
          <div className="group">
            <label className="mb-2 ml-1 block text-xs font-bold uppercase tracking-wider text-slate-500 transition-colors group-focus-within:text-violet-600 dark:text-slate-400 dark:group-focus-within:text-violet-400">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border-0 bg-white px-4 py-3.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 transition-all placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-violet-500 dark:bg-slate-900 dark:text-white dark:ring-slate-800 sm:px-5 sm:py-4 sm:text-base"
                placeholder="Enter your email"
              />
              <span className="material-symbols-outlined pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[20px] text-slate-400 sm:text-[24px]">
                mail
              </span>
            </div>
          </div>

          {/* Bio */}
          <div className="group">
            <div className="mb-2 ml-1 mr-1 flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 transition-colors group-focus-within:text-violet-600 dark:text-slate-400 dark:group-focus-within:text-violet-400">
                Bio
              </label>
              <span
                className={`text-xs font-medium transition-colors ${
                  bio.length >= 50
                    ? 'text-red-500'
                    : bio.length >= 40
                      ? 'text-amber-500'
                      : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {bio.length}/50
              </span>
            </div>
            <textarea
              value={bio}
              maxLength={50}
              onChange={(e) => setBio(e.target.value)}
              className={`min-h-[100px] w-full resize-none rounded-2xl border-0 bg-white px-4 py-3.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset transition-all placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-violet-500 dark:bg-slate-900 dark:text-white sm:min-h-[120px] sm:px-5 sm:py-4 sm:text-base ${
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
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent p-4 pt-16 dark:from-slate-950 dark:via-slate-950 sm:p-6 sm:pt-20">
        <button
          onClick={handleSave}
          className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-violet-600 p-3.5 font-bold text-white shadow-xl shadow-violet-500/30 transition-all hover:bg-violet-700 hover:shadow-violet-500/50 active:scale-[0.98] sm:p-4"
        >
          <div className="absolute inset-0 z-10 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]"></div>
          <span className="relative z-20 text-sm sm:text-base">Save Changes</span>
          <span className="material-symbols-outlined relative z-20 text-[18px] sm:text-[20px]">
            check
          </span>
        </button>
      </div>
    </div>
  )
}
