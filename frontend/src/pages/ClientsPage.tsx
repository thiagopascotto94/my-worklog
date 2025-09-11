import React, { useCallback, useEffect, useState } from 'react';
import {
  Container, Typography, Button, Box,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Alert,
  TextField, Pagination
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import * as clientService from '../services/clientService';
import { Client } from '../services/clientService';

const ClientsPage: React.FC = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchValue, setSearchValue] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await clientService.getClients({ search: submittedSearch, page, limit: 10 });
      setClients(data.clients);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch clients.');
    } finally {
      setLoading(false);
    }
  }, [submittedSearch, page]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

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

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
  };

  const handleSearchSubmit = () => {
    setPage(1);
    setSubmittedSearch(searchValue);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4, mb: 2 }}>
        <Typography variant="h4">
          My Clients
        </Typography>
        <Button variant="contained" onClick={() => navigate('/clients/new')}>
          Add New Client
        </Button>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, gap: 1 }}>
        <TextField
          label="Search by Name, CNPJ, or City"
          variant="outlined"
          value={searchValue}
          onChange={handleSearchChange}
          sx={{ width: '300px' }}
        />
        <Button variant="contained" onClick={handleSearchSubmit}>Search</Button>
      </Box>

      {loading && <CircularProgress />}
      {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}

      {!loading && !error && clients.length > 0 && (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>CNPJ</TableCell>
                  <TableCell>City</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>{client.name}</TableCell>
                    <TableCell>{client.cnpj}</TableCell>
                    <TableCell>{client.municipio}</TableCell>
                    <TableCell>{client.telefone}</TableCell>
                    <TableCell>
                      <Button size="small" sx={{ mr: 1 }} onClick={() => navigate(`/clients/edit/${client.id}`)}>Edit</Button>
                      <Button size="small" color="error" onClick={() => handleDelete(client.id)}>Delete</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        </>
      )}

      {!loading && !error && clients.length === 0 && (
        <Typography>No clients found.</Typography>
      )}
    </Container>
  );
};

export default ClientsPage;
