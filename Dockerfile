# ──────────────────────────────────────────────────────────────────────
# HabitFlow — multi-stage Dockerfile for the Vite SPA
#
# Stages:
#   1. deps    — install all dependencies (cached layer)
#   2. build   — run typecheck + vite build → /app/dist
#   3. runtime — nginx alpine serving the static dist/ with a
#                /healthz endpoint for Docker HEALTHCHECK
#
# Build with classic Docker or BuildKit — no special syntax required.
#   docker build -t habitflow:local .
#
# Build-time env vars are injected at the build stage so the bundle
# contains the right VITE_* values. In production, set these via
# --build-arg or compose.
# ──────────────────────────────────────────────────────────────────────

# ── 1. deps ──────────────────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

# Copy manifest files first to leverage Docker layer cache
COPY package.json package-lock.json* ./

# Install with clean, reproducible install
# (npm ci requires package-lock.json; if it is missing, fall back to install)
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# ── 2. build ─────────────────────────────────────────────────────────
FROM deps AS build
WORKDIR /app

# Copy the rest of the source
COPY . .

ARG VITE_API_URL
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_SENTRY_DSN
ARG VITE_ENABLE_SENTRY=false
ARG VITE_ENABLE_ANALYTICS=false

ENV VITE_API_URL=${VITE_API_URL} \
    VITE_SUPABASE_URL=${VITE_SUPABASE_URL} \
    VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY} \
    VITE_SENTRY_DSN=${VITE_SENTRY_DSN} \
    VITE_ENABLE_SENTRY=${VITE_ENABLE_SENTRY} \
    VITE_ENABLE_ANALYTICS=${VITE_ENABLE_ANALYTICS}

RUN npm run build

# ── 3. runtime ───────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runtime

# Static bundle
COPY --from=build /app/dist /usr/share/nginx/html

# nginx config (extracted to a file so the Dockerfile works with both
# classic Docker and BuildKit — no heredoc syntax required).
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Healthcheck — hits the /healthz endpoint served by the nginx config
# above. Returns 200 "ok" without hitting the bundle.
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1/healthz || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
