import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Utility function to merge class names
 * Useful for conditional styling with Tailwind CSS
 * Uses tailwind-merge to resolve conflicts (e.g., "px-4 p-6" → "p-6")
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
