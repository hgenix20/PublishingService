const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

class TikTokService {
  constructor(accessToken) {
    this.accessToken = accessToken;
    this.baseURL = 'https://open-api.tiktok.com';
  }

  async uploadVideo(filePath, caption, privacy = 'PUBLIC_TO_EVERYONE') {
    try {
      // Step 1: Initialize upload
      const initResponse = await axios.post(
        `${this.baseURL}/share/video/upload/`,
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

      const { upload_url, upload_id } = initResponse.data.data;

      // Step 2: Upload video file
      const formData = new FormData();
      formData.append('video', fs.createReadStream(filePath));

      const uploadResponse = await axios.post(upload_url, formData, {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${this.accessToken}`
        }
      });

      // Step 3: Publish video
      const publishResponse = await axios.post(
        `${this.baseURL}/share/video/publish/`,
        {
          post_info: {
            title: caption,
            privacy_level: privacy,
            disable_duet: false,
            disable_comment: false,
            disable_stitch: false,
            video_cover_timestamp_ms: 1000
          },
          source_info: {
            source: 'FILE_UPLOAD',
            video_id: upload_id
          }
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
        videoId: publishResponse.data.data.share_id,
        url: `https://www.tiktok.com/@user/video/${publishResponse.data.data.share_id}`,
        platform: 'tiktok'
      };
    } catch (error) {
      console.error('TikTok upload error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        platform: 'tiktok'
      };
    }
  }
}

module.exports = TikTokService;