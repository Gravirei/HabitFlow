#!/bin/sh
# Deploy-config parity guard.
#
# netlify.toml and vercel.json are both intentional (see AGENTS.md) and must
# stay in sync: same SPA rewrite and identical security-header sets. This
# script fails when one side gains a header or rewrite the other lacks.

set -e

fail() {
  echo "❌ $1"
  exit 1
}

command -v python3 >/dev/null || fail "python3 required"

python3 - <<'EOF'
import sys
try:
    import tomllib
except ImportError:
    print("❌ tomllib unavailable (python < 3.11)")
    sys.exit(2)

with open("netlify.toml", "rb") as f:
    netlify = tomllib.load(f)
import json
with open("vercel.json") as f:
    vercel = json.load(f)

errors = []

# --- SPA rewrites ---
netlify_rewrites = [(r.get("from"), r.get("to"), r.get("status")) for r in netlify.get("redirects", [])]
if not any(f == "/*" and t == "/index.html" and s == 200 for f, t, s in netlify_rewrites):
    errors.append("netlify.toml: missing SPA rewrite /* -> /index.html (status 200)")
vercel_rewrites = [(r.get("source"), r.get("destination")) for r in vercel.get("rewrites", [])]
if not any(s == "/(.*)" and d == "/index.html" for s, d in vercel_rewrites):
    errors.append("vercel.json: missing SPA rewrite /(.*) -> /index.html")

# --- Header sets ---
def norm(v):
    return " ".join(str(v).split())

def netlify_headers():
    out = {}
    for h in netlify.get("headers", []):
        for k, v in h.get("values", {}).items():
            out[k.lower()] = norm(v)
    return out

def vercel_headers():
    out = {}
    for group in vercel.get("headers", []):
        for h in group.get("headers", []):
            out[h["key"].lower()] = norm(h["value"])
    return out

nh, vh = netlify_headers(), vercel_headers()
only_n = set(nh) - set(vh)
only_v = set(vh) - set(nh)
for k in sorted(only_n):
    errors.append(f"header {k}: present in netlify.toml but missing in vercel.json")
for k in sorted(only_v):
    errors.append(f"header {k}: present in vercel.json but missing in netlify.toml")
for k in sorted(set(nh) & set(vh)):
    if nh[k] != vh[k]:
        errors.append(f"header {k}: value drift between netlify.toml and vercel.json")

if errors:
    for e in errors:
        print("❌ " + e)
    sys.exit(1)
print("✔ Deploy configs are in parity (SPA rewrites + headers).")
EOF
