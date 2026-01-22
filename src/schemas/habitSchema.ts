/**
 * Habit Validation Schema
 * Zod schemas for habit form validation
 */

import { z } from 'zod'

export const habitSchema = z.object({
  name: z
    .string()
    .min(1, 'Habit name is required')
    .max(100, 'Habit name must be less than 100 characters')
    .trim()
    .refine(
      (val) => val.length > 0,
      'Habit name cannot be only spaces'
    ),
  
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .or(z.literal('')),
  
  frequency: z.enum(['daily', 'weekly', 'monthly'], {
    errorMap: () => ({ message: 'Please select a valid frequency' })
  }),
  
  goal: z
    .number({
      required_error: 'Goal is required',
      invalid_type_error: 'Goal must be a number'
    })
    .int('Goal must be a whole number')
    .min(1, 'Goal must be at least 1')
    .max(100, 'Goal cannot exceed 100'),
  
  reminderEnabled: z.boolean(),
  
  reminderTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]/, 'Invalid time format')
    .optional()
    .or(z.literal('')),
})

export type HabitFormData = z.infer<typeof habitSchema>

// Validation helper for quick checks
export function validateHabitName(name: string): { valid: boolean; error?: string } {
  const result = z.string().min(1).max(100).trim().safeParse(name)
  
  if (!result.success) {
    return { valid: false, error: result.error.errors[0].message }
  }
  
  if (name.trim().length === 0) {
    return { valid: false, error: 'Habit name cannot be only spaces' }
  }
  
  return { valid: true }
}

// Validation helper for goal
export function validateGoal(goal: number): { valid: boolean; error?: string } {
  const result = z.number().int().min(1).max(100).safeParse(goal)
  
  if (!result.success) {
    return { valid: false, error: result.error.errors[0].message }
  }
  
  return { valid: true }
}
