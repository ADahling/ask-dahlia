import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import * as schema from './schema';

// Create pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});

// Create drizzle instance
export const db = drizzle(pool, { schema });

// Export schema for convenience
export * from './schema';
