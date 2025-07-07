# Social Media Publishing Service

A comprehensive social media publishing platform that allows users to authenticate with multiple platforms and publish content seamlessly.

## Features

- **Multi-Platform Authentication**: OAuth integration with TikTok, YouTube, Instagram, and X (Twitter)
- **Media Upload**: Drag-and-drop interface for uploading videos and images
- **Content Publishing**: Publish to multiple platforms simultaneously
- **Real-time Status**: Live publishing status updates
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Containerized**: Docker support for easy deployment
- **API Service**: RESTful backend service for integration with other tools

## Architecture

```
├── Frontend (React + TypeScript + Vite)
│   ├── Authentication UI
│   ├── Media Upload Interface
│   ├── Publishing Dashboard
│   └── Status Monitoring
│
├── Backend Service (Node.js + Express)
│   ├── File Upload Handling
│   ├── Platform API Integration
│   ├── Status Tracking
│   └── Health Monitoring
│
└── Docker Configuration
    ├── Frontend Container
    ├── Backend Container
    └── Docker Compose
```

## Quick Start

### Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the backend service**:
   ```bash
   cd services/publish-service
   npm install
   npm start
   ```

3. **Start the frontend**:
   ```bash
   npm run dev
   ```

### Production (Docker)

1. **Build and run with Docker Compose**:
   ```bash
   docker-compose up --build
   ```

2. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5005
   - Health Check: http://localhost:5005/health

## API Endpoints

### Publish Content
```http
POST /publish
Content-Type: multipart/form-data

{
  "video": <file>,
  "caption": "Your caption here",
  "platforms": ["tiktok", "youtube", "instagram", "x"]
}
```

### Check Status
```http
GET /status/:videoId
```

### Health Check
```http
GET /health
```

## Integration with External Services

### n8n Integration
The service can be integrated with n8n workflows using HTTP Request nodes:

1. **Upload Node**: POST to `/publish` with form data
2. **Status Node**: GET from `/status/:videoId` to check progress
3. **Webhook Node**: Receive completion notifications

### Custom Applications
Use the REST API to integrate with your own applications:

```javascript
// Example integration
const formData = new FormData();
formData.append('video', file);
formData.append('caption', 'My content');
formData.append('platforms', JSON.stringify(['tiktok', 'youtube']));

const response = await fetch('http://localhost:5005/publish', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log('Video ID:', result.videoId);
```

## Platform Configuration

### TikTok
- Requires TikTok Business API access
- OAuth 2.0 authentication
- Video upload specifications: MP4, max 100MB

### YouTube
- Google Cloud Console project setup
- YouTube Data API v3 enabled
- OAuth 2.0 with appropriate scopes

### Instagram
- Facebook Developer Account
- Instagram Graph API access
- Business account required

### X (Twitter)
- Twitter Developer Account
- API v2 access
- OAuth 2.0 authentication

## Environment Variables

```env
# Backend Service
PORT=5005
NODE_ENV=production

# Frontend
VITE_API_URL=http://localhost:5005
```

## File Structure

```
├── src/
│   ├── components/
│   │   ├── AuthModal.tsx
│   │   ├── Dashboard.tsx
│   │   ├── MediaUpload.tsx
│   │   └── PublishModal.tsx
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   └── main.tsx
├── services/
│   └── publish-service/
│       ├── index.js
│       ├── package.json
│       └── Dockerfile
├── docker-compose.yml
└── README.md
```

## Development Notes

- The current implementation includes OAuth simulation for demonstration
- Platform API integration requires actual API credentials
- File uploads are stored in `/tmp/uploads` by default
- Health checks are implemented for monitoring
- CORS is configured for cross-origin requests

## Security Considerations

- OAuth tokens should be encrypted in production
- File uploads should be scanned for malware
- Rate limiting should be implemented
- HTTPS should be used in production
- Input validation and sanitization is implemented

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.