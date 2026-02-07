import { useNavigate, useParams } from 'react-router-dom'

// Wave 1 placeholder; Wave 2 will implement full detail UI.
export function CategoryDetail() {
  const navigate = useNavigate()
  const { categoryId } = useParams()

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-white p-4">
      <header className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => navigate('/categories')}
          className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold">Category</h1>
      </header>

      <p className="text-sm text-slate-600 dark:text-slate-300">
        Category ID: <span className="font-mono">{categoryId}</span>
      </p>
    </div>
  )
}
