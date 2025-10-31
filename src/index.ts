// src/index.ts
// Boots the API server.

import express from "express";
import { ENV } from "./lib/env";
import { registerRoutes } from "./api/index";

const app = express();
app.use(express.json());

registerRoutes(app);

app.listen(ENV.PORT, () => {
  console.log(`HAHuman core API running on port ${ENV.PORT} [${ENV.NODE_ENV}]`);
});