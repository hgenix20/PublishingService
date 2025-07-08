const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

class TikTokService {
  constructor(accessToken, refreshToken, expiresIn, tokenIssuedAt) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.expiresIn = expiresIn || 86400; // 24 hours default
    this.tokenIssuedAt = tokenIssuedAt || Date.now();
    this.baseURL = 'https://open.tiktokapis.com';
    this.clientKey = process.env.TIKTOK_CLIENT_ID;
    this.clientSecret = process.env.TIKTOK_CLIENT_SECRET;
  }

  async refreshAccessToken() {
    try {
      const response = await axios.post(
        'https://open.tiktokapis.com/v2/oauth/token/',
        new URLSearchParams({
          client_key: this.clientKey,
          client_secret: this.clientSecret,
          grant_type: 'refresh_token',
          refresh_token: this.refreshToken
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cache-Control': 'no-cache'
          }
        }
      );

      if (response.data.access_token) {
        this.accessToken = response.data.access_token;
        this.refreshToken = response.data.refresh_token || this.refreshToken;
        this.expiresIn = response.data.expires_in || 86400;
        this.tokenIssuedAt = Date.now();
        
        return {
          accessToken: this.accessToken,
          refreshToken: this.refreshToken,
          expiresIn: this.expiresIn,
          tokenIssuedAt: this.tokenIssuedAt
        };
      } else {
        throw new Error('Failed to refresh access token');
      }
    } catch (error) {
      console.error('TikTok token refresh error:', error.response?.data || error.message);
      throw error;
    }
  }

  isTokenExpired() {
    const now = Date.now();
    const tokenAge = (now - this.tokenIssuedAt) / 1000; // Convert to seconds
    return tokenAge >= (this.expiresIn - 300); // Refresh 5 minutes before expiry
  }

  async ensureValidToken() {
    if (this.isTokenExpired()) {
      await this.refreshAccessToken();
    }
  }

  async uploadVideo(filePath, caption, privacy = 'PUBLIC_TO_EVERYONE') {
    try {
      // Ensure we have a valid token before making API calls
      await this.ensureValidToken();

      // Step 1: Initialize upload
      const initResponse = await axios.post(
        `${this.baseURL}/v2/post/publish/video/init/`,
        {
          source_info: {
            source: 'FILE_UPLOAD',
            video_size: fs.statSync(filePath).size,
            chunk_size: 10000000, // 10MB chunks
            total_chunk_count: 1
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const publishId = initResponse.data.data.publish_id;
      const uploadUrl = initResponse.data.data.upload_url;

      // Step 2: Upload video file
      const formData = new FormData();
      formData.append('video', fs.createReadStream(filePath));

      await axios.put(uploadUrl, fs.createReadStream(filePath), {
        headers: {
          'Content-Type': 'video/mp4',
          'Authorization': `Bearer ${this.accessToken}`
        }
      });

      // Step 3: Publish video
      const publishResponse = await axios.post(
        `${this.baseURL}/v2/post/publish/`,
        {
          post_info: {
            title: caption,
            privacy_level: privacy,
            disable_duet: false,
            disable_comment: false,
            disable_stitch: false
          },
          publish_id: publishId
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        videoId: publishResponse.data.data.publish_id,
        url: publishResponse.data.data.share_url || `https://www.tiktok.com/@user/video/${publishResponse.data.data.publish_id}`,
        platform: 'tiktok'
      };
    } catch (error) {
      console.error('TikTok upload error:', error.response?.data || error.message);
      
      // If token is invalid, try refreshing once
      if (error.response?.status === 401 && !this.isTokenExpired()) {
        try {
          await this.refreshAccessToken();
          // Retry the upload with new token
          return await this.uploadVideo(filePath, caption, privacy);
        } catch (refreshError) {
          console.error('Failed to refresh token and retry:', refreshError);
        }
      }
      
      return {
        success: false,
        error: error.response?.data?.error?.message || error.response?.data?.message || error.message,
        platform: 'tiktok'
      };
    }
  }
}

module.exports = TikTokService;