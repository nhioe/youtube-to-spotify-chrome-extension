import { styled } from '@mui/system';
import { unstable_styleFunctionSx } from '@mui/system';
import { Box, Typography } from '@mui/material';

export const Div = styled('div')(unstable_styleFunctionSx);

export const AppContainer = styled(Box)(({ theme }) => ({
  width: '400px',
  height: '600px',
  overflowY: 'auto',
  padding: theme.spacing(2),
  boxSizing: 'border-box',
  '&::-webkit-scrollbar': {
    width: '10px',
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

export const Title = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main,
  fontSize: '24px',
  marginBottom: theme.spacing(2),
}));

export const ErrorText = styled(Typography)(({ theme }) => ({
  color: theme.palette.error.main,
  marginBottom: theme.spacing(1),
}));