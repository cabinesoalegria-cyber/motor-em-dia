'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  Car,
  ClipboardList,
  Lock,
  Calendar,
  Package,
  MessageSquare,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Wrench,
  FileSearch,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Grupos com cores distintas ──────────────────────────────────────
const navGroups = [
  {
    label: 'Principal',
    color: 'orange' as const,
    items: [
      { href: '/dashboard',  label: 'Dashboard',         icon: LayoutDashboard },
      { href: '/ordens',     label: 'Ordens de Serviço', icon: ClipboardList },
      { href: '/orcamentos', label: 'Orçamentos',        icon: FileSearch },
    ],
  },
  {
    label: 'Cadastros',
    color: 'blue' as const,
    items: [
      { href: '/clientes',   label: 'Clientes',          icon: Users },
      { href: '/veiculos',   label: 'Veículos',          icon: Car },
      { href: '/servicos',   label: 'Cat. Serviços',     icon: Wrench },
    ],
  },
  {
    label: 'Operacional',
    color: 'emerald' as const,
    items: [
      { href: '/agenda',     label: 'Agenda',            icon: Calendar },
      { href: '/estoque',    label: 'Estoque',           icon: Package },
      { href: '/whatsapp',   label: 'WhatsApp',          icon: MessageSquare },
    ],
  },
  {
    label: 'Administrativo',
    color: 'slate' as const,
    items: [
      { href: '/financeiro', label: 'Financeiro',        icon: Lock, locked: true },
    ],
  },
];

type GroupColor = 'orange' | 'blue' | 'emerald' | 'slate';

const groupColorMap: Record<GroupColor, {
  label: string;
  active: string;
  activeShadow: string;
  hover: string;
}> = {
  orange: {
    label:       'text-orange-500',
    active:      'bg-orange-500 text-white',
    activeShadow:'shadow-md shadow-orange-500/30',
    hover:       'hover:bg-orange-500/10 hover:text-orange-600 dark:hover:text-orange-400',
  },
  blue: {
    label:       'text-blue-500',
    active:      'bg-blue-500 text-white',
    activeShadow:'shadow-md shadow-blue-500/30',
    hover:       'hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400',
  },
  emerald: {
    label:       'text-emerald-500',
    active:      'bg-emerald-500 text-white',
    activeShadow:'shadow-md shadow-emerald-500/30',
    hover:       'hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400',
  },
  slate: {
    label:       'text-slate-500',
    active:      'bg-slate-600 text-white',
    activeShadow:'shadow-md shadow-slate-500/20',
    hover:       'hover:bg-slate-500/10 hover:text-[rgb(var(--foreground))]',
  },
};

// ─── NavItem ─────────────────────────────────────────────────────────
interface NavItemProps {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  locked?: boolean;
  isActive: boolean;
  collapsed: boolean;
  color: GroupColor;
  onClick?: () => void;
}

function NavItem({ href, label, icon: Icon, locked, isActive, collapsed, color, onClick }: NavItemProps) {
  const c = groupColorMap[color];
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3.5 px-3 py-4 rounded-xl text-sm font-medium transition-all duration-200',
        isActive
          ? cn(c.active, c.activeShadow)
          : cn('text-[rgb(var(--muted-foreground))]', c.hover)
      )}
    >
      <Icon className="w-[22px] h-[22px] flex-shrink-0" />
      {!collapsed && (
        <>
          <span className="truncate flex-1">{label}</span>
          {locked && <Lock className="w-3 h-3 flex-shrink-0 opacity-50" />}
        </>
      )}
    </Link>
  );
}

// ─── Logo hook ───────────────────────────────────────────────────────
function useLogo() {
  const [logo, setLogo] = useState('');
  const [name, setName] = useState('');
  useEffect(() => {
    const read = () => {
      setLogo(localStorage.getItem('autoflow-office-logo') || '');
      setName(localStorage.getItem('autoflow-office-name') || '');
    };
    read();
    window.addEventListener('storage', read);
    return () => window.removeEventListener('storage', read);
  }, []);
  return { logo, name };
}

// ─── SidebarContent ──────────────────────────────────────────────────
function SidebarContent({ collapsed, onClose }: { collapsed: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const { logo, name } = useLogo();

  return (
    <>
      {/* Cabeçalho com logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-[rgb(var(--sidebar-border))]">
        <div
          className="flex-shrink-0 w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center shadow-lg shadow-orange-500/20"
          style={logo ? {} : { background: 'rgb(249, 115, 22)' }}
        >
          {logo
            ? <img src={logo} alt="logo" className="w-full h-full object-contain" />
            : <Wrench className="w-5 h-5 text-white" strokeWidth={2.5} />
          }
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <span className="font-bold text-lg tracking-tight text-[rgb(var(--foreground))] block truncate">
              {name || <span>Minha<span className="text-orange-500">Oficina</span></span>}
            </span>
            <p className="text-xs text-[rgb(var(--muted-foreground))] -mt-0.5">Gestao de Oficina</p>
          </div>
        )}
      </div>

      {/* Nav por grupo com cores */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-6">
        {navGroups.map((group) => {
          const c = groupColorMap[group.color];
          return (
            <div key={group.label}>
              {!collapsed && (
                <p className={cn(
                  'px-3 text-[10px] font-bold uppercase tracking-widest mb-2',
                  c.label
                )}>
                  {group.label}
                </p>
              )}
              <div className="space-y-1.5">
                {group.items.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                  return (
                    <NavItem
                      key={item.href}
                      {...item}
                      isActive={isActive}
                      collapsed={collapsed}
                      color={group.color}
                      onClick={onClose}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Configurações */}
      <div className="px-3 pb-4 border-t border-[rgb(var(--sidebar-border))] pt-4">
        <Link
          href="/configuracoes"
          onClick={onClose}
          className={cn(
            'flex items-center gap-3.5 px-3 py-4 rounded-xl text-sm font-medium transition-all duration-200',
            pathname === '/configuracoes'
              ? 'bg-slate-600 text-white shadow-md'
              : 'text-[rgb(var(--muted-foreground))] hover:bg-slate-500/10 hover:text-[rgb(var(--foreground))]'
          )}
        >
          <Settings className="w-[22px] h-[22px] flex-shrink-0" />
          {!collapsed && <span className="truncate flex-1">Configurações</span>}
        </Link>
      </div>
    </>
  );
}

// ─── Sidebar principal ───────────────────────────────────────────────
export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop */}
      <aside className={cn(
        'hidden lg:flex flex-col h-screen sticky top-0',
        'bg-[rgb(var(--sidebar-bg))] border-r border-[rgb(var(--sidebar-border))]',
        'transition-all duration-300 ease-in-out flex-shrink-0',
        collapsed ? 'w-[72px]' : 'w-[252px]'
      )}>
        <SidebarContent collapsed={collapsed} />
        <div className="px-3 pb-4 border-t border-[rgb(var(--sidebar-border))] pt-3">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center gap-3.5 px-3 py-3 rounded-xl text-sm text-[rgb(var(--muted-foreground))] hover:bg-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))] transition-all"
          >
            {collapsed ? <ChevronRight className="w-[22px] h-[22px]" /> : (
              <><ChevronLeft className="w-[22px] h-[22px]" /><span>Recolher</span></>
            )}
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-14 bg-[rgb(var(--sidebar-bg))] border-b border-[rgb(var(--sidebar-border))]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <Wrench className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-base">Auto<span className="text-orange-500">Flow</span></span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-lg hover:bg-[rgb(var(--muted))] transition-colors">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <>
          <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setMobileOpen(false)} />
          <aside className="lg:hidden fixed top-0 left-0 bottom-0 w-72 z-50 flex flex-col bg-[rgb(var(--sidebar-bg))] border-r border-[rgb(var(--sidebar-border))]">
            <SidebarContent collapsed={false} onClose={() => setMobileOpen(false)} />
          </aside>
        </>
      )}
    </>
  );
}
