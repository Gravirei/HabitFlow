/// <reference lib="deno.ns" />

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type Json = Record<string, unknown>;

/**
 * Returns the allowed CORS origins based on APP_BASE_URL env var.
 * Always includes localhost variants for local development.
 * In production, restricts to the configured app domain only.
 */
function getAllowedOrigins(): string[] {
  const appBaseUrl = Deno.env.get("APP_BASE_URL") ?? "";
  const origins: string[] = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
  ];
  // Add production domain from APP_BASE_URL secret if set and not localhost
  if (appBaseUrl && !appBaseUrl.includes("localhost") && !appBaseUrl.includes("127.0.0.1")) {
    const normalized = appBaseUrl.replace(/\/$/, "");
    if (!origins.includes(normalized)) origins.push(normalized);
  }
  return origins;
}

function getCorsOrigin(req: Request): string {
  const origin = req.headers.get("origin") ?? "";
  const allowed = getAllowedOrigins();
  // Return the exact origin if it's in the allowlist, otherwise deny with a non-matching value
  return allowed.includes(origin) ? origin : allowed[0];
}

function json(data: Json, status = 200, req?: Request) {
  const origin = req ? getCorsOrigin(req) : getAllowedOrigins()[0];
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": origin,
      "access-control-allow-headers": "authorization, x-client-info, apikey, content-type",
      "vary": "Origin",
    },
  });
}

function getIp(req: Request) {
  // Supabase edge typically provides x-forwarded-for
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("cf-connecting-ip") ?? "unknown";
}

async function verifyTurnstile(token: string, ip: string) {
  const secret = Deno.env.get("TURNSTILE_SECRET_KEY");
  if (!secret) {
    // If secret isn't configured, fail closed for production readiness.
    return { ok: false, error: "TURNSTILE_SECRET_KEY not configured" };
  }

  const form = new FormData();
  form.set("secret", secret);
  form.set("response", token);
  if (ip && ip !== "unknown") form.set("remoteip", ip);

  const resp = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: form,
  });

  const data = await resp.json();
  // data: { success: boolean, "error-codes": string[] }
  if (!data?.success) {
    return { ok: false, error: "Turnstile verification failed", details: data };
  }
  return { ok: true };
}

function getSupabaseAdmin() {
  const url = Deno.env.get("SUPABASE_URL")!;
  const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!serviceRole) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY not configured for this function");
  }
  return createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function getSupabaseAuthUrl() {
  // SUPABASE_URL looks like https://xxxx.supabase.co
  const url = Deno.env.get("SUPABASE_URL")!;
  return `${url}/auth/v1`;
}

function getAnonKey() {
  const anon = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_ANON_PUBLIC_KEY");
  if (!anon) throw new Error("SUPABASE_ANON_KEY not configured for this function");
  return anon;
}

async function rateLimitCheck(
  admin: ReturnType<typeof createClient>,
  action: string,
  email: string,
  ip: string,
  maxAttempts: number,
  windowMinutes: number,
) {
  const windowStart = new Date(Date.now() - windowMinutes * 60_000).toISOString();
  const { data, error } = await admin
    .from("login_attempts")
    .select("id")
    .eq("action", action)
    .or(`email.eq.${email},ip_address.eq.${ip}`)
    .eq("success", false)
    .gte("created_at", windowStart);

  if (error) throw error;

  const count = data?.length ?? 0;
  return { allowed: count < maxAttempts, count };
}

async function isLocked(admin: ReturnType<typeof createClient>, email: string) {
  const { data, error } = await admin
    .from("account_lockouts")
    .select("locked_until, reason")
    .eq("email", email)
    .eq("is_locked", true)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) throw error;
  if (!data || data.length === 0) return { locked: false };

  const lockedUntil = data[0].locked_until ? new Date(data[0].locked_until) : null;
  if (!lockedUntil || lockedUntil < new Date()) {
    // unlock stale
    await admin.from("account_lockouts").update({ is_locked: false }).eq("email", email).eq("is_locked", true);
    return { locked: false };
  }

  return { locked: true, lockedUntil: lockedUntil.toISOString(), reason: data[0].reason ?? null };
}

async function recordAttempt(
  admin: ReturnType<typeof createClient>,
  {
    action,
    email,
    ip,
    userAgent,
    success,
    userId,
  }: {
    action: string;
    email: string;
    ip: string;
    userAgent: string;
    success: boolean;
    userId?: string | null;
  },
) {
  await admin.from("login_attempts").insert({
    action,
    email,
    ip_address: ip,
    user_agent: userAgent,
    success,
    user_id: userId ?? null,
  });
}

async function lockAccount(admin: ReturnType<typeof createClient>, email: string, userId: string | null, minutes: number) {
  const until = new Date(Date.now() + minutes * 60_000).toISOString();
  await admin.from("account_lockouts").insert({
    email,
    user_id: userId,
    reason: "Too many failed attempts",
    locked_until: until,
    is_locked: true,
  });
  return until;
}

async function authSignup(email: string, password: string, username?: string) {
  const authUrl = getSupabaseAuthUrl();
  const anon = getAnonKey();

  const resp = await fetch(`${authUrl}/signup`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      apikey: anon,
      authorization: `Bearer ${anon}`,
    },
    body: JSON.stringify({
      email,
      password,
      data: username ? { username } : {},
    }),
  });

  const data = await resp.json();
  return { ok: resp.ok, status: resp.status, data };
}

async function authPasswordLogin(email: string, password: string) {
  const authUrl = getSupabaseAuthUrl();
  const anon = getAnonKey();

  const resp = await fetch(`${authUrl}/token?grant_type=password`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      apikey: anon,
      authorization: `Bearer ${anon}`,
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await resp.json();
  return { ok: resp.ok, status: resp.status, data };
}

function getAppBaseUrl() {
  // Example: http://localhost:3000 or https://yourdomain.com
  return Deno.env.get("APP_BASE_URL") ?? "";
}

function getSupabaseAnonClient() {
  const url = Deno.env.get("SUPABASE_URL")!;
  const anon = getAnonKey();
  return createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function authRecover(email: string) {
  const appBaseUrl = getAppBaseUrl();
  const redirectTo = appBaseUrl
    ? `${appBaseUrl.replace(/\/$/, "")}/reset-password`
    : undefined;

  // Use supabase-js helper to ensure redirectTo is sent in the correct format for GoTrue
  const anonClient = getSupabaseAnonClient();

  const { data, error } = await anonClient.auth.resetPasswordForEmail(email, {
    redirectTo: redirectTo,
  });

  if (error) {
    return { ok: false, status: 400, data: JSON.stringify({ message: error.message }), redirectTo };
  }

  return { ok: true, status: 200, data: JSON.stringify(data ?? {}), redirectTo };
}

/**
 * Fetch enrolled TOTP factors for a user using their aal1 access token.
 * Returns an array of verified TOTP factors. Empty array means no MFA enrolled.
 */
async function getEnrolledMfaFactors(accessToken: string): Promise<Array<{ id: string; factor_type: string; status: string }>> {
  const authUrl = getSupabaseAuthUrl();
  const anon = getAnonKey();

  const resp = await fetch(`${authUrl}/factors`, {
    method: "GET",
    headers: {
      "content-type": "application/json",
      apikey: anon,
      authorization: `Bearer ${accessToken}`,
    },
  });

  if (!resp.ok) return [];

  const data = await resp.json();
  // Filter to only verified TOTP factors (not ones pending enrollment)
  const factors = Array.isArray(data) ? data : [];
  return factors.filter((f: any) => f.factor_type === "totp" && f.status === "verified");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    const corsOrigin = getCorsOrigin(req);
    return new Response(null, {
      status: 204,
      headers: {
        "access-control-allow-origin": corsOrigin,
        "access-control-allow-headers": "authorization, x-client-info, apikey, content-type",
        "access-control-allow-methods": "POST, OPTIONS",
        "vary": "Origin",
      },
    });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.replace(/^\/+/, "");

    if (!path.startsWith("auth-gateway")) {
      return json({ error: "not_found" }, 404, req);
    }

    const action = path.split("/")[1] ?? "";
    if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405, req);

    const admin = getSupabaseAdmin();

    const ip = getIp(req);
    const userAgent = req.headers.get("user-agent") ?? "unknown";
    const body = await req.json().catch(() => ({} as Json));

    const email = String(body.email ?? "").trim().toLowerCase();
    const turnstileToken = String(body.turnstileToken ?? "");

    // verify-mfa is a continuation of an already-authenticated login flow.
    // It uses the aal1_access_token for auth instead of email+turnstile.
    if (action === "verify-mfa") {
      const aal1AccessToken = String(body.aal1_access_token ?? "");
      const factorId = String(body.factor_id ?? "");
      const code = String(body.code ?? "").trim();

      if (!aal1AccessToken) return json({ error: "aal1_access_token_required" }, 400, req);
      if (!factorId) return json({ error: "factor_id_required" }, 400, req);
      if (!code || !/^\d{6}$/.test(code)) return json({ error: "invalid_code_format" }, 400, req);

      // Rate limit MFA attempts by IP to prevent brute-force
      const mfaRl = await rateLimitCheck(admin, "verify-mfa", email || ip, ip, 5, 15);
      if (!mfaRl.allowed) {
        return json({ error: "rate_limited", retryAfterMinutes: 15 }, 429, req);
      }

      const authUrl = getSupabaseAuthUrl();
      const anon = getAnonKey();

      // Step 1: Create MFA challenge
      const challengeResp = await fetch(`${authUrl}/factors/${factorId}/challenge`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          apikey: anon,
          authorization: `Bearer ${aal1AccessToken}`,
        },
      });

      if (!challengeResp.ok) {
        return json({ error: "mfa_challenge_failed" }, 401, req);
      }

      const challengeData = await challengeResp.json();
      const challengeId = challengeData?.id;
      if (!challengeId) return json({ error: "mfa_challenge_failed" }, 401, req);

      // Step 2: Verify TOTP code — elevates session to aal2
      const verifyResp = await fetch(`${authUrl}/factors/${factorId}/verify`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          apikey: anon,
          authorization: `Bearer ${aal1AccessToken}`,
        },
        body: JSON.stringify({ challenge_id: challengeId, code }),
      });

      const verifyData = await verifyResp.json();

      if (!verifyResp.ok) {
        return json({ error: "mfa_verification_failed", message: verifyData?.message ?? "Invalid code" }, 401, req);
      }

      // MFA verified — record success and return full aal2 session tokens
      const userId = verifyData?.user?.id ?? null;
      const userEmail = verifyData?.user?.email ?? email ?? "";

      await admin.from("login_activity").insert({
        user_id: userId,
        email: userEmail,
        ip_address: ip,
        user_agent: userAgent,
        device_info: { userAgent },
        login_type: "password_mfa",
      });

      return json({ ok: true, status: 200, data: verifyData }, 200, req);
    }

    if (!email) return json({ error: "email_required" }, 400, req);
    if (!turnstileToken) return json({ error: "turnstile_required" }, 400, req);

    // Turnstile verify (fail closed if missing secrets)
    const ts = await verifyTurnstile(turnstileToken, ip);
    if (!ts.ok) return json({ error: "turnstile_failed", ...ts }, 403, req);

    // lockout check
    const lock = await isLocked(admin, email);
    if (lock.locked) {
      if (action === "login") {
        // During login, don't reveal that the account is locked — an attacker
        // seeing 423 knows the account exists. Return the same generic 401 as
        // a wrong password so the lockout reason is opaque. The lock is still
        // enforced server-side; we just don't disclose it.
        console.warn(`[auth-gateway/login] Blocked locked account: ${email} (locked until ${lock.lockedUntil})`);
        return json({ ok: false, error: "invalid_credentials" }, 401, req);
      }
      return json({ error: "account_locked", ...lock }, 423, req);
    }

    if (action === "signup") {
      const password = String(body.password ?? "");
      const username = body.username ? String(body.username) : undefined;
      if (!password) return json({ error: "password_required" }, 400, req);

      // rate limit signup
      const rl = await rateLimitCheck(admin, "signup", email, ip, 3, 60);
      if (!rl.allowed) return json({ error: "rate_limited", retryAfterMinutes: 60 }, 429, req);

      const res = await authSignup(email, password, username);
      const success = !!res.ok;
      await recordAttempt(admin, { action: "signup", email, ip, userAgent, success });

      return json({
        ok: res.ok,
        status: res.status,
        data: res.data,
        message: res.ok ? "signup_initiated" : "signup_failed",
      }, res.ok ? 200 : res.status, req);
    }

    if (action === "login") {
      const password = String(body.password ?? "");
      if (!password) return json({ error: "password_required" }, 400, req);

      // rate limit login
      const rl = await rateLimitCheck(admin, "login", email, ip, 5, 15);
      if (!rl.allowed) {
        // lock account after too many failures
        const until = await lockAccount(admin, email, null, 30);
        return json({ error: "rate_limited", lockedUntil: until }, 429, req);
      }

      const res = await authPasswordLogin(email, password);

      const userId = res.ok ? res.data?.user?.id ?? null : null;
      await recordAttempt(admin, { action: "login", email, ip, userAgent, success: res.ok, userId });

      if (!res.ok) {
        // after recording failure, see if we should lock
        const rl2 = await rateLimitCheck(admin, "login", email, ip, 5, 15);
        if (!rl2.allowed) {
          const until = await lockAccount(admin, email, userId, 30);
          // Don't reveal to the client that this specific failure triggered a lockout
          // (which would confirm the account exists). Log server-side and return the
          // same generic 401 as a wrong password.
          console.warn(`[auth-gateway/login] Account locked after too many failures: ${email} (locked until ${until})`);
          return json({ ok: false, error: "invalid_credentials" }, 401, req);
        }
        return json({ ok: false, error: "invalid_credentials" }, 401, req);
      }

      // ── SERVER-SIDE MFA ENFORCEMENT ──────────────────────────────────────────
      // Check if the user has TOTP factors enrolled. If so, withhold the full
      // session tokens and return mfa_required instead. The client must call
      // /auth-gateway/verify-mfa with a valid TOTP code before receiving tokens.
      const accessToken = res.data?.access_token;
      if (accessToken) {
        const mfaFactors = await getEnrolledMfaFactors(accessToken);
        if (mfaFactors.length > 0) {
          // Return only the aal1 access_token (needed to create a challenge),
          // but NOT the refresh_token — so the client cannot establish a full session.
          return json({
            ok: true,
            status: 200,
            mfa_required: true,
            factor_id: mfaFactors[0].id,
            // Partial token — only for MFA challenge creation, not for setSession()
            aal1_access_token: accessToken,
          }, 200, req);
        }
      }
      // ────────────────────────────────────────────────────────────────────────

      // record login activity (no MFA required)
      await admin.from("login_activity").insert({
        user_id: userId,
        email,
        ip_address: ip,
        user_agent: userAgent,
        device_info: { userAgent },
        login_type: "password",
      });

      return json({ ok: true, status: 200, data: res.data }, 200, req);
    }

    if (action === "forgot-password") {
      // rate limit forgot password
      const rl = await rateLimitCheck(admin, "forgot-password", email, ip, 3, 60);
      if (!rl.allowed) return json({ error: "rate_limited", retryAfterMinutes: 60 }, 429, req);

      const res = await authRecover(email);
      await recordAttempt(admin, { action: "forgot-password", email, ip, userAgent, success: res.ok });

      return json({ ok: res.ok, status: res.status, data: res.data }, res.ok ? 200 : res.status, req);
    }

    return json({ error: "unknown_action" }, 404, req);
  } catch (e) {
    console.error(e);
    return json({ error: "server_error", message: String(e?.message ?? e) }, 500, req);
  }
});
