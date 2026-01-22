/**
 * Custom Tags Types
 * Types for session tagging and organization
 */

export interface Tag {
  id: string
  name: string
  color: string
  icon?: string
  createdAt: number
  usageCount: number
}

export interface TaggedSession {
  sessionId: string
  tagIds: string[]
}

export const TAG_COLORS = [
  { name: 'Red', value: 'bg-red-500', text: 'text-red-500' },
  { name: 'Orange', value: 'bg-orange-500', text: 'text-orange-500' },
  { name: 'Amber', value: 'bg-amber-500', text: 'text-amber-500' },
  { name: 'Yellow', value: 'bg-yellow-500', text: 'text-yellow-500' },
  { name: 'Lime', value: 'bg-lime-500', text: 'text-lime-500' },
  { name: 'Green', value: 'bg-green-500', text: 'text-green-500' },
  { name: 'Emerald', value: 'bg-emerald-500', text: 'text-emerald-500' },
  { name: 'Teal', value: 'bg-teal-500', text: 'text-teal-500' },
  { name: 'Cyan', value: 'bg-cyan-500', text: 'text-cyan-500' },
  { name: 'Sky', value: 'bg-sky-500', text: 'text-sky-500' },
  { name: 'Blue', value: 'bg-blue-500', text: 'text-blue-500' },
  { name: 'Indigo', value: 'bg-indigo-500', text: 'text-indigo-500' },
  { name: 'Violet', value: 'bg-violet-500', text: 'text-violet-500' },
  { name: 'Purple', value: 'bg-purple-500', text: 'text-purple-500' },
  { name: 'Fuchsia', value: 'bg-fuchsia-500', text: 'text-fuchsia-500' },
  { name: 'Pink', value: 'bg-pink-500', text: 'text-pink-500' },
  { name: 'Rose', value: 'bg-rose-500', text: 'text-rose-500' },
]
