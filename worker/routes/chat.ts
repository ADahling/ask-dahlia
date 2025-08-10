import express from 'express';
import { PassThrough } from 'stream';
import { OpenAIProvider } from '../lib/providers/openai';
import { AnthropicProvider } from '../lib/providers/anthropic';
import { logUsage } from '../lib/usage';

const router = express.Router();

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

    // Stream the response
    await llmProvider.streamChat(messages, async (chunk) => {
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
