import { neon } from '@neondatabase/serverless';
const vals = Object.values(process.env).filter(
  (v) => typeof v === 'string' && v.startsWith('postgres')
);
const url =
  process.env.POSTGRES_URL ||
  vals.find((v) => v.includes('-pooler')) ||
  vals[0];
export async function sql(strings, ...values) {
  const rows = await neon(url)(strings, ...values);
  return { rows };
}
