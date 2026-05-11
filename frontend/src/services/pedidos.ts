import api from './api';
import type { Pedido, StatusPedido } from '../types';

export const pedidosService = {
  getAll: () => api.get<Pedido[]>('/pedidos').then(r => r.data),
  getById: (id: number) => api.get<Pedido>(`/pedidos/${id}`).then(r => r.data),
  create: (data: Omit<Pedido, 'id' | 'criadoEm' | 'cliente' | 'funcionario' | 'itens'>) => api.post<Pedido>('/pedidos', data).then(r => r.data),
  update: (id: number, data: Pedido) => api.put(`/pedidos/${id}`, data),
  updateStatus: (id: number, status: StatusPedido) => api.patch(`/pedidos/${id}/status`, status),
  delete: (id: number) => api.delete(`/pedidos/${id}`),
};
