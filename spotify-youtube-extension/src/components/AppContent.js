/*global chrome*/
import React, { useState, useEffect } from 'react';
import { CircularProgress, Button, Avatar } from '@mui/material';
import { Search } from 'lucide-react';
import { styled } from '@mui/material/styles';
import { useAudio } from '../hooks/useAudio';
import { useSnackbar } from '../contexts/SnackbarContext';
import SpotifyAPI from '../api/spotifyAPI';
import { ITEMS_PER_PAGE, ITEMS_TO_PRELOAD } from '../constants/values';
import { MESSAGES, DIALOG_TITLES } from '../constants/messages';
import LoginView from './LoginView';
import SearchBar from './search/SearchBar';
import TrackList from './search/TrackList';
import Pagination from './search/Pagination';
import PlaylistSelector from './playlist/PlaylistSelector';
import PlaylistPreview from './playlist/PlaylistPreview';
import ConfirmationDialog from './dialogs/ConfirmationDialog';
import CreatePlaylistDialog from './dialogs/CreatePlaylistDialog';
import { startAuthFlow } from '../api/spotifyAuth';

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

const ProfileAvatar = styled(Avatar)({
  width: 60,
  height: 60,
});

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

const TranslucentLoading = styled('div')({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 9999,
});

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
  const [isUpdatingPlaylist, setIsUpdatingPlaylist] = useState(false);

  // search results
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [isLoadingSearch, setisLoadingSearch] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const [confirmationDialog, setConfirmationDialog] = useState({
    open: false,
    title: '',
    content: '',
    onConfirm: null,
  });

  const [createPlaylistDialog, setCreatePlaylistDialog] = useState({
    open: false,
    title: '',
    content: '',
    onConfirm: null,
  });

  const { currentlyPlayingTrack, handlePreviewPlay, handlePreviewStop } =
    useAudio();

  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    checkLoginStatus();
  }, []);

  // Pull current playlist
  useEffect(() => {
    if (selectedPlaylist) {
      fetchPlaylistTracks(selectedPlaylist);
    }
  }, [selectedPlaylist]);

  /* LOGIN ACTIONS */

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

  /* FETCH DATA */

  const fetchProfile = async () => {
    try {
      const data = await SpotifyAPI.fetchProfile();
      setProfile(data);
    } catch (error) {
      showSnackbar(MESSAGES.PROFILE_FETCH_ERROR, 'error');
      setIsLoggedIn(false);
    }
  };

  const fetchPlaylists = async () => {
    try {
      const data = await SpotifyAPI.getUserPlaylists();
      setPlaylists(data.items);
    } catch (error) {
      showSnackbar(MESSAGES.PLAYLISTS_FETCH_ERROR, 'error');
    }
  };

  const fetchPlaylistTracks = async (playlistId) => {
    try {
      const data = await SpotifyAPI.getPlaylistTracks(playlistId);
      setSelectedPlaylistTracks(data.items.map((item) => item.track));
    } catch (error) {
      showSnackbar(MESSAGES.PLAYLIST_TRACKS_FETCH_ERROR, 'error');
    }
  };

  /* SEARCH */

  const handleSearch = async (query = searchQuery) => {
    if (!query.trim()) return;
    try {
      setIsSearching(true);
      const data = await SpotifyAPI.searchTracks(query, ITEMS_TO_PRELOAD, 0);
      setSearchResults(data.tracks.items);
      setTotalResults(data.tracks.total);
      setCurrentPage(1);
    } catch (error) {
      showSnackbar(MESSAGES.SEARCH_ERROR, 'error');
    } finally {
      setIsSearching(false);
    }
  };

  const handleYouTubeSearch = async () => {
    try {
      // Get the active tab from the current window
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (tab.url && tab.url.includes('youtube.com/watch')) {
        const extractYouTubeVideoInfo = () => {
          const videoTitle = document.title.replace(' - YouTube', '');
          const videoId = window.location.pathname.split('/')[2];

          const videoContainer = document.querySelector('#owner');
          const possibleArtists = videoContainer.querySelectorAll('#text');
          const artist =
            Array.from(possibleArtists)
              .filter((element) =>
                element.querySelector('a.yt-formatted-string'),
              )
              .map((element) =>
                element
                  .querySelector('a.yt-formatted-string')
                  .textContent.trim(),
              )[0] || '';

          const videoData = {
            title: videoTitle,
            videoId: videoId,
            artist: artist,
          };

          return videoData;
        };

        chrome.scripting
          .executeScript({
            target: { tabId: tab.id },
            func: extractYouTubeVideoInfo,
          })
          .then(async (videoData) => {
            const v1 = videoData[0].result;
            const query = v1.title + ' ' + v1.artist;
            setSearchQuery(query);
            await handleSearch(query);
          });
      } else {
        showSnackbar(MESSAGES.YOUTUBE_NAVIGATION_WARNING, 'warning');
      }
    } catch (error) {
      showSnackbar(MESSAGES.YOUTUBE_TITLE_ERROR, 'error');
    }
  };

  /* NAV */

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const handleNextPage = async () => {
    const nextPage = currentPage + 1;
    const itemsNeeded = nextPage * ITEMS_PER_PAGE;

    if (
      itemsNeeded > searchResults.length &&
      searchResults.length < totalResults
    ) {
      try {
        setisLoadingSearch(true);
        const data = await SpotifyAPI.searchTracks(
          searchQuery,
          ITEMS_TO_PRELOAD,
          searchResults.length,
        );
        setSearchResults((prevResults) => [
          ...prevResults,
          ...data.tracks.items,
        ]);
      } catch (error) {
        showSnackbar(MESSAGES.LOAD_MORE_ERROR, 'error');
      } finally {
        setisLoadingSearch(false);
      }
    }

    setCurrentPage(nextPage);
  };

  /* PLAYLIST ACTIONS */

  const handleAddToPlaylist = async (trackUri) => {
    if (!selectedPlaylist) {
      showSnackbar(MESSAGES.SELECT_PLAYLIST_WARNING, 'warning');
      return;
    }

    const isTrackInPlaylist = selectedPlaylistTracks.some(
      (track) => track.uri === trackUri,
    );

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
      setIsUpdatingPlaylist(true);
      await SpotifyAPI.addTrackToPlaylist(selectedPlaylist, trackUri);
      showSnackbar(MESSAGES.TRACK_ADDED_SUCCESS, 'success');
      await fetchPlaylistTracks(selectedPlaylist);
    } catch (error) {
      showSnackbar(MESSAGES.TRACK_ADD_ERROR, 'error');
    } finally {
      setIsUpdatingPlaylist(false);
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
          setIsUpdatingPlaylist(true);
          await SpotifyAPI.removeTrackFromPlaylist(selectedPlaylist, trackUri);
          showSnackbar(MESSAGES.TRACK_REMOVED_SUCCESS, 'success');
          await fetchPlaylistTracks(selectedPlaylist);
        } catch (error) {
          showSnackbar(MESSAGES.TRACK_REMOVE_ERROR, 'error');
        } finally {
          setIsUpdatingPlaylist(false);
        }
      },
    });
  };

  const handleCreatePlaylist = async () => {
    setCreatePlaylistDialog({
      open: true,
      title: DIALOG_TITLES.CREATE_PLAYLIST,
      content: '',
      onConfirm: async (playlistName, playlistDescription) => {
        await createPlaylist(playlistName, playlistDescription);
      },
    });
  };

  const createPlaylist = async (playlistName, playlistDescription) => {
    try {
      setIsUpdatingPlaylist(true);
      const data = await SpotifyAPI.createPlaylist(
        playlistName,
        playlistDescription,
      );
      showSnackbar(MESSAGES.PLAYLIST_CREATED_SUCCESS, 'success');
      await fetchPlaylists(); // refetch playlists
      setSelectedPlaylist(data.id);
    } catch (error) {
      showSnackbar(MESSAGES.PLAYLIST_CREATED_ERROR, 'error');
    } finally {
      setIsUpdatingPlaylist(false);
    }
  };

  // Loading Progress
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
            <Title>
              <ProfileAvatar
                src={profile.images[0]?.url}
                alt={profile.display_name}
              />
              Welcome, {profile.display_name}
            </Title>
            <Button variant="outlined" onClick={handleLogout}>
              Logout
            </Button>
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
            createPlaylist={handleCreatePlaylist}
          />

          {
            // display selected playlist
            selectedPlaylist && (
              <PlaylistPreview
                tracks={selectedPlaylistTracks}
                onRemoveTrack={handleRemoveFromPlaylist}
                onTrackHover={handlePreviewPlay}
                onTrackLeave={handlePreviewStop}
                currentlyPlayingTrack={currentlyPlayingTrack}
              />
            )
          }

          {
            // display search results
            searchResults.length > 0 && (
              <>
                <TrackList
                  tracks={searchResults.slice(
                    (currentPage - 1) * ITEMS_PER_PAGE,
                    currentPage * ITEMS_PER_PAGE,
                  )}
                  onAddToPlaylist={handleAddToPlaylist}
                  playlistTracks={selectedPlaylistTracks}
                  onTrackHover={handlePreviewPlay}
                  onTrackLeave={handlePreviewStop}
                  currentlyPlayingTrack={currentlyPlayingTrack}
                />
                <Pagination
                  currentPage={currentPage}
                  hasMore={currentPage * ITEMS_PER_PAGE < totalResults}
                  onPreviousPage={handlePreviousPage}
                  onNextPage={handleNextPage}
                  isLoading={isSearching || isLoadingSearch}
                />
              </>
            )
          }
        </>
      )}

      <ConfirmationDialog
        open={confirmationDialog.open}
        title={confirmationDialog.title}
        content={confirmationDialog.content}
        onConfirm={() => {
          confirmationDialog.onConfirm();
          setConfirmationDialog({
            ...confirmationDialog,
            open: false,
          });
        }}
        onCancel={() =>
          setConfirmationDialog({
            ...confirmationDialog,
            open: false,
          })
        }
      />
      <CreatePlaylistDialog
        open={createPlaylistDialog.open}
        onConfirm={(playlistName, playlistDescription) => {
          createPlaylistDialog.onConfirm(playlistName, playlistDescription);
          setCreatePlaylistDialog({
            ...createPlaylistDialog,
            open: false,
          });
        }}
        onCancel={() =>
          setCreatePlaylistDialog({
            ...createPlaylistDialog,
            open: false,
          })
        }
      />
      {
        // loading for actions
        (isUpdatingPlaylist || isLoadingSearch) && (
          <TranslucentLoading>
            <CircularProgress />
          </TranslucentLoading>
        )
      }
    </AppContainer>
  );
};

export default AppContent;
