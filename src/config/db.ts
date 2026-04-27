import { Pool, QueryResult, QueryResultRow } from "pg";
import Secrets from "./secrets";

const pool = new Pool({
  host: Secrets.POSTGRES_HOST,
  port: Secrets.POSTGRES_PORT,
  user: Secrets.POSTGRES_USER,
  password: Secrets.POSTGRES_PASSWORD,
  database: Secrets.POSTGRES_DB,
  max: 10,
  idleTimeoutMillis: 30000,
  ssl: true
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle pg client", err);
});

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params?: any[],
): Promise<QueryResult<T>> {
  return pool.query<T>(text, params);
}

export async function connectDb(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("SELECT 1");
    console.log(`Postgres connected -> ${Secrets.POSTGRES_HOST}:${Secrets.POSTGRES_PORT}/${Secrets.POSTGRES_DB}`);
  } finally {
    client.release();
  }
}

export default pool;
