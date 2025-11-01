import { Request, Response } from "express";
import { query } from "../lib/db";

export async function listTenants(_req: Request, res: Response) {
  const rows = await query(
    `SELECT id, name, slug, industry, plan, config_json, theme_json, created_at
     FROM tenant
     ORDER BY created_at ASC`
  );
  res.json({ data: rows, error: null });
}

export async function getTenantById(req: Request, res: Response) {
  const { tenantId } = req.params;
  const rows = await query(
    `SELECT id, name, slug, industry, plan, parent_tenant_id,
            config_json, theme_json, created_at
     FROM tenant
     WHERE id = $1`,
    [tenantId]
  );
  if (!rows.length) {
    return res.status(404).json({ data: null, error: "tenant_not_found" });
  }
  res.json({ data: rows[0], error: null });
}

export async function getTenantBySlug(req: Request, res: Response) {
  const { slug } = req.params;
  const rows = await query(
    `SELECT id, name, slug, industry, plan, parent_tenant_id,
            config_json, theme_json, created_at
     FROM tenant
     WHERE slug = $1`,
    [slug]
  );
  if (!rows.length) {
    return res.status(404).json({ data: null, error: "tenant_not_found" });
  }
  res.json({ data: rows[0], error: null });
}
