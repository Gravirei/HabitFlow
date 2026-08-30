// Ambient type declarations for jest-axe (untyped package).
// See node_modules/jest-axe/index.js for the actual runtime shape.

declare module 'jest-axe' {
  interface AxeNodeResult {
    any: Array<{ id: string; message: string; data?: unknown }>
    all: Array<{ id: string; message: string; data?: unknown }>
    none: Array<{ id: string; message: string; data?: unknown }>
    impact: 'minor' | 'moderate' | 'serious' | 'critical' | null
    html: string
    target: Array<string | { selector: string; ancestry?: string[] }>
    failureSummary: string
  }
  interface AxeResults {
    violations: AxeNodeResult[]
    passes: AxeNodeResult[]
    incomplete: AxeNodeResult[]
    inapplicable: AxeNodeResult[]
    url: string
    timestamp: string
    [key: string]: unknown
  }
  export function axe(
    html: Element | string,
    options?: Record<string, unknown>,
  ): Promise<AxeResults>
  export const toHaveNoViolations: {
    toHaveNoViolations: (received: AxeResults) => {
      pass: boolean
      message: () => string
    }
  }
}
