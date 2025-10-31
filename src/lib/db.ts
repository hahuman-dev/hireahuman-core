import { ENV } from "./env";
import { Client, QueryResultRow } from "pg";

export async function getClient() {
  const client = new Client({
    connectionString: ENV.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });
  await client.connect();
  return client;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: any[] = []
): Promise<T[]> {
  const client = await getClient();
  try {
    const res = await client.query<T>(text, params);
    return res.rows;
  } finally {
    await client.end();
  }
}
