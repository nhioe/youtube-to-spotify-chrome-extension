/*global chrome*/

import { refreshAccessToken } from './spotifyAuth';

const SPOTIFY_API_BASE_URL = 'https://api.spotify.com/v1';

const getHeaders = async () => {
  let { spotify_access_token } = await chrome.storage.local.get('spotify_access_token');

  if (!spotify_access_token) {
    spotify_access_token = await refreshAccessToken();
  }

  return {
    Authorization: `Bearer ${spotify_access_token}`,
    'Content-Type': 'application/json',
  };
};

const handleResponse = async (response) => {
  if (response.status === 401) {
    // Token expired, refresh and retry
    await refreshAccessToken();
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