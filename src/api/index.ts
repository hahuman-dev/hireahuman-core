// index.ts (API router layer)
// This is where you'd wire routes -> handlers.

import { Request, Response } from "express";

export function registerRoutes(app: any) {
  app.get("/health", (_req: Request, res: Response) => {
    res.json({ ok: true });
  });

  // Tenants
  app.get("/tenants", require("./tenants").listTenants);
  // Users
  app.get("/tenants/:tenantId/users", require("./users").listUsersForTenant);
  // Services
  app.get("/tenants/:tenantId/services", require("./services").listServicesForTenant);
  // Bookings
  app.get("/tenants/:tenantId/bookings", require("./bookings").listBookingsForTenant);
}
