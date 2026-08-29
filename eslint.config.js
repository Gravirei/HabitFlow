import fs from 'node:fs'
import nodePath from 'node:path'
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

// Debt ledger: source files carrying a '// @ts-nocheck' header predate the
// structural refactor and get rewritten/moved phase by phase. Mechanical lint
// rules are relaxed for exactly these files so `eslint .` can gate on errors.
// As burn-down removes headers, full strictness applies automatically.
function findLedgerFiles(dir) {
  const out = []
  const walk = (d) => {
    let entries
    try {
      entries = fs.readdirSync(d, { withFileTypes: true })
    } catch {
      return
    }
    for (const entry of entries) {
      const p = nodePath.join(d, entry.name)
      if (entry.isDirectory()) walk(p)
      else if (/\.tsx?$/.test(entry.name)) {
        try {
          const fd = fs.openSync(p, 'r')
          const buf = Buffer.alloc(64)
          fs.readSync(fd, buf, 0, 64, 0)
          fs.closeSync(fd)
          if (buf.toString().includes('@ts-nocheck')) out.push(p)
        } catch {
          // unreadable file: let ESLint report it normally
        }
      }
    }
  }
  walk(dir)
  return out.map((p) => nodePath.relative('.', p))
}

const debtFiles = findLedgerFiles('src')
// `ESLINT_DEBT_MODE=strict` disables the ledger relaxation so `lint:debt`
// surfaces real errors hidden in the @ts-nocheck files. Default is the
// ledger-aware mode (the CI gate).
const debtModeStrict = process.env.ESLINT_DEBT_MODE === 'strict'

export default tseslint.config(
  // Non-source trees: build output, coverage, Deno edge functions, static
  // landing page, native Android project, historical backups.
  { ignores: ['dist', 'coverage', 'node_modules', 'supabase', 'landing_page', 'android', 'archive'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      // Burn-down metric: warn during refactor, tighten to 'error' as sites get typed.
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  ...(debtFiles.length && !debtModeStrict
    ? [
        {
          files: debtFiles,
          rules: {
            '@typescript-eslint/no-unused-vars': 'warn',
            '@typescript-eslint/ban-ts-comment': 'warn',
            '@typescript-eslint/no-explicit-any': 'off',
            'prefer-const': 'warn',
            'no-case-declarations': 'warn',
            'no-useless-catch': 'warn',
            'no-empty-pattern': 'warn',
            'no-useless-escape': 'warn',
            'no-unused-expressions': 'warn',
          },
        },
      ]
    : []),
  // Layered-architecture guard (refactor P4): cross-cutting layers may only
  // be consumed by features/components, never the other way around.
  {
    files: [
      'src/lib/**',
      'src/hooks/**',
      'src/store/**',
      'src/utils/**',
      'src/schemas/**',
      'src/types/**',
      'src/constants/**',
      'src/shared/**',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/components/*', '@/features/*', '**/components/**', '**/features/**'],
              message:
                'Shared layers (lib/hooks/store/utils/schemas/types/constants/shared) must not depend on feature or component code.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['e2e/**/*.{ts,tsx}'],
    languageOptions: {
      globals: globals.node,
    },
  },
)
