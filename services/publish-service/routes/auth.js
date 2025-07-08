const express = require('express');
const passport = require('passport');
const router = express.Router();

// Store user tokens in session (in production, use a database)
const userTokens = new Map();

// Google OAuth (YouTube)
router.get('/google', passport.authenticate('google', {
  scope: [
    'https://www.googleapis.com/auth/youtube.upload',
    'https://www.googleapis.com/auth/youtube.readonly'
  ]
}));

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}?error=auth_failed` }),
  (req, res) => {
    // Store tokens
    userTokens.set(`${req.sessionID}_youtube`, {
      accessToken: req.user.accessToken,
      refreshToken: req.user.refreshToken,
      platform: 'youtube',
      user: req.user
    });
    
    res.redirect(`${process.env.FRONTEND_URL}?auth=success&platform=youtube`);
  }
);

// Twitter OAuth
router.get('/twitter', passport.authenticate('twitter'));

router.get('/twitter/callback',
  passport.authenticate('twitter', { failureRedirect: `${process.env.FRONTEND_URL}?error=auth_failed` }),
  (req, res) => {
    userTokens.set(`${req.sessionID}_x`, {
      accessToken: req.user.accessToken,
      tokenSecret: req.user.tokenSecret,
      platform: 'x',
      user: req.user
    });
    
    res.redirect(`${process.env.FRONTEND_URL}?auth=success&platform=x`);
  }
);

// TikTok OAuth
router.get('/tiktok', passport.authenticate('tiktok'));

router.get('/tiktok/callback',
  passport.authenticate('tiktok', { failureRedirect: `${process.env.FRONTEND_URL}?error=auth_failed` }),
  (req, res) => {
    userTokens.set(`${req.sessionID}_tiktok`, {
      accessToken: req.user.accessToken,
      refreshToken: req.user.refreshToken,
      expiresIn: req.user.expiresIn,
      tokenIssuedAt: req.user.tokenIssuedAt,
      platform: 'tiktok',
      user: req.user
    });
    
    res.redirect(`${process.env.FRONTEND_URL}?auth=success&platform=tiktok`);
  }
);

// Instagram OAuth
router.get('/instagram', passport.authenticate('instagram'));

router.get('/instagram/callback',
  passport.authenticate('instagram', { failureRedirect: `${process.env.FRONTEND_URL}?error=auth_failed` }),
  (req, res) => {
    userTokens.set(`${req.sessionID}_instagram`, {
      accessToken: req.user.accessToken,
      refreshToken: req.user.refreshToken,
      platform: 'instagram',
      user: req.user
    });
    
    res.redirect(`${process.env.FRONTEND_URL}?auth=success&platform=instagram`);
  }
);

// Get user's connected platforms
router.get('/status', (req, res) => {
  const platforms = ['youtube', 'x', 'tiktok', 'instagram'];
  const connectedPlatforms = platforms.filter(platform => 
    userTokens.has(`${req.sessionID}_${platform}`)
  );
  
  res.json({
    connected: connectedPlatforms,
    sessionId: req.sessionID
  });
});

// Logout from specific platform
router.post('/logout/:platform', (req, res) => {
  const { platform } = req.params;
  const key = `${req.sessionID}_${platform}`;
  
  if (userTokens.has(key)) {
    userTokens.delete(key);
    res.json({ success: true, message: `Logged out from ${platform}` });
  } else {
    res.status(404).json({ success: false, message: `Not connected to ${platform}` });
  }
});

// Export userTokens for use in other modules
router.userTokens = userTokens;

module.exports = router;