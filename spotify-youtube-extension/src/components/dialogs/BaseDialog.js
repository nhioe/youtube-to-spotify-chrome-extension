import React from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
} from '@mui/material';

const BaseDialog = ({ open, title, content, children, onCancel, actions }) => {
  return (
    <Dialog open={open} onClose={onCancel} aria-hidden={!open}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {content && <div>{content}</div>}
        {children}
      </DialogContent>
      <DialogActions>
        {actions.map(({ label, onClick, color, disabled }, index) => (
          <Button
            key={index}
            onClick={onClick}
            color={color || 'default'}
            disabled={disabled}
          >
            {label}
          </Button>
        ))}
      </DialogActions>
    </Dialog>
  );
};

export default BaseDialog;
