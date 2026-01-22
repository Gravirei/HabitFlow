/// <reference lib="deno.ns" />

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type Json = Record<string, unknown>;

function json(data: Json, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      "access-control-allow-headers": "authorization, x-client-info, apikey, content-type",
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "access-control-allow-origin": "*",
        "access-control-allow-headers": "authorization, x-client-info, apikey, content-type",
        "access-control-allow-methods": "POST, OPTIONS",
      },
    });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.replace(/^\/+/, "");

    if (!path.startsWith("auth-gateway")) {
      return json({ error: "not_found" }, 404);
    }

    const action = path.split("/")[1] ?? "";
    if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

    const admin = getSupabaseAdmin();

    const ip = getIp(req);
    const userAgent = req.headers.get("user-agent") ?? "unknown";
    const body = await req.json().catch(() => ({} as Json));

    const email = String(body.email ?? "").trim().toLowerCase();
    const turnstileToken = String(body.turnstileToken ?? "");

    if (!email) return json({ error: "email_required" }, 400);
    if (!turnstileToken) return json({ error: "turnstile_required" }, 400);

    // Turnstile verify (fail closed if missing secrets)
    const ts = await verifyTurnstile(turnstileToken, ip);
    if (!ts.ok) return json({ error: "turnstile_failed", ...ts }, 403);

    // lockout check
    const lock = await isLocked(admin, email);
    if (lock.locked) {
      return json({ error: "account_locked", ...lock }, 423);
    }

    if (action === "signup") {
      const password = String(body.password ?? "");
      const username = body.username ? String(body.username) : undefined;
      if (!password) return json({ error: "password_required" }, 400);

      // rate limit signup
      const rl = await rateLimitCheck(admin, "signup", email, ip, 3, 60);
      if (!rl.allowed) return json({ error: "rate_limited", retryAfterMinutes: 60 }, 429);

      const res = await authSignup(email, password, username);
      const success = !!res.ok;
      await recordAttempt(admin, { action: "signup", email, ip, userAgent, success });

      return json({
        ok: res.ok,
        status: res.status,
        data: res.data,
        message: res.ok ? "signup_initiated" : "signup_failed",
      }, res.ok ? 200 : res.status);
    }

    if (action === "login") {
      const password = String(body.password ?? "");
      if (!password) return json({ error: "password_required" }, 400);

      // rate limit login
      const rl = await rateLimitCheck(admin, "login", email, ip, 5, 15);
      if (!rl.allowed) {
        // lock account after too many failures
        const until = await lockAccount(admin, email, null, 30);
        return json({ error: "rate_limited", lockedUntil: until }, 429);
      }

      const res = await authPasswordLogin(email, password);

      const userId = res.ok ? res.data?.user?.id ?? null : null;
      await recordAttempt(admin, { action: "login", email, ip, userAgent, success: res.ok, userId });

      if (!res.ok) {
        // after recording failure, see if we should lock
        const rl2 = await rateLimitCheck(admin, "login", email, ip, 5, 15);
        if (!rl2.allowed) {
          const until = await lockAccount(admin, email, userId, 30);
          return json({ error: "account_locked", lockedUntil: until }, 423);
        }
        return json({ ok: false, status: res.status, data: res.data }, res.status);
      }

      // record login activity
      await admin.from("login_activity").insert({
        user_id: userId,
        email,
        ip_address: ip,
        user_agent: userAgent,
        device_info: { userAgent },
        login_type: "password",
      });

      return json({ ok: true, status: 200, data: res.data }, 200);
    }

    if (action === "forgot-password") {
      // rate limit forgot password
      const rl = await rateLimitCheck(admin, "forgot-password", email, ip, 3, 60);
      if (!rl.allowed) return json({ error: "rate_limited", retryAfterMinutes: 60 }, 429);

      const res = await authRecover(email);
      await recordAttempt(admin, { action: "forgot-password", email, ip, userAgent, success: res.ok });

      return json({ ok: res.ok, status: res.status, data: res.data }, res.ok ? 200 : res.status);
    }

    return json({ error: "unknown_action" }, 404);
  } catch (e) {
    console.error(e);
    return json({ error: "server_error", message: String(e?.message ?? e) }, 500);
  }
});
