/**
 * Typed application error hierarchy.
 *
 * Every error thrown by `src/lib/**` and feature code should derive from
 * `AppError` so callers can `instanceof` check, transport extra context
 * (`code`, `meta`), and the global `unhandledrejection` handler can
 * report structured payloads to Sentry.
 *
 * Conventions:
 *   - `code` is a stable machine-readable identifier (SCREAMING_SNAKE_CASE).
 *     UI code should switch on `code`, never on `message`.
 *   - `message` is human-readable, safe to surface in toast/UI.
 *   - `meta` is structured context (lockout times, factor ids, etc.).
 *   - `cause` is the original error (e.g. a network failure) — preserved
 *     for Sentry's breadcrumb chain.
 *   - `httpStatus` is the upstream status, if known.
 *
 * Migration map (old → new):
 *   `new Error('MFA is not available in this Supabase client')`           → `new MfaError('MFA_NOT_AVAILABLE', ...)`
 *   `new Error('Missing VITE_SUPABASE_URL')`                              → `new EnvError('VITE_SUPABASE_URL is required', 'ENV_MISSING')`
 *   `new Error('Too many attempts. Please try again later.')`             → `new RateLimitedError(...)` with `meta.retryAfterMinutes`
 *   `new Error('MFA verification failed. Please try again.')`             → `new MfaError('MFA_VERIFICATION_FAILED', ...)`
 *   `new Error('Invalid 2FA code')` / `new Error('Invalid 6-digit code')` → `new ValidationError('Invalid 2FA code', 'INVALID_CODE_FORMAT')`
 */

export class AppError extends Error {
  /** Stable machine-readable identifier. */
  public readonly code: string
  /** Structured context. Free-form, JSON-serializable. */
  public readonly meta: Readonly<Record<string, unknown>>
  /** Upstream HTTP status, if any. */
  public readonly httpStatus: number | undefined

  constructor(
    message: string,
    code: string,
    options?: {
      cause?: unknown
      meta?: Record<string, unknown>
      httpStatus?: number
    },
  ) {
    super(message)
    this.name = new.target.name
    this.code = code
    // The `cause` field on Error is ES2022; some of our older lib targets
    // don't allow passing it via `super`. We preserve the original error
    // in `meta.cause` for Sentry breadcrumbs / debugging instead.
    this.meta = Object.freeze({
      ...(options?.meta ?? {}),
      ...(options?.cause !== undefined ? { cause: options.cause } : {}),
    })
    this.httpStatus = options?.httpStatus
    // Restore prototype chain after super() (TS-recommended when targeting ES5).
    Object.setPrototypeOf(this, new.target.prototype)
  }

  /** Serializable shape, suitable for Sentry `setExtra` or log lines. */
  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      meta: this.meta,
      httpStatus: this.httpStatus,
      stack: this.stack,
    }
  }
}

// ── Subclasses ───────────────────────────────────────────────────────────

/** Configuration error: missing or invalid env var. */
export class EnvError extends AppError {
  constructor(message: string, code = 'ENV_MISSING', meta?: Record<string, unknown>) {
    super(message, code, { meta })
  }
}

/** Validation error: malformed input from the user. */
export class ValidationError extends AppError {
  constructor(message: string, code = 'VALIDATION_FAILED', meta?: Record<string, unknown>) {
    super(message, code, { meta })
  }
}

/** Authentication failure: bad credentials, expired session, etc. */
export class AuthError extends AppError {
  constructor(message: string, code = 'AUTH_FAILED', meta?: Record<string, unknown>) {
    super(message, code, { meta })
  }
}

/** MFA failure: missing TOTP, wrong code, challenge expired. */
export class MfaError extends AppError {
  constructor(message: string, code = 'MFA_FAILED', meta?: Record<string, unknown>) {
    super(message, code, { meta })
  }
}

/** Rate limited by the auth-gateway or another upstream. */
export class RateLimitedError extends AppError {
  constructor(
    message = 'Too many attempts. Please try again later.',
    meta?: { retryAfterMinutes?: number; lockedUntil?: string },
  ) {
    super(message, 'RATE_LIMITED', { httpStatus: 429, meta })
  }
}

/** Network / transport failure (fetch threw, timeout, etc). */
export class NetworkError extends AppError {
  constructor(message: string, cause?: unknown, meta?: Record<string, unknown>) {
    super(message, 'NETWORK_ERROR', { cause, meta })
  }
}

// ── Error-code catalog for the new auth-gateway envelope ─────────────────

/**
 * Machine-readable codes returned by `auth-gateway` (v2 envelope).
 * The client switches on these — keep this list in sync with the Edge
 * Function's responses.
 */
export const AuthGatewayErrorCodes = {
  EMAIL_REQUIRED: 'email_required',
  PASSWORD_REQUIRED: 'password_required',
  AAL1_REQUIRED: 'aal1_access_token_required',
  FACTOR_ID_REQUIRED: 'factor_id_required',
  INVALID_CODE_FORMAT: 'invalid_code_format',
  TURNSTILE_REQUIRED: 'turnstile_required',
  TURNSTILE_FAILED: 'turnstile_failed',
  RATE_LIMITED: 'rate_limited',
  ACCOUNT_LOCKED: 'account_locked',
  INVALID_CREDENTIALS: 'invalid_credentials',
  MFA_CHALLENGE_FAILED: 'mfa_challenge_failed',
  MFA_VERIFICATION_FAILED: 'mfa_verification_failed',
  SIGNUP_FAILED: 'signup_failed',
  UNKNOWN_ACTION: 'unknown_action',
  NOT_FOUND: 'not_found',
  METHOD_NOT_ALLOWED: 'method_not_allowed',
  SERVER_ERROR: 'server_error',
} as const

export type AuthGatewayErrorCode = (typeof AuthGatewayErrorCodes)[keyof typeof AuthGatewayErrorCodes]

// ── Helpers ──────────────────────────────────────────────────────────────

/**
 * Map an `auth-gateway` v2 error code to a typed `AppError` subclass.
 * Use this in the client after parsing the envelope.
 */
export function toAppErrorFromAuthGateway(
  code: AuthGatewayErrorCode | string,
  message: string,
  meta: Record<string, unknown> = {},
  httpStatus?: number,
): AppError {
  switch (code) {
    case AuthGatewayErrorCodes.RATE_LIMITED:
      return new RateLimitedError(message, {
        retryAfterMinutes: typeof meta.retryAfterMinutes === 'number' ? meta.retryAfterMinutes : undefined,
        lockedUntil: typeof meta.lockedUntil === 'string' ? meta.lockedUntil : undefined,
      })
    case AuthGatewayErrorCodes.MFA_VERIFICATION_FAILED:
    case AuthGatewayErrorCodes.MFA_CHALLENGE_FAILED:
      return new MfaError(message, code, meta)
    case AuthGatewayErrorCodes.ACCOUNT_LOCKED:
      return new AuthError(message, code, { ...meta, httpStatus })
    case AuthGatewayErrorCodes.INVALID_CREDENTIALS:
    case AuthGatewayErrorCodes.SIGNUP_FAILED:
      return new AuthError(message, code, { ...meta, httpStatus })
    case AuthGatewayErrorCodes.INVALID_CODE_FORMAT:
      return new ValidationError(message, code, { ...meta, httpStatus })
    case AuthGatewayErrorCodes.SERVER_ERROR:
      return new AppError(message, code, { meta, httpStatus })
    default:
      return new AppError(message, code, { meta, httpStatus })
  }
}

/**
 * Wrap an async function so any rejection becomes a typed `AppError`.
 * If the thrown value is already an `AppError`, it passes through unchanged.
 * Anything else is wrapped in `AppError` with the supplied default `code`.
 */
export async function wrapAsync<T>(
  fn: () => Promise<T>,
  fallback: { code: string; message: string },
): Promise<T> {
  try {
    return await fn()
  } catch (e) {
    if (e instanceof AppError) throw e
    throw new AppError(fallback.message, fallback.code, { cause: e })
  }
}

/** Type-guard: is `e` (or anything thrown) an `AppError`? */
export function isAppError(e: unknown): e is AppError {
  return e instanceof AppError
}
