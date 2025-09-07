import React, { useCallback, useEffect, useState } from 'react';
import {
  Container, Typography, Button, Box,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Alert
} from '@mui/material';
import * as clientService from '../services/clientService';
import { Client } from '../services/clientService';
import ClientForm from '../components/ClientForm';

const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await clientService.getClients();
      setClients(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch clients.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleOpenModal = (client: Client | null = null) => {
    setClientToEdit(client);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setClientToEdit(null);
    setIsModalOpen(false);
  };

  const handleSave = async (name: string, id?: number) => {
    try {
      if (id) {
        await clientService.updateClient(id, name);
      } else {
        await clientService.createClient(name);
      }
      handleCloseModal();
      fetchClients(); // Refetch clients after saving
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save client.');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      if (window.confirm('Are you sure you want to delete this client?')) {
        await clientService.deleteClient(id);
        fetchClients(); // Refetch clients after deleting
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete client.');
    }
  };

  return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4, mb: 2 }}>
        <Typography variant="h4">
          My Clients
        </Typography>
        <Button variant="contained" onClick={() => handleOpenModal()}>
          Add New Client
        </Button>
      </Box>

      {loading && <CircularProgress />}
      {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}
      {!loading && !error && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>{client.name}</TableCell>
                  <TableCell>{new Date(client.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button size="small" sx={{ mr: 1 }} onClick={() => handleOpenModal(client)}>Edit</Button>
                    <Button size="small" color="error" onClick={() => handleDelete(client.id)}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <ClientForm
        open={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        clientToEdit={clientToEdit}
      />
    </Container>
  );
};

export default ClientsPage;
