import React from 'react';
import { Typography, List, ListItem, ListItemAvatar, ListItemText, Avatar, IconButton, Box } from '@mui/material';
import { X } from 'lucide-react';
import { styled } from '@mui/system';

const HorizontalList = styled(List)({
  display: 'flex',
  flexDirection: 'row',
  padding: 0,
  overflowX: 'auto',
  '& > *': {
    flex: '0 0 auto',
  },
});

const PlaylistPreview = ({ tracks, onRemoveTrack }) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>Current Playlist</Typography>
      <HorizontalList>
        {tracks.map(track => (
          <ListItem
            key={track.id}
            sx={{ width: 'auto', flexDirection: 'column', alignItems: 'center', mr: 2 }}
          >
            <ListItemAvatar>
              <Avatar src={track.album.images[2]?.url} variant="square" sx={{ width: 64, height: 64 }} />
            </ListItemAvatar>
            <ListItemText
              primary={track.name}
              secondary={track.artists[0].name}
              primaryTypographyProps={{ noWrap: true, variant: 'body2' }}
              secondaryTypographyProps={{ noWrap: true, variant: 'caption' }}
              sx={{ width: 100, textAlign: 'center' }}
            />
            <IconButton edge="end" onClick={() => onRemoveTrack(track.uri)} size="small">
              <X />
            </IconButton>
          </ListItem>
        ))}
      </HorizontalList>
    </Box>
  );
};

export default PlaylistPreview;