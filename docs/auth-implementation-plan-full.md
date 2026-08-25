# HabitFlow — Full Auth Implementation Plan

**Version:** 1.0  
**Stack:** React 18 + Vite + Supabase + Capacitor Android  
**Prepared for:** Agent execution  
**Execute in order:** P0 → P1 → P2 → P3 → P4 → Future  

---

## Table of Contents

1. [P0 — Critical Security Fixes](#p0)
2. [P1 — Core Auth Correctness](#p1)
3. [P2 — Session & Device Layer](#p2)
4. [P3 — Hardening & Routing](#p3)
5. [P4 — Infrastructure & Revocation](#p4)
6. [Future — Passkeys & Scale](#future)
7. [Master Verification Checklist](#verification)
8. [Hard Rules for Agent](#rules)

---

## P0 — Critical Security Fixes (Do Before Everything Else) {#p0}

> These are active vulnerabilities. No roadmap work begins until all P0 items are complete and verified.

---

### P0-1 — Remove `.env` from Git and Rotate All Keys

**Problem:** `.env` is tracked in git. `VITE_SUPABASE_ANON_KEY`, `VITE_SENTRY_DSN`, and other credentials are committed to version history. Even after deletion they remain in git history permanently unless history is rewritten.

**Files to modify:**
- `.gitignore`
- `.env` (remove from tracking, do not delete the file itself)

**Step-by-step:**

```bash
# Step 1 — remove from git tracking without deleting the file
git rm --cached .env
git rm --cached .env.local 2>/dev/null || true

# Step 2 — add to .gitignore
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo ".env.*.local" >> .gitignore

# Step 3 — commit the removal
git add .gitignore
git commit -m "chore: remove .env from git tracking"
```

**Keys to rotate immediately after (every single one):**

| Key | Where to rotate |
|---|---|
| `VITE_SUPABASE_ANON_KEY` / `SUPABASE_ANON_KEY` | Supabase dashboard → Settings → API → Rotate anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase dashboard → Settings → API → Rotate service role key |
| `VITE_SENTRY_DSN` | Sentry dashboard → Project Settings → Client Keys → Revoke + create new |
| `TURNSTILE_SECRET_KEY` | Cloudflare dashboard → Turnstile → Rotate secret |
| `VITE_TURNSTILE_SITE_KEY` | Cloudflare dashboard → Turnstile → Regenerate site key |
| `VAPID_PRIVATE_KEY` | Regenerate VAPID key pair: `npx web-push generate-vapid-keys` |
| `VITE_GOOGLE_CLIENT_SECRET` | Google Cloud Console → Credentials → Regenerate |
| `VITE_NOTION_CLIENT_SECRET` | Notion developers → Regenerate |
| `VITE_SLACK_CLIENT_SECRET` | Slack API dashboard → Regenerate |
| `VITE_SPOTIFY_CLIENT_SECRET` | Spotify developer dashboard → Regenerate |

After rotating, update the values in your deployment environment (Vercel/Netlify env vars) and in your local `.env` file. Never commit `.env` again.

**Verification:**
- [ ] `git ls-files .env` returns nothing
- [ ] `.gitignore` contains `.env`
- [ ] All keys above have been rotated in their respective dashboards
- [ ] New key values are set in Vercel/Netlify environment variables
- [ ] App boots and connects to Supabase successfully with new keys

---

### P0-2 — Move OAuth Client Secrets to Edge Functions

**Problem:** `VITE_GOOGLE_CLIENT_SECRET`, `VITE_NOTION_CLIENT_SECRET`, `VITE_SLACK_CLIENT_SECRET`, `VITE_SPOTIFY_CLIENT_SECRET` are prefixed with `VITE_` which means Vite bundles them into the JavaScript that ships to the browser. Anyone can open DevTools → Sources and read them. OAuth client secrets must never exist on the client.

**Files to create:**
- `supabase/functions/oauth-proxy/index.ts` ← new Edge Function

**Files to modify:**
- `src/components/integrations/googleCalendar.ts`
- `src/components/integrations/notion.ts`
- `src/components/integrations/slack.ts`
- `src/components/integrations/spotify.ts` (and `src/components/integrations/googleFit.ts` if applicable)
- `.env.example` — remove all `VITE_*_CLIENT_SECRET` entries
- `.env` — remove all `VITE_*_CLIENT_SECRET` entries

**Step 1 — Create the OAuth proxy Edge Function**

Create `supabase/functions/oauth-proxy/index.ts`:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const ALLOWED_ORIGINS = [
  Deno.env.get("APP_BASE_URL") ?? "",
  "https://localhost",
  "http://localhost:5173",
];

const corsHeaders = (origin: string) => ({
  "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
  "Access-Control-Allow-Headers": "authorization, content-type, apikey",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
});

// Provider config — secrets live here, never on client
const PROVIDERS: Record<string, { clientId: string; clientSecret: string; tokenUrl: string }> = {
  google: {
    clientId: Deno.env.get("GOOGLE_CLIENT_ID") ?? "",
    clientSecret: Deno.env.get("GOOGLE_CLIENT_SECRET") ?? "",
    tokenUrl: "https://oauth2.googleapis.com/token",
  },
  notion: {
    clientId: Deno.env.get("NOTION_CLIENT_ID") ?? "",
    clientSecret: Deno.env.get("NOTION_CLIENT_SECRET") ?? "",
    tokenUrl: "https://api.notion.com/v1/oauth/token",
  },
  slack: {
    clientId: Deno.env.get("SLACK_CLIENT_ID") ?? "",
    clientSecret: Deno.env.get("SLACK_CLIENT_SECRET") ?? "",
    tokenUrl: "https://slack.com/api/oauth.v2.access",
  },
  spotify: {
    clientId: Deno.env.get("SPOTIFY_CLIENT_ID") ?? "",
    clientSecret: Deno.env.get("SPOTIFY_CLIENT_SECRET") ?? "",
    tokenUrl: "https://accounts.spotify.com/api/token",
  },
};

serve(async (req) => {
  const origin = req.headers.get("origin") ?? "";
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders(origin) });
  }

  // Require valid Supabase auth — user must be logged in to use OAuth proxy
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
    });
  }

  const { provider, code, redirectUri, grantType = "authorization_code" } = await req.json();

  if (!provider || !PROVIDERS[provider]) {
    return new Response(JSON.stringify({ error: "unknown_provider" }), {
      status: 400,
      headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
    });
  }

  const { clientId, clientSecret, tokenUrl } = PROVIDERS[provider];

  const body = new URLSearchParams({
    grant_type: grantType,
    client_id: clientId,
    client_secret: clientSecret,
    code,
    redirect_uri: redirectUri,
  });

  const tokenRes = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  const tokenData = await tokenRes.json();

  return new Response(JSON.stringify(tokenData), {
    status: tokenRes.status,
    headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
  });
});
```

**Step 2 — Add secrets to Edge Function environment (not frontend)**

In Supabase dashboard → Edge Functions → Secrets, add:
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `NOTION_CLIENT_ID`
- `NOTION_CLIENT_SECRET`
- `SLACK_CLIENT_ID`
- `SLACK_CLIENT_SECRET`
- `SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET`

**Step 3 — Update each integration file to call the proxy**

Example for `src/components/integrations/notion.ts`. Apply same pattern to all integrations:

```typescript
// BEFORE — secret exposed on client
const CLIENT_ID = import.meta.env.VITE_NOTION_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_NOTION_CLIENT_SECRET; // ← REMOVE THIS

// AFTER — exchange code via server proxy, no secret on client
import { supabase } from '../../lib/supabase';

const CLIENT_ID = import.meta.env.VITE_NOTION_CLIENT_ID; // public ID is fine on client
const REDIRECT_URI = import.meta.env.VITE_NOTION_REDIRECT_URI;
const PROXY_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/oauth-proxy`;

export async function exchangeNotionCode(code: string): Promise<string> {
  const session = await supabase.auth.getSession();
  const token = session.data.session?.access_token;

  const res = await fetch(PROXY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      provider: "notion",
      code,
      redirectUri: REDIRECT_URI,
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "OAuth exchange failed");
  return data.access_token;
}
```

**Step 4 — Remove VITE_*_CLIENT_SECRET from .env.example and .env**

```bash
# Remove secret lines from .env.example
sed -i '/VITE_GOOGLE_CLIENT_SECRET/d' .env.example
sed -i '/VITE_NOTION_CLIENT_SECRET/d' .env.example
sed -i '/VITE_SLACK_CLIENT_SECRET/d' .env.example
sed -i '/VITE_SPOTIFY_CLIENT_SECRET/d' .env.example

# Same for .env
sed -i '/VITE_GOOGLE_CLIENT_SECRET/d' .env
sed -i '/VITE_NOTION_CLIENT_SECRET/d' .env
sed -i '/VITE_SLACK_CLIENT_SECRET/d' .env
sed -i '/VITE_SPOTIFY_CLIENT_SECRET/d' .env
```

**Verification:**
- [ ] `grep -r "VITE_.*CLIENT_SECRET" src/` returns nothing
- [ ] `grep -r "VITE_.*CLIENT_SECRET" .env.example` returns nothing
- [ ] OAuth proxy Edge Function deploys successfully
- [ ] Google Calendar OAuth flow completes end-to-end via proxy
- [ ] Notion OAuth flow completes end-to-end via proxy

---

### P0-3 — Authenticate `messaging-notifications` Edge Function

**Problem:** `supabase/functions/messaging-notifications/index.ts` has no authentication check. Any caller can trigger push notifications to any user. Your own security audit flagged this at `docs/SECURITY_AUDIT_2026-03-16.md:28`.

**Files to modify:**
- `supabase/functions/messaging-notifications/index.ts`

**Step 1 — Add auth check at the top of the serve handler**

Add this block immediately after the CORS OPTIONS check, before any other logic:

```typescript
// Verify caller is authenticated and is the Supabase service role or a valid user
const authHeader = req.headers.get("authorization");
const apiKey = req.headers.get("apikey");
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const isServiceRole = apiKey === serviceRoleKey || authHeader === `Bearer ${serviceRoleKey}`;

if (!isServiceRole) {
  // Also accept valid user JWTs — verify with Supabase admin client
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
    });
  }
  // If you want to allow user-initiated notifications, verify the JWT here
  // For now, restrict to service role only (called from DB triggers/other functions)
  return new Response(JSON.stringify({ error: "unauthorized" }), {
    status: 401,
    headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
  });
}
```

**Step 2 — Update all callers**

Any code that calls `messaging-notifications` directly must pass the service role key. Since this function is typically called from database triggers or other Edge Functions (not from the frontend), verify no frontend code calls it directly:

```bash
grep -r "messaging-notifications" src/ --include="*.ts" --include="*.tsx"
```

If any frontend calls exist, route them through a secure intermediary Edge Function instead.

**Verification:**
- [ ] Unauthenticated POST to `messaging-notifications` returns 401
- [ ] Authenticated call (with service role key) succeeds
- [ ] No frontend code directly calls `messaging-notifications`

---

## P1 — Core Auth Correctness {#p1}

> These fix broken behavior. Execute after all P0 items are verified complete.

---

### P1-1 — Fix `rememberDevice` Checkbox (sessionStorage vs localStorage)

**Problem:** `rememberDevice` checkbox at `src/pages/auth/Login.tsx:48` does nothing. All sessions persist in `localStorage` regardless. This is a broken promise to users.

**Files to modify:**
- `src/lib/supabase.ts`
- `src/pages/auth/Login.tsx`
- `src/lib/auth/AuthContext.tsx`
- `src/lib/auth/logout.ts`

**Step 1 — Refactor Supabase client into a factory function in `src/lib/supabase.ts`**

```typescript
// ADD this factory function
export function createSupabaseClient(storage: Storage = window.localStorage) {
  return createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY,
    {
      auth: {
        storage,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    }
  );
}

// KEEP the default export for non-auth usage (data queries etc.)
export const supabase = createSupabaseClient(window.localStorage);
```

**Step 2 — Use storage preference at login time in `src/pages/auth/Login.tsx`**

Inside `handleLogin()`, before calling `signInWithPassword` or `callAuthGateway`:

```typescript
import { createSupabaseClient } from '../../lib/supabase';

// Read checkbox state (already in component state as rememberDevice)
const storage = rememberDevice ? window.localStorage : window.sessionStorage;
const authClient = createSupabaseClient(storage);

// Use authClient for the sign-in call
const { data, error } = await authClient.auth.signInWithPassword({ email, password });

// After successful login, persist the storage preference
if (!error) {
  localStorage.setItem(
    'habitflow_session_storage_type',
    rememberDevice ? 'localStorage' : 'sessionStorage'
  );
}
```

For gateway path (`callAuthGateway`), call `applySupabaseSessionFromGateway` with the scoped client:

```typescript
// Pass the storage-aware client to the session application function
await applySupabaseSessionFromGatewayWithClient(gatewayResult, authClient);
```

Update `src/lib/security/authGatewayClient.ts` to accept an optional client parameter in `applySupabaseSessionFromGateway`.

**Step 3 — Read storage preference on init in `src/lib/auth/AuthContext.tsx`**

At the top of the AuthContext provider, before setting up `onAuthStateChange`:

```typescript
import { createSupabaseClient } from '../supabase';

// Determine which storage was used at login time
const storageType = localStorage.getItem('habitflow_session_storage_type') ?? 'localStorage';
const storage = storageType === 'sessionStorage' ? window.sessionStorage : window.localStorage;
const client = createSupabaseClient(storage);

// Use `client` instead of `supabase` for auth state listening
const { data: { subscription } } = client.auth.onAuthStateChange((event, session) => {
  // existing handler
});
```

**Step 4 — Clean up on logout in `src/lib/auth/logout.ts`**

Add to the cleanup block:

```typescript
localStorage.removeItem('habitflow_session_storage_type');
```

**Verification:**
- [ ] Checkbox unchecked → login → close tab → reopen browser → user is logged out
- [ ] Checkbox checked → login → close tab → reopen browser → user is still logged in
- [ ] `habitflow_session_storage_type` is removed from localStorage after logout
- [ ] Google/Apple OAuth paths respect the same storage preference

---

### P1-2 — Add 401 Replay Queue (fetchWithRetry)

**Problem:** No app-level 401 handling exists. If a Supabase data request fires while the access token is expired, it fails silently with no recovery. The user sees broken UI.

**Files to create:**
- `src/lib/supabase/fetchWithRetry.ts`

**Files to modify:**
- Every file that calls `supabase.from(...)`, `supabase.rpc(...)`, or similar data methods.

**Step 1 — Find all affected files**

```bash
grep -rl "supabase\.\(from\|rpc\|storage\|functions\)" src/ \
  --include="*.ts" --include="*.tsx" \
  | grep -v "src/lib/supabase.ts" \
  | grep -v "src/lib/auth/" \
  | grep -v "src/lib/security/authGatewayClient.ts"
```

**Step 2 — Create `src/lib/supabase/fetchWithRetry.ts`**

```typescript
import { supabase } from '../supabase';

type QueryFn<T> = () => Promise<{ data: T | null; error: any }>;

export async function fetchWithRetry<T>(queryFn: QueryFn<T>): Promise<{ data: T | null; error: any }> {
  const result = await queryFn();

  // Only retry on auth errors
  if (result.error && (result.error.status === 401 || result.error.message?.includes('JWT'))) {
    const { error: refreshError } = await supabase.auth.refreshSession();

    if (refreshError) {
      // Refresh failed — AuthContext will handle redirect to login
      return result;
    }

    // Single retry with fresh token
    return await queryFn();
  }

  return result;
}
```

**Step 3 — Wrap all data calls**

For every file found in Step 1, wrap the data calls:

```typescript
// BEFORE
const { data, error } = await supabase.from('habits').select('*');

// AFTER
import { fetchWithRetry } from '../lib/supabase/fetchWithRetry';
const { data, error } = await fetchWithRetry(() => supabase.from('habits').select('*'));
```

**Do NOT wrap:**
- `supabase.auth.*` calls
- Calls inside `src/lib/auth/`
- Calls inside `src/lib/security/authGatewayClient.ts`
- Calls inside Supabase Edge Functions

**Verification:**
- [ ] Manually set `expires_at` in localStorage to a past timestamp, trigger a data fetch, confirm it succeeds without user-visible error
- [ ] Network tab shows exactly 2 requests for an expired-token scenario — original + 1 retry
- [ ] A genuine 404 or 500 error does NOT trigger a retry
- [ ] No infinite loops under any condition

---

### P1-3 — Atomic Logout Cleanup

**Problem:** `src/lib/auth/logout.ts` cleans up storage sequentially with swallowed errors. A crash mid-logout can leave stale tokens behind.

**Files to modify:**
- `src/lib/auth/logout.ts`

**Step 1 — Reorder: server revocation always first**

```typescript
export async function logout(scope: 'local' | 'global' = 'local') {
  // Step 1: Server-side revocation first — always, even if it fails
  try {
    await supabase.auth.signOut({ scope });
  } catch (e) {
    console.error('signOut failed, proceeding with local cleanup', e);
  }

  // Step 2: Preserve keys that survive logout
  const theme = localStorage.getItem('theme');

  // Step 3: Single-pass clear — no partial state windows
  try {
    localStorage.clear();
    sessionStorage.clear();
  } catch (e) {
    console.error('Storage clear failed', e);
  }

  // Step 4: Restore preserved keys
  if (theme) localStorage.setItem('theme', theme);

  // Step 5: IndexedDB — best effort, log failures
  await clearIndexedDB();

  // Step 6: Navigate to login
  window.location.href = '/login';
}

async function clearIndexedDB(): Promise<void> {
  if (!indexedDB.databases) return;
  try {
    const databases = await indexedDB.databases();
    await Promise.allSettled(
      databases.map(
        (db) =>
          new Promise<void>((resolve) => {
            const req = indexedDB.deleteDatabase(db.name!);
            req.onsuccess = () => resolve();
            req.onerror = () => {
              console.error(`IndexedDB delete failed: ${db.name}`, req.error);
              resolve();
            };
          })
      )
    );
  } catch (e) {
    console.error('IndexedDB cleanup failed', e);
  }
}
```

**Verification:**
- [ ] After logout: `sb-wlaokzkrgrsulxneebsx-auth-token` absent from localStorage
- [ ] After logout: `habitflow_device_id` absent
- [ ] After logout: `habitflow_session_storage_type` absent
- [ ] `theme` preference survives logout
- [ ] IndexedDB databases cleared after "clear local data" logout
- [ ] DevTools → Application confirms clean state

---

### P1-4 — Fix `login_activity` INSERT RLS Policy

**Problem:** `recordLoginActivity()` in `src/lib/security/loginActivity.ts:75` tries to insert into `login_activity` from the client, but the migration at `supabase/migrations/20260223_security_tables_rls.sql:121` only grants `SELECT` and `DELETE`. Every login activity record is silently failing. Your audit log is empty.

**Files to create:**
- `supabase/migrations/20260310_fix_login_activity_insert_policy.sql`

```sql
-- Fix missing INSERT policy on login_activity table
-- Authenticated users can only insert their own activity records

CREATE POLICY "Users can insert own login activity"
  ON login_activity
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
```

**Deploy:**
```bash
supabase db push
# or via Supabase dashboard → SQL Editor
```

**Verification:**
- [ ] Login as a test user and confirm a row appears in `login_activity`
- [ ] Confirm a user cannot insert a row with a different `user_id` (should be rejected by RLS)

---

### P1-5 — Fix IDOR on `conversation_members` Insert Policy

**Problem:** Your security audit at `docs/SECURITY_AUDIT_2026-03-16.md:22` flagged an IDOR (Insecure Direct Object Reference) risk on the `conversation_members` insert policy. A user can potentially add themselves to any conversation.

**Files to create:**
- `supabase/migrations/20260311_fix_conversation_members_idor.sql`

**Step 1 — Audit current policy**

```bash
# Read the current policy from the messaging migration
grep -A 20 "conversation_members" supabase/migrations/20260301_messaging_tables.sql | grep -A 10 "INSERT"
```

**Step 2 — Tighten the insert policy**

The correct rule: a user can only be added to a conversation if they are invited by an existing member, or if they are creating a new conversation (both members added at creation time by the same user).

```sql
-- Drop existing permissive insert policy
DROP POLICY IF EXISTS "Users can join conversations" ON conversation_members;

-- Replacement: users can only insert themselves, and only into conversations
-- they created OR where an existing member added them via a server-side function
CREATE POLICY "Users can insert themselves into conversations"
  ON conversation_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND (
      -- They are the creator of the conversation
      EXISTS (
        SELECT 1 FROM conversations
        WHERE conversations.id = conversation_id
        AND conversations.created_by = auth.uid()
      )
    )
  );

-- All other member additions must go through a Supabase Edge Function
-- using the service role key (bypasses RLS), which validates the invite logic
```

**Step 3 — Create `invite-to-conversation` Edge Function for server-side adds**

Create `supabase/functions/invite-to-conversation/index.ts` that:
1. Verifies the requesting user is already a member of the conversation
2. Verifies the target user exists
3. Inserts the new member using the admin client (bypasses RLS)

This is a stub — implement based on your conversation/invite UX design.

**Verification:**
- [ ] A user cannot add themselves to a conversation they didn't create
- [ ] A user can create a new conversation with an initial member list
- [ ] Invite flow (via Edge Function) works correctly

---

### P1-6 — Create Missing `profiles` Table Migration

**Problem:** `supabase/functions/messaging-notifications/index.ts:141` queries the `profiles` table but no migration exists for it in this repo. Messaging notifications that reference profile data will fail.

**Files to create:**
- `supabase/migrations/20260312_create_profiles_table.sql`

```sql
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  email TEXT,
  bio TEXT,
  avatar_url TEXT,
  banner_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by authenticated users"
  ON profiles FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

**Verification:**
- [ ] Migration runs without error: `supabase db push`
- [ ] New user signup creates a row in `profiles`
- [ ] `messaging-notifications` function can query `profiles` without error

---

## P2 — Session & Device Layer {#p2}

> Wire the security infrastructure you've already built but not connected.

---

### P2-1 — Wire `sessionManager.ts` into Login Flow

**Problem:** `src/lib/security/sessionManager.ts` is complete but no runtime code calls it. The `user_sessions` table is populated by nothing. Session audit is non-functional.

**Files to modify:**
- `src/lib/security/authGatewayClient.ts` — wire `createSession` after successful login
- `src/lib/auth/AuthContext.tsx` — wire `updateSessionActivity` on auth state changes
- `src/lib/auth/logout.ts` — wire `terminateSession` on logout

**Step 1 — Call `createSession` after login in `src/lib/security/authGatewayClient.ts`**

After `supabase.auth.setSession(...)` succeeds (line 94 area):

```typescript
import { createSession } from './sessionManager';
import { generateDeviceId, generateDeviceName } from './deviceVerification';

// After setSession succeeds:
const deviceId = generateDeviceId(); // reads or creates habitflow_device_id
const deviceName = generateDeviceName();

await createSession({
  userId: session.user.id,
  sessionToken: session.access_token, // use access token as session identifier
  deviceInfo: {
    deviceId,
    deviceName,
    userAgent: navigator.userAgent,
  },
  ipAddress: null, // not available client-side — populate server-side if needed
});
```

**Step 2 — Call `updateSessionActivity` periodically in `src/lib/auth/AuthContext.tsx`**

After receiving a `TOKEN_REFRESHED` or `SIGNED_IN` event:

```typescript
import { updateSessionActivity } from '../security/sessionManager';

// Inside onAuthStateChange handler:
if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
  if (session) {
    // Fire and forget — don't block the auth flow
    updateSessionActivity(session.access_token).catch(console.error);
  }
}
```

**Step 3 — Call `terminateSession` on logout in `src/lib/auth/logout.ts`**

Before clearing storage:

```typescript
import { terminateSession } from '../security/sessionManager';

// Get current session token before clearing
const { data: { session } } = await supabase.auth.getSession();
if (session?.access_token) {
  await terminateSession(session.access_token).catch(console.error);
}
```

**Verification:**
- [ ] After login, a new row exists in `user_sessions`
- [ ] `last_activity` updates when token refreshes
- [ ] After logout, `is_active = false` for the session row
- [ ] `getUserSessions()` returns correct data for `SessionManagement.tsx`

---

### P2-2 — Wire `deviceVerification.ts` into Login Flow

**Problem:** `src/lib/security/deviceVerification.ts` is complete but not called by any runtime code. The `trusted_devices` table is empty. Device-based auth gating does nothing.

**Files to modify:**
- `src/pages/auth/Login.tsx` — check device trust after successful login
- `src/lib/security/authGatewayClient.ts` — pass device ID to gateway

**Step 1 — Check device trust after login in `src/pages/auth/Login.tsx`**

After a successful login (before navigating away):

```typescript
import { requiresDeviceVerification, addTrustedDevice, generateDeviceId, generateDeviceName } from '../../lib/security/deviceVerification';

// After successful login:
const needsVerification = await requiresDeviceVerification(user.id);

if (needsVerification) {
  // Redirect to device verification flow
  // For now: show a "Trust this device?" modal
  // The user must confirm before being let through to protected routes
  navigate('/verify-device', { state: { userId: user.id } });
  return;
}

// Device is trusted — proceed normally
navigate('/today');
```

**Step 2 — Create device verification page**

Create `src/pages/auth/DeviceVerification.tsx`:
- Shows the device name and asks "Trust this device?"
- On confirm: calls `addTrustedDevice(userId, deviceId, deviceName)`, then navigates to `/today`
- On deny: logs out the session, navigates to `/login`

**Step 3 — Pass device ID to auth gateway**

In `src/lib/security/authGatewayClient.ts`, include device ID in the gateway request body:

```typescript
import { generateDeviceId, generateDeviceName } from './deviceVerification';

// In callAuthGateway:
body: JSON.stringify({
  ...existingBody,
  deviceId: generateDeviceId(),
  deviceName: generateDeviceName(),
})
```

Update `supabase/functions/auth-gateway/index.ts` to log device info alongside the login event.

**Verification:**
- [ ] First login from a new device triggers the device verification flow
- [ ] Trusting a device creates a row in `trusted_devices`
- [ ] Subsequent logins from the same device skip verification
- [ ] `removeTrustedDevice()` from `SessionManagement.tsx` removes the device from the trusted list

---

### P2-3 — Add Risk Scoring to Auth Gateway

**Problem:** No risk-based analysis on login events. All successful credential checks pass through unconditionally. At scale this is the primary vector for account takeovers.

**Files to modify:**
- `supabase/functions/auth-gateway/index.ts`

**Step 1 — Create risk score function inside the Edge Function**

Add after the existing rate-limit and lockout checks:

```typescript
interface RiskInput {
  userId: string;
  deviceId: string;
  ipAddress: string;
  userAgent: string;
}

async function computeRiskScore(input: RiskInput, adminClient: any): Promise<number> {
  let score = 0;

  // Factor 1: Is this a known trusted device? (-20 points if yes)
  const { data: trustedDevice } = await adminClient
    .from('trusted_devices')
    .select('id')
    .eq('user_id', input.userId)
    .eq('device_id', input.deviceId)
    .eq('is_trusted', true)
    .single();

  if (!trustedDevice) score += 30; // unknown device

  // Factor 2: Recent failed attempts from this IP
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  const { count: failedAttempts } = await adminClient
    .from('login_attempts')
    .select('id', { count: 'exact' })
    .eq('ip_address', input.ipAddress)
    .eq('success', false)
    .gte('created_at', fifteenMinutesAgo);

  if ((failedAttempts ?? 0) >= 3) score += 40;

  // Factor 3: First login ever for this user (new account)
  const { count: totalLogins } = await adminClient
    .from('login_activity')
    .select('id', { count: 'exact' })
    .eq('user_id', input.userId);

  if ((totalLogins ?? 0) === 0) score += 10;

  return score;
}
```

**Step 2 — Enforce risk score in login handler**

After credential verification succeeds, before returning the session:

```typescript
const riskScore = await computeRiskScore({
  userId: authUser.id,
  deviceId: body.deviceId ?? '',
  ipAddress: req.headers.get('x-forwarded-for') ?? '',
  userAgent: req.headers.get('user-agent') ?? '',
}, adminClient);

// High risk: require MFA even if not enrolled (force enrollment flow)
if (riskScore >= 60) {
  return new Response(JSON.stringify({
    error: 'high_risk_login',
    message: 'Additional verification required',
    riskScore,
  }), { status: 403, headers: corsHeaders });
}

// Medium risk: require MFA if enrolled, recommend enrollment if not
if (riskScore >= 30) {
  // Existing MFA check already handles enrolled users
  // Add flag for frontend to show "enable MFA" nudge
  loginResponse.mfaRecommended = true;
}
```

**Step 3 — Handle `high_risk_login` on the frontend**

In `src/pages/auth/Login.tsx`, handle the new error code:

```typescript
if (gatewayError?.code === 'high_risk_login') {
  // Show "Suspicious login detected" message
  // Offer options: verify via email OTP, or contact support
  setError('Unusual login detected. Please verify your identity.');
  navigate('/verify-identity', { state: { email } });
  return;
}
```

**Verification:**
- [ ] Login from a new device raises risk score by 30
- [ ] 3+ recent failed attempts from same IP raises score by 40
- [ ] Score >= 60 blocks login and returns `high_risk_login`
- [ ] Trusted device login has reduced score
- [ ] `mfaRecommended` flag surfaces a nudge in the UI

---

## P3 — Hardening & Routing {#p3}

---

### P3-1 — Route Token Refresh Through Auth Gateway

**Problem:** Token refresh goes directly browser → Supabase, bypassing all gateway protections. A stolen refresh token can silently obtain new access tokens. This is `GAP-001` in your security audit.

**Files to modify:**
- `src/lib/supabase.ts`
- `supabase/functions/auth-gateway/index.ts`

**Step 1 — Add refresh endpoint to auth-gateway**

In `supabase/functions/auth-gateway/index.ts`, add a new action handler for `refresh-token`:

```typescript
if (action === 'refresh-token') {
  const { refresh_token } = body;

  if (!refresh_token) {
    return new Response(JSON.stringify({ error: 'missing_refresh_token' }), {
      status: 400, headers: corsHeaders
    });
  }

  // Apply rate limiting to refresh endpoint too
  const rateLimitKey = `refresh:${req.headers.get('x-forwarded-for')}`;
  const limited = await rateLimitCheck(rateLimitKey, 10, 60); // 10 per minute
  if (limited) {
    return new Response(JSON.stringify({ error: 'rate_limited' }), {
      status: 429, headers: corsHeaders
    });
  }

  // Forward to Supabase Auth
  const refreshRes = await fetch(
    `${Deno.env.get('SUPABASE_URL')}/auth/v1/token?grant_type=refresh_token`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      },
      body: JSON.stringify({ refresh_token }),
    }
  );

  const refreshData = await refreshRes.json();
  return new Response(JSON.stringify(refreshData), {
    status: refreshRes.status, headers: corsHeaders
  });
}
```

**Step 2 — Override Supabase's default fetch for token refresh in `src/lib/supabase.ts`**

```typescript
const GATEWAY_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auth-gateway`;
const SUPABASE_TOKEN_URL = `${import.meta.env.VITE_SUPABASE_URL}/auth/v1/token`;

// Custom fetch that intercepts refresh token calls and routes through gateway
async function gatewayAwareFetch(url: RequestInfo, options?: RequestInit): Promise<Response> {
  const urlStr = url.toString();

  if (urlStr.includes('/auth/v1/token') && urlStr.includes('grant_type=refresh_token')) {
    // Route through gateway instead
    const body = options?.body ? JSON.parse(options.body as string) : {};
    return fetch(`${GATEWAY_URL}/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY },
      body: JSON.stringify(body),
    });
  }

  return fetch(url, options);
}

export function createSupabaseClient(storage: Storage = window.localStorage) {
  return createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY,
    {
      auth: {
        storage,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      global: {
        fetch: gatewayAwareFetch, // intercept refresh calls
      },
    }
  );
}
```

**Verification:**
- [ ] Network tab shows refresh calls going to `/functions/v1/auth-gateway` not directly to `/auth/v1/token`
- [ ] Token refresh still works correctly (session stays alive)
- [ ] Rate limiter on refresh endpoint returns 429 after 10 calls/minute

---

### P3-2 — Reduce JWT TTL to 15 Minutes

**Problem:** Default Supabase access token TTL is 1 hour. A stolen token is valid for up to 60 minutes. Reducing to 15 minutes cuts the blast radius by 75%.

**Where to change:** Supabase Dashboard → Authentication → Settings → JWT expiry

Set to: `900` (seconds = 15 minutes)

This is a dashboard change, no code required. After changing:

- Verify `autoRefreshToken: true` is set (it is — `src/lib/supabase.ts:118`)
- Verify `fetchWithRetry` wrapper is in place (P1-2) so any edge case expiry is handled

**Verification:**
- [ ] Supabase dashboard shows JWT expiry = 900 seconds
- [ ] App sessions remain active (auto-refresh working)
- [ ] Manually check `expires_at` in localStorage = now + ~900 seconds after login

---

### P3-3 — Enable Refresh Token Rotation

**Where to change:** Supabase Dashboard → Authentication → Settings → Refresh Token Rotation → Enable

Also enable: **Reuse Interval** = 0 seconds (single-use, no grace period)

This makes stolen refresh tokens single-use. If a stolen token is used, the legitimate user's next refresh will fail and trigger a re-login, alerting them implicitly.

**Verification:**
- [ ] Dashboard shows refresh token rotation = enabled
- [ ] Using the same refresh token twice returns an error

---

### P3-4 — Add Cloudflare WAF Rules

**Problem:** No WAF in front of the app. Auth endpoints have only application-level rate limiting — no IP-level blocking, no bot signature detection.

**Where to configure:** Cloudflare dashboard → Security → WAF → Custom Rules

Add the following rules (in order):

**Rule 1 — Rate limit auth endpoint by IP:**
```
Field: URI Path
Operator: contains
Value: /functions/v1/auth-gateway
AND
Field: Rate → Requests per IP per minute > 20
Action: Block for 10 minutes
```

**Rule 2 — Block known bad user agents:**
```
Field: User Agent
Operator: contains any of
Value: python-requests, curl/7, go-http-client, masscan
Action: Block
```

**Rule 3 — Block credential stuffing patterns (no referrer on auth POST):**
```
Field: HTTP Method = POST
AND URI Path contains /auth-gateway
AND Referer is empty
AND User Agent does not contain Mozilla
Action: Challenge (Turnstile)
```

**Verification:**
- [ ] More than 20 rapid requests from one IP to auth-gateway are blocked
- [ ] App works normally for legitimate browser traffic

---

### P3-5 — Capacitor Android: Secure Storage Plugin

**Problem:** On Android, tokens are stored in the WebView's `localStorage` which maps to a SQLite file on disk. On a rooted device this file is readable. This is the exact gap identified in the Kuaishou APK analysis (unconfirmed `AndroidKeyStore` linkage).

**Files to modify:**
- `package.json`
- `src/lib/supabase.ts`
- `capacitor.config.json`

**Step 1 — Install Capacitor Secure Storage plugin**

```bash
npm install @capacitor/preferences
npx cap sync android
```

**Step 2 — Create a Capacitor-aware storage adapter**

Create `src/lib/storage/capacitorStorage.ts`:

```typescript
import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';

// Implements the Storage interface that Supabase Auth expects
export const capacitorStorage: Storage = {
  get length() { return 0; }, // not used by Supabase Auth
  clear: async () => {
    await Preferences.clear();
  },
  getItem: async (key: string) => {
    const { value } = await Preferences.get({ key });
    return value;
  },
  setItem: async (key: string, value: string) => {
    await Preferences.set({ key, value });
  },
  removeItem: async (key: string) => {
    await Preferences.remove({ key });
  },
  key: () => null, // not used by Supabase Auth
} as any;

export function getPlatformStorage(rememberDevice: boolean): Storage {
  if (Capacitor.isNativePlatform()) {
    // On native, always use Capacitor Secure Storage (Android Keystore backed)
    return capacitorStorage;
  }
  // On web, respect rememberDevice preference
  return rememberDevice ? window.localStorage : window.sessionStorage;
}
```

**Step 3 — Use platform storage in `src/lib/supabase.ts`**

```typescript
import { getPlatformStorage } from './storage/capacitorStorage';

export function createSupabaseClient(rememberDevice = true) {
  const storage = getPlatformStorage(rememberDevice);
  return createClient(/* ... same as before but using getPlatformStorage */);
}
```

**Verification:**
- [ ] On Android: tokens stored via `Preferences` API (backed by Android Keystore)
- [ ] On web: sessionStorage/localStorage based on `rememberDevice`
- [ ] App logs in and stays logged in on Android build
- [ ] Token not readable as plaintext in Android file system

---

## P4 — Infrastructure & Revocation {#p4}

---

### P4-1 — Token Denylist for Real Session Revocation

**Problem:** `SessionManagement.tsx` can set `is_active = false` in `user_sessions` but this doesn't actually invalidate the JWT. The token remains valid until it expires. True remote session termination requires a denylist.

**Files to create:**
- `supabase/migrations/20260320_create_token_denylist.sql`
- `supabase/functions/revoke-session/index.ts`

**Step 1 — Create denylist table**

```sql
CREATE TABLE token_denylist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jti TEXT UNIQUE NOT NULL,         -- JWT ID claim (or session token)
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  revoked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL   -- auto-clean after token would have expired anyway
);

CREATE INDEX idx_token_denylist_jti ON token_denylist(jti);
CREATE INDEX idx_token_denylist_expires ON token_denylist(expires_at);

ALTER TABLE token_denylist ENABLE ROW LEVEL SECURITY;
-- No user-facing RLS policies — this table is service-role only

-- Auto-cleanup expired entries
CREATE OR REPLACE FUNCTION clean_expired_denylist()
RETURNS void AS $$
BEGIN
  DELETE FROM token_denylist WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;
```

**Step 2 — Create revoke-session Edge Function**

Create `supabase/functions/revoke-session/index.ts`:

```typescript
// Called when user terminates a remote session from SessionManagement.tsx
// Uses service role key to add token to denylist

serve(async (req) => {
  // Auth check: must be the session owner
  const { sessionToken, userId } = await req.json();

  // Add to denylist
  const { error } = await adminClient
    .from('token_denylist')
    .insert({
      jti: sessionToken,
      user_id: userId,
      expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 min TTL
    });

  // Also mark session inactive in user_sessions
  await adminClient
    .from('user_sessions')
    .update({ is_active: false })
    .eq('session_token', sessionToken);

  return new Response(JSON.stringify({ success: !error }), { status: 200 });
});
```

**Step 3 — Check denylist in auth-gateway**

At the top of every authenticated request to the gateway, check if the token is denylisted:

```typescript
async function isTokenRevoked(token: string, adminClient: any): Promise<boolean> {
  const { data } = await adminClient
    .from('token_denylist')
    .select('id')
    .eq('jti', token)
    .single();
  return !!data;
}
```

**Step 4 — Wire into `SessionManagement.tsx`**

Replace the current `signOut({ scope: 'local' })` call for remote sessions with a call to `revoke-session`:

```typescript
// In SessionManagement.tsx handleTerminateSession():
await fetch(`${GATEWAY_URL}/revoke-session`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${currentToken}` },
  body: JSON.stringify({ sessionToken: targetSession.session_token, userId: currentUser.id }),
});
```

**Verification:**
- [ ] Terminating a remote session adds entry to `token_denylist`
- [ ] Subsequent request with the revoked token is rejected by the gateway
- [ ] Denylist entries auto-expire after 15 minutes
- [ ] Current session is unaffected when revoking a different session

---

### P4-2 — Wire `sessionManager.cleanExpiredSessions` as a Scheduled Job

**Problem:** Expired rows in `user_sessions` accumulate. `cleanExpiredSessions()` exists but is never called.

**Files to create:**
- `supabase/functions/cleanup-sessions/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

serve(async (req) => {
  // This function is called by Supabase cron (pg_cron) or external scheduler
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const authHeader = req.headers.get("authorization");

  if (authHeader !== `Bearer ${serviceKey}`) {
    return new Response("unauthorized", { status: 401 });
  }

  const adminClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    serviceKey
  );

  // Deactivate expired sessions
  const { error: sessionError } = await adminClient
    .from("user_sessions")
    .update({ is_active: false })
    .lt("expires_at", new Date().toISOString())
    .eq("is_active", true);

  // Clean expired denylist entries
  const { error: denylistError } = await adminClient
    .from("token_denylist")
    .delete()
    .lt("expires_at", new Date().toISOString());

  return new Response(
    JSON.stringify({ sessionError, denylistError }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
});
```

**Schedule via Supabase dashboard → Database → Extensions → pg_cron:**

```sql
SELECT cron.schedule(
  'cleanup-expired-sessions',
  '0 * * * *',  -- every hour
  $$SELECT net.http_post(
    url := 'https://wlaokzkrgrsulxneebsx.supabase.co/functions/v1/cleanup-sessions',
    headers := '{"Authorization": "Bearer <SERVICE_ROLE_KEY>"}'::jsonb
  )$$
);
```

**Verification:**
- [ ] Calling the function manually deactivates expired session rows
- [ ] Cron job runs hourly (check pg_cron logs in Supabase dashboard)

---

## Future — Passkeys & Scale {#future}

> Implement when user base grows or when password-based auth needs to be deprecated.

---

### F1 — Passkeys / FIDO2 (WebAuthn)

**Why:** Passkeys eliminate the password-attack surface entirely. Credentials are device-bound and phishing-resistant. Supabase has experimental Passkey support. On Capacitor Android, device biometrics (fingerprint/face) become the authenticator.

**When to implement:** When DAU exceeds 100K or after a password-related security incident.

**Implementation path:**
1. Enable Passkey experimental feature in Supabase dashboard
2. Add `src/pages/auth/PasskeySetup.tsx` for enrollment
3. Add passkey login option in `src/pages/auth/Login.tsx`
4. On Android: integrate `@capacitor-community/biometric-auth` for native biometric prompt
5. Migrate existing users: prompt to add passkey on next login, gradually deprecate passwords

---

### F2 — Edge Token Validation

**Why:** At 10M+ users, every API request hitting your origin server for token validation becomes a bottleneck. Validate JWTs at the CDN edge (Cloudflare Workers) before requests reach Supabase.

**Implementation path:**
1. Deploy a Cloudflare Worker that validates the JWT signature using the Supabase JWT secret
2. Worker adds `X-User-ID` header to validated requests before forwarding to origin
3. Origin trusts `X-User-ID` without re-validating the JWT
4. Invalid tokens are rejected at the edge — zero origin load

---

### F3 — Distributed Session Store (Redis)

**Why:** At 50M+ users, querying `user_sessions` in Postgres on every request becomes a bottleneck. Sessions should live in a distributed in-memory store.

**Implementation path:**
1. Add Upstash Redis (serverless Redis compatible with Supabase Edge Functions)
2. Migrate `sessionManager.ts` to write sessions to Redis with TTL
3. Keep Postgres as audit log only (async writes)
4. Token denylist also moves to Redis for sub-millisecond revocation checks

---

## Master Verification Checklist {#verification}

Run this checklist after completing each priority tier before moving to the next.

### P0 Complete?
- [ ] `.env` not in `git ls-files`
- [ ] All 10 keys rotated and updated in deployment env
- [ ] `grep -r "VITE_.*CLIENT_SECRET" src/` returns nothing
- [ ] `oauth-proxy` Edge Function deployed and tested
- [ ] Unauthenticated call to `messaging-notifications` returns 401
- [ ] App boots and all features work with new keys

### P1 Complete?
- [ ] `rememberDevice` unchecked = session dies on tab close
- [ ] `rememberDevice` checked = session persists across tabs
- [ ] 401 retry works: expired token → auto-refresh → original request succeeds
- [ ] Logout clears all storage in one pass, preserves theme
- [ ] `login_activity` INSERT works: rows appear after login
- [ ] `conversation_members` IDOR: cannot self-add to arbitrary conversations
- [ ] `profiles` table exists and auto-creates on signup
- [ ] All migrations run without error: `supabase db push`

### P2 Complete?
- [ ] Login creates row in `user_sessions`
- [ ] Logout sets `is_active = false` in `user_sessions`
- [ ] First login from new device triggers device verification flow
- [ ] Trusted device skips verification on subsequent logins
- [ ] Risk score >= 60 blocks login with `high_risk_login`
- [ ] `SessionManagement.tsx` shows real session data

### P3 Complete?
- [ ] Network tab shows refresh calls routed through auth-gateway
- [ ] JWT TTL = 900 seconds in Supabase dashboard
- [ ] Refresh token rotation enabled in Supabase dashboard
- [ ] Cloudflare WAF rules active: 20+ rapid requests blocked
- [ ] Android: tokens not readable as plaintext (Capacitor Secure Storage)

### P4 Complete?
- [ ] Revoking remote session adds to `token_denylist`
- [ ] Revoked token rejected by gateway within 15 minutes
- [ ] `cleanup-sessions` cron job running hourly
- [ ] `user_sessions` expired rows deactivated automatically

---

## Hard Rules for Agent {#rules}

1. **Execute in priority order.** Do not begin P1 until all P0 items are verified. Do not begin P2 until all P1 items are verified.

2. **Never modify `node_modules/`.** All changes are app-level only.

3. **Never remove `autoRefreshToken: true`.** Supabase's built-in refresh machinery is correct and must stay.

4. **`fetchWithRetry` retries exactly once.** Never more. If the second attempt fails, propagate the error. Do not add loops.

5. **Server revocation before local cleanup.** In logout, `supabase.auth.signOut()` always runs before `localStorage.clear()`. Even if it rejects, proceed with local cleanup.

6. **OAuth secrets never in `VITE_` env vars.** Any secret prefixed `VITE_` is public. Integration OAuth flows must use the `oauth-proxy` Edge Function.

7. **Test each fix in isolation** before moving to the next item within a priority tier.

8. **Risk score blocks do not leak information.** The `high_risk_login` response must not tell the attacker which factor raised the score.

9. **RLS policies must always include `WITH CHECK`.** A policy with only `USING` allows reads but not writes with the constraint. Auth data writes need both clauses.

10. **Do not hardcode the Supabase project ref** (`wlaokzkrgrsulxneebsx`) in new code. Always read from `import.meta.env.VITE_SUPABASE_URL` or `Deno.env.get('SUPABASE_URL')`.

---

## Summary Table

| ID | Item | Priority | Effort | Files |
|---|---|---|---|---|
| P0-1 | Remove .env from git + rotate keys | P0 | 1 hour | `.gitignore`, `.env` |
| P0-2 | Move OAuth secrets to edge function | P0 | 1 day | New: `oauth-proxy/index.ts`, 4 integration files |
| P0-3 | Authenticate messaging-notifications | P0 | 2 hours | `messaging-notifications/index.ts` |
| P1-1 | Fix rememberDevice (sessionStorage) | P1 | 1 day | `supabase.ts`, `Login.tsx`, `AuthContext.tsx`, `logout.ts` |
| P1-2 | 401 replay queue (fetchWithRetry) | P1 | 4 hours | New: `fetchWithRetry.ts`, all data call sites |
| P1-3 | Atomic logout cleanup | P1 | 2 hours | `logout.ts` |
| P1-4 | Fix login_activity INSERT RLS | P1 | 30 min | New migration |
| P1-5 | Fix conversation_members IDOR | P1 | 2 hours | New migration, new edge function |
| P1-6 | Create profiles table migration | P1 | 1 hour | New migration |
| P2-1 | Wire sessionManager into login | P2 | 1 day | `authGatewayClient.ts`, `AuthContext.tsx`, `logout.ts` |
| P2-2 | Wire deviceVerification into login | P2 | 1 day | `Login.tsx`, new `DeviceVerification.tsx` |
| P2-3 | Risk scoring in auth-gateway | P2 | 2 days | `auth-gateway/index.ts`, `Login.tsx` |
| P3-1 | Route refresh through gateway | P3 | 1 day | `supabase.ts`, `auth-gateway/index.ts` |
| P3-2 | Reduce JWT TTL to 15 min | P3 | 30 min | Supabase dashboard |
| P3-3 | Enable refresh token rotation | P3 | 15 min | Supabase dashboard |
| P3-4 | Cloudflare WAF rules | P3 | 1 hour | Cloudflare dashboard |
| P3-5 | Capacitor secure storage | P3 | 1 day | `package.json`, `supabase.ts`, new `capacitorStorage.ts` |
| P4-1 | Token denylist + real revocation | P4 | 2 days | New migration, new edge function, `SessionManagement.tsx` |
| P4-2 | Scheduled session cleanup | P4 | 2 hours | New edge function, pg_cron config |
| F1 | Passkeys / FIDO2 | Future | 1 week | `Login.tsx`, new `PasskeySetup.tsx` |
| F2 | Edge token validation | Future | 3 days | Cloudflare Worker |
| F3 | Distributed session store (Redis) | Future | 1 week | `sessionManager.ts`, new Redis adapter |
