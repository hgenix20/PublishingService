const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const OAuth2Strategy = require('passport-oauth2');

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Google OAuth Strategy (for YouTube)
passport.use('google', new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback',
  scope: [
    'https://www.googleapis.com/auth/youtube.upload',
    'https://www.googleapis.com/auth/youtube.readonly'
  ]
}, async (accessToken, refreshToken, profile, done) => {
  const user = {
    platform: 'youtube',
    id: profile.id,
    name: profile.displayName,
    email: profile.emails?.[0]?.value,
    accessToken,
    refreshToken,
    profile
  };
  return done(null, user);
}));

// Twitter OAuth Strategy
passport.use('twitter', new TwitterStrategy({
  consumerKey: process.env.TWITTER_CLIENT_ID,
  consumerSecret: process.env.TWITTER_CLIENT_SECRET,
  callbackURL: '/auth/twitter/callback'
}, async (token, tokenSecret, profile, done) => {
  const user = {
    platform: 'x',
    id: profile.id,
    username: profile.username,
    name: profile.displayName,
    accessToken: token,
    tokenSecret,
    profile
  };
  return done(null, user);
}));

// TikTok OAuth Strategy (Custom OAuth2)
passport.use('tiktok', new OAuth2Strategy({
  authorizationURL: 'https://www.tiktok.com/v2/auth/authorize/',
  tokenURL: 'https://open.tiktokapis.com/v2/oauth/token/',
  clientID: process.env.TIKTOK_CLIENT_ID,
  clientSecret: process.env.TIKTOK_CLIENT_SECRET,
  callbackURL: '/auth/tiktok/callback',
  scope: 'user.info.basic,video.upload',
  customHeaders: {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
}, async (accessToken, refreshToken, profile, done) => {
  const user = {
    platform: 'tiktok',
    id: profile.open_id || profile.id,
    accessToken,
    refreshToken,
    expiresIn: profile.expires_in || 86400, // 24 hours default
    tokenIssuedAt: Date.now(),
    profile
  };
  return done(null, user);
}));

// Instagram OAuth Strategy (Facebook)
passport.use('instagram', new OAuth2Strategy({
  authorizationURL: 'https://api.instagram.com/oauth/authorize',
  tokenURL: 'https://api.instagram.com/oauth/access_token',
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: '/auth/instagram/callback',
  scope: 'user_profile,user_media'
}, async (accessToken, refreshToken, profile, done) => {
  const user = {
    platform: 'instagram',
    id: profile.id,
    accessToken,
    refreshToken,
    profile
  };
  return done(null, user);
}));

module.exports = passport;