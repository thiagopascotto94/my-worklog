import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Button, CircularProgress, Snackbar, Alert, Tabs, Tab } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import ClientForm from '../components/ClientForm';
import ClientReportsPage from './ClientReportsPage';
import * as clientService from '../services/clientService';
import { Client } from '../services/clientService';

const ClientEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentTab, setCurrentTab] = useState(0);

  useEffect(() => {
    const fetchClient = async () => {
      setLoading(true);
      try {
        const response = await clientService.getClientById(Number(id));
        setClient(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch client data.');
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchClient();
    }
  }, [id]);

  const handleSave = async (clientData: Partial<Client>) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      if (id) {
        await clientService.updateClient(Number(id), clientData);
        setSuccess('Client updated successfully!');
        setTimeout(() => navigate('/clients'), 2000); // Redirect after 2 seconds
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update client.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {client ? `Edit Client: ${client.name}` : 'Edit Client'}
        </Typography>
        <Button variant="outlined" onClick={() => navigate('/clients')}>
          Back to Clients List
        </Button>
      </Box>

      {loading && !client && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && client && (
        <>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={currentTab} onChange={handleTabChange} aria-label="client details tabs">
              <Tab label="Client Details" />
              <Tab label="Reports" />
            </Tabs>
          </Box>

          {currentTab === 0 && (
            <ClientForm onSave={handleSave} clientToEdit={client} isSaving={loading} />
          )}

          {currentTab === 1 && (
            <ClientReportsPage clientId={client.id} />
          )}
        </>
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

export default ClientEditPage;
