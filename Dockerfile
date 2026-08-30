# ──────────────────────────────────────────────────────────────────────
# HabitFlow — multi-stage Dockerfile for the Vite SPA
#
# Stages:
#   1. deps   — install all dependencies (cached layer)
#   2. build  — run typecheck + vite build → /app/dist
#   3. runtime — nginx alpine serving the static dist/ with a
#                healthcheck endpoint
#
# Build with BuildKit (heredoc syntax is used below):
#   DOCKER_BUILDKIT=1 docker build -t habitflow:local .
# or with buildx:
#   docker buildx build -t habitflow:local .
# ──────────────────────────────────────────────────────────────────────

# syntax=docker/dockerfile:1.7

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

# Build the production bundle (runs typecheck + vite build)
# Build-time env vars are injected here so the bundle contains the right
# VITE_* values. In production, set these via --build-arg or compose.
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

# SPA fallback: any path that does not match a static file should serve
# /index.html so React Router can handle the route client-side.
COPY <<'EOF' /etc/nginx/conf.d/default.conf
server {
  listen       80;
  listen       [::]:80;
  server_name  _;

  root   /usr/share/nginx/html;
  index  index.html;

  # gzip for text-ish assets
  gzip on;
  gzip_types text/plain text/css application/javascript application/json image/svg+xml;
  gzip_min_length 1024;

  # long-cache hashed assets (Vite emits files under /assets/)
  location /assets/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    try_files $uri =404;
  }

  # healthcheck endpoint (used by Docker HEALTHCHECK and external monitors)
  location = /healthz {
    access_log off;
    return 200 "ok\n";
    add_header Content-Type text/plain;
  }

  # SPA fallback
  location / {
    try_files $uri $uri/ /index.html;
  }

  # hide dotfiles
  location ~ /\. {
    deny all;
  }
}
EOF

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1/healthz || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
