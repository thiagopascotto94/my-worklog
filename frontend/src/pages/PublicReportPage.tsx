import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Box, Paper, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Divider, Button, Stack, Dialog, DialogTitle, DialogContent, TextField, DialogActions } from '@mui/material';
import * as reportService from '../services/reportService';
import { Report } from '../services/reportService';

const PublicReportPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [celular, setCelular] = useState('');
  const [statusToUpdate, setStatusToUpdate] = useState<'approved' | 'declined' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (token) {
      const fetchPublicReport = async () => {
        try {
          setLoading(true);
          setError('');
          const response = await reportService.getPublicReportByToken(token);
          setReport(response.data);
        } catch (err: any) {
          setError(err.response?.data?.message || 'Failed to fetch report.');
        } finally {
          setLoading(false);
        }
      };
      fetchPublicReport();
    }
  }, [token]);

  const handleOpenDialog = (status: 'approved' | 'declined') => {
    setStatusToUpdate(status);
    setError(''); // Clear previous errors when opening the dialog
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setCelular('');
    // Do not clear the error here, so it can be displayed on the main page
  };

  const handleSubmitStatus = async () => {
    if (!token || !statusToUpdate || !celular) {
      setError('Phone number is required.');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      const response = await reportService.updateReportStatus(token, { status: statusToUpdate, celular });
      setSuccessMessage(response.data.message);
      // Optionally, refetch the report to show updated status
      const updatedReport = await reportService.getPublicReportByToken(token);
      setReport(updatedReport.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred.');
    } finally {
      setIsSubmitting(false);
      handleCloseDialog();
    }
  };

  if (loading) return <CircularProgress />;
  if (error && !dialogOpen) return <Alert severity="error">{error}</Alert>;
  if (!report) return <Alert severity="info">Report not found or the link is invalid.</Alert>;

  const isFinalStatus = report.status === 'approved' || report.status === 'declined';

  return (
    <Container sx={{ my: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Report #{report.id}
        </Typography>
        <Typography variant="h6">Client: {report.client?.name}</Typography>
        <Typography variant="body1">Status: {report.status}</Typography>
        <Typography variant="body1">
          Period: {new Date(report.startDate).toLocaleDateString()} - {new Date(report.endDate).toLocaleDateString()}
        </Typography>
        <Typography variant="h6" align="right" sx={{ mt: 2 }}>
          Total: ${report.totalAmount.toFixed(2)}
        </Typography>
        <Divider sx={{ my: 2 }} />
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

        <Divider sx={{ my: 3 }} />

        {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}

        {!isFinalStatus && !successMessage && (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Please review the report and take an action.
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button variant="contained" color="success" onClick={() => handleOpenDialog('approved')}>
                Approve
              </Button>
              <Button variant="contained" color="error" onClick={() => handleOpenDialog('declined')}>
                Decline
              </Button>
            </Stack>
          </Box>
        )}

        {isFinalStatus && (
           <Alert severity={report.status === 'approved' ? 'success' : 'error'}>
             This report was {report.status} on {new Date(report.approvedAt!).toLocaleDateString()} by {report.approver?.name || 'an authorized contact'}.
           </Alert>
        )}

      </Paper>

      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent>
          <Typography>
            To {statusToUpdate} this report, please enter your phone number for verification.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            id="celular"
            label="Phone Number (celular)"
            type="tel"
            fullWidth
            variant="standard"
            value={celular}
            onChange={(e) => setCelular(e.target.value)}
          />
          {error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmitStatus} disabled={isSubmitting}>
            {isSubmitting ? <CircularProgress size={24} /> : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PublicReportPage;
