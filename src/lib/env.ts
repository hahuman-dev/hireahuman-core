// src/lib/env.ts
import dotenv from "dotenv";
dotenv.config();

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL: process.env.DATABASE_URL || "",
  PORT: process.env.PORT || "3000",
};

if (!ENV.DATABASE_URL) {
  throw new Error("Missing DATABASE_URL in environment (.env?)");
}
