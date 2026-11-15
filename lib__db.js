import { createPool } from '@vercel/postgres';
const url =
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL ||
  process.env.STORAGE_POSTGRES_URL ||
  process.env.STORAGE_URL ||
  process.env.STORAGE_DATABASE_URL;
const pool = createPool({ connectionString: url });
export const sql = pool.sql;
