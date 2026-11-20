import { api } from './api';

export const loginRequest = (email, password) =>
  api('/auth/login', { method: 'POST', body: { email, password }, auth: false });

export const registerRequest = ({ name, email, password }) =>
  api('/auth/register', { method: 'POST', body: { name, email, password }, auth: false });

export const meRequest = () => api('/auth/me');
