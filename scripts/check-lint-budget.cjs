#!/usr/bin/env node
/**
 * Lint warning budget gate.
 *
 * Fails when the total ESLint warning count exceeds the budget stored in
 * `.lint-budget`. The budget is a ratchet: as type-debt burn-down removes
 * warnings (mostly @typescript-eslint/no-explicit-any), lower the number in
 * `.lint-budget` in the same commit. It can never grow back up.
 *
 * Usage: node scripts/check-lint-budget.cjs <path-to-eslint-json-report>
 */

const fs = require('fs')

const reportPath = process.argv[2]
if (!reportPath || !fs.existsSync(reportPath)) {
  console.error('Usage: node scripts/check-lint-budget.cjs <eslint-json-report>')
  process.exit(2)
}

const budgetFile = '.lint-budget'
const budget = parseInt(fs.readFileSync(budgetFile, 'utf8').trim(), 10)
if (Number.isNaN(budget)) {
  console.error(`Invalid budget in ${budgetFile}`)
  process.exit(2)
}

const results = JSON.parse(fs.readFileSync(reportPath, 'utf8'))
const errorCount = results.reduce((sum, r) => sum + r.errorCount, 0)
const warningCount = results.reduce((sum, r) => sum + r.warningCount, 0)

console.log(`Lint result: ${errorCount} errors, ${warningCount} warnings (budget: ${budget})`)

if (errorCount > 0) {
  console.error('✖ Lint errors present — failing regardless of budget.')
  process.exit(1)
}

if (warningCount > budget) {
  console.error(
    `✖ Warning budget exceeded: ${warningCount} > ${budget}.\n` +
      '  Fix the new warnings or (only for intentional burn-down) lower ' +
      `${budgetFile} in the same commit.`
  )
  process.exit(1)
}

console.log(`✔ Within warning budget.`)

// Ratchet hint: surface savings so the budget gets lowered proactively
if (warningCount < budget) {
  console.log(
    `ℹ ${budget - warningCount} warning(s) under budget — consider lowering ` +
      `${budgetFile} to ${warningCount}.`
  )
}
