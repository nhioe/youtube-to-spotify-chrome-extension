import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Plus } from 'lucide-react';

const InputContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
}));

const PlaylistButton = styled(IconButton)(({ theme }) => ({
  marginLeft: theme.spacing(1),
}));

const PlaylistSelector = ({
  playlists,
  selectedPlaylist,
  setSelectedPlaylist,
  createPlaylist,
}) => (
  <InputContainer>
    <FormControl fullWidth>
      <InputLabel id="playlist-select-label">Select a playlist</InputLabel>
      <Select
        labelId="playlist-select-label"
        value={selectedPlaylist}
        onChange={(e) => setSelectedPlaylist(e.target.value)}
        label="Select a playlist"
      >
        <MenuItem value=""></MenuItem>
        {playlists.map((playlist) => (
          <MenuItem key={playlist.id} value={playlist.id}>
            {playlist.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
    <PlaylistButton onClick={createPlaylist}>
      <Plus />
    </PlaylistButton>
  </InputContainer>
);

export default PlaylistSelector;
