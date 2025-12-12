import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@/db/migration';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is missing');
}

const connectionString = process.env.DATABASE_URL;
const client = postgres(connectionString, { prepare: false });

// Export the db instance and the schema
export const db = drizzle(client, { schema });
