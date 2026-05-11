import api from './api';
import type { Categoria } from '../types';

export const categoriasService = {
  getAll: () => api.get<Categoria[]>('/categorias').then(r => r.data),
  getById: (id: number) => api.get<Categoria>(`/categorias/${id}`).then(r => r.data),
  create: (data: Omit<Categoria, 'id' | 'criadoEm'>) => api.post<Categoria>('/categorias', data).then(r => r.data),
  update: (id: number, data: Categoria) => api.put(`/categorias/${id}`, data),
  delete: (id: number) => api.delete(`/categorias/${id}`),
};
