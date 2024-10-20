import React from 'react';
import { X } from 'lucide-react';

const PlaylistPreview = ({ tracks, onRemoveTrack }) => {
  return (
    <div className="playlist-preview">
      <h3>Current Playlist</h3>
      <div className="playlist-tracks">
        {tracks.map(track => (
          <div key={track.id} className="playlist-track-item">
            <img src={track.album.images[2]?.url} alt={track.name} className="playlist-track-image" />
            <div className="playlist-track-info">
              <div className="playlist-track-name">{track.name}</div>
              <div className="playlist-track-artist">{track.artists[0].name}</div>
            </div>
            <button 
              onClick={() => {
                console.log("Removing track:", track.name, "URI:", track.uri); // Add this line for debugging
                onRemoveTrack(track.uri);
              }} 
              className="btn btn-remove"
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlaylistPreview;