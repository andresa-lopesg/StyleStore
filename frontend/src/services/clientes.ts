import api from './api';
import type { Cliente } from '../types';

export const clientesService = {
  getAll: () => api.get<Cliente[]>('/clientes').then(r => r.data),
  getById: (id: number) => api.get<Cliente>(`/clientes/${id}`).then(r => r.data),
  create: (data: Omit<Cliente, 'id'>) => api.post<Cliente>('/clientes', data).then(r => r.data),
  update: (id: number, data: Cliente) => api.put(`/clientes/${id}`, data),
  delete: (id: number) => api.delete(`/clientes/${id}`),
};
