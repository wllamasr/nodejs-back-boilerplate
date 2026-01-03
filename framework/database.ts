import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const {
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  POSTGRES_DB,
  DB_HOST,
  DB_PORT,
} = process.env;

const host = DB_HOST || 'localhost';
const port = DB_PORT || '5432';
const dbName = POSTGRES_DB || 'express_boilerplate';
const user = POSTGRES_USER || 'postgres';
const password = POSTGRES_PASSWORD || 'postgres';

const buildUrl = `postgres://${user}:${password}@${host}:${port}/${dbName}`;

const connectionString = process.env.DATABASE_URL || buildUrl;

// Disable prefetch as it is not supported for "Transaction" pool mode
export const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client);
