import { useMemo, useState } from 'react'
import clsx from 'clsx'

export interface IconPickerProps {
  value: string
  onChange: (icon: string) => void
  label?: string
  className?: string
}

// Curated list (keep lightweight; avoid importing full icon catalogs)
const MATERIAL_SYMBOLS: readonly string[] = [
  'category',
  'folder',
  'star',
  'favorite',
  'home',
  'work',
  'school',
  'self_improvement',
  'directions_run',
  'fitness_center',
  'hiking',
  'restaurant',
  'local_cafe',
  'menu_book',
  'music_note',
  'headphones',
  'movie',
  'brush',
  'palette',
  'photo_camera',
  'travel_explore',
  'flight',
  'directions_car',
  'directions_bike',
  'directions_walk',
  'shopping_cart',
  'store',
  'attach_money',
  'savings',
  'account_balance',
  'payments',
  'credit_card',
  'receipt_long',
  'calendar_month',
  'event',
  'schedule',
  'alarm',
  'bedtime',
  'wb_sunny',
  'dark_mode',
  'water_drop',
  'spa',
  'psychology',
  'emoji_people',
  'groups',
  'group',
  'diversity_3',
  'call',
  'chat',
  'forum',
  'mail',
  'task_alt',
  'check_circle',
  'edit',
  'tune',
  'settings',
  'auto_awesome',
  'bolt',
  'rocket_launch',
  'trending_up',
  'insights',
  'bar_chart',
  'show_chart',
  'timer',
  'hourglass_empty',
  'flag',
  'bookmark',
  'lightbulb',
  'science',
  'code',
  'terminal',
  'build',
  'handyman',
  'local_florist',
  'park',
  'pets',
  'health_and_safety',
  'medication',
  'favorite_border',
  'monitor_heart',
  'nutrition',
  'sports_soccer',
  'sports_basketball',
  'sports_tennis',
  'sports_gymnastics',
  'sports_esports',
  'public',
  'language',
  'translate',
  'map',
  'place',
  'explore',
  'security',
  'lock',
  'key',
  'shield',
  'celebration',
  'redeem',
  'volunteer_activism',
  'eco',
  'recycling',
  'format_list_bulleted',
  'list_alt',
  'grid_view',
  'dashboard',
]

export function IconPicker({ value, onChange, label = 'Icon', className }: IconPickerProps) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase()
    if (!q) return MATERIAL_SYMBOLS
    return MATERIAL_SYMBOLS.filter((name) => name.toLocaleLowerCase().includes(q))
  }, [query])

  return (
    <div className={clsx('w-full', className)}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <label className="text-sm font-semibold text-gray-200">{label}</label>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span className="material-symbols-outlined text-base">{value}</span>
          <span className="truncate">{value}</span>
        </div>
      </div>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search icons..."
        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
      />

      <div
        className="mt-3 grid max-h-48 grid-cols-7 gap-2 overflow-auto rounded-xl border border-white/10 bg-black/20 p-2"
        role="listbox"
        aria-label="Icon options"
      >
        {filtered.map((icon) => {
          const isSelected = icon === value
          return (
            <button
              key={icon}
              type="button"
              onClick={() => onChange(icon)}
              className={clsx(
                'flex h-10 w-10 items-center justify-center rounded-lg transition-colors duration-200 cursor-pointer',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
                isSelected
                  ? 'bg-primary/20 text-primary'
                  : 'bg-white/5 text-gray-200 hover:bg-white/10'
              )}
              role="option"
              aria-selected={isSelected}
              title={icon}
            >
              <span className="material-symbols-outlined">{icon}</span>
            </button>
          )
        })}

        {filtered.length === 0 && (
          <div className="col-span-7 p-3 text-sm text-gray-400">No icons match "{query}".</div>
        )}
      </div>
    </div>
  )
}
