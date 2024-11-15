import { useState, useEffect, useRef } from 'react';
import { PREVIEW_DELAY } from '../constants/values';
import { useSnackbar } from './SnackbarContext';

export const useAudio = () => {
  const { showSnackbar } = useSnackbar();
  const [audio] = useState(new Audio());
  const [currentlyPlayingTrack, setCurrentlyPlayingTrack] = useState(null);
  const hoverTimeoutRef = useRef(null);

  const handlePreviewPlay = (track) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    // Delay
    hoverTimeoutRef.current = setTimeout(() => {
      if (track.preview_url) {
        audio.src = track.preview_url;
        audio.play();
        setCurrentlyPlayingTrack(track);
        showSnackbar(`Now playing preview: ${track.name}`, 'info');
      } else {
        showSnackbar(`No preview available for: ${track.name}`, 'warning');
      }
    }, PREVIEW_DELAY);
  };

  const handlePreviewStop = () => {
    clearTimeout(hoverTimeoutRef.current);
    audio.pause();
    setCurrentlyPlayingTrack(null);
  };

  useEffect(() => {
    return () => {
      clearTimeout(hoverTimeoutRef.current);
      audio.pause();
    };
  }, [audio]);

  return {
    currentlyPlayingTrack,
    handlePreviewPlay,
    handlePreviewStop,
  };
};
