import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { verifyHmacSignature } from './lib/auth';
import ingestRouter from './routes/ingest';
import chatRouter from './routes/chat';
import secRouter from './routes/sec';
import sttRouter from './routes/stt';
import ttsRouter from './routes/tts';
import exportRouter from './routes/export';
import usageRouter from './routes/usage';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(express.json({ limit: '10mb' }));

// Allow CORS from Netlify domain
const allowedOrigins = [
  process.env.NEXT_PUBLIC_APP_URL || 'https://ask-dahlia.netlify.app',
  'http://localhost:3000' // For local development
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// Authentication middleware
app.use((req, res, next) => {
  // Skip auth for OPTIONS requests (preflight)
  if (req.method === 'OPTIONS') {
    return next();
  }

  const hmacSignature = req.headers['x-hmac-signature'] as string;

  if (!hmacSignature) {
    return res.status(401).json({ error: 'Missing HMAC signature' });
  }

  try {
    // Verify HMAC signature
    const isValid = verifyHmacSignature(
      JSON.stringify(req.body),
      hmacSignature,
      process.env.WORKER_API_SECRET || ''
    );

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid HMAC signature' });
    }

    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Authentication error' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// API routes
app.use('/ingest', ingestRouter);
app.use('/chat', chatRouter);
app.use('/sec', secRouter);
app.use('/stt', sttRouter);
app.use('/tts', ttsRouter);
app.use('/export', exportRouter);
app.use('/usage', usageRouter);

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Worker API running on port ${PORT}`);
});

export default app;
