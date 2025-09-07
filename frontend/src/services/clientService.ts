import api from './api';

// Define the type for a Client for TypeScript
export interface Client {
  id: number;
  name: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export const getClients = (): Promise<{ data: Client[] }> => {
  return api.get('/clients');
};

export const createClient = (name: string): Promise<{ data: Client }> => {
  return api.post('/clients', { name });
};

export const updateClient = (id: number, name: string): Promise<{ data: Client }> => {
  return api.put(`/clients/${id}`, { name });
};

export const deleteClient = (id: number): Promise<void> => {
  return api.delete(`/clients/${id}`);
};
