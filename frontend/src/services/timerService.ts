import api from './api';

// Types based on the backend models
export interface SessionTask {
  id: number;
  description: string;
  createdAt: string;
}

export interface WorkSession {
  id: number;
  status: 'active' | 'paused' | 'stopped';
  startTime: string;
  endTime: string | null;
  lastPausedTime: string | null;
  totalPausedSeconds: number;
  hourlyRate: number | null;
  tags: string | null;
  clientId: number;
  userId: number;
  tasks: SessionTask[];
  totalEarned?: number;
}

export const getActiveSession = (): Promise<{ data: WorkSession | null }> => {
  return api.get('/timer/active');
};

export const startTimer = (clientId: number): Promise<{ data: WorkSession }> => {
  return api.post('/timer/start', { clientId });
};

export const pauseTimer = (): Promise<{ data: WorkSession }> => {
  return api.post('/timer/pause');
};

export const resumeTimer = (): Promise<{ data: WorkSession }> => {
  return api.post('/timer/resume');
};

export const stopTimer = (details: { hourlyRate?: number; tags?: string }): Promise<{ data: WorkSession }> => {
  return api.post('/timer/stop', details);
};

export const addTask = (description: string): Promise<{ data: SessionTask }> => {
  return api.post('/timer/task', { description });
};
