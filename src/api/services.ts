import { Request, Response } from "express";
import { query } from "../lib/db";

export async function listServicesForTenant(req: Request, res: Response) {
  const { tenantId } = req.params;
  const rows = await query(
    `SELECT id, name, category, pricing_json, metadata_json, active, created_at
     FROM service
     WHERE tenant_id = $1
     ORDER BY created_at ASC`,
    [tenantId]
  );
  res.json({ data: rows, error: null });
}
