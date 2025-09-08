import api from './api';
import { Client } from './clientService';
import { WorkSession } from './timerService';

// A single item in a report, which is a WorkSession
export interface ReportItem {
  id: number;
  reportId: number;
  workSessionId: number;
  WorkSession: WorkSession;
}

// The main Report object
export interface Report {
  id: number;
  userId: number;
  clientId: number;
  startDate: string;
  endDate: string;
  totalAmount: number;
  status: 'draft' | 'sent' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  client?: Client; // Eager loaded
  items?: ReportItem[]; // Eager loaded
}

interface GenerateReportPayload {
  clientId: number;
  startDate: string;
  endDate: string;
}

export const generateReport = (payload: GenerateReportPayload): Promise<{ data: Report }> => {
  return api.post('/reports/generate', payload);
};

export const getReports = (): Promise<{ data: Report[] }> => {
  return api.get('/reports');
};

export const getReportById = (id: number): Promise<{ data: Report }> => {
  return api.get(`/reports/${id}`);
};
