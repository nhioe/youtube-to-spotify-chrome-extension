import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { styled } from '@mui/system';

const PaginationContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: theme.spacing(2),
}));

const Pagination = ({ currentPage, hasMore,   onPreviousPage, onNextPage, isLoading }) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
      <Button onClick={onPreviousPage} disabled={currentPage === 1 || isLoading}>
        Previous
      </Button>
      <Typography>Page {currentPage}</Typography>
      <Button onClick={onNextPage} disabled={!hasMore || isLoading}>
        Next
      </Button>
    </Box>
  );
};

export default Pagination;