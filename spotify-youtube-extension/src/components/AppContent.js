/*global chrome*/
import React, { useState, useEffect } from 'react';
import { CircularProgress, Button } from '@mui/material';
import { Search } from 'lucide-react';
import { styled } from '@mui/material/styles';
import { useAudio } from '../hooks/useAudio';
import { useSnackbar } from '../contexts/SnackbarContext';
import * as spotifyService from '../services/spotifyService';
import { ITEMS_PER_PAGE, ITEMS_TO_PRELOAD } from '../constants/values';
import { MESSAGES, DIALOG_TITLES } from '../constants/messages';
import LoginView from './LoginView';
import SearchBar from './SearchBar';
import TrackList from './TrackList';
import Pagination from './Pagination';
import PlaylistSelector from './PlaylistSelector';
import PlaylistPreview from './PlaylistPreview';
import ConfirmationDialog from './ConfirmationDialog';
import { startAuthFlow } from '../utils/spotifyAuth';

const AppContainer = styled('div')(({ theme }) => ({
  width: '400px',
  height: '600px',
  overflowY: 'auto',
  padding: theme.spacing(2),
  boxSizing: 'border-box',
  '&::-webkit-scrollbar': {
    width: '10px',
  },
  '&::-webkit-scrollbar-track': {
    background: theme.palette.background.paper,
  },
  '&::-webkit-scrollbar-thumb': {
    background: '#888',
    borderRadius: '5px',
  },
  '&::-webkit-scrollbar-thumb:hover': {
    background: '#555',
  },
}));

const LoadingContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
});

const Title = styled('h1')(({ theme }) => ({
  color: theme.palette.primary.main,
  fontSize: '24px',
  marginBottom: theme.spacing(2),
}));

const ErrorText = styled('p')(({ theme }) => ({
  color: theme.palette.error.main,
  marginBottom: theme.spacing(1),
}));

const Header = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '16px',
});

const YouTubeSearchButton = styled(Button)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const AppContent = () => {

  const [profile, setProfile] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // playlists
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(''); // playlist name
  const [selectedPlaylistTracks, setSelectedPlaylistTracks] = useState([]); // playlist tracks

  // search results
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  const [confirmationDialog, setConfirmationDialog] = useState({ open: false, title: '', content: '', onConfirm: null });
  const { currentlyPlayingTrack, handlePreviewPlay, handlePreviewStop } = useAudio();
  const { showSnackbar } = useSnackbar();

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
      const { accessToken } = await chrome.storage.local.get('accessToken');
      if (accessToken) {
        setIsLoggedIn(true);
        await fetchProfile();
        await fetchPlaylists();
      } else {
        setIsLoggedIn(false);
        showSnackbar(MESSAGES.LOGIN_REQUIRED, 'info');
      }
    } catch (error) {
      console.error('Error checking login status:', error);
      showSnackbar(MESSAGES.LOGIN_STATUS_ERROR, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const data = await spotifyService.fetchProfile();
      setProfile(data);
    } catch (error) {
      showSnackbar(MESSAGES.PROFILE_FETCH_ERROR, 'error');
      setIsLoggedIn(false);
    }
  };

  const fetchPlaylists = async () => {
    try {
      const data = await spotifyService.fetchPlaylists();
      setPlaylists(data.items);
    } catch (error) {
      showSnackbar(MESSAGES.PLAYLISTS_FETCH_ERROR, 'error');
    }
  };

  const fetchPlaylistTracks = async (playlistId) => {
    try {
      const data = await spotifyService.fetchPlaylistTracks(playlistId);
      setSelectedPlaylistTracks(data.items.map(item => item.track));
    } catch (error) {
      showSnackbar(MESSAGES.PLAYLIST_TRACKS_FETCH_ERROR, 'error');
    }
  };

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      await startAuthFlow();
      await checkLoginStatus();
    } catch (error) {
      console.error('Failed to sign in:', error);
      showSnackbar(MESSAGES.SIGN_IN_ERROR, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setConfirmationDialog({
      open: true,
      title: DIALOG_TITLES.LOGOUT_CONFIRMATION,
      content: MESSAGES.LOGOUT_CONFIRMATION,
      onConfirm: async () => {
        setIsLoading(true);
        await chrome.storage.local.clear();
        setIsLoggedIn(false);
        setProfile(null);
        setPlaylists([]);
        setSelectedPlaylist('');
        setSearchResults([]);
        console.log('Logged out and Chrome storage cleared.');
        setIsLoading(false);
        showSnackbar(MESSAGES.LOGOUT_SUCCESS, 'success');
      },
    });
  };

  const handleSearch = async (query = searchQuery) => {
    if (!query.trim()) return;
    try {
      setIsSearching(true);
      const data = await spotifyService.searchTracks(query, ITEMS_TO_PRELOAD, 0);
      setSearchResults(data.tracks.items);
      setTotalResults(data.tracks.total);
      setCurrentPage(1);
    } catch (error) {
      showSnackbar(MESSAGES.SEARCH_ERROR, 'error');
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
        const data = await spotifyService.searchTracks(searchQuery, ITEMS_TO_PRELOAD, searchResults.length);
        setSearchResults(prevResults => [...prevResults, ...data.tracks.items]);
      } catch (error) {
        showSnackbar(MESSAGES.LOAD_MORE_ERROR, 'error');
      } finally {
        setIsLoadingMore(false);
      }
    }
    
    setCurrentPage(nextPage);
  };

  const handleAddToPlaylist = async (trackUri) => {
    if (!selectedPlaylist) {
      showSnackbar(MESSAGES.SELECT_PLAYLIST_WARNING, 'warning');
      return;
    }

    const isTrackInPlaylist = selectedPlaylistTracks.some(track => track.uri === trackUri);

    if (isTrackInPlaylist) {
      setConfirmationDialog({
        open: true,
        title: DIALOG_TITLES.ADD_TRACK_CONFIRMATION,
        content: MESSAGES.TRACK_ALREADY_IN_PLAYLIST,
        onConfirm: async () => {
          await addTrackToPlaylist(trackUri);
        },
      });
    } else {
      await addTrackToPlaylist(trackUri);
    }
  };

  const addTrackToPlaylist = async (trackUri) => {
    try {
      setIsLoading(true);
      await spotifyService.addTrackToPlaylist(selectedPlaylist, trackUri);
      showSnackbar(MESSAGES.TRACK_ADDED_SUCCESS, 'success');
      await fetchPlaylistTracks(selectedPlaylist);
    } catch (error) {
      showSnackbar(MESSAGES.TRACK_ADD_ERROR, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFromPlaylist = async (trackUri) => {
    if (!selectedPlaylist) {
      showSnackbar(MESSAGES.NO_PLAYLIST_SELECTED, 'warning');
      return;
    }

    setConfirmationDialog({
      open: true,
      title: DIALOG_TITLES.REMOVE_TRACK_CONFIRMATION,
      content: MESSAGES.REMOVE_TRACK_CONFIRMATION,
      onConfirm: async () => {
        try {
          setIsLoading(true);
          await spotifyService.removeTrackFromPlaylist(selectedPlaylist, trackUri);
          showSnackbar(MESSAGES.TRACK_REMOVED_SUCCESS, 'success');
          await fetchPlaylistTracks(selectedPlaylist);
        } catch (error) {
          showSnackbar(MESSAGES.TRACK_REMOVE_ERROR, 'error');
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
        showSnackbar(MESSAGES.YOUTUBE_NAVIGATION_WARNING, 'warning');
      }
    } catch (error) {
      console.error('Failed to get YouTube video title:', error);
      showSnackbar(MESSAGES.YOUTUBE_TITLE_ERROR, 'error');
    }
  };

  if (isLoading) {
    return (
      <AppContainer>
        <LoadingContainer>
          <Title>Spotify YouTube Extension</Title>
          <CircularProgress />
          <ErrorText>Loading...</ErrorText>
        </LoadingContainer>
      </AppContainer>
    );
  }

  return (
    <AppContainer>
      {!isLoggedIn ? (
        <LoginView onSignIn={handleSignIn} />
      ) : (
        <>
          <Header>
            <Title>{profile.display_name}</Title>
            <Button variant="outlined" onClick={handleLogout}>Logout</Button>
          </Header>
          
          <YouTubeSearchButton
            variant="contained"
            color="secondary"
            onClick={handleYouTubeSearch}
            startIcon={<Search />}
          >
            Search YouTube Video
          </YouTubeSearchButton>
          
          <SearchBar 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery} 
            onSearch={handleSearch} 
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
              onTrackHover={handlePreviewPlay}
              onTrackLeave={handlePreviewStop}
              currentlyPlayingTrack={currentlyPlayingTrack}
            />
          )}

          {searchResults.length > 0 && (
            <>
              <TrackList 
                tracks={searchResults.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)} 
                onAddToPlaylist={handleAddToPlaylist}
                playlistTracks={selectedPlaylistTracks}
                onTrackHover={handlePreviewPlay}
                onTrackLeave={handlePreviewStop}
                currentlyPlayingTrack={currentlyPlayingTrack}
              />
              <Pagination 
                currentPage={currentPage}
                hasMore={(currentPage * ITEMS_PER_PAGE) < totalResults}
                onPreviousPage={handlePreviousPage}
                onNextPage={handleNextPage}
                isLoading={isSearching || isLoadingMore}
              />
            </>
          )}
        </>
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
    </AppContainer>
  );
}

export default AppContent;