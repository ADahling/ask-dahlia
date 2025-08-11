"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const router = express_1.default.Router();
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 25 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'audio/mpeg',
            'audio/mp4',
            'audio/wav',
            'audio/webm',
            'audio/ogg'
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Unsupported audio type'));
        }
    }
});
router.post('/transcribe', upload.single('audio'), async (req, res) => {
    try {
        const { userId, language = 'en' } = req.body;
        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: 'No audio file provided' });
        }
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }
        res.status(501).json({
            error: 'Speech-to-text not yet implemented',
            message: 'STT functionality will be available in a future update'
        });
    }
    catch (error) {
        console.error('STT error:', error);
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
