#!/bin/sh
# Reinstall dependencies when package-lock.json changed since the last install,
# then run the command. Run as: sh /app/docker/entrypoint.sh <command...>
set -e

stamp=/app/node_modules/.package-lock.sha256
current=$(sha256sum /app/package-lock.json | cut -d ' ' -f 1)

if [ ! -f "$stamp" ] || [ "$(cat "$stamp")" != "$current" ]; then
  echo "package-lock.json changed: running npm ci"
  npm ci --no-audit --no-fund
  echo "$current" > "$stamp"
fi

exec "$@"
