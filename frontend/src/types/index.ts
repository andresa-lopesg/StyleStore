export interface Cliente {
  id: number;
  nome: string;
  email: string;
  telefone: string;
}

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  senhaHash: string;
  criadoEm: string;
}

export interface Categoria {
  id: number;
  nome: string;
  descricao: string;
  ativa: boolean;
  criadoEm: string;
}

export interface ProdutoVariante {
  id: number;
  tamanho: string;
  cor: string;
  estoque: number;
  codigoBarras?: string;
  produtoId: number;
}

export interface Produto {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  precoCusto: number;
  estoqueTotal: number;
  estoqueMinimo: number;
  imagemUrl?: string;
  referencia?: string;
  ativo: boolean;
  criadoEm: string;
  categoriaId: number;
  categoria?: Categoria;
  variantes?: ProdutoVariante[];
}

export interface Funcionario {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  cargo: string;
  salario: number;
  cpf: string;
  dataAdmissao: string;
  ativo: boolean;
  criadoEm: string;
}

export type StatusPedido = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const StatusPedidoLabel: Record<number, string> = {
  0: 'Pendente',
  1: 'Confirmado',
  2: 'Em Produção',
  3: 'Separando',
  4: 'Enviado',
  5: 'Entregue',
  6: 'Cancelado',
};

export interface ItemPedido {
  id: number;
  quantidade: number;
  precoUnitario: number;
  tamanho?: string;
  cor?: string;
  pedidoId: number;
  produtoId: number;
  produto?: Produto;
}

export interface Pedido {
  id: number;
  dataPedido: string;
  status: StatusPedido;
  total: number;
  desconto: number;
  observacao?: string;
  enderecoEntrega?: string;
  dataEntregaPrevista?: string;
  criadoEm: string;
  clienteId: number;
  cliente?: Cliente;
  funcionarioId?: number;
  funcionario?: Funcionario;
  itens?: ItemPedido[];
}

export type StatusProducao = 0 | 1 | 2 | 3 | 4;

export const StatusProducaoLabel: Record<number, string> = {
  0: 'Aguardando',
  1: 'Em Andamento',
  2: 'Pausado',
  3: 'Concluído',
  4: 'Cancelado',
};

export type TipoMovimentacao = 0 | 1 | 2 | 3;

export const TipoMovimentacaoLabel: Record<number, string> = {
  0: 'Entrada',
  1: 'Saída',
  2: 'Reserva',
  3: 'Cancelamento',
};

export interface MovimentacaoEstoque {
  id: number;
  produtoId: number;
  varianteId?: number;
  tipo: TipoMovimentacao;
  quantidade: number;
  estoqueAnterior: number;
  estoqueAtual: number;
  motivo?: string;
  pedidoId?: number;
  criadoEm: string;
  variante?: ProdutoVariante;
}

export interface Producao {
  id: number;
  quantidadePlanejada: number;
  quantidadeProduzida: number;
  status: StatusProducao;
  dataInicio: string;
  dataFim?: string;
  observacao?: string;
  responsavel: string;
  criadoEm: string;
  produtoId: number;
  produto?: Produto;
}
