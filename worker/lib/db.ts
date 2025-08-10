import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Create database connection
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });

// Export all schema tables for convenience
export const {
  users,
  accessRequests,
  documents,
  chunks,
  terms,
  clauses,
  riskTemplates,
  riskAssessments,
  secFilings,
  chatSessions,
  messages,
  citations,
  savedDocuments,
  usageLogs,
  usageSummaries,
  quotas
} = schema;
