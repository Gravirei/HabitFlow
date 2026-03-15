# Cloudflare Turnstile Setup Guide

Cloudflare Turnstile is a CAPTCHA alternative that protects auth pages (Login, Signup, Forgot Password) from bots and abuse. It is currently **disabled**—follow this guide to re-enable it.

> [!NOTE]
> Turnstile is disabled via environment variables. All code is still in place—no code changes are needed to re-enable.

---

## Architecture Overview

```
┌─────────────────────┐     turnstileToken      ┌───────────────────────┐
│  Frontend (React)   │ ──────────────────────►  │  auth-gateway (Edge)  │
│                     │                          │                       │
│  TurnstileWidget.tsx│                          │  Verifies token with  │
│  Login.tsx          │                          │  Cloudflare API       │
│  Signup.tsx         │                          │                       │
│  ForgotPassword.tsx │  ◄──────────────────────  │  Rate limit + lockout │
└─────────────────────┘     auth response        └───────────────────────┘
```

**Frontend**: Renders the Turnstile widget, captures a token on solve, sends it with auth requests. When Turnstile is disabled, the frontend bypasses the edge function entirely and uses direct Supabase auth.
**Backend**: Edge function validates the token server-side before processing the auth action.

---

## Files Involved

| File | Role |
|------|------|
| `src/components/shared/TurnstileWidget.tsx` | Renders the Turnstile challenge widget |
| `src/pages/auth/Login.tsx` | Sends `turnstileToken` with login request (or bypasses directly to Supabase if disabled) |
| `src/pages/auth/Signup.tsx` | Sends `turnstileToken` with signup request (or bypasses directly to Supabase if disabled) |
| `src/pages/auth/ForgotPassword.tsx` | Sends `turnstileToken` with password reset request (or bypasses directly to Supabase if disabled) |
| `src/lib/security/authGatewayClient.ts` | HTTP client that calls the edge function |
| `supabase/functions/auth-gateway/index.ts` | Server-side Turnstile verification |
| `index.html` | CSP headers allowing Cloudflare scripts/frames |
| `netlify.toml` | Production CSP headers (Netlify) |
| `vercel.json` | Production CSP headers (Vercel) |
| `.env` / `.env.example` | Environment variable configuration |

---

## How to Re-Enable Turnstile

### Step 1: Get Turnstile Keys

1. Go to [Cloudflare Turnstile Dashboard](https://dash.cloudflare.com/?to=/:account/turnstile)
2. Create a new site widget (or use existing one)
3. Copy your **Site Key** (public) and **Secret Key** (private)

### Step 2: Configure Frontend Environment

Edit `.env`:

```env
# Uncomment and set your site key:
VITE_TURNSTILE_SITE_KEY=your-site-key-here

# Remove or set to false:
VITE_TURNSTILE_DISABLED=false
```

### Step 3: Configure Edge Function Secret

Set the secret key for the Supabase Edge Function:

```bash
supabase secrets set TURNSTILE_SECRET_KEY=your-secret-key-here
```

And **remove** the disabled bypass:

```bash
supabase secrets set TURNSTILE_DISABLED=false
```

Or simply ensure `TURNSTILE_DISABLED` is **not set** (the edge function defaults to enabled when this variable is absent).

### Step 4: Deploy Edge Function

```bash
supabase functions deploy auth-gateway
```

### Step 5: Verify

1. Open the app in a browser
2. Navigate to `/login` — the Turnstile widget should appear
3. Solve the challenge, then submit the form
4. Check Cloudflare dashboard for successful verifications
5. Repeat for `/signup` and `/forgot-password`

---

## How to Disable Turnstile

To disable again:

```env
# In .env:
# VITE_TURNSTILE_SITE_KEY=your-site-key-here   ← comment out
VITE_TURNSTILE_DISABLED=true                     ← set to true
```

For the edge function:

```bash
supabase secrets set TURNSTILE_DISABLED=true
supabase functions deploy auth-gateway
```

---

## CSP Headers

The CSP headers already include Cloudflare domains. These are set in three places and can be left as-is even when Turnstile is disabled (they have no effect when the widget isn't loaded):

- `index.html` — `script-src` includes `https://challenges.cloudflare.com`, `frame-src` includes `https://challenges.cloudflare.com`
- `netlify.toml` — same CSP
- `vercel.json` — same CSP

---

## Mobile App Behavior

Turnstile is **automatically skipped** for mobile apps (Capacitor/Cordova WebViews):

- Frontend: `TurnstileWidget.tsx` detects mobile via `isMobileApp()` helper
- Backend: Edge function skips verification for `origin: https://localhost` (Capacitor origin)

No configuration needed for mobile—this works regardless of Turnstile being enabled or disabled.

---

## Environment Variables Reference

| Variable | Where | Purpose |
|----------|-------|---------|
| `VITE_TURNSTILE_SITE_KEY` | `.env` (frontend) | Public site key for the widget |
| `VITE_TURNSTILE_DISABLED` | `.env` (frontend) | Set `true` to hide widget & skip token requirement |
| `TURNSTILE_SECRET_KEY` | Supabase secrets (edge function) | Private key for server-side verification |
| `TURNSTILE_DISABLED` | Supabase secrets (edge function) | Set `true` to skip server-side verification |

---

## Security Notes

> [!WARNING]
> When Turnstile is disabled, the following protections are **still active** on the edge function:
> - Rate limiting (5 login attempts / 15 min, 3 signup/reset attempts / 60 min)
> - Account lockout (30 min after too many failures)
> - CORS origin validation
> - Input validation
>
> However, there is **no bot protection**. Re-enable Turnstile before going to production.
