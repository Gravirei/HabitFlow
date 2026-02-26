import { useIntegrationStore } from './integrationStore';

interface AccessTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

interface PlaybackState {
  is_playing: boolean;
  current_track?: {
    id: string;
    name: string;
    artists: Array<{ name: string }>;
    album: {
      images: Array<{ url: string; height: number; width: number }>;
    };
    uri: string;
  };
  device?: {
    id: string;
    volume_percent: number;
  };
}

interface Playlist {
  id: string;
  name: string;
  images: Array<{ url: string }>;
  tracks: {
    total: number;
  };
  uri: string;
}

interface SearchResponse {
  playlists: {
    items: Playlist[];
  };
}

const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize';
const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID || 'your_client_id';
const CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET || 'your_client_secret';
const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI || 'http://localhost:5173/callback';

const SCOPES = [
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
  'playlist-read-private',
  'streaming',
];

export const spotifyService = {
  /**
   * Initiates OAuth flow by opening Spotify authorization URL
   */
  initiateAuth(): void {
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      response_type: 'code',
      redirect_uri: REDIRECT_URI,
      scope: SCOPES.join(' '),
      show_dialog: 'true',
    });

    window.location.href = `${SPOTIFY_AUTH_URL}?${params.toString()}`;
  },

  /**
   * Exchanges authorization code for access token
   */
  async exchangeCode(code: string): Promise<AccessTokenResponse> {
    try {
      const params = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      });

      const response = await fetch(SPOTIFY_TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      if (!response.ok) {
        throw new Error(`Token exchange failed: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      throw error;
    }
  },

  /**
   * Refreshes expired access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<AccessTokenResponse> {
    try {
      const params = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      });

      const response = await fetch(SPOTIFY_TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error refreshing access token:', error);
      throw error;
    }
  },

  /**
   * Returns authorization headers for API requests
   */
  getHeaders(accessToken: string): HeadersInit {
    return {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };
  },

  /**
   * Fetches current playback state
   */
  async getCurrentPlayback(accessToken: string): Promise<PlaybackState | null> {
    try {
      const response = await fetch(`${SPOTIFY_API_BASE}/me/player`, {
        headers: this.getHeaders(accessToken),
      });

      if (response.status === 204) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch playback state: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching current playback:', error);
      throw error;
    }
  },

  /**
   * Resumes or starts playback
   */
  async play(accessToken: string, uri?: string): Promise<void> {
    try {
      const body = uri ? JSON.stringify({ uris: [uri] }) : undefined;

      const response = await fetch(`${SPOTIFY_API_BASE}/me/player/play`, {
        method: 'PUT',
        headers: this.getHeaders(accessToken),
        body,
      });

      if (!response.ok && response.status !== 204) {
        throw new Error(`Failed to play: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error playing track:', error);
      throw error;
    }
  },

  /**
   * Pauses playback
   */
  async pause(accessToken: string): Promise<void> {
    try {
      const response = await fetch(`${SPOTIFY_API_BASE}/me/player/pause`, {
        method: 'PUT',
        headers: this.getHeaders(accessToken),
      });

      if (!response.ok && response.status !== 204) {
        throw new Error(`Failed to pause: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error pausing playback:', error);
      throw error;
    }
  },

  /**
   * Sets playback volume
   */
  async setVolume(accessToken: string, volumePercent: number): Promise<void> {
    try {
      const volume = Math.max(0, Math.min(100, volumePercent));
      const response = await fetch(
        `${SPOTIFY_API_BASE}/me/player/volume?volume_percent=${volume}`,
        {
          method: 'PUT',
          headers: this.getHeaders(accessToken),
        }
      );

      if (!response.ok && response.status !== 204) {
        throw new Error(`Failed to set volume: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error setting volume:', error);
      throw error;
    }
  },

  /**
   * Fetches user's playlists
   */
  async getUserPlaylists(accessToken: string): Promise<Playlist[]> {
    try {
      const response = await fetch(`${SPOTIFY_API_BASE}/me/playlists?limit=50`, {
        headers: this.getHeaders(accessToken),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch playlists: ${response.statusText}`);
      }

      const data = await response.json();
      return data.items;
    } catch (error) {
      console.error('Error fetching user playlists:', error);
      throw error;
    }
  },

  /**
   * Searches for playlists
   */
  async searchPlaylists(accessToken: string, query: string): Promise<Playlist[]> {
    try {
      const params = new URLSearchParams({
        q: query,
        type: 'playlist',
        limit: '50',
      });

      const response = await fetch(`${SPOTIFY_API_BASE}/search?${params.toString()}`, {
        headers: this.getHeaders(accessToken),
      });

      if (!response.ok) {
        throw new Error(`Failed to search playlists: ${response.statusText}`);
      }

      const data: SearchResponse = await response.json();
      return data.playlists.items;
    } catch (error) {
      console.error('Error searching playlists:', error);
      throw error;
    }
  },

  /**
   * Searches for curated focus/concentration/study playlists
   */
  async getFocusPlaylists(accessToken: string): Promise<Playlist[]> {
    try {
      const queries = ['focus', 'concentration', 'study', 'deep work', 'coding'];
      const allPlaylists = new Map<string, Playlist>();

      for (const query of queries) {
        const playlists = await this.searchPlaylists(accessToken, query);
        playlists.forEach((playlist) => {
          allPlaylists.set(playlist.id, playlist);
        });
      }

      return Array.from(allPlaylists.values()).slice(0, 50);
    } catch (error) {
      console.error('Error fetching focus playlists:', error);
      throw error;
    }
  },

  /**
   * Fetches tracks from a specific playlist
   */
  async getPlaylistTracks(accessToken: string, playlistId: string): Promise<any[]> {
    try {
      const response = await fetch(
        `${SPOTIFY_API_BASE}/playlists/${playlistId}/tracks?limit=50`,
        {
          headers: this.getHeaders(accessToken),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch playlist tracks: ${response.statusText}`);
      }

      const data = await response.json();
      return data.items;
    } catch (error) {
      console.error('Error fetching playlist tracks:', error);
      throw error;
    }
  },

  /**
   * Disconnects Spotify integration
   */
  disconnect(): void {
    const integrationStore = useIntegrationStore();
    integrationStore.disconnect('spotify');
  },
};
