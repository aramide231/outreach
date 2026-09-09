/**
 * One-time setup: creates the shared souls table in Supabase.
 * Usage:
 *   set SUPABASE_DB_PASSWORD=your-db-password
 *   node scripts/setup-supabase.js
 *
 * Password: Supabase Dashboard → Project Settings → Database → Database password
 */
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const PROJECT_REF = 'ucbegrfziplfkqbtyzdd';
const password = process.env.SUPABASE_DB_PASSWORD || process.argv[2];

if (!password) {
  console.error(
    'Missing database password.\n' +
      'Pass it like: node scripts/setup-supabase.js YOUR_DB_PASSWORD'
  );
  process.exit(1);
}

const sqlPath = path.join(__dirname, '..', 'supabase', 'schema.sql');
let sql = fs.readFileSync(sqlPath, 'utf8');
// Strip leading comment-only guidance lines are fine; keep SQL as-is.

const hosts = [
  `postgresql://postgres.${PROJECT_REF}:${encodeURIComponent(password)}@aws-0-eu-west-1.pooler.supabase.com:6543/postgres`,
  `postgresql://postgres.${PROJECT_REF}:${encodeURIComponent(password)}@aws-0-eu-central-1.pooler.supabase.com:6543/postgres`,
  `postgresql://postgres.${PROJECT_REF}:${encodeURIComponent(password)}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`,
  `postgresql://postgres:${encodeURIComponent(password)}@db.${PROJECT_REF}.supabase.co:5432/postgres`,
];

async function run() {
  let lastError;
  for (const connectionString of hosts) {
    const client = new Client({
      connectionString,
      ssl: { rejectUnauthorized: false },
    });
    try {
      await client.connect();
      console.log('Connected. Creating souls table...');
      await client.query(sql);
      console.log('Done. Shared souls database is ready for every phone.');
      await client.end();
      return;
    } catch (err) {
      lastError = err;
      try {
        await client.end();
      } catch {
        /* ignore */
      }
    }
  }
  console.error('Could not connect/create table:', lastError?.message || lastError);
  process.exit(1);
}

run();
