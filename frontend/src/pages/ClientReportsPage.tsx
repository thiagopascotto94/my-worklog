import React, { useState, useEffect } from 'react';
import { Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Alert, Stack, IconButton } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { Delete, Share, Visibility, ContentCopy } from '@mui/icons-material';
import * as reportService from '../services/reportService';
import { Report } from '../services/reportService';

interface ClientReportsPageProps {
  clientId: number;
}

const ClientReportsPage: React.FC<ClientReportsPageProps> = ({ clientId }) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<Record<number, boolean>>({});

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await reportService.getReportsByClientId(clientId);
      setReports(data);
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
