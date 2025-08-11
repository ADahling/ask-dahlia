"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
router.post('/synthesize', async (req, res) => {
    try {
        const { text, voice = 'alloy', format = 'mp3', userId } = req.body;
        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }
        res.status(501).json({
            error: 'Text-to-speech not yet implemented',
            message: 'TTS functionality will be available in a future update'
        });
    }
    catch (error) {
        console.error('TTS error:', error);
        res.status(500).json({ error: error.message });
    }
});
router.get('/voices', (req, res) => {
    const voices = [
        { id: 'alloy', name: 'Alloy', gender: 'neutral' },
        { id: 'echo', name: 'Echo', gender: 'male' },
        { id: 'fable', name: 'Fable', gender: 'neutral' },
        { id: 'onyx', name: 'Onyx', gender: 'male' },
        { id: 'nova', name: 'Nova', gender: 'female' },
        { id: 'shimmer', name: 'Shimmer', gender: 'female' }
    ];
    res.json({ voices });
});
exports.default = router;
