import api from './api';
import type { Produto, MovimentacaoEstoque } from '../types';

export const produtosService = {
  getAll: () => api.get<Produto[]>('/produtos').then(r => r.data),
  getById: (id: number) => api.get<Produto>(`/produtos/${id}`).then(r => r.data),
  create: (data: Omit<Produto, 'id' | 'criadoEm' | 'categoria' | 'variantes'>) => api.post<Produto>('/produtos', data).then(r => r.data),
  update: (id: number, data: Produto) => api.put(`/produtos/${id}`, data),
  delete: (id: number) => api.delete(`/produtos/${id}`),
  getHistoricoEstoque: (id: number) => api.get<MovimentacaoEstoque[]>(`/produtos/${id}/estoque/historico`).then(r => r.data),
  ajustarEstoque: (id: number, data: { tipo: 0 | 1; quantidade: number; motivo?: string }) =>
    api.post<MovimentacaoEstoque>(`/produtos/${id}/estoque/movimentacao`, data).then(r => r.data),
  uploadImagem: async (id: number, file: File) => {
    const body = new window.FormData();
    body.append('arquivo', file);
    const res = await fetch(`/api/produtos/${id}/imagem`, { method: 'POST', body });
    if (!res.ok) throw new Error('Upload falhou');
    return res.json() as Promise<{ url: string }>;
  },
};
