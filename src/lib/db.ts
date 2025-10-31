// db.ts
// Neon connection helper (no ORM for now)

import { ENV } from "./env";
import { Client } from "pg";

export async function getClient() {
  const client = new Client({
    connectionString: ENV.DATABASE_URL,
  });
  await client.connect();
  return client;
}

// Example tiny helper:
export async function query<T = unknown>(text: string, params: any[] = []) {
  const client = await getClient();
  try {
    const res = await client.query<T>(text, params);
    return res.rows;
  } finally {
    await client.end();
  }
}
