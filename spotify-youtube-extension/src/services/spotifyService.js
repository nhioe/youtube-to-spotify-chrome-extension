import SpotifyAPI from '../utils/spotifyAPI';

export const fetchProfile = () => SpotifyAPI.fetchProfile();
export const fetchPlaylists = () => SpotifyAPI.getUserPlaylists();
export const fetchPlaylistTracks = (playlistId) => SpotifyAPI.getPlaylistTracks(playlistId);
export const searchTracks = (query, limit, offset) => SpotifyAPI.searchTracks(query, limit, offset);
export const addTrackToPlaylist = (playlistId, trackUri) => SpotifyAPI.addTrackToPlaylist(playlistId, trackUri);
export const removeTrackFromPlaylist = (playlistId, trackUri) => SpotifyAPI.removeTrackFromPlaylist(playlistId, trackUri);