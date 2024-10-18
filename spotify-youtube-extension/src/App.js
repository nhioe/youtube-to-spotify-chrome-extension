/*global chrome*/

import React, { useState, useEffect } from "react";
import { startAuthFlow } from "./utils/spotifyAuth";
import SpotifyAPI from "./utils/spotifyApi";

function App() {
  const [profile, setProfile] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    const { accessToken } = await chrome.storage.local.get('accessToken');
    if (accessToken) {
      setIsLoggedIn(true);
      fetchProfile();
      fetchPlaylists();
    }
    setIsLoading(false);
  };

  const fetchProfile = async () => {
    try {
      const data = await SpotifyAPI.fetchProfile();
      setProfile(data);
      setError(null);
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      setError("Failed to fetch profile. Please try logging in again.");
      setIsLoggedIn(false);
    }
  };

  const fetchPlaylists = async () => {
    try {
      const data = await SpotifyAPI.getUserPlaylists();
      setPlaylists(data.items);
      setError(null);
    } catch (error) {
      console.error("Failed to fetch playlists:", error);
      setError("Failed to fetch playlists. Please try again.");
    }
  };

  const handleSignIn = async () => {
    try {
      await startAuthFlow();
      checkLoginStatus();
    } catch (error) {
      console.error("Failed to sign in:", error);
      setError("Failed to sign in. Please try again.");
    }
  };

  const handleLogout = async () => {
    await chrome.storage.local.clear();
    setIsLoggedIn(false);
    setProfile(null);
    setPlaylists([]);
    setSelectedPlaylist("");
    setSearchResults([]);
    setError(null);
    console.log('Logged out and Chrome storage cleared.');
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const data = await SpotifyAPI.searchTracks(searchQuery);
      setSearchResults(data.tracks.items);
      setError(null);
    } catch (error) {
      console.error("Failed to search tracks:", error);
      setError("Failed to search tracks. Please try again.");
    }
  };

  const handleAddToPlaylist = async (trackUri) => {
    if (!selectedPlaylist) {
      setError("Please select a playlist first.");
      return;
    }
    try {
      await SpotifyAPI.addTrackToPlaylist(selectedPlaylist, trackUri);
      setError("Track added to playlist successfully!");
    } catch (error) {
      console.error("Failed to add track to playlist:", error);
      setError("Failed to add track to playlist. Please try again.");
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      <h1>Spotify YouTube Extension</h1>
      {error && <div style={{color: 'red'}}>{error}</div>}
      {!isLoggedIn ? (
        <button onClick={handleSignIn}>Sign in with Spotify</button>
      ) : (
        <div>
          <button onClick={handleLogout}>Logout</button>
          {profile && (
            <div>
              <h2>Welcome, {profile.display_name}!</h2>
              <img src={profile.images[0]?.url} alt="Profile" style={{width: 50, height: 50}} />
            </div>
          )}
          <div>
            <input 
              type="text" 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for a song"
            />
            <button onClick={handleSearch}>Search</button>
          </div>
          <div>
            <select 
              value={selectedPlaylist} 
              onChange={(e) => setSelectedPlaylist(e.target.value)}
            >
              <option value="">Select a playlist</option>
              {playlists.map(playlist => (
                <option key={playlist.id} value={playlist.id}>{playlist.name}</option>
              ))}
            </select>
          </div>
          <div>
            {searchResults.map(track => (
              <div key={track.id}>
                {track.name} by {track.artists[0].name}
                <button onClick={() => handleAddToPlaylist(track.uri)}>Add to Playlist</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;