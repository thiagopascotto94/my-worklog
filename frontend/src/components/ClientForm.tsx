import React, { useState, useEffect } from 'react';
import { Button, TextField, Box, Modal, Typography } from '@mui/material';
import { Client } from '../services/clientService';

interface ClientFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (name: string, id?: number) => void;
  clientToEdit: Client | null;
}

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const ClientForm: React.FC<ClientFormProps> = ({ open, onClose, onSave, clientToEdit }) => {
  const [name, setName] = useState('');

  useEffect(() => {
    if (clientToEdit) {
      setName(clientToEdit.name);
    } else {
      setName('');
    }
  }, [clientToEdit, open]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSave(name, clientToEdit?.id);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style} component="form" onSubmit={handleSubmit}>
        <Typography variant="h6" component="h2">
          {clientToEdit ? 'Edit Client' : 'Add New Client'}
        </Typography>
        <TextField
          margin="normal"
          required
          fullWidth
          id="name"
          label="Client Name"
          name="name"
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }}>
          Save Client
        </Button>
      </Box>
    </Modal>
  );
};

export default ClientForm;
