import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Box, Paper, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Divider, TextField, Button, Stack } from '@mui/material';
import * as reportService from '../services/reportService';
import { Report } from '../services/reportService';

const ReportViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // State for editing hourly rate
  const [editableRate, setEditableRate] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);

  const fetchReport = async () => {
    if (id) {
      try {
        setLoading(true);
        setError('');
        const response = await reportService.getReportById(parseInt(id, 10));
        setReport(response.data);
        setEditableRate(response.data.hourlyRate?.toString() || '');
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch report details.');
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchReport();
  }, [id]);

  const handleUpdateRate = async () => {
    if (!id || !editableRate || isNaN(parseFloat(editableRate))) {
      setError('Please enter a valid hourly rate.');
      return;
    }
    setUpdateLoading(true);
    setError('');
    try {
      const response = await reportService.updateReport(parseInt(id, 10), {
        hourlyRate: parseFloat(editableRate),
      });
      setReport(response.data); // Update the whole report object
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update hourly rate.');
    } finally {
      setUpdateLoading(false);
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!report) return <Alert severity="info">Report not found.</Alert>;

  return (
    <Container sx={{ my: 4 }}>
      <Paper sx={{ p: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Typography variant="h4" gutterBottom>
          Report #{report.id}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="h6">Client: {report.client?.name}</Typography>
            <Typography variant="body1">Status: {report.status}</Typography>
          </Box>
          <Box>
            <Typography variant="body1">
              Period: {new Date(report.startDate).toLocaleDateString()} - {new Date(report.endDate).toLocaleDateString()}
            </Typography>
            <Typography variant="h6" align="right">
              Total: ${report.totalAmount.toFixed(2)}
            </Typography>
          </Box>
        </Box>
        <Divider sx={{ my: 2 }} />

        {report.status === 'approved' || report.status === 'declined' ? (
          <Alert severity={report.status === 'approved' ? 'success' : 'error'} sx={{ mb: 2 }}>
            This report was {report.status}
            {report.approvedAt && ` on ${new Date(report.approvedAt).toLocaleDateString()}`}
            {report.approver && ` by ${report.approver.name}`}.
          </Alert>
        ) : (
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <TextField
              label="Report Hourly Rate"
              type="number"
              size="small"
              value={editableRate}
              onChange={(e) => setEditableRate(e.target.value)}
              InputProps={{ startAdornment: <Typography sx={{ mr: 1 }}>$</Typography> }}
              disabled={updateLoading || report.status === 'approved' || report.status === 'declined'}
            />
            <Button
              variant="contained"
              onClick={handleUpdateRate}
              disabled={updateLoading || report.status === 'approved' || report.status === 'declined'}
            >
              {updateLoading ? <CircularProgress size={24} /> : 'Save Rate'}
            </Button>
          </Stack>
        )}

        <Typography variant="h5" gutterBottom>
          Work Sessions
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Hourly Rate</TableCell>
                <TableCell>Line Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {report.items?.map((item) => {
                const session = item.WorkSession;
                const durationInSeconds = (new Date(session.endTime!).getTime() - new Date(session.startTime).getTime()) / 1000 - session.totalPausedSeconds;
                const durationHours = (durationInSeconds / 3600).toFixed(2);
                return (
                  <TableRow key={session.id}>
                    <TableCell>{new Date(session.startTime).toLocaleDateString()}</TableCell>
                    <TableCell>{durationHours} hours</TableCell>
                    <TableCell>${session.hourlyRate?.toFixed(2)}</TableCell>
                    <TableCell>${session.totalEarned?.toFixed(2)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default ReportViewPage;
