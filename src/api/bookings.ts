import { Request, Response } from "express";
import { query } from "../lib/db";
import { v4 as uuidv4 } from "uuid";

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
  res.json({ data: rows, error: null });
}

export async function createBooking(req: Request, res: Response) {
  const {
    tenant_id,
    service_id,
    customer_name,
    customer_phone,
    customer_address,
    start_time,
    end_time
  } = req.body;

  if (!tenant_id || !service_id || !customer_name || !start_time || !end_time) {
    return res
      .status(400)
      .json({ data: null, error: "missing_required_fields" });
  }

  // fetch service to maybe determine price
  const services = await query(
    `SELECT pricing_json FROM service WHERE id = $1 AND tenant_id = $2`,
    [service_id, tenant_id]
  );

  if (!services.length) {
    return res.status(404).json({ data: null, error: "service_not_found" });
  }

  const pricing = services[0].pricing_json;
  let price_final: number | null = null;

  // basic v1 pricing resolution
  if (pricing?.type === "fixed" && typeof pricing.amount === "number") {
    price_final = pricing.amount;
  }

  const id = uuidv4();
  const rows = await query(
    `INSERT INTO booking (
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
        $1,$2,$3,$4,$5,$6,$7,$8,'requested',NULL,$9
      )
      RETURNING *
    `,
    [
      id,
      tenant_id,
      service_id,
      customer_name,
      customer_phone ?? null,
      customer_address ?? null,
      start_time,
      end_time,
      price_final,
    ]
  );

  res.status(201).json({ data: rows[0], error: null });
}
