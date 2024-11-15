import React, { useState, useEffect } from 'react';
import { TextField } from '@mui/material';
import BaseDialog from './BaseDialog';

const CreatePlaylistDialog = ({
  open,
  title,
  content,
  onConfirm,
  onCancel,
}) => {
  const [playlistName, setPlaylistName] = useState('');
  const [playlistDescription, setPlaylistDescription] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    setIsFormValid(playlistName.trim().length > 0);
  }, [playlistName]);

  const handleCreate = async () => {
    await onConfirm(playlistName, playlistDescription);
    handleCancel();
  };

  const handleCancel = () => {
    setPlaylistName('');
    setPlaylistDescription('');
    onCancel();
  };

  return (
    <BaseDialog
      open={open}
      title={title}
      content={content}
      onCancel={onCancel}
      actions={[
        { label: 'Cancel', onClick: handleCancel },
        {
          label: 'Create',
          onClick: handleCreate,
          color: 'primary',
          disabled: !isFormValid,
        },
      ]}
    >
      <TextField
        autoFocus
        margin="dense"
        label="Playlist Name"
        type="text"
        fullWidth
        value={playlistName}
        onChange={(e) => setPlaylistName(e.target.value)}
      />
      <TextField
        margin="dense"
        label="Playlist Description"
        type="text"
        fullWidth
        value={playlistDescription}
        onChange={(e) => setPlaylistDescription(e.target.value)}
      />
    </BaseDialog>
  );
};

export default CreatePlaylistDialog;
