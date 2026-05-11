import api from './api';
import type { Usuario } from '../types';

export const usuariosService = {
  getAll: () => api.get<Usuario[]>('/usuarios').then(r => r.data),
  getById: (id: number) => api.get<Usuario>(`/usuarios/${id}`).then(r => r.data),
  create: (data: Omit<Usuario, 'id' | 'criadoEm'>) => api.post<Usuario>('/usuarios', data).then(r => r.data),
  update: (id: number, data: Usuario) => api.put(`/usuarios/${id}`, data),
  delete: (id: number) => api.delete(`/usuarios/${id}`),
};
