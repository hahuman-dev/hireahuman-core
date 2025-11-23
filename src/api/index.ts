// src/api/index.ts
import { Application, Request, Response } from "express";

import * as tenants from "./tenants";
import * as users from "./users";
import * as services from "./services";
import * as bookings from "./bookings";
// src/app.ts
import tenantSettingsRouter from "../routes/tenantSettings";

export function registerRoutes(app: Application) {
  // health
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ ok: true });
  });

  //
  // TENANTS
  //
  app.get("/api/tenants", tenants.listTenants);
  app.get("/api/tenants/:tenantId", tenants.getTenantById);
  app.get("/api/tenants/by-slug/:slug", tenants.getTenantBySlug);

  //
  // USERS (per tenant)
  //
  app.get("/api/tenants/:tenantId/users", users.listUsersForTenant);
  // later:
  // app.post("/tenants/:tenantId/users", users.createUserForTenant);
  // app.patch("/users/:userId", users.updateUser);

  //
  // SERVICES (per tenant)
  //
  app.get("/api/tenants/:tenantId/services", services.listServicesForTenant);

  //
  // BOOKINGS (per tenant)
  //
  app.get("/api/tenants/:tenantId/bookings", bookings.listBookingsForTenant);
  app.post("/api/bookings", bookings.createBooking);

  app.use("/api", tenantSettingsRouter);
  //
  // 404 fallback (optional, nice to have)
  //
  app.use((_req, res) => {
    res.status(404).json({ data: null, error: "route_not_found" });
  });
}
