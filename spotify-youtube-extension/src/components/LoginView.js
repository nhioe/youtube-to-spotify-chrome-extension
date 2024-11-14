import React from 'react';
import { Button } from '@mui/material';
import { Music } from 'lucide-react';
import { styled } from '@mui/material/styles';

const LoginContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
});

const Title = styled('h1')(({ theme }) => ({
  color: theme.palette.primary.main,
  fontSize: '24px',
  marginBottom: theme.spacing(2),
}));

const LoginButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(1),
}));

const LoginView = ({ onSignIn }) => (
  <LoginContainer>
    <Title>Spotify YouTube Extension</Title>
    <LoginButton
      variant="contained"
      color="primary"
      onClick={onSignIn}
      startIcon={<Music />}
    >
      Sign in with Spotify
    </LoginButton>
  </LoginContainer>
);

export default LoginView;
