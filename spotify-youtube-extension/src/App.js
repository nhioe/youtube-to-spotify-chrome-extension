/*global chrome*/

import React, { useState, useEffect } from "react";
import { startAuthFlow } from "./utils/spotifyAuth";

function App() {
  const [profile, setProfile] = useState(null);

  const fetchProfile = async () => {
    try {
      const { accessToken } = await chrome.storage.local.get('accessToken');
      if (!accessToken) {
        console.error('No access token available');
        return;
      }

      const response = await fetch('https://api.spotify.com/v1/me', {
        headers: {
          Authorization: 'Bearer ' + accessToken,
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      
      const data = await response.json();
      setProfile(data);
      console.log(data);
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    }
  }
  
  
  const refreshAccessToken = async () => {
    const response = await chrome.runtime.sendMessage({ action: 'refreshToken' });
    console.log('Response from background:', response);
    if (chrome.runtime.lastError) {
      console.error('Runtime error:', chrome.runtime.lastError.message);
      console.log('Response from background:', response);
    } else if (response && response.success) {
      console.log('Token refreshed:', response.token);
    } else {
      console.error('Error refreshing token:', response ? response.error : 'No response');
    }
  };
  

  const logTokens = async () => {
    const access_token = await chrome.storage.local.get('accessToken');
    const refresh_token = await chrome.storage.local.get('refreshToken');
    console.log("Access token: ", access_token);
    console.log("Refresh token: ", refresh_token);
  }

  const clearChrome = async () => {
    await chrome.storage.local.clear();
    console.log('Chrome storage cleared.');
  }
  /*
  useEffect(() => {
    // Dealing with auth page
    const handleAuthRedirect = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      if (code) {
        chrome.runtime.sendMessage({ action: 'getToken' }, (response) => {
          if (chrome.runtime.lastError) {
            console.error('Runtime error:', chrome.runtime.lastError.message);
          } else if (response && response.success) {
            console.log('Token added:', response.token);
          } else {
            console.error('Error getting token:', response ? response.error : 'No response');
          }
        });
      }
    };

    // Check if a token is already stored in chrome.storage
    chrome.storage.local.get('accessToken', (result) => {
      if (!result.accessToken) {
        handleAuthRedirect();
      }
    });
  }, []);
  */

  return (
    <div className="App">
      <h1>Spotify Authorization</h1>
      <button onClick={() => startAuthFlow()}>
        Authorize with Spotify
      </button>
      <button onClick={fetchProfile}>
        Fetch Profile
      </button>
      <button onClick={refreshAccessToken}>
        Refresh Token
      </button>
      <button onClick={logTokens}>
        Log Chrome Tokens
      </button>
      <button onClick={clearChrome}>
        Clear Local Chrome
      </button>
      {profile && (
        <div>
          <h2>Profile Information</h2>
          <p>Name: {profile.display_name}</p>
          <p>Email: {profile.email}</p>
          <p>Spotify URI: {profile.uri}</p>
        </div>
      )}
    </div>
  );
}

export default App;
