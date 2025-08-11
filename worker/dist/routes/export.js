"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = require("../lib/db");
const router = express_1.default.Router();
router.post('/chat/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { format = 'pdf', userId } = req.body;
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }
        const sessionResults = await db_1.db.select().from(db_1.chatSessions).where((0, drizzle_orm_1.sql) `${db_1.chatSessions.id} = ${sessionId} AND ${db_1.chatSessions.userId} = ${userId}`).limit(1);
        const session = sessionResults[0];
        if (!session) {
            return res.status(404).json({ error: 'Chat session not found' });
        }
        const sessionMessages = await db_1.db.select().from(db_1.messages).where((0, drizzle_orm_1.sql) `${db_1.messages.sessionId} = ${sessionId}`).orderBy((0, drizzle_orm_1.sql) `${db_1.messages.createdAt} ASC`);
        res.status(501).json({
            error: 'Export functionality not yet implemented',
            message: 'Export to PDF/DOCX will be available in a future update',
            sessionData: {
                id: session.id,
                title: session.title,
                messageCount: sessionMessages.length
            }
        });
    }
    catch (error) {
        console.error('Export error:', error);
        res.status(500).json({ error: error.message });
    }
});
router.post('/document/:documentId', async (req, res) => {
    try {
        const { documentId } = req.params;
        const { format = 'pdf', userId } = req.body;
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }
        res.status(501).json({
            error: 'Document export not yet implemented',
            message: 'Document export functionality will be available in a future update'
        });
    }
    catch (error) {
        console.error('Document export error:', error);
        res.status(500).json({ error: error.message });
    }
});
router.get('/formats', (req, res) => {
    const formats = [
        { id: 'pdf', name: 'PDF', description: 'Portable Document Format' },
        { id: 'docx', name: 'DOCX', description: 'Microsoft Word Document' },
        { id: 'html', name: 'HTML', description: 'Web Page' },
        { id: 'txt', name: 'TXT', description: 'Plain Text' }
    ];
    res.json({ formats });
});
exports.default = router;
