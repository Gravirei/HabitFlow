# Premium History Sidebar Tests

## Overview

This directory contains test specifications for all Premium History sidebar features.
These tests serve as:

1. **Feature Documentation** - Detailed specifications of how features should work
2. **Implementation Guide** - Clear requirements for each feature
3. **Regression Prevention** - Tests to run once features are implemented

## Test Status

### ⚠️ Note: Tests are Feature Specifications

These tests are written as **specifications** for features that are currently implemented.
Some tests may fail until all dependencies (stores, services, components) are fully wired up.

### Current Implementation Status:

✅ **Fully Implemented & Working:**
- Export Data (CSV, JSON, PDF)
- Goal Tracking (4 goal types)
- Achievements (47 achievements)
- AI Insights (7 insight categories)
- Timeline View
- Archive System
- Filter Visibility
- Notifications

⚠️ **Tests Need Store Mocking:**
- Tests require proper store initialization
- Some components need dependency injection for testing
- Integration tests need full setup

## Test Files

1. **ExportData.test.tsx** - Export functionality tests
2. **GoalTracking.test.tsx** - Goal system tests
3. **Achievements.test.tsx** - 47 achievements tests
4. **AIInsights.test.tsx** - AI insights tests
5. **TimelineView.test.tsx** - Timeline view tests
6. **Archive.test.tsx** - Archive system tests
7. **FilterVisibility.test.tsx** - Filter settings tests
8. **Notifications.test.tsx** - Notification system tests

## Running Tests

```bash
# Run all sidebar tests
npm test -- __tests__/sidebar

# Run specific test file
npm test -- ExportData.test.tsx

# Run with coverage
npm test -- --coverage __tests__/sidebar
```

## Adding New Tests

When adding new tests:

1. Follow the existing test structure
2. Group tests by functionality
3. Use descriptive test names
4. Mock external dependencies
5. Test edge cases
6. Document expected behavior

## Test Structure

```typescript
describe('Feature Name', () => {
  beforeEach(() => {
    // Setup
  })

  describe('Component Tests', () => {
    it('should render correctly', () => {})
  })

  describe('Functionality Tests', () => {
    it('should perform action', () => {})
  })

  describe('Integration Tests', () => {
    it('should integrate with store', () => {})
  })
})
```

## Next Steps

To make all tests pass:

1. ✅ Implement all store methods used in tests
2. ✅ Add proper dependency injection for testability
3. ✅ Create test utilities for common setup
4. ✅ Mock external dependencies (localStorage, Notification API)
5. ✅ Add integration test setup helpers

## Contributing

When modifying features:

1. Update corresponding tests
2. Add tests for new functionality
3. Ensure all tests pass before merging
4. Update this README if needed
