import React from 'react';

const PlaylistSelector = ({ playlists, selectedPlaylist, setSelectedPlaylist }) => (
  <div className="playlist-selector">
    <select 
      value={selectedPlaylist} 
      onChange={(e) => setSelectedPlaylist(e.target.value)}
      className="playlist-select"
    >
      <option value="">Select a playlist</option>
      {playlists.map(playlist => (
        <option key={playlist.id} value={playlist.id}>{playlist.name}</option>
      ))}
    </select>
  </div>
);

export default PlaylistSelector;