// src/controllers/tenantSettings.ts
import { Request, Response } from "express";
import { query } from "../lib/db";
import { z } from "zod";

const themeSchema = z.object({
  logo: z.string().url().min(1).optional(),       // e.g. "/logos/justcall.svg" or full URL
  primary: z.string().regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/).optional(),
  secondary: z
    .string()
    .regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/)
    .optional(),
  accent: z
    .string()
    .regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/)
    .optional(),
  // add other theme properties as needed (font, borderRadius, etc)
});

export async function getTenantTheme(req: Request, res: Response) {
  const { tenantId } = req.params;

  const rows = await query(
    `SELECT id, name, slug, theme_json
     FROM tenant
     WHERE id = $1`,
    [tenantId]
  );

  if (!rows.length) {
    return res.status(404).json({ data: null, error: "tenant_not_found" });
  }

  return res.json({ data: rows[0].theme_json ?? {}, error: null });
}

export async function updateTenantTheme(req: Request, res: Response) {
  const { tenantId } = req.params;

  const parsed = themeSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      data: null,
      error: "invalid_theme_payload",
      details: parsed.error.format(),
    });
  }

  const theme = parsed.data;

  // This will *merge* new theme values into existing JSON (Postgres JSONB)
  const rows = await query(
    `
    UPDATE tenant
    SET theme_json = COALESCE(theme_json, '{}'::jsonb) || $2::jsonb
    WHERE id = $1
    RETURNING id, name, slug, theme_json
    `,
    [tenantId, JSON.stringify(theme)]
  );

  if (!rows.length) {
    return res.status(404).json({ data: null, error: "tenant_not_found" });
  }

  return res.json({ data: rows[0].theme_json, error: null });
}
