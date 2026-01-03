import type { Config } from 'drizzle-kit';

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

const connectionString = process.env.DATABASE_URL || `postgres://${user}:${password}@${host}:${port}/${dbName}`;

export default {
  schema: './src/modules/**/models/*.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: connectionString,
  },
} satisfies Config;
