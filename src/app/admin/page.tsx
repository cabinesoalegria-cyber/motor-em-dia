'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { cn, formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Shield, Building2, Users, DollarSign, ClipboardList,
  ToggleLeft, ToggleRight, TrendingUp, AlertTriangle, Search,
  RefreshCw, Loader2, LogOut,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface EmpresaAdmin {
  id: string;
  nome: string;
  proprietario: string;
  email: string;
  plano: string;
  status: string;
  trial_expira_em: string | null;
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

const PLANOS = ['trial', 'starter', 'profissional', 'premium'];

export default function AdminPage() {
  const { isMaster, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [empresas, setEmpresas] = useState<EmpresaAdmin[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isMaster) {
      router.push('/dashboard');
    }
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

  async function changePlano(id: string, plano: string) {
    const dataFim = plano !== 'trial' ? null : undefined;
    await supabase.from('empresas').update({ plano, ...(dataFim !== undefined ? { trial_expira_em: null } : {}) }).eq('id', id);
    setEmpresas(prev => prev.map(e => e.id === id ? { ...e, plano } : e));
    toast.success('Plano atualizado');
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

  const planoColor: Record<string, string> = {
    premium:      'bg-purple-500/15 text-purple-500',
    profissional: 'bg-blue-500/15 text-blue-500',
    starter:      'bg-emerald-500/15 text-emerald-500',
    trial:        'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400',
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--background))] p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
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

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { label: 'Total Empresas',    value: String(stats.total_empresas), icon: Building2,     color: 'text-orange-500 bg-orange-500/10' },
              { label: 'Ativas',            value: String(stats.ativas),         icon: TrendingUp,    color: 'text-emerald-500 bg-emerald-500/10' },
              { label: 'Em Trial',          value: String(stats.trial),          icon: AlertTriangle, color: 'text-yellow-500 bg-yellow-500/10' },
              { label: 'Total OS',          value: String(stats.total_ordens),   icon: ClipboardList, color: 'text-blue-500 bg-blue-500/10' },
              { label: 'Total Clientes',    value: String(stats.total_clientes), icon: Users,         color: 'text-purple-500 bg-purple-500/10' },
              { label: 'Faturamento Mes',   value: formatCurrency(stats.faturamento_mes), icon: DollarSign, color: 'text-green-500 bg-green-500/10' },
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

        {/* Empresa list */}
        <div className="bg-[rgb(var(--card))] border border-[rgb(var(--card-border))] rounded-2xl p-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
            <h2 className="font-semibold text-[rgb(var(--foreground))] flex-1">
              Empresas Cadastradas <span className="text-[rgb(var(--muted-foreground))] font-normal text-sm">({filtered.length})</span>
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--muted-foreground))]" />
              <input
                type="text"
                placeholder="Buscar empresa ou e-mail..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-3 py-2 rounded-xl text-sm border border-[rgb(var(--input-border))] bg-[rgb(var(--input-bg))] text-[rgb(var(--foreground))] w-64 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
              />
            </div>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {filtered.length === 0 && (
              <p className="text-center text-sm text-[rgb(var(--muted-foreground))] py-8">Nenhuma empresa encontrada</p>
            )}
            {filtered.map(emp => {
              const trialExpired = emp.plano === 'trial' && emp.trial_expira_em && new Date(emp.trial_expira_em) < new Date();
              return (
                <div key={emp.id} className={cn(
                  'flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border transition-colors',
                  emp.status === 'inativo'
                    ? 'border-red-500/20 bg-red-500/5'
                    : 'border-[rgb(var(--card-border))] bg-[rgb(var(--muted))]/20'
                )}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm text-[rgb(var(--foreground))]">{emp.nome}</p>
                      <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', planoColor[emp.plano] || planoColor.trial)}>
                        {emp.plano}
                      </span>
                      {trialExpired && (
                        <span className="text-xs bg-red-500/15 text-red-500 px-2 py-0.5 rounded-full font-medium">Trial expirado</span>
                      )}
                      {emp.status === 'inativo' && (
                        <span className="text-xs bg-red-500/15 text-red-500 px-2 py-0.5 rounded-full font-medium">Inativa</span>
                      )}
                    </div>
                    <p className="text-xs text-[rgb(var(--muted-foreground))] mt-0.5">
                      {emp.email} &middot; {emp.proprietario || '—'}
                    </p>
                    <p className="text-xs text-[rgb(var(--muted-foreground))]">
                      Cadastro: {new Date(emp.created_at).toLocaleDateString('pt-BR')}
                      {emp.trial_expira_em && ` · Trial ate: ${new Date(emp.trial_expira_em).toLocaleDateString('pt-BR')}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <select
                      value={emp.plano}
                      onChange={e => changePlano(emp.id, e.target.value)}
                      className="text-xs px-2 py-1.5 rounded-lg border border-[rgb(var(--input-border))] bg-[rgb(var(--input-bg))] text-[rgb(var(--foreground))] focus:outline-none cursor-pointer"
                    >
                      {PLANOS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <button
                      onClick={() => toggleStatus(emp)}
                      className={cn(
                        'p-2 rounded-xl transition-colors',
                        emp.status === 'ativo'
                          ? 'text-emerald-500 hover:bg-emerald-500/10'
                          : 'text-red-500 hover:bg-red-500/10'
                      )}
                      title={emp.status === 'ativo' ? 'Desativar empresa' : 'Ativar empresa'}
                    >
                      {emp.status === 'ativo'
                        ? <ToggleRight className="w-6 h-6" />
                        : <ToggleLeft className="w-6 h-6" />
                      }
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Note */}
        <div className="bg-purple-500/5 border border-purple-500/20 rounded-2xl p-4">
          <p className="text-xs text-purple-600 dark:text-purple-400 font-medium mb-1">Nota de seguranca</p>
          <p className="text-xs text-[rgb(var(--muted-foreground))]">
            Para definir um usuario como master, execute no SQL Editor do Supabase:<br />
            <code className="font-mono bg-[rgb(var(--muted))] px-2 py-0.5 rounded mt-1 inline-block">
              UPDATE usuarios SET role = &apos;master&apos; WHERE email = &apos;seu@email.com&apos;;
            </code>
          </p>
        </div>
      </div>
    </div>
  );
}
