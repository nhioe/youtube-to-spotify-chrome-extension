/*global chrome*/
import React, { useState, useEffect, useCallback } from 'react';
import { Button, CircularProgress, Snackbar, Alert } from '@mui/material';
import { Search, Music, Play } from 'lucide-react';
import { startAuthFlow } from '../utils/spotifyAuth';
import SpotifyAPI from '../utils/spotifyAPI';
import Profile from './Profile';
import SearchBar from './SearchBar';
import PlaylistSelector from './PlaylistSelector';
import TrackList from './TrackList';
import Pagination from './Pagination';
import PlaylistPreview from './PlaylistPreview';
import ConfirmationDialog from './ConfirmationDialog';
import { Title, ErrorText, Div } from './StyledComponents';

const ITEMS_PER_PAGE = 5;
const ITEMS_TO_PRELOAD = 10;
const PREVIEW_DELAY = 1000; // 1 second delay before playing preview
const MESSAGE_DURATION = 3000; // 3 seconds for message display

function AppContent() {
  const [profile, setProfile] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState('');
  const [selectedPlaylistTracks, setSelectedPlaylistTracks] = useState([]);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [confirmationDialog, setConfirmationDialog] = useState({ open: false, title: '', content: '', onConfirm: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [currentlyPlayingTrack, setCurrentlyPlayingTrack] = useState(null);
  const [audioElement, setAudioElement] = useState(null);
  const [previewTimer, setPreviewTimer] = useState(null);

  useEffect(() => {
    const audio = new Audio();
    setAudioElement(audio);
    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  useEffect(() => {
    if (selectedPlaylist) {
      fetchPlaylistTracks(selectedPlaylist);
    }
  }, [selectedPlaylist]);

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
    setTimeout(() => {
      setSnackbar(prev => ({ ...prev, open: false }));
    }, MESSAGE_DURATION);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const checkLoginStatus = async () => {
    try {
      setIsLoading(true);
      const { accessToken } = await chrome.storage.local.get('accessToken');
      if (accessToken) {
        setIsLoggedIn(true);
        await fetchProfile();
        await fetchPlaylists();
      } else {
        setIsLoggedIn(false);
        showSnackbar('Please log in to use the extension.', 'info');
      }
    } catch (error) {
      console.error('Error checking login status:', error);
      showSnackbar('Failed to check login status. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const data = await SpotifyAPI.fetchProfile();
      setProfile(data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      showSnackbar('Failed to fetch profile. Please try logging in again.', 'error');
      setIsLoggedIn(false);
    }
  };

  const fetchPlaylists = async () => {
    try {
      const data = await SpotifyAPI.getUserPlaylists();
      setPlaylists(data.items);
    } catch (error) {
      console.error('Failed to fetch playlists:', error);
      showSnackbar('Failed to fetch playlists. Please try again.', 'error');
    }
  };

  const fetchPlaylistTracks = async (playlistId) => {
    try {
      const data = await SpotifyAPI.getPlaylistTracks(playlistId);
      setSelectedPlaylistTracks(data.items.map(item => item.track));
    } catch (error) {
      console.error('Failed to fetch playlist tracks:', error);
      showSnackbar('Failed to fetch playlist tracks. Please try again.', 'error');
    }
  };

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      await startAuthFlow();
      await checkLoginStatus();
    } catch (error) {
      console.error('Failed to sign in:', error);
      showSnackbar('Failed to sign in. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setConfirmationDialog({
      open: true,
      title: 'Confirm Logout',
      content: 'Are you sure you want to log out?',
      onConfirm: async () => {
        setIsLoading(true);
        await chrome.storage.local.clear();
        setIsLoggedIn(false);
        setProfile(null);
        setPlaylists([]);
        setSelectedPlaylist('');
        setSearchResults([]);
        setError(null);
        console.log('Logged out and Chrome storage cleared.');
        setIsLoading(false);
        showSnackbar('Logged out successfully', 'success');
      },
    });
  };

  const handleSearch = async (query = searchQuery) => {
    if (!query.trim()) return;
    try {
      setIsSearching(true);
      const data = await SpotifyAPI.searchTracks(query, ITEMS_TO_PRELOAD, 0);
      setSearchResults(data.tracks.items);
      setTotalResults(data.tracks.total);
      setCurrentPage(1);
    } catch (error) {
      console.error('Failed to search tracks:', error);
      showSnackbar('Failed to search tracks. Please try again.', 'error');
    } finally {
      setIsSearching(false);
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
        console.error('Failed to load more tracks:', error);
        showSnackbar('Failed to load more tracks. Please try again.', 'error');
      } finally {
        setIsLoadingMore(false);
      }
    }
    
    setCurrentPage(nextPage);
  };

  const handleAddToPlaylist = async (trackUri) => {
    if (!selectedPlaylist) {
      showSnackbar('Please select a playlist first.', 'warning');
      return;
    }

    const isTrackInPlaylist = selectedPlaylistTracks.some(track => track.uri === trackUri);

    if (isTrackInPlaylist) {
      setConfirmationDialog({
        open: true,
        title: 'Confirm Add Track',
        content: 'This track is already in the playlist. Are you sure you want to add it again?',
        onConfirm: async () => {
          try {
            setIsLoading(true);
            await SpotifyAPI.addTrackToPlaylist(selectedPlaylist, trackUri);
            showSnackbar('Track added to playlist successfully!', 'success');
            await fetchPlaylistTracks(selectedPlaylist);
          } catch (error) {
            console.error('Failed to add track to playlist:', error);
            showSnackbar('Failed to add track to playlist. Please try again.', 'error');
          } finally {
            setIsLoading(false);
          }
        },
      });
    } else {
      try {
        setIsLoading(true);
        await SpotifyAPI.addTrackToPlaylist(selectedPlaylist, trackUri);
        showSnackbar('Track added to playlist successfully!', 'success');
        await fetchPlaylistTracks(selectedPlaylist);
      } catch (error) {
        console.error('Failed to add track to playlist:', error);
        showSnackbar('Failed to add track to playlist. Please try again.', 'error');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleRemoveFromPlaylist = async (trackUri) => {
    if (!selectedPlaylist) {
      showSnackbar('No playlist selected.', 'warning');
      return;
    }

    setConfirmationDialog({
      open: true,
      title: 'Confirm Remove Track',
      content: 'Are you sure you want to remove this track from the playlist?',
      onConfirm: async () => {
        try {
          setIsLoading(true);
          console.log('Removing track with URI:', trackUri);
          await SpotifyAPI.removeTrackFromPlaylist(selectedPlaylist, trackUri);
          showSnackbar('Track removed from playlist successfully!', 'success');
          await fetchPlaylistTracks(selectedPlaylist);
        } catch (error) {
          console.error('Failed to remove track from playlist:', error);
          showSnackbar('Failed to remove track from playlist. Please try again.', 'error');
        } finally {
          setIsLoading(false);
        }
      },
    });
  };

  const handleYouTubeSearch = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab.url.includes('youtube.com/watch')) {
        const videoTitle = tab.title.replace(' - YouTube', '');
        setSearchQuery(videoTitle);
        await handleSearch(videoTitle);
      } else {
        showSnackbar('Please navigate to a YouTube video page.', 'warning');
      }
    } catch (error) {
      console.error('Failed to get YouTube video title:', error);
      showSnackbar('Failed to get YouTube video title. Please try again.', 'error');
    }
  };

  const handlePreviewPlay = useCallback((track) => {
    if (audioElement) {
      audioElement.pause();
      audioElement.src = '';
      
      if (track.preview_url) {
        audioElement.src = track.preview_url;
        audioElement.play();
        setCurrentlyPlayingTrack(track);
        showSnackbar(`Now playing preview: ${track.name}`, 'info');
      } else {
        setCurrentlyPlayingTrack(null);
        showSnackbar(`No preview available for: ${track.name}`, 'warning');
      }
    }
  }, [audioElement]);

  const handlePreviewStop = useCallback(() => {
    if (audioElement) {
      audioElement.pause();
      audioElement.src = '';
      setCurrentlyPlayingTrack(null);
    }
  }, [audioElement]);

  const handleTrackHover = useCallback((track) => {
    clearTimeout(previewTimer);
    setPreviewTimer(setTimeout(() => handlePreviewPlay(track), PREVIEW_DELAY));
  }, [handlePreviewPlay, previewTimer]);

  const handleTrackLeave = useCallback(() => {
    clearTimeout(previewTimer);
    handlePreviewStop();
  }, [handlePreviewStop, previewTimer]);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const displayedTracks = searchResults.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const hasMore = startIndex + ITEMS_PER_PAGE < totalResults;

  if (isLoading) {
    return (
      <Div sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Title variant="h1">Spotify YouTube Extension</Title>
        <CircularProgress />
        <ErrorText>Loading...</ErrorText>
      </Div>
    );
  }

  return (
    <>
      {!isLoggedIn ? (
        <Div sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <Title variant="h1">Spotify YouTube Extension</Title>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSignIn}
            startIcon={<Music />}
            sx={{ m: 1 }}
          >
            Sign in with Spotify
          </Button>
        </Div>
      ) : (
        <Div sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Profile profile={profile} onLogout={handleLogout} />
          <Button
            variant="contained"
            color="secondary"
            onClick={handleYouTubeSearch}
            startIcon={<Search />}
            sx={{ m: 1 }}
          >
            Search YouTube Video
          </Button>
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
              onTrackHover={handleTrackHover}
              onTrackLeave={handleTrackLeave}
              currentlyPlayingTrack={currentlyPlayingTrack}
            />
          )}
          {searchResults.length > 0 ? (
            <TrackList 
              tracks={displayedTracks} 
              onAddToPlaylist={handleAddToPlaylist} 
              playlistTracks={selectedPlaylistTracks}
              onTrackHover={handleTrackHover}
              onTrackLeave={handleTrackLeave}
              currentlyPlayingTrack={currentlyPlayingTrack}
            />
          ) : null}
          {(totalResults > ITEMS_PER_PAGE || isSearching) && (
            <Pagination 
              currentPage={currentPage}
              hasMore={hasMore}
              
              onPreviousPage={handlePreviousPage}
              onNextPage={handleNextPage}
              isLoading={isSearching || isLoadingMore}
            />
          )}
        </Div>
      )}
      <ConfirmationDialog
        open={confirmationDialog.open}
        title={confirmationDialog.title}
        content={confirmationDialog.content}
        onConfirm={() => {
          confirmationDialog.onConfirm();
          setConfirmationDialog({ ...confirmationDialog, open: false });
        }}
        onCancel={() => setConfirmationDialog({ ...confirmationDialog, open: false })}
      />
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={MESSAGE_DURATION} 
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default AppContent;