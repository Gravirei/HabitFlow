# HabitFlow Security Audit Report
**Date:** Monday, March 16, 2026
**Status:** Review Required

## 1. Executive Summary
HabitFlow's architecture demonstrates a high level of security awareness, featuring a custom "Auth Gateway" Edge Function for defense-in-depth and robust Row Level Security (RLS) policies. However, critical vulnerabilities exist regarding the exposure of sensitive integration secrets in the frontend bundle and an IDOR vulnerability in the messaging system.

---

## 2. 🔴 High Severity Issues

### Vulnerability: Sensitive OAuth Client Secret Exposure
- **Locations:** `.env.example`, `src/components/integrations/*.ts`
- **Description:** Multiple OAuth client secrets (Google, Slack, Notion, Spotify) are prefixed with `VITE_`. In a Vite-based project, any variable prefixed with `VITE_` is bundled into the client-side JavaScript and is publicly accessible.
- **Risk:** Attackers can steal these secrets to spoof the application, hijack OAuth flows, or gain unauthorized access to integration credentials.
- **Recommendation:** Remove all `VITE_*_CLIENT_SECRET` variables from the frontend. Move OAuth token exchange logic to a server-side component (e.g., Supabase Edge Functions) where secrets are stored securely.

---

## 3. 🟡 Medium Severity Issues

### Vulnerability: Insecure Direct Object Reference (IDOR) in Messaging
- **Location:** `supabase/migrations/20260301_messaging_tables.sql`
- **Description:** The RLS policy `"Members can add other members"` for `conversation_members` allows any authenticated user to insert themselves into any conversation if they know the `conversation_id` (UUID).
- **Risk:** An attacker can join private conversations or group chats by discovering a conversation ID, bypassing privacy controls.
- **Recommendation:** Modify the RLS policy to require that the adder is already a member and that the new member was formally invited.

### Vulnerability: Unauthenticated Access to Messaging Notifications
- **Location:** `supabase/functions/messaging-notifications/index.ts`
- **Description:** The Edge Function used for push notifications is triggered by a database trigger but does not require an Authorization header or secret key.
- **Risk:** Anyone knowing the function URL can trigger arbitrary push notifications to users by providing valid IDs, leading to spam and ID enumeration.
- **Recommendation:** Implement a shared secret or require the service role key for the Edge Function; update the database trigger to pass this key.

---

## 4. 🔵 Low Severity & Reliability Issues

### Insecure Storage Integrity Hash
- **Location:** `src/components/timer/utils/storageIntegrity.ts`
- **Description:** Uses a non-cryptographic 32-bit `simpleHash` for integrity checks.
- **Risk:** While good for detecting corruption, it is trivial for an attacker to recalculate the checksum after tampering.
- **Recommendation:** Use for reliability only, or switch to a robust cryptographic HMAC if security is the goal.

### Storage Strategy Discrepancy
- **Location:** `src/store/useHabitStore.ts`, `src/store/useTaskStore.ts`
- **Description:** Habits, Tasks, and Categories use `localStorage`-only Zustand stores, unlike the Timer module which uses "Tiered Storage" with cloud sync and integrity checks.
- **Risk:** Potential for data loss and lack of tampering detection for core habit data.
- **Recommendation:** Unify the storage strategy by extending `TieredStorageService` to all primary data modules.

### Non-functional Frontend Logging
- **Location:** `src/lib/security/loginActivity.ts`
- **Description:** Frontend attempts to `INSERT` into `login_activity`, but RLS correctly restricts this to the service role.
- **Risk:** The call fails silently, giving a false sense of security that client-side activity is being tracked.
- **Recommendation:** Rely solely on server-side logging within the `auth-gateway` Edge Function.

---

## 5. Positive Security Observations
- **Auth Gateway:** Server-side proxy for auth flows (Turnstile + Rate Limiting) is an excellent architectural choice.
- **Account Lockout:** Properly implemented with generic 401 responses to prevent account enumeration.
- **Data Validation:** Consistent use of Zod schemas at the frontend boundary.
- **XSS Mitigation:** Documented rationale for `localStorage` use and proactive use of `DOMPurify` for QR codes.

---
**Audit performed by Gemini CLI**
