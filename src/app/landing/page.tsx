'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Wrench, Bell, Car, FileText, BarChart3, MessageSquare,
  CheckCircle2, ChevronRight, Shield, Smartphone,
  Cloud, Clock, TrendingUp, DollarSign, Zap,
  ArrowRight, Menu, X, AlertCircle, Calendar, Package,
  RotateCcw, LineChart, Users, Star
} from 'lucide-react';

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}

function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// ── Fade-in wrapper ─────────────────────────────────────────────────────────
function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(
        'transition-all duration-700',
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5',
        className
      )}
    >
      {children}
    </div>
  );
}

// ── ROI Calculator ──────────────────────────────────────────────────────────
function ROICalculator() {
  const [clients, setClients] = useState(15);
  const [ticket, setTicket] = useState(350);
  const monthly = clients * ticket;
  const annual = monthly * 12;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
      <div className="border-b border-white/10 px-6 py-4">
        <p className="text-white/50 text-sm">Calculadora de retorno</p>
        <h3 className="text-white font-bold text-lg mt-0.5">Quanto você está deixando na mesa?</h3>
      </div>
      <div className="p-6 md:p-8 grid md:grid-cols-2 gap-8">
        <div className="space-y-7">
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-white/60 text-sm">Clientes que poderiam retornar / mês</label>
              <span className="text-white font-bold text-sm">{clients}</span>
            </div>
            <input
              type="range" min={5} max={100} step={5} value={clients}
              onChange={e => setClients(Number(e.target.value))}
              className="w-full accent-orange-500 h-1.5 rounded-full"
            />
            <div className="flex justify-between mt-1">
              <span className="text-white/30 text-xs">5</span>
              <span className="text-white/30 text-xs">100</span>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-white/60 text-sm">Ticket médio por serviço</label>
              <span className="text-white font-bold text-sm">R$ {ticket.toLocaleString('pt-BR')}</span>
            </div>
            <input
              type="range" min={100} max={2000} step={50} value={ticket}
              onChange={e => setTicket(Number(e.target.value))}
              className="w-full accent-orange-500 h-1.5 rounded-full"
            />
            <div className="flex justify-between mt-1">
              <span className="text-white/30 text-xs">R$ 100</span>
              <span className="text-white/30 text-xs">R$ 2.000</span>
            </div>
          </div>
          <p className="text-white/40 text-sm leading-relaxed">
            Clientes que já confiam na sua oficina mas estão indo para a concorrência por falta de acompanhamento.
          </p>
        </div>

        <div className="flex flex-col justify-center gap-4">
          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
            <p className="text-white/50 text-sm mb-1">Recuperado por mês</p>
            <p className="text-white text-3xl font-black">
              R$ {monthly.toLocaleString('pt-BR')}
            </p>
          </div>
          <div className="rounded-xl border border-orange-500/30 bg-orange-500/10 p-5">
            <p className="text-orange-300/80 text-sm mb-1">Recuperado por ano</p>
            <p className="text-orange-300 text-4xl font-black">
              R$ {annual.toLocaleString('pt-BR')}
            </p>
            <p className="text-orange-400/60 text-xs mt-1">apenas com lembretes automáticos</p>
          </div>
          <Link
            href="/cadastro"
            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm transition-all"
          >
            Quero recuperar esses clientes <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Dashboard Mockup ────────────────────────────────────────────────────────
function DashboardMockup() {
  return (
    <div className="w-full max-w-[360px] mx-auto">
      <div className="rounded-2xl border border-white/10 bg-[#0d0f18] shadow-2xl overflow-hidden">
        {/* Window bar */}
        <div className="flex items-center gap-1.5 px-3 py-2.5 bg-white/[0.04] border-b border-white/10">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
          <div className="flex-1 mx-3 bg-white/10 rounded px-2 py-0.5 text-[9px] text-white/30">
            app.motoremdia.com.br
          </div>
        </div>

        {/* Content */}
        <div className="flex" style={{ height: '240px' }}>
          {/* Sidebar */}
          <div className="w-10 bg-white/[0.03] border-r border-white/10 flex flex-col items-center py-2.5 gap-2.5 flex-shrink-0">
            <div className="w-6 h-6 bg-orange-500 rounded-lg flex items-center justify-center">
              <Wrench className="w-3 h-3 text-white" />
            </div>
            {[BarChart3, Car, FileText, Calendar].map((Icon, i) => (
              <div key={i} className="w-6 h-6 rounded-md flex items-center justify-center">
                <Icon className="w-3 h-3 text-white/30" />
              </div>
            ))}
          </div>

          {/* Main */}
          <div className="flex-1 p-3 space-y-2 overflow-hidden">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { l: 'OS Abertas', v: '12', c: 'text-orange-400' },
                { l: 'Revisões', v: '8', c: 'text-amber-400' },
                { l: 'Faturamento', v: 'R$14k', c: 'text-emerald-400' },
              ].map(s => (
                <div key={s.l} className="bg-white/[0.04] rounded-lg p-2">
                  <p className="text-white/30 text-[8px] leading-tight">{s.l}</p>
                  <p className={cn('font-bold text-xs mt-0.5', s.c)}>{s.v}</p>
                </div>
              ))}
            </div>

            {/* Alerts */}
            <div>
              <p className="text-white/30 text-[8px] uppercase tracking-wide mb-1.5">Lembretes de hoje</p>
              {[
                { n: 'João Silva', c: 'Civic 2019', s: 'Troca de óleo', t: '3 dias' },
                { n: 'Maria Santos', c: 'Gol 2021', s: 'Revisão 30k km', t: 'hoje' },
                { n: 'Carlos Lima', c: 'Hilux 2020', s: 'Filtros', t: '1 dia' },
              ].map(item => (
                <div key={item.n} className="flex items-center gap-2 bg-white/[0.04] rounded-lg px-2 py-1.5 mb-1">
                  <div className="w-1 h-1 rounded-full bg-orange-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-[8px] font-medium truncate">{item.n} · {item.c}</p>
                    <p className="text-white/30 text-[7px] truncate">{item.s}</p>
                  </div>
                  <span className={cn('text-[8px] font-bold flex-shrink-0', item.t === 'hoje' ? 'text-red-400' : 'text-orange-400')}>{item.t}</span>
                </div>
              ))}
            </div>

            {/* Mini chart */}
            <div className="bg-white/[0.04] rounded-lg p-2">
              <p className="text-white/30 text-[8px] mb-1.5">Faturamento 6 meses</p>
              <div className="flex items-end gap-0.5 h-7">
                {[35, 52, 42, 68, 58, 85].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm bg-gradient-to-t from-orange-600 to-orange-400"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bell notification — below the mockup, not overlapping */}
      <div className="mt-4 mx-auto max-w-[280px] bg-[#0d0f18] border border-orange-500/20 rounded-xl px-4 py-3 flex items-center gap-3">
        <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
          <Bell className="w-4 h-4 text-orange-400" />
        </div>
        <div>
          <p className="text-white text-xs font-semibold">5 clientes para contatar hoje</p>
          <p className="text-white/40 text-[10px]">Clique para ver os lembretes</p>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <div className="bg-[#06080f] text-white min-h-screen overflow-x-hidden" style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>

      {/* ── NAVBAR ──────────────────────────────────────────────────── */}
      <header className={cn(
        'fixed top-0 inset-x-0 z-50 transition-all duration-300',
        scrolled ? 'bg-[#06080f]/90 backdrop-blur-xl border-b border-white/[0.07]' : 'bg-transparent'
      )}>
        <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <Wrench className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-[15px] tracking-tight">Motor em Dia</span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7">
            {[
              { label: 'Problemas', href: '#problema' },
              { label: 'Solução', href: '#solucao' },
              { label: 'Como funciona', href: '#como-funciona' },
              { label: 'Calculadora', href: '#calculadora' },
            ].map(({ label, href }) => (
              <a key={href} href={href} className="text-sm text-white/50 hover:text-white transition-colors">
                {label}
              </a>
            ))}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="text-sm text-white/50 hover:text-white transition-colors px-3 py-2">
              Entrar
            </Link>
            <Link
              href="/cadastro"
              className="text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Começar grátis
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="md:hidden p-2 text-white/60 hover:text-white"
            aria-label="Menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-white/[0.07] bg-[#06080f] px-5 py-4 space-y-1">
            {[
              { label: 'Problemas', href: '#problema' },
              { label: 'Solução', href: '#solucao' },
              { label: 'Como funciona', href: '#como-funciona' },
              { label: 'Calculadora', href: '#calculadora' },
            ].map(({ label, href }) => (
              <a
                key={href} href={href}
                onClick={() => setMenuOpen(false)}
                className="block py-2.5 text-white/60 hover:text-white text-sm"
              >
                {label}
              </a>
            ))}
            <div className="pt-3 flex flex-col gap-2 border-t border-white/[0.07] mt-2">
              <Link href="/login" onClick={() => setMenuOpen(false)} className="py-2.5 text-sm text-white/60 text-center">
                Entrar
              </Link>
              <Link
                href="/cadastro" onClick={() => setMenuOpen(false)}
                className="py-3 text-sm font-semibold bg-orange-500 text-white rounded-xl text-center"
              >
                Começar grátis — 14 dias
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ── HERO — 100vh ─────────────────────────────────────────────── */}
      <section
        className="relative flex flex-col"
        style={{ minHeight: '100vh' }}
      >
        {/* Subtle radial glow */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute left-1/2 -translate-x-1/2 top-0 rounded-full bg-orange-500/8"
            style={{ width: '900px', height: '500px', filter: 'blur(100px)' }}
          />
        </div>

        {/* Grid texture */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
            backgroundSize: '72px 72px',
          }}
        />

        {/* Content — vertically centered */}
        <div className="relative z-10 flex-1 flex flex-col justify-center pt-24 pb-16 px-5">
          <div className="max-w-5xl mx-auto w-full">

            {/* Badge */}
            <div className="flex justify-center mb-8">
              <span className="inline-flex items-center gap-2 rounded-full border border-orange-500/25 bg-orange-500/8 px-4 py-1.5 text-sm text-orange-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                Sistema completo para oficinas mecânicas
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-center font-black text-white leading-[1.08] tracking-tight mb-6"
              style={{ fontSize: 'clamp(2.2rem, 5.5vw, 4.25rem)' }}
            >
              Transforme clientes ocasionais<br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent"> em clientes recorrentes.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-center text-white/55 max-w-2xl mx-auto mb-10 leading-relaxed"
              style={{ fontSize: 'clamp(1rem, 2vw, 1.125rem)' }}
            >
              O Motor em Dia lembra você quando cada cliente precisa voltar para revisão, troca de óleo ou manutenção preventiva — ajudando sua oficina a aumentar o faturamento{' '}
              <span className="text-white/80 font-medium">sem aumentar os custos de aquisição de clientes.</span>
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-14">
              <Link
                href="/cadastro"
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3.5 rounded-xl transition-all hover:shadow-lg hover:shadow-orange-500/20 text-[15px]"
              >
                Testar Gratuitamente
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#como-funciona"
                className="w-full sm:w-auto flex items-center justify-center gap-2 border border-white/15 hover:border-white/30 text-white/70 hover:text-white font-medium px-8 py-3.5 rounded-xl transition-all text-[15px]"
              >
                Ver como funciona
              </a>
            </div>

            {/* Trust line */}
            <p className="text-center text-white/30 text-sm mb-12">
              14 dias grátis · sem cartão de crédito · cancele quando quiser
            </p>

            {/* Mockup — contained, no overflow */}
            <div className="flex justify-center">
              <DashboardMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES PILLS — divider ─────────────────────────────────── */}
      <div className="border-y border-white/[0.07] bg-white/[0.02]">
        <div className="max-w-5xl mx-auto px-5 py-5 flex flex-wrap justify-center gap-x-8 gap-y-3">
          {[
            { icon: Bell, label: 'Lembretes automáticos' },
            { icon: Car, label: 'Histórico de veículos' },
            { icon: FileText, label: 'Ordens de Serviço digitais' },
            { icon: MessageSquare, label: 'Integração WhatsApp' },
            { icon: BarChart3, label: 'Dashboard gerencial' },
            { icon: DollarSign, label: 'Controle financeiro' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-white/40 text-sm">
              <Icon className="w-4 h-4 text-orange-400/70 flex-shrink-0" />
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* ── PROBLEMA ─────────────────────────────────────────────────── */}
      <section
        id="problema"
        className="py-20 md:py-28"
      >
        <div className="max-w-5xl mx-auto px-5">
          <Reveal className="text-center mb-14">
            <span className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/8 px-4 py-1.5 text-sm text-red-400 font-medium mb-5">
              <AlertCircle className="w-3.5 h-3.5" />
              A realidade de muitas oficinas
            </span>
            <h2 className="font-black text-white leading-tight mb-4"
              style={{ fontSize: 'clamp(1.7rem, 3.5vw, 2.5rem)' }}
            >
              Quantos clientes sua oficina<br />
              já perdeu por esquecimento?
            </h2>
            <p className="text-white/45 max-w-xl mx-auto">
              Esses problemas custam dinheiro — e a maioria dos donos de oficina nem percebe.
            </p>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Clock, title: 'Clientes somem após o serviço', desc: 'Fazem a revisão uma vez e nunca mais voltam. Foram para a concorrência.' },
              { icon: RotateCcw, title: 'Trocas de óleo perdidas', desc: 'O cliente não lembra do prazo e você não tem como avisar. Dinheiro deixado na mesa.' },
              { icon: Car, title: 'Sem histórico dos veículos', desc: 'Cada visita começa do zero. Histórico? Só na memória — se tiver.' },
              { icon: MessageSquare, title: 'WhatsApp desorganizado', desc: 'Mensagens misturadas com fornecedores, amigos e clientes. Caos total.' },
              { icon: FileText, title: 'Histórico que some', desc: 'O histórico do cliente está em papel, caderno ou na memória do mecânico.' },
              { icon: BarChart3, title: 'Sem visão do faturamento', desc: 'Não sabe ao certo quanto entrou, quanto saiu e qual serviço mais rende.' },
            ].map((item, i) => (
              <Reveal key={i} delay={i * 60}>
                <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.04] hover:border-red-500/20 p-5 transition-all duration-300 h-full">
                  <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center mb-4">
                    <item.icon className="w-4 h-4 text-red-400" />
                  </div>
                  <h3 className="text-white font-semibold text-sm mb-2">{item.title}</h3>
                  <p className="text-white/45 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOLUÇÃO ──────────────────────────────────────────────────── */}
      <section
        id="solucao"
        className="py-20 md:py-28 border-t border-white/[0.07]"
      >
        <div className="max-w-5xl mx-auto px-5">
          <Reveal className="text-center mb-14">
            <span className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/8 px-4 py-1.5 text-sm text-orange-400 font-medium mb-5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              A solução completa
            </span>
            <h2 className="font-black text-white leading-tight mb-4"
              style={{ fontSize: 'clamp(1.7rem, 3.5vw, 2.5rem)' }}
            >
              Tudo que sua oficina precisa<br />
              em um único lugar
            </h2>
            <p className="text-white/45 max-w-xl mx-auto">
              Desenvolvido especificamente para oficinas mecânicas, com as funcionalidades que realmente importam para o dia a dia.
            </p>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Car, title: 'Cadastro de veículos', desc: 'Marca, modelo, placa, quilometragem. Histórico completo de cada carro atendido.', highlight: false },
              { icon: Bell, title: 'Alertas automáticos de revisão', desc: 'O sistema avisa quando é hora de contactar o cliente — por data ou quilometragem.', highlight: true },
              { icon: FileText, title: 'Ordens de Serviço digitais', desc: 'Crie e envie OS pelo celular ou computador. PDF profissional com um clique.', highlight: false },
              { icon: MessageSquare, title: 'Integração com WhatsApp', desc: 'Mensagem personalizada com um clique. Sem copiar e colar, sem esquecer nenhum cliente.', highlight: true },
              { icon: DollarSign, title: 'Financeiro integrado', desc: 'Controle de entradas, saídas e lucratividade por serviço. Visão real do dinheiro.', highlight: false },
              { icon: BarChart3, title: 'Dashboard gerencial', desc: 'OS abertas, revisões próximas e faturamento do mês em uma tela só.', highlight: true },
              { icon: Calendar, title: 'Agenda de serviços', desc: 'Organize os atendimentos da semana. Evite conflitos e atrasos.', highlight: false },
              { icon: Package, title: 'Controle de estoque', desc: 'Gerencie peças e insumos. Saiba o que está acabando antes de precisar.', highlight: false },
              { icon: LineChart, title: 'Relatórios detalhados', desc: 'Serviços mais rentáveis, clientes frequentes e performance por período.', highlight: false },
            ].map((item, i) => (
              <Reveal key={i} delay={i * 55}>
                <div className={cn(
                  'rounded-xl border p-5 transition-all duration-300 h-full',
                  item.highlight
                    ? 'border-orange-500/25 bg-orange-500/6 hover:border-orange-500/40'
                    : 'border-white/[0.07] bg-white/[0.02] hover:border-white/[0.14] hover:bg-white/[0.04]'
                )}>
                  <div className={cn(
                    'w-9 h-9 rounded-lg flex items-center justify-center mb-4',
                    item.highlight ? 'bg-orange-500/15' : 'bg-white/8'
                  )}>
                    <item.icon className={cn('w-4 h-4', item.highlight ? 'text-orange-400' : 'text-white/50')} />
                  </div>
                  <h3 className="text-white font-semibold text-sm mb-2">{item.title}</h3>
                  <p className="text-white/45 text-sm leading-relaxed">{item.desc}</p>
                  {item.highlight && (
                    <p className="mt-3 text-orange-400/70 text-xs font-medium flex items-center gap-1">
                      <Zap className="w-3 h-3" /> Funcionalidade chave
                    </p>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── BENEFÍCIOS ───────────────────────────────────────────────── */}
      <section className="py-20 md:py-28 border-t border-white/[0.07] bg-white/[0.015]">
        <div className="max-w-5xl mx-auto px-5">
          <Reveal className="text-center mb-14">
            <h2 className="font-black text-white leading-tight mb-4"
              style={{ fontSize: 'clamp(1.7rem, 3.5vw, 2.5rem)' }}
            >
              O que muda na sua oficina<br />
              a partir do primeiro mês
            </h2>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: TrendingUp, title: 'Mais clientes retornando', desc: 'Clientes avisados no momento certo voltam mais. Simples assim.' },
              { icon: DollarSign, title: 'Faturamento recorrente', desc: 'Cada cliente fidelizado gera renda previsível e constante para sua oficina.' },
              { icon: Bell, title: 'Zero esquecimentos', desc: 'Alertas automáticos. Nenhum cliente cai no esquecimento.' },
              { icon: FileText, title: 'Mais organização', desc: 'Tudo em um lugar: histórico, OS, peças, finanças. Equipe mais produtiva.' },
              { icon: Star, title: 'Atendimento profissional', desc: 'Impressione clientes com OS digital, histórico completo e respostas rápidas.' },
              { icon: Users, title: 'Relacionamento contínuo', desc: 'Mantenha contato de forma inteligente mesmo entre as visitas.' },
            ].map((item, i) => (
              <Reveal key={i} delay={i * 60}>
                <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] hover:border-orange-500/20 hover:bg-orange-500/4 p-5 transition-all duration-300 h-full">
                  <div className="w-9 h-9 rounded-lg bg-orange-500/10 flex items-center justify-center mb-4">
                    <item.icon className="w-4 h-4 text-orange-400" />
                  </div>
                  <h3 className="text-white font-semibold text-sm mb-2">{item.title}</h3>
                  <p className="text-white/45 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CALCULADORA ──────────────────────────────────────────────── */}
      <section id="calculadora" className="py-20 md:py-28 border-t border-white/[0.07]">
        <div className="max-w-3xl mx-auto px-5">
          <Reveal className="text-center mb-12">
            <h2 className="font-black text-white leading-tight mb-4"
              style={{ fontSize: 'clamp(1.7rem, 3.5vw, 2.5rem)' }}
            >
              Calcule quanto dinheiro<br />
              você está perdendo agora
            </h2>
            <p className="text-white/45">Ajuste os controles e veja o impacto real nos seus números.</p>
          </Reveal>
          <Reveal delay={100}>
            <ROICalculator />
          </Reveal>
        </div>
      </section>

      {/* ── COMO FUNCIONA ────────────────────────────────────────────── */}
      <section id="como-funciona" className="py-20 md:py-28 border-t border-white/[0.07] bg-white/[0.015]">
        <div className="max-w-3xl mx-auto px-5">
          <Reveal className="text-center mb-14">
            <span className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/8 px-4 py-1.5 text-sm text-orange-400 font-medium mb-5">
              <ChevronRight className="w-3.5 h-3.5" />
              Como funciona
            </span>
            <h2 className="font-black text-white leading-tight mb-4"
              style={{ fontSize: 'clamp(1.7rem, 3.5vw, 2.5rem)' }}
            >
              5 passos para transformar<br />
              sua oficina
            </h2>
          </Reveal>

          <div className="space-y-4">
            {[
              { step: '01', icon: Car, title: 'Cadastre o veículo', desc: 'Em menos de 2 minutos, cadastre cliente, veículo e dados de manutenção. Histórico centralizado para sempre.' },
              { step: '02', icon: FileText, title: 'Registre a manutenção', desc: 'Crie a OS, adicione serviços, peças utilizadas e o próximo prazo de revisão — por data ou quilometragem.' },
              { step: '03', icon: Bell, title: 'O sistema acompanha automaticamente', desc: 'Motor em Dia monitora os prazos em segundo plano. Quando chega a hora, você recebe o alerta.' },
              { step: '04', icon: MessageSquare, title: 'Entre em contato no momento certo', desc: 'Com um clique, envie mensagem personalizada pelo WhatsApp. O cliente recebe o lembrete e já agenda.' },
              { step: '05', icon: TrendingUp, title: 'O cliente retorna para sua oficina', desc: 'Resultado: cliente satisfeito, relacionamento fortalecido e faturamento crescendo todo mês.' },
            ].map((item, i) => (
              <Reveal key={i} delay={i * 80}>
                <div className="flex gap-5 rounded-xl border border-white/[0.07] bg-white/[0.02] hover:border-orange-500/20 p-5 transition-all duration-300">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-orange-500 flex flex-col items-center justify-center shadow-lg shadow-orange-500/20">
                    <span className="text-white/60 text-[8px] font-bold leading-none">{item.step}</span>
                    <item.icon className="w-5 h-5 text-white mt-0.5" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm mb-1.5">{item.title}</h3>
                    <p className="text-white/45 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONFIANÇA ────────────────────────────────────────────────── */}
      <section className="py-20 md:py-28 border-t border-white/[0.07]">
        <div className="max-w-5xl mx-auto px-5">
          <Reveal className="text-center mb-12">
            <h2 className="font-black text-white leading-tight mb-3"
              style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}
            >
              Seguro, confiável e acessível
            </h2>
            <p className="text-white/45">Projetado para trabalhar enquanto você conserta carros.</p>
          </Reveal>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { icon: Cloud, title: '100% online', desc: 'Acesse de qualquer lugar sem instalar nada.' },
              { icon: Smartphone, title: 'Funciona no celular', desc: 'Computador, tablet ou smartphone.' },
              { icon: Shield, title: 'Dados protegidos', desc: 'Criptografia e backups automáticos diários.' },
              { icon: RotateCcw, title: 'Backup automático', desc: 'Nunca perca nada. Dados na nuvem em tempo real.' },
              { icon: Zap, title: 'Interface simples', desc: 'Intuitivo desde o primeiro dia. Sem treinamento.' },
              { icon: Users, title: 'Suporte em português', desc: 'Atendimento via WhatsApp em horário comercial.' },
            ].map((item, i) => (
              <Reveal key={i} delay={i * 60}>
                <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] hover:border-white/[0.14] p-5 transition-all duration-300 h-full">
                  <div className="w-9 h-9 rounded-lg bg-white/8 flex items-center justify-center mb-3">
                    <item.icon className="w-4 h-4 text-orange-400" />
                  </div>
                  <h3 className="text-white font-semibold text-sm mb-1">{item.title}</h3>
                  <p className="text-white/40 text-xs leading-relaxed">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLANO ────────────────────────────────────────────────────── */}
      <section className="py-20 md:py-28 border-t border-white/[0.07] bg-white/[0.015]">
        <div className="max-w-md mx-auto px-5 text-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/8 px-4 py-1.5 text-sm text-orange-400 font-medium mb-6">
              Preço justo para oficinas
            </span>
            <h2 className="font-black text-white leading-tight mb-3"
              style={{ fontSize: 'clamp(1.7rem, 3.5vw, 2.25rem)' }}
            >
              Comece grátis.<br />
              <span className="text-orange-400">Pague quando crescer.</span>
            </h2>
            <p className="text-white/45 mb-8">14 dias completos sem cartão de crédito.</p>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-7 text-left">
              <div className="flex items-end gap-1 mb-6">
                <span className="text-white/40 text-lg mb-0.5">R$</span>
                <span className="text-white text-5xl font-black leading-none">97</span>
                <span className="text-white/40 mb-1">/mês</span>
              </div>

              <div className="space-y-2.5 mb-7">
                {[
                  'Clientes e veículos ilimitados',
                  'Ordens de Serviço ilimitadas',
                  'Alertas automáticos de revisão',
                  'Integração com WhatsApp',
                  'Controle financeiro completo',
                  'Dashboard e relatórios',
                  'Agenda de atendimentos',
                  'Suporte via WhatsApp',
                ].map(f => (
                  <div key={f} className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span className="text-white/65 text-sm">{f}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/cadastro"
                className="flex items-center justify-center gap-2 w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-all text-sm"
              >
                Começar 14 dias grátis <ArrowRight className="w-4 h-4" />
              </Link>
              <p className="text-white/25 text-xs text-center mt-3">Sem cartão · Cancele quando quiser</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── CTA FINAL ────────────────────────────────────────────────── */}
      <section className="py-24 md:py-36 border-t border-white/[0.07] relative overflow-hidden">
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500/8"
          style={{ width: '700px', height: '400px', filter: 'blur(90px)' }}
        />
        <div className="relative max-w-2xl mx-auto px-5 text-center">
          <Reveal>
            <h2 className="font-black text-white leading-[1.1] mb-5"
              style={{ fontSize: 'clamp(2rem, 4.5vw, 3.25rem)' }}
            >
              Pare de perder clientes<br />
              por falta de acompanhamento.
            </h2>
            <p className="text-white/50 text-lg mb-10 leading-relaxed">
              Comece hoje a transformar{' '}
              <span className="text-white/80">manutenção em relacionamento</span>{' '}
              e relacionamento em{' '}
              <span className="text-white/80">faturamento.</span>
            </p>
            <Link
              href="/cadastro"
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-10 py-4 rounded-xl transition-all hover:shadow-xl hover:shadow-orange-500/20 text-base"
            >
              Quero ver funcionando <ArrowRight className="w-5 h-5" />
            </Link>
            <div className="flex flex-wrap items-center justify-center gap-5 mt-8 text-sm text-white/30">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500/70" /> 14 dias grátis</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500/70" /> Sem cartão</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500/70" /> Cancele quando quiser</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500/70" /> Suporte em português</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.07] py-8">
        <div className="max-w-5xl mx-auto px-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center">
              <Wrench className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-white font-semibold text-sm">Motor em Dia</span>
          </div>
          <p className="text-white/25 text-xs">© 2025 Motor em Dia. Todos os direitos reservados.</p>
          <div className="flex items-center gap-5 text-xs text-white/30">
            <Link href="/login" className="hover:text-white/60 transition-colors">Login</Link>
            <Link href="/cadastro" className="hover:text-white/60 transition-colors">Criar conta</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
