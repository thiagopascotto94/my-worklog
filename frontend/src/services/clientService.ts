import api from './api';

export interface ClientContact {
  id?: number;
  name: string;
  email: string;
  phone: string;
  clientId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Client {
  id: number;
  name: string;
  company_name?: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
  contacts?: ClientContact[];
}

export const getClients = (): Promise<{ data: Client[] }> => {
  return api.get('/clients');
};

export const createClient = (clientData: Partial<Client>): Promise<{ data: Client }> => {
  return api.post('/clients', clientData);
};

export const updateClient = (id: number, clientData: Partial<Client>): Promise<{ data: Client }> => {
  return api.put(`/clients/${id}`, clientData);
};

export const deleteClient = (id: number): Promise<void> => {
  return api.delete(`/clients/${id}`);
};
