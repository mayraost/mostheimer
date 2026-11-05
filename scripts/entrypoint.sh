#!/bin/sh
# Container entrypoint (Dockerfile CMD).
#
# Starts the Next.js standalone server, then purges the Cloudflare edge cache
# once per release (scripts/cf-purge.mjs) AFTER the new build answers
# /api/health. Runs in the background, idempotent per release, always exits 0.
#
# Release identity: RELEASE_ID is an explicit operator override only. It is
# deliberately NOT defaulted from SOURCE_COMMIT here: Coolify sets
# SOURCE_COMMIT on a *restart* to the restart's synthetic commit, which made
# every plain restart re-purge everything (Free plan: 5 purges/min — a crash
# loop exhausts the budget and CMS edits stop purging). scripts/cf-purge.mjs
# prefers the build id baked into the image (/app/.cf-release) and treats the
# env vars purely as a local-run fallback.
set -eu

# Background: wait for the fresh build to serve, then purge content URLs once
# per release. Static assets (/_next/static/**) are never purged.
( node /app/scripts/cf-purge.mjs --wait-for-release || true ) &

exec node server.js
