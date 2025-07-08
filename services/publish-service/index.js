require('dotenv').config();
const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const passport = require('./config/passport');

// Import services
const YouTubeService = require('./services/youtube');
const TikTokService = require('./services/tiktok');
const InstagramService = require('./services/instagram');
const TwitterService = require('./services/twitter');

// Import routes
const authRoutes = require('./routes/auth');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/auth', authRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.send('📦 Publish-Service is alive!');
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: 'publish-service'
  });
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = '/tmp/uploads';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi|wmv|flv|webm/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed'));
    }
  }
});

// Publish endpoint
app.post('/publish', upload.single('video'), async (req, res) => {
  try {
    const { caption, platforms } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No media file uploaded' });
    }

    // Parse platforms if it's a string
    let selectedPlatforms = [];
    if (typeof platforms === 'string') {
      try {
        selectedPlatforms = JSON.parse(platforms);
      } catch (e) {
        selectedPlatforms = [platforms];
      }
    } else if (Array.isArray(platforms)) {
      selectedPlatforms = platforms;
    }

    // Generate unique video ID
    const videoId = uuidv4();
    
    console.log('📤 Publish Request:', {
      videoId,
      filename: file.originalname,
      size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
      caption: caption || 'No caption',
      platforms: selectedPlatforms,
      timestamp: new Date().toISOString()
    });

    // Get user tokens from session
    const userTokens = authRoutes.userTokens;
    const results = {};

    // Process each platform
    for (const platform of selectedPlatforms) {
      const tokenKey = `${req.sessionID}_${platform}`;
      const tokenData = userTokens.get(tokenKey);

      if (!tokenData) {
        results[platform] = {
          success: false,
          error: `Not authenticated with ${platform}`,
          platform
        };
        continue;
      }

      try {
        let result;
        
        switch (platform) {
          case 'youtube':
            const youtubeService = new YouTubeService(
              tokenData.accessToken,
              tokenData.refreshToken
            );
            result = await youtubeService.uploadVideo(
              file.path,
              caption || 'Uploaded via Social Publisher',
              caption || 'Uploaded via Social Publisher'
            );
            break;

          case 'tiktok':
            const tiktokService = new TikTokService(
              tokenData.accessToken,
              tokenData.refreshToken,
              tokenData.expiresIn,
              tokenData.tokenIssuedAt
            );
            result = await tiktokService.uploadVideo(file.path, caption || '');
            
            // Update tokens if they were refreshed
            if (tiktokService.accessToken !== tokenData.accessToken) {
              userTokens.set(tokenKey, {
                ...tokenData,
                accessToken: tiktokService.accessToken,
                refreshToken: tiktokService.refreshToken,
                expiresIn: tiktokService.expiresIn,
                tokenIssuedAt: tiktokService.tokenIssuedAt
              });
            }
            break;

          case 'instagram':
            const instagramService = new InstagramService(tokenData.accessToken);
            if (file.mimetype.startsWith('video/')) {
              result = await instagramService.uploadVideo(file.path, caption || '');
            } else {
              result = await instagramService.uploadImage(file.path, caption || '');
            }
            break;

          case 'x':
            const twitterService = new TwitterService(
              tokenData.accessToken,
              tokenData.tokenSecret
            );
            result = await twitterService.uploadVideo(file.path, caption || '');
            break;

          default:
            result = {
              success: false,
              error: `Unsupported platform: ${platform}`,
              platform
            };
        }

        results[platform] = result;
      } catch (error) {
        console.error(`Error publishing to ${platform}:`, error);
        results[platform] = {
          success: false,
          error: error.message,
          platform
        };
      }
    }

    // Clean up uploaded file after processing
    setTimeout(() => {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    }, 5000);

    // Return results
    res.json({ 
      videoId,
      status: 'completed',
      message: 'Publishing completed',
      platforms: results,
      uploadedFile: {
        originalName: file.originalname,
        size: file.size,
        type: file.mimetype
      }
    });

  } catch (error) {
    console.error('❌ Publish Error:', error);
    res.status(500).json({ 
      error: 'Failed to publish content',
      details: error.message 
    });
  }
});

// Get upload status endpoint
app.get('/status/:videoId', (req, res) => {
  const { videoId } = req.params;
  
  // In a real implementation, you'd check the actual status from a database
  res.json({
    videoId,
    status: 'completed',
    platforms: {
      tiktok: 'success',
      youtube: 'success', 
      instagram: 'success',
      x: 'success'
    },
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    details: error.message 
  });
});

const PORT = process.env.PORT || 5005;
app.listen(PORT, () => {
  console.log(`🚀 Publish service running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 OAuth endpoints: http://localhost:${PORT}/auth/{platform}`);
});