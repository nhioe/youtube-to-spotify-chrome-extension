import React from 'react';
import { Button, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const PaginationContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: theme.spacing(2),
}));

const Pagination = ({ currentPage, hasMore, onPreviousPage, onNextPage, isLoading }) => {
  return (
    <PaginationContainer>
      <Button onClick={onPreviousPage} disabled={currentPage === 1 || isLoading}>
        Previous
      </Button>
      <Typography>Page {currentPage}</Typography>
      <Button onClick={onNextPage} disabled={!hasMore || isLoading}>
        Next
      </Button>
    </PaginationContainer>
  );
};

export default Pagination;