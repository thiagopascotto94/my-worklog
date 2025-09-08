import api from './api';

export const register = (email: string, password: string, firstName: string, lastName: string) => {
  return api.post('/auth/register', { email, password, firstName, lastName });
};

export const login = (email: string, password: string) => {
  return api.post('/auth/login', { email, password });
};
