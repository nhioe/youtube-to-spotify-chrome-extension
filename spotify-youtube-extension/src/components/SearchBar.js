import React from 'react';
import { TextField, IconButton } from '@mui/material';
import { Search } from 'lucide-react';
import { styled } from '@mui/system';

const SearchContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
}));

const SearchBar = ({ searchQuery, setSearchQuery, onSearch }) => {
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <SearchContainer>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search for tracks..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyPress={handleKeyPress}
      />
      <IconButton onClick={onSearch} sx={{ ml: 1 }}>
        <Search />
      </IconButton>
    </SearchContainer>
  );
};

export default SearchBar;