#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL not set. Aborting."
  exit 1
fi

# NOTE:
# At this stage you can either:
# - write a small Node script to read seeds/seed.json and INSERT rows, or
# - hand-maintain a seeds/seed.sql file.
#
# We're leaving this as a placeholder so you control how you want to seed.


echo "Seeding from seeds/seed.json is not implemented yet."
echo "Write a tiny Node script (ts-node) to parse seed.json and INSERT into tenant/user/role/service/booking."
