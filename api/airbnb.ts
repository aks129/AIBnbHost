import express from 'express';
import { z } from 'zod';
import { storage } from '../server/storage';

const router = express.Router();

// OAuth configuration
const AIRBNB_CLIENT_ID = process.env.AIRBNB_CLIENT_ID || '';
const AIRBNB_CLIENT_SECRET = process.env.AIRBNB_CLIENT_SECRET || '';
const AIRBNB_REDIRECT_URI = process.env.AIRBNB_REDIRECT_URI || 'https://aibnbhost.vercel.app/api/airbnb/callback';

// Get authorization URL
router.get('/auth/url', async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Generate state token for CSRF protection
    const state = Buffer.from(JSON.stringify({
      userId: req.user.id,
      timestamp: Date.now(),
    })).toString('base64');

    // Construct Airbnb OAuth URL
    // Note: This is a placeholder - Airbnb's actual OAuth implementation may differ
    const authUrl = new URL('https://www.airbnb.com/oauth2/auth');
    authUrl.searchParams.set('client_id', AIRBNB_CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', AIRBNB_REDIRECT_URI);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('scope', 'listings:read reservations:read messages:read messages:write');

    res.json({ authUrl: authUrl.toString() });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    res.status(500).json({ error: 'Failed to generate authorization URL' });
  }
});

// OAuth callback handler
router.get('/callback', async (req, res) => {
  try {
    const { code, state, error } = req.query;

    if (error) {
      return res.send(`
        <html>
          <body>
            <script>
              window.opener.postMessage({ type: 'airbnb-oauth-error', error: '${error}' }, '*');
              window.close();
            </script>
          </body>
        </html>
      `);
    }

    if (!code || !state) {
      return res.status(400).json({ error: 'Missing code or state' });
    }

    // Verify state
    const stateData = JSON.parse(Buffer.from(state as string, 'base64').toString());
    const userId = stateData.userId;

    // Exchange code for access token
    const tokenResponse = await fetch('https://www.airbnb.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: AIRBNB_CLIENT_ID,
        client_secret: AIRBNB_CLIENT_SECRET,
        code: code as string,
        redirect_uri: AIRBNB_REDIRECT_URI,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const tokenData = await tokenResponse.json();

    // Store tokens in database
    await storage.updateUser(userId, {
      airbnbAccessToken: tokenData.access_token,
      airbnbRefreshToken: tokenData.refresh_token,
      airbnbUserId: tokenData.user_id,
      airbnbConnectedAt: new Date(),
    });

    // Send success message to parent window
    res.send(`
      <html>
        <body>
          <script>
            window.opener.postMessage({ type: 'airbnb-oauth-success' }, '*');
            window.close();
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.send(`
      <html>
        <body>
          <script>
            window.opener.postMessage({
              type: 'airbnb-oauth-error',
              error: '${error instanceof Error ? error.message : 'Authentication failed'}'
            }, '*');
            window.close();
          </script>
        </body>
      </html>
    `);
  }
});

// Disconnect Airbnb account
router.post('/disconnect', async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await storage.updateUser(req.user.id, {
      airbnbAccessToken: null,
      airbnbRefreshToken: null,
      airbnbUserId: null,
      airbnbConnectedAt: null,
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error disconnecting Airbnb:', error);
    res.status(500).json({ error: 'Failed to disconnect' });
  }
});

// Get connection status
router.get('/status', async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await storage.getUserById(req.user.id);
    const isConnected = !!user?.airbnbAccessToken;

    res.json({
      connected: isConnected,
      connectedAt: user?.airbnbConnectedAt || null,
    });
  } catch (error) {
    console.error('Error checking status:', error);
    res.status(500).json({ error: 'Failed to check status' });
  }
});

export default router;
