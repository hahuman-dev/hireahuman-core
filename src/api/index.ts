import { Application, Request, Response } from "express";
import * as tenants from "./tenants";
import * as users from "./users";
import * as services from "./services";
import * as bookings from "./bookings";

export function registerRoutes(app: Application) {
  // health
  app.get("/health", (_req: Request, res: Response) => {
    res.json({ ok: true });
  });

  // tenants
  app.get("/tenants", tenants.listTenants);
  app.get("/tenants/:tenantId", tenants.getTenantById);
  app.get("/tenants/by-slug/:slug", tenants.getTenantBySlug);

  // users
  app.get("/tenants/:tenantId/users", users.listUsersForTenant);

  // services
  app.get("/tenants/:tenantId/services", services.listServicesForTenant);

  // bookings
  app.get("/tenants/:tenantId/bookings", bookings.listBookingsForTenant);
  app.post("/bookings", bookings.createBooking);
}
