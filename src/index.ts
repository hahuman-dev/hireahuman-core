import express from "express";
import cors from "cors";
import { ENV } from "./lib/env";
import { registerRoutes } from "./api/index";

const app = express();


app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://127.0.0.1:3001",
      "http://127.0.0.1:3000",
      "https://app-dev.hireahuman.com",
      "https://hireahuman.com",
    ],
    credentials: true,
  })
);

app.use(express.json());

//DEV bypass
app.use((req, res, next) => {
  const requiredKey = process.env.API_KEY;

  // 1) DEV bypass: if we're running locally (not production), allow without key
  const isDevEnv = process.env.NODE_ENV !== "production";

  // 2) Also treat requests that clearly come from loopback / localhost as local:
  const hostHeader = (req.get("host") || "").toLowerCase();
  const originHeader = (req.get("origin") || "").toLowerCase();
  const forwardedFor = (req.get("x-forwarded-for") || "").split(",")[0].trim();
  const remoteIp = (req.ip || forwardedFor || "").replace(/^::ffff:/, "");

  const isLocalHost =
    hostHeader.includes("localhost") ||
    originHeader.includes("localhost") ||
    remoteIp === "127.0.0.1" ||
    remoteIp === "::1";

  if (!requiredKey) {
    // If there's no key configured at all, behave permissively (useful for quick dev)
    console.warn("[API Key] no API_KEY configured — allowing requests (dev)");
    return next();
  }

  // Allow in dev or when request is clearly local
  if (isDevEnv || isLocalHost) {
    console.log(`[API Key] bypassing check for local request (host=${hostHeader}, ip=${remoteIp})`);
    return next();
  }

  // Otherwise, require correct header
  const incoming = req.header("x-hah-key");
  if (incoming !== requiredKey) {
    console.log(`[API Key] unauthorized (host=${hostHeader}, ip=${remoteIp})`);
    return res.status(401).json({ error: "unauthorized" });
  }

  next();
});

registerRoutes(app);

const port = Number(process.env.PORT) || Number(ENV.PORT) || 3000;

app.listen(port, () => {
  console.log(`HAHuman core API running on port ${port} [${ENV.NODE_ENV}]`);
});
