/*global chrome*/
export const generateRandomString = (length) => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], "");
}

export const sha256 = async (plain) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return window.crypto.subtle.digest('SHA-256', data);
}

export const base64encode = (input) => {
  return btoa(String.fromCharCode(...new Uint8Array(input)))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
}

export const codeChallenge = async (codeVerifier) => {
  const hashed = await sha256(codeVerifier);
  return base64encode(hashed);
}

export const startAuthFlow = async () => {
  const clientId = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
  const redirectUri = process.env.REACT_APP_SPOTIFY_REDIRECT_URI;
  const scope = process.env.REACT_APP_SPOTIFY_SCOPE;
  const codeVerifier = generateRandomString(64);
  const codeChallengeValue = await codeChallenge(codeVerifier);

  chrome.storage.local.set({ codeVerifier });

  const authUrl = new URL("https://accounts.spotify.com/authorize");

  const params = {
      response_type: 'code',
      client_id: clientId,
      scope,
      code_challenge_method: 'S256',
      code_challenge: codeChallengeValue,
      redirect_uri: redirectUri,
  };

  authUrl.search = new URLSearchParams(params).toString();
  console.log(authUrl.toString());
  chrome.runtime.sendMessage({ action: 'openAuthTab', url: authUrl.toString() });
}
