import React from 'react';
import { List, ListItem, ListItemAvatar, ListItemText, Avatar, IconButton, Box, Typography } from '@mui/material';
import { Plus, Check, Play, Pause } from 'lucide-react';
import { styled } from '@mui/material/styles';

const TrackListContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:hover .play-pause-overlay': {
    opacity: 1,
  },
}));

const ListItemContent = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
});

const TrackAvatar = styled(Avatar)({
  width: 56,
  height: 56,
  position: 'relative',
});

const PlayPauseOverlay = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(0, 0, 0, 0.5)',
  opacity: 0,
  transition: 'opacity 0.2s',
});

const TrackList = ({ tracks, onAddToPlaylist, playlistTracks, onTrackHover, onTrackLeave, currentlyPlayingTrack }) => {
  const isTrackInPlaylist = (track) => {
    return playlistTracks.some(playlistTrack => playlistTrack.uri === track.uri);
  };

  return (
    <TrackListContainer>
      <Typography variant="h6" gutterBottom>Search Results</Typography>
      <List sx={{ width: '100%', padding: 0 }}>
        {tracks.map(track => (
          <StyledListItem
            key={track.id}
            onMouseEnter={() => onTrackHover(track)}
            onMouseLeave={onTrackLeave}
          >
            <ListItemContent>
              <ListItemAvatar sx={{ position: 'relative', minWidth: '56px' }}>
                <TrackAvatar src={track.album.images[2]?.url} variant="square" />
                {track.preview_url && (
                  <PlayPauseOverlay className="play-pause-overlay">
                    {currentlyPlayingTrack?.id === track.id ? (
                      <Pause color="white" size={24} />
                    ) : (
                      <Play color="white" size={24} />
                    )}
                  </PlayPauseOverlay>
                )}
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography noWrap>
                    {track.name}
                  </Typography>
                }
                secondary={
                  <Typography noWrap sx={{ color: 'text.secondary' }}>
                    {track.artists[0].name}
                  </Typography>
                }
                sx={{ marginLeft: 2, marginRight: 2, flex: 1, minWidth: 0 }}
              />
              <IconButton
                edge="end"
                onClick={() => onAddToPlaylist(track.uri)}
                color={isTrackInPlaylist(track) ? "success" : "primary"}
                sx={{ marginLeft: 'auto' }}
              >
                {isTrackInPlaylist(track) ? <Check /> : <Plus />}
              </IconButton>
            </ListItemContent>
          </StyledListItem>
        ))}
      </List>
    </TrackListContainer>
  );
};

export default TrackList;