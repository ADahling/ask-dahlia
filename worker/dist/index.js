"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = require("http");
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = require("./lib/auth");
const ingest_1 = __importDefault(require("./routes/ingest"));
const chat_1 = __importDefault(require("./routes/chat"));
const sec_1 = __importDefault(require("./routes/sec"));
const stt_1 = __importDefault(require("./routes/stt"));
const tts_1 = __importDefault(require("./routes/tts"));
const export_1 = __importDefault(require("./routes/export"));
const usage_1 = __importDefault(require("./routes/usage"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const PORT = process.env.PORT || 3001;
app.use((0, helmet_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL || 'https://ask-dahlia.netlify.app',
    'http://localhost:3000'
];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));
app.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
        return next();
    }
    const hmacSignature = req.headers['x-hmac-signature'];
    if (!hmacSignature) {
        return res.status(401).json({ error: 'Missing HMAC signature' });
    }
    try {
        const isValid = (0, auth_1.verifyHmacSignature)(JSON.stringify(req.body), hmacSignature, process.env.WORKER_API_SECRET || '');
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid HMAC signature' });
        }
        next();
    }
    catch (error) {
        console.error('Auth error:', error);
        res.status(500).json({ error: 'Authentication error' });
    }
});
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});
app.use('/ingest', ingest_1.default);
app.use('/chat', chat_1.default);
app.use('/sec', sec_1.default);
app.use('/stt', stt_1.default);
app.use('/tts', tts_1.default);
app.use('/export', export_1.default);
app.use('/usage', usage_1.default);
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error'
    });
});
server.listen(PORT, () => {
    console.log(`Worker API running on port ${PORT}`);
});
exports.default = app;
