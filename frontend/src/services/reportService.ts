import api from './api';
import { Client, ClientContact } from './clientService';
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
  hourlyRate?: number;
  status: 'draft' | 'sent' | 'approved' | 'declined';
  shareToken?: string;
  approvedAt?: string;
  approvedBy?: number;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  client?: Client; // Eager loaded
  items?: ReportItem[]; // Eager loaded
  approver?: ClientContact; // Eager loaded
}

// Payloads for API calls
export interface GenerateReportPayload {
  clientId: number;
  startDate: string;
  endDate: string;
  hourlyRate: number;
}

export interface UpdateReportPayload {
  hourlyRate: number;
}

export interface UpdateStatusPayload {
  status: 'approved' | 'declined';
  celular: string;
  rejectionReason?: string;
}

// === API Functions ===

export const generateReport = (payload: GenerateReportPayload): Promise<{ data: Report }> => {
  return api.post('/reports/generate', payload);
};

export const getReports = (): Promise<{ data: Report[] }> => {
  return api.get('/reports');
};

export const getReportsByClientId = (clientId: number): Promise<{ data: Report[] }> => {
  return api.get(`/reports/client/${clientId}`);
};

export const getReportById = (id: number): Promise<{ data: Report }> => {
  return api.get(`/reports/${id}`);
};

export const updateReport = (id: number, payload: UpdateReportPayload): Promise<{ data: Report }> => {
  return api.put(`/reports/${id}`, payload);
};

export const deleteReport = (id: number): Promise<{ data: { message: string } }> => {
  return api.delete(`/reports/${id}`);
};

export const shareReport = (id: number): Promise<{ data: Report }> => {
  return api.post(`/reports/${id}/share`);
};

export const getPublicReportByToken = (token: string): Promise<{ data: Report }> => {
  return api.get(`/reports/public/${token}`);
};

export const updateReportStatus = (token: string, payload: UpdateStatusPayload): Promise<{ data: { message: string } }> => {
  return api.post(`/reports/public/${token}/status`, payload);
};

export const duplicateReport = (id: number): Promise<{ data: Report }> => {
  return api.post(`/reports/${id}/duplicate`);
};
