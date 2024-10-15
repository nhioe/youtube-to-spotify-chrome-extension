/*global chrome*/
const SPOTIFY_CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = chrome.identity.getRedirectURL();
const SPOTIFY_AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
const SPOTIFY_TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';
const SCOPES = ['user-read-private', 'user-read-email', 'playlist-modify-private', 'playlist-modify-public'];

const generateRandomString = (length) => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from(crypto.getRandomValues(new Uint8Array(length)))
    .map((x) => possible[x % possible.length])
    .join('');
};

const generateCodeVerifier = () => {
  return generateRandomString(128);
};

const generateCodeChallenge = async (codeVerifier) => {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(codeVerifier));
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
};

export const initiateSpotifyAuth = async () => {
  const state = generateRandomString(16);
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  await chrome.storage.local.set({ spotify_code_verifier: codeVerifier });

  const authUrl = new URL(SPOTIFY_AUTH_ENDPOINT);
  authUrl.searchParams.append('client_id', SPOTIFY_CLIENT_ID);
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('redirect_uri', REDIRECT_URI);
  authUrl.searchParams.append('state', state);
  authUrl.searchParams.append('scope', SCOPES.join(' '));
  authUrl.searchParams.append('code_challenge_method', 'S256');
  authUrl.searchParams.append('code_challenge', codeChallenge);

  return new Promise((resolve, reject) => {
    chrome.identity.launchWebAuthFlow(
      {
        url: authUrl.toString(),
        interactive: true,
      },
      (redirectUrl) => {
        if (chrome.runtime.lastError || !redirectUrl) {
          reject(chrome.runtime.lastError);
        } else {
          const url = new URL(redirectUrl);
          const code = url.searchParams.get('code');
          if (code) {
            resolve(code);
          } else {
            reject(new Error('No code found in redirect URL'));
          }
        }
      }
    );
  });
};

export const getAccessToken = async (code) => {
  const { spotify_code_verifier } = await chrome.storage.local.get('spotify_code_verifier');

  const params = new URLSearchParams();
  params.append('client_id', SPOTIFY_CLIENT_ID);
  params.append('grant_type', 'authorization_code');
  params.append('code', code);
  params.append('redirect_uri', REDIRECT_URI);
  params.append('code_verifier', spotify_code_verifier);

  const response = await fetch(SPOTIFY_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  });

  if (!response.ok) {
    throw new Error('Failed to get access token');
  }

  const data = await response.json();
  await chrome.storage.local.set({ spotify_access_token: data.access_token, spotify_refresh_token: data.refresh_token });
  return data.access_token;
};

export const refreshAccessToken = async () => {
  const { spotify_refresh_token } = await chrome.storage.local.get('spotify_refresh_token');

  if (!spotify_refresh_token) {
    throw new Error('No refresh token found');
  }

  const params = new URLSearchParams();
  params.append('client_id', SPOTIFY_CLIENT_ID);
  params.append('grant_type', 'refresh_token');
  params.append('refresh_token', spotify_refresh_token);

  const response = await fetch(SPOTIFY_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  });

  if (!response.ok) {
    throw new Error('Failed to refresh access token');
  }

  const data = await response.json();
  await chrome.storage.local.set({ spotify_access_token: data.access_token });
  return data.access_token;
};
