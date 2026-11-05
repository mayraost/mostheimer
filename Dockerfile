# syntax=docker/dockerfile:1

# alpine instead of bookworm-slim: ~100 MB smaller base. sharp ships musl
# prebuilds, so npm ci pulls @img/sharp-linuxmusl-* automatically.
FROM node:26.13.0-alpine3.24 AS deps
WORKDIR /app
# Package files first so the node_modules layer stays cached.
COPY package.json package-lock.json ./
# BuildKit cache mount keeps the npm cache between builds.
RUN --mount=type=cache,target=/root/.npm npm ci --no-audit --no-fund

FROM node:26.13.0-alpine3.24 AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:26.13.0-alpine3.24 AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
# alpine busybox adduser/addgroup only support the short flags.
RUN addgroup -S -g 1001 nodejs \
  && adduser -S -u 1001 -G nodejs nextjs
# The runner takes only the standalone output; node_modules is already in
# ./.next/standalone (Next-trimmed, no duplicate).
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
# Next serves public assets only from <root>/public and the repo keeps them in
# src/public (no config option for that), so copy them over here.
COPY --from=build --chown=nextjs:nodejs /app/src/public ./public
# Prepare only the media dir for the volume mount (no recursive chown).
RUN mkdir -p /app/public/media && chown nextjs:nodejs /app/public/media
# '/app' itself stays owned by root (COPY --chown only recolours the copied
# contents). Next writes the 'use cache' store to /app/.next/cache at runtime;
# without a writable target all cache writes fail silently and revalidateTag
# from Payload hooks only applies inconsistently — single routes stay on an old
# snapshot (measured: /en home kept stale content while /de updated).
RUN mkdir -p /app/.next/cache && chown -R nextjs:nodejs /app/.next/cache
USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>{if(r.status>=400)process.exit(1)}).catch(()=>process.exit(1))"
CMD ["node", "server.js"]
