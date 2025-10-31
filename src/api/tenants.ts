import { Request, Response } from "express";
import { query } from "../lib/db";

export async function listTenants(_req: Request, res: Response) {
  const rows = await query(
    `SELECT id, name, slug, industry, plan, created_at
     FROM tenant
     ORDER BY created_at ASC`
  );
  res.json(rows);
}
