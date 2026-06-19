'use client';

import { useState, useMemo } from 'react';
import { useStore } from '@/lib/store';
import { Cliente, Veiculo, OrdemServico } from '@/lib/types';
import { formatDate, getStatusColor, getStatusLabel, cn } from '@/lib/utils';
import Link from 'next/link';
import {
  ClipboardList,
  Calendar,
  AlertTriangle,
  Wrench,
  ArrowRight,
  Clock,
  CheckCircle2,
  Bell,
  Car,
  Plus,
  Gauge,
  CalendarClock,
  MessageSquare,
} from 'lucide-react';

function StatCard({
  title,
  value,
  icon: Icon,
  color = 'orange',
  href,
  subtitle,
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color?: 'orange' | 'blue' | 'green' | 'red' | 'yellow' | 'slate';
  href?: string;
  subtitle?: string;
}) {
  const colorMap = {
    orange: 'text-orange-500 bg-orange-500/10',
    blue:   'text-blue-500 bg-blue-500/10',
    green:  'text-emerald-500 bg-emerald-500/10',
    red:    'text-red-500 bg-red-500/10',
    yellow: 'text-yellow-500 bg-yellow-500/10',
    slate:  'text-slate-500 bg-slate-500/10',
  };

  const card = (
    <div className={cn(
      'rounded-2xl p-5 border transition-all duration-200',
      'bg-[rgb(var(--card))] border-[rgb(var(--card-border))]',
      href && 'hover:border-orange-500/40 hover:shadow-md cursor-pointer group'
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[rgb(var(--muted-foreground))] truncate">{title}</p>
          <p className="mt-1.5 text-3xl font-bold text-[rgb(var(--foreground))]">{value}</p>
          {subtitle && (
            <p className="mt-1 text-xs text-[rgb(var(--muted-foreground))]">{subtitle}</p>
          )}
        </div>
        <div className={cn('p-3 rounded-xl flex-shrink-0 ml-3', colorMap[color])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {href && (
        <div className="mt-3 flex items-center gap-1 text-xs text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity">
          <span>Ver detalhes</span>
          <ArrowRight className="w-3 h-3" />
        </div>
      )}
    </div>
  );

  if (href) return <Link href={href}>{card}</Link>;
  return card;
}

// Lembrete: veículos que fizeram revisão há mais de 5 meses ou >8000 km sem revisão
function calcularLembretes(
  veiculos: Veiculo[],
  ordens: OrdemServico[],
  clientes: Cliente[]
) {
  const lembretes: {
    veiculoId: string;
    placa: string;
    modelo: string;
    marca: string;
    clienteNome: string;
    clienteWhatsapp: string;
    diasDesdeUltimaOS: number;
    ultimaOSData: string;
    kmAtual: number;
  }[] = [];

  veiculos.forEach((v) => {
    const cliente = clientes.find((c) => c.id === v.clienteId);
    const veiculoOrdens = ordens
      .filter((o) => o.veiculoId === v.id && (o.status === 'finalizada' || o.status === 'entregue'))
      .sort((a, b) => new Date(b.dataEntrada).getTime() - new Date(a.dataEntrada).getTime());

    const ultimaOS = veiculoOrdens[0];
    if (!ultimaOS) return; // sem OS, sem lembrete

    const diasDesde = Math.floor(
      (Date.now() - new Date(ultimaOS.dataEntrada).getTime()) / (1000 * 60 * 60 * 24)
    );

    // Lembrar se mais de 150 dias (5 meses)
    if (diasDesde >= 150) {
      lembretes.push({
        veiculoId: v.id,
        placa: v.placa,
        modelo: `${v.marca} ${v.modelo}`,
        marca: v.marca,
        clienteNome: cliente?.nome ?? 'Cliente',
        clienteWhatsapp: cliente?.whatsapp ?? '',
        diasDesdeUltimaOS: diasDesde,
        ultimaOSData: ultimaOS.dataEntrada,
        kmAtual: v.quilometragem,
      });
    }
  });

  return lembretes.sort((a, b) => b.diasDesdeUltimaOS - a.diasDesdeUltimaOS);
}

export default function DashboardPage() {
  const { ordens, clientes, agendamentos, veiculos } = useStore();

  const today = new Date().toISOString().split('T')[0];

  // ── OS Stats ────────────────────────────────────────────────
  const stats = useMemo(() => {
    const abertas   = ordens.filter(o => o.status === 'aberta').length;
    const andamento = ordens.filter(o => o.status === 'em_andamento').length;
    const aguardando = ordens.filter(o => o.status === 'aguardando_peca').length;
    const prontas   = ordens.filter(o => o.status === 'finalizada').length;
    const agendadosHoje = agendamentos.filter(
      a => a.data === today && a.status !== 'cancelado'
    ).length;
    return { abertas, andamento, aguardando, prontas, agendadosHoje };
  }, [ordens, agendamentos, today]);

  // ── OS recentes abertas ──────────────────────────────────────
  const ordensAtivas = useMemo(() =>
    ordens
      .filter(o => o.status !== 'entregue')
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 6)
      .map(o => ({
        ...o,
        cliente: clientes.find(c => c.id === o.clienteId),
        veiculo: veiculos.find(v => v.id === o.veiculoId),
      })),
    [ordens, clientes, veiculos]
  );

  // ── Agenda de hoje ──────────────────────────────────────────
  const agendaHoje = useMemo(() =>
    agendamentos
      .filter(a => a.data === today && a.status !== 'cancelado')
      .sort((a, b) => a.hora.localeCompare(b.hora))
      .map(a => ({
        ...a,
        cliente: clientes.find(c => c.id === a.clienteId),
        veiculo: veiculos.find(v => v.id === a.veiculoId),
      })),
    [agendamentos, clientes, veiculos, today]
  );

  // ── Lembretes de revisão (método antigo — ≥150 dias) ──────────
  const lembretes = useMemo(
    () => calcularLembretes(veiculos, ordens, clientes),
    [veiculos, ordens, clientes]
  );

  // ── ALERTAS DE PRÓXIMA REVISÃO (baseados por serviço dentro da OS) ──
  const revisaoAlerts = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const alerts: {
      osId: string;
      osNumero: string;
      servicoDesc: string;
      clienteNome: string;
      clienteWhatsapp: string;
      veiculoDesc: string;
      veiculoPlaca: string;
      kmAtual: number;
      proximaRevisaoKm?: number;
      proximaRevisaoData?: string;
      urgente: boolean;
    }[] = [];

    ordens.forEach((os) => {
      os.servicos.forEach((svc) => {
        if (!svc.proximaRevisaoData && !svc.proximaRevisaoKm) return;
        const cliente = clientes.find(c => c.id === os.clienteId);
        const veiculo = veiculos.find(v => v.id === os.veiculoId);

        let urgente = false;
        let visible = false;

        if (svc.proximaRevisaoData) {
          const revisaoDate = new Date(svc.proximaRevisaoData + 'T12:00:00');
          const diffDays = Math.ceil((revisaoDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays <= 30) { visible = true; if (diffDays <= 7) urgente = true; }
        }
        if (svc.proximaRevisaoKm && veiculo) {
          const kmFaltando = svc.proximaRevisaoKm - veiculo.quilometragem;
          if (kmFaltando <= 1000) { visible = true; if (kmFaltando <= 200) urgente = true; }
        }

        if (!visible) return;
        alerts.push({
          osId: os.id,
          osNumero: os.numero,
          servicoDesc: svc.descricao,
          clienteNome: cliente?.nome ?? 'Cliente',
          clienteWhatsapp: cliente?.whatsapp ?? '',
          veiculoDesc: veiculo ? `${veiculo.marca} ${veiculo.modelo}` : '—',
          veiculoPlaca: veiculo?.placa ?? '—',
          kmAtual: veiculo?.quilometragem ?? 0,
          proximaRevisaoKm: svc.proximaRevisaoKm,
          proximaRevisaoData: svc.proximaRevisaoData,
          urgente,
        });
      });
    });

    return alerts.sort((a, b) => (b.urgente ? 1 : 0) - (a.urgente ? 1 : 0));
  }, [ordens, clientes, veiculos]);

  const hora = new Date().getHours();
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[rgb(var(--foreground))]">
            {saudacao}! 👋
          </h2>
          <p className="text-sm text-[rgb(var(--muted-foreground))] mt-0.5">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <Link
          href="/ordens/nova"
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition-colors shadow-md shadow-orange-500/25"
        >
          <Plus className="w-4 h-4" />
          Nova OS
        </Link>
      </div>

      {/* OS Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="OS Abertas"         value={stats.abertas}    icon={ClipboardList}  color="blue"   href="/ordens?status=aberta"         subtitle="Aguardando início" />
        <StatCard title="Em Andamento"        value={stats.andamento}  icon={Wrench}         color="orange" href="/ordens?status=em_andamento"    subtitle="Na oficina" />
        <StatCard title="Aguardando Peça"     value={stats.aguardando} icon={Clock}          color="yellow" href="/ordens?status=aguardando_peca" subtitle="Peça pendente" />
        <StatCard title="Prontas p/ Entrega"  value={stats.prontas}    icon={CheckCircle2}   color="green"  href="/ordens?status=finalizada"      subtitle="Aguardando cliente" />
      </div>

      {/* ── ALERTAS DE PRÓXIMA REVISÃO ────────────────────── */}
      {revisaoAlerts.length > 0 && (
        <div className={cn(
          'rounded-2xl border-l-4 border border-purple-500/40 shadow-md shadow-purple-500/10',
          'bg-gradient-to-r from-purple-500/8 to-[rgb(var(--card))]',
          'border-l-purple-500'
        )}>
          <div className="flex items-center gap-3 px-5 py-4 border-b border-purple-500/15">
            <div className="w-9 h-9 bg-purple-500/15 rounded-xl flex items-center justify-center flex-shrink-0">
              <CalendarClock className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <h3 className="font-bold text-purple-600 dark:text-purple-400 text-base">Próximas Revisões</h3>
              <p className="text-xs text-purple-500/70">Clientes que precisam agendar revisao</p>
            </div>
            <span className="ml-auto text-sm font-bold bg-purple-500 text-white px-3 py-1 rounded-full">
              {revisaoAlerts.length} alerta{revisaoAlerts.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="px-5 py-4 space-y-3">
            {revisaoAlerts.map((a) => {
              const officeName = typeof window !== 'undefined' ? localStorage.getItem('autoflow-office-name') || 'Sua Oficina' : 'Sua Oficina';
              // Build revisaoInfo for display
              const infoParts: string[] = [];
              if (a.proximaRevisaoData) {
                infoParts.push(`Data: ${new Date(a.proximaRevisaoData + 'T12:00:00').toLocaleDateString('pt-BR')}`);
              }
              if (a.proximaRevisaoKm) {
                infoParts.push(`${a.proximaRevisaoKm.toLocaleString('pt-BR')} km`);
              }
              const revisaoInfo = infoParts.join(' ou ');

              const dataFormatada = a.proximaRevisaoData
                ? new Date(a.proximaRevisaoData + 'T12:00:00').toLocaleDateString('pt-BR')
                : null;

              const waMsg = [
                `Olá *${a.clienteNome}*!`,
                ``,
                `A manutenção do seu veículo *${a.veiculoDesc}* (*${a.veiculoPlaca}*) está se aproximando da data recomendada para nova execução.`,
                dataFormatada ? `\n📅 Previsão: *${dataFormatada}*` : (a.proximaRevisaoKm ? `\n🔧 Previsão: *${a.proximaRevisaoKm.toLocaleString('pt-BR')} km*` : ''),
                ``,
                `A última *${a.servicoDesc}* realizada anteriormente está chegando ao prazo indicado pelo fabricante. Para manter a segurança, o desempenho e a garantia dos componentes, recomendamos agendar a próxima manutenção.`,
                ``,
                `Entre em contato conosco para verificar os serviços necessários e agendar seu atendimento.`,
                ``,
                `*${officeName}* 🔧`,
              ].join('\n');
              const waLink = `https://wa.me/55${a.clienteWhatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(waMsg)}`;
              return (
                <div key={a.osId + a.servicoDesc} className={cn(
                  'flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all',
                  a.urgente
                    ? 'bg-red-500/8 border-red-500/25 shadow-sm shadow-red-500/10'
                    : 'bg-purple-500/5 border-purple-500/15'
                )}>
                  <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0',
                    a.urgente ? 'bg-red-500/15' : 'bg-purple-500/10'
                  )}>
                    {a.urgente
                      ? <AlertTriangle className="w-5 h-5 text-red-500" />
                      : <CalendarClock className="w-5 h-5 text-purple-500" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-[rgb(var(--foreground))]">{a.clienteNome}</span>
                      {a.urgente && <span className="text-xs bg-red-500/15 text-red-500 px-2 py-0.5 rounded-full font-bold animate-pulse">URGENTE</span>}
                    </div>
                    <p className="text-xs text-orange-500 font-medium mt-0.5">{a.servicoDesc}</p>
                    <p className="text-xs text-[rgb(var(--muted-foreground))] mt-0.5">{a.veiculoDesc} &middot; <strong>{a.veiculoPlaca}</strong></p>
                    <p className={cn(
                      'text-xs font-semibold mt-1 px-2 py-0.5 rounded-md inline-block',
                      a.urgente
                        ? 'bg-red-500/10 text-red-500'
                        : 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                    )}>{revisaoInfo}</p>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <Link href={`/ordens/${a.osId}`}
                      className="p-2 rounded-lg text-[rgb(var(--muted-foreground))] hover:text-orange-500 hover:bg-orange-500/10 transition-colors"
                      title="Ver OS">
                      <Wrench className="w-3.5 h-3.5" />
                    </Link>
                    {a.clienteWhatsapp && (
                      <a href={waLink} target="_blank" rel="noopener noreferrer"
                        className="p-2 rounded-lg text-[rgb(var(--muted-foreground))] hover:text-green-500 hover:bg-green-500/10 transition-colors"
                        title="Avisar pelo WhatsApp">
                        <MessageSquare className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* OS Ativas - takes 2 cols */}
        <div className={cn(
          'lg:col-span-2 rounded-2xl p-5 border',
          'bg-[rgb(var(--card))] border-[rgb(var(--card-border))]'
        )}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-orange-500" />
              <h3 className="font-semibold text-[rgb(var(--foreground))]">OS em Aberto</h3>
            </div>
            <Link href="/ordens" className="text-xs text-orange-500 hover:underline flex items-center gap-1">
              Ver todas <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-7">
            {ordensAtivas.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
                <p className="text-sm text-[rgb(var(--muted-foreground))]">Nenhuma OS em aberto</p>
              </div>
            ) : (
              ordensAtivas.map((o) => (
                <Link
                  key={o.id}
                  href={`/ordens/${o.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-[rgb(var(--muted))] transition-colors group"
                >
                  {/* Status dot */}
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                    <Wrench className="w-4 h-4 text-orange-500" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-[rgb(var(--muted-foreground))]">{o.numero}</span>
                      <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', getStatusColor(o.status))}>
                        {getStatusLabel(o.status)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Car className="w-3 h-3 text-[rgb(var(--muted-foreground))]" />
                      <span className="text-sm font-semibold text-[rgb(var(--foreground))] truncate">
                        {o.veiculo ? `${o.veiculo.placa} · ${o.veiculo.marca} ${o.veiculo.modelo}` : '—'}
                      </span>
                    </div>
                    <p className="text-xs text-[rgb(var(--muted-foreground))] truncate mt-0.5">
                      {o.cliente?.nome} · {o.problemaRelatado}
                    </p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-[rgb(var(--muted-foreground))]">{formatDate(o.dataEntrada)}</p>
                    <ArrowRight className="w-3.5 h-3.5 text-[rgb(var(--muted-foreground))] mt-1 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Agenda de hoje */}
        <div className={cn(
          'rounded-2xl p-5 border',
          'bg-[rgb(var(--card))] border-[rgb(var(--card-border))]'
        )}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-orange-500" />
              <h3 className="font-semibold text-[rgb(var(--foreground))]">Agenda Hoje</h3>
            </div>
            <Link href="/agenda" className="text-xs text-orange-500 hover:underline">
              Ver agenda
            </Link>
          </div>

          {agendaHoje.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Calendar className="w-7 h-7 text-[rgb(var(--muted-foreground))] mb-2" />
              <p className="text-sm text-[rgb(var(--muted-foreground))]">Sem agendamentos hoje</p>
              <Link href="/agenda" className="mt-2 text-xs text-orange-500 hover:underline">
                Agendar serviço
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {agendaHoje.map((a) => (
                <div key={a.id} className="flex items-start gap-3 p-3 rounded-xl bg-[rgb(var(--muted))]">
                  <div className="text-center w-12 flex-shrink-0">
                    <p className="text-base font-bold text-orange-500 leading-none">{a.hora}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[rgb(var(--foreground))] truncate">{a.cliente?.nome}</p>
                    <p className="text-xs text-[rgb(var(--muted-foreground))] truncate">
                      {a.veiculo ? `${a.veiculo.placa} · ${a.veiculo.marca} ${a.veiculo.modelo}` : a.servico}
                    </p>
                    <p className="text-xs text-[rgb(var(--muted-foreground))] truncate">{a.servico}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Agendamentos do dia counter */}
          {stats.agendadosHoje > 0 && (
            <div className="mt-3 pt-3 border-t border-[rgb(var(--card-border))] text-center">
              <p className="text-xs text-[rgb(var(--muted-foreground))]">
                <span className="font-bold text-orange-500">{stats.agendadosHoje}</span> agendamento{stats.agendadosHoje !== 1 ? 's' : ''} hoje
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Lembretes de Revisão */}
      <div className={cn('rounded-2xl p-5 border', 'bg-[rgb(var(--card))] border-[rgb(var(--card-border))]')}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-yellow-500" />
            <h3 className="font-semibold text-[rgb(var(--foreground))]">Lembretes de Revisão</h3>
            {lembretes.length > 0 && (
              <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {lembretes.length}
              </span>
            )}
          </div>
          <p className="text-xs text-[rgb(var(--muted-foreground))]">Veículos sem visita há mais de 5 meses</p>
        </div>

        {lembretes.length === 0 ? (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            <p className="text-sm text-emerald-600 dark:text-emerald-400">
              Ótimo! Nenhum veículo precisa de lembrete de revisão no momento.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {lembretes.slice(0, 6).map((l) => {
              const meses = Math.floor(l.diasDesdeUltimaOS / 30);
              const whatsappMsg = `Olá ${l.clienteNome}! 🔧\n\nFaz ${meses} meses que seu *${l.modelo}* (placa *${l.placa}*) não passa por revisão.\n\nQue tal agendar uma revisão preventiva? Mantenha seu carro sempre em dia! 🚗✅\n\n_AutoFlow — Sua Oficina_`;
              const waLink = `https://wa.me/55${l.clienteWhatsapp.replace(/\D/g,'')}?text=${encodeURIComponent(whatsappMsg)}`;

              return (
                <div
                  key={l.veiculoId}
                  className="p-4 rounded-xl border border-yellow-500/25 bg-yellow-500/5 hover:border-yellow-500/40 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-yellow-500/15 flex items-center justify-center flex-shrink-0">
                        <Car className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-mono font-bold text-sm text-[rgb(var(--foreground))]">{l.placa}</p>
                        <p className="text-xs text-[rgb(var(--muted-foreground))] truncate">{l.modelo}</p>
                      </div>
                    </div>
                    <span className="text-xs bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 px-2 py-0.5 rounded-full flex-shrink-0 font-medium">
                      {meses}m atrás
                    </span>
                  </div>

                  <p className="text-xs text-[rgb(var(--muted-foreground))] mt-2">👤 {l.clienteNome}</p>
                  <div className="flex items-center gap-1 mt-0.5 text-xs text-[rgb(var(--muted-foreground))]">
                    <Gauge className="w-3 h-3" />
                    {l.kmAtual.toLocaleString('pt-BR')} km
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    <Link
                      href={`/veiculos/${l.veiculoId}`}
                      className="flex-1 text-center py-1.5 rounded-lg text-xs font-medium bg-[rgb(var(--muted))] text-[rgb(var(--foreground))] hover:bg-[rgb(var(--card-border))] transition-colors"
                    >
                      Ver histórico
                    </Link>
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center py-1.5 rounded-lg text-xs font-medium bg-green-500 text-white hover:bg-green-600 transition-colors"
                    >
                      WhatsApp
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
