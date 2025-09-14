import React, { useState, useEffect, useCallback } from 'react';
import { Box, Button, Typography, Select, MenuItem, FormControl, InputLabel, CircularProgress, Alert } from '@mui/material';
import * as timerService from '../services/timerService';
import * as clientService from '../services/clientService';
import { WorkSession } from '../services/timerService';
import { Client } from '../services/clientService';
import TaskList from './TaskList';

const Timer: React.FC = () => {
  const [session, setSession] = useState<WorkSession | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<number | ''>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch initial data (active session and clients)
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const [sessionRes, clientsRes] = await Promise.all([
          timerService.getActiveSession(),
          clientService.getClients({})
        ]);
        setSession(sessionRes.data);
        setClients(clientsRes.data.clients);
        if (sessionRes.data) {
          setSelectedClient(sessionRes.data.clientId);
        }
      } catch (err: any) {
        setError('Failed to load timer data.');
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, []);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (session?.status === 'active') {
      interval = setInterval(() => {
        const now = new Date().getTime();
        const startTime = new Date(session.startTime).getTime();
        const totalPausedMs = (session.totalPausedSeconds || 0) * 1000;
        setElapsed(now - startTime - totalPausedMs);
      }, 1000);
    } else if (session?.status === 'paused') {
        const startTime = new Date(session.startTime).getTime();
        const lastPausedTime = new Date(session.lastPausedTime!).getTime();
        const totalPausedMs = (session.totalPausedSeconds || 0) * 1000;
        setElapsed(lastPausedTime - startTime - totalPausedMs);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [session]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleStart = async () => {
    if (!selectedClient) {
      setError('Please select a client before starting.');
      return;
    }
    try {
      setError('');
      const res = await timerService.startTimer(selectedClient as number);
      setSession(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to start timer.');
    }
  };

  const handlePause = async () => {
    try {
      const res = await timerService.pauseTimer();
      setSession(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to pause timer.');
    }
  };

  const handleResume = async () => {
    try {
      const res = await timerService.resumeTimer();
      setSession(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resume timer.');
    }
  };

  const handleStop = async () => {
    // In a real app, this would open a modal to get rate/tags
    try {
      const res = await timerService.stopTimer({ hourlyRate: 50 }); // Dummy rate
      setSession(null);
      setElapsed(0);
      setSelectedClient('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to stop timer.');
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Box sx={{ p: 2, border: '1px solid grey', borderRadius: 2, mt: 4 }}>
      <Typography variant="h5" gutterBottom>Time Tracker</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="h3" component="div">
          {formatTime(elapsed)}
        </Typography>
        <Box>
          {!session && (
            <Button variant="contained" color="primary" onClick={handleStart} disabled={!selectedClient}>
              Start
            </Button>
          )}
          {session?.status === 'active' && (
            <Button variant="contained" color="secondary" onClick={handlePause}>
              Pause
            </Button>
          )}
          {session?.status === 'paused' && (
            <Button variant="contained" color="primary" onClick={handleResume}>
              Resume
            </Button>
          )}
          {session && (
            <Button variant="outlined" color="error" onClick={handleStop} sx={{ ml: 1 }}>
              Stop
            </Button>
          )}
        </Box>
      </Box>
      <FormControl fullWidth sx={{ mt: 2 }} disabled={!!session}>
        <InputLabel id="client-select-label">Client</InputLabel>
        <Select
          labelId="client-select-label"
          id="client-select"
          value={selectedClient}
          label="Client"
          onChange={(e) => setSelectedClient(e.target.value as number)}
        >
          {clients.map(c => (
            <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
          ))}
        </Select>
      </FormControl>
      {session && <TaskList workSessionId={session.id} />}
    </Box>
  );
};

export default Timer;
