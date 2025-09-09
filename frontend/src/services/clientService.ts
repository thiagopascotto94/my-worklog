import api from './api';

// Define the type for a Client for TypeScript
export interface Client {
  id: number;
  name: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
  cnpj?: string;
  inscricaoEstadual?: string;
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  municipio?: string;
  uf?: string;
  telefone?: string;
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

export const getCnpjData = (cnpj: string): Promise<{ data: any }> => {
  return api.get(`/clients/cnpj/${cnpj}`);
};

export const getCepData = (cep: string): Promise<{ data: any }> => {
  return api.get(`/clients/cep/${cep}`);
};
