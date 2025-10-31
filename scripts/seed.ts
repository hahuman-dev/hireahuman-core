import fs from "fs";
import path from "path";
import { Client } from "pg";

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL not set");
  }

  // read JSON
  const seedPath = path.join(__dirname, "..", "db", "seeds", "seed.json");
  const raw = fs.readFileSync(seedPath, "utf-8");
  const data = JSON.parse(raw);

// add an explicit ssl block in your connection code so pg stops second-guessing.
  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
});
//That forces a TLS connection regardless of what flags are in the URL.

  await client.connect();

  console.log("⚙️  Connected to DB, seeding...");

  // Wipe current data (DEV ONLY)
  // order matters because of FK constraints
  await client.query(`DELETE FROM booking;`);
  await client.query(`DELETE FROM service;`);
  await client.query(`DELETE FROM role;`);
  await client.query(`DELETE FROM "user";`);
  await client.query(`DELETE FROM tenant;`);

  // 1. tenants
  for (const t of data.tenants || []) {
    await client.query(
      `
      INSERT INTO tenant (
        id, name, slug, industry, plan, parent_tenant_id, config_json, theme_json
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      `,
      [
        t.id,
        t.name,
        t.slug,
        t.industry,
        t.plan,
        t.parent_tenant_id,
        t.config_json ?? {},
        t.theme_json ?? {},
      ]
    );
  }
  console.log(`✅ inserted tenants: ${(data.tenants || []).length}`);

  // 2. users
  for (const u of data.users || []) {
    await client.query(
      `
      INSERT INTO "user" (
        id, tenant_id, name, email, role, status
      ) VALUES ($1,$2,$3,$4,$5,$6)
      `,
      [
        u.id,
        u.tenant_id,
        u.name,
        u.email,
        u.role,
        u.status ?? "active",
      ]
    );
  }
  console.log(`✅ inserted users: ${(data.users || []).length}`);

  // 3. roles
  for (const r of data.roles || []) {
    await client.query(
      `
      INSERT INTO role (
        id, tenant_id, name, permissions
      ) VALUES ($1,$2,$3,$4)
      `,
      [
        r.id,
        r.tenant_id,
        r.name,
        JSON.stringify(r.permissions ?? []),
      ]
    );
  }
  console.log(`✅ inserted roles: ${(data.roles || []).length}`);

  // 4. services
  for (const s of data.services || []) {
    await client.query(
      `
      INSERT INTO service (
        id, tenant_id, name, category, pricing_json, metadata_json, active
      ) VALUES ($1,$2,$3,$4,$5,$6,$7)
      `,
      [
        s.id,
        s.tenant_id,
        s.name,
        s.category,
        s.pricing_json ?? {},
        s.metadata_json ?? {},
        s.active ?? true,
      ]
    );
  }
  console.log(`✅ inserted services: ${(data.services || []).length}`);

  // 5. bookings
  for (const b of data.bookings || []) {
    await client.query(
      `
      INSERT INTO booking (
        id,
        tenant_id,
        service_id,
        customer_name,
        customer_phone,
        customer_address,
        start_time,
        end_time,
        status,
        assigned_user_id,
        price_final
      )
      VALUES (
        COALESCE($1, uuid_generate_v4()),
        $2,$3,$4,$5,$6,$7,$8,$9,$10,$11
      )
      `,
      [
        b.id ?? null,
        b.tenant_id,
        b.service_id,
        b.customer_name,
        b.customer_phone ?? null,
        b.customer_address ?? null,
        b.start_time,
        b.end_time,
        b.status ?? "confirmed",
        b.assigned_user_id ?? null,
        b.price_final ?? null,
      ]
    );
  }
  console.log(`✅ inserted bookings: ${(data.bookings || []).length}`);

  await client.end();
  console.log("🎉 Seeding complete.");
}

main().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
