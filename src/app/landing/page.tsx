'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Wrench, Bell, Car, FileText, BarChart3, MessageSquare,
  CheckCircle2, X, ChevronRight, Star, Shield, Smartphone,
  Cloud, Clock, Users, TrendingUp, DollarSign, Zap,
  ArrowRight, Menu, Play, AlertCircle, Calendar, Package,
  RotateCcw, LineChart
} from 'lucide-react';

// ─── Utility ───────────────────────────────────────────────────────────────
function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}

// ─── Hook: Intersection Observer for scroll animations ─────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); obs.disconnect(); }
    }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// ─── ROI Calculator ────────────────────────────────────────────────────────
function ROICalculator() {
  const [clients, setClients] = useState(10);
  const [ticket, setTicket] = useState(300);
  const { ref, inView } = useInView();

  const monthly = clients * ticket;
  const annual = monthly * 12;

  return (
    <div ref={ref} className={cn(
      'relative rounded-3xl overflow-hidden transition-all duration-700',
      inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
    )}>
      <div className="absolute inset-0 bg-gradient-to-br from-orange-600 via-orange-500 to-amber-500" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
      <div className="relative z-10 p-8 md:p-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-orange-100 text-sm font-medium">Calculadora de Retorno</p>
            <h3 className="text-white text-xl font-bold">Quanto você está deixando na mesa?</h3>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-orange-100 text-sm font-medium mb-2">
                Clientes que poderiam retornar por mês
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range" min={5} max={100} step={5} value={clients}
                  onChange={e => setClients(Number(e.target.value))}
                  className="flex-1 accent-white"
                />
                <span className="text-white font-bold text-xl w-16 text-right">{clients}</span>
              </div>
            </div>
            <div>
              <label className="block text-orange-100 text-sm font-medium mb-2">
                Ticket médio por serviço (R$)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range" min={100} max={2000} step={50} value={ticket}
                  onChange={e => setTicket(Number(e.target.value))}
                  className="flex-1 accent-white"
                />
                <span className="text-white font-bold text-xl w-24 text-right">
                  R$ {ticket.toLocaleString('pt-BR')}
                </span>
              </div>
            </div>
            <p className="text-orange-100 text-sm leading-relaxed">
              🔥 Esses são clientes que já confiam na sua oficina mas estão indo para a concorrência por falta de acompanhamento.
            </p>
          </div>

          <div className="flex flex-col justify-center space-y-4">
            <div className="bg-white/15 backdrop-blur rounded-2xl p-5 border border-white/20">
              <p className="text-orange-100 text-sm mb-1">Faturamento recuperado por mês</p>
              <p className="text-white text-3xl font-black">
                R$ {monthly.toLocaleString('pt-BR')}
              </p>
            </div>
            <div className="bg-white/25 backdrop-blur rounded-2xl p-5 border border-white/30">
              <p className="text-orange-100 text-sm mb-1">Faturamento recuperado por ano</p>
              <p className="text-white text-4xl font-black">
                R$ {annual.toLocaleString('pt-BR')}
              </p>
              <p className="text-orange-100 text-xs mt-1">apenas com lembretes automáticos</p>
            </div>
            <Link
              href="/cadastro"
              className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white text-orange-600 font-bold hover:bg-orange-50 transition-colors text-sm"
            >
              Quero recuperar esses clientes <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Animated Counter ──────────────────────────────────────────────────────
function Counter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView();

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1500;
    const step = value / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setCount(value); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, value]);

  return <span ref={ref}>{count.toLocaleString('pt-BR')}{suffix}</span>;
}

// ─── Dashboard Mockup ──────────────────────────────────────────────────────
function DashboardMockup() {
  return (
    <div className="relative w-full max-w-lg mx-auto">
      {/* Glow */}
      <div className="absolute -inset-4 bg-orange-500/20 blur-3xl rounded-full" />

      {/* Main window */}
      <div className="relative bg-[#0f1117] rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
        {/* Window bar */}
        <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border-b border-white/10">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
          <div className="flex-1 mx-4 bg-white/10 rounded px-3 py-0.5 text-[10px] text-white/40">
            app.motoremdia.com.br/dashboard
          </div>
        </div>

        {/* Sidebar + Content */}
        <div className="flex h-64">
          {/* Sidebar */}
          <div className="w-14 bg-white/5 border-r border-white/10 flex flex-col items-center py-3 gap-3">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <Wrench className="w-4 h-4 text-white" />
            </div>
            {[BarChart3, Car, FileText, Calendar, Package].map((Icon, i) => (
              <div key={i} className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center',
                i === 0 ? 'bg-white/10' : 'bg-transparent'
              )}>
                <Icon className="w-4 h-4 text-white/50" />
              </div>
            ))}
          </div>

          {/* Main content */}
          <div className="flex-1 p-3 space-y-2 overflow-hidden">
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'OS Abertas', value: '12', color: 'text-orange-400' },
                { label: 'Revisões', value: '8', color: 'text-yellow-400' },
                { label: 'Faturamento', value: 'R$14k', color: 'text-emerald-400' },
              ].map(s => (
                <div key={s.label} className="bg-white/5 rounded-lg p-2">
                  <p className="text-white/40 text-[9px]">{s.label}</p>
                  <p className={cn('font-bold text-sm', s.color)}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Notification alerts */}
            <div className="space-y-1.5">
              <p className="text-white/40 text-[9px] font-medium uppercase tracking-wide">Lembretes do dia</p>
              {[
                { name: 'João Silva', car: 'Civic 2019', service: 'Troca de óleo', days: '3 dias' },
                { name: 'Maria Santos', car: 'Gol 2021', service: 'Revisão 30.000km', days: 'hoje' },
                { name: 'Carlos Lima', car: 'Hilux 2020', service: 'Filtros', days: '1 dia' },
              ].map(n => (
                <div key={n.name} className="flex items-center gap-2 bg-white/5 rounded-lg px-2 py-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-[9px] font-medium truncate">{n.name} · {n.car}</p>
                    <p className="text-white/40 text-[8px] truncate">{n.service}</p>
                  </div>
                  <span className="text-orange-400 text-[8px] font-bold flex-shrink-0">{n.days}</span>
                </div>
              ))}
            </div>

            {/* Mini chart */}
            <div className="bg-white/5 rounded-lg p-2">
              <p className="text-white/40 text-[9px] mb-1">Faturamento / 6 meses</p>
              <div className="flex items-end gap-1 h-8">
                {[40, 55, 45, 70, 60, 90].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm bg-gradient-to-t from-orange-500 to-orange-400"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating notification */}
      <div className="absolute -right-4 top-8 bg-white rounded-xl shadow-2xl p-3 w-48 border border-orange-100 animate-bounce" style={{ animationDuration: '3s' }}>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 bg-orange-500 rounded-lg flex items-center justify-center">
            <Bell className="w-3 h-3 text-white" />
          </div>
          <span className="text-[10px] font-bold text-gray-800">Motor em Dia</span>
        </div>
        <p className="text-[10px] text-gray-600 leading-tight">
          🔔 <strong>5 clientes</strong> precisam de revisão esta semana!
        </p>
      </div>

      {/* Floating WhatsApp card */}
      <div className="absolute -left-4 bottom-8 bg-white rounded-xl shadow-2xl p-3 w-44 border border-green-100">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 bg-[#25D366] rounded-lg flex items-center justify-center">
            <MessageSquare className="w-3 h-3 text-white" />
          </div>
          <span className="text-[10px] font-bold text-gray-800">WhatsApp</span>
        </div>
        <p className="text-[10px] text-gray-600 leading-tight">
          Olá <strong>João!</strong> Sua revisão está próxima. Agende agora 🚗
        </p>
      </div>
    </div>
  );
}

// ─── Section wrapper with animation ───────────────────────────────────────
function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const { ref, inView } = useInView();
  return (
    <div ref={ref} className={cn(
      'transition-all duration-700',
      inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6',
      className
    )}>
      {children}
    </div>
  );
}

// ─── Main Landing Page ─────────────────────────────────────────────────────
export default function LandingPage() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <div className="min-h-screen bg-[#06080f] text-white overflow-x-hidden">

      {/* ── NAV ─────────────────────────────────────────────────────── */}
      <nav className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled ? 'bg-[#06080f]/95 backdrop-blur-md border-b border-white/10 py-3' : 'py-5'
      )}>
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-lg">Motor em Dia</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm text-white/70">
            <a href="#problema" className="hover:text-white transition-colors">Problemas</a>
            <a href="#solucao" className="hover:text-white transition-colors">Solução</a>
            <a href="#como-funciona" className="hover:text-white transition-colors">Como funciona</a>
            <a href="#calculadora" className="hover:text-white transition-colors">Calculadora</a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="text-sm text-white/70 hover:text-white transition-colors px-4 py-2">
              Entrar
            </Link>
            <Link
              href="/cadastro"
              className="text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-xl transition-all hover:shadow-lg hover:shadow-orange-500/30"
            >
              Testar grátis
            </Link>
          </div>

          <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden p-2 text-white/70">
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {mobileMenu && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-[#06080f]/98 backdrop-blur border-b border-white/10 px-4 py-4 space-y-3">
            {['#problema', '#solucao', '#como-funciona', '#calculadora'].map(href => (
              <a key={href} href={href} onClick={() => setMobileMenu(false)}
                className="block text-white/70 hover:text-white py-2 capitalize">
                {href.replace('#', '').replace('-', ' ')}
              </a>
            ))}
            <Link href="/cadastro" onClick={() => setMobileMenu(false)}
              className="block text-center bg-orange-500 text-white font-semibold py-3 rounded-xl mt-2">
              Testar grátis — 14 dias
            </Link>
          </div>
        )}
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-orange-600/10 blur-[120px] rounded-full" />
          <div className="absolute top-20 right-0 w-64 h-64 bg-orange-500/5 blur-3xl rounded-full" />
        </div>

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

        <div className="relative max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-1.5 mb-6">
                <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
                <span className="text-orange-400 text-sm font-medium">Sistema para Oficinas Mecânicas</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] mb-6 text-white">
                Transforme clientes{' '}
                <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                  ocasionais
                </span>{' '}
                em clientes{' '}
                <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                  recorrentes.
                </span>
              </h1>

              <p className="text-white/60 text-lg leading-relaxed mb-8 max-w-lg">
                O Motor em Dia lembra você quando cada cliente precisa voltar para revisão, troca de óleo ou manutenção preventiva — ajudando sua oficina a <strong className="text-white/90">aumentar o faturamento sem aumentar os custos</strong> de aquisição de clientes.
              </p>

              <div className="flex flex-wrap gap-3 mb-10">
                <Link
                  href="/cadastro"
                  className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-7 py-4 rounded-xl transition-all hover:shadow-xl hover:shadow-orange-500/30 hover:-translate-y-0.5 text-base"
                >
                  Testar Gratuitamente <ArrowRight className="w-5 h-5" />
                </Link>
                <a
                  href="#como-funciona"
                  className="flex items-center gap-2 border border-white/20 hover:border-white/40 text-white/80 hover:text-white font-medium px-7 py-4 rounded-xl transition-all text-base"
                >
                  <Play className="w-4 h-4" /> Ver como funciona
                </a>
              </div>

              {/* Social proof */}
              <div className="flex flex-wrap items-center gap-5">
                <div className="flex -space-x-2">
                  {['JC', 'MS', 'RL', 'AT'].map(initials => (
                    <div key={initials} className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 border-2 border-[#06080f] flex items-center justify-center text-xs font-bold text-white">
                      {initials}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-0.5">
                    {Array(5).fill(0).map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-orange-400 text-orange-400" />)}
                  </div>
                  <p className="text-white/50 text-xs">Mais de 150 oficinas já usam</p>
                </div>
                <div className="h-8 w-px bg-white/10" />
                <div className="text-sm">
                  <span className="text-white font-bold">14 dias</span>
                  <span className="text-white/50"> grátis • sem cartão</span>
                </div>
              </div>
            </div>

            {/* Right: Mockup */}
            <div className="relative hidden lg:block">
              <DashboardMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ───────────────────────────────────────────────── */}
      <section className="border-y border-white/10 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: 150, suffix: '+', label: 'Oficinas ativas' },
              { value: 3200, suffix: '+', label: 'Veículos cadastrados' },
              { value: 98, suffix: '%', label: 'Taxa de satisfação' },
              { value: 14, suffix: ' dias', label: 'Grátis para testar' },
            ].map(s => (
              <div key={s.label}>
                <p className="text-3xl md:text-4xl font-black text-orange-400">
                  <Counter value={s.value} suffix={s.suffix} />
                </p>
                <p className="text-white/50 text-sm mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROBLEMA ────────────────────────────────────────────────── */}
      <section id="problema" className="py-24">
        <div className="max-w-6xl mx-auto px-4">
          <Section>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-full px-4 py-1.5 mb-4">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span className="text-red-400 text-sm font-medium">A realidade da maioria das oficinas</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                Quantos clientes sua oficina<br />
                <span className="text-red-400">já perdeu por esquecimento?</span>
              </h2>
              <p className="text-white/50 max-w-lg mx-auto">
                Esses problemas custam muito dinheiro — e a maioria dos donos de oficina nem percebe.
              </p>
            </div>
          </Section>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: Clock,
                title: 'Clientes somem após o serviço',
                desc: 'Fazem a revisão uma vez e nunca mais voltam. Foram para a concorrência.',
                color: 'red',
              },
              {
                icon: RotateCcw,
                title: 'Trocas de óleo perdidas',
                desc: 'O cliente não lembra do prazo e você não tem como avisar. Dinheiro na mesa.',
                color: 'red',
              },
              {
                icon: Car,
                title: 'Sem acompanhamento de veículos',
                desc: 'Cada visita começa do zero. Histórico? Só na memória — se tiver.',
                color: 'red',
              },
              {
                icon: MessageSquare,
                title: 'WhatsApp desorganizado',
                desc: 'Mensagens misturadas com fornecedores, amigos e clientes. Caos total.',
                color: 'red',
              },
              {
                icon: FileText,
                title: 'Histórico que some',
                desc: 'O histórico do cliente está em papel, caderno ou na memória do mecânico.',
                color: 'red',
              },
              {
                icon: BarChart3,
                title: 'Sem visão do faturamento',
                desc: 'Não sabe ao certo quanto entrou, quanto saiu e qual serviço mais rende.',
                color: 'red',
              },
            ].map((item, i) => {
              const { ref, inView } = useInView();
              return (
                <div
                  key={i}
                  ref={ref}
                  style={{ transitionDelay: `${i * 80}ms` }}
                  className={cn(
                    'group relative bg-red-500/5 border border-red-500/15 rounded-2xl p-6 transition-all duration-500 hover:border-red-500/30 hover:bg-red-500/10',
                    inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  )}
                >
                  <div className="w-10 h-10 bg-red-500/15 rounded-xl flex items-center justify-center mb-4">
                    <item.icon className="w-5 h-5 text-red-400" />
                  </div>
                  <h3 className="text-white font-bold mb-2">{item.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
                  <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-40 transition-opacity">
                    <X className="w-5 h-5 text-red-400" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── SOLUÇÃO ─────────────────────────────────────────────────── */}
      <section id="solucao" className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-950/10 to-transparent" />
        <div className="relative max-w-6xl mx-auto px-4">
          <Section>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-1.5 mb-4">
                <CheckCircle2 className="w-4 h-4 text-orange-400" />
                <span className="text-orange-400 text-sm font-medium">A solução completa</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                Tudo que sua oficina precisa<br />
                <span className="text-orange-400">em um único sistema</span>
              </h2>
              <p className="text-white/50 max-w-lg mx-auto">
                O Motor em Dia foi criado especificamente para oficinas mecânicas, com as funcionalidades que realmente importam.
              </p>
            </div>
          </Section>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: Car,
                title: 'Cadastro completo de veículos',
                desc: 'Marca, modelo, ano, placa, cor, quilometragem. Histórico completo de cada carro atendido.',
                highlight: true,
              },
              {
                icon: FileText,
                title: 'Ordens de Serviço digitais',
                desc: 'Crie, edite e envie OS pelo celular ou computador. PDF profissional com um clique.',
                highlight: false,
              },
              {
                icon: Bell,
                title: 'Alertas automáticos de revisão',
                desc: 'O sistema avisa quando é hora de ligar para o cliente — por data ou quilometragem.',
                highlight: true,
              },
              {
                icon: MessageSquare,
                title: 'Integração com WhatsApp',
                desc: 'Mensagem personalizada com um clique. Sem copiar e colar, sem esquecer nenhum cliente.',
                highlight: false,
              },
              {
                icon: DollarSign,
                title: 'Financeiro integrado',
                desc: 'Controle de entradas, saídas e lucratividade por serviço. Visão real do dinheiro.',
                highlight: false,
              },
              {
                icon: BarChart3,
                title: 'Dashboard gerencial',
                desc: 'Visão geral do negócio: OS abertas, revisões próximas, faturamento do mês.',
                highlight: true,
              },
              {
                icon: Calendar,
                title: 'Agenda de serviços',
                desc: 'Organize os atendimentos do dia e da semana. Evite conflitos e atrasos.',
                highlight: false,
              },
              {
                icon: Package,
                title: 'Controle de estoque',
                desc: 'Gerencie peças e insumos. Saiba o que está acabando antes de precisar.',
                highlight: false,
              },
              {
                icon: LineChart,
                title: 'Relatórios detalhados',
                desc: 'Serviços mais rentáveis, clientes mais frequentes, performance por período.',
                highlight: false,
              },
            ].map((item, i) => {
              const { ref, inView } = useInView();
              return (
                <div
                  key={i}
                  ref={ref}
                  style={{ transitionDelay: `${i * 70}ms` }}
                  className={cn(
                    'group rounded-2xl p-6 border transition-all duration-500 hover:-translate-y-1',
                    item.highlight
                      ? 'bg-orange-500/10 border-orange-500/30 hover:border-orange-500/50'
                      : 'bg-white/[0.03] border-white/10 hover:border-white/20',
                    inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  )}
                >
                  <div className={cn(
                    'w-11 h-11 rounded-xl flex items-center justify-center mb-4',
                    item.highlight ? 'bg-orange-500/20' : 'bg-white/10'
                  )}>
                    <item.icon className={cn('w-5 h-5', item.highlight ? 'text-orange-400' : 'text-white/60')} />
                  </div>
                  <h3 className="text-white font-bold mb-2">{item.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
                  {item.highlight && (
                    <div className="mt-3 flex items-center gap-1.5 text-orange-400 text-xs font-medium">
                      <Zap className="w-3 h-3" /> Funcionalidade chave
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── BENEFÍCIOS ──────────────────────────────────────────────── */}
      <section className="py-24 bg-white/[0.02] border-y border-white/10">
        <div className="max-w-6xl mx-auto px-4">
          <Section>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                O que muda na sua oficina<br />
                <span className="text-orange-400">a partir do primeiro mês</span>
              </h2>
            </div>
          </Section>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: TrendingUp, title: 'Mais clientes retornando', desc: 'Clientes avisados no momento certo voltam mais. Simples assim.', metric: '+40%', metricLabel: 'de retorno médio' },
              { icon: DollarSign, title: 'Faturamento recorrente', desc: 'Cada cliente fidelizado gera renda previsível e constante para sua oficina.', metric: 'R$ 3k+', metricLabel: 'recuperados/mês' },
              { icon: Bell, title: 'Zero esquecimentos', desc: 'Alertas automáticos. Nenhum cliente cai no esquecimento por falta de atenção.', metric: '100%', metricLabel: 'de cobertura' },
              { icon: FileText, title: 'Mais organização', desc: 'Tudo em um lugar: histórico, OS, peças, finanças. Sua equipe mais produtiva.', metric: '2h+', metricLabel: 'economizadas/dia' },
              { icon: Star, title: 'Atendimento mais profissional', desc: 'Impressione clientes com OS digital, histórico completo e respostas rápidas.', metric: '5★', metricLabel: 'percepção de qualidade' },
              { icon: Users, title: 'Relacionamento contínuo', desc: 'Não perca o vínculo com o cliente entre as visitas. Mantenha contato de forma inteligente.', metric: '3x', metricLabel: 'mais engajamento' },
            ].map((item, i) => {
              const { ref, inView } = useInView();
              return (
                <div
                  key={i}
                  ref={ref}
                  style={{ transitionDelay: `${i * 80}ms` }}
                  className={cn(
                    'bg-white/[0.04] border border-white/10 rounded-2xl p-6 hover:border-orange-500/30 hover:bg-orange-500/5 transition-all duration-300',
                    inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  )}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-11 h-11 bg-orange-500/15 rounded-xl flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-orange-400" />
                    </div>
                    <div className="text-right">
                      <p className="text-orange-400 font-black text-xl">{item.metric}</p>
                      <p className="text-white/30 text-[10px]">{item.metricLabel}</p>
                    </div>
                  </div>
                  <h3 className="text-white font-bold mb-2">{item.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CALCULADORA ROI ──────────────────────────────────────────── */}
      <section id="calculadora" className="py-24">
        <div className="max-w-4xl mx-auto px-4">
          <Section>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                Calcule quanto dinheiro<br />
                <span className="text-orange-400">você está perdendo agora</span>
              </h2>
              <p className="text-white/50">Arraste os controles e veja o impacto real nos seus números.</p>
            </div>
          </Section>
          <ROICalculator />
        </div>
      </section>

      {/* ── COMO FUNCIONA ────────────────────────────────────────────── */}
      <section id="como-funciona" className="py-24 bg-white/[0.02] border-y border-white/10">
        <div className="max-w-5xl mx-auto px-4">
          <Section>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-1.5 mb-4">
                <ChevronRight className="w-4 h-4 text-orange-400" />
                <span className="text-orange-400 text-sm font-medium">Como funciona</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                5 passos para transformar<br />
                <span className="text-orange-400">sua oficina</span>
              </h2>
            </div>
          </Section>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-orange-500/60 via-orange-500/20 to-transparent hidden md:block" />

            <div className="space-y-10">
              {[
                {
                  step: '01',
                  title: 'Cadastre o veículo',
                  desc: 'Em menos de 2 minutos, cadastre cliente, veículo e dados de manutenção. Nunca mais perda de histórico.',
                  icon: Car,
                },
                {
                  step: '02',
                  title: 'Registre a manutenção',
                  desc: 'Crie a OS, adicione serviços, peças utilizadas e o próximo prazo de revisão — por data ou quilometragem.',
                  icon: FileText,
                },
                {
                  step: '03',
                  title: 'O sistema acompanha automaticamente',
                  desc: 'Motor em Dia monitora os prazos em segundo plano. Quando chega a hora, você recebe o alerta na tela.',
                  icon: Bell,
                },
                {
                  step: '04',
                  title: 'Entre em contato no momento certo',
                  desc: 'Com um clique, envie mensagem personalizada pelo WhatsApp. O cliente recebe o lembrete e já agenda.',
                  icon: MessageSquare,
                },
                {
                  step: '05',
                  title: 'O cliente retorna para sua oficina',
                  desc: 'Resultado: cliente satisfeito, relacionamento fortalecido e faturamento crescendo todo mês.',
                  icon: TrendingUp,
                },
              ].map((item, i) => {
                const { ref, inView } = useInView();
                const isEven = i % 2 === 0;
                return (
                  <div
                    key={i}
                    ref={ref}
                    style={{ transitionDelay: `${i * 100}ms` }}
                    className={cn(
                      'flex flex-col md:flex-row items-start md:items-center gap-6 transition-all duration-500',
                      isEven ? 'md:flex-row' : 'md:flex-row-reverse',
                      inView ? 'opacity-100 translate-x-0' : isEven ? 'opacity-0 -translate-x-6' : 'opacity-0 translate-x-6'
                    )}
                  >
                    <div className={cn('flex-1 bg-white/[0.04] border border-white/10 rounded-2xl p-6 hover:border-orange-500/25 transition-colors', isEven ? 'md:text-right' : 'md:text-left')}>
                      <h3 className="text-white font-bold text-lg mb-2">{item.title}</h3>
                      <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
                    </div>

                    <div className="relative z-10 flex-shrink-0">
                      <div className="w-16 h-16 bg-orange-500 rounded-2xl flex flex-col items-center justify-center shadow-lg shadow-orange-500/30">
                        <span className="text-white/60 text-[9px] font-bold leading-none">{item.step}</span>
                        <item.icon className="w-6 h-6 text-white mt-0.5" />
                      </div>
                    </div>

                    <div className="flex-1 hidden md:block" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── CONFIANÇA ────────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4">
          <Section>
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-black text-white mb-3">
                Seguro, confiável e acessível
              </h2>
              <p className="text-white/50">Projetado para trabalhar enquanto você conserta carros.</p>
            </div>
          </Section>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { icon: Cloud, title: '100% online', desc: 'Acesse de qualquer lugar sem instalar nada.' },
              { icon: Smartphone, title: 'Funciona no celular', desc: 'Computador, tablet ou smartphone. Qualquer tela.' },
              { icon: Shield, title: 'Dados protegidos', desc: 'Criptografia de ponta a ponta e backups diários.' },
              { icon: RotateCcw, title: 'Backup automático', desc: 'Nunca perca nada. Backup em tempo real na nuvem.' },
              { icon: Zap, title: 'Interface simples', desc: 'Fácil de usar sem treinamento. Intuitivo do primeiro dia.' },
              { icon: Users, title: 'Multi-usuário', desc: 'Recepcionista, mecânico e gerente cada um no seu acesso.' },
            ].map((item, i) => {
              const { ref, inView } = useInView();
              return (
                <div
                  key={i}
                  ref={ref}
                  style={{ transitionDelay: `${i * 70}ms` }}
                  className={cn(
                    'bg-white/[0.03] border border-white/10 rounded-2xl p-5 hover:border-orange-500/20 transition-all duration-300',
                    inView ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                  )}
                >
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mb-3">
                    <item.icon className="w-5 h-5 text-orange-400" />
                  </div>
                  <h3 className="text-white font-bold text-sm mb-1">{item.title}</h3>
                  <p className="text-white/40 text-xs leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── PLANOS ──────────────────────────────────────────────────── */}
      <section className="py-20 border-t border-white/10 bg-white/[0.02]">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <Section>
            <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-1.5 mb-6">
              <Star className="w-4 h-4 text-orange-400" />
              <span className="text-orange-400 text-sm font-medium">Preço justo para oficinas</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              Comece grátis.<br />
              <span className="text-orange-400">Pague quando quiser crescer.</span>
            </h2>
            <p className="text-white/50 mb-10">
              14 dias completos sem cartão de crédito. Sem limite de funcionalidades.
            </p>
            <div className="bg-white/[0.04] border border-orange-500/30 rounded-3xl p-8 md:p-10">
              <div className="flex items-end justify-center gap-1 mb-6">
                <span className="text-white/50 text-xl mb-2">R$</span>
                <span className="text-white text-6xl font-black">97</span>
                <span className="text-white/50 mb-2">/mês</span>
              </div>
              <div className="grid md:grid-cols-2 gap-3 mb-8 text-left">
                {[
                  'Clientes e veículos ilimitados',
                  'Ordens de Serviço ilimitadas',
                  'Alertas automáticos de revisão',
                  'Integração WhatsApp',
                  'Controle financeiro completo',
                  'Dashboard e relatórios',
                  'Agenda de atendimentos',
                  'Suporte via WhatsApp',
                ].map(f => (
                  <div key={f} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span className="text-white/70 text-sm">{f}</span>
                  </div>
                ))}
              </div>
              <Link
                href="/cadastro"
                className="flex items-center justify-center gap-2 w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all hover:shadow-lg hover:shadow-orange-500/30 text-lg"
              >
                Começar 14 dias grátis <ArrowRight className="w-5 h-5" />
              </Link>
              <p className="text-white/30 text-xs mt-3">Sem cartão • Cancele quando quiser • Dados protegidos</p>
            </div>
          </Section>
        </div>
      </section>

      {/* ── CTA FINAL ────────────────────────────────────────────────── */}
      <section className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 via-orange-500/10 to-transparent" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 blur-3xl rounded-full" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-400/10 blur-3xl rounded-full" />

        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <Section>
            <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
              <span className="text-orange-300 text-sm font-medium">Última chamada</span>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
              Pare de perder clientes<br />
              <span className="text-orange-400">por falta de acompanhamento.</span>
            </h2>

            <p className="text-white/60 text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
              Comece hoje a transformar <strong className="text-white">manutenção em relacionamento</strong> e{' '}
              <strong className="text-white">relacionamento em faturamento.</strong>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/cadastro"
                className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-10 py-5 rounded-2xl text-lg transition-all hover:shadow-2xl hover:shadow-orange-500/30 hover:-translate-y-1"
              >
                Quero ver funcionando <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-sm text-white/40">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> 14 dias grátis</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Sem cartão de crédito</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Cancele quando quiser</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Suporte em português</span>
            </div>
          </Section>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────── */}
      <footer className="border-t border-white/10 py-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <Wrench className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-bold">Motor em Dia</span>
            </div>
            <p className="text-white/30 text-sm">
              © 2025 Motor em Dia. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-4 text-sm text-white/40">
              <Link href="/login" className="hover:text-white transition-colors">Login</Link>
              <Link href="/cadastro" className="hover:text-white transition-colors">Criar conta</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
