import React, { useState, useEffect } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Alert, Stack, IconButton, Grid } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { Delete, Share, Visibility, ContentCopy } from '@mui/icons-material';
import * as reportService from '../services/reportService';
import { Report, ReportSummary, MonthlyEarning } from '../services/reportService';
import EarningsChart from '../components/EarningsChart';

interface ClientReportsPageProps {
  clientId: number;
}

const ClientReportsPage: React.FC<ClientReportsPageProps> = ({ clientId }) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [monthlyEarnings, setMonthlyEarnings] = useState<MonthlyEarning[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<Record<number, boolean>>({});

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await reportService.getReportsByClientId(clientId);
      setReports(data.reports);
      setSummary(data.summary);
      setMonthlyEarnings(data.monthlyEarnings);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (clientId) {
      fetchReports();
    }
  }, [clientId]);

  const handleAction = (reportId: number, action: 'delete' | 'share' | 'duplicate') => async () => {
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
        setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: 'sent', shareToken: updatedReport.shareToken } : r));
      } else if (action === 'duplicate') {
        await reportService.duplicateReport(reportId);
        fetchReports();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to ${action} report.`);
    } finally {
      setActionLoading(prev => ({ ...prev, [reportId]: false }));
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Box sx={{ my: 4 }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Typography variant="h5" component="h2" gutterBottom>
        Client Reports
      </Typography>

      {summary && (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Overall Summary
          </Typography>
          <Grid container spacing={4} justifyContent="center" textAlign="center">
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle1" color="text.secondary">Total Reports</Typography>
              <Typography variant="h4" fontWeight="bold">{summary.totalReports}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle1" color="text.secondary">Total Earned</Typography>
              <Typography variant="h4" fontWeight="bold">${summary.totalAmount.toFixed(2)}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle1" color="text.secondary">Total Hours</Typography>
              <Typography variant="h4" fontWeight="bold">{summary.totalHours.toFixed(2)}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle1" color="text.secondary">Avg. Hourly Rate</Typography>
              <Typography variant="h4" fontWeight="bold">${summary.averageHourlyRate.toFixed(2)}</Typography>
            </Grid>
          </Grid>
        </Paper>
      )}

      {monthlyEarnings.length > 0 && <EarningsChart data={monthlyEarnings} />}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Report ID</TableCell>
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
                    <IconButton onClick={handleAction(report.id, 'duplicate')} size="small" color="default" disabled={actionLoading[report.id]}>
                      <ContentCopy />
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
  );
};

export default ClientReportsPage;
