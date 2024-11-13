import React from 'react';
import { Typography, List, ListItem, ListItemAvatar, ListItemText, Avatar, IconButton, Box } from '@mui/material';
import { X, Play, Pause } from 'lucide-react';
import { styled } from '@mui/system';

const HorizontalList = styled(List)({
  display: 'flex',
  flexDirection: 'row',
  overflowX: 'auto',
});

const PlaylistPreview = ({ tracks, onRemoveTrack, onTrackHover, onTrackLeave, currentlyPlayingTrack }) => {
  return (
    <Box sx={{ paddingLeft: '16px', paddingRight: '16px' }}>
      <Typography variant="h6" gutterBottom>Current Playlist</Typography>
      <HorizontalList>
        {tracks.map(track => (
          <ListItem
            key={track.id}
            sx={{ 
              width: 'auto', 
              flexDirection: 'column', 
              alignItems: 'center', 
              mr: 2,
              cursor: 'default',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
              '&:hover .play-pause-overlay': {
                opacity: 1,
              },
              padding: '8px',
              borderRadius: '4px',
            }}
            onMouseEnter={() => onTrackHover(track)}
            onMouseLeave={onTrackLeave}
          >
            <ListItemAvatar sx={{ position: 'relative' }}>
              <Avatar src={track.album.images[2]?.url} variant="square" sx={{ width: 64, height: 64 }} />
              {track.preview_url && (
                <Box 
                  className="play-pause-overlay"
                  sx={{
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
                  }}
                >
                  {currentlyPlayingTrack?.id === track.id ? (
                    <Pause color="white" size={24} />
                  ) : (
                    <Play color="white" size={24} />
                  )}
                </Box>
              )}
            </ListItemAvatar>
            <ListItemText
              primary={track.name}
              secondary={track.artists[0].name}
              primaryTypographyProps={{ noWrap: true, variant: 'body2' }}
              secondaryTypographyProps={{ noWrap: true, variant: 'caption' }}
              sx={{ width: 100, textAlign: 'center' }}
            />
            <IconButton 
              edge="end" 
              onClick={() => onRemoveTrack(track.uri)}
              size="small"
            >
              <X />
            </IconButton>
          </ListItem>
        ))}
      </HorizontalList>
    </Box>
  );
};

export default PlaylistPreview;