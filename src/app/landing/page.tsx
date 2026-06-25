'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Wrench, Bell, Car, FileText, BarChart3, MessageSquare,
  CheckCircle2, Shield, Smartphone, Cloud, TrendingUp,
  DollarSign, Zap, ArrowRight, Menu, X, Users, Star,
  Clock, RotateCcw, Package, ChevronDown
} from 'lucide-react';

// ─── utils ────────────────────────────────────────────────────────────────────
function cn(...cls: (string | boolean | undefined)[]) {
  return cls.filter(Boolean).join(' ');
}

function useInView(threshold = 0.1) {
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
  children,
  delay = 0,
  direction = 'up',
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'left' | 'right' | 'none';
  className?: string;
}) {
  const { ref, visible } = useInView();
  const transforms: Record<string, string> = {
    up: 'translate-y-6',
    left: '-translate-x-6',
    right: 'translate-x-6',
    none: '',
  };
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(
        'transition-all duration-700 ease-out',
        visible ? 'opacity-100 translate-x-0 translate-y-0' : `opacity-0 ${transforms[direction]}`,
        className
      )}
    >
      {children}
    </div>
  );
}

// ─── ROI Calculator ────────────────────────────────────────────────────────────
function Calculator() {
  const [vehicles, setVehicles] = useState(40);
  const [ticket, setTicket] = useState(350);
  const returnRate = 0.3; // 30% dos clientes atendidos poderiam retornar
  const recovered = Math.round(vehicles * returnRate);
  const monthly = recovered * ticket;
  const annual = monthly * 12;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-slate-100 px-8 py-6">
        <p className="text-slate-500 text-sm font-medium mb-0.5">Calculadora de impacto</p>
        <h3 className="text-slate-900 text-xl font-bold">Quanto faturamento está escapando?</h3>
      </div>

      <div className="p-8 grid md:grid-cols-2 gap-10">
        {/* Sliders */}
        <div className="space-y-8">
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-slate-600 text-sm font-medium">Veículos atendidos por mês</label>
              <span className="text-slate-900 font-bold text-base bg-slate-100 px-3 py-1 rounded-lg">{vehicles}</span>
            </div>
            <input
              type="range" min={10} max={200} step={5} value={vehicles}
              onChange={e => setVehicles(Number(e.target.value))}
              className="w-full accent-orange-500"
              style={{ height: '4px' }}
            />
            <div className="flex justify-between mt-1.5 text-xs text-slate-400">
              <span>10</span><span>200</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-slate-600 text-sm font-medium">Ticket médio por serviço</label>
              <span className="text-slate-900 font-bold text-base bg-slate-100 px-3 py-1 rounded-lg">
                R$ {ticket.toLocaleString('pt-BR')}
              </span>
            </div>
            <input
              type="range" min={150} max={2000} step={50} value={ticket}
              onChange={e => setTicket(Number(e.target.value))}
              className="w-full accent-orange-500"
              style={{ height: '4px' }}
            />
            <div className="flex justify-between mt-1.5 text-xs text-slate-400">
              <span>R$ 150</span><span>R$ 2.000</span>
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
            <p className="text-slate-500 text-xs leading-relaxed">
              Estimativa conservadora: <strong className="text-slate-700">{recovered} clientes</strong> ({Math.round(returnRate * 100)}% dos atendidos) poderiam retornar todo mês com lembretes automáticos — e hoje estão indo para a concorrência.
            </p>
          </div>
        </div>

        {/* Results */}
        <div className="flex flex-col gap-4 justify-center">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
            <p className="text-slate-500 text-sm mb-2">Faturamento recuperado / mês</p>
            <p className="text-slate-900 text-3xl font-black">
              R$ {monthly.toLocaleString('pt-BR')}
            </p>
          </div>
          <div className="rounded-xl border border-orange-200 bg-orange-50 p-6">
            <p className="text-orange-700 text-sm mb-2">Faturamento recuperado / ano</p>
            <p className="text-orange-600 text-4xl font-black">
              R$ {annual.toLocaleString('pt-BR')}
            </p>
            <p className="text-orange-500 text-xs mt-1">apenas com lembretes automáticos</p>
          </div>
          <Link
            href="/cadastro"
            className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm transition-colors"
          >
            Quero recuperar esses clientes <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Minimal System Mockup (right side of hero) ────────────────────────────────
function HeroMockup() {
  return (
    <div className="relative w-full max-w-[420px]" style={{ perspective: '1200px' }}>
      {/* Glow underneath */}
      <div
        className="absolute inset-x-4 bottom-0 h-20 bg-orange-400/20 blur-2xl rounded-full"
        style={{ transform: 'translateY(40%)' }}
      />

      {/* Main card */}
      <div
        className="relative rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden"
        style={{ transform: 'rotateY(-6deg) rotateX(2deg)' }}
      >
        {/* Topbar */}
        <div className="flex items-center gap-1.5 px-4 py-3 bg-slate-50 border-b border-slate-200">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
          <div className="flex-1 mx-3 bg-slate-200 rounded px-2 py-0.5 text-[9px] text-slate-500 text-center">
            app.motoremdia.com.br/dashboard
          </div>
        </div>

        {/* Body */}
        <div className="p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-slate-500 text-xs">Bom dia, Carlos 👋</p>
              <p className="text-slate-900 font-bold text-sm">Resumo de hoje</p>
            </div>
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <Wrench className="w-4 h-4 text-white" />
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { label: 'OS Abertas', value: '7', color: 'text-orange-500', bg: 'bg-orange-50' },
              { label: 'Revisões hoje', value: '4', color: 'text-amber-600', bg: 'bg-amber-50' },
              { label: 'Mês', value: 'R$12k', color: 'text-emerald-600', bg: 'bg-emerald-50' },
            ].map(s => (
              <div key={s.label} className={cn('rounded-xl p-3', s.bg)}>
                <p className="text-slate-500 text-[9px] leading-tight">{s.label}</p>
                <p className={cn('font-black text-sm mt-0.5', s.color)}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Alert list */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-wide">Lembretes do dia</p>
              <span className="text-orange-500 text-[10px] font-semibold">Ver todos</span>
            </div>
            {[
              { name: 'João Silva', car: 'Civic 2019', service: 'Troca de óleo', urgent: true },
              { name: 'Ana Lima', car: 'Gol 2021', service: 'Revisão 30.000 km', urgent: false },
              { name: 'Pedro Costa', car: 'Hilux 2020', service: 'Filtro de ar', urgent: false },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
                <div className={cn(
                  'w-2 h-2 rounded-full flex-shrink-0',
                  item.urgent ? 'bg-red-500' : 'bg-orange-400'
                )} />
                <div className="flex-1 min-w-0">
                  <p className="text-slate-800 text-[10px] font-semibold truncate">{item.name} · {item.car}</p>
                  <p className="text-slate-400 text-[9px] truncate">{item.service}</p>
                </div>
                <div className="w-6 h-6 flex-shrink-0 rounded-lg bg-green-50 flex items-center justify-center">
                  <MessageSquare className="w-3 h-3 text-green-600" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating badge */}
      <div
        className="absolute -right-4 top-16 bg-white border border-slate-200 rounded-xl px-3 py-2.5 shadow-lg"
        style={{ transform: 'rotateY(-4deg)' }}
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-orange-100 rounded-lg flex items-center justify-center">
            <Bell className="w-3.5 h-3.5 text-orange-500" />
          </div>
          <div>
            <p className="text-slate-900 text-[11px] font-bold leading-none">4 alertas</p>
            <p className="text-slate-400 text-[9px]">para hoje</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    // Light background — HubSpot/Pipefy style
    <div className="bg-white text-slate-900 min-h-screen overflow-x-hidden" style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>

      {/* ─── NAVBAR ──────────────────────────────────────────────────── */}
      <header className={cn(
        'fixed top-0 inset-x-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-sm'
          : 'bg-white/80 backdrop-blur-sm'
      )}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center shadow-sm">
              <Wrench className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900 text-[15px] tracking-tight">Motor em Dia</span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            {[
              { label: 'Problema', href: '#problema' },
              { label: 'Solução', href: '#solucao' },
              { label: 'Como funciona', href: '#como-funciona' },
              { label: 'Calculadora', href: '#calculadora' },
            ].map(({ label, href }) => (
              <a key={href} href={href} className="text-sm text-slate-600 hover:text-slate-900 transition-colors font-medium">
                {label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="text-sm text-slate-600 hover:text-slate-900 font-medium px-3 py-2 transition-colors">
              Entrar
            </Link>
            <Link
              href="/cadastro"
              className="text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg transition-colors shadow-sm shadow-orange-200"
            >
              Teste grátis por 14 dias
            </Link>
          </div>

          <button onClick={() => setMenuOpen(v => !v)} className="md:hidden p-2 text-slate-600" aria-label="Menu">
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-6 py-4 space-y-1 shadow-lg">
            {[
              { label: 'Problema', href: '#problema' },
              { label: 'Solução', href: '#solucao' },
              { label: 'Como funciona', href: '#como-funciona' },
              { label: 'Calculadora', href: '#calculadora' },
            ].map(({ label, href }) => (
              <a key={href} href={href} onClick={() => setMenuOpen(false)}
                className="block py-3 text-slate-700 text-sm font-medium border-b border-slate-100 last:border-0">
                {label}
              </a>
            ))}
            <div className="pt-3 space-y-2">
              <Link href="/login" onClick={() => setMenuOpen(false)} className="block py-3 text-center text-sm text-slate-600 font-medium">
                Entrar
              </Link>
              <Link href="/cadastro" onClick={() => setMenuOpen(false)}
                className="block py-3 text-center text-sm font-bold bg-orange-500 text-white rounded-xl">
                Teste grátis por 14 dias
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ─── HERO — 100vh ────────────────────────────────────────────── */}
      <section
        className="flex items-center"
        style={{ minHeight: '100vh', paddingTop: '80px', paddingBottom: '80px' }}
      >
        {/* Subtle top gradient */}
        <div
          className="pointer-events-none absolute top-0 inset-x-0 h-96 opacity-40"
          style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -10%, #fed7aa, transparent)' }}
        />

        <div className="relative max-w-6xl mx-auto px-6 w-full">
          <div className="grid lg:grid-cols-2 gap-16 xl:gap-24 items-center">

            {/* ── LEFT: Copy ───────────────── */}
            <div>
              {/* Eyebrow */}
              <Fade>
                <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5 mb-8">
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                  <span className="text-orange-700 text-sm font-semibold">Sistema para oficinas mecânicas</span>
                </div>
              </Fade>

              {/* H1 */}
              <Fade delay={80}>
                <h1
                  className="font-black text-slate-900 leading-[1.06] tracking-tight mb-6"
                  style={{ fontSize: 'clamp(2.4rem, 5vw, 4rem)' }}
                >
                  Nunca mais perca<br />
                  uma revisão por<br />
                  <span className="text-orange-500">esquecimento.</span>
                </h1>
              </Fade>

              {/* Subheadline */}
              <Fade delay={140}>
                <p className="text-slate-700 font-semibold text-lg leading-relaxed mb-4">
                  Transforme clientes ocasionais em clientes recorrentes com lembretes automáticos de manutenção.
                </p>
              </Fade>

              {/* Complementary text */}
              <Fade delay={180}>
                <p className="text-slate-500 text-base leading-relaxed mb-10">
                  O Motor em Dia avisa quando cada cliente precisa retornar para revisão, troca de óleo ou manutenção preventiva — ajudando sua oficina a aumentar o faturamento <span className="text-slate-700 font-medium">sem gastar mais com anúncios.</span>
                </p>
              </Fade>

              {/* CTAs */}
              <Fade delay={220}>
                <div className="flex flex-col sm:flex-row gap-3 mb-8">
                  <Link
                    href="/cadastro"
                    className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-7 py-4 rounded-xl transition-all hover:shadow-lg hover:shadow-orange-200 text-[15px]"
                  >
                    Quero ver funcionando
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/cadastro"
                    className="flex items-center justify-center gap-2 border-2 border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold px-7 py-4 rounded-xl transition-all text-[15px]"
                  >
                    Teste grátis por 14 dias
                  </Link>
                </div>
              </Fade>

              {/* Trust signals */}
              <Fade delay={260}>
                <div className="flex flex-wrap gap-5">
                  {[
                    '14 dias grátis',
                    'Sem cartão de crédito',
                    'Cancelamento a qualquer momento',
                  ].map(t => (
                    <span key={t} className="flex items-center gap-1.5 text-sm text-slate-500 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      {t}
                    </span>
                  ))}
                </div>
              </Fade>
            </div>

            {/* ── RIGHT: Mockup ─────────────── */}
            <Fade delay={120} direction="left" className="flex justify-center lg:justify-end">
              <HeroMockup />
            </Fade>
          </div>
        </div>
      </section>

      {/* ─── FEATURE STRIP ───────────────────────────────────────────── */}
      <div className="border-y border-slate-100 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-3">
            {[
              { icon: Bell, label: 'Lembretes automáticos' },
              { icon: Car, label: 'Histórico de veículos' },
              { icon: FileText, label: 'OS digitais' },
              { icon: MessageSquare, label: 'Integração WhatsApp' },
              { icon: BarChart3, label: 'Dashboard gerencial' },
              { icon: DollarSign, label: 'Controle financeiro' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                <Icon className="w-4 h-4 text-orange-500 flex-shrink-0" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── PROBLEMA ───────────────────────────────────────────────────
          spacing: py-32 = 128px desktop / py-20 = 80px mobile          */}
      <section id="problema" className="py-20 md:py-32">
        <div className="max-w-6xl mx-auto px-6">

          <Fade className="max-w-2xl mb-16 md:mb-20">
            <p className="text-orange-600 text-sm font-bold uppercase tracking-widest mb-4">O problema</p>
            <h2
              className="font-black text-slate-900 leading-tight mb-5"
              style={{ fontSize: 'clamp(1.9rem, 3.5vw, 2.75rem)' }}
            >
              Quantos clientes sua oficina já perdeu por esquecimento?
            </h2>
            <p className="text-slate-500 text-lg leading-relaxed">
              Esses problemas custam dinheiro — e a maioria dos donos de oficina não percebe porque a perda é silenciosa.
            </p>
          </Fade>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: Clock,
                title: 'Revisões esquecidas',
                desc: 'O cliente promete "passar semana que vem" e nunca mais volta. Sem um lembrete, ele simplesmente esquece.',
              },
              {
                icon: RotateCcw,
                title: 'Trocas de óleo perdidas',
                desc: 'A troca de óleo é o serviço mais recorrente de uma oficina. Cada troca esquecida é dinheiro direto na mesa do concorrente.',
              },
              {
                icon: Car,
                title: 'Falta de acompanhamento',
                desc: 'Sem acompanhar o histórico do veículo, sua oficina perde oportunidades de oferecer serviços preventivos no momento certo.',
              },
              {
                icon: Users,
                title: 'Clientes que nunca retornam',
                desc: 'Conquistar um novo cliente custa de 5 a 7 vezes mais do que manter um. Sua oficina está perdendo dinheiro na retenção.',
              },
              {
                icon: FileText,
                title: 'Histórico desorganizado',
                desc: 'Informações em papel, caderno ou memória do mecânico. Quando alguém sai, o histórico vai junto.',
              },
              {
                icon: MessageSquare,
                title: 'WhatsApp virou bagunça',
                desc: 'Clientes, fornecedores, família — tudo misturado. Impossível acompanhar quem precisa de atenção hoje.',
              },
            ].map((item, i) => (
              <Fade key={i} delay={i * 60}>
                <div className="bg-white border border-slate-200 rounded-2xl p-7 hover:border-orange-200 hover:shadow-md transition-all duration-300 h-full">
                  <div className="w-10 h-10 bg-red-50 border border-red-100 rounded-xl flex items-center justify-center mb-5">
                    <item.icon className="w-5 h-5 text-red-500" />
                  </div>
                  <h3 className="text-slate-900 font-bold text-base mb-3">{item.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </Fade>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SOLUÇÃO — flow visual ──────────────────────────────────────
          bg separada para criar divisão visual limpa                    */}
      <section id="solucao" className="py-20 md:py-32 bg-slate-50 border-y border-slate-100">
        <div className="max-w-5xl mx-auto px-6">

          <Fade className="text-center mb-16 md:mb-20">
            <p className="text-orange-600 text-sm font-bold uppercase tracking-widest mb-4">A solução</p>
            <h2
              className="font-black text-slate-900 leading-tight mb-5 mx-auto"
              style={{ fontSize: 'clamp(1.9rem, 3.5vw, 2.75rem)', maxWidth: '640px' }}
            >
              Seu sistema de acompanhamento automático
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto leading-relaxed">
              Um fluxo simples que transforma cada serviço realizado em uma oportunidade de retorno garantido.
            </p>
          </Fade>

          {/* Flow steps */}
          <div className="flex flex-col items-center gap-0 max-w-lg mx-auto">
            {[
              { icon: Car, title: 'Cadastro do veículo', desc: 'Cliente, carro e quilometragem registrados em 2 minutos.' },
              { icon: FileText, title: 'Registro da manutenção', desc: 'OS criada, serviços e próximo prazo definidos.' },
              { icon: Zap, title: 'Monitoramento automático', desc: 'O sistema acompanha todos os prazos em segundo plano.' },
              { icon: Bell, title: 'Alerta de retorno', desc: 'Você recebe o aviso e envia mensagem pelo WhatsApp com um clique.' },
              { icon: TrendingUp, title: 'Cliente volta para sua oficina', desc: 'Relacionamento fortalecido. Faturamento crescendo.' },
            ].map((step, i) => (
              <Fade key={i} delay={i * 80} className="w-full">
                <div className="flex items-stretch gap-5">
                  {/* Left: icon + line */}
                  <div className="flex flex-col items-center flex-shrink-0 w-12">
                    <div className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0 z-10',
                      i === 4 ? 'bg-orange-500' : 'bg-white border-2 border-orange-200'
                    )}>
                      <step.icon className={cn('w-5 h-5', i === 4 ? 'text-white' : 'text-orange-500')} />
                    </div>
                    {i < 4 && (
                      <div className="flex-1 w-px bg-gradient-to-b from-orange-200 to-orange-100 my-1" style={{ minHeight: '40px' }} />
                    )}
                  </div>

                  {/* Right: text */}
                  <div className="pb-10 last:pb-0 flex-1">
                    <h3 className="text-slate-900 font-bold text-base mb-1">{step.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              </Fade>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BENEFÍCIOS ─────────────────────────────────────────────── */}
      <section className="py-20 md:py-32">
        <div className="max-w-6xl mx-auto px-6">

          <Fade className="max-w-2xl mb-16 md:mb-20">
            <p className="text-orange-600 text-sm font-bold uppercase tracking-widest mb-4">Benefícios</p>
            <h2
              className="font-black text-slate-900 leading-tight mb-5"
              style={{ fontSize: 'clamp(1.9rem, 3.5vw, 2.75rem)' }}
            >
              O que muda na sua oficina<br />a partir do primeiro mês
            </h2>
          </Fade>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: TrendingUp, title: 'Mais clientes retornando', desc: 'Clientes avisados no momento certo voltam mais. Não tem segredo: comunicação = fidelização.' },
              { icon: DollarSign, title: 'Faturamento recorrente', desc: 'Cada cliente fidelizado gera receita previsível todo mês, sem depender de novos anúncios.' },
              { icon: Bell, title: 'Menos esquecimentos', desc: 'O sistema lembra por você. Nenhum cliente cai no esquecimento por falta de atenção.' },
              { icon: Star, title: 'Atendimento profissional', desc: 'Histórico completo, OS digital e comunicação organizada. Seu cliente percebe a diferença.' },
              { icon: FileText, title: 'Histórico organizado', desc: 'Tudo em um lugar: cada carro, cada serviço, cada troca. Na nuvem, acessível de qualquer lugar.' },
              { icon: BarChart3, title: 'Gestão mais eficiente', desc: 'Dashboard completo: OS abertas, revisões próximas e faturamento do mês em uma tela só.' },
            ].map((item, i) => (
              <Fade key={i} delay={i * 60}>
                <div className="bg-white border border-slate-200 rounded-2xl p-7 hover:border-orange-200 hover:shadow-md transition-all duration-300 h-full">
                  <div className="w-10 h-10 bg-orange-50 border border-orange-100 rounded-xl flex items-center justify-center mb-5">
                    <item.icon className="w-5 h-5 text-orange-500" />
                  </div>
                  <h3 className="text-slate-900 font-bold text-base mb-3">{item.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </Fade>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CALCULADORA ────────────────────────────────────────────── */}
      <section id="calculadora" className="py-20 md:py-32 bg-slate-50 border-y border-slate-100">
        <div className="max-w-4xl mx-auto px-6">
          <Fade className="text-center mb-14">
            <p className="text-orange-600 text-sm font-bold uppercase tracking-widest mb-4">Calculadora</p>
            <h2
              className="font-black text-slate-900 leading-tight mb-5"
              style={{ fontSize: 'clamp(1.9rem, 3.5vw, 2.75rem)' }}
            >
              Calcule quanto faturamento<br />você está perdendo agora
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">
              Ajuste os valores e veja a projeção de faturamento que pode ser recuperado com lembretes automáticos.
            </p>
          </Fade>
          <Fade delay={100}>
            <Calculator />
          </Fade>
        </div>
      </section>

      {/* ─── SISTEMA (screenshots) ──────────────────────────────────── */}
      <section className="py-20 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <Fade className="text-center mb-16">
            <p className="text-orange-600 text-sm font-bold uppercase tracking-widest mb-4">O sistema</p>
            <h2
              className="font-black text-slate-900 leading-tight mb-5"
              style={{ fontSize: 'clamp(1.9rem, 3.5vw, 2.75rem)' }}
            >
              Tudo que sua oficina precisa,<br />em uma tela só
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">
              Interface projetada para oficinas mecânicas. Simples, rápida e completa.
            </p>
          </Fade>

          {/* Feature cards with icons */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: BarChart3, label: 'Dashboard', desc: 'Visão completa do negócio em tempo real.' },
              { icon: Car, label: 'Veículos', desc: 'Histórico completo de cada carro atendido.' },
              { icon: FileText, label: 'Ordens de Serviço', desc: 'OS digital com PDF profissional.' },
              { icon: Bell, label: 'Alertas', desc: 'Lembretes automáticos por data e quilometragem.' },
              { icon: DollarSign, label: 'Financeiro', desc: 'Entradas, saídas e lucratividade por serviço.' },
              { icon: BarChart3, label: 'Relatórios', desc: 'Serviços mais rentáveis e clientes frequentes.' },
            ].map((item, i) => (
              <Fade key={i} delay={i * 55}>
                <div className="group rounded-2xl border border-slate-200 bg-white p-8 hover:border-orange-200 hover:shadow-md transition-all duration-300">
                  <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mb-5 shadow-sm shadow-orange-200 group-hover:scale-110 transition-transform duration-300">
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-slate-900 font-bold text-lg mb-2">{item.label}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </Fade>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CONFIANÇA ──────────────────────────────────────────────── */}
      <section className="py-20 md:py-24 bg-slate-50 border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-6">
          <Fade className="text-center mb-12">
            <h2 className="font-black text-slate-900 mb-3" style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2rem)' }}>
              Seguro, confiável e pronto para usar
            </h2>
            <p className="text-slate-500">Sem instalação. Sem complicação.</p>
          </Fade>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { icon: Cloud, title: '100% online', desc: 'Sem instalar nada' },
              { icon: Smartphone, title: 'Celular e computador', desc: 'Qualquer dispositivo' },
              { icon: Shield, title: 'Dados protegidos', desc: 'Criptografia total' },
              { icon: RotateCcw, title: 'Backup automático', desc: 'Nuvem em tempo real' },
              { icon: Zap, title: 'Interface simples', desc: 'Pronto no primeiro dia' },
            ].map((item, i) => (
              <Fade key={i} delay={i * 55}>
                <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center hover:border-orange-200 transition-colors h-full">
                  <div className="w-10 h-10 bg-orange-50 border border-orange-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                    <item.icon className="w-5 h-5 text-orange-500" />
                  </div>
                  <h3 className="text-slate-900 font-bold text-sm mb-1">{item.title}</h3>
                  <p className="text-slate-400 text-xs">{item.desc}</p>
                </div>
              </Fade>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA FINAL ──────────────────────────────────────────────── */}
      <section className="py-24 md:py-36">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <Fade>
            {/* Decorative bar */}
            <div className="w-12 h-1 bg-orange-500 rounded-full mx-auto mb-10" />

            <h2
              className="font-black text-slate-900 leading-tight mb-6"
              style={{ fontSize: 'clamp(2rem, 4vw, 3.25rem)' }}
            >
              Pare de perder clientes<br />
              para o esquecimento.
            </h2>

            <p className="text-slate-500 text-lg leading-relaxed mb-12 max-w-xl mx-auto">
              Comece hoje a transformar{' '}
              <span className="text-slate-700 font-semibold">manutenção em relacionamento</span>{' '}
              e relacionamento em{' '}
              <span className="text-slate-700 font-semibold">faturamento.</span>
            </p>

            <Link
              href="/cadastro"
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-10 py-4 rounded-xl transition-all hover:shadow-xl hover:shadow-orange-200 text-base"
            >
              Quero testar grátis <ArrowRight className="w-5 h-5" />
            </Link>

            <div className="flex flex-wrap items-center justify-center gap-6 mt-8">
              {['14 dias grátis', 'Sem cartão', 'Cancele quando quiser', 'Suporte em português'].map(t => (
                <span key={t} className="flex items-center gap-1.5 text-sm text-slate-400 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  {t}
                </span>
              ))}
            </div>
          </Fade>
        </div>
      </section>

      {/* ─── FOOTER ─────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-200 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center">
              <Wrench className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-slate-900 font-bold text-sm">Motor em Dia</span>
          </div>
          <p className="text-slate-400 text-sm">© 2025 Motor em Dia. Todos os direitos reservados.</p>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <Link href="/login" className="hover:text-slate-800 transition-colors">Entrar</Link>
            <Link href="/cadastro" className="hover:text-slate-800 transition-colors">Criar conta</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
