import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Alert, TextField, Autocomplete, Stack, IconButton } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { Delete, Share, Visibility } from '@mui/icons-material';
import * as reportService from '../services/reportService';
import * as clientService from '../services/clientService';
import { Report } from '../services/reportService';
import { Client } from '../services/clientService';

const ReportsPage: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<Record<number, boolean>>({});

  // Form state
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');

  const fetchReportsAndClients = async () => {
    try {
      setLoading(true);
      setError('');
      const [reportsRes, clientsRes] = await Promise.all([
        reportService.getReports(),
        clientService.getClients({ limit: 1000 }), // Fetch all clients for autocomplete
      ]);
      setReports(reportsRes.data);
      setClients(clientsRes.data.clients);
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
    if (!selectedClient || !startDate || !endDate || !hourlyRate) {
      setError('Please fill out all fields to generate a report.');
      return;
    }
    try {
      setError('');
      await reportService.generateReport({
        clientId: selectedClient.id,
        startDate,
        endDate,
        hourlyRate: parseFloat(hourlyRate),
      });
      // Reset form and refetch reports
      setSelectedClient(null);
      setStartDate('');
      setEndDate('');
      setHourlyRate('');
      fetchReportsAndClients();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate report.');
    }
  };

  const handleAction = (reportId: number, action: 'delete' | 'share') => async () => {
    setActionLoading(prev => ({ ...prev, [reportId]: true }));
    setError('');
    try {
      if (action === 'delete') {
        if (window.confirm('Are you sure you want to delete this report?')) {
          await reportService.deleteReport(reportId);
          setReports(prev => prev.filter(r => r.id !== reportId));
        }
      } else if (action === 'share') {
        const { data: updatedReport } = await reportService.shareReport(reportId);
        const shareUrl = `${window.location.origin}/reports/public/${updatedReport.shareToken}`;
        window.prompt('Copy this link to share the report:', shareUrl);
        // Update the status in the UI
        setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: 'sent', shareToken: updatedReport.shareToken } : r));
      }
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to ${action} report.`);
    } finally {
      setActionLoading(prev => ({ ...prev, [reportId]: false }));
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
          <Autocomplete
            options={clients}
            getOptionLabel={(option) => option.name}
            value={selectedClient}
            onChange={(event, newValue) => {
              setSelectedClient(newValue);
            }}
            renderInput={(params) => <TextField {...params} label="Client" margin="normal" />}
          />
          <TextField
            label="Hourly Rate"
            type="number"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(e.target.value)}
            fullWidth
            margin="normal"
            InputProps={{ startAdornment: <Typography sx={{ mr: 1 }}>$</Typography> }}
          />
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
                <TableCell align="right">Actions</TableCell>
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
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                       <IconButton component={RouterLink} to={`/reports/${report.id}`} size="small" color="primary">
                        <Visibility />
                      </IconButton>
                      <IconButton onClick={handleAction(report.id, 'share')} size="small" color="secondary" disabled={actionLoading[report.id]}>
                        <Share />
                      </IconButton>
                      <IconButton onClick={handleAction(report.id, 'delete')} size="small" color="error" disabled={actionLoading[report.id]}>
                        <Delete />
                      </IconButton>
                    </Stack>
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
