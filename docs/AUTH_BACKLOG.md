# Auth Security Backlog

Items from the full auth implementation plan that should be done when their trigger conditions are met.

> Last updated: 2026-04-03

## ✅ Completed

| ID | Item | Date |
|---|---|---|
| P0-1 | `.env` removed from git tracking | Already done (pre-existing) |
| P1-3 | Atomic logout cleanup | 2026-04-03 |
| P3-2 | Reduce JWT TTL to 15 minutes | 🔧 Manual — see [Dashboard Steps](#dashboard-steps) |
| P3-3 | Enable refresh token rotation | 🔧 Manual — see [Dashboard Steps](#dashboard-steps) |

## 📋 Conditional Backlog

| ID | Item | Trigger | Effort | Priority |
|---|---|---|---|---|
| P0-2 | Move OAuth client secrets to edge function proxy | When any integration goes live with **real** OAuth credentials | 1 day | Critical |
| P0-3 | Authenticate `messaging-notifications` edge function | When messaging/push notifications are deployed to production | 2 hours | Critical |
| P1-1 | Fix `rememberDevice` checkbox or remove it | When UX decision is made (fix vs remove) | 2 hours | Medium |
| P1-4 | Fix `login_activity` INSERT RLS policy | When login activity tracking is wired into the login flow | 30 min | Medium |
| P1-5 | Fix IDOR on `conversation_members` insert policy | When messaging feature is deployed | 2 hours | High |
| P1-6 | Create `profiles` table migration | When any feature requires user profiles (messaging, social) | 1 hour | High |

## ❌ Deferred (Skip for Now)

These are valid improvements but over-engineered for the current stage. Revisit when scaling.

| ID | Item | Revisit When |
|---|---|---|
| P1-2 | 401 replay queue (`fetchWithRetry`) | If users report broken UI due to expired tokens |
| P2-1 | Wire `sessionManager.ts` into login flow | When session management dashboard is needed |
| P2-2 | Wire `deviceVerification.ts` into login flow | When device trust UX is designed |
| P2-3 | Risk scoring in auth gateway | When login abuse is detected at scale |
| P3-1 | Route token refresh through auth gateway | When refresh token theft is a concern |
| P3-5 | Capacitor Android secure storage | When Android app handles sensitive user data |
| P4-1 | Token denylist for real session revocation | When remote session termination is a product requirement |
| P4-2 | Scheduled session cleanup (pg_cron) | When session management is wired in |
| F1 | Passkeys / FIDO2 | DAU > 100K or after a password security incident |
| F2 | Edge token validation (Cloudflare Worker) | 10M+ users |
| F3 | Distributed session store (Redis) | 50M+ users |

## Dashboard Steps

These are manual Supabase dashboard changes (no code needed):

### P3-2: Reduce JWT TTL to 15 Minutes

1. Go to **Supabase Dashboard** → your project
2. Navigate to **Authentication** → **Settings**
3. Find **JWT expiry** setting
4. Change to `900` (seconds = 15 minutes)
5. Save

### P3-3: Enable Refresh Token Rotation

1. Go to **Supabase Dashboard** → your project
2. Navigate to **Authentication** → **Settings**
3. Find **Refresh Token Rotation**
4. Toggle to **Enabled**
5. Set **Reuse Interval** to `0` (single-use, no grace period)
6. Save

### Verification

After both changes:
- [ ] App sessions remain active (auto-refresh working)
- [ ] `expires_at` in localStorage shows ~900 seconds from login
- [ ] Using the same refresh token twice returns an error
