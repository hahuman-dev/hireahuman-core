import { ENV } from "./env";
import { Client } from "pg";

export async function getClient() {
  const client = new Client({
    connectionString: ENV.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false, // for Neon
    },
  });
  await client.connect();
  return client;
}

export async function query(text: string, params: any[] = []) {
  const client = await getClient();
  try {
    const res = await client.query(text, params);
    return res.rows;
  } finally {
    await client.end();
  }
}
