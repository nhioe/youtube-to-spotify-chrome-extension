/*global chrome*/

import React, { useState, useEffect } from 'react';
import { initiateSpotifyAuth, getAccessToken } from './utils/spotifyAuth';
import { getCurrentUserProfile, getUserPlaylists } from './utils/spotifyApi';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    const { spotify_access_token } = await chrome.storage.local.get('spotify_access_token');
    if (spotify_access_token) {
      setIsLoggedIn(true);
      fetchUserData();
    }
  };

  const fetchUserData = async () => {
    try {
      const profile = await getCurrentUserProfile();
      setUserProfile(profile);
      const playlistsData = await getUserPlaylists();
      setPlaylists(playlistsData.items);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleLogin = async () => {
    try {
      const code = await initiateSpotifyAuth();
      await getAccessToken(code);
      setIsLoggedIn(true);
      fetchUserData();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Spotify YouTube Extension</h1>
        {!isLoggedIn ? (
          <button className="login-button" onClick={handleLogin}>
            Login to Spotify
          </button>
        ) : (
          <div>
            <p>Welcome, {userProfile?.display_name}!</p>
            <h2>Your Playlists:</h2>
            <ul className="playlist-list">
              {playlists.map((playlist) => (
                <li key={playlist.id}>{playlist.name}</li>
              ))}
            </ul>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;