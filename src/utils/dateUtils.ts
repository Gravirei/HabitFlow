/**
 * Returns today's date in YYYY-MM-DD format using LOCAL time.
 *
 * IMPORTANT: Always use this instead of `new Date().toISOString().split('T')[0]`
 * which returns UTC and causes timezone bugs between local midnight and UTC midnight.
 */
export function getLocalToday(): string {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Converts a Date object to YYYY-MM-DD string using LOCAL time.
 */
export function toLocalDateString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
