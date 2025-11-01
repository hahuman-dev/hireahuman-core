import { Request, Response } from "express";
import { query } from "../lib/db";

export async function listUsersForTenant(req: Request, res: Response) {
  const { tenantId } = req.params;
  const rows = await query(
    `SELECT id, name, email, role, status, created_at
     FROM "user"
     WHERE tenant_id = $1
     ORDER BY created_at ASC`,
    [tenantId]
  );
  res.json({ data: rows, error: null });
}
