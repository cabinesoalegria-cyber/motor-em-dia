'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sun, Moon, Bell, Plus, X, CalendarClock, AlertTriangle, Wrench, LogOut, User, ChevronDown } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import { useStore } from '@/lib/store';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/ordens': 'Ordens de Servico',
  '/clientes': 'Clientes',
  '/veiculos': 'Veiculos',
  '/agenda': 'Agenda',
  '/financeiro': 'Financeiro',
  '/estoque': 'Estoque',
  '/whatsapp': 'WhatsApp',
  '/configuracoes': 'Configuracoes',
  '/servicos': 'Cat. Servicos',
  '/orcamentos': 'Orcamentos',
  '/relatorios': 'Relatórios Gerais',
};

const quickActions: Record<string, { href: string; label: string }> = {
  '/ordens': { href: '/ordens/nova', label: 'Nova OS' },
  '/orcamentos': { href: '/orcamentos/nova', label: 'Novo Orcamento' },
};

// ─── UserMenu ──────────────────────────────────────────────────────────────
function UserMenu() {
  const { empresa, usuario, signOut } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  async function handleSignOut() {
    setOpen(false);
    // Limpa apenas dados de auth do sistema antigo — NÃO apaga logo/nome da oficina
    ['autoflow-financeiro-auth', 'autoflow-financeiro-senha', 'autoflow-store']
      .forEach(k => localStorage.removeItem(k));
    await signOut();
    router.push('/login');
  }


  const initials = (empresa?.nome || usuario?.nome || 'U')
    .split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={cn(
          'flex items-center gap-2 px-2 py-1.5 rounded-xl transition-colors',
          'hover:bg-[rgb(var(--muted))]',
          open && 'bg-[rgb(var(--muted))]'
        )}
        title="Menu do usuário"
      >
        {/* Avatar */}
        <div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          {initials}
        </div>
        <div className="hidden sm:block text-left max-w-[120px]">
          <p className="text-xs font-semibold text-[rgb(var(--foreground))] truncate leading-tight">
            {empresa?.nome || 'Oficina'}
          </p>
          <p className="text-[10px] text-[rgb(var(--muted-foreground))] truncate leading-tight">
            {usuario?.email || ''}
          </p>
        </div>
        <ChevronDown className={cn('w-3.5 h-3.5 text-[rgb(var(--muted-foreground))] transition-transform hidden sm:block', open && 'rotate-180')} />
      </button>

      {open && (
        <div className={cn(
          'absolute right-0 top-full mt-2 w-56 rounded-2xl shadow-2xl border z-50 py-1 overflow-hidden',
          'bg-[rgb(var(--card))] border-[rgb(var(--card-border))]'
        )}>
          {/* Info */}
          <div className="px-4 py-3 border-b border-[rgb(var(--card-border))]">
            <p className="text-sm font-semibold text-[rgb(var(--foreground))] truncate">{empresa?.nome || 'Oficina'}</p>
            <p className="text-xs text-[rgb(var(--muted-foreground))] truncate mt-0.5">{usuario?.email}</p>
            <span className={cn(
              'inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full capitalize',
              empresa?.plano === 'premium'      ? 'bg-purple-500/15 text-purple-500' :
              empresa?.plano === 'profissional' ? 'bg-blue-500/15 text-blue-500' :
              empresa?.plano === 'starter'      ? 'bg-emerald-500/15 text-emerald-500' :
              'bg-orange-500/15 text-orange-500'
            )}>
              {empresa?.plano === 'trial' ? 'Trial 14 dias' : empresa?.plano}
            </span>
          </div>

          {/* Actions */}
          <div className="py-1">
            <Link
              href="/configuracoes"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-[rgb(var(--muted))] transition-colors text-sm text-[rgb(var(--foreground))]"
            >
              <User className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
              Configurações
            </Link>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-500/10 transition-colors text-sm text-red-500"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── NotificationBell ──────────────────────────────────────────────────────
function NotificationBell() {
  const { ordens, clientes, veiculos } = useStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const notifications = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const in7 = new Date(now);
    in7.setDate(now.getDate() + 7);

    type Notif = {
      key: string; osId: string; osNumero: string; servicoDesc: string;
      clienteNome: string; veiculoDesc: string; veiculoPlaca: string;
      revisaoInfo: string; urgente: boolean; diasRestantes: number | null;
    };

    const result: Notif[] = [];

    ordens.forEach((os) => {
      if (os.status === 'entregue') return;
      os.servicos.forEach((svc) => {
        if (!svc.proximaRevisaoData && !svc.proximaRevisaoKm) return;
        const cliente = clientes.find(c => c.id === os.clienteId);
        const veiculo = veiculos.find(v => v.id === os.veiculoId);

        let urgente = false;
        let visible = false;
        let diasRestantes: number | null = null;
        const revisaoInfoParts: string[] = [];

        if (svc.proximaRevisaoData) {
          const revisaoDate = new Date(svc.proximaRevisaoData + 'T12:00:00');
          const diffDays = Math.ceil((revisaoDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays <= 7) {
            visible = true;
            diasRestantes = diffDays;
            urgente = diffDays <= 0;
            if (diffDays < 0) revisaoInfoParts.push(`Vencida ha ${Math.abs(diffDays)} dia(s)`);
            else if (diffDays === 0) revisaoInfoParts.push('Revisao HOJE');
            else revisaoInfoParts.push(`${diffDays} dia(s)`);
            const dt = revisaoDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
            revisaoInfoParts.push(`Data: ${dt}`);
          }
        }

        if (svc.proximaRevisaoKm && veiculo) {
          const kmFaltando = svc.proximaRevisaoKm - (os.quilometragemAtual || veiculo.quilometragem);
          if (kmFaltando <= 500) {
            visible = true;
            if (kmFaltando <= 100) urgente = true;
            revisaoInfoParts.push(`KM: ${svc.proximaRevisaoKm.toLocaleString('pt-BR')} (faltam ${Math.max(0, kmFaltando).toLocaleString('pt-BR')} km)`);
          }
        }

        if (!visible) return;

        result.push({
          key: `${os.id}-${svc.id}`,
          osId: os.id, osNumero: os.numero, servicoDesc: svc.descricao,
          clienteNome: cliente?.nome ?? 'Cliente',
          veiculoDesc: veiculo ? `${veiculo.marca} ${veiculo.modelo}` : '',
          veiculoPlaca: veiculo?.placa ?? '',
          revisaoInfo: revisaoInfoParts.join(' · '),
          urgente, diasRestantes,
        });
      });
    });

    return result.sort((a, b) => (b.urgente ? 1 : 0) - (a.urgente ? 1 : 0));
  }, [ordens, clientes, veiculos]);

  const count = notifications.length;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={cn(
          'p-2 rounded-lg transition-colors relative',
          'hover:bg-[rgb(var(--muted))] text-[rgb(var(--muted-foreground))]',
          open && 'bg-[rgb(var(--muted))]'
        )}
        title="Notificacoes"
      >
        <Bell className="w-4 h-4" />
        {count > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5 leading-none">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className={cn(
          'absolute right-0 top-full mt-2 w-80 rounded-2xl shadow-2xl border z-50',
          'bg-[rgb(var(--card))] border-[rgb(var(--card-border))]'
        )}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-[rgb(var(--card-border))]">
            <div className="flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-purple-500" />
              <span className="font-semibold text-sm text-[rgb(var(--foreground))]">Revisoes nos proximos 7 dias</span>
            </div>
            <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-[rgb(var(--muted))] text-[rgb(var(--muted-foreground))]">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                <CalendarClock className="w-8 h-8 text-[rgb(var(--muted-foreground))] mb-2 opacity-40" />
                <p className="text-sm text-[rgb(var(--muted-foreground))]">Nenhuma revisao prevista</p>
                <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1 opacity-70">para os proximos 7 dias</p>
              </div>
            ) : (
              <div className="divide-y divide-[rgb(var(--card-border))]">
                {notifications.map(n => (
                  <Link
                    key={n.key}
                    href={`/ordens/${n.osId}`}
                    onClick={() => setOpen(false)}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-[rgb(var(--muted))] transition-colors block"
                  >
                    <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5', n.urgente ? 'bg-red-500/15' : 'bg-purple-500/10')}>
                      {n.urgente ? <AlertTriangle className="w-4 h-4 text-red-500" /> : <CalendarClock className="w-4 h-4 text-purple-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-[rgb(var(--muted-foreground))] font-mono">{n.osNumero}</span>
                        {n.urgente && <span className="text-[10px] bg-red-500/15 text-red-500 px-1.5 py-0.5 rounded-full font-bold">URGENTE</span>}
                      </div>
                      <p className="text-sm font-medium text-[rgb(var(--foreground))] truncate mt-0.5">{n.clienteNome}</p>
                      <p className="text-xs text-orange-500 font-medium truncate">{n.servicoDesc}</p>
                      {n.veiculoPlaca && <p className="text-xs text-[rgb(var(--muted-foreground))] truncate">{n.veiculoDesc} · {n.veiculoPlaca}</p>}
                      <p className={cn('text-xs font-semibold mt-0.5', n.urgente ? 'text-red-500' : 'text-purple-500')}>{n.revisaoInfo}</p>
                    </div>
                    <Wrench className="w-3.5 h-3.5 text-[rgb(var(--muted-foreground))] flex-shrink-0 mt-1 opacity-50" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="px-4 py-2.5 border-t border-[rgb(var(--card-border))]">
              <Link href="/dashboard" onClick={() => setOpen(false)} className="text-xs text-orange-500 hover:underline font-medium">
                Ver todas as revisoes no Dashboard
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Header ────────────────────────────────────────────────────────────────
export function Header() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  const title = Object.entries(pageTitles).find(([path]) =>
    pathname === path || pathname.startsWith(path + '/')
  )?.[1] ?? 'Motor em Dia';

  const action = Object.entries(quickActions).find(([path]) =>
    pathname === path
  )?.[1];

  return (
    <header className={cn(
      'sticky top-0 z-30 flex items-center justify-between',
      'px-4 lg:px-6 h-14 border-b',
      'bg-[rgb(var(--card))]/80 backdrop-blur-md border-[rgb(var(--card-border))]',
      'lg:top-0 mt-14 lg:mt-0'
    )}>
      <h1 className="text-base font-semibold text-[rgb(var(--foreground))] lg:text-lg">
        {title}
      </h1>

      <div className="flex items-center gap-1.5">
        {action && (
          <Link
            href={action.href}
            className={cn(
              'hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium',
              'bg-orange-500 text-white hover:bg-orange-600 transition-colors shadow-sm'
            )}
          >
            <Plus className="w-4 h-4" />
            {action.label}
          </Link>
        )}
        <button
          onClick={toggleTheme}
          className={cn('p-2 rounded-lg transition-colors', 'hover:bg-[rgb(var(--muted))] text-[rgb(var(--muted-foreground))]')}
          title="Alternar tema"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        <NotificationBell />
        <UserMenu />
      </div>
    </header>
  );
}
