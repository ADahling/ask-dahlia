import express from 'express';
import multer from 'multer';

const router = express.Router();

// Configure multer for audio uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit for audio
  },
  fileFilter: (req, file, cb) => {
    // Allow common audio types
    const allowedTypes = [
      'audio/mpeg',
      'audio/mp4',
      'audio/wav',
      'audio/webm',
      'audio/ogg'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported audio type'));
    }
  }
});

/**
 * Convert speech to text
 */
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

    // TODO: Implement OpenAI Whisper integration
    res.status(501).json({
      error: 'Speech-to-text not yet implemented',
      message: 'STT functionality will be available in a future update'
    });

  } catch (error: any) {
    console.error('STT error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
