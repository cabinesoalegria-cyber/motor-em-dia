'use client';

import { useState, useMemo, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { ContaPagar, Lancamento } from '@/lib/types';
import {
  TrendingUp, TrendingDown, DollarSign, AlertTriangle, Plus, Trash2,
  Lock, Eye, EyeOff, ArrowRight, ShieldCheck, LogOut, Pencil, CheckCircle2,
  X, Save, Clock, History
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import Link from 'next/link';
import { toast } from 'sonner';

// ─── Auth ────────────────────────────────────────────────────────────────
const SENHA_PADRAO = 'admin123';
const SESSION_KEY = 'autoflow-financeiro-auth';
const SESSION_DURATION = 30 * 60 * 1000;

const inputCn = cn(
  'w-full px-3 py-2.5 rounded-xl text-sm border',
  'bg-[rgb(var(--input-bg))] border-[rgb(var(--input-border))]',
  'text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))]',
  'focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-colors'
);

// ─── Login ───────────────────────────────────────────────────────────────
function FinanceiroLogin({ onSuccess }: { onSuccess: () => void }) {
  const [senha, setSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [erro, setErro] = useState('');
  const [tentativas, setTentativas] = useState(0);
  const bloqueado = tentativas >= 5;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (bloqueado) return;
    const senhaCorreta = localStorage.getItem('autoflow-financeiro-senha') || SENHA_PADRAO;
    if (senha === senhaCorreta) {
      localStorage.setItem(SESSION_KEY, String(Date.now()));
      setErro('');
      onSuccess();
    } else {
      setTentativas(t => t + 1);
      setErro(`Senha incorreta. ${4 - tentativas} tentativa${4 - tentativas !== 1 ? 's' : ''} restante${4 - tentativas !== 1 ? 's' : ''}.`);
      setSenha('');
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className={cn('w-full max-w-sm rounded-2xl border p-8', 'bg-[rgb(var(--card))] border-[rgb(var(--card-border))] shadow-xl')}>
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-slate-700 flex items-center justify-center mb-4 shadow-lg">
            <Lock className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-xl font-bold text-[rgb(var(--foreground))]">Área Administrativa</h2>
          <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1 text-center">O módulo financeiro é protegido por senha</p>
        </div>
        {bloqueado ? (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
            <p className="text-sm text-red-600 dark:text-red-400 font-medium">Acesso bloqueado após 5 tentativas.</p>
            <button onClick={() => { setTentativas(0); setErro(''); }} className="mt-2 text-xs text-red-500 hover:underline">
              Desbloquear
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-1.5">Senha de Acesso</label>
              <div className="relative">
                <input
                  type={showSenha ? 'text' : 'password'}
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  placeholder="Digite a senha..."
                  autoFocus
                  className={cn(inputCn, 'pr-10', erro && 'border-red-500/60')}
                />
                <button type="button" onClick={() => setShowSenha(!showSenha)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]">
                  {showSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {erro && <p className="mt-1.5 text-xs text-red-500">{erro}</p>}
            </div>
            <button type="submit" disabled={!senha} className="w-full py-3 rounded-xl text-sm font-semibold bg-slate-700 text-white hover:bg-slate-600 disabled:opacity-50 transition-colors shadow-sm">
              Acessar Financeiro
            </button>
          </form>
        )}
        <p className="mt-4 text-center text-xs text-[rgb(var(--muted-foreground))]">
          Senha padrão: <span className="font-mono">admin123</span> · Altere nas{' '}
          <Link href="/configuracoes" className="text-orange-500 hover:underline">configurações</Link>
        </p>
      </div>
    </div>
  );
}

// ─── Edit Modal for Lancamento ───────────────────────────────────────────
function EditLancamentoModal({
  lancamento,
  onSave,
  onClose,
}: {
  lancamento: Lancamento;
  onSave: (id: string, data: Partial<Lancamento>) => void;
  onClose: () => void;
}) {
  const [tipo, setTipo] = useState<'entrada' | 'saida'>(lancamento.tipo);
  const [descricao, setDescricao] = useState(lancamento.descricao);
  const [valor, setValor] = useState(String(lancamento.valor));
  const [data, setData] = useState(lancamento.data);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={cn('relative w-full max-w-sm rounded-2xl p-5 shadow-2xl', 'bg-[rgb(var(--card))] border border-[rgb(var(--card-border))]')}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-[rgb(var(--foreground))]">Editar Lançamento</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[rgb(var(--muted))] text-[rgb(var(--muted-foreground))]">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-3">
          <div className="flex gap-2">
            <button onClick={() => setTipo('entrada')} className={cn('flex-1 py-2 rounded-lg text-xs font-medium transition-colors', tipo === 'entrada' ? 'bg-emerald-500 text-white' : 'bg-[rgb(var(--input-bg))] text-[rgb(var(--muted-foreground))]')}>
              + Entrada
            </button>
            <button onClick={() => setTipo('saida')} className={cn('flex-1 py-2 rounded-lg text-xs font-medium transition-colors', tipo === 'saida' ? 'bg-red-500 text-white' : 'bg-[rgb(var(--input-bg))] text-[rgb(var(--muted-foreground))]')}>
              - Saída
            </button>
          </div>
          <input type="text" placeholder="Descrição" value={descricao} onChange={e => setDescricao(e.target.value)} className={inputCn} />
          <div className="grid grid-cols-2 gap-2">
            <input type="number" placeholder="Valor (R$)" value={valor} onChange={e => setValor(e.target.value)} className={inputCn} />
            <input type="date" value={data} onChange={e => setData(e.target.value)} className={inputCn} />
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={onClose} className="flex-1 py-2 rounded-lg text-xs border border-[rgb(var(--input-border))] text-[rgb(var(--foreground))] hover:bg-[rgb(var(--input-bg))] transition-colors">
              Cancelar
            </button>
            <button
              onClick={() => { onSave(lancamento.id, { tipo, descricao, valor: Number(valor), data }); onClose(); }}
              className="flex-1 py-2 rounded-lg text-xs bg-orange-500 text-white hover:bg-orange-600 transition-colors font-medium"
            >
              <Save className="w-3.5 h-3.5 inline mr-1" />Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Content ─────────────────────────────────────────────────────────────
function FinanceiroContent({ onLogout }: { onLogout: () => void }) {
  const {
    lancamentos, clientes, ordens,
    addLancamento, updateLancamento, deleteLancamento,
    contasPagar, addContaPagar, updateContaPagar, deleteContaPagar, pagarConta,
  } = useStore();

  // Lançamentos state
  const [showLancModal, setShowLancModal] = useState(false);
  const [tipo, setTipo] = useState<'entrada' | 'saida'>('entrada');
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [dataLanc, setDataLanc] = useState(new Date().toISOString().split('T')[0]);
  const [editingLanc, setEditingLanc] = useState<Lancamento | null>(null);

  // Contas a pagar state
  const [showContaModal, setShowContaModal] = useState(false);
  const [cDescricao, setCDescricao] = useState('');
  const [cValor, setCValor] = useState('');
  const [cVencimento, setCVencimento] = useState('');
  const [cFornecedor, setCFornecedor] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const currentMonth = today.slice(0, 7);

  const stats = useMemo(() => {
    const todayEntradas = lancamentos.filter(l => l.data.startsWith(today) && l.tipo === 'entrada').reduce((s, l) => s + l.valor, 0);
    const todaySaidas = lancamentos.filter(l => l.data.startsWith(today) && l.tipo === 'saida').reduce((s, l) => s + l.valor, 0);
    const mesEntradas = lancamentos.filter(l => l.data.startsWith(currentMonth) && l.tipo === 'entrada').reduce((s, l) => s + l.valor, 0);
    const mesSaidas = lancamentos.filter(l => l.data.startsWith(currentMonth) && l.tipo === 'saida').reduce((s, l) => s + l.valor, 0);
    const lucroMes = mesEntradas - mesSaidas;
    const contasReceber = ordens
      .filter(o => o.status === 'finalizada' || o.status === 'em_andamento')
      .filter(o => !lancamentos.some(l => l.ordemServicoId === o.id))
      .map(o => ({ ...o, cliente: clientes.find(c => c.id === o.clienteId) }));
    const totalContasPagar = contasPagar.filter(c => !c.pago).reduce((s, c) => s + c.valor, 0);
    return { todayEntradas, todaySaidas, mesEntradas, mesSaidas, lucroMes, contasReceber, totalContasPagar };
  }, [lancamentos, ordens, clientes, today, currentMonth, contasPagar]);

  const chartData = useMemo(() =>
    Array.from({ length: 14 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (13 - i));
      const dateStr = d.toISOString().split('T')[0];
      const label = `${d.getDate()}/${d.getMonth() + 1}`;
      const entradas = lancamentos.filter(l => l.data.startsWith(dateStr) && l.tipo === 'entrada').reduce((s, l) => s + l.valor, 0);
      const saidas = lancamentos.filter(l => l.data.startsWith(dateStr) && l.tipo === 'saida').reduce((s, l) => s + l.valor, 0);
      return { label, entradas, saidas };
    }),
    [lancamentos]
  );

  function handleAddLanc() {
    if (!descricao || !valor) { toast.error('Preencha todos os campos'); return; }
    addLancamento({ tipo, descricao, valor: Number(valor), data: dataLanc });
    toast.success(`${tipo === 'entrada' ? 'Entrada' : 'Saída'} registrada!`);
    setDescricao(''); setValor(''); setShowLancModal(false);
  }

  function handleAddConta() {
    if (!cDescricao || !cValor || !cVencimento) { toast.error('Preencha todos os campos'); return; }
    addContaPagar({ descricao: cDescricao, valor: Number(cValor), vencimento: cVencimento, fornecedor: cFornecedor, pago: false });
    toast.success('Conta a pagar cadastrada!');
    setCDescricao(''); setCValor(''); setCVencimento(''); setCFornecedor(''); setShowContaModal(false);
  }

  const recentLancamentos = [...lancamentos]
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
    .slice(0, 30);

  const contasPagarAtivas = contasPagar.filter(c => !c.pago).sort((a, b) => a.vencimento.localeCompare(b.vencimento));
  const contasPagarHistorico = contasPagar.filter(c => c.pago).slice(0, 10);

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-700/20 border border-slate-700/30">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-xs font-medium text-slate-500">Acesso Administrativo</span>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500 hover:text-white transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          Sair do Financeiro
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Entradas Hoje',   value: stats.todayEntradas, icon: TrendingUp,   color: 'text-emerald-500 bg-emerald-500/10' },
          { label: 'Saídas Hoje',     value: stats.todaySaidas,   icon: TrendingDown,  color: 'text-red-500 bg-red-500/10' },
          { label: 'Faturado no Mês', value: stats.mesEntradas,   icon: DollarSign,    color: 'text-orange-500 bg-orange-500/10' },
          { label: 'Lucro no Mês',    value: stats.lucroMes,      icon: TrendingUp,    color: stats.lucroMes >= 0 ? 'text-emerald-500 bg-emerald-500/10' : 'text-red-500 bg-red-500/10' },
        ].map((s) => (
          <div key={s.label} className={cn('rounded-2xl p-4 border', 'bg-[rgb(var(--card))] border-[rgb(var(--card-border))]')}>
            <div className={cn('p-2 rounded-lg w-fit mb-2', s.color)}>
              <s.icon className="w-4 h-4" />
            </div>
            <p className="text-xs text-[rgb(var(--muted-foreground))]">{s.label}</p>
            <p className="text-xl font-bold text-[rgb(var(--foreground))] mt-0.5">{formatCurrency(s.value)}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className={cn('rounded-2xl p-5 border', 'bg-[rgb(var(--card))] border-[rgb(var(--card-border))]')}>
        <h3 className="font-semibold text-[rgb(var(--foreground))] mb-4">Entradas × Saídas — Últimos 14 Dias</h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gEntradas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gSaidas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.15)" />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'rgb(100,116,139)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: 'rgb(100,116,139)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${v}`} />
            <Tooltip />
            <Area type="monotone" dataKey="entradas" stroke="#10b981" strokeWidth={2} fill="url(#gEntradas)" name="Entradas" />
            <Area type="monotone" dataKey="saidas"   stroke="#ef4444" strokeWidth={2} fill="url(#gSaidas)"   name="Saídas" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 2-col grid: Lançamentos + Contas a Receber */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Lançamentos */}
        <div className={cn('rounded-2xl p-5 border', 'bg-[rgb(var(--card))] border-[rgb(var(--card-border))]')}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[rgb(var(--foreground))]">Lançamentos</h3>
            <button
              onClick={() => setShowLancModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-orange-500 text-white hover:bg-orange-600 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Novo
            </button>
          </div>

          {showLancModal && (
            <div className="mb-4 p-4 rounded-xl bg-[rgb(var(--muted))] space-y-3">
              <div className="flex gap-2">
                <button onClick={() => setTipo('entrada')} className={cn('flex-1 py-2 rounded-lg text-xs font-medium transition-colors', tipo === 'entrada' ? 'bg-emerald-500 text-white' : 'bg-[rgb(var(--input-bg))] text-[rgb(var(--muted-foreground))]')}>+ Entrada</button>
                <button onClick={() => setTipo('saida')} className={cn('flex-1 py-2 rounded-lg text-xs font-medium transition-colors', tipo === 'saida' ? 'bg-red-500 text-white' : 'bg-[rgb(var(--input-bg))] text-[rgb(var(--muted-foreground))]')}>- Saída</button>
              </div>
              <input type="text" placeholder="Descrição" value={descricao} onChange={e => setDescricao(e.target.value)} className={inputCn} />
              <div className="grid grid-cols-2 gap-2">
                <input type="number" placeholder="Valor (R$)" value={valor} onChange={e => setValor(e.target.value)} className={inputCn} />
                <input type="date" value={dataLanc} onChange={e => setDataLanc(e.target.value)} className={inputCn} />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowLancModal(false)} className="flex-1 py-2 rounded-lg text-xs border border-[rgb(var(--input-border))] text-[rgb(var(--foreground))] hover:bg-[rgb(var(--input-bg))] transition-colors">Cancelar</button>
                <button onClick={handleAddLanc} className="flex-1 py-2 rounded-lg text-xs bg-orange-500 text-white hover:bg-orange-600 transition-colors font-medium">Salvar</button>
              </div>
            </div>
          )}

          <div className="space-y-3 max-h-80 overflow-y-auto">
            {recentLancamentos.length === 0 ? (
              <p className="text-sm text-center text-[rgb(var(--muted-foreground))] py-6">Nenhum lançamento ainda</p>
            ) : (
              recentLancamentos.map((l) => (
                <div key={l.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[rgb(var(--muted))] transition-colors group">
                  <div className={cn('w-2 h-2 rounded-full flex-shrink-0', l.tipo === 'entrada' ? 'bg-emerald-500' : 'bg-red-500')} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[rgb(var(--foreground))] truncate">{l.descricao}</p>
                    <p className="text-xs text-[rgb(var(--muted-foreground))]">{formatDate(l.data)}</p>
                  </div>
                  <span className={cn('text-sm font-semibold flex-shrink-0', l.tipo === 'entrada' ? 'text-emerald-500' : 'text-red-500')}>
                    {l.tipo === 'entrada' ? '+' : '-'}{formatCurrency(l.valor)}
                  </span>
                  {/* Edit & Delete */}
                  <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-all">
                    <button onClick={() => setEditingLanc(l)} className="p-1 text-[rgb(var(--muted-foreground))] hover:text-orange-500 transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => {
                      if (!confirm(`Excluir lançamento "${l.descricao}"?`)) return;
                      deleteLancamento(l.id); toast.success('Excluído');
                    }} className="p-1 text-[rgb(var(--muted-foreground))] hover:text-red-500 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Contas a Receber */}
        <div className={cn('rounded-2xl p-5 border', 'bg-[rgb(var(--card))] border-[rgb(var(--card-border))]')}>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            <h3 className="font-semibold text-[rgb(var(--foreground))]">Contas a Receber</h3>
          </div>
          {stats.contasReceber.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
              <p className="text-sm text-[rgb(var(--muted-foreground))]">Tudo em dia!</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {stats.contasReceber.map((o) => (
                <div key={o.id} className="rounded-xl bg-yellow-500/5 border border-yellow-500/20 overflow-hidden">
                  <Link href={`/ordens/${o.id}`} className="flex items-center gap-3 p-3 hover:bg-yellow-500/10 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[rgb(var(--foreground))]">{o.cliente?.nome ?? '—'}</p>
                      <p className="text-xs text-[rgb(var(--muted-foreground))]">{o.numero}</p>
                    </div>
                    <p className="font-bold text-yellow-600 dark:text-yellow-400">{formatCurrency(o.valorTotal)}</p>
                    <ArrowRight className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
                  </Link>
                  {/* Marcar como pago */}
                  <button
                    onClick={() => {
                      addLancamento({
                        tipo: 'entrada',
                        descricao: `${o.numero} - ${o.cliente?.nome ?? ''} (recebido)`,
                        valor: o.valorTotal,
                        ordemServicoId: o.id,
                        clienteId: o.clienteId,
                        data: today,
                        pago: true,
                      });
                      toast.success('Pagamento registrado! Lançamento criado.');
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-colors border-t border-yellow-500/20"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Marcar como Pago
                  </button>
                </div>
              ))}
              <div className="pt-1 text-right">
                <span className="text-xs text-[rgb(var(--muted-foreground))]">
                  Total: <strong>{formatCurrency(stats.contasReceber.reduce((s, o) => s + o.valorTotal, 0))}</strong>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contas a Pagar (full width, side by side panels) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pendentes */}
        <div className={cn('rounded-2xl p-5 border', 'bg-[rgb(var(--card))] border-[rgb(var(--card-border))]')}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-red-500" />
              <h3 className="font-semibold text-[rgb(var(--foreground))]">Contas a Pagar</h3>
              {contasPagarAtivas.length > 0 && (
                <span className="text-xs bg-red-500/15 text-red-500 px-2 py-0.5 rounded-full font-semibold">
                  {contasPagarAtivas.length}
                </span>
              )}
            </div>
            <button
              onClick={() => setShowContaModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Nova
            </button>
          </div>

          {showContaModal && (
            <div className="mb-4 p-4 rounded-xl bg-[rgb(var(--muted))] space-y-3">
              <input type="text" placeholder="Descrição *" value={cDescricao} onChange={e => setCDescricao(e.target.value)} className={inputCn} />
              <input type="text" placeholder="Fornecedor" value={cFornecedor} onChange={e => setCFornecedor(e.target.value)} className={inputCn} />
              <div className="grid grid-cols-2 gap-2">
                <input type="number" placeholder="Valor (R$) *" value={cValor} onChange={e => setCValor(e.target.value)} className={inputCn} />
                <input type="date" value={cVencimento} onChange={e => setCVencimento(e.target.value)} className={inputCn} />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowContaModal(false)} className="flex-1 py-2 rounded-lg text-xs border border-[rgb(var(--input-border))] text-[rgb(var(--foreground))] hover:bg-[rgb(var(--input-bg))] transition-colors">Cancelar</button>
                <button onClick={handleAddConta} className="flex-1 py-2 rounded-lg text-xs bg-red-500 text-white hover:bg-red-600 transition-colors font-medium">Cadastrar</button>
              </div>
            </div>
          )}

          <div className="space-y-4 max-h-72 overflow-y-auto">
            {contasPagarAtivas.length === 0 ? (
              <p className="text-sm text-center text-[rgb(var(--muted-foreground))] py-6">Nenhuma conta pendente</p>
            ) : (
              contasPagarAtivas.map((c) => {
                const vencido = c.vencimento < today;
                return (
                  <div key={c.id} className={cn(
                    'rounded-xl p-3 border group',
                    vencido ? 'bg-red-500/5 border-red-500/25' : 'bg-[rgb(var(--muted))] border-[rgb(var(--card-border))]'
                  )}>
                    <div className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[rgb(var(--foreground))] truncate">{c.descricao}</p>
                        {c.fornecedor && <p className="text-xs text-[rgb(var(--muted-foreground))]">{c.fornecedor}</p>}
                        <p className={cn('text-xs mt-0.5', vencido ? 'text-red-500 font-semibold' : 'text-[rgb(var(--muted-foreground))]')}>
                          {vencido ? '⚠ Vencida em' : 'Vence em'} {new Date(c.vencimento + 'T12:00:00').toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-red-500">{formatCurrency(c.valor)}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => {
                          pagarConta(c.id);
                          addLancamento({ tipo: 'saida', descricao: `Pgto: ${c.descricao}${c.fornecedor ? ' - ' + c.fornecedor : ''}`, valor: c.valor, data: today });
                          toast.success('Conta paga! Saída registrada.');
                        }}
                        className="flex-1 py-1.5 rounded-lg text-xs font-medium bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
                      >
                        <CheckCircle2 className="w-3 h-3 inline mr-1" />
                        Pagar
                      </button>
                      <button onClick={() => {
                        if (!confirm(`Excluir conta "${c.descricao}"?`)) return;
                        deleteContaPagar(c.id);
                        toast.success('Conta excluída');
                      }} className="p-1.5 rounded-lg text-[rgb(var(--muted-foreground))] hover:text-red-500 hover:bg-red-500/10 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Histórico de pagas */}
        <div className={cn('rounded-2xl p-5 border', 'bg-[rgb(var(--card))] border-[rgb(var(--card-border))]')}>
          <div className="flex items-center gap-2 mb-4">
            <History className="w-4 h-4 text-slate-500" />
            <h3 className="font-semibold text-[rgb(var(--foreground))]">Histórico de Contas Pagas</h3>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {contasPagarHistorico.length === 0 ? (
              <p className="text-sm text-center text-[rgb(var(--muted-foreground))] py-6">Nenhuma conta paga ainda</p>
            ) : (
              contasPagarHistorico.map((c) => (
                <div key={c.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[rgb(var(--foreground))] truncate">{c.descricao}</p>
                    <p className="text-xs text-[rgb(var(--muted-foreground))]">Pago em {c.dataPagamento ? new Date(c.dataPagamento + 'T12:00:00').toLocaleDateString('pt-BR') : '—'}</p>
                  </div>
                  <span className="text-sm font-semibold text-emerald-500 flex-shrink-0">{formatCurrency(c.valor)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Edit lancamento modal */}
      {editingLanc && (
        <EditLancamentoModal
          lancamento={editingLanc}
          onSave={updateLancamento}
          onClose={() => setEditingLanc(null)}
        />
      )}
    </div>
  );
}

// ─── Page com auth guard ─────────────────────────────────────────────────
export default function FinanceiroPage() {
  const [autenticado, setAutenticado] = useState(false);
  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    const ts = localStorage.getItem(SESSION_KEY);
    if (ts && Date.now() - Number(ts) < SESSION_DURATION) {
      setAutenticado(true);
    }
    setVerificando(false);
  }, []);

  function handleLogout() {
    localStorage.removeItem(SESSION_KEY);
    setAutenticado(false);
    toast.info('Sessão encerrada');
  }

  if (verificando) return null;
  if (!autenticado) return <FinanceiroLogin onSuccess={() => setAutenticado(true)} />;
  return <FinanceiroContent onLogout={handleLogout} />;
}
