import React from 'react';
import { Button, Avatar } from '@mui/material';
import { styled } from '@mui/material/styles';

const ProfileContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

const UserInfo = styled('div')({
  display: 'flex',
  alignItems: 'center',
});

const Username = styled('span')(({ theme }) => ({
  fontWeight: 'bold',
  marginRight: theme.spacing(2),
}));

const Profile = ({ profile, onLogout }) => {
  return (
    <ProfileContainer p={2} bgcolor="background.paper">
      <UserInfo>
        <Avatar
          src={profile.images[0]?.url}
          alt={profile.display_name}
          sx={{ mr: 2 }}
        />
        <Username color="text.primary">{profile.display_name}</Username>
      </UserInfo>
      <Button variant="outlined" onClick={onLogout}>
        Logout
      </Button>
    </ProfileContainer>
  );
};

export default Profile;
