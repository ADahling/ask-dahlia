import express from 'express';
import { sql, eq } from 'drizzle-orm';
import { db } from '../lib/db';
import { documents, chunks } from '../lib/schema';
import { uniqueId, timestamp } from '../lib/utils';
import { OpenAIProvider } from '../lib/providers/openai';

const router = express.Router();

/**
 * Process and embed a document
 */
router.post('/process', async (req, res) => {
  try {
    const { userId, file, metadata } = req.body;

    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Extract base64 data and convert to buffer
    let fileBuffer: Buffer;
    let fileName: string;
    let fileType: string;
    let fileSize: number;

    if (typeof file === 'string') {
      // Handle base64 data URL format
      const matches = file.match(/^data:([^;]+);base64,(.+)$/);
      if (!matches) {
        return res.status(400).json({ error: 'Invalid file data format' });
      }

      fileType = matches[1];
      fileBuffer = Buffer.from(matches[2], 'base64');
      fileName = `document_${Date.now()}`;
      fileSize = fileBuffer.length;
    } else if (file.data) {
      // Handle structured file object
      const matches = file.data.match(/^data:([^;]+);base64,(.+)$/);
      if (!matches) {
        return res.status(400).json({ error: 'Invalid file data format' });
      }

      fileType = file.type || matches[1];
      fileBuffer = Buffer.from(matches[2], 'base64');
      fileName = file.name || `document_${Date.now()}`;
      fileSize = file.size || fileBuffer.length;
    } else {
      return res.status(400).json({ error: 'Invalid file format' });
    }

    // Extract text from file based on type
    let extractedText: string;

    switch (fileType) {
      case 'text/plain':
        extractedText = fileBuffer.toString('utf-8');
        break;
      case 'application/pdf':
        // For now, return error - PDF processing requires additional setup
        return res.status(400).json({ error: 'PDF processing not yet implemented' });
      default:
        return res.status(400).json({ error: 'Unsupported file type' });
    }

    // Create document record
    const documentId = uniqueId();

    await db.insert(documents).values({
      id: documentId,
      userId,
      name: fileName,
      type: fileType,
      size: fileSize,
      status: 'processing',
      uploadedAt: new Date(),
      metadata: metadata || null
    });

    // Split text into chunks (simple sentence-based splitting for now)
    const sentences = extractedText.split(/[.!?]+\s+/).filter(s => s.trim().length > 0);
    const chunkSize = 3; // 3 sentences per chunk
    const chunks_data = [];

    for (let i = 0; i < sentences.length; i += chunkSize) {
      const chunkText = sentences.slice(i, i + chunkSize).join('. ').trim();
      if (chunkText.length > 0) {
        const chunkData: any = {
          id: uniqueId(),
          documentId,
          content: chunkText,
          tokenCount: Math.ceil(chunkText.length / 4), // Rough token estimate
          page: Math.floor(i / chunkSize) + 1,
          start: i,
          end: Math.min(i + chunkSize - 1, sentences.length - 1),
          metadata: { sentence_range: [i, Math.min(i + chunkSize - 1, sentences.length - 1)] }
        };
        chunks_data.push(chunkData);
      }
    }

    // Generate embeddings using OpenAI
    const openai = new OpenAIProvider();

    for (const chunk of chunks_data) {
      try {
        // Generate embedding for this chunk
        const embedding = await openai.generateEmbedding(chunk.content);
        chunk.embedding = embedding;
      } catch (error) {
        console.error('Error generating embedding for chunk:', error);
        // Continue with other chunks even if one fails
      }
    }

    // Insert chunks with embeddings
    if (chunks_data.length > 0) {
      await db.insert(chunks).values(chunks_data);
    }

    // Update document status to completed
    await db.update(documents)
      .set({
        status: 'completed',
        processedAt: new Date()
      })
      .where(eq(documents.id, documentId));

    res.json({
      success: true,
      documentId,
      chunksCreated: chunks_data.length,
      message: 'Document processed and embedded successfully'
    });

  } catch (error: any) {
    console.error('Ingestion error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get document processing status
 */
router.get('/status/:documentId', async (req, res) => {
  try {
    const { documentId } = req.params;

    const documentResults = await db.select().from(documents).where(
      eq(documents.id, documentId)
    ).limit(1);

    const document = documentResults[0];
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Get chunk count
    const chunkResults = await db.select().from(chunks).where(
      eq(chunks.documentId, documentId)
    );
    const chunkCount = chunkResults.length;

    res.json({
      id: document.id,
      name: document.name,
      status: document.status,
      size: document.size,
      uploadedAt: document.uploadedAt,
      processedAt: document.processedAt,
      chunkCount
    });

  } catch (error: any) {
    console.error('Status check error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
