/*global chrome*/

const SPOTIFY_API_BASE_URL = 'https://api.spotify.com/v1';

class SpotifyAPIError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = 'SpotifyAPIError';
    this.statusCode = statusCode;
  }
}

class SpotifyAPI {
  static async makeRequest(endpoint, method = 'GET', body = null) {
    try {
      const { accessToken } = await chrome.storage.local.get('accessToken');
      if (!accessToken) {
        throw new SpotifyAPIError('No access token available', 401);
      }

      const url = `${SPOTIFY_API_BASE_URL}${endpoint}`;
      console.log('Request to:', url);

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : null,
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired try to refresh
          await this.refreshAccessToken();
          return this.makeRequest(endpoint, method, body);
        }
        throw new SpotifyAPIError(
          `API request failed: ${response.statusText}`,
          response.status,
        );
      }

      return response.json();
    } catch (error) {
      console.error('Spotify API Error:', error);
      throw error;
    }
  }

  static async refreshAccessToken() {
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'refreshToken',
      });
      if (!response || !response.success) {
        throw new SpotifyAPIError(
          response ? response.error : 'Failed to refresh token',
          401,
        );
      }
      return response.token;
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw error;
    }
  }

  static async fetchProfile() {
    return this.makeRequest('/me');
  }

  static async getUserPlaylists() {
    return this.makeRequest('/me/playlists');
  }

  static async createPlaylist(playlistName, playlistDescription) {
    return this.makeRequest('/me/playlists', 'POST', {
      name: playlistName,
      description: playlistDescription,
      public: false,
    });
  }

  static async getPlaylistTracks(playlistId) {
    return this.makeRequest(`/playlists/${playlistId}/tracks`);
  }

  static async searchTracks(query, limit = 20, offset = 0) {
    return this.makeRequest(
      `/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}&offset=${offset}`,
    );
  }
  /*
  static async searchArtistSong(artist, song) {
    console.log(song);
    const query = `artist:${artist} track:${song}`;
    const url = `/search?q=${encodeURIComponent(query)}&type=track&limit=20&offset=0`;
    return this.makeRequest(url);
  }
*/

  static async addTrackToPlaylist(playlistId, trackUri) {
    return this.makeRequest(`/playlists/${playlistId}/tracks`, 'POST', {
      uris: [trackUri],
    });
  }

  static async removeTrackFromPlaylist(playlistId, trackUri) {
    return this.makeRequest(`/playlists/${playlistId}/tracks`, 'DELETE', {
      tracks: [{ uri: trackUri }],
    });
  }
}

export default SpotifyAPI;
