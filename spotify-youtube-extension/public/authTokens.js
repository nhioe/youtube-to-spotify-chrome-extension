/*global chrome*/

const CLIENT_ID = "153a04b007bd437c96080f31c98d65d0";
const REDIRECT_URI = "chrome-extension://hpfafehodjbhbeedckdcokplepkkjiml/callback.html";

export const getToken = async (code) => {
    try {
        const { codeVerifier } = await chrome.storage.local.get('codeVerifier');
  
        if (!codeVerifier) {
          throw new Error("Code verifier not found in storage");
        }
  
        const payload = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: CLIENT_ID,
                grant_type: 'authorization_code',
                code,
                redirect_uri: REDIRECT_URI,
                code_verifier: codeVerifier,
            }),
        };
  
        const response = await fetch('https://accounts.spotify.com/api/token', payload);
        const data = await response.json();
        console.log(data);
  
        if (data.access_token) {
            await chrome.storage.local.set({
                accessToken: data.access_token,
                refreshToken: data.refresh_token,
                expiresIn: Date.now() + data.expires_in * 1000 // Store expiration time
            });
            return data.access_token;
        } else {
            throw new Error('No access token received');
        }
    } catch (error) {
        throw new Error(error.message);
    }
  }
  
  export const refreshAuthToken = async () => {
    try {
      const { refreshToken } = await chrome.storage.local.get('refreshToken');
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
  
      const url = "https://accounts.spotify.com/api/token";
  
      const payload = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: CLIENT_ID
        }),
      }
  
      const body = await fetch(url, payload);
      const data = await body.json();
      console.log(data);
  
      if (data.access_token) {
        // Store new access token and refresh token in Chrome storage
        await chrome.storage.local.set({
          accessToken: data.access_token,
          expiresIn: Date.now() + data.expires_in * 1000,
          ...(data.refresh_token && { refreshToken: data.refresh_token }) // Update refresh token only if a new one is provided
        });
        return data.access_token;
      } else {
        throw new Error('No access token received from Spotify.');
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw error;
    }
  }