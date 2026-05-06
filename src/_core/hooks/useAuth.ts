import { useState, useEffect } from 'react';
import { GitHubOAuthClient, type GitHubUser } from '@/lib/githubOAuthClient';

export function useAuth() {
  const [user, setUser] = useState<GitHubUser | null>(GitHubOAuthClient.getUser());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(GitHubOAuthClient.isAuthenticated());

  useEffect(() => {
    // Poll for changes in localStorage as a simple way to sync tabs/state
    const interval = setInterval(() => {
      const currentUser = GitHubOAuthClient.getUser();
      const currentAuth = GitHubOAuthClient.isAuthenticated();
      
      if (currentAuth !== isAuthenticated) {
        setIsAuthenticated(currentAuth);
      }
      
      if (JSON.stringify(currentUser) !== JSON.stringify(user)) {
        setUser(currentUser);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [user, isAuthenticated]);

  const login = () => {
    const client = new GitHubOAuthClient({
      clientId: import.meta.env.VITE_GITHUB_CLIENT_ID || '',
      redirectUri: `${window.location.origin}/auth/github/callback`,
    });
    window.location.href = client.getAuthorizationUrl();
  };

  const logout = () => {
    GitHubOAuthClient.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  return {
    user,
    isAuthenticated,
    login,
    logout,
  };
}
