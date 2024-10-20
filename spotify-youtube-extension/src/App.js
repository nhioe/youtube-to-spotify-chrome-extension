/*global chrome*/
import React, { useState, useEffect } from "react";
import { startAuthFlow } from "./utils/spotifyAuth";
import SpotifyAPI from "./utils/spotifyAPI";
import Profile from './components/Profile';
import SearchBar from './components/SearchBar';
import PlaylistSelector from './components/PlaylistSelector';
import TrackList from './components/TrackList';
import Pagination from './components/Pagination';
import PlaylistPreview from './components/PlaylistPreview';
import Skeleton from './components/Skeleton';
import { Search, Music } from 'lucide-react';
import './App.css';

const ITEMS_PER_PAGE = 5;
const ITEMS_TO_PRELOAD = 10;

function App() {
  const [profile, setProfile] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState("");
  const [selectedPlaylistTracks, setSelectedPlaylistTracks] = useState([]);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  useEffect(() => {
    if (selectedPlaylist) {
      fetchPlaylistTracks(selectedPlaylist);
    }
  }, [selectedPlaylist]);

  const checkLoginStatus = async () => {
    try {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1500));

      const { accessToken } = await chrome.storage.local.get('accessToken');
      if (accessToken) {
        setIsLoggedIn(true);
        await fetchProfile();
        await fetchPlaylists();
      } else {
        setError("Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Error checking login status:", error);
      setError("Failed to check login status. Please try again.");
    } finally {
      setIsLoading(false);
    }
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

  const fetchPlaylistTracks = async (playlistId) => {
    try {
      const data = await SpotifyAPI.getPlaylistTracks(playlistId);
      setSelectedPlaylistTracks(data.items.map(item => item.track));
    } catch (error) {
      console.error("Failed to fetch playlist tracks:", error);
      setError("Failed to fetch playlist tracks. Please try again.");
    }
  };

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      await startAuthFlow();
      await checkLoginStatus();
    } catch (error) {
      console.error("Failed to sign in:", error);
      setError("Failed to sign in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    await chrome.storage.local.clear();
    setIsLoggedIn(false);
    setProfile(null);
    setPlaylists([]);
    setSelectedPlaylist("");
    setSearchResults([]);
    setError(null);
    console.log('Logged out and Chrome storage cleared.');
    setIsLoading(false);
  };

  const handleSearch = async (query = searchQuery) => {
    if (!query.trim()) return;
    try {
      setIsLoading(true);
      const data = await SpotifyAPI.searchTracks(query, ITEMS_TO_PRELOAD, 0);
      setSearchResults(data.tracks.items);
      setTotalResults(data.tracks.total);
      setCurrentPage(1);
      setError(null);
    } catch (error) {
      console.error("Failed to search tracks:", error);
      setError("Failed to search tracks. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreviousPage = () => {
    setCurrentPage(prevPage => Math.max(prevPage - 1, 1));
  };

  const handleNextPage = async () => {
    const nextPage = currentPage + 1;
    const itemsNeeded = nextPage * ITEMS_PER_PAGE;
    
    if (itemsNeeded > searchResults.length && searchResults.length < totalResults) {
      try {
        setIsLoadingMore(true);
        const data = await SpotifyAPI.searchTracks(searchQuery, ITEMS_TO_PRELOAD, searchResults.length);
        setSearchResults(prevResults => [...prevResults, ...data.tracks.items]);
      } catch (error) {
        console.error("Failed to load more tracks:", error);
        setError("Failed to load more tracks. Please try again.");
      } finally {
        setIsLoadingMore(false);
      }
    }
    
    setCurrentPage(nextPage);
  };

  const handleAddToPlaylist = async (trackUri) => {
    if (!selectedPlaylist) {
      setError("Please select a playlist first.");
      return;
    }

    const isTrackInPlaylist = selectedPlaylistTracks.some(track => track.uri === trackUri);

    if (isTrackInPlaylist) {
      if (!window.confirm("This track is already in the playlist. Are you sure you want to add it again?")) {
        return;
      }
    }

    try {
      setIsLoading(true);
      await SpotifyAPI.addTrackToPlaylist(selectedPlaylist, trackUri);
      setError("Track added to playlist successfully!");
      await fetchPlaylistTracks(selectedPlaylist);
    } catch (error) {
      console.error("Failed to add track to playlist:", error);
      setError("Failed to add track to playlist. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFromPlaylist = async (trackUri) => {
    if (!selectedPlaylist) {
      setError("No playlist selected.");
      return;
    }

    try {
      setIsLoading(true);
      console.log("Removing track with URI:", trackUri);
      
      await SpotifyAPI.removeTrackFromPlaylist(selectedPlaylist, trackUri);
      setError("Track removed from playlist successfully!");
      await fetchPlaylistTracks(selectedPlaylist);
    } catch (error) {
      console.error("Failed to remove track from playlist:", error);
      setError("Failed to remove track from playlist. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleYouTubeSearch = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab.url.includes('youtube.com/watch')) {
        const videoTitle = tab.title.replace(' - YouTube', '');
        setSearchQuery(videoTitle);
        await handleSearch(videoTitle);
      } else {
        setError("Please navigate to a YouTube video page.");
      }
    } catch (error) {
      console.error("Failed to get YouTube video title:", error);
      setError("Failed to get YouTube video title. Please try again.");
    }
  };

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const displayedTracks = searchResults.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const hasMore = startIndex + ITEMS_PER_PAGE < totalResults;

  if (isLoading) {
    return (
      <div className="App">
        <h1>Spotify YouTube Extension</h1>
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="App">
      {!isLoggedIn ? (
        <>
          <h1>Spotify YouTube Extension</h1>
          <button onClick={handleSignIn} className="btn btn-signin">
            <Music size={16} /> Sign in with Spotify
          </button>
        </>
      ) : (
        <div className="extension-content">
          <Profile profile={profile} onLogout={handleLogout} />
          <button onClick={handleYouTubeSearch} className="btn btn-youtube">
            <Search size={16} /> Search YouTube Video
          </button>
          <SearchBar 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery} 
            onSearch={() => handleSearch()} 
          />
          <PlaylistSelector 
            playlists={playlists} 
            selectedPlaylist={selectedPlaylist} 
            setSelectedPlaylist={setSelectedPlaylist} 
          />
          {selectedPlaylist && (
            <PlaylistPreview 
              tracks={selectedPlaylistTracks} 
              onRemoveTrack={handleRemoveFromPlaylist}
            />
          )}
          {searchResults.length > 0 && (
            <>
              {isLoadingMore ? (
                <Skeleton count={ITEMS_PER_PAGE} />
              ) : (
                <TrackList 
                  tracks={displayedTracks} 
                  onAddToPlaylist={handleAddToPlaylist} 
                  playlistTracks={selectedPlaylistTracks}
                />
              )}
              {totalResults > ITEMS_PER_PAGE && (
                <Pagination 
                  currentPage={currentPage}
                  hasMore={hasMore}
                  onPreviousPage={handlePreviousPage}
                  onNextPage={handleNextPage}
                />
              )}
            </>
          )}
        </div>
      )}
      {error && <div className="error-message">{error}</div>}
    </div>
  );
}

export default App;