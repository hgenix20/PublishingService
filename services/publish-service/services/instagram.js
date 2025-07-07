const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

class InstagramService {
  constructor(accessToken) {
    this.accessToken = accessToken;
    this.baseURL = 'https://graph.instagram.com';
  }

  async uploadVideo(filePath, caption) {
    try {
      // Step 1: Create media container
      const containerResponse = await axios.post(
        `${this.baseURL}/me/media`,
        {
          media_type: 'VIDEO',
          video_url: filePath, // This would need to be a public URL
          caption: caption
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );

      const containerId = containerResponse.data.id;

      // Step 2: Publish the media
      const publishResponse = await axios.post(
        `${this.baseURL}/me/media_publish`,
        {
          creation_id: containerId
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );

      return {
        success: true,
        videoId: publishResponse.data.id,
        url: `https://www.instagram.com/p/${publishResponse.data.id}/`,
        platform: 'instagram'
      };
    } catch (error) {
      console.error('Instagram upload error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message,
        platform: 'instagram'
      };
    }
  }

  async uploadImage(filePath, caption) {
    try {
      // For images, we can upload directly
      const response = await axios.post(
        `${this.baseURL}/me/media`,
        {
          image_url: filePath, // This would need to be a public URL
          caption: caption
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );

      const containerId = response.data.id;

      // Publish the media
      const publishResponse = await axios.post(
        `${this.baseURL}/me/media_publish`,
        {
          creation_id: containerId
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );

      return {
        success: true,
        videoId: publishResponse.data.id,
        url: `https://www.instagram.com/p/${publishResponse.data.id}/`,
        platform: 'instagram'
      };
    } catch (error) {
      console.error('Instagram image upload error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message,
        platform: 'instagram'
      };
    }
  }
}

module.exports = InstagramService;