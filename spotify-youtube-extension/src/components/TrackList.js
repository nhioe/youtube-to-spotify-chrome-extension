import React from 'react';
import { Plus, Check } from 'lucide-react';

const TrackList = ({ tracks, onAddToPlaylist, playlistTracks }) => {
  const isTrackInPlaylist = (track) => {
    return playlistTracks.some(playlistTrack => playlistTrack.uri === track.uri);
  };

  return (
    <div className="track-list">
      {tracks.map(track => (
        <div key={track.id} className="track-item">
          <img src={track.album.images[2]?.url} alt={track.name} className="track-image" />
          <div className="track-info">
            <div className="track-name">{track.name}</div>
            <div className="track-artist">{track.artists[0].name}</div>
          </div>
          <button 
            onClick={() => onAddToPlaylist(track.uri)} 
            className={`btn btn-add ${isTrackInPlaylist(track) ? 'btn-added' : ''}`}
          >
            {isTrackInPlaylist(track) ? <Check size={16} /> : <Plus size={16} />}
          </button>
        </div>
      ))}
    </div>
  );
};

export default TrackList;