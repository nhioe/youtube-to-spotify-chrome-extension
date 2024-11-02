import React from 'react';
import { List, ListItem, ListItemAvatar, ListItemText, Avatar, IconButton, Typography } from '@mui/material';
import { Plus, Check } from 'lucide-react';

const TrackList = ({ tracks, onAddToPlaylist, playlistTracks }) => {
  const isTrackInPlaylist = (track) => {
    return playlistTracks.some(playlistTrack => playlistTrack.uri === track.uri);
  };

  return (
    <List>
      {tracks.map(track => (
        <ListItem
          key={track.id}
          secondaryAction={
            <IconButton
              edge="end"
              onClick={() => onAddToPlaylist(track.uri)}
              color={isTrackInPlaylist(track) ? "success" : "primary"}
            >
              {isTrackInPlaylist(track) ? <Check /> : <Plus />}
            </IconButton>
          }
        >
          <ListItemAvatar>
            <Avatar src={track.album.images[2]?.url} variant="square" />
          </ListItemAvatar>
          <ListItemText
            primary={
              <Typography noWrap>
                {track.name}
              </Typography>
            }
            secondary={
              <Typography noWrap variant="body2">
                {track.artists[0].name}
              </Typography>
            }
          />
        </ListItem>
      ))}
    </List>
  );
};

export default TrackList;