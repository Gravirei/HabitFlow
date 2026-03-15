# Codebase Concerns

**Analysis Date:** 2025-03-03

## Tech Debt

**Large Component Complexity:**
- Issue: Several core pages exceed 1,000 lines, combining UI logic, state management, and complex helper functions.
- Files: `src/pages/bottomNav/Habits.tsx` (2034 lines), `src/pages/bottomNav/Categories.tsx` (1572 lines), `src/components/tasks/TemplateLibraryModal.tsx` (1338 lines)
- Impact: Difficult to maintain, test, and refactor. Higher risk of regressions.
- Fix approach: Extract helper functions to utility files (e.g., date logic from `Habits.tsx` to `dateUtils.ts`). Break down large components into smaller, focused sub-components.

**Supabase Integration Gaps:**
- Issue: Multiple features have placeholders or "Phase 3" TODOs for Supabase wiring.
- Files: `src/components/messaging/messagingStore.ts`, `src/pages/Welcome.tsx`
- Impact: Features may be non-functional or rely on local-only state in a multi-device environment.
- Fix approach: Complete the implementation of Supabase edge functions and database schema wiring for messaging and social features.

## Known Bugs

**External Integration Stubs:**
- Symptoms: Notion and Zapier integrations appear to have incomplete logic for data fetching.
- Files: `src/components/integrations/NotionSettings.tsx`
- Trigger: Attempting to sync habits with Notion.
- Workaround: None currently; logic is stubbed with `const habits = [] // TODO`.

## Security Considerations

**LocalStorage Session Persistence:**
- Risk: Supabase session tokens are stored in `localStorage` rather than `sessionStorage` or `httpOnly` cookies, increasing XSS exposure.
- Files: `src/lib/supabase.ts`
- Current mitigation: Detailed justification in code comments; use of Auth Gateway, MFA, and DOMPurify.
- Recommendations: Consider a Backend-for-Frontend (BFF) layer to handle sessions via secure cookies if the risk profile changes.

## Performance Bottlenecks

**Zustand Store Bloat:**
- Problem: `messagingStore.ts` and `socialStore.ts` are becoming very large (1300+ and 800+ lines).
- Files: `src/components/messaging/messagingStore.ts`, `src/components/social/socialStore.ts`
- Cause: Consolidation of all feature logic into a single store.
- Improvement path: Slice the stores into smaller, domain-specific modules.

## Test Coverage Gaps

**Messaging and Social Features:**
- What's not tested: Complex messaging logic, conversation handling, and social interactions.
- Files: `src/components/messaging/*`, `src/components/social/*`
- Risk: Regressions in communication features which are critical for user engagement.
- Priority: Medium

**Toast Notification Integration:**
- What's not tested: Global error handling UI.
- Files: `src/components/timer/utils/errorMessages.ts`, `src/components/timer/utils/notificationManager.ts`
- Risk: Errors occurring silently without user feedback due to missing toast implementation.
- Priority: High

## Missing Critical Features

**Third-Party Authentication:**
- Problem: Google and Apple Sign-In are currently just UI stubs.
- Blocks: Users cannot use social login, forcing email-only signup which increases friction.
- Files: `src/pages/Welcome.tsx`

**Global Toast System:**
- Problem: Several utilities have TODOs for "Integrate with a toast notification library".
- Blocks: Consistent user feedback across the app.
- Files: `src/components/timer/utils/errorMessages.ts`

---

*Concerns audit: 2025-03-03*
