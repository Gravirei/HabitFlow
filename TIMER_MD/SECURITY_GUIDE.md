# Security Guide - Credential Management

**Created:** 2026-01-17  
**Status:** ✅ Credentials are NOT exposed in git (safe!)

---

## 🎉 Good News!

Your `.env` file is properly protected:
- ✅ Listed in `.gitignore`
- ✅ NOT tracked in git
- ✅ NOT in git history
- ✅ NO public exposure

**Risk Level:** 🟡 Low (local machine only)

---

## 📋 Current Credential Inventory

Your `.env` contains:

1. **VITE_SENTRY_DSN** - Sentry error tracking
2. **VITE_SUPABASE_URL** - Supabase project URL
3. **VITE_SUPABASE_ANON_KEY** - Supabase anonymous key (public, safe)
4. **VITE_TURNSTILE_SITE_KEY** - Cloudflare Turnstile (public, safe)
5. **TURNSTILE_SECRET_KEY** - Turnstile secret (should rotate periodically)

---

## 🔄 When to Rotate Credentials

### Rotate Immediately If:
- ❌ Credentials were committed to git (NOT your case!)
- ❌ Repository was made public with credentials
- ❌ Unauthorized access detected
- ❌ Former team member had access

### Rotate Periodically:
- 🔄 Every 90 days (best practice)
- 🔄 After major security incidents (industry-wide)
- 🔄 When changing hosting/infrastructure

**Your Situation:** ✅ No immediate rotation needed (credentials never exposed)

---

## 📝 How to Rotate (If Needed)

### 1. Supabase Credentials (15 min)

**Navigate to:**
```
https://supabase.com/dashboard/project/[your-project-id]/settings/api
```

**Steps:**
1. Click "Project Settings" → "API"
2. Under "Project API keys" section
3. Click "Generate new anon key" (if rotating)
4. Copy new key to `.env`:
   ```
   VITE_SUPABASE_ANON_KEY=eyJhbG...new_key_here
   ```
5. Test your app still works
6. Old key remains valid for 30 days (grace period)

**Note:** `VITE_SUPABASE_URL` rarely needs changing (it's your project URL)

---

### 2. Turnstile Credentials (10 min)

**Navigate to:**
```
https://dash.cloudflare.com/?to=/:account/turnstile
```

**Steps:**
1. Select your site
2. Click "Settings" → "Rotate Keys"
3. Copy new keys to `.env`:
   ```
   VITE_TURNSTILE_SITE_KEY=0x4AA...new_site_key
   TURNSTILE_SECRET_KEY=0x4AA...new_secret_key
   ```
4. Test CAPTCHA still works
5. Old keys expire after rotation

---

### 3. Sentry DSN (5 min)

**Navigate to:**
```
https://sentry.io/settings/[your-org]/projects/[your-project]/keys/
```

**Steps:**
1. Click "Projects" → Your project → "Settings" → "Client Keys (DSN)"
2. Click "Create new key" or "Regenerate" existing key
3. Copy new DSN to `.env`:
   ```
   VITE_SENTRY_DSN=https://[new-key]@o[org-id].ingest.us.sentry.io/[project-id]
   ```
4. Test error tracking still works
5. Disable old DSN after verifying new one works

---

## 🛡️ Best Practices

### ✅ Do:

**Use Environment Files Correctly:**
```bash
.env                 # Your actual credentials (NEVER commit)
.env.example         # Template with placeholders (SAFE to commit)
.env.local           # Local overrides (gitignored)
.env.production      # Production config (deploy secrets, not in git)
```

**Keep Credentials Safe:**
- ✅ Use password manager for credential storage
- ✅ Enable 2FA on all service accounts
- ✅ Limit API key permissions (least privilege)
- ✅ Use different credentials for dev/staging/prod

**Monitor Access:**
- ✅ Review Supabase logs periodically
- ✅ Check Sentry for unusual error patterns
- ✅ Monitor Turnstile usage stats

### ❌ Don't:

**Never:**
- ❌ Commit `.env` files to git
- ❌ Share credentials via email/Slack
- ❌ Use production credentials in development
- ❌ Hard-code credentials in source code
- ❌ Post credentials in screenshots/demos

---

## 🚨 If Credentials Are Ever Exposed

### Immediate Actions (within 1 hour):

1. **Rotate ALL credentials immediately** (follow steps above)
2. **Check access logs:**
   - Supabase: Project → Logs → Auth/API logs
   - Sentry: Issues → Check for unusual errors
3. **Revoke old credentials:**
   - Don't wait for grace periods
   - Disable immediately
4. **Monitor for suspicious activity:**
   - Watch for unexpected API calls
   - Check for data exfiltration
   - Review user account creation

### Clean Git History:

If credentials were committed to git:

```bash
# 1. Install git-filter-repo (one-time)
pip install git-filter-repo

# 2. Remove .env from entire git history
git filter-repo --path .env --invert-paths

# 3. Force push to all remotes
git push origin --force --all
git push origin --force --tags

# 4. Notify all contributors to re-clone
```

**Warning:** This rewrites git history. All collaborators must re-clone!

---

## 🔐 Additional Security Measures

### Add Pre-commit Hook

Prevent accidentally committing `.env`:

```bash
# Create .husky/pre-commit (if using Husky)
#!/bin/sh
if git diff --cached --name-only | grep -E '^\.env$'; then
  echo "❌ ERROR: Attempting to commit .env file!"
  echo "This file contains sensitive credentials and should never be committed."
  exit 1
fi
```

### Enhanced .gitignore

Already in place (line 30):
```
.env
```

Consider adding:
```
.env.local
.env.*.local
*.key
*.pem
secrets/
```

---

## 📊 Security Checklist

- [x] `.env` in `.gitignore`
- [x] `.env` not tracked in git
- [x] `.env` not in git history
- [x] `.env.example` exists (template)
- [ ] Pre-commit hook installed (optional)
- [ ] Credentials documented in password manager
- [ ] 2FA enabled on all accounts
- [ ] Regular rotation schedule (90 days)
- [ ] Monitoring enabled (Sentry, Supabase logs)

---

## 🎯 Current Status: ✅ SECURE

Your credentials are properly protected:
- Not in version control
- Not publicly exposed
- Following best practices

**Recommendation:** Continue current practices. No immediate action needed unless you suspect compromise or want to implement the 90-day rotation policy.

---

## 📞 Questions?

- Supabase docs: https://supabase.com/docs/guides/api/security
- Sentry security: https://docs.sentry.io/product/accounts/security/
- Turnstile docs: https://developers.cloudflare.com/turnstile/

---

**Last Updated:** 2026-01-17  
**Next Review:** 2026-04-17 (90 days)
