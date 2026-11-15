import { createPool } from '@vercel/postgres';
const e = process.env;
const vals = Object.values(e).filter(
  (v) => typeof v === 'string' && v.startsWith('postgres')
);
const url =
  e.POSTGRES_URL ||
  vals.find((v) => v.includes('-pooler')) ||
  vals[0];
export const sql = createPool({ connectionString: url }).sql;
