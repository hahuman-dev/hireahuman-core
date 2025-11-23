// src/routes/tenantSettings.ts
import { Router } from "express";
import { getTenantTheme, updateTenantTheme } from "../controllers/tenantSettings";

const router = Router();

// GET current theme for a tenant
router.get("/tenants/:tenantId/theme", getTenantTheme);

// UPDATE theme for a tenant
router.put("/tenants/:tenantId/theme", updateTenantTheme);

export default router;
