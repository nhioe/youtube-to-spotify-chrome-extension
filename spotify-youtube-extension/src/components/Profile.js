import React from 'react';
import { User } from 'lucide-react';

const Profile = ({ profile, onLogout }) => (
  <div className="profile">
    {
      profile.images.length != 0 ? (
        <img src={profile.images[0].url} alt="Profile" className="profile-image" />
      ) : (
        <User className="profile-image"/>
      )
    }
    <h2 className="profile-name">Welcome, {profile.display_name}!</h2>
    <button onClick={onLogout} className="btn btn-logout">Logout</button>
  </div>
);

export default Profile;