'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { cn, formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Shield, Building2, Users, DollarSign, ClipboardList,
  ToggleLeft, ToggleRight, TrendingUp, AlertTriangle, Search,
  RefreshCw, Loader2, LogOut, X, Calendar, Check, Zap, Star, Crown, Rocket,
  ChevronDown, ChevronUp, CreditCard,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

/* ─── Tipos ─────────────────────────────────────────────────────────────── */
interface EmpresaAdmin {
  id: string;
  nome: string;
  proprietario: string;
  email: string;
  telefone?: string;
  plano: string;
  status: string;
  trial_expira_em: string | null;
  plano_expira_em?: string | null;
  created_at: string;
}

interface AdminStats {
  total_empresas: number;
  ativas: number;
  trial: number;
  total_ordens: number;
  total_clientes: number;
  faturamento_mes: number;
}

/* ─── Dados dos planos ───────────────────────────────────────────────────── */
const PLANOS_INFO = [
  {
    id: 'trial',
    label: 'Trial',
    preco: 'Grátis',
    descricao: '14 dias gratuitos',
    icone: Rocket,
    cor: 'from-slate-400 to-slate-500',
    badge: 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400',
    border: 'border-slate-300 dark:border-slate-600',
    ring: 'ring-slate-400',
  },
  {
    id: 'starter',
    label: 'Starter',
    preco: 'R$ 49/mês',
    descricao: '1 usuário · 10 clientes · 50 OS',
    icone: Zap,
    cor: 'from-blue-400 to-blue-600',
    badge: 'bg-blue-500/15 text-blue-500',
    border: 'border-blue-300 dark:border-blue-700',
    ring: 'ring-blue-400',
  },
  {
    id: 'profissional',
    label: 'Profissional',
    preco: 'R$ 99/mês',
    descricao: '1 usuário · 60 clientes · 300 OS',
    icone: Star,
    cor: 'from-orange-400 to-orange-600',
    badge: 'bg-orange-500/15 text-orange-500',
    border: 'border-orange-400',
    ring: 'ring-orange-400',
  },
  {
    id: 'premium',
    label: 'Premium',
    preco: 'R$ 149/mês',
    descricao: 'Ilimitado · VIP',
    icone: Crown,
    cor: 'from-purple-500 to-purple-700',
    badge: 'bg-purple-500/15 text-purple-500',
    border: 'border-purple-400 dark:border-purple-600',
    ring: 'ring-purple-400',
  },
];

/* ─── Modal de troca de plano ────────────────────────────────────────────── */
interface PlanModalProps {
  empresa: EmpresaAdmin;
  onClose: () => void;
  onSave: (id: string, plano: string, expira: string | null, nota: string) => Promise<void>;
}

function PlanModal({ empresa, onClose, onSave }: PlanModalProps) {
  const [planoSel, setPlanoSel] = useState(empresa.plano);
  const [expira, setExpira] = useState('');
  const [nota, setNota] = useState('');
  const [saving, setSaving] = useState(false);

  // Calcular datas sugeridas
  const hoje = new Date();
  const em30 = new Date(hoje); em30.setDate(hoje.getDate() + 30);
  const em90 = new Date(hoje); em90.setDate(hoje.getDate() + 90);
  const em365 = new Date(hoje); em365.setDate(hoje.getDate() + 365);
  const fmt = (d: Date) => d.toISOString().split('T')[0];

  const isMesmoPlano = planoSel === empresa.plano;

  async function handleSave() {
    setSaving(true);
    await onSave(empresa.id, planoSel, expira || null, nota);
    setSaving(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-[rgb(var(--card))] border border-[rgb(var(--card-border))] rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[rgb(var(--card-border))]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-[rgb(var(--foreground))] text-base">Alterar Plano</h2>
              <p className="text-xs text-[rgb(var(--muted-foreground))]">{empresa.nome}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-[rgb(var(--muted))] transition-colors">
            <X className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Seleção do plano */}
          <div>
            <p className="text-xs font-bold text-[rgb(var(--muted-foreground))] uppercase tracking-widest mb-3">
              Selecionar plano
            </p>
            <div className="grid grid-cols-2 gap-3">
              {PLANOS_INFO.map(p => {
                const Icon = p.icone;
                const sel = planoSel === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setPlanoSel(p.id)}
                    className={cn(
                      'relative flex flex-col gap-2 p-4 rounded-2xl border-2 text-left transition-all',
                      sel
                        ? `${p.border} ring-2 ${p.ring} bg-[rgb(var(--muted))]/40`
                        : 'border-[rgb(var(--card-border))] hover:border-orange-400/40'
                    )}
                  >
                    {empresa.plano === p.id && (
                      <span className="absolute top-2 right-2 text-[9px] font-bold bg-emerald-500/15 text-emerald-500 px-1.5 py-0.5 rounded-full">
                        ATUAL
                      </span>
                    )}
                    <div className={cn('w-8 h-8 rounded-xl bg-gradient-to-br flex items-center justify-center', p.cor)}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[rgb(var(--foreground))]">{p.label}</p>
                      <p className="text-xs text-[rgb(var(--muted-foreground))]">{p.preco}</p>
                      <p className="text-[10px] text-[rgb(var(--muted-foreground))] mt-0.5">{p.descricao}</p>
                    </div>
                    {sel && (
                      <div className="absolute top-2 left-2 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Data de vencimento */}
          <div>
            <p className="text-xs font-bold text-[rgb(var(--muted-foreground))] uppercase tracking-widest mb-2">
              Vencimento do plano (opcional)
            </p>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
              <input
                type="date"
                value={expira}
                onChange={e => setExpira(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl text-sm border border-[rgb(var(--input-border))] bg-[rgb(var(--input-bg))] text-[rgb(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500"
              />
            </div>
            {/* Atalhos rápidos */}
            <div className="flex gap-2 flex-wrap">
              {[
                { label: '+30 dias', val: fmt(em30) },
                { label: '+90 dias', val: fmt(em90) },
                { label: '+1 ano',   val: fmt(em365) },
              ].map(s => (
                <button
                  key={s.label}
                  onClick={() => setExpira(s.val)}
                  className={cn(
                    'text-xs px-3 py-1.5 rounded-lg border transition-colors',
                    expira === s.val
                      ? 'bg-orange-500 border-orange-500 text-white'
                      : 'border-[rgb(var(--card-border))] text-[rgb(var(--muted-foreground))] hover:border-orange-400 hover:text-orange-500'
                  )}
                >
                  {s.label}
                </button>
              ))}
              {expira && (
                <button
                  onClick={() => setExpira('')}
                  className="text-xs px-3 py-1.5 rounded-lg border border-[rgb(var(--card-border))] text-[rgb(var(--muted-foreground))] hover:border-red-400 hover:text-red-500 transition-colors"
                >
                  Limpar
                </button>
              )}
            </div>
          </div>

          {/* Observação */}
          <div>
            <p className="text-xs font-bold text-[rgb(var(--muted-foreground))] uppercase tracking-widest mb-2">
              Observação (opcional)
            </p>
            <textarea
              rows={2}
              placeholder="Ex: Pagamento via PIX confirmado em 16/06/2026..."
              value={nota}
              onChange={e => setNota(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl text-sm border border-[rgb(var(--input-border))] bg-[rgb(var(--input-bg))] text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 resize-none"
            />
          </div>
        </div>

        {/* Rodapé */}
        <div className="flex items-center gap-3 px-6 pb-6 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl border-2 border-[rgb(var(--card-border))] text-sm font-semibold text-[rgb(var(--foreground))] hover:border-orange-400/50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving || isMesmoPlano}
            className={cn(
              'flex-1 py-3 rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2',
              isMesmoPlano
                ? 'bg-[rgb(var(--muted))] text-[rgb(var(--muted-foreground))] cursor-not-allowed'
                : 'bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/30'
            )}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {saving ? 'Salvando...' : isMesmoPlano ? 'Nenhuma alteração' : `Ativar plano ${PLANOS_INFO.find(p => p.id === planoSel)?.label}`}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function AdminPage() {
  const { isMaster, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [empresas, setEmpresas] = useState<EmpresaAdmin[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [planModal, setPlanModal] = useState<EmpresaAdmin | null>(null);

  useEffect(() => {
    if (!authLoading && !isMaster) router.push('/dashboard');
  }, [isMaster, authLoading, router]);

  useEffect(() => {
    if (isMaster) fetchData();
  }, [isMaster]);

  async function fetchData() {
    setLoading(true);
    try {
      const [{ data: statsData }, { data: empresasData }] = await Promise.all([
        supabase.rpc('get_admin_stats'),
        supabase.from('empresas').select('*').order('created_at', { ascending: false }),
      ]);
      if (statsData) setStats(statsData as AdminStats);
      if (empresasData) setEmpresas(empresasData as EmpresaAdmin[]);
    } catch {
      toast.error('Erro ao carregar dados admin');
    } finally {
      setLoading(false);
    }
  }

  async function toggleStatus(empresa: EmpresaAdmin) {
    const newStatus = empresa.status === 'ativo' ? 'inativo' : 'ativo';
    await supabase.from('empresas').update({ status: newStatus }).eq('id', empresa.id);
    setEmpresas(prev => prev.map(e => e.id === empresa.id ? { ...e, status: newStatus } : e));
    toast.success(`Empresa ${newStatus === 'ativo' ? 'ativada' : 'desativada'}`);
  }

  async function handlePlanSave(id: string, plano: string, expira: string | null, nota: string) {
    const updates: Record<string, unknown> = { plano };
    if (plano !== 'trial') updates.trial_expira_em = null;
    if (expira) updates.plano_expira_em = expira;
    if (nota) updates.admin_nota = nota;

    const { error } = await supabase.from('empresas').update(updates).eq('id', id);
    if (error) {
      toast.error('Erro ao atualizar plano');
      return;
    }
    setEmpresas(prev => prev.map(e => e.id === id ? { ...e, plano, plano_expira_em: expira } : e));
    const planInfo = PLANOS_INFO.find(p => p.id === plano);
    toast.success(`✅ Plano ${planInfo?.label} ativado com sucesso!`);
  }

  const filtered = empresas.filter(e =>
    e.nome.toLowerCase().includes(search.toLowerCase()) ||
    e.email.toLowerCase().includes(search.toLowerCase()) ||
    (e.proprietario || '').toLowerCase().includes(search.toLowerCase())
  );

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--background))]">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!isMaster) return null;

  const planoInfo = (id: string) => PLANOS_INFO.find(p => p.id === id) ?? PLANOS_INFO[0];

  // Contadores por plano
  const contPlano = PLANOS_INFO.map(p => ({
    ...p,
    count: empresas.filter(e => e.plano === p.id).length,
  }));

  return (
    <div className="min-h-screen bg-[rgb(var(--background))] p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center shadow-md shadow-purple-500/30">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[rgb(var(--foreground))]">Painel Master</h1>
              <p className="text-xs text-[rgb(var(--muted-foreground))]">Controle total do SaaS Motor em Dia</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchData} title="Atualizar" className="p-2 rounded-xl text-[rgb(var(--muted-foreground))] hover:text-orange-500 hover:bg-orange-500/10 transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button onClick={() => signOut().then(() => router.push('/login'))} title="Sair" className="p-2 rounded-xl text-[rgb(var(--muted-foreground))] hover:text-red-500 hover:bg-red-500/10 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats gerais */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { label: 'Total Empresas',  value: String(stats.total_empresas),       icon: Building2,     color: 'text-orange-500 bg-orange-500/10' },
              { label: 'Ativas',          value: String(stats.ativas),               icon: TrendingUp,    color: 'text-emerald-500 bg-emerald-500/10' },
              { label: 'Em Trial',        value: String(stats.trial),                icon: AlertTriangle, color: 'text-yellow-500 bg-yellow-500/10' },
              { label: 'Total OS',        value: String(stats.total_ordens),         icon: ClipboardList, color: 'text-blue-500 bg-blue-500/10' },
              { label: 'Total Clientes',  value: String(stats.total_clientes),       icon: Users,         color: 'text-purple-500 bg-purple-500/10' },
              { label: 'Fat. do Mês',     value: formatCurrency(stats.faturamento_mes), icon: DollarSign, color: 'text-green-500 bg-green-500/10' },
            ].map(s => (
              <div key={s.label} className="bg-[rgb(var(--card))] border border-[rgb(var(--card-border))] rounded-2xl p-4">
                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center mb-2', s.color)}>
                  <s.icon className="w-4 h-4" />
                </div>
                <p className="text-xs text-[rgb(var(--muted-foreground))]">{s.label}</p>
                <p className="text-xl font-bold text-[rgb(var(--foreground))] mt-0.5">{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Distribuição por plano */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {contPlano.map(p => {
            const Icon = p.icone;
            return (
              <div key={p.id} className="bg-[rgb(var(--card))] border border-[rgb(var(--card-border))] rounded-2xl p-4 flex items-center gap-3">
                <div className={cn('w-9 h-9 rounded-xl bg-gradient-to-br flex items-center justify-center flex-shrink-0', p.cor)}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-[rgb(var(--muted-foreground))]">{p.label}</p>
                  <p className="text-2xl font-extrabold text-[rgb(var(--foreground))]">{p.count}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Lista de empresas */}
        <div className="bg-[rgb(var(--card))] border border-[rgb(var(--card-border))] rounded-2xl p-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
            <h2 className="font-semibold text-[rgb(var(--foreground))] flex-1">
              Empresas Cadastradas{' '}
              <span className="text-[rgb(var(--muted-foreground))] font-normal text-sm">({filtered.length})</span>
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--muted-foreground))]" />
              <input
                type="text"
                placeholder="Buscar empresa, email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-3 py-2 rounded-xl text-sm border border-[rgb(var(--input-border))] bg-[rgb(var(--input-bg))] text-[rgb(var(--foreground))] w-64 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
              />
            </div>
          </div>

          <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
            {filtered.length === 0 && (
              <p className="text-center text-sm text-[rgb(var(--muted-foreground))] py-10">Nenhuma empresa encontrada</p>
            )}
            {filtered.map(emp => {
              const info = planoInfo(emp.plano);
              const PIcon = info.icone;
              const trialExpired = emp.plano === 'trial' && emp.trial_expira_em && new Date(emp.trial_expira_em) < new Date();
              const expanded = expandedId === emp.id;

              return (
                <div
                  key={emp.id}
                  className={cn(
                    'rounded-2xl border transition-all overflow-hidden',
                    emp.status === 'inativo'
                      ? 'border-red-500/30 bg-red-500/5'
                      : 'border-[rgb(var(--card-border))] bg-[rgb(var(--muted))]/10'
                  )}
                >
                  {/* Row principal */}
                  <div className="flex items-center gap-3 p-4">
                    {/* Avatar plano */}
                    <div className={cn('w-9 h-9 rounded-xl bg-gradient-to-br flex items-center justify-center flex-shrink-0', info.cor)}>
                      <PIcon className="w-4 h-4 text-white" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-sm text-[rgb(var(--foreground))]">{emp.nome}</p>
                        <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-bold capitalize', info.badge)}>
                          {info.label}
                        </span>
                        {trialExpired && <span className="text-[10px] bg-red-500/15 text-red-500 px-2 py-0.5 rounded-full font-bold">Trial expirado</span>}
                        {emp.status === 'inativo' && <span className="text-[10px] bg-red-500/15 text-red-500 px-2 py-0.5 rounded-full font-bold">Inativa</span>}
                      </div>
                      <p className="text-xs text-[rgb(var(--muted-foreground))] mt-0.5 truncate">
                        {emp.email} · {emp.proprietario || '—'}
                      </p>
                    </div>

                    {/* Ações rápidas */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {/* Botão alterar plano */}
                      <button
                        onClick={() => setPlanModal(emp)}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-colors shadow-sm shadow-orange-500/20"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        Plano
                      </button>
                      {/* Toggle ativo/inativo */}
                      <button
                        onClick={() => toggleStatus(emp)}
                        className={cn('p-2 rounded-xl transition-colors',
                          emp.status === 'ativo' ? 'text-emerald-500 hover:bg-emerald-500/10' : 'text-red-500 hover:bg-red-500/10'
                        )}
                        title={emp.status === 'ativo' ? 'Desativar' : 'Ativar'}
                      >
                        {emp.status === 'ativo' ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                      </button>
                      {/* Expandir detalhes */}
                      <button
                        onClick={() => setExpandedId(expanded ? null : emp.id)}
                        className="p-2 rounded-xl text-[rgb(var(--muted-foreground))] hover:bg-[rgb(var(--muted))] transition-colors"
                      >
                        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Detalhes expandidos */}
                  {expanded && (
                    <div className="px-4 pb-4 pt-0 border-t border-[rgb(var(--card-border))] grid grid-cols-2 sm:grid-cols-4 gap-3 mt-0">
                      {[
                        { label: 'Cadastro',    value: new Date(emp.created_at).toLocaleDateString('pt-BR') },
                        { label: 'Trial até',   value: emp.trial_expira_em ? new Date(emp.trial_expira_em).toLocaleDateString('pt-BR') : '—' },
                        { label: 'Plano até',   value: emp.plano_expira_em ? new Date(emp.plano_expira_em).toLocaleDateString('pt-BR') : '—' },
                        { label: 'Telefone',    value: emp.telefone || '—' },
                      ].map(d => (
                        <div key={d.label} className="bg-[rgb(var(--muted))]/30 rounded-xl p-3 mt-3">
                          <p className="text-[10px] text-[rgb(var(--muted-foreground))] uppercase tracking-wider">{d.label}</p>
                          <p className="text-sm font-semibold text-[rgb(var(--foreground))] mt-0.5">{d.value}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Nota de segurança */}
        <div className="bg-purple-500/5 border border-purple-500/20 rounded-2xl p-4">
          <p className="text-xs text-purple-600 dark:text-purple-400 font-bold mb-1">Nota de segurança</p>
          <p className="text-xs text-[rgb(var(--muted-foreground))]">
            Para definir um usuário como master, execute no SQL Editor do Supabase:<br />
            <code className="font-mono bg-[rgb(var(--muted))] px-2 py-0.5 rounded mt-1 inline-block">
              UPDATE usuarios SET role = &apos;master&apos; WHERE email = &apos;seu@email.com&apos;;
            </code>
          </p>
        </div>
      </div>

      {/* Modal de troca de plano */}
      {planModal && (
        <PlanModal
          empresa={planModal}
          onClose={() => setPlanModal(null)}
          onSave={handlePlanSave}
        />
      )}
    </div>
  );
}
