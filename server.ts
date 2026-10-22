import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '2mb' }));

  // In-memory store for OAuth tokens in preview session
  let githubAccessToken: string | null = process.env.GITHUB_PERSONAL_ACCESS_TOKEN || null;
  let githubUser: { login: string; avatar_url?: string; html_url?: string } | null = null;

  const getRedirectUri = (req: express.Request) => {
    const appUrl = process.env.APP_URL;
    if (appUrl && appUrl !== 'MY_APP_URL') {
      return `${appUrl.replace(/\/$/, '')}/auth/callback`;
    }
    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const host = req.headers['x-forwarded-host'] || req.headers.host || `localhost:${PORT}`;
    return `${protocol}://${host}/auth/callback`;
  };

  // 1. OAuth URL endpoint (Client opens GitHub provider URL directly in popup)
  app.get('/api/auth/github/url', (req, res) => {
    const clientId = process.env.GITHUB_CLIENT_ID || process.env.CLIENT_ID || '';
    const redirectUri = (req.query.redirect_uri as string) || getRedirectUri(req);

    if (!clientId) {
      return res.json({
        configured: false,
        redirectUri,
        message: 'GITHUB_CLIENT_ID is not set in environment variables. You can connect via a GitHub Personal Access Token or configure OAuth credentials.',
      });
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: 'gist repo read:user',
    });

    const authUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;
    res.json({ configured: true, url: authUrl, redirectUri });
  });

  // 2. OAuth Callback Handler (Sends postMessage to opener and closes popup)
  const callbackHandler = async (req: express.Request, res: express.Response) => {
    const { code } = req.query;
    const clientId = process.env.GITHUB_CLIENT_ID || process.env.CLIENT_ID || '';
    const clientSecret = process.env.GITHUB_CLIENT_SECRET || process.env.CLIENT_SECRET || '';

    if (code && clientId && clientSecret) {
      try {
        const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            client_id: clientId,
            client_secret: clientSecret,
            code,
          }),
        });
        const tokenData = (await tokenRes.json()) as { access_token?: string };
        if (tokenData.access_token) {
          githubAccessToken = tokenData.access_token;
          const userRes = await fetch('https://api.github.com/user', {
            headers: {
              Authorization: `Bearer ${githubAccessToken}`,
              'User-Agent': 'RecompOS-GitHub-Tracker',
            },
          });
          if (userRes.ok) {
            githubUser = (await userRes.json()) as { login: string; avatar_url?: string; html_url?: string };
          }
        }
      } catch (err) {
        console.error('GitHub OAuth token exchange error:', err);
      }
    }

    res.send(`<!DOCTYPE html>
      <html>
        <head><title>GitHub Connected</title></head>
        <body style="font-family: system-ui, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', provider: 'github' }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <p>GitHub authentication complete. This window will close automatically.</p>
        </body>
      </html>`);
  };

  app.get(['/auth/callback', '/auth/callback/'], callbackHandler);

  // 3. GitHub Status & Token Management
  app.get('/api/github/status', async (_req, res) => {
    if (githubAccessToken && !githubUser) {
      try {
        const userRes = await fetch('https://api.github.com/user', {
          headers: {
            Authorization: `Bearer ${githubAccessToken}`,
            'User-Agent': 'RecompOS-GitHub-Tracker',
          },
        });
        if (userRes.ok) {
          githubUser = (await userRes.json()) as { login: string; avatar_url?: string; html_url?: string };
        }
      } catch {
        // Ignore transient network errors
      }
    }
    res.json({
      connected: Boolean(githubAccessToken),
      user: githubUser,
      oauthConfigured: Boolean(process.env.GITHUB_CLIENT_ID || process.env.CLIENT_ID),
      appUrl: process.env.APP_URL || '',
    });
  });

  // 4. Sync State to GitHub Gist (works with either OAuth session or provided Personal Access Token)
  app.post('/api/github/sync-gist', async (req, res) => {
    const { token, gistId, statePayload, description } = req.body as {
      token?: string;
      gistId?: string;
      statePayload: unknown;
      description?: string;
    };

    const activeToken = token || githubAccessToken;
    if (!activeToken) {
      return res.status(400).json({
        error: 'Connect GitHub via OAuth or provide a Personal Access Token (with gist scope) to sync to GitHub.',
      });
    }

    try {
      const endpoint = gistId
        ? `https://api.github.com/gists/${encodeURIComponent(gistId)}`
        : 'https://api.github.com/gists';
      const method = gistId ? 'PATCH' : 'POST';

      const ghRes = await fetch(endpoint, {
        method,
        headers: {
          Authorization: `Bearer ${activeToken}`,
          Accept: 'application/vnd.github+json',
          'Content-Type': 'application/json',
          'User-Agent': 'RecompOS-GitHub-Tracker',
        },
        body: JSON.stringify({
          description: description || 'RecompOS Body Transformation & Workout Log State',
          public: false,
          files: {
            'recomp-transformation-data.json': {
              content: JSON.stringify(statePayload, null, 2),
            },
          },
        }),
      });

      if (!ghRes.ok) {
        const errText = await ghRes.text();
        return res.status(ghRes.status).json({
          error: `GitHub API returned ${ghRes.status}: ${errText.slice(0, 180)}`,
        });
      }

      const gistData = (await ghRes.json()) as { id: string; html_url: string; updated_at: string };
      res.json({
        success: true,
        gistId: gistData.id,
        htmlUrl: gistData.html_url,
        updatedAt: gistData.updated_at,
      });
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to communicate with GitHub API',
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`RecompOS Server running on http://localhost:${PORT}`);
  });
}

startServer();
