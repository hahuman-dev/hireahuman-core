# hireahuman-core

Core backend for HAHuman.

This service:
- Manages tenants (each business on the platform)
- Manages users / roles / permissions
- Defines services each tenant sells
- Stores bookings (real scheduled work)

Tech:
- Node + TypeScript (Express)
- Neon (Postgres)
- No Docker yet (local dev connects directly to Neon)
- Cloudflare will sit in front of deployments later

See /docs for architecture and data model.
See /db for schema and seed.

#TS Setup
"module": "esnext" + "moduleResolution": "bundler" = ESM mode

Node/ts-node in ESM mode wants explicit .js extensions and full URLs

## tsconfig.json → (for Next.js frontend)
## tsconfig.api.json (API)
## Base config (shared by both)