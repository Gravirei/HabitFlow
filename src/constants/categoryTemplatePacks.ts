import type { Category } from '@/types/category'

export type TemplatePackCategory = Pick<
  Category,
  'name' | 'icon' | 'color' | 'gradient' | 'textColor' | 'imagePath' | 'height' | 'isPinned'
>

export type TemplatePackHabit = {
  name: string
  description?: string
  icon: string
  frequency: 'daily' | 'weekly' | 'monthly'
  goal: number
  goalPeriod: string
  reminderEnabled: boolean
  reminderTime?: string
  startDate: string

  /**
   * Category name within the pack.
   * When importing, the habit will be assigned to the created/found category ID.
   */
  categoryName: string
}

export type CategoryTemplatePack = {
  id: 'fitness' | 'productivity' | 'wellness'
  title: string
  description: string
  categories: TemplatePackCategory[]
  sampleHabits: TemplatePackHabit[]
}

const DEFAULT_START_DATE = '2026-01-01'

export const CATEGORY_TEMPLATE_PACKS: CategoryTemplatePack[] = [
  {
    id: 'fitness',
    title: 'Fitness',
    description: 'A simple starter set for training, mobility, and recovery.',
    categories: [
      {
        name: 'Training',
        icon: 'fitness_center',
        color: 'emerald',
        gradient: 'from-emerald-500 to-teal-600',
        textColor: 'text-white',
        isPinned: false,
      },
      {
        name: 'Mobility',
        icon: 'accessibility_new',
        color: 'indigo',
        gradient: 'from-indigo-500 to-violet-600',
        textColor: 'text-white',
        isPinned: false,
      },
      {
        name: 'Recovery',
        icon: 'hotel',
        color: 'sky',
        gradient: 'from-sky-400 to-blue-600',
        textColor: 'text-white',
        isPinned: false,
      },
    ],
    sampleHabits: [
      {
        name: 'Strength session',
        description: '20–45 min full-body strength.',
        icon: 'fitness_center',
        frequency: 'weekly',
        goal: 3,
        goalPeriod: 'week',
        reminderEnabled: false,
        startDate: DEFAULT_START_DATE,
        categoryName: 'Training',
      },
      {
        name: '10 min mobility',
        description: 'Hips, ankles, shoulders.',
        icon: 'self_improvement',
        frequency: 'daily',
        goal: 1,
        goalPeriod: 'day',
        reminderEnabled: false,
        startDate: DEFAULT_START_DATE,
        categoryName: 'Mobility',
      },
      {
        name: 'Walk outside',
        description: 'Low-intensity movement for recovery.',
        icon: 'directions_walk',
        frequency: 'daily',
        goal: 1,
        goalPeriod: 'day',
        reminderEnabled: false,
        startDate: DEFAULT_START_DATE,
        categoryName: 'Recovery',
      },
    ],
  },
  {
    id: 'productivity',
    title: 'Productivity',
    description: 'Set up focus blocks, planning, and quick wins.',
    categories: [
      {
        name: 'Focus',
        icon: 'timer',
        color: 'purple',
        gradient: 'from-gray-900 to-black dark:from-surface-card dark:to-surface-dark',
        textColor: 'text-white',
        isPinned: false,
      },
      {
        name: 'Planning',
        icon: 'event_note',
        color: 'orange',
        gradient: 'from-orange-500 to-amber-500',
        textColor: 'text-white',
        isPinned: false,
      },
      {
        name: 'Admin',
        icon: 'inventory_2',
        color: 'slate',
        gradient: 'from-slate-600 to-slate-800',
        textColor: 'text-white',
        isPinned: false,
      },
    ],
    sampleHabits: [
      {
        name: 'Deep work block',
        description: 'One focused block on your most important task.',
        icon: 'psychology',
        frequency: 'daily',
        goal: 1,
        goalPeriod: 'day',
        reminderEnabled: false,
        startDate: DEFAULT_START_DATE,
        categoryName: 'Focus',
      },
      {
        name: 'Plan tomorrow',
        description: 'Pick top 3 outcomes for tomorrow.',
        icon: 'checklist',
        frequency: 'daily',
        goal: 1,
        goalPeriod: 'day',
        reminderEnabled: false,
        startDate: DEFAULT_START_DATE,
        categoryName: 'Planning',
      },
      {
        name: 'Inbox zero (10 min)',
        description: 'Quick email / admin cleanup.',
        icon: 'inbox',
        frequency: 'daily',
        goal: 1,
        goalPeriod: 'day',
        reminderEnabled: false,
        startDate: DEFAULT_START_DATE,
        categoryName: 'Admin',
      },
    ],
  },
  {
    id: 'wellness',
    title: 'Wellness',
    description: 'A balanced pack for mindfulness, nutrition, and sleep.',
    categories: [
      {
        name: 'Mindfulness',
        icon: 'self_improvement',
        color: 'teal',
        gradient: 'from-teal-500 to-emerald-600',
        textColor: 'text-white',
        isPinned: false,
      },
      {
        name: 'Nutrition',
        icon: 'restaurant',
        color: 'yellow',
        gradient: 'from-yellow-400 to-orange-500',
        textColor: 'text-black',
        isPinned: false,
      },
      {
        name: 'Sleep',
        icon: 'bedtime',
        color: 'indigo',
        gradient: 'from-indigo-500 to-slate-900',
        textColor: 'text-white',
        isPinned: false,
      },
    ],
    sampleHabits: [
      {
        name: '5 min breathing',
        description: 'A quick reset.',
        icon: 'air',
        frequency: 'daily',
        goal: 1,
        goalPeriod: 'day',
        reminderEnabled: false,
        startDate: DEFAULT_START_DATE,
        categoryName: 'Mindfulness',
      },
      {
        name: 'Protein with breakfast',
        description: 'Aim for a balanced start.',
        icon: 'egg',
        frequency: 'daily',
        goal: 1,
        goalPeriod: 'day',
        reminderEnabled: false,
        startDate: DEFAULT_START_DATE,
        categoryName: 'Nutrition',
      },
      {
        name: 'Lights out on time',
        description: 'Keep a consistent bedtime.',
        icon: 'bedtime',
        frequency: 'daily',
        goal: 1,
        goalPeriod: 'day',
        reminderEnabled: false,
        startDate: DEFAULT_START_DATE,
        categoryName: 'Sleep',
      },
    ],
  },
]

export const getCategoryTemplatePack = (packId: CategoryTemplatePack['id']) =>
  CATEGORY_TEMPLATE_PACKS.find((pack) => pack.id === packId)
