import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Box, Paper, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Divider } from '@mui/material';
import * as reportService from '../services/reportService';
import { Report } from '../services/reportService';

const ReportViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      const fetchReport = async () => {
        try {
          setLoading(true);
          const response = await reportService.getReportById(parseInt(id, 10));
          setReport(response.data);
        } catch (err: any) {
          setError(err.response?.data?.message || 'Failed to fetch report details.');
        } finally {
          setLoading(false);
        }
      };
      fetchReport();
    }
  }, [id]);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!report) return <Alert severity="info">Report not found.</Alert>;

  return (
    <Container sx={{ my: 4 }}>
      <Paper sx={{ p: 3 }}>
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
