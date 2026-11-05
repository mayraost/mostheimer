#!/bin/sh
# Container entrypoint (Dockerfile CMD).
#
# Starts the Next.js standalone server, then purges the Cloudflare edge cache
# once per release (scripts/cf-purge.mjs) AFTER the new build answers
# /api/health. Runs in the background, idempotent per release, always exits 0.
#
# Release identity: an explicit RELEASE_ID, else Coolify's SOURCE_COMMIT, else
# the build info baked into the image at build time (/app/.cf-release, which
# embeds the build id) plus IMAGE_TAG when set. A restart of the same image
# therefore never purges again.
set -eu

if [ -z "${RELEASE_ID:-}" ] && [ -n "${SOURCE_COMMIT:-}" ]; then
  RELEASE_ID="$SOURCE_COMMIT"
fi
export RELEASE_ID

# Background: wait for the fresh build to serve, then purge once per release.
( node /app/scripts/cf-purge.mjs --wait-for-release || true ) &

exec node server.js
