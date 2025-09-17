import api from './api';

export const register = (email: string, password: string, firstName: string, lastName: string) => {
  return api.post('/auth/register', { email, password, firstName, lastName });
};

export const login = (email: string, password: string) => {
  return api.post('/auth/login', { email, password });
};

export const sendVerificationCode = (email: string) => {
  return api.post('/auth/send-verification-code', { email });
};

export const verifyCode = (email: string, code: string) => {
  return api.post('/auth/verify-code', { email, code });
};

export const logout = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};
