import express from 'express';
import { PassThrough } from 'stream';
import { OpenAIProvider } from '../lib/providers/openai';
import { AnthropicProvider } from '../lib/providers/anthropic';
import { logUsage } from '../lib/usage';
import { db } from '../lib/db';
import { chunks, documents, citations } from '../lib/schema';
import { sql, desc, eq, and } from 'drizzle-orm';

const router = express.Router();

/**
 * Search for relevant document chunks using vector similarity
 * @param query User query/last message
 * @param userId User ID to filter documents
 * @param limit Maximum number of chunks to retrieve
 * @returns Array of relevant document chunks
 */
async function searchDocuments(query: string, userId: string, limit: number = 10) {
  try {
    // For now, use OpenAI to generate embedding for the query
    const openaiProvider = new OpenAIProvider();
    const embedding = await openaiProvider.generateEmbedding(query);

    if (!embedding) {
      console.warn('Failed to generate embedding for query');
      return [];
    }

    // Search for similar chunks using pgvector cosine similarity
    const searchResults = await db
      .select({
        id: chunks.id,
        content: chunks.content,
        documentId: chunks.documentId,
        chunkIndex: chunks.page,
        documentTitle: documents.name,
        similarity: sql<number>`1 - (${chunks.embedding} <=> ${embedding})`,
      })
      .from(chunks)
      .innerJoin(documents, eq(chunks.documentId, documents.id))
      .where(
        and(
          eq(documents.userId, userId),
          eq(documents.status, 'completed')
        )
      )
      .orderBy(sql`${chunks.embedding} <=> ${embedding}`)
      .limit(limit);

    // Filter by similarity threshold (0.7 = 70% similar)
    const relevantChunks = searchResults.filter(chunk => chunk.similarity >= 0.7);

    console.log(`Found ${relevantChunks.length} relevant chunks for query: "${query.substring(0, 100)}..."`);

    return relevantChunks;
  } catch (error) {
    console.error('Document search error:', error);
    return [];
  }
}

/**
 * Create augmented system prompt with document context
 * @param originalMessages Original conversation messages
 * @param relevantChunks Retrieved document chunks
 * @returns Augmented messages with context
 */
function augmentWithContext(originalMessages: any[], relevantChunks: any[]) {
  if (relevantChunks.length === 0) {
    return originalMessages;
  }

  // Build context from relevant chunks
  const contextSections = relevantChunks.map((chunk, index) =>
    `[Document ${index + 1}: ${chunk.documentTitle}]\n${chunk.content}`
  ).join('\n\n');

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

  // Add system message if it doesn't exist, or replace existing system message
  const augmentedMessages = [...originalMessages];

  if (augmentedMessages[0]?.role === 'system') {
    augmentedMessages[0] = { role: 'system', content: systemPrompt };
  } else {
    augmentedMessages.unshift({ role: 'system', content: systemPrompt });
  }

  return augmentedMessages;
}

// Stream SSE response for chat
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

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Create pass-through stream for streaming response
  const stream = new PassThrough();
  stream.pipe(res);

  // Handle client disconnect
  req.on('close', () => {
    stream.end();
  });

  const startTime = Date.now();
  let totalTokens = 0;
  let promptTokens = 0;
  let completionTokens = 0;

  try {
    // Extract user's last message for search
    const userMessages = messages.filter(msg => msg.role === 'user');
    const lastUserMessage = userMessages[userMessages.length - 1]?.content || '';

    // Search for relevant documents using RAG
    console.log('Searching documents for context...');
    const relevantChunks = await searchDocuments(lastUserMessage, userId, 5);

    // Augment messages with document context
    const augmentedMessages = augmentWithContext(messages, relevantChunks);

    // Select provider based on request
    let llmProvider;

    switch (provider) {
      case 'anthropic':
        llmProvider = new AnthropicProvider();
        break;
      case 'openai':
      default:
        llmProvider = new OpenAIProvider();
        break;
    }

    // Stream the response with augmented context
    await llmProvider.streamChat(augmentedMessages, async (chunk) => {
      // Add citation information if we used document context
      if (relevantChunks.length > 0 && chunk.content) {
        chunk.citations = relevantChunks.map((doc, index) => ({
          type: 'doc',
          id: doc.documentId,
          title: doc.documentTitle,
          page: (doc.chunkIndex || 0) + 1
        }));
      }

      // Send chunk as SSE event
      stream.write(`data: ${JSON.stringify(chunk)}\n\n`);

      // Track tokens if available in chunk
      if (chunk.usage) {
        promptTokens = chunk.usage.prompt_tokens || 0;
        completionTokens = chunk.usage.completion_tokens || 0;
        totalTokens = chunk.usage.total_tokens || 0;
      }
    });

    // Send end event
    stream.write('event: end\ndata: {}\n\n');

    // Log usage
    const elapsedMs = Date.now() - startTime;

    await logUsage({
      userId,
      provider,
      model: llmProvider.model,
      promptTokens,
      completionTokens,
      totalTokens,
      ms: elapsedMs,
      sessionId
    });
  } catch (error: any) {
    console.error('Chat error:', error);

    // Send error event
    stream.write(`event: error\ndata: ${JSON.stringify({ error: error.message })}\n\n`);
  } finally {
    // End the stream
    stream.end();
  }
});

export default router;
