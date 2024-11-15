import React from 'react';
import {
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton,
  Box,
} from '@mui/material';
import { X, Play, Pause } from 'lucide-react';
import { styled } from '@mui/material/styles';

const PreviewContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const HorizontalList = styled(List)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  overflowX: 'auto',
  '&::-webkit-scrollbar': {
    height: '10px',
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

const TrackItem = styled(ListItem)(({ theme }) => ({
  width: 'auto',
  flexDirection: 'column',
  alignItems: 'center',
  marginRight: theme.spacing(2),
  cursor: 'default',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:hover .play-pause-overlay': {
    opacity: 1,
  },
  padding: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
}));

const TrackAvatar = styled(Avatar)({
  width: 64,
  height: 64,
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

const TrackText = styled(ListItemText)({
  width: 100,
  textAlign: 'center',
});

const PlaceholderText = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  textAlign: 'center',
  marginTop: theme.spacing(2),
}));

const PlaylistPreview = ({
  tracks,
  onRemoveTrack,
  onTrackHover,
  onTrackLeave,
  currentlyPlayingTrack,
}) => {
  return (
    <PreviewContainer>
      <Typography variant="h6" gutterBottom>
        Current Playlist
      </Typography>
      {tracks.length === 0 ? (
        <PlaceholderText variant="body2">
          No tracks found. Add some tracks to get started!
        </PlaceholderText>
      ) : (
        <HorizontalList>
          {tracks.map((track) => (
            <TrackItem
              key={track.id}
              onMouseEnter={() => onTrackHover(track)}
              onMouseLeave={onTrackLeave}
            >
              <ListItemAvatar sx={{ position: 'relative' }}>
                <TrackAvatar
                  src={track.album.images[2]?.url}
                  variant="square"
                />
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
              <TrackText
                primary={track.name}
                secondary={track.artists[0].name}
                primaryTypographyProps={{
                  noWrap: true,
                  variant: 'body2',
                }}
                secondaryTypographyProps={{
                  noWrap: true,
                  variant: 'caption',
                }}
              />
              <IconButton
                edge="end"
                onClick={() => onRemoveTrack(track.uri)}
                size="small"
              >
                <X />
              </IconButton>
            </TrackItem>
          ))}
        </HorizontalList>
      )}
    </PreviewContainer>
  );
};

export default PlaylistPreview;
