import api from './api';
import type { Producao, StatusProducao } from '../types';

export const producaoService = {
  getAll: () => api.get<Producao[]>('/producao').then(r => r.data),
  getById: (id: number) => api.get<Producao>(`/producao/${id}`).then(r => r.data),
  create: (data: Omit<Producao, 'id' | 'criadoEm' | 'produto'>) => api.post<Producao>('/producao', data).then(r => r.data),
  update: (id: number, data: Producao) => api.put(`/producao/${id}`, data),
  updateStatus: (id: number, status: StatusProducao) => api.patch(`/producao/${id}/status`, status),
  delete: (id: number) => api.delete(`/producao/${id}`),
};
