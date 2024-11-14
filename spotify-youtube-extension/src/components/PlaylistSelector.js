import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const PlaylistSelector = ({ playlists, selectedPlaylist, setSelectedPlaylist }) => (
  <StyledFormControl fullWidth>
    <InputLabel id="playlist-select-label">Select a playlist</InputLabel>
    <Select
      labelId="playlist-select-label"
      value={selectedPlaylist}
      onChange={(e) => setSelectedPlaylist(e.target.value)}
      label="Select a playlist"
    >
      <MenuItem value="">
      </MenuItem>
      {playlists.map(playlist => (
        <MenuItem key={playlist.id} value={playlist.id}>{playlist.name}</MenuItem>
      ))}
    </Select>
  </StyledFormControl>
);

export default PlaylistSelector;