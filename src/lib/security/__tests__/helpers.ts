import { vi } from 'vitest'

export interface DbResult<T = unknown> {
  data: T | null
  error: unknown
}

type ChainMethod = string

const CHAIN_METHODS: ChainMethod[] = [
  'select',
  'insert',
  'update',
  'delete',
  'eq',
  'neq',
  'gt',
  'gte',
  'lt',
  'lte',
  'or',
  'order',
  'limit',
]

/**
 * Build a thenable chainable Supabase query-builder mock that resolves to `result`.
 * Supports `.single()` and direct await (`await supabase.from(...).eq(...)`) usage.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createQueryBuilder<T = unknown>(result: Partial<DbResult<T>> = {}): any {
  const res: DbResult<T> = { data: result.data ?? null, error: result.error ?? null }
  const builder: Record<string, unknown> = {}

  for (const method of CHAIN_METHODS) {
    builder[method] = vi.fn().mockReturnValue(builder)
  }
  builder.single = vi.fn().mockResolvedValue(res)
  builder.then = (
    onFulfilled?: (value: DbResult<T>) => unknown,
    onRejected?: (reason: unknown) => unknown
  ) => Promise.resolve(res).then(onFulfilled, onRejected)

  return builder
}
