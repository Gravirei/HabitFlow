/**
 * Habit Storage Migration Utility
 * Fixes orphaned habits without isActive property
 */

export function migrateHabitStorage() {
  try {
    const habitStorage = localStorage.getItem('habit-storage')
    if (!habitStorage) return

    const data = JSON.parse(habitStorage)
    const habits = data.state?.habits || []

    let needsMigration = false
    const migratedHabits = habits.map((habit: any) => {
      // If isActive is undefined, set it to true (assume old habits were active)
      if (habit.isActive === undefined) {
        needsMigration = true
        console.log(`[Migration] Setting isActive=true for habit: ${habit.name}`)
        return { ...habit, isActive: true }
      }
      return habit
    })

    if (needsMigration) {
      data.state.habits = migratedHabits
      localStorage.setItem('habit-storage', JSON.stringify(data))
      console.log('[Migration] Habit storage migrated successfully')
      return true
    }

    console.log('[Migration] No migration needed')
    return false
  } catch (error) {
    console.error('[Migration] Error migrating habit storage:', error)
    return false
  }
}

/**
 * Clean up orphaned/invalid habits
 * Removes habits that don't have required fields
 */
export function cleanupHabitStorage() {
  try {
    const habitStorage = localStorage.getItem('habit-storage')
    if (!habitStorage) return

    const data = JSON.parse(habitStorage)
    const habits = data.state?.habits || []

    const validHabits = habits.filter((habit: any) => {
      // Ensure habit has required fields
      return habit.id && habit.name && habit.frequency
    })

    if (validHabits.length !== habits.length) {
      data.state.habits = validHabits
      localStorage.setItem('habit-storage', JSON.stringify(data))
      console.log(`[Cleanup] Removed ${habits.length - validHabits.length} invalid habits`)
      return true
    }

    return false
  } catch (error) {
    console.error('[Cleanup] Error cleaning habit storage:', error)
    return false
  }
}
