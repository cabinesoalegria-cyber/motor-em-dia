'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Wrench, Bell, Car, FileText, BarChart3, MessageSquare,
  CheckCircle2, Shield, Smartphone, Cloud, TrendingUp,
  DollarSign, Zap, ArrowRight, Menu, X, Users, Star,
  Clock, RotateCcw,
} from 'lucide-react';
import { trackEvent } from '@/components/analytics';

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
function cn(...cls: (string | boolean | undefined)[]) {
  return cls.filter(Boolean).join(' ');
}

function useInView(threshold = 0.06) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function Fade({
  children, delay = 0, direction = 'up', className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'left' | 'right' | 'none';
  className?: string;
}) {
  const { ref, visible } = useInView();
  const from = { up: 'translate-y-5', left: '-translate-x-5', right: 'translate-x-5', none: '' };
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(
        'transition-all duration-700 ease-out',
        visible ? 'opacity-100 translate-x-0 translate-y-0' : `opacity-0 ${from[direction]}`,
        className,
      )}
    >
      {children}
    </div>
  );
}

/* ─── Constante de container ─────────────────────────────────────────────── */
// max-w-6xl = 1152px — mais estreito que 7xl, dá margens maiores em telas largas
// px-4 mobile (16px), sm:px-6 (24px), lg:px-8 (32px)
const W = 'mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8';

/* ─── CTALink ────────────────────────────────────────────────────────────── */
function CTALink({
  href, label, primary = true, className = '', source = '',
}: {
  href: string; label: string; primary?: boolean; className?: string; source?: string;
}) {
  return (
    <Link
      href={href}
      onClick={() => trackEvent('cta_click', { button_label: label, source })}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200',
        primary
          ? 'bg-orange-500 text-white shadow-sm shadow-orange-200 hover:bg-orange-600 hover:shadow-md hover:shadow-orange-200 hover:-translate-y-px'
          : 'border-2 border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50',
        className,
      )}
    >
      {label}
      {primary && <ArrowRight className="w-4 h-4 flex-shrink-0" />}
    </Link>
  );
}

/* ─── SectionHeader ──────────────────────────────────────────────────────── */
function SectionHeader({
  label, title, subtitle, align = 'center',
}: {
  label: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
}) {
  const base = align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-2xl';
  return (
    <Fade className={cn(base, 'mb-12 md:mb-16')}>
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-orange-600">
        {label}
      </p>
      <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-5 text-base leading-7 text-slate-600 md:text-lg md:leading-8">
          {subtitle}
        </p>
      )}
    </Fade>
  );
}

/* ─── Calculator ─────────────────────────────────────────────────────────── */
function Calculator() {
  const [vehicles, setVehicles] = useState(40);
  const [ticket, setTicket] = useState(350);
  const [interacted, setInteracted] = useState(false);
  const rate = 0.3;
  const recovered = Math.round(vehicles * rate);
  const monthly = recovered * ticket;
  const annual = monthly * 12;

  function change(field: 'v' | 't', val: number) {
    if (field === 'v') setVehicles(val); else setTicket(val);
    if (!interacted) { setInteracted(true); trackEvent('calculator_use', { vehicles, ticket }); }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-6 py-6 md:px-8 md:py-7">
        <p className="mb-1 text-xs font-bold uppercase tracking-widest text-orange-600">
          Calculadora de impacto
        </p>
        <h3 className="text-xl font-black text-slate-900 md:text-2xl">
          Quanto faturamento está escapando?
        </h3>
      </div>

      <div className="grid gap-8 p-6 md:grid-cols-2 md:gap-12 md:p-10">
        {/* Sliders */}
        <div className="space-y-8">
          {/* Veículos */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-700">
                Veículos atendidos / mês
              </label>
              <span className="min-w-[48px] rounded-lg border border-orange-100 bg-orange-50 px-3 py-1 text-center text-lg font-black text-slate-900">
                {vehicles}
              </span>
            </div>
            <input
              type="range" min={10} max={200} step={5} value={vehicles}
              onChange={e => change('v', Number(e.target.value))}
              className="w-full accent-orange-500"
            />
            <div className="mt-2 flex justify-between text-xs font-medium text-slate-400">
              <span>10</span><span>200</span>
            </div>
          </div>

          {/* Ticket */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-700">
                Ticket médio por serviço
              </label>
              <span className="rounded-lg border border-orange-100 bg-orange-50 px-3 py-1 text-lg font-black text-slate-900">
                R${ticket.toLocaleString('pt-BR')}
              </span>
            </div>
            <input
              type="range" min={150} max={2000} step={50} value={ticket}
              onChange={e => change('t', Number(e.target.value))}
              className="w-full accent-orange-500"
            />
            <div className="mt-2 flex justify-between text-xs font-medium text-slate-400">
              <span>R$ 150</span><span>R$ 2.000</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm leading-relaxed text-slate-500">
              Estimativa conservadora:{' '}
              <span className="font-semibold text-slate-800">{recovered} clientes</span>{' '}
              ({Math.round(rate * 100)}% dos atendidos) poderiam retornar todo mês com lembretes automáticos.
            </p>
          </div>
        </div>

        {/* Results */}
        <div className="flex flex-col justify-center gap-5">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
            <p className="mb-2 text-sm text-slate-500">Faturamento recuperado / mês</p>
            <p className="text-4xl font-black text-slate-900">
              R$ {monthly.toLocaleString('pt-BR')}
            </p>
          </div>
          <div className="rounded-xl border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 p-6">
            <p className="mb-2 text-sm font-medium text-orange-700">Faturamento recuperado / ano</p>
            <p className="text-5xl font-black text-orange-600">
              R$ {annual.toLocaleString('pt-BR')}
            </p>
            <p className="mt-2 text-xs text-orange-500/70">apenas com lembretes automáticos</p>
          </div>
          <CTALink
            href="/cadastro"
            label="Quero recuperar esses clientes"
            source="calculator"
            className="w-full py-4 px-6"
          />
        </div>
      </div>
    </div>
  );
}

/* ─── HeroMockup ─────────────────────────────────────────────────────────── */
function HeroMockup() {
  return (
    <div className="relative w-full max-w-[400px]" style={{ perspective: '1100px' }}>
      <div className="absolute inset-x-8 -bottom-4 h-16 rounded-full bg-orange-300/25 blur-2xl" />
      <div
        className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        style={{ transform: 'rotateY(-5deg) rotateX(2deg)' }}
      >
        {/* Window chrome */}
        <div className="flex items-center gap-1.5 border-b border-slate-200 bg-slate-50 px-4 py-3">
          <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
          <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
          <div className="mx-3 flex-1 rounded bg-slate-200 px-2 py-0.5 text-center text-[9px] text-slate-400">
            app.motoremdia.com.br
          </div>
        </div>

        <div className="p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-slate-400">Bom dia, Carlos 👋</p>
              <p className="text-sm font-bold text-slate-900">Resumo de hoje</p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500">
              <Wrench className="h-4 w-4 text-white" />
            </div>
          </div>

          <div className="mb-5 grid grid-cols-3 gap-2">
            {[
              { l: 'OS Abertas', v: '7', bg: 'bg-orange-50', t: 'text-orange-600' },
              { l: 'Revisões', v: '4', bg: 'bg-amber-50', t: 'text-amber-600' },
              { l: 'Mês', v: 'R$12k', bg: 'bg-emerald-50', t: 'text-emerald-600' },
            ].map(s => (
              <div key={s.l} className={cn('rounded-xl p-3', s.bg)}>
                <p className="text-[9px] text-slate-400">{s.l}</p>
                <p className={cn('mt-0.5 text-sm font-black', s.t)}>{s.v}</p>
              </div>
            ))}
          </div>

          <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Lembretes do dia
          </p>
          {[
            { name: 'João Silva', car: 'Civic 2019', svc: 'Troca de óleo', urgent: true },
            { name: 'Ana Lima', car: 'Gol 2021', svc: 'Revisão 30.000 km', urgent: false },
            { name: 'Pedro Costa', car: 'Hilux 2020', svc: 'Filtro de ar', urgent: false },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 border-b border-slate-100 py-2.5 last:border-0">
              <div className={cn('h-2 w-2 flex-shrink-0 rounded-full', item.urgent ? 'bg-red-500' : 'bg-orange-400')} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[10px] font-semibold text-slate-800">{item.name} · {item.car}</p>
                <p className="truncate text-[9px] text-slate-400">{item.svc}</p>
              </div>
              <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-green-50">
                <MessageSquare className="h-3 w-3 text-green-600" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating badge */}
      <div
        className="absolute -right-3 top-14 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-lg"
        style={{ transform: 'rotateY(-3deg)' }}
      >
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-100">
            <Bell className="h-3.5 w-3.5 text-orange-500" />
          </div>
          <div>
            <p className="text-[11px] font-bold leading-none text-slate-900">4 alertas</p>
            <p className="mt-0.5 text-[9px] text-slate-400">para hoje</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main ───────────────────────────────────────────────────────────────── */
export default function LandingPageContent({ source = 'landing' }: { source?: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showCTA, setShowCTA] = useState(false);

  useEffect(() => {
    const fn = () => {
      setScrolled(window.scrollY > 20);
      setShowCTA(window.scrollY > 600);
    };
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const navLinks = [
    ['Problema', '#problema'],
    ['Solução', '#solucao'],
    ['Como funciona', '#como-funciona'],
    ['Calculadora', '#calculadora'],
  ];

  return (
    <main
      className="w-full overflow-x-hidden bg-white text-slate-950"
      style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}
    >

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <header className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled
          ? 'border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-xl'
          : 'bg-white/80 backdrop-blur-sm',
      )}>
        <div className={cn(W, 'flex h-16 items-center justify-between')}>
          <Link href="/landing" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 shadow-sm">
              <Wrench className="h-4 w-4 text-white" />
            </div>
            <span className="text-[15px] font-bold tracking-tight text-slate-900">Motor em Dia</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map(([label, href]) => (
              <a key={href} href={href}
                className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-900">
                {label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/login"
              className="px-3 py-2 text-sm font-medium text-slate-500 hover:text-slate-900">
              Entrar
            </Link>
            <CTALink
              href="/cadastro"
              label="Teste grátis por 14 dias"
              source={`${source}_nav`}
              className="px-5 py-2.5 text-sm"
            />
          </div>

          <button
            onClick={() => setMenuOpen(v => !v)}
            className="p-2 text-slate-500 md:hidden"
            aria-label="Menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-slate-200 bg-white shadow-lg md:hidden">
            <div className={cn(W, 'py-4')}>
              {navLinks.map(([label, href]) => (
                <a key={href} href={href}
                  onClick={() => setMenuOpen(false)}
                  className="block border-b border-slate-100 py-3 text-sm font-medium text-slate-700 last:border-0">
                  {label}
                </a>
              ))}
              <div className="mt-4 space-y-3">
                <Link href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="block py-3 text-center text-sm font-medium text-slate-500">
                  Entrar
                </Link>
                <CTALink
                  href="/cadastro"
                  label="Teste grátis por 14 dias"
                  source={`${source}_mobile_menu`}
                  className="w-full px-6 py-3.5"
                />
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ── HERO ───────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white pt-24 pb-16 md:pt-28 md:pb-20 lg:pt-32 lg:pb-24">
        {/* Warm glow */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[65vh] opacity-50"
          style={{ background: 'radial-gradient(ellipse 70% 60% at 50% -5%, #ffedd5, transparent)' }}
        />

        <div className={cn(W, 'relative z-10')}>
          <div className="grid items-center gap-12 lg:grid-cols-2 xl:gap-24">

            {/* Copy */}
            <div className="max-w-xl">
              <Fade>
                <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-orange-500" />
                  <span className="text-sm font-semibold text-orange-700">
                    Sistema para oficinas mecânicas
                  </span>
                </div>
              </Fade>

              <Fade delay={70}>
                <h1
                  className="mb-6 font-black tracking-tight leading-[1.07] text-slate-900"
                  style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.75rem)' }}
                >
                  Nunca mais perca<br />
                  uma revisão por<br />
                  <span className="text-orange-500">esquecimento.</span>
                </h1>
              </Fade>

              <Fade delay={130}>
                <p className="mb-5 text-lg font-semibold leading-relaxed text-slate-700">
                  Transforme clientes ocasionais em clientes recorrentes com lembretes automáticos de manutenção.
                </p>
              </Fade>

              <Fade delay={170}>
                <p className="mb-10 text-base leading-relaxed text-slate-500">
                  O Motor em Dia avisa quando cada cliente precisa retornar para revisão, troca de óleo ou
                  manutenção preventiva — ajudando sua oficina a aumentar o faturamento{' '}
                  <span className="font-medium text-slate-700">sem gastar mais com anúncios.</span>
                </p>
              </Fade>

              <Fade delay={210}>
                <div className="mb-10 flex flex-col gap-3 sm:flex-row">
                  <CTALink
                    href="/cadastro"
                    label="Quero ver funcionando"
                    source={`${source}_hero_primary`}
                    className="px-7 py-4 text-[15px]"
                  />
                  <CTALink
                    href="/cadastro"
                    label="Teste grátis por 14 dias"
                    primary={false}
                    source={`${source}_hero_secondary`}
                    className="px-7 py-4 text-[15px]"
                  />
                </div>
              </Fade>

              <Fade delay={250}>
                <div className="flex flex-wrap gap-x-6 gap-y-2">
                  {['14 dias grátis', 'Sem cartão de crédito', 'Cancelamento a qualquer momento'].map(t => (
                    <span key={t} className="flex items-center gap-1.5 text-sm font-medium text-slate-500">
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-500" />
                      {t}
                    </span>
                  ))}
                </div>
              </Fade>
            </div>

            {/* Mockup */}
            <Fade delay={100} direction="left" className="hidden lg:flex justify-end">
              <HeroMockup />
            </Fade>
          </div>
        </div>
      </section>

      {/* ── FEATURE STRIP ──────────────────────────────────────────────── */}
      <section className="border-y border-slate-200 bg-white py-5 md:py-6">
        <div className={W}>
          <div className="grid grid-cols-2 gap-4 text-sm text-slate-600 md:grid-cols-3 lg:grid-cols-6">
            {[
              { icon: Bell, label: 'Lembretes automáticos' },
              { icon: Car, label: 'Histórico de veículos' },
              { icon: FileText, label: 'OS digitais' },
              { icon: MessageSquare, label: 'WhatsApp integrado' },
              { icon: BarChart3, label: 'Dashboard gerencial' },
              { icon: DollarSign, label: 'Controle financeiro' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 font-medium">
                <Icon className="h-4 w-4 flex-shrink-0 text-orange-500" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── O PROBLEMA ─────────────────────────────────────────────────── */}
      <section id="problema" className="bg-slate-50 py-20 md:py-24 lg:py-28">
        <div className={W}>
          <SectionHeader
            label="O problema"
            title="Quantos clientes sua oficina já perdeu por esquecimento?"
            subtitle="Esses problemas custam dinheiro — e a maioria dos donos de oficina não percebe porque a perda é silenciosa."
          />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 md:gap-8">
            {[
              { icon: Clock, title: 'Revisões esquecidas', desc: 'O cliente promete "passar semana que vem" e nunca mais volta. Sem um lembrete, ele simplesmente esquece.' },
              { icon: RotateCcw, title: 'Trocas de óleo perdidas', desc: 'A troca de óleo é o serviço mais recorrente. Cada troca esquecida é dinheiro direto na mesa do concorrente.' },
              { icon: Car, title: 'Falta de acompanhamento', desc: 'Sem acompanhar o histórico do veículo, sua oficina perde oportunidades de oferecer serviços preventivos no momento certo.' },
              { icon: Users, title: 'Clientes que nunca retornam', desc: 'Conquistar um novo cliente custa de 5 a 7 vezes mais do que manter um. Você está perdendo dinheiro na retenção.' },
              { icon: FileText, title: 'Histórico desorganizado', desc: 'Informações em papel, caderno ou memória do mecânico. Quando alguém sai, o histórico vai junto.' },
              { icon: MessageSquare, title: 'WhatsApp virou bagunça', desc: 'Clientes, fornecedores, família — tudo misturado. Impossível acompanhar quem precisa de atenção hoje.' },
            ].map((item, i) => (
              <Fade key={i} delay={i * 55}>
                <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-orange-200 hover:shadow-md">
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-red-100 bg-red-50">
                    <item.icon className="h-5 w-5 text-red-500" />
                  </div>
                  <h3 className="mb-2 text-base font-bold text-slate-900">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-500">{item.desc}</p>
                </div>
              </Fade>
            ))}
          </div>
        </div>
      </section>

      {/* ── A SOLUÇÃO ──────────────────────────────────────────────────── */}
      <section id="solucao" className="bg-white py-20 md:py-24 lg:py-28">
        <div className={W}>
          <SectionHeader
            label="A solução"
            title="Seu sistema de acompanhamento automático"
            subtitle="Um fluxo simples que transforma cada serviço realizado em uma oportunidade de retorno garantido."
            align="center"
          />

          <div className="mx-auto max-w-lg space-y-0">
            {[
              { icon: Car, title: 'Cadastro do veículo', desc: 'Cliente, carro e quilometragem registrados em 2 minutos. Histórico centralizado para sempre.' },
              { icon: FileText, title: 'Registro da manutenção', desc: 'OS criada, serviços e próximo prazo de retorno definidos com precisão.' },
              { icon: Zap, title: 'Monitoramento automático', desc: 'O sistema acompanha todos os prazos em segundo plano, sem que você precise fazer nada.' },
              { icon: Bell, title: 'Alerta de retorno', desc: 'Você recebe o aviso e envia mensagem pelo WhatsApp com um clique.' },
              { icon: TrendingUp, title: 'Cliente volta para sua oficina', desc: 'Relacionamento fortalecido. Faturamento crescendo todo mês.' },
            ].map((step, i) => (
              <Fade key={i} delay={i * 80}>
                <div className="flex items-stretch gap-5 md:gap-6">
                  <div className="flex w-12 flex-shrink-0 flex-col items-center">
                    <div className={cn(
                      'flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl',
                      i === 4
                        ? 'bg-orange-500 shadow-md shadow-orange-200'
                        : 'border-2 border-orange-200 bg-white',
                    )}>
                      <step.icon className={cn('h-5 w-5', i === 4 ? 'text-white' : 'text-orange-500')} />
                    </div>
                    {i < 4 && (
                      <div
                        className="my-1 w-px flex-1 bg-gradient-to-b from-orange-200 to-orange-50"
                        style={{ minHeight: '48px' }}
                      />
                    )}
                  </div>
                  <div className="flex-1 pb-10 pt-2 last:pb-0">
                    <h3 className="mb-2 text-base font-bold text-slate-900">{step.title}</h3>
                    <p className="text-sm leading-relaxed text-slate-500">{step.desc}</p>
                  </div>
                </div>
              </Fade>
            ))}
          </div>

          <Fade className="mt-12 flex justify-center md:mt-16">
            <CTALink
              href="/cadastro"
              label="Quero ver isso funcionando"
              source={`${source}_solucao_cta`}
              className="px-8 py-4 text-[15px]"
            />
          </Fade>
        </div>
      </section>

      {/* ── BENEFÍCIOS ─────────────────────────────────────────────────── */}
      <section id="beneficios" className="bg-slate-50 py-20 md:py-24 lg:py-28">
        <div className={W}>
          <SectionHeader
            label="Benefícios"
            title="O que muda na sua oficina a partir do primeiro mês"
          />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 md:gap-8">
            {[
              { icon: TrendingUp, title: 'Mais clientes retornando', desc: 'Clientes avisados no momento certo voltam mais. Não tem segredo: comunicação = fidelização.' },
              { icon: DollarSign, title: 'Faturamento recorrente', desc: 'Cada cliente fidelizado gera receita previsível todo mês, sem depender de novos anúncios.' },
              { icon: Bell, title: 'Menos esquecimentos', desc: 'O sistema lembra por você. Nenhum cliente cai no esquecimento por falta de atenção.' },
              { icon: Star, title: 'Atendimento profissional', desc: 'Histórico completo, OS digital e comunicação organizada. Seu cliente percebe a diferença.' },
              { icon: FileText, title: 'Histórico organizado', desc: 'Cada carro, cada serviço, cada troca — na nuvem, acessível de qualquer lugar, para sempre.' },
              { icon: BarChart3, title: 'Gestão mais eficiente', desc: 'Dashboard completo: OS abertas, revisões próximas e faturamento do mês em uma tela só.' },
            ].map((item, i) => (
              <Fade key={i} delay={i * 55}>
                <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-orange-200 hover:shadow-md">
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-orange-100 bg-orange-50">
                    <item.icon className="h-5 w-5 text-orange-500" />
                  </div>
                  <h3 className="mb-2 text-base font-bold text-slate-900">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-500">{item.desc}</p>
                </div>
              </Fade>
            ))}
          </div>
        </div>
      </section>

      {/* ── CALCULADORA ────────────────────────────────────────────────── */}
      <section id="calculadora" className="bg-white py-20 md:py-24 lg:py-28">
        <div className={W}>
          <SectionHeader
            label="Calculadora"
            title="Calcule quanto faturamento você está perdendo agora"
            subtitle="Ajuste os valores e veja a projeção de faturamento que pode ser recuperado com lembretes automáticos."
            align="center"
          />
          <div className="mx-auto max-w-4xl">
            <Fade delay={100}>
              <Calculator />
            </Fade>
          </div>
        </div>
      </section>

      {/* ── O SISTEMA ──────────────────────────────────────────────────── */}
      <section id="como-funciona" className="bg-slate-50 py-20 md:py-24 lg:py-28">
        <div className={W}>
          <SectionHeader
            label="O sistema"
            title="Tudo que sua oficina precisa, em uma tela só"
            subtitle="Interface projetada para oficinas mecânicas. Simples, rápida e completa."
            align="center"
          />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 md:gap-8">
            {[
              { icon: BarChart3, label: 'Dashboard', desc: 'Visão completa do negócio: OS abertas, faturamento e alertas em tempo real.' },
              { icon: Car, label: 'Veículos', desc: 'Histórico completo de cada carro atendido. Marca, modelo, placa, quilometragem.' },
              { icon: FileText, label: 'Ordens de Serviço', desc: 'OS digital com PDF profissional. Criada em minutos, enviada na hora.' },
              { icon: Bell, label: 'Alertas de revisão', desc: 'Lembretes automáticos por data e quilometragem. Zero esquecimento.' },
              { icon: DollarSign, label: 'Financeiro', desc: 'Entradas, saídas e lucratividade por serviço. Saldo em tempo real.' },
              { icon: BarChart3, label: 'Relatórios', desc: 'Serviços mais rentáveis, clientes frequentes, performance por período.' },
            ].map((item, i) => (
              <Fade key={i} delay={i * 55}>
                <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-orange-200 hover:shadow-md">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500 shadow-sm shadow-orange-200 transition-transform duration-300 group-hover:scale-105">
                    <item.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-slate-900">{item.label}</h3>
                  <p className="text-sm leading-relaxed text-slate-500">{item.desc}</p>
                </div>
              </Fade>
            ))}
          </div>
        </div>
      </section>

      {/* ── SEGURANÇA ──────────────────────────────────────────────────── */}
      <section id="seguranca" className="bg-white py-20 md:py-24 lg:py-28">
        <div className={W}>
          <SectionHeader
            label="Segurança"
            title="Seguro, confiável e pronto para usar"
            subtitle="Sem instalação. Sem complicação. Começa a funcionar no primeiro dia."
            align="center"
          />
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5 md:gap-6">
            {[
              { icon: Cloud, title: '100% online', desc: 'Sem instalar nada' },
              { icon: Smartphone, title: 'Celular e computador', desc: 'Qualquer dispositivo' },
              { icon: Shield, title: 'Dados protegidos', desc: 'Criptografia total' },
              { icon: RotateCcw, title: 'Backup automático', desc: 'Nuvem em tempo real' },
              { icon: Zap, title: 'Interface simples', desc: 'Pronto no primeiro dia' },
            ].map((item, i) => (
              <Fade key={i} delay={i * 55}>
                <div className="flex h-full flex-col items-center rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm transition-colors hover:border-orange-200">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-orange-100 bg-orange-50">
                    <item.icon className="h-5 w-5 text-orange-500" />
                  </div>
                  <h3 className="mb-1.5 text-sm font-bold text-slate-900">{item.title}</h3>
                  <p className="text-xs leading-relaxed text-slate-400">{item.desc}</p>
                </div>
              </Fade>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ──────────────────────────────────────────────────── */}
      <section className="bg-slate-950 py-20 text-white md:py-28 lg:py-32">
        <div className={cn(W, 'text-center')}>
          <Fade>
            <div className="mx-auto max-w-3xl">
              <div className="mx-auto mb-10 h-1 w-14 rounded-full bg-orange-500 md:mb-14" />
              <h2
                className="mb-6 font-black leading-tight text-white"
                style={{ fontSize: 'clamp(1.9rem, 3.8vw, 3.25rem)' }}
              >
                Pare de perder clientes<br />
                para o esquecimento.
              </h2>
              <p className="mx-auto mb-12 max-w-xl text-lg leading-relaxed text-slate-400">
                Comece hoje a transformar{' '}
                <span className="font-semibold text-slate-200">manutenção em relacionamento</span>{' '}
                e relacionamento em{' '}
                <span className="font-semibold text-slate-200">faturamento.</span>
              </p>
              <CTALink
                href="/cadastro"
                label="Quero testar grátis"
                source={`${source}_cta_final`}
                className="px-12 py-4 text-base"
              />
              <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
                {['14 dias grátis', 'Sem cartão', 'Cancele quando quiser', 'Suporte em português'].map(t => (
                  <span key={t} className="flex items-center gap-1.5 text-sm font-medium text-slate-400">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-500" />
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </Fade>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-200 bg-white py-8">
        <div className={cn(W, 'flex flex-col items-center justify-between gap-6 md:flex-row')}>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500">
              <Wrench className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-slate-900">Motor em Dia</span>
          </div>
          <p className="text-sm text-slate-400">
            © 2025 Motor em Dia. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <Link href="/login" className="transition-colors hover:text-slate-800">
              Entrar
            </Link>
            <Link
              href="/cadastro"
              className="font-medium text-orange-600 transition-colors hover:text-slate-800"
            >
              Criar conta grátis
            </Link>
          </div>
        </div>
      </footer>

      {/* ── CTA FLUTUANTE MOBILE ───────────────────────────────────────── */}
      <div className={cn(
        'fixed inset-x-0 bottom-0 z-40 transition-all duration-300 md:hidden',
        showCTA ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0',
      )}>
        <div className="border-t border-slate-200 bg-white px-5 py-4 shadow-2xl">
          <CTALink
            href="/cadastro"
            label="Quero ver funcionando"
            source={`${source}_floating_mobile`}
            className="w-full px-6 py-4 text-base"
          />
        </div>
      </div>
    </main>
  );
}
