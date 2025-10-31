.PHONY: dev reset-db seed-db

dev:
	npm run dev

reset-db:
	NODE_ENV=development DATABASE_URL=$$(cat .env | grep DATABASE_URL | cut -d '=' -f2) ./db/scripts/reset.sh

seed-db:
	DATABASE_URL=$$(cat .env | grep DATABASE_URL | cut -d '=' -f2) ./db/scripts/seed.sh
