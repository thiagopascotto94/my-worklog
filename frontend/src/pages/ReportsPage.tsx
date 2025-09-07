import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Alert, Select, MenuItem, FormControl, InputLabel, TextField } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import * as reportService from '../services/reportService';
import * as clientService from '../services/clientService';
import { Report } from '../services/reportService';
import { Client } from '../services/clientService';

const ReportsPage: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form state
  const [selectedClient, setSelectedClient] = useState<number | ''>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchReportsAndClients = async () => {
    try {
      setLoading(true);
      const [reportsRes, clientsRes] = await Promise.all([
        reportService.getReports(),
        clientService.getClients(),
      ]);
      setReports(reportsRes.data);
      setClients(clientsRes.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportsAndClients();
  }, []);

  const handleGenerateReport = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedClient || !startDate || !endDate) {
      setError('Please fill out all fields to generate a report.');
      return;
    }
    try {
      setError('');
      await reportService.generateReport({
        clientId: selectedClient as number,
        startDate,
        endDate,
      });
      // Refetch reports to show the new one
      fetchReportsAndClients();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate report.');
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Reports
        </Typography>

        <Box component="form" onSubmit={handleGenerateReport} sx={{ mb: 4, p: 2, border: '1px solid grey', borderRadius: 1 }}>
          <Typography variant="h6">Generate New Report</Typography>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Client</InputLabel>
            <Select value={selectedClient} label="Client" onChange={(e) => setSelectedClient(e.target.value as number)}>
              {clients.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField type="date" label="Start Date" value={startDate} onChange={(e) => setStartDate(e.target.value)} fullWidth sx={{ mt: 2 }} InputLabelProps={{ shrink: true }} />
          <TextField type="date" label="End Date" value={endDate} onChange={(e) => setEndDate(e.target.value)} fullWidth sx={{ mt: 2 }} InputLabelProps={{ shrink: true }} />
          <Button type="submit" variant="contained" sx={{ mt: 2 }}>Generate</Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Report ID</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Period</TableCell>
                <TableCell>Total Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>#{report.id}</TableCell>
                  <TableCell>{report.client?.name || 'N/A'}</TableCell>
                  <TableCell>{new Date(report.startDate).toLocaleDateString()} - {new Date(report.endDate).toLocaleDateString()}</TableCell>
                  <TableCell>${report.totalAmount.toFixed(2)}</TableCell>
                  <TableCell>{report.status}</TableCell>
                  <TableCell>
                    <Button component={RouterLink} to={`/reports/${report.id}`} size="small">View</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  );
};

export default ReportsPage;
