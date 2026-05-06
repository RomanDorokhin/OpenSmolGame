/**
 * SmolGame API Client
 * Integrated with smolgame.dorokhin731.workers.dev backend
 */

const API_BASE = 'https://smolgame.dorokhin731.workers.dev';
const INIT_DATA_SS_KEY = 'smolgame:tgInitData:v1';

export interface SmolGameUser {
  id: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  photo_url?: string;
  isGithubConnected?: boolean;
  githubUsername?: string;
}

export class SmolGameAPI {
  /**
   * Extract initData from URL or sessionStorage
   */
  static getInitData(): string {
    // 1. Try URL fragment (hash) - common in Telegram
    const hash = window.location.hash || '';
    if (hash.includes('tgWebAppData=')) {
      const match = hash.match(/tgWebAppData=([^&]+)/);
      if (match) {
        const data = decodeURIComponent(match[1]);
        this.persistInitData(data);
        return data;
      }
    }

    // 2. Try URL query params
    const search = window.location.search || '';
    if (search.includes('tgWebAppData=')) {
      const params = new URLSearchParams(search);
      const data = params.get('tgWebAppData');
      if (data) {
        this.persistInitData(data);
        return data;
      }
    }

    // 3. Try sessionStorage (cache)
    try {
      return sessionStorage.getItem(INIT_DATA_SS_KEY) || '';
    } catch (e) {
      return '';
    }
  }

  static persistInitData(data: string) {
    if (!data || !data.includes('hash=')) return;
    try {
      sessionStorage.setItem(INIT_DATA_SS_KEY, data);
    } catch (e) { /* ignore */ }
  }

  /**
   * Generic fetch with Telegram authentication
   */
  static async apiFetch(path: string, options: RequestInit = {}) {
    const initData = this.getInitData();
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    if (initData) {
      headers['x-telegram-init-data'] = initData;
    }

    if (options.body && !(options.body instanceof FormData)) {
      headers['content-type'] = 'application/json';
    }

    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || response.statusText || 'Request failed');
    }

    return data;
  }

  /**
   * Get current user profile and GitHub status
   */
  static async getMe(): Promise<SmolGameUser> {
    return this.apiFetch('/api/me');
  }

  /**
   * Start GitHub OAuth flow
   */
  static async githubOAuthStart(): Promise<{ url: string }> {
    return this.apiFetch('/api/auth/github/start');
  }

  /**
   * Unlink GitHub account
   */
  static async githubUnlink(): Promise<void> {
    return this.apiFetch('/api/auth/github/unlink', { method: 'POST' });
  }

  /**
   * Publish game to GitHub
   */
  static async publishGame(payload: {
    files: Array<{ path: string; content: string }>;
    gameTitle: string;
    gameDescription?: string;
  }) {
    return this.apiFetch('/api/github/publish-game', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
}
