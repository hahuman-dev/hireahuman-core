import express from "express";
import cors from "cors";
import { ENV } from "./lib/env";
import { registerRoutes } from "./api/index";

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "https://app-dev.hireahuman.com",
      "https://hireahuman.com",
    ],
    credentials: true,
  })
);

app.use(express.json());

// 🔐 simple API key guard
app.use((req, res, next) => {
  const requiredKey = process.env.API_KEY;
  // if no key set in env → allow all (dev/local)
  if (!requiredKey) return next();

  const incoming = req.header("x-hah-key");
  if (incoming !== requiredKey) {
    return res.status(401).json({ error: "unauthorized" });
  }
  next();
});

registerRoutes(app);

const port = Number(process.env.PORT) || Number(ENV.PORT) || 3000;
app.listen(port, () => {
  console.log(`HAHuman core API running on port ${port} [${ENV.NODE_ENV}]`);
});
