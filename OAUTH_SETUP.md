# OAuth Setup Guide

This guide will walk you through setting up OAuth applications for each social media platform.

## Prerequisites

1. Copy the environment file:
   ```bash
   cp services/publish-service/.env.example services/publish-service/.env
   ```

2. Fill in your OAuth credentials in the `.env` file as you obtain them from each platform.

## Platform Setup

### 1. YouTube (Google OAuth)

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the YouTube Data API v3:
   - Go to "APIs & Services" > "Library"
   - Search for "YouTube Data API v3"
   - Click "Enable"
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:5005/auth/google/callback` (development)
     - `https://yourdomain.com/auth/google/callback` (production)
5. Copy the Client ID and Client Secret to your `.env` file

### 2. X (Twitter)

1. Go to the [Twitter Developer Portal](https://developer.twitter.com/)
2. Create a new app or use an existing one
3. In your app settings:
   - Go to "Keys and tokens"
   - Generate API Key and API Secret Key
   - Set up OAuth 1.0a settings
   - Add callback URL: `http://localhost:5005/auth/twitter/callback`
4. Copy the API Key and API Secret to your `.env` file as `TWITTER_CLIENT_ID` and `TWITTER_CLIENT_SECRET`

### 3. TikTok

1. Go to [TikTok for Developers](https://developers.tiktok.com/)
2. Create a new app
3. Request access to the Content Posting API
4. In your app settings:
   - Add redirect URI: `http://localhost:5005/auth/tiktok/callback`
   - Request the following scopes: `user.info.basic`, `video.upload`
5. Copy the Client Key and Client Secret to your `.env` file

### 4. Instagram (Facebook)

1. Go to [Facebook for Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Instagram Graph API to your app
4. In your app settings:
   - Go to "Instagram Graph API" > "Quickstart"
   - Add redirect URI: `http://localhost:5005/auth/instagram/callback`
   - Request the following permissions: `user_profile`, `user_media`
5. Copy the App ID and App Secret to your `.env` file

## Testing OAuth Flow

1. Start the services:
   ```bash
   docker-compose up --build
   ```

2. Open the frontend at `http://localhost:3000`

3. Click "Connect Platforms" and test each OAuth flow

4. Check the browser network tab and backend logs for any errors

## Production Considerations

### Security
- Use HTTPS in production
- Set secure session cookies
- Implement CSRF protection
- Store tokens encrypted in a database
- Use environment-specific redirect URIs

### Token Management
- Implement token refresh logic
- Handle token expiration gracefully
- Store tokens securely (encrypted database)
- Implement token revocation

### Rate Limiting
- Implement rate limiting for API calls
- Handle platform-specific rate limits
- Queue uploads for high-volume scenarios

### Error Handling
- Implement retry logic for failed uploads
- Handle platform-specific errors
- Provide meaningful error messages to users

## Troubleshooting

### Common Issues

1. **"Redirect URI mismatch"**
   - Ensure the redirect URI in your platform app settings exactly matches the one in your code
   - Check for trailing slashes and protocol (http vs https)

2. **"Invalid client credentials"**
   - Verify your Client ID and Client Secret are correct
   - Check that you're using the right environment variables

3. **"Scope not authorized"**
   - Ensure you've requested the necessary permissions in your platform app
   - Some platforms require manual approval for certain scopes

4. **CORS errors**
   - Ensure your frontend URL is properly configured in the backend CORS settings
   - Check that cookies are being sent with credentials: 'include'

### Debug Mode

Enable debug logging by setting `NODE_ENV=development` in your `.env` file. This will provide more detailed error messages and request/response logging.

## Support

For platform-specific issues, refer to the official documentation:
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Twitter API](https://developer.twitter.com/en/docs/authentication/oauth-1-0a)
- [TikTok for Developers](https://developers.tiktok.com/doc/)
- [Instagram Graph API](https://developers.facebook.com/docs/instagram-api/)