#!/usr/bin/env bash
set -euo pipefail

# Safety guard: refuse to run in production
ENV=${NODE_ENV:-development}
if [[ "$ENV" != "development" && "$ENV" != "test" ]]; then
  echo "Refusing to reset DB in NODE_ENV=$ENV (allowed: development,test)."
  exit 1
fi

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL not set. Aborting."
  exit 1
fi

echo "WARNING: This will DROP and RECREATE all data in $DATABASE_URL"
read -p "Type RESET to continue: " confirm
[[ "$confirm" == "RESET" ]] || { echo "Aborted."; exit 1; }

# Re-run schema
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f ./db/schema.sql

# Reseed
./db/scripts/seed.sh

echo "✅ DB reset complete."
