-- Enable UUID generation extension (Postgres)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-------------------------------------------------
-- 1. tenant
-------------------------------------------------

CREATE TABLE tenant (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name              TEXT NOT NULL,
    slug              TEXT UNIQUE NOT NULL,
    industry          TEXT NOT NULL,              -- e.g. 'cleaning', 'marketplace', 'platform'
    plan              TEXT NOT NULL,              -- e.g. 'platform-core', 'b2b-pro', 'marketplace'
    parent_tenant_id  UUID REFERENCES tenant(id) ON DELETE SET NULL,
    config_json       JSONB NOT NULL DEFAULT '{}'::jsonb,  -- features, workflows, vertical info
    theme_json        JSONB NOT NULL DEFAULT '{}'::jsonb,  -- branding (colors, logos)
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tenant_slug ON tenant(slug);
CREATE INDEX idx_tenant_parent ON tenant(parent_tenant_id);

-------------------------------------------------
-- 2. "user"
-------------------------------------------------

CREATE TABLE "user" (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id   UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    email       TEXT NOT NULL,
    role        TEXT NOT NULL,                      -- 'admin', 'provider', 'client', etc. (v0 shortcut)
    status      TEXT NOT NULL DEFAULT 'active',     -- 'active', 'invited', 'disabled'
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (tenant_id, email)  -- same email can exist in another tenant, but unique per tenant
);

CREATE INDEX idx_user_tenant ON "user"(tenant_id);
CREATE INDEX idx_user_role ON "user"(role);

-------------------------------------------------
-- 3. role
-------------------------------------------------

CREATE TABLE role (
    id           TEXT PRIMARY KEY,   -- e.g. 'r-yjc-admin'
    tenant_id    UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    name         TEXT NOT NULL,      -- e.g. 'admin', 'provider', 'client', 'marketplace_admin'
    permissions  JSONB NOT NULL,     -- e.g. ["booking:accept","payouts:view"]
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_role_tenant ON role(tenant_id);
CREATE INDEX idx_role_name ON role(name);

-------------------------------------------------
-- 4. service
-------------------------------------------------

CREATE TABLE service (
    id             TEXT PRIMARY KEY,    -- e.g. 's-yjc-deep'
    tenant_id      UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    name           TEXT NOT NULL,       -- 'Deep Clean'
    category       TEXT NOT NULL,       -- 'home_cleaning', 'office', etc.
    pricing_json   JSONB NOT NULL,      -- pricing model (hourly, fixed, tiered)
    metadata_json  JSONB NOT NULL,      -- vertical-specific data (supplies, duration, etc.)
    active         BOOLEAN NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_service_tenant ON service(tenant_id);
CREATE INDEX idx_service_active ON service(active);

-------------------------------------------------
-- 5. booking
-------------------------------------------------

CREATE TABLE booking (
    id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id          UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    service_id         TEXT NOT NULL REFERENCES service(id) ON DELETE RESTRICT,
    customer_name      TEXT NOT NULL,
    customer_phone     TEXT,
    customer_address   TEXT,
    start_time         TIMESTAMPTZ NOT NULL,
    end_time           TIMESTAMPTZ NOT NULL,
    status             TEXT NOT NULL DEFAULT 'requested', 
                       -- 'requested', 'confirmed', 'in_progress', 'completed', 'cancelled'
    assigned_user_id   UUID REFERENCES "user"(id) ON DELETE SET NULL,
    price_final        NUMERIC(10,2),
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_booking_tenant ON booking(tenant_id);
CREATE INDEX idx_booking_service ON booking(service_id);
CREATE INDEX idx_booking_assigned_user ON booking(assigned_user_id);
CREATE INDEX idx_booking_status ON booking(status);
CREATE INDEX idx_booking_start_time ON booking(start_time);
