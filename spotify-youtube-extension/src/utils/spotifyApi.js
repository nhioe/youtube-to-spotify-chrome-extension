/*global chrome*/

const SPOTIFY_API_BASE_URL = 'https://api.spotify.com/v1';
const CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID;

const getHeaders = async () => {
  let { accessToken } = await chrome.storage.local.get('accessToken');

  if (!accessToken) {
    const { refreshToken } = await chrome.storage.local.get('refreshToken');
    if (refreshToken) {
      accessToken = await refreshAccessToken(CLIENT_ID, refreshToken);
    } else {
      throw new Error('No access token or refresh token found');
    }
  }

  return {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };
};

const handleResponse = async (response) => {
  if (response.status === 401) {
    // Token expired, refresh and retry
    const { refreshToken } = await chrome.storage.local.get('refreshToken');
    await refreshAccessToken(CLIENT_ID, refreshToken);
    throw new Error('Token refreshed, please retry the request');
  }

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return response.json();
};

export const searchTrack = async (query) => {
  const headers = await getHeaders();
  const response = await fetch(`${SPOTIFY_API_BASE_URL}/search?q=${encodeURIComponent(query)}&type=track&limit=1`, {
    headers,
  });
  return handleResponse(response);
};

export const addTrackToPlaylist = async (playlistId, trackUri) => {
  const headers = await getHeaders();
  const response = await fetch(`${SPOTIFY_API_BASE_URL}/playlists/${playlistId}/tracks`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ uris: [trackUri] }),
  });
  return handleResponse(response);
};

export const getCurrentUserProfile = async () => {
  const headers = await getHeaders();
  const response = await fetch(`${SPOTIFY_API_BASE_URL}/me`, { headers });
  return handleResponse(response);
};

export const getUserPlaylists = async () => {
  const headers = await getHeaders();
  const response = await fetch(`${SPOTIFY_API_BASE_URL}/me/playlists`, { headers });
  return handleResponse(response);
};
