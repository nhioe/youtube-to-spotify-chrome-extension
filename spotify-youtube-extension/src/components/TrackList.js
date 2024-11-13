import React from 'react';
import { List, ListItem, ListItemAvatar, ListItemText, Avatar, IconButton, Box, Typography } from '@mui/material';
import { Plus, Check, Play, Pause } from 'lucide-react';

const TrackList = ({ tracks, onAddToPlaylist, playlistTracks, onTrackHover, onTrackLeave, currentlyPlayingTrack }) => {
  const isTrackInPlaylist = (track) => {
    return playlistTracks.some(playlistTrack => playlistTrack.uri === track.uri);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Search Results</Typography>
      <List sx={{ width: '100%', padding: 0 }}>
        {tracks.map(track => (
          <ListItem
            key={track.id}
            onMouseEnter={() => onTrackHover(track)}
            onMouseLeave={onTrackLeave}
            sx={{ 
              padding: '8px 16px',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
              '&:hover .play-pause-overlay': {
                opacity: 1,
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <ListItemAvatar sx={{ position: 'relative', minWidth: '56px' }}>
                <Avatar src={track.album.images[2]?.url} variant="square" sx={{ width: 56, height: 56 }} />
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
            </Box>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default TrackList;