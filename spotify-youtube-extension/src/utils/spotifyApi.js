/*global chrome*/

const SPOTIFY_API_BASE_URL = 'https://api.spotify.com/v1';

class SpotifyAPI {
  static async makeRequest(endpoint, method = 'GET', body = null) {
    const { accessToken } = await chrome.storage.local.get('accessToken');
    if (!accessToken) {
      throw new Error('No access token available');
    }

    const url = `${SPOTIFY_API_BASE_URL}${endpoint}`;
    console.log('Making request to:', url); // Add this line for debugging

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
        // Token expired, try to refresh
        await this.refreshAccessToken();
        return this.makeRequest(endpoint, method, body);
      }
      throw new Error(`API request failed: ${response.statusText}`);
    }
    const test = response.clone();
    console.log(test.json());
    return response.json();
  }

  static async refreshAccessToken() {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'refreshToken' });
      if (!response || !response.success) {
        throw new Error(response ? response.error : 'Failed to refresh token');
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

  static async getPlaylistTracks(playlistId) {
    return this.makeRequest(`/playlists/${playlistId}/tracks`);
  }
  
  static async searchTracks(query, limit = 20, offset = 0) {
    return this.makeRequest(`/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}&offset=${offset}`);
  }

  static async addTrackToPlaylist(playlistId, trackUri) {
    return this.makeRequest(`/playlists/${playlistId}/tracks`, 'POST', { uris: [trackUri] });
  }

  static async removeTrackFromPlaylist(playlistId, trackUri) {
    return this.makeRequest(`/playlists/${playlistId}/tracks`, 'DELETE', { tracks: [{ uri: trackUri }] });
  }
}

export default SpotifyAPI;