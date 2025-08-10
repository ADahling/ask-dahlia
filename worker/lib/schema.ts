import { pgTable, text, timestamp, uuid, jsonb, integer, decimal, boolean, index, vector } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  role: text('role', { enum: ['admin', 'member'] }).notNull().default('member'),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  title: text('title'),
  company: text('company'),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  address: text('address'),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Access requests table
export const accessRequests = pgTable('access_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  title: text('title').notNull(),
  company: text('company').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  address: text('address').notNull(),
  reason: text('reason').notNull(),
  status: text('status', { enum: ['pending', 'approved', 'denied'] }).notNull().default('pending'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Documents table
export const documents = pgTable('documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  type: text('type').notNull(),
  size: integer('size').notNull(),
  status: text('status', { enum: ['processing', 'completed', 'error'] }).notNull().default('processing'),
  uploadedAt: timestamp('uploaded_at').notNull().defaultNow(),
  processedAt: timestamp('processed_at'),
  metadata: jsonb('metadata'),
});

// Chunks table with pgvector
export const chunks = pgTable('chunks', {
  id: uuid('id').primaryKey().defaultRandom(),
  documentId: uuid('document_id').notNull().references(() => documents.id),
  page: integer('page'),
  start: integer('start'),
  end: integer('end'),
  text: text('text').notNull(),
  embedding: vector('embedding', { dimensions: 1536 }), // OpenAI embeddings dimension
}, (table) => {
  return {
    embeddingIdx: index('chunks_embedding_idx').using('ivfflat', table.embedding.op('vector_cosine_ops')),
  };
});

// Terms table
export const terms = pgTable('terms', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  body: text('body').notNull(),
});

// Clauses table
export const clauses = pgTable('clauses', {
  id: uuid('id').primaryKey().defaultRandom(),
  clauseId: text('clause_id').notNull().unique(),
  title: text('title').notNull(),
  category: text('category').notNull(),
  riskLevel: text('risk_level', { enum: ['low', 'medium', 'high', 'critical'] }).notNull(),
  negotiationPosition: text('negotiation_position', { enum: ['primary', 'secondary', 'fallback'] }).notNull(),
  industrySegments: jsonb('industry_segments'),
  regulations: jsonb('regulations'),
  body: text('body').notNull(),
});

// Risk templates table
export const riskTemplates = pgTable('risk_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  matrixJson: jsonb('matrix_json').notNull(),
});

// Risk assessments table
export const riskAssessments = pgTable('risk_assessments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  score: integer('score').notNull(),
  class: text('class', { enum: ['low', 'medium', 'high', 'critical'] }).notNull(),
  factorsJson: jsonb('factors_json').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// SEC filings table
export const secFilings = pgTable('sec_filings', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  cik: text('cik').notNull(),
  accessionNumber: text('accession_number').notNull(),
  formType: text('form_type').notNull(),
  filingDate: timestamp('filing_date').notNull(),
  reportDate: timestamp('report_date'),
  companyName: text('company_name').notNull(),
  documentUrl: text('document_url').notNull(),
  content: text('content'),
  addedAt: timestamp('added_at').notNull().defaultNow(),
});

// Chat sessions table
export const chatSessions = pgTable('chat_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Chat messages table
export const messages = pgTable('chat_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').notNull().references(() => chatSessions.id),
  role: text('role', { enum: ['user', 'assistant', 'tool'] }).notNull(),
  content: text('content').notNull(),
  jsonPayload: jsonb('json_payload'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Citations table
export const citations = pgTable('citations', {
  id: uuid('id').primaryKey().defaultRandom(),
  messageId: uuid('message_id').notNull().references(() => messages.id),
  type: text('type', { enum: ['term', 'clause', 'doc', 'sec'] }).notNull(),
  refId: text('ref_id').notNull(),
  chunkId: uuid('chunk_id').references(() => chunks.id),
  page: integer('page'),
  url: text('url'),
});

// Saved documents table
export const savedDocuments = pgTable('saved_docs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  type: text('type', { enum: ['draft', 'analysis', 'transcript'] }).notNull(),
  tone: text('tone'),
  content: text('content').notNull(),
  citationsJson: jsonb('citations_json'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Usage logs table
export const usageLogs = pgTable('usage_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  provider: text('provider').notNull(),
  model: text('model').notNull(),
  promptTokens: integer('prompt_tokens').notNull(),
  completionTokens: integer('completion_tokens').notNull(),
  totalTokens: integer('total_tokens').notNull(),
  ms: integer('ms').notNull(),
  costUsd: decimal('cost_usd', { precision: 10, scale: 6 }).notNull(),
  sessionId: uuid('session_id'),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Usage summary table
export const usageSummaries = pgTable('usage_summary', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  period: text('period', { enum: ['day', 'week', 'month'] }).notNull(),
  windowStart: timestamp('window_start').notNull(),
  tokens: integer('tokens').notNull(),
  costUsd: decimal('cost_usd', { precision: 10, scale: 6 }).notNull(),
});

// Quotas table
export const quotas = pgTable('quotas', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  tokensLimit: integer('tokens_limit').notNull().default(100000),
  costLimit: decimal('cost_limit', { precision: 10, scale: 2 }).notNull().default('10.00'),
  requestsLimit: integer('requests_limit').notNull().default(1000),
});

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type AccessRequest = typeof accessRequests.$inferSelect;
export type Document = typeof documents.$inferSelect;
export type Chunk = typeof chunks.$inferSelect;
export type Term = typeof terms.$inferSelect;
export type Clause = typeof clauses.$inferSelect;
export type ChatSession = typeof chatSessions.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type Citation = typeof citations.$inferSelect;
export type SavedDoc = typeof savedDocs.$inferSelect;
export type UsageLog = typeof usageLogs.$inferSelect;
