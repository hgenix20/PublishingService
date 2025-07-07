const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

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
app.post('/publish', upload.single('video'), (req, res) => {
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
    
    // Log the publish request
    console.log('📤 Publish Request:', {
      videoId,
      filename: file.originalname,
      size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
      caption: caption || 'No caption',
      platforms: selectedPlatforms,
      timestamp: new Date().toISOString()
    });

    // TODO: Implement actual platform publishing logic here
    // For each platform in selectedPlatforms, make API calls to:
    // - TikTok Business API
    // - YouTube Data API
    // - Instagram Graph API  
    // - X (Twitter) API v2

    // Simulate processing time
    setTimeout(() => {
      console.log(`✅ Successfully processed upload ${videoId}`);
      
      // Clean up uploaded file after processing (optional)
      // fs.unlinkSync(file.path);
      
    }, 1000);

    // Return success response
    res.json({ 
      videoId,
      status: 'success',
      message: 'Content published successfully',
      platforms: selectedPlatforms,
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
  
  // TODO: Implement actual status checking logic
  // This would check the status of uploads to each platform
  
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
});