// ============================================================
// AutoFlow — Core Types
// ============================================================

export type StatusOS =
  | 'aberta'
  | 'em_andamento'
  | 'aguardando_peca'
  | 'finalizada'
  | 'entregue';

export type TipoLancamento = 'entrada' | 'saida';

export interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  whatsapp: string;
  cpfCnpj: string;
  email?: string;
  observacoes?: string;
  endereco?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Veiculo {
  id: string;
  clienteId: string;
  marca: string;
  modelo: string;
  ano: number;
  placa: string;
  cor: string;
  quilometragem: number;
  observacoes?: string;
  createdAt: string;
  updatedAt: string;
}

// Catálogo de serviços padronizados
export interface ServicosCatalogo {
  id: string;
  nome: string;
  descricao?: string;
  valorPadrao: number;
  categoria?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServicoOS {
  id: string;
  descricao: string;
  valor: number;
  proximaRevisaoKm?: number;
  proximaRevisaoData?: string; // YYYY-MM-DD
}

export interface PecaOS {
  id: string;
  pecaId?: string;
  nome: string;
  quantidade: number;
  valorUnitario: number;
  markup?: number;        // % de markup (só interno, não aparece para o cliente)
  valorTotal: number;    // já com markup aplicado
}

// Formas de pagamento ao finalizar OS
export interface FormaPagamento {
  id: string;
  tipo: 'dinheiro' | 'pix' | 'debito' | 'credito' | 'outro';
  valor: number;
  parcelas?: number;     // só para crédito
  obs?: string;          // observação por cartão/forma
  descricaoOutro?: string; // só para 'outro'
}

export interface PagamentoOS {
  formas: FormaPagamento[];
  total: number;
  dataRegistro: string;
}

export interface OrdemServico {
  id: string;
  numero: string;
  clienteId: string;
  veiculoId: string;
  quilometragemAtual: number;
  problemaRelatado: string;
  observacoesInternas?: string;
  mecanico?: string;           // mecânico responsável (interno)
  servicos: ServicoOS[];
  pecas: PecaOS[];
  valorMaoDeObra: number;
  valorPecas: number;
  valorTotal: number;
  status: StatusOS;
  pagamento?: PagamentoOS;     // preenchido ao finalizar
  dataEntrada: string;
  dataConclusao?: string;
  lancamentoId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Peca {
  id: string;
  nome: string;
  // Identificação do veículo compatível
  marcaVeiculo?: string;
  modeloVeiculo?: string;
  anoVeiculo?: string;
  motorizacao?: string; // ex: "1.0", "1.4 Turbo"
  cambio?: 'manual' | 'automatico' | 'ambos';
  codigo?: string; // ex: C1049
  // Estoque
  quantidade: number;
  quantidadeMinima: number;
  custo: number;
  fornecedor?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Lancamento {
  id: string;
  tipo: TipoLancamento;
  descricao: string;
  valor: number;
  ordemServicoId?: string;
  clienteId?: string;
  data: string;
  pago?: boolean;
  createdAt: string;
}

// Contas a pagar
export interface ContaPagar {
  id: string;
  descricao: string;
  valor: number;
  vencimento: string; // YYYY-MM-DD
  fornecedor?: string;
  pago: boolean;
  dataPagamento?: string;
  createdAt: string;
}

export interface Agendamento {
  id: string;
  clienteId: string;
  veiculoId: string;
  servico: string;
  data: string;
  hora: string;
  status: 'agendado' | 'confirmado' | 'cancelado' | 'concluido';
  observacoes?: string;
  createdAt: string;
}

// Derived types with joins
export interface OrdemServicoComDetalhes extends OrdemServico {
  cliente?: Cliente;
  veiculo?: Veiculo;
}

export interface AgendamentoComDetalhes extends Agendamento {
  cliente?: Cliente;
  veiculo?: Veiculo;
}

export interface VeiculoComCliente extends Veiculo {
  cliente?: Cliente;
}

export interface Orcamento {
  id: string;
  numero: string;
  clienteId: string;
  veiculoId: string;
  itens: OrcamentoItem[];
  valorTotal: number;
  validade: string; // ISO date
  status: 'pendente' | 'aprovado' | 'recusado' | 'expirado';
  observacoes?: string;
  ordemServicoId?: string; // se foi convertido em OS
  createdAt: string;
  updatedAt: string;
}

export interface OrcamentoItem {
  id: string;
  descricao: string;
  tipo: 'servico' | 'peca';
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
}
