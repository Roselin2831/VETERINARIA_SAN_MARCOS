import { api } from './api';

export const getUsers = () => api('/users');
export const updateUserRole = (id, role) => api(`/users/${id}/role`, { method: 'PATCH', body: { role } });
