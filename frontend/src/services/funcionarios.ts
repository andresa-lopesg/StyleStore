import api from './api';
import type { Funcionario } from '../types';

export const funcionariosService = {
  getAll: () => api.get<Funcionario[]>('/funcionarios').then(r => r.data),
  getById: (id: number) => api.get<Funcionario>(`/funcionarios/${id}`).then(r => r.data),
  create: (data: Omit<Funcionario, 'id' | 'criadoEm'>) => api.post<Funcionario>('/funcionarios', data).then(r => r.data),
  update: (id: number, data: Funcionario) => api.put(`/funcionarios/${id}`, data),
  delete: (id: number) => api.delete(`/funcionarios/${id}`),
};
