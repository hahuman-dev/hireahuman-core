# Architecture

## High level
Cloudflare will sit in front of everything:
- Route per domain / subdomain to the right frontend or API.
- Add basic protection and caching at the edge.

The core API (this repo) exposes:
- Tenant management
- Users / roles
- Services
- Bookings

The database is Neon (serverless Postgres).
Each "business" in the platform is a row in `tenant`.
All other data is tenant-scoped by `tenant_id`.

Frontends (e.g. YouJustClean public booking site) will talk to this API.
Marketplaces (e.g. FindACleaner) are just another tenant with "aggregates" config.

## Goal
Keep core logic here; keep vertical brand skins in their own repos.
