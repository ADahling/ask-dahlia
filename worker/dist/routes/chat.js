"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const stream_1 = require("stream");
const openai_1 = require("../lib/providers/openai");
const anthropic_1 = require("../lib/providers/anthropic");
const usage_1 = require("../lib/usage");
const db_1 = require("../lib/db");
const schema_1 = require("../lib/schema");
const drizzle_orm_1 = require("drizzle-orm");
const router = express_1.default.Router();
async function searchDocuments(query, userId, limit = 10) {
    try {
        const openaiProvider = new openai_1.OpenAIProvider();
        const embedding = await openaiProvider.generateEmbedding(query);
        if (!embedding) {
            console.warn('Failed to generate embedding for query');
            return [];
        }
        const searchResults = await db_1.db
            .select({
            id: schema_1.chunks.id,
            content: schema_1.chunks.content,
            documentId: schema_1.chunks.documentId,
            chunkIndex: schema_1.chunks.page,
            documentTitle: schema_1.documents.name,
            similarity: (0, drizzle_orm_1.sql) `1 - (${schema_1.chunks.embedding} <=> ${embedding})`,
        })
            .from(schema_1.chunks)
            .innerJoin(schema_1.documents, (0, drizzle_orm_1.eq)(schema_1.chunks.documentId, schema_1.documents.id))
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.documents.userId, userId), (0, drizzle_orm_1.eq)(schema_1.documents.status, 'completed')))
            .orderBy((0, drizzle_orm_1.sql) `${schema_1.chunks.embedding} <=> ${embedding}`)
            .limit(limit);
        const relevantChunks = searchResults.filter(chunk => chunk.similarity >= 0.7);
        console.log(`Found ${relevantChunks.length} relevant chunks for query: "${query.substring(0, 100)}..."`);
        return relevantChunks;
    }
    catch (error) {
        console.error('Document search error:', error);
        return [];
    }
}
function augmentWithContext(originalMessages, relevantChunks) {
    if (relevantChunks.length === 0) {
        return originalMessages;
    }
    const contextSections = relevantChunks.map((chunk, index) => `[Document ${index + 1}: ${chunk.documentTitle}]\n${chunk.content}`).join('\n\n');
    const systemPrompt = `You are Dahlia, an AI legal assistant specializing in contract analysis and legal research. You have access to the user's uploaded legal documents and can reference them to provide accurate, contextual answers.

RETRIEVED CONTEXT:
${contextSections}

INSTRUCTIONS:
- Use the provided context to answer questions about the user's documents
- Cite specific document sections when referencing information
- If the context doesn't contain relevant information, clearly state that
- Provide practical legal insights while noting you're not providing legal advice
- Be concise but thorough in your responses

Remember to always cite your sources using the format [Document X] when referencing the provided context.`;
    const augmentedMessages = [...originalMessages];
    if (augmentedMessages[0]?.role === 'system') {
        augmentedMessages[0] = { role: 'system', content: systemPrompt };
    }
    else {
        augmentedMessages.unshift({ role: 'system', content: systemPrompt });
    }
    return augmentedMessages;
}
router.post('/stream', async (req, res) => {
    const { messages, userId, sessionId, provider = 'openai' } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'Messages are required' });
    }
    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }
    if (!sessionId) {
        return res.status(400).json({ error: 'Session ID is required' });
    }
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    const stream = new stream_1.PassThrough();
    stream.pipe(res);
    req.on('close', () => {
        stream.end();
    });
    const startTime = Date.now();
    let totalTokens = 0;
    let promptTokens = 0;
    let completionTokens = 0;
    try {
        const userMessages = messages.filter(msg => msg.role === 'user');
        const lastUserMessage = userMessages[userMessages.length - 1]?.content || '';
        console.log('Searching documents for context...');
        const relevantChunks = await searchDocuments(lastUserMessage, userId, 5);
        const augmentedMessages = augmentWithContext(messages, relevantChunks);
        let llmProvider;
        switch (provider) {
            case 'anthropic':
                llmProvider = new anthropic_1.AnthropicProvider();
                break;
            case 'openai':
            default:
                llmProvider = new openai_1.OpenAIProvider();
                break;
        }
        await llmProvider.streamChat(augmentedMessages, async (chunk) => {
            if (relevantChunks.length > 0 && chunk.content) {
                chunk.citations = relevantChunks.map((doc, index) => ({
                    type: 'doc',
                    id: doc.documentId,
                    title: doc.documentTitle,
                    page: (doc.chunkIndex || 0) + 1
                }));
            }
            stream.write(`data: ${JSON.stringify(chunk)}\n\n`);
            if (chunk.usage) {
                promptTokens = chunk.usage.prompt_tokens || 0;
                completionTokens = chunk.usage.completion_tokens || 0;
                totalTokens = chunk.usage.total_tokens || 0;
            }
        });
        stream.write('event: end\ndata: {}\n\n');
        const elapsedMs = Date.now() - startTime;
        await (0, usage_1.logUsage)({
            userId,
            provider,
            model: llmProvider.model,
            promptTokens,
            completionTokens,
            totalTokens,
            ms: elapsedMs,
            sessionId
        });
    }
    catch (error) {
        console.error('Chat error:', error);
        stream.write(`event: error\ndata: ${JSON.stringify({ error: error.message })}\n\n`);
    }
    finally {
        stream.end();
    }
});
exports.default = router;
