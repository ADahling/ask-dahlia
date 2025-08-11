"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.quotas = exports.usageSummaries = exports.usageLogs = exports.savedDocuments = exports.citations = exports.messages = exports.chatSessions = exports.secFilings = exports.riskAssessments = exports.riskTemplates = exports.clauses = exports.terms = exports.chunks = exports.documents = exports.accessRequests = exports.users = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.users = (0, pg_core_1.pgTable)('users', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    role: (0, pg_core_1.text)('role', { enum: ['admin', 'member'] }).notNull().default('member'),
    firstName: (0, pg_core_1.text)('first_name').notNull(),
    lastName: (0, pg_core_1.text)('last_name').notNull(),
    title: (0, pg_core_1.text)('title'),
    company: (0, pg_core_1.text)('company'),
    email: (0, pg_core_1.text)('email').notNull().unique(),
    phone: (0, pg_core_1.text)('phone'),
    address: (0, pg_core_1.text)('address'),
    passwordHash: (0, pg_core_1.text)('password_hash').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
});
exports.accessRequests = (0, pg_core_1.pgTable)('access_requests', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    firstName: (0, pg_core_1.text)('first_name').notNull(),
    lastName: (0, pg_core_1.text)('last_name').notNull(),
    title: (0, pg_core_1.text)('title').notNull(),
    company: (0, pg_core_1.text)('company').notNull(),
    email: (0, pg_core_1.text)('email').notNull(),
    phone: (0, pg_core_1.text)('phone').notNull(),
    address: (0, pg_core_1.text)('address').notNull(),
    reason: (0, pg_core_1.text)('reason').notNull(),
    status: (0, pg_core_1.text)('status', { enum: ['pending', 'approved', 'denied'] }).notNull().default('pending'),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
});
exports.documents = (0, pg_core_1.pgTable)('documents', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    userId: (0, pg_core_1.uuid)('user_id').notNull().references(() => exports.users.id),
    name: (0, pg_core_1.text)('name').notNull(),
    type: (0, pg_core_1.text)('type').notNull(),
    size: (0, pg_core_1.integer)('size').notNull(),
    status: (0, pg_core_1.text)('status', { enum: ['processing', 'completed', 'error'] }).notNull().default('processing'),
    uploadedAt: (0, pg_core_1.timestamp)('uploaded_at').notNull().defaultNow(),
    processedAt: (0, pg_core_1.timestamp)('processed_at'),
    metadata: (0, pg_core_1.jsonb)('metadata'),
});
exports.chunks = (0, pg_core_1.pgTable)('chunks', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    documentId: (0, pg_core_1.uuid)('document_id').notNull().references(() => exports.documents.id),
    content: (0, pg_core_1.text)('content').notNull(),
    tokenCount: (0, pg_core_1.integer)('token_count'),
    metadata: (0, pg_core_1.jsonb)('metadata'),
    embedding: (0, pg_core_1.vector)('embedding', { dimensions: 1536 }),
    page: (0, pg_core_1.integer)('page'),
    start: (0, pg_core_1.integer)('start'),
    end: (0, pg_core_1.integer)('end'),
}, (table) => {
    return {
        embeddingIdx: (0, pg_core_1.index)('chunks_embedding_idx').using('ivfflat', table.embedding.op('vector_cosine_ops')),
    };
});
exports.terms = (0, pg_core_1.pgTable)('terms', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    slug: (0, pg_core_1.text)('slug').notNull().unique(),
    title: (0, pg_core_1.text)('title').notNull(),
    body: (0, pg_core_1.text)('body').notNull(),
});
exports.clauses = (0, pg_core_1.pgTable)('clauses', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    clauseId: (0, pg_core_1.text)('clause_id').notNull().unique(),
    title: (0, pg_core_1.text)('title').notNull(),
    category: (0, pg_core_1.text)('category').notNull(),
    riskLevel: (0, pg_core_1.text)('risk_level', { enum: ['low', 'medium', 'high', 'critical'] }).notNull(),
    negotiationPosition: (0, pg_core_1.text)('negotiation_position', { enum: ['primary', 'secondary', 'fallback'] }).notNull(),
    industrySegments: (0, pg_core_1.jsonb)('industry_segments'),
    regulations: (0, pg_core_1.jsonb)('regulations'),
    body: (0, pg_core_1.text)('body').notNull(),
});
exports.riskTemplates = (0, pg_core_1.pgTable)('risk_templates', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    name: (0, pg_core_1.text)('name').notNull(),
    matrixJson: (0, pg_core_1.jsonb)('matrix_json').notNull(),
});
exports.riskAssessments = (0, pg_core_1.pgTable)('risk_assessments', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    userId: (0, pg_core_1.uuid)('user_id').notNull().references(() => exports.users.id),
    score: (0, pg_core_1.integer)('score').notNull(),
    class: (0, pg_core_1.text)('class', { enum: ['low', 'medium', 'high', 'critical'] }).notNull(),
    factorsJson: (0, pg_core_1.jsonb)('factors_json').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
});
exports.secFilings = (0, pg_core_1.pgTable)('sec_filings', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    userId: (0, pg_core_1.uuid)('user_id').notNull().references(() => exports.users.id),
    cik: (0, pg_core_1.text)('cik').notNull(),
    accessionNumber: (0, pg_core_1.text)('accession_number').notNull(),
    formType: (0, pg_core_1.text)('form_type').notNull(),
    filingDate: (0, pg_core_1.timestamp)('filing_date').notNull(),
    reportDate: (0, pg_core_1.timestamp)('report_date'),
    companyName: (0, pg_core_1.text)('company_name').notNull(),
    documentUrl: (0, pg_core_1.text)('document_url').notNull(),
    content: (0, pg_core_1.text)('content'),
    addedAt: (0, pg_core_1.timestamp)('added_at').notNull().defaultNow(),
});
exports.chatSessions = (0, pg_core_1.pgTable)('chat_sessions', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    userId: (0, pg_core_1.uuid)('user_id').notNull().references(() => exports.users.id),
    title: (0, pg_core_1.text)('title').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
});
exports.messages = (0, pg_core_1.pgTable)('chat_messages', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    sessionId: (0, pg_core_1.uuid)('session_id').notNull().references(() => exports.chatSessions.id),
    role: (0, pg_core_1.text)('role', { enum: ['user', 'assistant', 'tool'] }).notNull(),
    content: (0, pg_core_1.text)('content').notNull(),
    jsonPayload: (0, pg_core_1.jsonb)('json_payload'),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
});
exports.citations = (0, pg_core_1.pgTable)('citations', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    messageId: (0, pg_core_1.uuid)('message_id').notNull().references(() => exports.messages.id),
    type: (0, pg_core_1.text)('type', { enum: ['term', 'clause', 'doc', 'sec'] }).notNull(),
    refId: (0, pg_core_1.text)('ref_id').notNull(),
    chunkId: (0, pg_core_1.uuid)('chunk_id').references(() => exports.chunks.id),
    page: (0, pg_core_1.integer)('page'),
    url: (0, pg_core_1.text)('url'),
});
exports.savedDocuments = (0, pg_core_1.pgTable)('saved_docs', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    userId: (0, pg_core_1.uuid)('user_id').notNull().references(() => exports.users.id),
    title: (0, pg_core_1.text)('title').notNull(),
    type: (0, pg_core_1.text)('type', { enum: ['draft', 'analysis', 'transcript'] }).notNull(),
    tone: (0, pg_core_1.text)('tone'),
    content: (0, pg_core_1.text)('content').notNull(),
    citationsJson: (0, pg_core_1.jsonb)('citations_json'),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').notNull().defaultNow(),
});
exports.usageLogs = (0, pg_core_1.pgTable)('usage_logs', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    userId: (0, pg_core_1.uuid)('user_id').notNull().references(() => exports.users.id),
    provider: (0, pg_core_1.text)('provider').notNull(),
    model: (0, pg_core_1.text)('model').notNull(),
    promptTokens: (0, pg_core_1.integer)('prompt_tokens').notNull(),
    completionTokens: (0, pg_core_1.integer)('completion_tokens').notNull(),
    totalTokens: (0, pg_core_1.integer)('total_tokens').notNull(),
    ms: (0, pg_core_1.integer)('ms').notNull(),
    costUsd: (0, pg_core_1.decimal)('cost_usd', { precision: 10, scale: 6 }).notNull(),
    sessionId: (0, pg_core_1.uuid)('session_id'),
    timestamp: (0, pg_core_1.timestamp)('timestamp').notNull().defaultNow(),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
});
exports.usageSummaries = (0, pg_core_1.pgTable)('usage_summary', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    userId: (0, pg_core_1.uuid)('user_id').notNull().references(() => exports.users.id),
    period: (0, pg_core_1.text)('period', { enum: ['day', 'week', 'month'] }).notNull(),
    windowStart: (0, pg_core_1.timestamp)('window_start').notNull(),
    tokens: (0, pg_core_1.integer)('tokens').notNull(),
    costUsd: (0, pg_core_1.decimal)('cost_usd', { precision: 10, scale: 6 }).notNull(),
});
exports.quotas = (0, pg_core_1.pgTable)('quotas', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    userId: (0, pg_core_1.uuid)('user_id').notNull().references(() => exports.users.id),
    tokensLimit: (0, pg_core_1.integer)('tokens_limit').notNull().default(100000),
    costLimit: (0, pg_core_1.decimal)('cost_limit', { precision: 10, scale: 2 }).notNull().default('10.00'),
    requestsLimit: (0, pg_core_1.integer)('requests_limit').notNull().default(1000),
});
