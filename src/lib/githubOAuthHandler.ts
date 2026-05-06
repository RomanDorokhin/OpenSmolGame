/**
 * GitHub OAuth Handler (Backend)
 * Handles OAuth token exchange securely on the server
 * 
 * Add this to your Express server (server/routers.ts or similar)
 */

import { Router, Request, Response } from 'express';

interface GitHubTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
}

/**
 * Create GitHub OAuth router
 */
export function createGitHubOAuthRouter(
  clientId: string,
  clientSecret: string
): Router {
  const router = Router();

  /**
   * POST /auth/github/token
   * Exchange authorization code for access token
   * 
   * Body: { code: string, redirectUri: string }
   * Returns: { access_token: string, token_type: string, scope: string }
   */
  router.post('/auth/github/token', async (req: Request, res: Response) => {
    try {
      const { code, redirectUri } = req.body;

      if (!code) {
        return res.status(400).json({ error: 'Authorization code required' });
      }

      // Exchange code for token
      const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/vnd.github.v3+json',
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          redirect_uri: redirectUri,
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to exchange code for token');
      }

      const tokenData: GitHubTokenResponse = await tokenResponse.json();

      // Return token to frontend (frontend will store it)
      res.json({
        access_token: tokenData.access_token,
        token_type: tokenData.token_type,
        scope: tokenData.scope,
      });
    } catch (error) {
      console.error('OAuth token exchange error:', error);
      res.status(500).json({
        error: 'Failed to exchange authorization code',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * GET /auth/github/user
   * Get current authenticated user info
   * 
   * Headers: { Authorization: 'Bearer {token}' }
   * Returns: GitHub user object
   */
  router.get('/auth/github/user', async (req: Request, res: Response) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing authorization token' });
      }

      const token = authHeader.substring(7);

      const userResponse = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (!userResponse.ok) {
        throw new Error('Failed to fetch user info');
      }

      const userData = await userResponse.json();

      res.json(userData);
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({
        error: 'Failed to fetch user info',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  return router;
}

/**
 * Example Express setup:
 * 
 * import express from 'express';
 * import { createGitHubOAuthRouter } from './githubOAuthHandler';
 * 
 * const app = express();
 * app.use(express.json());
 * 
 * const githubRouter = createGitHubOAuthRouter(
 *   process.env.GITHUB_CLIENT_ID!,
 *   process.env.GITHUB_CLIENT_SECRET!
 * );
 * 
 * app.use('/api', githubRouter);
 * 
 * // Environment variables:
 * // GITHUB_CLIENT_ID=your_client_id
 * // GITHUB_CLIENT_SECRET=your_client_secret
 */
