'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { ServicoOS, PecaOS } from '@/lib/types';
import { formatCurrency, generateId, cn } from '@/lib/utils';
import {
  ArrowLeft, Plus, Trash2, ChevronDown, Save,
  User, Car, FileText, Wrench, Package, CalendarClock, ChevronUp
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

const STATUS_OPTIONS = [
  { value: 'aberta', label: 'Aberta' },
  { value: 'em_andamento', label: 'Em Andamento' },
  { value: 'aguardando_peca', label: 'Aguardando Peça' },
];

// ─── Section Card — colorido por tipo (fora do componente!) ──────
function SectionCard({
  title, icon: Icon, color = 'orange', children
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  color?: 'blue' | 'orange' | 'red' | 'green' | 'purple' | 'amber';
  children: React.ReactNode;
}) {
  const colorMap = {
    blue:   { border: 'border-l-blue-500',    bg: 'bg-blue-500/10',    text: 'text-blue-500',    header: 'bg-blue-500/5' },
    orange: { border: 'border-l-orange-500',  bg: 'bg-orange-500/10',  text: 'text-orange-500',  header: 'bg-orange-500/5' },
    red:    { border: 'border-l-red-500',     bg: 'bg-red-500/10',     text: 'text-red-500',     header: 'bg-red-500/5' },
    green:  { border: 'border-l-emerald-500', bg: 'bg-emerald-500/10', text: 'text-emerald-500', header: 'bg-emerald-500/5' },
    purple: { border: 'border-l-purple-500',  bg: 'bg-purple-500/10',  text: 'text-purple-500',  header: 'bg-purple-500/5' },
    amber:  { border: 'border-l-amber-500',   bg: 'bg-amber-500/10',   text: 'text-amber-500',   header: 'bg-amber-500/5' },
  };
  const c = colorMap[color];
  return (
    <div className={cn('rounded-2xl border-l-4 border border-[rgb(var(--card-border))]', c.border, 'bg-[rgb(var(--card))]')}>
      <div className={cn('flex items-center gap-2.5 px-5 py-3.5 rounded-tl-xl rounded-tr-xl', c.header)}>
        <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0', c.bg)}>
          <Icon className={cn('w-4 h-4', c.text)} />
        </div>
        <h3 className={cn('font-semibold text-sm', c.text)}>{title}</h3>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

// ─── Input styles (fora do componente!) ─────────────────────────
const inputCn = cn(
  'w-full px-3 py-2.5 rounded-xl text-sm border',
  'bg-[rgb(var(--input-bg))] border-[rgb(var(--input-border))]',
  'text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))]',
  'focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-colors'
);

// ─── Serviço individual com revisão embutida ─────────────────────
function ServicoRow({
  servico,
  onRemove,
  onUpdate,
  kmAtual,
}: {
  servico: ServicoOS;
  onRemove: (id: string) => void;
  onUpdate: (id: string, patch: Partial<ServicoOS>) => void;
  kmAtual: number;
}) {
  const [showRevisao, setShowRevisao] = useState(!!(servico.proximaRevisaoKm || servico.proximaRevisaoData));
  return (
    <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 overflow-hidden">
      {/* Linha principal */}
      <div className="flex items-center gap-2 px-3 py-2.5">
        <span className="flex-1 text-sm text-[rgb(var(--foreground))] font-medium">{servico.descricao}</span>
        <span className="text-sm font-semibold text-orange-500 flex-shrink-0">{formatCurrency(servico.valor)}</span>
        <button
          type="button"
          onClick={() => setShowRevisao(v => !v)}
          className={cn(
            'p-1 rounded-lg transition-colors text-xs flex items-center gap-1 flex-shrink-0',
            showRevisao
              ? 'bg-purple-500/15 text-purple-500'
              : 'text-[rgb(var(--muted-foreground))] hover:bg-purple-500/10 hover:text-purple-500'
          )}
          title="Definir próxima revisão para este serviço"
        >
          <CalendarClock className="w-3.5 h-3.5" />
          <ChevronUp className={cn('w-3 h-3 transition-transform', !showRevisao && 'rotate-180')} />
        </button>
        <button
          type="button"
          onClick={() => onRemove(servico.id)}
          className="p-1 text-[rgb(var(--muted-foreground))] hover:text-red-500 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Revisão por serviço */}
      {showRevisao && (
        <div className="px-3 pb-3 pt-0 border-t border-purple-500/15 bg-purple-500/5">
          <p className="text-xs text-purple-500 font-medium mt-2 mb-2">
            Próxima revisão — {servico.descricao}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-[rgb(var(--muted-foreground))] mb-1">
                KM
                {kmAtual > 0 && (
                  <span className="text-purple-500 ml-1">(atual: {kmAtual.toLocaleString('pt-BR')})</span>
                )}
              </label>
              <input
                type="number"
                placeholder="Ex: 55000"
                value={servico.proximaRevisaoKm ?? ''}
                onChange={e => onUpdate(servico.id, { proximaRevisaoKm: e.target.value ? Number(e.target.value) : undefined })}
                className={inputCn}
                min="0"
              />
            </div>
            <div>
              <label className="block text-xs text-[rgb(var(--muted-foreground))] mb-1">Data</label>
              <input
                type="date"
                value={servico.proximaRevisaoData ?? ''}
                onChange={e => onUpdate(servico.id, { proximaRevisaoData: e.target.value || undefined })}
                className={inputCn}
              />
            </div>
          </div>
          {(servico.proximaRevisaoKm || servico.proximaRevisaoData) && (
            <div className="mt-2 text-xs text-purple-600 dark:text-purple-400 bg-purple-500/10 rounded-lg px-3 py-1.5">
              {servico.proximaRevisaoKm && <span>Retornar em <strong>{servico.proximaRevisaoKm.toLocaleString('pt-BR')} km</strong></span>}
              {servico.proximaRevisaoKm && servico.proximaRevisaoData && <span className="mx-2">·</span>}
              {servico.proximaRevisaoData && <span>ou em <strong>{new Date(servico.proximaRevisaoData + 'T12:00:00').toLocaleDateString('pt-BR')}</strong></span>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function NovaOrdemPage() {
  const router = useRouter();
  const { clientes, veiculos, pecas: stockPecas, servicosCatalogo, addOrdem } = useStore();

  // — Cliente/Veículo/Status
  const [clienteId, setClienteId] = useState('');
  const [veiculoId, setVeiculoId] = useState('');
  const [quilometragem, setQuilometragem] = useState('');
  const [status, setStatus] = useState<'aberta' | 'em_andamento' | 'aguardando_peca'>('aberta');

  // — Problema
  const [problema, setProblema] = useState('');
  const [observacoes, setObservacoes] = useState('');

  // — Serviços
  const [servicos, setServicos] = useState<ServicoOS[]>([]);
  const [novoServico, setNovoServico] = useState('');
  const [novoServicoValor, setNovoServicoValor] = useState('');
  const [showServicoCatalogo, setShowServicoCatalogo] = useState(false);
  const servicoInputRef = useRef<HTMLInputElement>(null);

  // — Peças (com autocomplete do estoque)
  const [pecasOS, setPecasOS] = useState<PecaOS[]>([]);
  const [novaPeca, setNovaPeca] = useState('');
  const [novaPecaQtd, setNovaPecaQtd] = useState('1');
  const [novaPecaValor, setNovaPecaValor] = useState('');
  const [showPecaSuggestions, setShowPecaSuggestions] = useState(false);
  const pecaInputRef = useRef<HTMLInputElement>(null);

  const clienteVeiculos = veiculos.filter((v) => v.clienteId === clienteId);
  const veiculoSelecionado = veiculos.find(v => v.id === veiculoId);
  // KM para cálculos de revisão: prioriza o valor digitado na OS
  const kmAtual = Number(quilometragem) || 0;

  const valorMaoDeObra = servicos.reduce((s, svc) => s + svc.valor, 0);
  const valorPecasTotal = pecasOS.reduce((s, p) => s + p.valorTotal, 0);
  const valorTotal = valorMaoDeObra + valorPecasTotal;

  // Busca expandida: nome, categoria, descrição
  const servicoSuggestions = (() => {
    const q = novoServico.toLowerCase().trim();
    if (!q) return servicosCatalogo.slice(0, 10);
    return servicosCatalogo.filter(s =>
      s.nome.toLowerCase().includes(q) ||
      (s.categoria || '').toLowerCase().includes(q) ||
      (s.descricao || '').toLowerCase().includes(q)
    ).slice(0, 10);
  })();

  // Busca expandida: nome, código, marca, modelo, fornecedor
  const pecaSuggestions = (() => {
    const q = novaPeca.toLowerCase().trim();
    if (!q) return stockPecas.slice(0, 10);
    return stockPecas.filter(p =>
      p.nome.toLowerCase().includes(q) ||
      (p.codigo || '').toLowerCase().includes(q) ||
      (p.marcaVeiculo || '').toLowerCase().includes(q) ||
      (p.modeloVeiculo || '').toLowerCase().includes(q) ||
      (p.fornecedor || '').toLowerCase().includes(q)
    ).slice(0, 10);
  })();

  function addServico() {
    if (!novoServico.trim()) return;
    setServicos(prev => [...prev, {
      id: generateId(),
      descricao: novoServico,
      valor: Number(novoServicoValor) || 0,
    }]);
    setNovoServico('');
    setNovoServicoValor('');
    setShowServicoCatalogo(false);
  }

  function selectServicoCatalogo(nome: string, valor: number) {
    setServicos(prev => [...prev, { id: generateId(), descricao: nome, valor }]);
    setNovoServico('');
    setNovoServicoValor('');
    setShowServicoCatalogo(false);
  }

  function updateServico(id: string, patch: Partial<ServicoOS>) {
    setServicos(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s));
  }

  function addPeca() {
    if (!novaPeca.trim() || !novaPecaValor) {
      toast.error('Informe o nome e o valor da peça');
      return;
    }
    const qtd = Number(novaPecaQtd) || 1;
    const valUnit = Number(novaPecaValor);
    setPecasOS(prev => [...prev, {
      id: generateId(),
      nome: novaPeca,
      quantidade: qtd,
      valorUnitario: valUnit,
      valorTotal: qtd * valUnit,
    }]);
    setNovaPeca('');
    setNovaPecaQtd('1');
    setNovaPecaValor('');
    setShowPecaSuggestions(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!clienteId || !veiculoId || !problema) {
      toast.error('Preencha os campos obrigatórios: cliente, veículo e problema');
      return;
    }
    const id = addOrdem({
      clienteId,
      veiculoId,
      quilometragemAtual: Number(quilometragem) || 0,
      problemaRelatado: problema,
      observacoesInternas: observacoes,
      servicos,
      pecas: pecasOS,
      valorMaoDeObra,
      valorPecas: valorPecasTotal,
      valorTotal,
      status,
      dataEntrada: new Date().toISOString(),
    });
    toast.success('OS criada com sucesso!');
    router.push(`/ordens/${id}`);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <Link href="/ordens" className="inline-flex items-center gap-1.5 text-sm text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]">
        <ArrowLeft className="w-4 h-4" />
        Voltar para OS
      </Link>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* ─── CLIENTE E VEÍCULO ─── azul */}
        <SectionCard title="Cliente e Veículo" icon={User} color="blue">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[rgb(var(--muted-foreground))] uppercase tracking-wide mb-1.5">Cliente *</label>
              <div className="relative">
                <select
                  value={clienteId}
                  onChange={(e) => { setClienteId(e.target.value); setVeiculoId(''); }}
                  className={cn(inputCn, 'appearance-none pr-8')}
                >
                  <option value="">Selecione o cliente</option>
                  {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--muted-foreground))] pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[rgb(var(--muted-foreground))] uppercase tracking-wide mb-1.5">Veículo *</label>
              <div className="relative">
                <select
                  value={veiculoId}
                  onChange={(e) => setVeiculoId(e.target.value)}
                  disabled={!clienteId}
                  className={cn(inputCn, 'appearance-none pr-8 disabled:opacity-50')}
                >
                  <option value="">Selecione o veículo</option>
                  {clienteVeiculos.map((v) => (
                    <option key={v.id} value={v.id}>{v.marca} {v.modelo} — {v.placa}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--muted-foreground))] pointer-events-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[rgb(var(--muted-foreground))] uppercase tracking-wide mb-1.5">KM Atual</label>
                <input
                  type="number"
                  value={quilometragem}
                  onChange={(e) => setQuilometragem(e.target.value)}
                  className={inputCn}
                  placeholder={veiculoSelecionado ? String(veiculoSelecionado.quilometragem) : '0'}
                  min="0"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[rgb(var(--muted-foreground))] uppercase tracking-wide mb-1.5">Status Inicial</label>
                <div className="relative">
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as typeof status)}
                    className={cn(inputCn, 'appearance-none pr-8')}
                  >
                    {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--muted-foreground))] pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* ─── PROBLEMA RELATADO ─── vermelho */}
        <SectionCard title="Problema Relatado" icon={FileText} color="red">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[rgb(var(--muted-foreground))] uppercase tracking-wide mb-1.5">Descrição do Problema *</label>
              <textarea
                value={problema}
                onChange={(e) => setProblema(e.target.value)}
                className={cn(inputCn, 'resize-none')}
                rows={3}
                placeholder="Descreva o problema relatado pelo cliente..."
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[rgb(var(--muted-foreground))] uppercase tracking-wide mb-1.5">Observações Internas 🔒</label>
              <textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                className={cn(inputCn, 'resize-none')}
                rows={2}
                placeholder="Anotações internas da equipe (não aparece no relatório do cliente)..."
              />
            </div>
          </div>
        </SectionCard>

        {/* ─── SERVIÇOS ─── laranja — cada serviço tem revisão embutida */}
        <SectionCard title="Serviços Executados" icon={Wrench} color="orange">
          <div className="space-y-3">
            <p className="text-xs text-[rgb(var(--muted-foreground))] -mt-1 mb-1">
              Clique em <CalendarClock className="w-3 h-3 inline text-purple-500 mx-0.5" /> em cada serviço para definir a próxima revisão individualmente.
            </p>

            {servicos.map((s) => (
              <ServicoRow
                key={s.id}
                servico={s}
                onRemove={(id) => setServicos(p => p.filter(x => x.id !== id))}
                onUpdate={updateServico}
                kmAtual={kmAtual}
              />
            ))}

            <div className="flex gap-2 relative">
              <div className="flex-1 relative z-30">
                <input
                  ref={servicoInputRef}
                  type="text"
                  placeholder="Buscar no catálogo ou digitar..."
                  value={novoServico}
                  onChange={(e) => { setNovoServico(e.target.value); setShowServicoCatalogo(true); }}
                  onFocus={() => setShowServicoCatalogo(true)}
                  onBlur={() => setTimeout(() => setShowServicoCatalogo(false), 200)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addServico(); } }}
                  className={cn(inputCn, 'w-full')}
                />
                {showServicoCatalogo && (
                  <div
                    className="absolute top-full left-0 right-0 mt-1 rounded-xl shadow-2xl border border-[rgb(var(--card-border))] overflow-hidden z-[999]"
                    style={{ backgroundColor: 'rgb(var(--card))' }}
                  >
                    {servicosCatalogo.length === 0 ? (
                      <p className="px-3 py-3 text-xs text-[rgb(var(--muted-foreground))]">Nenhum serviço no catálogo. Cadastre em <strong>Cat. Serviços</strong> na sidebar.</p>
                    ) : (
                      <div className="max-h-48 overflow-y-auto">
                        {servicoSuggestions.map(s => (
                          <button
                            key={s.id}
                            type="button"
                            onMouseDown={e => { e.preventDefault(); selectServicoCatalogo(s.nome, s.valorPadrao); }}
                            className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-[rgb(var(--muted))] transition-colors text-left border-b border-[rgb(var(--card-border))] last:border-0"
                          >
                            <div className="flex-1 min-w-0">
                              <span className="text-sm text-[rgb(var(--foreground))]">{s.nome}</span>
                              {s.categoria && (
                                <span className="ml-2 text-xs bg-orange-500/10 text-orange-500 px-1.5 py-0.5 rounded">{s.categoria}</span>
                              )}
                            </div>
                            <span className="text-sm font-semibold text-orange-500 ml-2">{formatCurrency(s.valorPadrao)}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <input
                type="number"
                placeholder="R$"
                value={novoServicoValor}
                onChange={(e) => setNovoServicoValor(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addServico(); } }}
                className={cn(inputCn, 'w-28 flex-shrink-0')}
                min="0" step="0.01"
              />
              <button
                type="button" onClick={addServico}
                className="p-2.5 rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition-colors flex-shrink-0"
                title="Adicionar serviço"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {servicos.length > 0 && (
              <div className="flex justify-between text-sm pt-1 border-t border-orange-500/15">
                <span className="text-[rgb(var(--muted-foreground))]">Total mão de obra</span>
                <span className="font-bold text-orange-500">{formatCurrency(valorMaoDeObra)}</span>
              </div>
            )}
          </div>
        </SectionCard>

        {/* ─── PEÇAS ─── verde */}
        <SectionCard title="Peças Utilizadas" icon={Package} color="green">
          <div className="space-y-3">
            {pecasOS.map((p) => (
              <div key={p.id} className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-[rgb(var(--foreground))]">{p.nome}</span>
                  <span className="text-xs text-[rgb(var(--muted-foreground))] ml-2">x{p.quantidade} × {formatCurrency(p.valorUnitario)}</span>
                </div>
                <span className="text-sm font-semibold text-emerald-500 flex-shrink-0">{formatCurrency(p.valorTotal)}</span>
                <button type="button" onClick={() => setPecasOS(p2 => p2.filter(x => x.id !== p.id))}
                  className="text-[rgb(var(--muted-foreground))] hover:text-red-500 transition-colors p-1 flex-shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            {/* Autocomplete — z-index isolado com position:relative e z-50 */}
            <div className="flex gap-2 flex-wrap sm:flex-nowrap">
              <div className="flex-1 min-w-0 relative z-30">
                <input
                  ref={pecaInputRef}
                  type="text"
                  placeholder="Nome da peça (busca no estoque...)"
                  value={novaPeca}
                  onChange={(e) => { setNovaPeca(e.target.value); setShowPecaSuggestions(true); }}
                  onFocus={() => setShowPecaSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowPecaSuggestions(false), 200)}
                  className={cn(inputCn, 'w-full')}
                />
                {/* Dropdown ACIMA de tudo — z-[999] + position absolute */}
                {showPecaSuggestions && (
                  <div className="absolute top-full left-0 right-0 mt-1 rounded-xl shadow-2xl border border-[rgb(var(--card-border))] overflow-hidden z-[999]"
                    style={{ backgroundColor: 'rgb(var(--card))' }}>
                    {stockPecas.length === 0 ? (
                      <p className="px-3 py-3 text-xs text-[rgb(var(--muted-foreground))]">Nenhuma peça no estoque. Cadastre em <strong>Estoque</strong>.</p>
                    ) : pecaSuggestions.length === 0 ? (
                      <p className="px-3 py-3 text-xs text-[rgb(var(--muted-foreground))]">Nenhuma peça encontrada com esse nome</p>
                    ) : (
                      <div className="max-h-52 overflow-y-auto">
                        {pecaSuggestions.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onMouseDown={(e) => { e.preventDefault(); setNovaPeca(p.nome); setNovaPecaValor(String(p.custo)); setShowPecaSuggestions(false); }}
                            className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-[rgb(var(--muted))] transition-colors text-left border-b border-[rgb(var(--card-border))] last:border-0"
                          >
                            <div className="flex-1 min-w-0">
                              <span className="text-sm text-[rgb(var(--foreground))] block truncate">{p.nome}</span>
                              {p.fornecedor && <span className="text-xs text-[rgb(var(--muted-foreground))]">{p.fornecedor}</span>}
                            </div>
                            <div className="text-right ml-2 flex-shrink-0">
                              <span className="text-xs font-semibold text-emerald-500 block">{formatCurrency(p.custo)}</span>
                              <span className={cn('text-xs', p.quantidade <= p.quantidadeMinima ? 'text-red-400' : 'text-[rgb(var(--muted-foreground))]')}>
                                {p.quantidade} un.
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <input
                type="number"
                placeholder="Qtd"
                value={novaPecaQtd}
                onChange={(e) => setNovaPecaQtd(e.target.value)}
                className={cn(inputCn, 'w-16 flex-shrink-0')}
                min="1"
              />
              <input
                type="number"
                placeholder="R$ unit."
                value={novaPecaValor}
                onChange={(e) => setNovaPecaValor(e.target.value)}
                className={cn(inputCn, 'w-28 flex-shrink-0')}
                min="0" step="0.01"
              />
              <button type="button" onClick={addPeca}
                className="p-2.5 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-colors flex-shrink-0" title="Adicionar peça">
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {pecasOS.length > 0 && (
              <div className="flex justify-between text-sm pt-1 border-t border-emerald-500/15">
                <span className="text-[rgb(var(--muted-foreground))]">Total peças</span>
                <span className="font-bold text-emerald-500">{formatCurrency(valorPecasTotal)}</span>
              </div>
            )}
          </div>
        </SectionCard>

        {/* ─── TOTAL & SUBMIT ─── */}
        <div className={cn('rounded-2xl p-5 border', 'bg-[rgb(var(--card))] border-[rgb(var(--card-border))]')}>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-[rgb(var(--muted-foreground))]">Mão de obra</span>
              <span className="text-[rgb(var(--foreground))]">{formatCurrency(valorMaoDeObra)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[rgb(var(--muted-foreground))]">Peças</span>
              <span className="text-[rgb(var(--foreground))]">{formatCurrency(valorPecasTotal)}</span>
            </div>
            {servicos.some(s => s.proximaRevisaoKm || s.proximaRevisaoData) && (
              <div className="mt-2 p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <p className="text-xs font-medium text-purple-500 mb-1">Revisoes agendadas por servico:</p>
                {servicos.filter(s => s.proximaRevisaoKm || s.proximaRevisaoData).map(s => (
                  <p key={s.id} className="text-xs text-purple-600 dark:text-purple-400">
                    • {s.descricao}:
                    {s.proximaRevisaoKm && ` ${s.proximaRevisaoKm.toLocaleString('pt-BR')} km`}
                    {s.proximaRevisaoKm && s.proximaRevisaoData && ' ou'}
                    {s.proximaRevisaoData && ` ${new Date(s.proximaRevisaoData + 'T12:00:00').toLocaleDateString('pt-BR')}`}
                  </p>
                ))}
              </div>
            )}
            <div className="h-px bg-[rgb(var(--card-border))]" />
            <div className="flex justify-between">
              <span className="font-bold text-[rgb(var(--foreground))]">Total</span>
              <span className="text-2xl font-bold text-orange-500">{formatCurrency(valorTotal)}</span>
            </div>
          </div>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors shadow-md shadow-orange-500/20 text-sm"
          >
            <Save className="w-4 h-4" />
            Criar Ordem de Serviço
          </button>
        </div>

      </form>
    </div>
  );
}
