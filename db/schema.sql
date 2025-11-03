-- db/schema.sql
-- HAHuman core schema (fresh install)

-- Extensions ---------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- for gen_random_uuid()

-- Types -------------------------------------------------------------------
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_status') THEN
    CREATE TYPE booking_status AS ENUM (
      'requested','confirmed','in_progress','completed','cancelled'
    );
  END IF;
END $$;

-- Tables ------------------------------------------------------------------

-- Tenants (self-referencing parent; deferrable FK so seeds/migrations can insert in any order)
CREATE TABLE IF NOT EXISTS tenant (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                TEXT        NOT NULL,
  slug                TEXT        NOT NULL,
  industry            TEXT        NOT NULL,
  plan                TEXT        NOT NULL,
  parent_tenant_id    UUID        NULL,
  config_json         JSONB       NOT NULL DEFAULT '{}'::jsonb,
  theme_json          JSONB       NOT NULL DEFAULT '{}'::jsonb,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT tenant_slug_uniq UNIQUE (slug),
  CONSTRAINT tenant_parent_tenant_id_fkey
    FOREIGN KEY (parent_tenant_id)
    REFERENCES tenant(id)
    ON DELETE SET NULL
    DEFERRABLE INITIALLY DEFERRED
);

-- Users (scoped to tenant)
CREATE TABLE IF NOT EXISTS "user" (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID        NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  email       TEXT        NOT NULL,
  role        TEXT        NOT NULL,          -- simple v1 role label
  status      TEXT        NOT NULL DEFAULT 'active',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT user_email_per_tenant UNIQUE (tenant_id, email)
);

-- Roles (optional: richer RBAC; keep simple but future-proof)
CREATE TABLE IF NOT EXISTS role (
  id           TEXT        PRIMARY KEY,                           -- e.g. "r-yjc-admin"
  tenant_id    UUID        NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
  name         TEXT        NOT NULL,                              -- e.g. "admin"
  permissions  TEXT[]      NOT NULL DEFAULT ARRAY[]::TEXT[],
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT role_unique_per_tenant UNIQUE (tenant_id, name)
);

-- Services (note: string IDs to support human-readable IDs like "s-yjc-deep")
CREATE TABLE IF NOT EXISTS service (
  id            TEXT        PRIMARY KEY,
  tenant_id     UUID        NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
  name          TEXT        NOT NULL,
  category      TEXT        NOT NULL,
  pricing_json  JSONB       NOT NULL DEFAULT '{}'::jsonb,  -- { type, rate/amount, ... }
  metadata_json JSONB       NOT NULL DEFAULT '{}'::jsonb,
  active        BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Bookings
CREATE TABLE IF NOT EXISTS booking (
  id                UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID            NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
  service_id        TEXT            NULL REFERENCES service(id) ON DELETE SET NULL,
  customer_name     TEXT            NOT NULL,
  customer_phone    TEXT            NULL,
  customer_address  TEXT            NULL,
  start_time        TIMESTAMPTZ     NOT NULL,
  end_time          TIMESTAMPTZ     NOT NULL,
  status            booking_status  NOT NULL DEFAULT 'requested',
  assigned_user_id  UUID            NULL REFERENCES "user"(id) ON DELETE SET NULL,
  price_final       NUMERIC(12,2)   NULL,
  created_at        TIMESTAMPTZ     NOT NULL DEFAULT now(),
  CONSTRAINT booking_time_range CHECK (end_time > start_time)
);

-- Indexes (idempotent) ----------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS tenant_slug_uidx   ON tenant (slug);

CREATE INDEX IF NOT EXISTS user_tenant_idx           ON "user" (tenant_id);
CREATE INDEX IF NOT EXISTS role_tenant_idx           ON role (tenant_id);
CREATE INDEX IF NOT EXISTS service_tenant_idx        ON service (tenant_id);

CREATE INDEX IF NOT EXISTS booking_tenant_idx        ON booking (tenant_id);
CREATE INDEX IF NOT EXISTS booking_status_idx        ON booking (status);
CREATE INDEX IF NOT EXISTS booking_start_time_idx    ON booking (start_time);

-- Seed convenience (optional; comment out if you seed via script) ---------
-- INSERT INTO tenant (id, name, slug, industry, plan)
-- VALUES ('00000000-0000-4000-8000-000000000001','Hire A Human','hireahuman','platform','platform-core')
-- ON CONFLICT (slug) DO NOTHING;
