// Vitest module augmentation for jest-axe matchers.

import 'vitest'

declare module 'vitest' {
  interface Assertion<_T = unknown> {
    toHaveNoViolations(): void
  }
  interface Matchers<_R = unknown> {
    toHaveNoViolations(): void
  }
}
