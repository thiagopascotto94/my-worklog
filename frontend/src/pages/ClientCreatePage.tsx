import React, { useState } from 'react';
import { Container, Typography, Box, Button, CircularProgress, Snackbar, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ClientForm from '../components/ClientForm';
import * as clientService from '../services/clientService';
import { Client } from '../services/clientService';

const ClientCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSave = async (clientData: Partial<Client>) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await clientService.createClient(clientData);
      setSuccess('Client created successfully!');
      setTimeout(() => navigate('/clients'), 2000); // Redirect after 2 seconds
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create client.');
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create New Client
        </Typography>
        <Button variant="outlined" onClick={() => navigate('/clients')}>
          Back to Clients List
        </Button>
      </Box>

      <ClientForm onSave={handleSave} clientToEdit={null} isSaving={loading} />

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <CircularProgress />
        </Box>
      )}

      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
        <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar open={!!success} autoHideDuration={6000} onClose={() => setSuccess('')}>
        <Alert onClose={() => setSuccess('')} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ClientCreatePage;
