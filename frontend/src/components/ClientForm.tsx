import React, { useState, useEffect } from 'react';
import { Button, TextField, Box, Modal, Typography, Grid } from '@mui/material';
import { Client, ClientContact } from '../services/clientService';

interface ClientFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (clientData: Partial<Client>, id?: number) => void;
  clientToEdit: Client | null;
}

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const ClientForm: React.FC<ClientFormProps> = ({ open, onClose, onSave, clientToEdit }) => {
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [contact, setContact] = useState<Partial<ClientContact>>({ name: '', email: '', phone: '' });

  useEffect(() => {
    if (clientToEdit) {
      setName(clientToEdit.name);
      setCompanyName(clientToEdit.company_name || '');
      if (clientToEdit.contacts && clientToEdit.contacts.length > 0) {
        setContact(clientToEdit.contacts[0]);
      } else {
        setContact({ name: '', email: '', phone: '' });
      }
    } else {
      setName('');
      setCompanyName('');
      setContact({ name: '', email: '', phone: '' });
    }
  }, [clientToEdit, open]);

  const handleContactChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setContact({ ...contact, [event.target.name]: event.target.value });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const clientData: Partial<Client> = {
      name,
      company_name: companyName,
      contacts: [contact],
    };
    onSave(clientData, clientToEdit?.id);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style} component="form" onSubmit={handleSubmit}>
        <Typography variant="h6" component="h2">
          {clientToEdit ? 'Edit Client' : 'Add New Client'}
        </Typography>
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              required
              fullWidth
              id="name"
              label="Client Name"
              name="name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="company_name"
              label="Company Name"
              name="company_name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              id="contactName"
              label="Contact Name"
              name="name"
              value={contact.name}
              onChange={handleContactChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="email"
              label="Contact Email"
              name="email"
              value={contact.email}
              onChange={handleContactChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              id="phone"
              label="Contact Phone"
              name="phone"
              value={contact.phone}
              onChange={handleContactChange}
            />
          </Grid>
        </Grid>
        <Button type="submit" fullWidth variant="contained" sx={{ mt: 3 }}>
          Save Client
        </Button>
      </Box>
    </Modal>
  );
};

export default ClientForm;
