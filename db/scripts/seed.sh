#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL not set. Aborting."
  exit 1
fi

# Run the TS seeder via npm
npm run seed
