# Deployment Notes

## Runtime
- Node/TypeScript API.
- Neon for Postgres.
- Cloudflare for DNS / routing / protection.

## Local Dev
- Set DATABASE_URL in .env to point at your Neon branch.
- Run `npm run dev` to start the API.
- Run `./db/scripts/reset.sh` to reset + reseed the DB (dev only).

## Production Targets
- API will later run in a lightweight host (Railway / Fly.io / etc.).
- Domains managed in Cloudflare.
- Frontend apps (per vertical brand) can deploy via Vercel and call this API.

## Security Basics
- Never run reset.sh unless NODE_ENV=development or test.
- All tenants are isolated logically by tenant_id.
- Never expose admin-only endpoints publicly.
