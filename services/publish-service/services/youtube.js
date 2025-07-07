const { google } = require('googleapis');
const fs = require('fs');

class YouTubeService {
  constructor(accessToken, refreshToken) {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      '/auth/google/callback'
    );
    
    this.oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken
    });
    
    this.youtube = google.youtube({
      version: 'v3',
      auth: this.oauth2Client
    });
  }

  async uploadVideo(filePath, title, description, tags = []) {
    try {
      const response = await this.youtube.videos.insert({
        part: 'snippet,status',
        requestBody: {
          snippet: {
            title,
            description,
            tags,
            categoryId: '22' // People & Blogs
          },
          status: {
            privacyStatus: 'public'
          }
        },
        media: {
          body: fs.createReadStream(filePath)
        }
      });

      return {
        success: true,
        videoId: response.data.id,
        url: `https://www.youtube.com/watch?v=${response.data.id}`,
        platform: 'youtube'
      };
    } catch (error) {
      console.error('YouTube upload error:', error);
      return {
        success: false,
        error: error.message,
        platform: 'youtube'
      };
    }
  }

  async refreshAccessToken() {
    try {
      const { credentials } = await this.oauth2Client.refreshAccessToken();
      this.oauth2Client.setCredentials(credentials);
      return credentials.access_token;
    } catch (error) {
      console.error('YouTube token refresh error:', error);
      throw error;
    }
  }
}

module.exports = YouTubeService;