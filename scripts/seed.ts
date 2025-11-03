import "dotenv/config";

import { Client } from "pg";

import rawSeed from "../db/seeds/seed.json" with { type: "json" };
const seed = rawSeed as SeedFile;

type TenantSeed = {
  id?: string;
  name: string;
  slug: string;
  industry: string;
  plan: string;
  parent_slug?: string;
  config_json?: any;
  theme_json?: any;
};

type ServiceSeed = {
  id?: string;
  tenant_id?: string;      // optional
  tenant_slug?: string;    // optional
  name: string;
  category: string;
  pricing_json?: any;
  metadata_json?: any;
};

type SeedFile = {
  tenants?: TenantSeed[];
  services?: ServiceSeed[];
};


async function run() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set");

  const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();

  try {
    await client.query("BEGIN");

    // helper
    const getTenantIdBySlug = async (slug: string) => {
      const r = await client.query(`SELECT id FROM tenant WHERE slug=$1`, [slug]);
      return r.rows[0]?.id ?? null;
    };

    // 1) Tenants (parents first: hireahuman)
    // ensure platform exists
    await client.query(`
      INSERT INTO tenant (id, name, slug, industry, plan, parent_tenant_id, config_json, theme_json)
      VALUES ('00000000-0000-4000-8000-000000000001','Hire A Human','hireahuman','platform','platform-core',NULL,'{}','{}')
      ON CONFLICT (slug) DO NOTHING;
    `);

    const tenants = seed.tenants ?? [];
    for (const t of tenants) {
      let parentId: string | null = null;
      if (t.parent_slug) {
        parentId = await getTenantIdBySlug(t.parent_slug);
        if (!parentId) throw new Error(`Parent slug '${t.parent_slug}' not found for '${t.slug}'`);
      }

      await client.query(
        `INSERT INTO tenant (id, name, slug, industry, plan, parent_tenant_id, config_json, theme_json)
     VALUES (COALESCE($1, gen_random_uuid()), $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (slug) DO UPDATE
       SET name=EXCLUDED.name,
           industry=EXCLUDED.industry,
           plan=EXCLUDED.plan,
           parent_tenant_id=EXCLUDED.parent_tenant_id,
           config_json=EXCLUDED.config_json,
           theme_json=EXCLUDED.theme_json`,
        [t.id ?? null, t.name, t.slug, t.industry, t.plan, parentId, t.config_json ?? {}, t.theme_json ?? {}]
      );
    }

    // 2) Services (resolve tenant by slug if tenant_id not given)
    const services = seed.services ?? [];
    for (const s of services) {
      let tenantId: string | null | undefined = s.tenant_id;
      if (!tenantId && s.tenant_slug) {
        tenantId = await getTenantIdBySlug(s.tenant_slug);
        if (!tenantId) throw new Error(`Tenant slug '${s.tenant_slug}' not found for service '${s.name}'`);
      }
      if (!tenantId) throw new Error(`Service '${s.name}' missing tenant_id/tenant_slug`);

      await client.query(
        `INSERT INTO service (id, tenant_id, name, category, pricing_json, metadata_json, active)
     VALUES (COALESCE($1, gen_random_uuid()), $2, $3, $4, $5, $6, true)
     ON CONFLICT (id) DO UPDATE
       SET name=EXCLUDED.name,
           category=EXCLUDED.category,
           pricing_json=EXCLUDED.pricing_json,
           metadata_json=EXCLUDED.metadata_json`,
        [s.id ?? null, tenantId, s.name, s.category, s.pricing_json ?? {}, s.metadata_json ?? {}]
      );
    }
    await client.query("COMMIT");
    console.log("✅ Seed complete");
  } catch (e) {
    await client.query("ROLLBACK");
    console.error("❌ Seeding failed (rolled back):", e);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
