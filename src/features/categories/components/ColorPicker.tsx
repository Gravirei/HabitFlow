import clsx from 'clsx'

export type CategoryColorToken =
  | 'primary'
  | 'blue'
  | 'emerald'
  | 'purple'
  | 'yellow'
  | 'orange'
  | 'indigo'
  | 'pink'
  | 'red'
  | 'teal'
  | 'slate'
  | 'sky'

export interface ColorPickerProps {
  value: CategoryColorToken
  onChange: (color: CategoryColorToken) => void
  label?: string
  className?: string
}

const COLORS: ReadonlyArray<{ token: CategoryColorToken; swatchClass: string; ringClass: string }> = [
  { token: 'primary', swatchClass: 'bg-primary', ringClass: 'ring-primary/40' },
  { token: 'blue', swatchClass: 'bg-blue-500', ringClass: 'ring-blue-500/40' },
  { token: 'emerald', swatchClass: 'bg-emerald-500', ringClass: 'ring-emerald-500/40' },
  { token: 'purple', swatchClass: 'bg-purple-500', ringClass: 'ring-purple-500/40' },
  { token: 'yellow', swatchClass: 'bg-yellow-400', ringClass: 'ring-yellow-400/40' },
  { token: 'orange', swatchClass: 'bg-orange-500', ringClass: 'ring-orange-500/40' },
  { token: 'indigo', swatchClass: 'bg-indigo-500', ringClass: 'ring-indigo-500/40' },
  { token: 'pink', swatchClass: 'bg-pink-500', ringClass: 'ring-pink-500/40' },
  { token: 'red', swatchClass: 'bg-red-500', ringClass: 'ring-red-500/40' },
  { token: 'teal', swatchClass: 'bg-teal-500', ringClass: 'ring-teal-500/40' },
  { token: 'sky', swatchClass: 'bg-sky-500', ringClass: 'ring-sky-500/40' },
  { token: 'slate', swatchClass: 'bg-slate-400', ringClass: 'ring-slate-400/40' },
]

export function ColorPicker({ value, onChange, label = 'Color', className }: ColorPickerProps) {
  return (
    <div className={clsx('w-full', className)}>
      <div className="mb-2 flex items-center justify-between">
        <label className="text-sm font-semibold text-gray-200">{label}</label>
        <span className="text-xs text-gray-400">{value}</span>
      </div>

      <div className="grid grid-cols-6 gap-2" role="radiogroup" aria-label="Color options">
        {COLORS.map(({ token, swatchClass, ringClass }) => {
          const isSelected = token === value
          return (
            <button
              key={token}
              type="button"
              onClick={() => onChange(token)}
              className={clsx(
                'flex h-10 w-10 items-center justify-center rounded-xl ring-1 transition-colors duration-200 cursor-pointer',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
                isSelected ? clsx('ring-2', ringClass) : 'ring-white/10 hover:ring-white/20'
              )}
              role="radio"
              aria-checked={isSelected}
              title={token}
            >
              <span className={clsx('h-6 w-6 rounded-full', swatchClass)} />
            </button>
          )
        })}
      </div>
    </div>
  )
}
