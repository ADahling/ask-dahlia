"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = require("../lib/db");
const schema_1 = require("../lib/schema");
const utils_1 = require("../lib/utils");
const openai_1 = require("../lib/providers/openai");
const router = express_1.default.Router();
router.post('/process', async (req, res) => {
    try {
        const { userId, file, metadata } = req.body;
        if (!file) {
            return res.status(400).json({ error: 'No file provided' });
        }
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }
        let fileBuffer;
        let fileName;
        let fileType;
        let fileSize;
        if (typeof file === 'string') {
            const matches = file.match(/^data:([^;]+);base64,(.+)$/);
            if (!matches) {
                return res.status(400).json({ error: 'Invalid file data format' });
            }
            fileType = matches[1];
            fileBuffer = Buffer.from(matches[2], 'base64');
            fileName = `document_${Date.now()}`;
            fileSize = fileBuffer.length;
        }
        else if (file.data) {
            const matches = file.data.match(/^data:([^;]+);base64,(.+)$/);
            if (!matches) {
                return res.status(400).json({ error: 'Invalid file data format' });
            }
            fileType = file.type || matches[1];
            fileBuffer = Buffer.from(matches[2], 'base64');
            fileName = file.name || `document_${Date.now()}`;
            fileSize = file.size || fileBuffer.length;
        }
        else {
            return res.status(400).json({ error: 'Invalid file format' });
        }
        let extractedText;
        switch (fileType) {
            case 'text/plain':
                extractedText = fileBuffer.toString('utf-8');
                break;
            case 'application/pdf':
                return res.status(400).json({ error: 'PDF processing not yet implemented' });
            default:
                return res.status(400).json({ error: 'Unsupported file type' });
        }
        const documentId = (0, utils_1.uniqueId)();
        await db_1.db.insert(schema_1.documents).values({
            id: documentId,
            userId,
            name: fileName,
            type: fileType,
            size: fileSize,
            status: 'processing',
            uploadedAt: new Date(),
            metadata: metadata || null
        });
        const sentences = extractedText.split(/[.!?]+\s+/).filter(s => s.trim().length > 0);
        const chunkSize = 3;
        const chunks_data = [];
        for (let i = 0; i < sentences.length; i += chunkSize) {
            const chunkText = sentences.slice(i, i + chunkSize).join('. ').trim();
            if (chunkText.length > 0) {
                const chunkData = {
                    id: (0, utils_1.uniqueId)(),
                    documentId,
                    content: chunkText,
                    tokenCount: Math.ceil(chunkText.length / 4),
                    page: Math.floor(i / chunkSize) + 1,
                    start: i,
                    end: Math.min(i + chunkSize - 1, sentences.length - 1),
                    metadata: { sentence_range: [i, Math.min(i + chunkSize - 1, sentences.length - 1)] }
                };
                chunks_data.push(chunkData);
            }
        }
        const openai = new openai_1.OpenAIProvider();
        for (const chunk of chunks_data) {
            try {
                const embedding = await openai.generateEmbedding(chunk.content);
                chunk.embedding = embedding;
            }
            catch (error) {
                console.error('Error generating embedding for chunk:', error);
            }
        }
        if (chunks_data.length > 0) {
            await db_1.db.insert(schema_1.chunks).values(chunks_data);
        }
        await db_1.db.update(schema_1.documents)
            .set({
            status: 'completed',
            processedAt: new Date()
        })
            .where((0, drizzle_orm_1.eq)(schema_1.documents.id, documentId));
        res.json({
            success: true,
            documentId,
            chunksCreated: chunks_data.length,
            message: 'Document processed and embedded successfully'
        });
    }
    catch (error) {
        console.error('Ingestion error:', error);
        res.status(500).json({ error: error.message });
    }
});
router.get('/status/:documentId', async (req, res) => {
    try {
        const { documentId } = req.params;
        const documentResults = await db_1.db.select().from(schema_1.documents).where((0, drizzle_orm_1.eq)(schema_1.documents.id, documentId)).limit(1);
        const document = documentResults[0];
        if (!document) {
            return res.status(404).json({ error: 'Document not found' });
        }
        const chunkResults = await db_1.db.select().from(schema_1.chunks).where((0, drizzle_orm_1.eq)(schema_1.chunks.documentId, documentId));
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
    }
    catch (error) {
        console.error('Status check error:', error);
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
