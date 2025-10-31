import { Request, Response } from "express";
import { query } from "../lib/db";

export async function listBookingsForTenant(req: Request, res: Response) {
  const { tenantId } = req.params;
  const rows = await query(
    `SELECT id,
            service_id,
            customer_name,
            customer_phone,
            customer_address,
            start_time,
            end_time,
            status,
            assigned_user_id,
            price_final,
            created_at
     FROM booking
     WHERE tenant_id = $1
     ORDER BY start_time ASC`,
    [tenantId]
  );
  res.json(rows);
}
