'use client';

import { useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { ServicoOS, PecaOS } from '@/lib/types';
import { formatCurrency, generateId, cn } from '@/lib/utils';
import {
  ArrowLeft, Plus, Trash2, Save, Wrench, Package, FileText,
  CalendarClock, ChevronUp, X, Pencil, Check, User, Car
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

// ─── Simple 2-decimal rounding for peças (sem arredondamento para inteiro) ──
function calcPecaTotal(qtd: number, valUnit: number, markup: number): number {
  return Math.round(qtd * valUnit * (1 + markup / 100) * 100) / 100;
}

// ─── SectionCard (same as Nova OS) ──────────────────────────────────────────
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

// ─── inputCn ─────────────────────────────────────────────────────────────────
const inputCn = cn(
  'w-full px-3 py-2.5 rounded-xl text-sm border',
  'bg-[rgb(var(--input-bg))] border-[rgb(var(--input-border))]',
  'text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))]',
  'focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-colors'
);

// ─── ServicoEditRow (same as Nova OS ServicoRow) ─────────────────────────────
function ServicoEditRow({
  servico,
  onUpdate,
  onRemove,
  kmAtual,
}: {
  servico: ServicoOS;
  onUpdate: (id: string, patch: Partial<ServicoOS>) => void;
  onRemove: (id: string) => void;
  kmAtual: number;
}) {
  const [showRevisao, setShowRevisao] = useState(!!(servico.proximaRevisaoKm || servico.proximaRevisaoData));
  const [editing, setEditing] = useState(false);
  const [editDesc, setEditDesc] = useState(servico.descricao);
  const [editVal, setEditVal] = useState(String(servico.valor));

  function saveEdit() {
    onUpdate(servico.id, { descricao: editDesc.trim() || servico.descricao, valor: Number(editVal) || 0 });
    setEditing(false);
  }

  return (
    <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 overflow-hidden">
      {editing ? (
        <div className="flex items-center gap-2 px-3 py-2.5">
          <input
            autoFocus
            value={editDesc}
            onChange={e => setEditDesc(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditing(false); }}
            className={cn(inputCn, 'flex-1 text-sm py-1.5')}
            placeholder="Descrição do serviço"
          />
          <input
            type="number"
            value={editVal}
            onChange={e => setEditVal(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditing(false); }}
            className={cn(inputCn, 'w-24 text-sm py-1.5')}
            min="0" step="0.01"
          />
          <button type="button" onClick={saveEdit} className="p-1.5 rounded-lg bg-orange-500 text-white hover:bg-orange-600 flex-shrink-0">
            <Check className="w-3.5 h-3.5" />
          </button>
          <button type="button" onClick={() => setEditing(false)} className="p-1.5 rounded-lg border border-[rgb(var(--card-border))] text-[rgb(var(--muted-foreground))] hover:text-red-500 flex-shrink-0">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 px-3 py-2.5">
          <span className="flex-1 text-sm text-[rgb(var(--foreground))] font-medium">{servico.descricao}</span>
          <span className="text-sm font-semibold text-orange-500 flex-shrink-0">{formatCurrency(servico.valor)}</span>
          <button
            type="button"
            onClick={() => { setEditDesc(servico.descricao); setEditVal(String(servico.valor)); setEditing(true); }}
            className="p-1 text-[rgb(var(--muted-foreground))] hover:text-blue-500 transition-colors"
            title="Editar serviço"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
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
      )}

      {!editing && showRevisao && (
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

// ─── Main component ──────────────────────────────────────────────────────────
export default function EditarOrdemPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { ordens, clientes, veiculos, pecas: stockPecas, servicosCatalogo, updateOrdem, orcamentos, updateOrcamento } = useStore();

  const ordem = ordens.find(o => o.id === id);
  const cliente = ordem ? clientes.find(c => c.id === ordem.clienteId) : null;
  const veiculo = ordem ? veiculos.find(v => v.id === ordem.veiculoId) : null;

  const [servicos, setServicos] = useState<ServicoOS[]>(ordem?.servicos || []);
  const [pecasOS, setPecasOS] = useState<PecaOS[]>(ordem?.pecas || []);
  const [problema, setProblema] = useState(ordem?.problemaRelatado || '');
  const [descricaoRealizado, setDescricaoRealizado] = useState(ordem?.descricaoServicoRealizado || '');
  const [observacoes, setObservacoes] = useState(ordem?.observacoesInternas || '');
  const [quilometragem, setQuilometragem] = useState(String(ordem?.quilometragemAtual || ''));
  const [mecanico, setMecanico] = useState(ordem?.mecanico || '');
  const [mecanicosLista] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('autoflow-mecanicos') || '[]'); } catch { return []; }
  });

  // Add service inputs
  const [novoServico, setNovoServico] = useState('');
  const [novoServicoValor, setNovoServicoValor] = useState('');
  const [showServicoCatalogo, setShowServicoCatalogo] = useState(false);
  const servicoInputRef = useRef<HTMLInputElement>(null);

  // Add peca inputs
  const [novaPeca, setNovaPeca] = useState('');
  const [novaPecaQtd, setNovaPecaQtd] = useState('1');
  const [novaPecaValor, setNovaPecaValor] = useState('');
  const [novaPecaMarkup, setNovaPecaMarkup] = useState('0');
  const [showPecaSuggestions, setShowPecaSuggestions] = useState(false);
  const pecaInputRef = useRef<HTMLInputElement>(null);

  // Inline piece edit state
  const [editingPecaId, setEditingPecaId] = useState<string | null>(null);
  const [editNome, setEditNome] = useState('');
  const [editQtd, setEditQtd] = useState('1');
  const [editValor, setEditValor] = useState('');
  const [editMarkup, setEditMarkup] = useState('0');

  const servicoSuggestions = (() => {
    const q = novoServico.toLowerCase().trim();
    if (!q) return servicosCatalogo.slice(0, 10);
    return servicosCatalogo.filter(s =>
      s.nome.toLowerCase().includes(q) ||
      (s.categoria || '').toLowerCase().includes(q) ||
      (s.descricao || '').toLowerCase().includes(q)
    ).slice(0, 10);
  })();

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

  if (!ordem) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <p className="text-[rgb(var(--muted-foreground))]">OS não encontrada</p>
        <Link href="/ordens" className="text-orange-500 hover:underline text-sm">Voltar</Link>
      </div>
    );
  }

  const kmAtual = Number(quilometragem) || 0;
  const valorMaoDeObra = servicos.reduce((s, svc) => s + (svc.valor || 0), 0);
  const valorPecasTotal = pecasOS.reduce((s, p) => s + p.valorTotal, 0);
  const valorTotal = valorMaoDeObra + valorPecasTotal;

  function updateServico(id: string, patch: Partial<ServicoOS>) {
    setServicos(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s));
  }

  function addServico() {
    if (!novoServico.trim()) return;
    const val = Number(novoServicoValor);
    if (!val || val <= 0) {
      toast.error('Informe um valor válido para o serviço (não pode ser zero)');
      return;
    }
    setServicos(prev => [...prev, {
      id: generateId(),
      descricao: novoServico,
      valor: val,
    }]);
    setNovoServico('');
    setNovoServicoValor('');
    setShowServicoCatalogo(false);
  }

  function selectServicoCatalogo(nome: string, valor: number) {
    setNovoServico(nome);
    setNovoServicoValor(String(valor));
    setShowServicoCatalogo(false);
    setTimeout(() => {
      setServicos(prev => [...prev, { id: generateId(), descricao: nome, valor }]);
      setNovoServico('');
      setNovoServicoValor('');
    }, 50);
  }

  function addPeca() {
    if (!novaPeca.trim()) { toast.error('Informe o nome da peça'); return; }
    const valUnit = Number(novaPecaValor);
    if (!valUnit || valUnit <= 0) {
      toast.error('Informe um valor válido para a peça (não pode ser zero)');
      return;
    }
    const qtd = Number(novaPecaQtd) || 1;
    const markup = Number(novaPecaMarkup) || 0;
    const valorTotal = calcPecaTotal(qtd, valUnit, markup);
    setPecasOS(prev => [...prev, {
      id: generateId(),
      nome: novaPeca,
      quantidade: qtd,
      valorUnitario: valUnit,
      markup,
      valorTotal,
    }]);
    setNovaPeca('');
    setNovaPecaQtd('1');
    setNovaPecaValor('');
    setNovaPecaMarkup('0');
    setShowPecaSuggestions(false);
  }

  function handleSave() {
    updateOrdem(ordem!.id, {
      servicos,
      pecas: pecasOS,
      problemaRelatado: problema,
      descricaoServicoRealizado: descricaoRealizado,
      observacoesInternas: observacoes,
      mecanico,
      quilometragemAtual: Number(quilometragem) || ordem!.quilometragemAtual,
      valorMaoDeObra,
      valorPecas: valorPecasTotal,
      valorTotal,
    });

    // ── Sincroniza o orçamento vinculado ────────────────────────────────
    // Se esta OS veio de um orçamento, atualiza o valor do orçamento para
    // refletir o valor atual da OS (serviços + peças).
    const orcamentoVinculado = orcamentos.find(
      (o) => o.ordemServicoId === ordem!.id
    );
    if (orcamentoVinculado) {
      const itensAtualizados = [
        ...servicos.map((s) => ({
          id: s.id,
          descricao: s.descricao,
          tipo: 'servico' as const,
          quantidade: 1,
          valorUnitario: s.valor,
          valorTotal: s.valor,
        })),
        ...pecasOS.map((p) => ({
          id: p.id,
          descricao: p.nome,
          tipo: 'peca' as const,
          quantidade: p.quantidade,
          valorUnitario: p.valorUnitario,
          valorTotal: p.valorTotal,
        })),
      ];
      updateOrcamento(orcamentoVinculado.id, {
        itens: itensAtualizados,
        valorTotal,
      });
    }

    toast.success('OS atualizada com sucesso!');
    router.push(`/ordens/${id}`);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <Link href={`/ordens/${id}`} className="inline-flex items-center gap-1.5 text-sm text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]">
          <ArrowLeft className="w-4 h-4" />
          Voltar para {ordem.numero}
        </Link>
        <div className="text-xs text-[rgb(var(--muted-foreground))]">
          {cliente?.nome} · {veiculo?.marca} {veiculo?.modelo} · {veiculo?.placa}
        </div>
      </div>

      <div className="space-y-4">

        {/* ─── CLIENTE INFO (readonly) ─── azul */}
        <SectionCard title="Cliente e Veículo" icon={User} color="blue">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-[rgb(var(--muted-foreground))] mb-0.5">Cliente</p>
              <p className="font-semibold text-[rgb(var(--foreground))]">{cliente?.nome || '—'}</p>
              <p className="text-xs text-[rgb(var(--muted-foreground))] mt-0.5">{cliente?.telefone}</p>
            </div>
            <div>
              <p className="text-xs text-[rgb(var(--muted-foreground))] mb-0.5">Veículo</p>
              <p className="font-semibold text-[rgb(var(--foreground))]">{veiculo ? `${veiculo.marca} ${veiculo.modelo}` : '—'}</p>
              <p className="text-xs text-[rgb(var(--muted-foreground))] mt-0.5">{veiculo?.placa} · {quilometragem} km</p>
            </div>
          </div>
          <div className="mt-3">
            <label className="block text-xs font-semibold text-[rgb(var(--muted-foreground))] uppercase tracking-wide mb-1.5">KM Atual</label>
            <input
              type="number"
              value={quilometragem}
              onChange={e => setQuilometragem(e.target.value)}
              className={inputCn}
              placeholder={String(veiculo?.quilometragem || 0)}
              min="0"
            />
          </div>
        </SectionCard>

        {/* ─── PROBLEMA RELATADO ─── vermelho */}
        <SectionCard title="Problema Relatado" icon={FileText} color="red">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[rgb(var(--muted-foreground))] uppercase tracking-wide mb-1.5">Descrição do Problema</label>
              <textarea
                value={problema}
                onChange={e => setProblema(e.target.value)}
                className={cn(inputCn, 'resize-none')}
                rows={3}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[rgb(var(--muted-foreground))] uppercase tracking-wide mb-1.5">Mecânico Responsável 🔒</label>
              <input
                list="mecanicos-list-edit"
                type="text"
                value={mecanico}
                onChange={e => setMecanico(e.target.value)}
                placeholder="Nome do mecânico responsável..."
                className={inputCn}
              />
              <datalist id="mecanicos-list-edit">
                {mecanicosLista.map(m => <option key={m} value={m} />)}
              </datalist>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[rgb(var(--muted-foreground))] uppercase tracking-wide mb-1.5">Observações Internas 🔒</label>
              <textarea
                value={observacoes}
                onChange={e => setObservacoes(e.target.value)}
                className={cn(inputCn, 'resize-none')}
                rows={2}
                placeholder="Anotações internas (não aparece para o cliente)..."
              />
            </div>
          </div>
        </SectionCard>

        {/* ─── DESCRIÇÃO DO SERVIÇO REALIZADO ─── laranja */}
        <SectionCard title="Descrição do Serviço Realizado" icon={FileText} color="orange">
          <div>
            <p className="text-xs text-[rgb(var(--muted-foreground))] mb-2">Descreva detalhadamente o que foi executado. Não substitui a lista de serviços acima.</p>
            <textarea
              value={descricaoRealizado}
              onChange={e => setDescricaoRealizado(e.target.value)}
              className={cn(inputCn, 'resize-none')}
              rows={5}
              placeholder="Ex: Troca de correia dentada, tensores e bomba d'água. Ajuste de válvulas. Verificação do sistema de arrefecimento..."
            />
          </div>
        </SectionCard>

        {/* ─── SERVIÇOS EXECUTADOS ─── laranja */}
        <SectionCard title="Serviços Executados" icon={Wrench} color="orange">
          <div className="space-y-3">
            <p className="text-xs text-[rgb(var(--muted-foreground))] -mt-1 mb-1">
              Clique em <CalendarClock className="w-3 h-3 inline text-purple-500 mx-0.5" /> em cada serviço para definir a próxima revisão individualmente.
            </p>

            {servicos.map(s => (
              <ServicoEditRow
                key={s.id}
                servico={s}
                onUpdate={updateServico}
                onRemove={id => setServicos(prev => prev.filter(x => x.id !== id))}
                kmAtual={kmAtual}
              />
            ))}

            {/* Add service */}
            <div className="flex gap-2 relative">
              <div className="flex-1 relative z-30">
                <input
                  ref={servicoInputRef}
                  type="text"
                  placeholder="Adicionar serviço (busca no catálogo...)"
                  value={novoServico}
                  onChange={e => { setNovoServico(e.target.value); setShowServicoCatalogo(true); }}
                  onFocus={() => setShowServicoCatalogo(true)}
                  onBlur={() => setTimeout(() => setShowServicoCatalogo(false), 200)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addServico(); } }}
                  className={cn(inputCn, 'w-full')}
                />
                {showServicoCatalogo && (
                  <div
                    className="absolute top-full left-0 right-0 mt-1 rounded-xl shadow-2xl border border-[rgb(var(--card-border))] overflow-hidden z-[999]"
                    style={{ backgroundColor: 'rgb(var(--card))' }}
                  >
                    {servicosCatalogo.length === 0 ? (
                      <p className="px-3 py-3 text-xs text-[rgb(var(--muted-foreground))]">Nenhum serviço no catálogo. Cadastre em <strong>Serviços</strong>.</p>
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
                onChange={e => setNovoServicoValor(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addServico(); } }}
                className={cn(inputCn, 'w-28 flex-shrink-0')}
                min="0" step="0.01"
              />
              <button
                type="button"
                onClick={addServico}
                className="p-2.5 rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition-colors flex-shrink-0"
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

        {/* ─── PEÇAS UTILIZADAS ─── verde com markup + inline edit */}
        <SectionCard title="Peças Utilizadas" icon={Package} color="green">
          <div className="space-y-3">
            {pecasOS.map(p => (
              <div key={p.id}>
                {editingPecaId === p.id ? (
                  <div className="flex flex-col gap-2 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/30">
                    <input
                      value={editNome}
                      onChange={e => setEditNome(e.target.value)}
                      placeholder="Nome"
                      className={inputCn}
                    />
                    <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                      <input
                        type="number"
                        value={editQtd}
                        onChange={e => setEditQtd(e.target.value)}
                        placeholder="Qtd"
                        className={cn(inputCn, 'w-20')}
                        min="1"
                      />
                      <input
                        type="number"
                        value={editValor}
                        onChange={e => setEditValor(e.target.value)}
                        placeholder="R$ unit."
                        className={cn(inputCn, 'w-28')}
                        min="0"
                        step="0.01"
                      />
                      <div className="relative w-24 flex-shrink-0">
                        <input
                          type="number"
                          value={editMarkup}
                          onChange={e => setEditMarkup(e.target.value)}
                          placeholder="%"
                          className={cn(inputCn, 'pr-6')}
                          min="0"
                          step="1"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[rgb(var(--muted-foreground))]">%</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const qtd = Number(editQtd) || 1;
                          const val = Number(editValor) || 0;
                          const mk = Number(editMarkup) || 0;
                          const total = calcPecaTotal(qtd, val, mk);
                          setPecasOS(prev => prev.map(x =>
                            x.id === p.id
                              ? { ...x, nome: editNome, quantidade: qtd, valorUnitario: val, markup: mk, valorTotal: total }
                              : x
                          ));
                          setEditingPecaId(null);
                        }}
                        className="p-2 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 flex-shrink-0"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingPecaId(null)}
                        className="p-2 rounded-xl border border-[rgb(var(--card-border))] text-[rgb(var(--muted-foreground))] hover:text-red-500 flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    {Number(editMarkup) > 0 && (
                      <p className="text-xs text-emerald-600">
                        Valor c/ markup: {formatCurrency(calcPecaTotal(Number(editQtd), Number(editValor), Number(editMarkup)))}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-[rgb(var(--foreground))]">{p.nome}</span>
                      <span className="text-xs text-[rgb(var(--muted-foreground))] ml-2">
                        x{p.quantidade}
                      </span>
                      {(p.markup ?? 0) > 0 && (
                        <span className="text-xs ml-1 text-amber-500">(+{p.markup}%)</span>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-emerald-500 flex-shrink-0">{formatCurrency(p.valorTotal)}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingPecaId(p.id);
                        setEditNome(p.nome);
                        setEditQtd(String(p.quantidade));
                        setEditValor(String(p.valorUnitario));
                        setEditMarkup(String(p.markup ?? 0));
                      }}
                      className="text-[rgb(var(--muted-foreground))] hover:text-blue-500 transition-colors p-1 flex-shrink-0"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPecasOS(prev => prev.filter(x => x.id !== p.id))}
                      className="text-[rgb(var(--muted-foreground))] hover:text-red-500 transition-colors p-1 flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* Add piece with autocomplete */}
            <div className="flex gap-2 flex-wrap sm:flex-nowrap">
              <div className="flex-1 min-w-0 relative z-30">
                <input
                  ref={pecaInputRef}
                  type="text"
                  placeholder="Nome da peça (busca no estoque...)"
                  value={novaPeca}
                  onChange={e => { setNovaPeca(e.target.value); setShowPecaSuggestions(true); }}
                  onFocus={() => setShowPecaSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowPecaSuggestions(false), 200)}
                  className={cn(inputCn, 'w-full')}
                />
                {showPecaSuggestions && (
                  <div
                    className="absolute top-full left-0 right-0 mt-1 rounded-xl shadow-2xl border border-[rgb(var(--card-border))] overflow-hidden z-[999]"
                    style={{ backgroundColor: 'rgb(var(--card))' }}
                  >
                    {stockPecas.length === 0 ? (
                      <p className="px-3 py-3 text-xs text-[rgb(var(--muted-foreground))]">Nenhuma peça no estoque. Cadastre em <strong>Estoque</strong>.</p>
                    ) : pecaSuggestions.length === 0 ? (
                      <p className="px-3 py-3 text-xs text-[rgb(var(--muted-foreground))]">Nenhuma peça encontrada com esse nome</p>
                    ) : (
                      <div className="max-h-52 overflow-y-auto">
                        {pecaSuggestions.map(pk => (
                          <button
                            key={pk.id}
                            type="button"
                            onMouseDown={e => {
                              e.preventDefault();
                              setNovaPeca(pk.nome);
                              setNovaPecaValor(String(pk.custo));
                              setShowPecaSuggestions(false);
                            }}
                            className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-[rgb(var(--muted))] transition-colors text-left border-b border-[rgb(var(--card-border))] last:border-0"
                          >
                            <div className="flex-1 min-w-0">
                              <span className="text-sm text-[rgb(var(--foreground))] block truncate">{pk.nome}</span>
                              {pk.fornecedor && <span className="text-xs text-[rgb(var(--muted-foreground))]">{pk.fornecedor}</span>}
                            </div>
                            <div className="text-right ml-2 flex-shrink-0">
                              <span className="text-xs font-semibold text-emerald-500 block">{formatCurrency(pk.custo)}</span>
                              <span className={cn('text-xs', pk.quantidade <= pk.quantidadeMinima ? 'text-red-400' : 'text-[rgb(var(--muted-foreground))]')}>
                                {pk.quantidade} un.
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
                onChange={e => setNovaPecaQtd(e.target.value)}
                className={cn(inputCn, 'w-16 flex-shrink-0')}
                min="1"
              />
              <div className="relative w-20 flex-shrink-0">
                <input
                  type="number"
                  placeholder="%"
                  value={novaPecaMarkup}
                  onChange={e => setNovaPecaMarkup(e.target.value)}
                  className={cn(inputCn, 'pr-5')}
                  min="0"
                  step="1"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[rgb(var(--muted-foreground))]">%</span>
              </div>
              <input
                type="number"
                placeholder="R$ unit."
                value={novaPecaValor}
                onChange={e => setNovaPecaValor(e.target.value)}
                className={cn(inputCn, 'w-28 flex-shrink-0')}
                min="0" step="0.01"
              />
              <button
                type="button"
                onClick={addPeca}
                className="p-2.5 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-colors flex-shrink-0"
                title="Adicionar peça"
              >
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

        {/* ─── TOTAL E SALVAR ─── */}
        <div className={cn('rounded-2xl p-5 border', 'bg-[rgb(var(--card))] border-[rgb(var(--card-border))]')}>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-[rgb(var(--muted-foreground))]">Mão de obra</span>
              <span>{formatCurrency(valorMaoDeObra)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[rgb(var(--muted-foreground))]">Peças</span>
              <span>{formatCurrency(valorPecasTotal)}</span>
            </div>
            <div className="h-px bg-[rgb(var(--card-border))]" />
            <div className="flex justify-between">
              <span className="font-bold text-[rgb(var(--foreground))]">Total</span>
              <span className="text-2xl font-bold text-orange-500">{formatCurrency(valorTotal)}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSave}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors shadow-md shadow-orange-500/20 text-sm"
          >
            <Save className="w-4 h-4" />
            Salvar Alterações
          </button>
        </div>

      </div>
    </div>
  );
}
