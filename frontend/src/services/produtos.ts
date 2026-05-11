import api from './api';
import type { Produto } from '../types';

export const produtosService = {
  getAll: () => api.get<Produto[]>('/produtos').then(r => r.data),
  getById: (id: number) => api.get<Produto>(`/produtos/${id}`).then(r => r.data),
  create: (data: Omit<Produto, 'id' | 'criadoEm' | 'categoria' | 'variantes'>) => api.post<Produto>('/produtos', data).then(r => r.data),
  update: (id: number, data: Produto) => api.put(`/produtos/${id}`, data),
  delete: (id: number) => api.delete(`/produtos/${id}`),
};
