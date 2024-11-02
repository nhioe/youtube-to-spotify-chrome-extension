import React from 'react';
import { Button, Avatar } from '@mui/material';
import { styled } from '@mui/material/styles';

const ProfileContainer = styled('div')`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const UserInfo = styled('div')`
  display: flex;
  align-items: center;
`;

const Username = styled('span')`
  font-weight: bold;
`;

const Profile = ({ profile, onLogout }) => {
  return (
    <ProfileContainer p={2} bgcolor="background.paper">
      <UserInfo>
        <Avatar src={profile.images[0]?.url} alt={profile.display_name} sx={{ mr: 2 }} />
        <Username color="text.primary" sx={{ mr: 2 }}>{profile.display_name}</Username>
      </UserInfo>
      <Button variant="outlined" onClick={onLogout}>
        Logout
      </Button>
    </ProfileContainer>
  );
};

export default Profile;
