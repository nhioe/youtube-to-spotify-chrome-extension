import React from 'react';
import BaseDialog from './BaseDialog';

const ConfirmationDialog = ({ open, title, content, onConfirm, onCancel }) => {
  return (
    <BaseDialog
      open={open}
      title={title}
      content={content}
      onCancel={onCancel}
      actions={[
        { label: 'Cancel', onClick: onCancel },
        { label: 'Confirm', onClick: onConfirm, color: 'primary' },
      ]}
    />
  );
};

export default ConfirmationDialog;
