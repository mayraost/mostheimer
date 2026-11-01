# syntax=docker/dockerfile:1

# node:24.22.2-alpine3.24 statt bookworm-slim: ~100 MB kleineres Basis-Image (musl).
# Achtung: sharp (0.35) liefert musl-Prebuilds mit -> npm ci zieht im Container
# automatisch @img/sharp-linuxmusl-*; Build wurde gegen alpine verifiziert.
FROM node:24.22.2-alpine3.24 AS deps
WORKDIR /app
# Layer-Order: Package-Files zuerst -> node_modules-Layer cacht stabil Builds
COPY package.json package-lock.json ./
# BuildKit-Cache-Mount: npm-Cache bleibt zwischen Builds erhalten -> schneller
RUN --mount=type=cache,target=/root/.npm npm ci --no-audit --no-fund

FROM node:24.22.2-alpine3.24 AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
# Build-Kontext ist via .dockerignore verschmaelt (tests/docs/configs/README)
COPY . .
RUN npm run build

FROM node:24.22.2-alpine3.24 AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
# adduser/addgroup: alpine-busybox kennt nur Kurz-Flags (kein --system --gid)
RUN addgroup -S -g 1001 nodejs \
  && adduser -S -u 1001 -G nodejs nextjs
# Runner nimmt NUR standalone + statische Assets; node_modules liegt
# komplett in ./.next/standalone/node_modules (Next-trimmed, kein Duplikat)
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
# Next served public Assets nur aus <root>/public; Repo haelt sie in src/public
# (kein Next-Config-Option dafuer) -> hierher legen. Standalone enthaelt
# src/public NICHT (.next/standalone = server.js + node_modules + package.json),
# daher bleibt der Build-Stage-Copy die Quelle der Wahrheit.
COPY --from=build --chown=nextjs:nodejs /app/src/public ./public
# Nur media-Dir fuer Volume-Mount vorbereiten (chown nur dieses Verzeichnis,
# nicht rekursiv über den ganzen Runner)
RUN mkdir -p /app/public/media && chown nextjs:nodejs /app/public/media
USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>{if(r.status>=400)process.exit(1)}).catch(()=>process.exit(1))"
CMD ["node", "server.js"]
