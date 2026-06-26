'use client';

/**
 * supabase-store.tsx
 * ─────────────────
 * Replaces the Zustand localStorage store with a Supabase-backed Context.
 * ALL pages continue to call `useStore()` with NO changes — only this file changes.
 */

import {
  createContext, useContext, useEffect, useState,
  useCallback, ReactNode,
} from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { generateId } from '@/lib/utils';
import type {
  Cliente, Veiculo, OrdemServico, Peca,
  Lancamento, Agendamento, Orcamento, ServicosCatalogo, ContaPagar,
} from '@/lib/types';

// ─── Mappers: snake_case DB → camelCase TS ────────────────────────────────────

// ── Retorna a data local no formato YYYY-MM-DD (sem deslocamento UTC) ──────────────
// new Date().toISOString() usa UTC, o que adianta a data 1 dia para fuso UTC-3.
function localDateStr(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>;

function mapCliente(r: Row): Cliente {
  return {
    id: r.id,
    nome: r.nome,
    telefone: r.telefone || '',
    whatsapp: r.whatsapp || '',
    cpfCnpj: r.cpf_cnpj || '',
    email: r.email || '',
    endereco: r.endereco || '',
    observacoes: r.observacoes || '',
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function mapVeiculo(r: Row): Veiculo {
  return {
    id: r.id,
    clienteId: r.cliente_id || '',
    marca: r.marca || '',
    modelo: r.modelo || '',
    ano: r.ano || 0,
    placa: r.placa || '',
    cor: r.cor || '',
    quilometragem: r.quilometragem || 0,
    observacoes: r.observacoes || '',
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function mapOrdem(r: Row): OrdemServico {
  return {
    id: r.id,
    numero: r.numero || '',
    clienteId: r.cliente_id || '',
    veiculoId: r.veiculo_id || '',
    quilometragemAtual: r.quilometragem_atual || 0,
    problemaRelatado: r.problema_relatado || '',
    descricaoServicoRealizado: r.descricao_servico_realizado || undefined,
    observacoesInternas: r.observacoes_internas || '',
    mecanico: r.mecanico || undefined,
    servicos: r.servicos || [],
    pecas: r.pecas || [],
    valorMaoDeObra: r.valor_mao_de_obra || 0,
    valorPecas: r.valor_pecas || 0,
    valorTotal: r.valor_total || 0,
    status: r.status || 'em_andamento',
    pagamento: r.pagamento || undefined,
    dataEntrada: r.data_entrada || r.created_at,
    dataConclusao: r.data_conclusao || undefined,
    lancamentoId: r.lancamento_id || undefined,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function mapPeca(r: Row): Peca {
  return {
    id: r.id,
    nome: r.nome,
    marcaVeiculo: r.marca_veiculo || undefined,
    modeloVeiculo: r.modelo_veiculo || undefined,
    anoVeiculo: r.ano_veiculo || undefined,
    motorizacao: r.motorizacao || undefined,
    cambio: r.cambio || undefined,
    codigo: r.codigo || undefined,
    quantidade: r.quantidade || 0,
    quantidadeMinima: r.quantidade_minima || 0,
    custo: r.custo || 0,
    fornecedor: r.fornecedor || undefined,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function mapLancamento(r: Row): Lancamento {
  return {
    id: r.id,
    tipo: r.tipo,
    descricao: r.descricao || '',
    valor: r.valor || 0,
    data: r.data || '',
    ordemServicoId: r.ordem_servico_id || undefined,
    clienteId: r.cliente_id || undefined,
    pago: r.pago ?? true,
    createdAt: r.created_at,
  };
}

function mapAgendamento(r: Row): Agendamento {
  return {
    id: r.id,
    clienteId: r.cliente_id || '',
    veiculoId: r.veiculo_id || '',
    servico: r.servico || '',
    data: r.data || '',
    hora: r.hora || '',
    status: r.status || 'agendado',
    observacoes: r.observacoes || undefined,
    createdAt: r.created_at,
  };
}

function mapOrcamento(r: Row): Orcamento {
  return {
    id: r.id,
    numero: r.numero || '',
    clienteId: r.cliente_id || '',
    veiculoId: r.veiculo_id || '',
    itens: r.itens || [],
    valorTotal: r.valor_total || 0,
    validade: r.validade || '',
    status: r.status || 'pendente',
    observacoes: r.observacoes || undefined,
    ordemServicoId: r.ordem_servico_id || undefined,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function mapServicoCatalogo(r: Row): ServicosCatalogo {
  return {
    id: r.id,
    nome: r.nome,
    categoria: r.categoria || undefined,
    valorPadrao: r.valor_padrao || 0,
    descricao: r.descricao || undefined,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function mapContaPagar(r: Row): ContaPagar {
  return {
    id: r.id,
    descricao: r.descricao,
    valor: r.valor || 0,
    vencimento: r.vencimento || '',
    fornecedor: r.fornecedor || undefined,
    pago: r.pago ?? false,
    dataPagamento: r.data_pagamento || undefined,
    createdAt: r.created_at,
  };
}

// ─── Store Context type ───────────────────────────────────────────────────────

interface StoreContextValue {
  clientes: Cliente[];
  veiculos: Veiculo[];
  ordens: OrdemServico[];
  pecas: Peca[];
  lancamentos: Lancamento[];
  agendamentos: Agendamento[];
  orcamentos: Orcamento[];
  servicosCatalogo: ServicosCatalogo[];
  contasPagar: ContaPagar[];
  loading: boolean;

  addCliente: (data: Omit<Cliente, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateCliente: (id: string, data: Partial<Cliente>) => Promise<void>;
  deleteCliente: (id: string) => Promise<void>;

  addVeiculo: (data: Omit<Veiculo, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateVeiculo: (id: string, data: Partial<Veiculo>) => Promise<void>;
  deleteVeiculo: (id: string) => Promise<void>;

  addOrdem: (data: Omit<OrdemServico, 'id' | 'numero' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateOrdem: (id: string, data: Partial<OrdemServico>) => Promise<void>;
  updateOrdemStatus: (id: string, status: OrdemServico['status']) => Promise<void>;
  deleteOrdem: (id: string) => Promise<void>;

  addPeca: (data: Omit<Peca, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updatePeca: (id: string, data: Partial<Peca>) => Promise<void>;
  deletePeca: (id: string) => Promise<void>;

  addLancamento: (data: Omit<Lancamento, 'id' | 'createdAt'>) => Promise<string>;
  updateLancamento: (id: string, data: Partial<Lancamento>) => Promise<void>;
  deleteLancamento: (id: string) => Promise<void>;

  addAgendamento: (data: Omit<Agendamento, 'id' | 'createdAt'>) => Promise<string>;
  updateAgendamento: (id: string, data: Partial<Agendamento>) => Promise<void>;
  deleteAgendamento: (id: string) => Promise<void>;

  addOrcamento: (data: Omit<Orcamento, 'id' | 'numero' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateOrcamento: (id: string, data: Partial<Orcamento>) => Promise<void>;
  deleteOrcamento: (id: string) => Promise<void>;
  approveOrcamento: (id: string) => Promise<string>;

  addServicoCatalogo: (data: Omit<ServicosCatalogo, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateServicoCatalogo: (id: string, data: Partial<ServicosCatalogo>) => Promise<void>;
  deleteServicoCatalogo: (id: string) => Promise<void>;

  addContaPagar: (data: Omit<ContaPagar, 'id' | 'createdAt'>) => Promise<string>;
  updateContaPagar: (id: string, data: Partial<ContaPagar>) => Promise<void>;
  deleteContaPagar: (id: string) => Promise<void>;
  pagarConta: (id: string) => Promise<void>;

  refreshAll: () => Promise<void>;
}

const StoreContext = createContext<StoreContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function SupabaseStoreProvider({ children }: { children: ReactNode }) {
  const { usuario, loading: authLoading } = useAuth();
  const empresaId = usuario?.empresaId;

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [pecas, setPecas] = useState<Peca[]>([]);
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([]);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [servicosCatalogo, setServicosCatalogo] = useState<ServicosCatalogo[]>([]);
  const [contasPagar, setContasPagar] = useState<ContaPagar[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!empresaId) return;
    setLoading(true);
    try {
      const [
        { data: c }, { data: v }, { data: o }, { data: p },
        { data: l }, { data: a }, { data: orc }, { data: sc }, { data: cp },
      ] = await Promise.all([
        supabase.from('clientes').select('*').eq('empresa_id', empresaId).order('nome'),
        supabase.from('veiculos').select('*').eq('empresa_id', empresaId),
        supabase.from('ordens_servico').select('*').eq('empresa_id', empresaId).order('created_at', { ascending: false }),
        supabase.from('pecas').select('*').eq('empresa_id', empresaId).order('nome'),
        supabase.from('lancamentos').select('*').eq('empresa_id', empresaId).order('data', { ascending: false }),
        supabase.from('agendamentos').select('*').eq('empresa_id', empresaId).order('data'),
        supabase.from('orcamentos').select('*').eq('empresa_id', empresaId).order('created_at', { ascending: false }),
        supabase.from('servicos_catalogo').select('*').eq('empresa_id', empresaId).order('nome'),
        supabase.from('contas_pagar').select('*').eq('empresa_id', empresaId).order('vencimento'),
      ]);
      setClientes((c || []).map(mapCliente));
      setVeiculos((v || []).map(mapVeiculo));
      setOrdens((o || []).map(mapOrdem));
      setPecas((p || []).map(mapPeca));
      setLancamentos((l || []).map(mapLancamento));
      setAgendamentos((a || []).map(mapAgendamento));
      setOrcamentos((orc || []).map(mapOrcamento));
      setServicosCatalogo((sc || []).map(mapServicoCatalogo));
      setContasPagar((cp || []).map(mapContaPagar));
    } finally {
      setLoading(false);
    }
  }, [empresaId]);

  useEffect(() => {
    if (!authLoading && empresaId) {
      fetchAll();
    } else if (!authLoading && !empresaId) {
      setLoading(false);
    }
  }, [authLoading, empresaId, fetchAll]);

  // ── Helpers ──
  async function nextOsNumber(): Promise<string> {
    const { count } = await supabase
      .from('ordens_servico')
      .select('*', { count: 'exact', head: true })
      .eq('empresa_id', empresaId!);
    return `OS-${((count || 0) + 1).toString().padStart(3, '0')}`;
  }

  async function nextOrcamentoNumber(): Promise<string> {
    const { count } = await supabase
      .from('orcamentos')
      .select('*', { count: 'exact', head: true })
      .eq('empresa_id', empresaId!);
    return `ORC-${((count || 0) + 1).toString().padStart(4, '0')}`;
  }

  // ── CLIENTE ──
  const addCliente = useCallback(async (data: Omit<Cliente, 'id' | 'createdAt' | 'updatedAt'>) => {
    const { data: row, error } = await supabase.from('clientes').insert({
      empresa_id: empresaId,
      nome: data.nome, telefone: data.telefone,
      whatsapp: data.whatsapp, cpf_cnpj: data.cpfCnpj,
      email: data.email, endereco: data.endereco, observacoes: data.observacoes,
    }).select().single();
    if (error) throw error;
    const mapped = mapCliente(row);
    setClientes(prev => [...prev, mapped].sort((a, b) => a.nome.localeCompare(b.nome)));
    return row.id as string;
  }, [empresaId]);

  const updateCliente = useCallback(async (id: string, data: Partial<Cliente>) => {
    const payload: Row = {};
    if (data.nome !== undefined) payload.nome = data.nome;
    if (data.telefone !== undefined) payload.telefone = data.telefone;
    if (data.whatsapp !== undefined) payload.whatsapp = data.whatsapp;
    if (data.cpfCnpj !== undefined) payload.cpf_cnpj = data.cpfCnpj;
    if (data.email !== undefined) payload.email = data.email;
    if (data.endereco !== undefined) payload.endereco = data.endereco;
    if (data.observacoes !== undefined) payload.observacoes = data.observacoes;
    await supabase.from('clientes').update(payload).eq('id', id).eq('empresa_id', empresaId!);
    setClientes(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  }, [empresaId]);

  const deleteCliente = useCallback(async (id: string) => {
    await supabase.from('clientes').delete().eq('id', id).eq('empresa_id', empresaId!);
    setClientes(prev => prev.filter(c => c.id !== id));
  }, [empresaId]);

  // ── VEICULO ──
  const addVeiculo = useCallback(async (data: Omit<Veiculo, 'id' | 'createdAt' | 'updatedAt'>) => {
    const { data: row, error } = await supabase.from('veiculos').insert({
      empresa_id: empresaId,
      cliente_id: data.clienteId || null,
      marca: data.marca, modelo: data.modelo, ano: data.ano,
      placa: data.placa, cor: data.cor,
      quilometragem: data.quilometragem,
      observacoes: data.observacoes,
    }).select().single();
    if (error) throw error;
    const mapped = mapVeiculo(row);
    setVeiculos(prev => [...prev, mapped]);
    return row.id as string;
  }, [empresaId]);

  const updateVeiculo = useCallback(async (id: string, data: Partial<Veiculo>) => {
    const payload: Row = {};
    if (data.clienteId !== undefined) payload.cliente_id = data.clienteId;
    if (data.marca !== undefined) payload.marca = data.marca;
    if (data.modelo !== undefined) payload.modelo = data.modelo;
    if (data.ano !== undefined) payload.ano = data.ano;
    if (data.placa !== undefined) payload.placa = data.placa;
    if (data.cor !== undefined) payload.cor = data.cor;
    if (data.quilometragem !== undefined) payload.quilometragem = data.quilometragem;
    if (data.observacoes !== undefined) payload.observacoes = data.observacoes;
    await supabase.from('veiculos').update(payload).eq('id', id).eq('empresa_id', empresaId!);
    setVeiculos(prev => prev.map(v => v.id === id ? { ...v, ...data } : v));
  }, [empresaId]);

  const deleteVeiculo = useCallback(async (id: string) => {
    await supabase.from('veiculos').delete().eq('id', id).eq('empresa_id', empresaId!);
    setVeiculos(prev => prev.filter(v => v.id !== id));
  }, [empresaId]);

  // ── ORDEM ──
  const addOrdem = useCallback(async (data: Omit<OrdemServico, 'id' | 'numero' | 'createdAt' | 'updatedAt'>) => {
    const numero = await nextOsNumber();
    const payload: Record<string, unknown> = {
      empresa_id: empresaId, numero,
      cliente_id: data.clienteId || null,
      veiculo_id: data.veiculoId || null,
      status: data.status,
      problema_relatado: data.problemaRelatado,
      observacoes_internas: data.observacoesInternas,
      mecanico: data.mecanico || null,
      quilometragem_atual: data.quilometragemAtual,
      valor_mao_de_obra: data.valorMaoDeObra,
      valor_pecas: data.valorPecas,
      valor_total: data.valorTotal,
      servicos: data.servicos,
      pecas: data.pecas,
      data_entrada: data.dataEntrada,
      data_conclusao: data.dataConclusao || null,
      pagamento: data.pagamento || null,
    };
    // Só inclui se tiver valor — coluna pode não existir em instâncias antigas
    if (data.descricaoServicoRealizado) {
      payload.descricao_servico_realizado = data.descricaoServicoRealizado;
    }
    const { data: row, error } = await supabase.from('ordens_servico').insert(payload).select().single();
    if (error) {
      console.error('[addOrdem] Supabase error:', error);
      throw error;
    }
    const mapped = mapOrdem(row);
    setOrdens(prev => [mapped, ...prev]);
    return row.id as string;
  }, [empresaId]);

  const updateOrdem = useCallback(async (id: string, data: Partial<OrdemServico>) => {
    const payload: Row = {};
    if (data.status !== undefined) payload.status = data.status;
    if (data.problemaRelatado !== undefined) payload.problema_relatado = data.problemaRelatado;
    if (data.observacoesInternas !== undefined) payload.observacoes_internas = data.observacoesInternas;
    if (data.mecanico !== undefined) payload.mecanico = data.mecanico;
    if (data.quilometragemAtual !== undefined) payload.quilometragem_atual = data.quilometragemAtual;
    if (data.valorMaoDeObra !== undefined) payload.valor_mao_de_obra = data.valorMaoDeObra;
    if (data.valorPecas !== undefined) payload.valor_pecas = data.valorPecas;
    if (data.valorTotal !== undefined) payload.valor_total = data.valorTotal;
    if (data.servicos !== undefined) payload.servicos = data.servicos;
    if (data.pecas !== undefined) payload.pecas = data.pecas;
    if (data.clienteId !== undefined) payload.cliente_id = data.clienteId;
    if (data.veiculoId !== undefined) payload.veiculo_id = data.veiculoId;
    if (data.dataConclusao !== undefined) payload.data_conclusao = data.dataConclusao;
    if (data.lancamentoId !== undefined) payload.lancamento_id = data.lancamentoId;
    if (data.pagamento !== undefined) payload.pagamento = data.pagamento;
    if (data.descricaoServicoRealizado !== undefined) payload.descricao_servico_realizado = data.descricaoServicoRealizado;

    await supabase.from('ordens_servico').update(payload).eq('id', id).eq('empresa_id', empresaId!);
    setOrdens(prev => prev.map(o => o.id === id ? { ...o, ...data } : o));

    // Auto-lançamento when delivered
    if (data.status === 'entregue') {
      const ordem = ordens.find(o => o.id === id);
      if (ordem) {
        const total = data.valorTotal ?? ordem.valorTotal;
        if (total > 0) {
          const { data: lancRow } = await supabase.from('lancamentos').insert({
            empresa_id: empresaId,
            tipo: 'entrada',
            descricao: `${ordem.numero} - entrega (auto)`,
            valor: total,
            data: localDateStr(),
            ordem_servico_id: id,
            cliente_id: ordem.clienteId || null,
            pago: true,
          }).select().single();
          if (lancRow) {
            const mappedLanc = mapLancamento(lancRow);
            setLancamentos(prev => [mappedLanc, ...prev]);
            // update lancamentoId in ordem
            await supabase.from('ordens_servico').update({ lancamento_id: lancRow.id }).eq('id', id);
            setOrdens(prev => prev.map(o => o.id === id ? { ...o, lancamentoId: lancRow.id } : o));
          }
        }
      }
    }
  }, [empresaId, ordens]);

  const deleteOrdem = useCallback(async (id: string) => {
    await supabase.from('ordens_servico').delete().eq('id', id).eq('empresa_id', empresaId!);
    setOrdens(prev => prev.filter(o => o.id !== id));
  }, [empresaId]);

  // ── PECA ──
  const addPeca = useCallback(async (data: Omit<Peca, 'id' | 'createdAt' | 'updatedAt'>) => {
    const { data: row, error } = await supabase.from('pecas').insert({
      empresa_id: empresaId,
      nome: data.nome, codigo: data.codigo,
      quantidade: data.quantidade,
      quantidade_minima: data.quantidadeMinima,
      custo: data.custo,
      fornecedor: data.fornecedor,
      marca_veiculo: data.marcaVeiculo,
      modelo_veiculo: data.modeloVeiculo,
      ano_veiculo: data.anoVeiculo,
      motorizacao: data.motorizacao,
      cambio: data.cambio,
    }).select().single();
    if (error) throw error;
    const mapped = mapPeca(row);
    setPecas(prev => [...prev, mapped]);
    return row.id as string;
  }, [empresaId]);

  const updatePeca = useCallback(async (id: string, data: Partial<Peca>) => {
    const payload: Row = {};
    if (data.nome !== undefined) payload.nome = data.nome;
    if (data.codigo !== undefined) payload.codigo = data.codigo;
    if (data.quantidade !== undefined) payload.quantidade = data.quantidade;
    if (data.quantidadeMinima !== undefined) payload.quantidade_minima = data.quantidadeMinima;
    if (data.custo !== undefined) payload.custo = data.custo;
    if (data.fornecedor !== undefined) payload.fornecedor = data.fornecedor;
    if (data.marcaVeiculo !== undefined) payload.marca_veiculo = data.marcaVeiculo;
    if (data.modeloVeiculo !== undefined) payload.modelo_veiculo = data.modeloVeiculo;
    if (data.anoVeiculo !== undefined) payload.ano_veiculo = data.anoVeiculo;
    if (data.motorizacao !== undefined) payload.motorizacao = data.motorizacao;
    if (data.cambio !== undefined) payload.cambio = data.cambio;
    await supabase.from('pecas').update(payload).eq('id', id).eq('empresa_id', empresaId!);
    setPecas(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
  }, [empresaId]);

  const deletePeca = useCallback(async (id: string) => {
    await supabase.from('pecas').delete().eq('id', id).eq('empresa_id', empresaId!);
    setPecas(prev => prev.filter(p => p.id !== id));
  }, [empresaId]);

  // ── LANCAMENTO ──
  const addLancamento = useCallback(async (data: Omit<Lancamento, 'id' | 'createdAt'>) => {
    const { data: row, error } = await supabase.from('lancamentos').insert({
      empresa_id: empresaId,
      tipo: data.tipo, descricao: data.descricao,
      valor: data.valor, data: data.data,
      ordem_servico_id: data.ordemServicoId || null,
      cliente_id: data.clienteId || null,
      pago: data.pago ?? true,
    }).select().single();
    if (error) throw error;
    const mapped = mapLancamento(row);
    setLancamentos(prev => [mapped, ...prev]);
    return row.id as string;
  }, [empresaId]);

  const updateLancamento = useCallback(async (id: string, data: Partial<Lancamento>) => {
    const payload: Row = {};
    if (data.tipo !== undefined) payload.tipo = data.tipo;
    if (data.descricao !== undefined) payload.descricao = data.descricao;
    if (data.valor !== undefined) payload.valor = data.valor;
    if (data.data !== undefined) payload.data = data.data;
    if (data.pago !== undefined) payload.pago = data.pago;
    await supabase.from('lancamentos').update(payload).eq('id', id).eq('empresa_id', empresaId!);
    setLancamentos(prev => prev.map(l => l.id === id ? { ...l, ...data } : l));
  }, [empresaId]);

  const deleteLancamento = useCallback(async (id: string) => {
    await supabase.from('lancamentos').delete().eq('id', id).eq('empresa_id', empresaId!);
    setLancamentos(prev => prev.filter(l => l.id !== id));
  }, [empresaId]);

  // ── AGENDAMENTO ──
  const addAgendamento = useCallback(async (data: Omit<Agendamento, 'id' | 'createdAt'>) => {
    const { data: row, error } = await supabase.from('agendamentos').insert({
      empresa_id: empresaId,
      cliente_id: data.clienteId || null,
      veiculo_id: data.veiculoId || null,
      servico: data.servico, data: data.data,
      hora: data.hora, status: data.status,
      observacoes: data.observacoes,
    }).select().single();
    if (error) throw error;
    const mapped = mapAgendamento(row);
    setAgendamentos(prev => [...prev, mapped]);
    return row.id as string;
  }, [empresaId]);

  const updateAgendamento = useCallback(async (id: string, data: Partial<Agendamento>) => {
    const payload: Row = {};
    if (data.clienteId !== undefined) payload.cliente_id = data.clienteId;
    if (data.veiculoId !== undefined) payload.veiculo_id = data.veiculoId;
    if (data.servico !== undefined) payload.servico = data.servico;
    if (data.data !== undefined) payload.data = data.data;
    if (data.hora !== undefined) payload.hora = data.hora;
    if (data.status !== undefined) payload.status = data.status;
    if (data.observacoes !== undefined) payload.observacoes = data.observacoes;
    await supabase.from('agendamentos').update(payload).eq('id', id).eq('empresa_id', empresaId!);
    setAgendamentos(prev => prev.map(a => a.id === id ? { ...a, ...data } : a));
  }, [empresaId]);

  const deleteAgendamento = useCallback(async (id: string) => {
    await supabase.from('agendamentos').delete().eq('id', id).eq('empresa_id', empresaId!);
    setAgendamentos(prev => prev.filter(a => a.id !== id));
  }, [empresaId]);

  // ── ORCAMENTO ──
  const addOrcamento = useCallback(async (data: Omit<Orcamento, 'id' | 'numero' | 'createdAt' | 'updatedAt'>) => {
    const numero = await nextOrcamentoNumber();
    const { data: row, error } = await supabase.from('orcamentos').insert({
      empresa_id: empresaId, numero,
      cliente_id: data.clienteId || null,
      veiculo_id: data.veiculoId || null,
      itens: data.itens, valor_total: data.valorTotal,
      validade: data.validade, status: data.status,
      observacoes: data.observacoes,
    }).select().single();
    if (error) throw error;
    const mapped = mapOrcamento(row);
    setOrcamentos(prev => [mapped, ...prev]);
    return row.id as string;
  }, [empresaId]);

  const updateOrcamento = useCallback(async (id: string, data: Partial<Orcamento>) => {
    const payload: Row = {};
    if (data.status !== undefined) payload.status = data.status;
    if (data.itens !== undefined) payload.itens = data.itens;
    if (data.valorTotal !== undefined) payload.valor_total = data.valorTotal;
    if (data.observacoes !== undefined) payload.observacoes = data.observacoes;
    if (data.ordemServicoId !== undefined) payload.ordem_servico_id = data.ordemServicoId;
    if (data.clienteId !== undefined) payload.cliente_id = data.clienteId;
    if (data.veiculoId !== undefined) payload.veiculo_id = data.veiculoId;
    if (data.validade !== undefined) payload.validade = data.validade;
    await supabase.from('orcamentos').update(payload).eq('id', id).eq('empresa_id', empresaId!);
    setOrcamentos(prev => prev.map(o => o.id === id ? { ...o, ...data } : o));
  }, [empresaId]);


  const deleteOrcamento = useCallback(async (id: string) => {
    await supabase.from('orcamentos').delete().eq('id', id).eq('empresa_id', empresaId!);
    setOrcamentos(prev => prev.filter(o => o.id !== id));
  }, [empresaId]);

  const approveOrcamento = useCallback(async (id: string) => {
    const orc = orcamentos.find(o => o.id === id);
    if (!orc) throw new Error('Orçamento não encontrado');

    const numero = await nextOsNumber();
    const servicosItems = orc.itens.filter(i => i.tipo === 'servico');
    const pecasItems = orc.itens.filter(i => i.tipo === 'peca');

    const { data: row, error } = await supabase.from('ordens_servico').insert({
      empresa_id: empresaId, numero,
      cliente_id: orc.clienteId || null,
      veiculo_id: orc.veiculoId || null,
      status: 'em_andamento',
      problema_relatado: orc.observacoes || 'Conforme orçamento aprovado',
      observacoes_internas: `Gerado do orçamento ${orc.numero}`,
      quilometragem_atual: 0,
      valor_mao_de_obra: servicosItems.reduce((s, i) => s + i.valorTotal, 0),
      valor_pecas: pecasItems.reduce((s, i) => s + i.valorTotal, 0),
      valor_total: orc.valorTotal,
      servicos: servicosItems.map(i => ({
        id: generateId(), descricao: i.descricao, valor: i.valorTotal,
      })),
      pecas: pecasItems.map(i => ({
        id: generateId(), nome: i.descricao, quantidade: i.quantidade,
        valorUnitario: i.valorUnitario, valorTotal: i.valorTotal,
      })),
      data_entrada: localDateStr(),
    }).select().single();
    if (error) throw error;

    const osId = row.id as string;
    await supabase.from('orcamentos').update({
      status: 'aprovado', ordem_servico_id: osId,
    }).eq('id', id);

    const mappedOS = mapOrdem(row);
    setOrdens(prev => [mappedOS, ...prev]);
    setOrcamentos(prev => prev.map(o => o.id === id
      ? { ...o, status: 'aprovado' as const, ordemServicoId: osId }
      : o
    ));
    return osId;
  }, [empresaId, orcamentos]);

  // ── SERVICO CATALOGO ──
  const addServicoCatalogo = useCallback(async (data: Omit<ServicosCatalogo, 'id' | 'createdAt' | 'updatedAt'>) => {
    const { data: row, error } = await supabase.from('servicos_catalogo').insert({
      empresa_id: empresaId,
      nome: data.nome, categoria: data.categoria,
      valor_padrao: data.valorPadrao, descricao: data.descricao,
    }).select().single();
    if (error) throw error;
    const mapped = mapServicoCatalogo(row);
    setServicosCatalogo(prev => [...prev, mapped]);
    return row.id as string;
  }, [empresaId]);

  const updateServicoCatalogo = useCallback(async (id: string, data: Partial<ServicosCatalogo>) => {
    const payload: Row = {};
    if (data.nome !== undefined) payload.nome = data.nome;
    if (data.categoria !== undefined) payload.categoria = data.categoria;
    if (data.valorPadrao !== undefined) payload.valor_padrao = data.valorPadrao;
    if (data.descricao !== undefined) payload.descricao = data.descricao;
    await supabase.from('servicos_catalogo').update(payload).eq('id', id).eq('empresa_id', empresaId!);
    setServicosCatalogo(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
  }, [empresaId]);

  const deleteServicoCatalogo = useCallback(async (id: string) => {
    await supabase.from('servicos_catalogo').delete().eq('id', id).eq('empresa_id', empresaId!);
    setServicosCatalogo(prev => prev.filter(s => s.id !== id));
  }, [empresaId]);

  // ── CONTA PAGAR ──
  const addContaPagar = useCallback(async (data: Omit<ContaPagar, 'id' | 'createdAt'>) => {
    const { data: row, error } = await supabase.from('contas_pagar').insert({
      empresa_id: empresaId,
      descricao: data.descricao, fornecedor: data.fornecedor,
      valor: data.valor, vencimento: data.vencimento,
      pago: data.pago ?? false,
      data_pagamento: data.dataPagamento || null,
    }).select().single();
    if (error) throw error;
    const mapped = mapContaPagar(row);
    setContasPagar(prev => [...prev, mapped]);
    return row.id as string;
  }, [empresaId]);

  const updateContaPagar = useCallback(async (id: string, data: Partial<ContaPagar>) => {
    const payload: Row = {};
    if (data.descricao !== undefined) payload.descricao = data.descricao;
    if (data.valor !== undefined) payload.valor = data.valor;
    if (data.vencimento !== undefined) payload.vencimento = data.vencimento;
    if (data.pago !== undefined) payload.pago = data.pago;
    if (data.dataPagamento !== undefined) payload.data_pagamento = data.dataPagamento;
    await supabase.from('contas_pagar').update(payload).eq('id', id).eq('empresa_id', empresaId!);
    setContasPagar(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  }, [empresaId]);

  const deleteContaPagar = useCallback(async (id: string) => {
    await supabase.from('contas_pagar').delete().eq('id', id).eq('empresa_id', empresaId!);
    setContasPagar(prev => prev.filter(c => c.id !== id));
  }, [empresaId]);

  const pagarConta = useCallback(async (id: string) => {
    const today = localDateStr();
    await supabase.from('contas_pagar').update({
      pago: true, data_pagamento: today,
    }).eq('id', id).eq('empresa_id', empresaId!);
    setContasPagar(prev => prev.map(c => c.id === id
      ? { ...c, pago: true, dataPagamento: today }
      : c
    ));
  }, [empresaId]);

  return (
    <StoreContext.Provider value={{
      clientes, veiculos, ordens, pecas,
      lancamentos, agendamentos, orcamentos,
      servicosCatalogo, contasPagar, loading,
      addCliente, updateCliente, deleteCliente,
      addVeiculo, updateVeiculo, deleteVeiculo,
      addOrdem, updateOrdem, deleteOrdem,
      updateOrdemStatus: (id: string, status: OrdemServico['status']) => updateOrdem(id, { status }),
      addPeca, updatePeca, deletePeca,
      addLancamento, updateLancamento, deleteLancamento,
      addAgendamento, updateAgendamento, deleteAgendamento,
      addOrcamento, updateOrcamento, deleteOrcamento, approveOrcamento,
      addServicoCatalogo, updateServicoCatalogo, deleteServicoCatalogo,
      addContaPagar, updateContaPagar, deleteContaPagar, pagarConta,
      refreshAll: fetchAll,
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within SupabaseStoreProvider');
  return ctx;
}
