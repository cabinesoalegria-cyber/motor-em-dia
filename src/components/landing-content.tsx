'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Wrench, Bell, Car, FileText, BarChart3, MessageSquare,
  CheckCircle2, Shield, Smartphone, Cloud, TrendingUp,
  DollarSign, Zap, ArrowRight, Menu, X, Users, Star,
  Clock, RotateCcw
} from 'lucide-react';
import { trackEvent } from '@/components/analytics';

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

function Fade({ children, delay = 0, direction = 'up', className = '' }: {
  children: React.ReactNode; delay?: number;
  direction?: 'up' | 'left' | 'right' | 'none'; className?: string;
}) {
  const { ref, visible } = useInView();
  const from = { up: 'translate-y-5', left: '-translate-x-5', right: 'translate-x-5', none: '' };
  return (
    <div ref={ref} style={{ transitionDelay: `${delay}ms` }}
      className={cn('transition-all duration-700 ease-out',
        visible ? 'opacity-100 translate-x-0 translate-y-0' : `opacity-0 ${from[direction]}`,
        className)}>
      {children}
    </div>
  );
}

/* ─── Constantes de layout ─────────────────────────────────────────────────── */
// Container com px correto em todos os breakpoints — evita conteúdo colado nas bordas
const CONTAINER = 'mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8';

/* ─── CTA Link com tracking ────────────────────────────────────────────────── */
function CTALink({ href, label, primary = true, className = '', source = '' }: {
  href: string; label: string; primary?: boolean; className?: string; source?: string;
}) {
  return (
    <Link href={href}
      onClick={() => trackEvent('cta_click', { button_label: label, source })}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200',
        primary
          ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-sm shadow-orange-200 hover:shadow-md hover:shadow-orange-200 hover:-translate-y-px'
          : 'border-2 border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700',
        className
      )}>
      {label}
      {primary && <ArrowRight className="w-4 h-4 flex-shrink-0" />}
    </Link>
  );
}

/* ─── Cabeçalho de seção padronizado ──────────────────────────────────────── */
function SectionHeader({
  label, title, subtitle, align = 'center', className = ''
}: {
  label: string; title: string; subtitle?: string;
  align?: 'left' | 'center'; className?: string;
}) {
  return (
    <Fade className={cn(
      align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-2xl',
      'mb-10 md:mb-14 lg:mb-16',
      className
    )}>
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-600">
        {label}
      </p>
      <h2 className="mt-3 font-bold tracking-tight text-slate-950 leading-tight text-3xl sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-5 text-base md:text-lg leading-8 text-slate-600">
          {subtitle}
        </p>
      )}
    </Fade>
  );
}

/* ─── ROI Calculator ───────────────────────────────────────────────────────── */
function Calculator() {
  const [vehicles, setVehicles] = useState(40);
  const [ticket, setTicket] = useState(350);
  const [interacted, setInteracted] = useState(false);
  const returnRate = 0.3;
  const recovered = Math.round(vehicles * returnRate);
  const monthly = recovered * ticket;
  const annual = monthly * 12;

  function handleChange(field: 'v' | 't', val: number) {
    if (field === 'v') setVehicles(val); else setTicket(val);
    if (!interacted) { setInteracted(true); trackEvent('calculator_use', { vehicles, ticket }); }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-slate-100 px-6 md:px-8 py-6 md:py-7">
        <p className="text-orange-600 text-xs font-bold uppercase tracking-widest mb-2">Calculadora de impacto</p>
        <h3 className="text-slate-900 text-xl md:text-2xl font-black">Quanto faturamento está escapando?</h3>
      </div>
      <div className="p-6 md:p-10 grid md:grid-cols-2 gap-8 md:gap-14">
        <div className="space-y-8 md:space-y-10">
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="text-slate-700 text-sm font-semibold">Veículos atendidos / mês</label>
              <span className="text-slate-900 font-black text-lg bg-orange-50 border border-orange-100 px-3 py-1 rounded-lg min-w-[48px] text-center">{vehicles}</span>
            </div>
            <input type="range" min={10} max={200} step={5} value={vehicles}
              onChange={e => handleChange('v', Number(e.target.value))} className="w-full accent-orange-500" />
            <div className="flex justify-between mt-2 text-xs text-slate-400 font-medium">
              <span>10</span><span>200</span>
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="text-slate-700 text-sm font-semibold">Ticket médio por serviço</label>
              <span className="text-slate-900 font-black text-lg bg-orange-50 border border-orange-100 px-3 py-1 rounded-lg">
                R${ticket.toLocaleString('pt-BR')}
              </span>
            </div>
            <input type="range" min={150} max={2000} step={50} value={ticket}
              onChange={e => handleChange('t', Number(e.target.value))} className="w-full accent-orange-500" />
            <div className="flex justify-between mt-2 text-xs text-slate-400 font-medium">
              <span>R$ 150</span><span>R$ 2.000</span>
            </div>
          </div>
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-5">
            <p className="text-slate-500 text-sm leading-relaxed">
              Estimativa conservadora: <span className="text-slate-800 font-semibold">{recovered} clientes</span> ({Math.round(returnRate * 100)}% dos atendidos) poderiam retornar todo mês com lembretes automáticos.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-5 justify-center">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 md:p-7">
            <p className="text-slate-500 text-sm mb-2">Faturamento recuperado / mês</p>
            <p className="text-slate-900 text-3xl md:text-4xl font-black">R$ {monthly.toLocaleString('pt-BR')}</p>
          </div>
          <div className="rounded-xl border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 p-6 md:p-7">
            <p className="text-orange-700 text-sm mb-2 font-medium">Faturamento recuperado / ano</p>
            <p className="text-orange-600 text-4xl md:text-5xl font-black">R$ {annual.toLocaleString('pt-BR')}</p>
            <p className="text-orange-500/70 text-xs mt-2">apenas com lembretes automáticos</p>
          </div>
          <CTALink href="/cadastro" label="Quero recuperar esses clientes" source="calculator" className="py-4 px-6 w-full" />
        </div>
      </div>
    </div>
  );
}

/* ─── Hero Mockup ──────────────────────────────────────────────────────────── */
function HeroMockup() {
  return (
    <div className="relative w-full max-w-[400px]" style={{ perspective: '1100px' }}>
      <div className="absolute inset-x-8 -bottom-4 h-16 bg-orange-300/25 blur-2xl rounded-full" />
      <div
        className="relative rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden"
        style={{ transform: 'rotateY(-5deg) rotateX(2deg)' }}
      >
        <div className="flex items-center gap-1.5 px-4 py-3 bg-slate-50 border-b border-slate-200">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
          <div className="flex-1 mx-3 bg-slate-200 rounded px-2 py-0.5 text-[9px] text-slate-400 text-center">
            app.motoremdia.com.br
          </div>
        </div>
        <div className="p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-slate-400 text-[11px]">Bom dia, Carlos 👋</p>
              <p className="text-slate-900 font-bold text-sm">Resumo de hoje</p>
            </div>
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <Wrench className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-5">
            {[
              { l: 'OS Abertas', v: '7', bg: 'bg-orange-50', t: 'text-orange-600' },
              { l: 'Revisões', v: '4', bg: 'bg-amber-50', t: 'text-amber-600' },
              { l: 'Mês', v: 'R$12k', bg: 'bg-emerald-50', t: 'text-emerald-600' },
            ].map(s => (
              <div key={s.l} className={cn('rounded-xl p-3', s.bg)}>
                <p className="text-slate-400 text-[9px]">{s.l}</p>
                <p className={cn('font-black text-sm mt-0.5', s.t)}>{s.v}</p>
              </div>
            ))}
          </div>
          <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wide mb-2.5">Lembretes do dia</p>
          {[
            { name: 'João Silva', car: 'Civic 2019', svc: 'Troca de óleo', urgent: true },
            { name: 'Ana Lima', car: 'Gol 2021', svc: 'Revisão 30.000 km', urgent: false },
            { name: 'Pedro Costa', car: 'Hilux 2020', svc: 'Filtro de ar', urgent: false },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 py-2.5 border-b border-slate-100 last:border-0">
              <div className={cn('w-2 h-2 rounded-full flex-shrink-0', item.urgent ? 'bg-red-500' : 'bg-orange-400')} />
              <div className="flex-1 min-w-0">
                <p className="text-slate-800 text-[10px] font-semibold truncate">{item.name} · {item.car}</p>
                <p className="text-slate-400 text-[9px] truncate">{item.svc}</p>
              </div>
              <div className="w-6 h-6 flex-shrink-0 rounded-lg bg-green-50 flex items-center justify-center">
                <MessageSquare className="w-3 h-3 text-green-600" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute -right-3 top-14 bg-white border border-slate-200 rounded-xl px-3 py-2.5 shadow-lg"
        style={{ transform: 'rotateY(-3deg)' }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-orange-100 rounded-lg flex items-center justify-center">
            <Bell className="w-3.5 h-3.5 text-orange-500" />
          </div>
          <div>
            <p className="text-slate-900 text-[11px] font-bold leading-none">4 alertas</p>
            <p className="text-slate-400 text-[9px] mt-0.5">para hoje</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ───────────────────────────────────────────────────────── */
export default function LandingPageContent({ source = 'landing' }: { source?: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showFloatingCTA, setShowFloatingCTA] = useState(false);

  useEffect(() => {
    const fn = () => {
      setScrolled(window.scrollY > 20);
      setShowFloatingCTA(window.scrollY > 600);
    };
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <div className="w-full overflow-x-hidden bg-white text-slate-900 min-h-screen"
      style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>

      {/* ══ NAVBAR ══════════════════════════════════════════════════════════ */}
      <header className={cn(
        'fixed top-0 inset-x-0 z-50 transition-all duration-300',
        scrolled ? 'bg-white/96 backdrop-blur-xl border-b border-slate-200 shadow-sm' : 'bg-white/80 backdrop-blur-sm'
      )}>
        <div className={cn(CONTAINER, 'h-16 flex items-center justify-between')}>
          <Link href="/landing" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center shadow-sm">
              <Wrench className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900 text-[15px] tracking-tight">Motor em Dia</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {[['Problema', '#problema'], ['Solução', '#solucao'], ['Como funciona', '#como-funciona'], ['Calculadora', '#calculadora']].map(([label, href]) => (
              <a key={href} href={href} className="text-sm text-slate-500 hover:text-slate-900 font-medium transition-colors">{label}</a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="text-sm text-slate-500 hover:text-slate-900 font-medium px-3 py-2">Entrar</Link>
            <CTALink href="/cadastro" label="Teste grátis por 14 dias" source={`${source}_nav`} className="px-5 py-2.5 text-sm" />
          </div>

          <button onClick={() => setMenuOpen(v => !v)} className="md:hidden p-2 text-slate-500" aria-label="Menu">
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white shadow-lg">
            <div className={cn(CONTAINER, 'py-4 space-y-1')}>
              {[['Problema', '#problema'], ['Solução', '#solucao'], ['Como funciona', '#como-funciona'], ['Calculadora', '#calculadora']].map(([label, href]) => (
                <a key={href} href={href} onClick={() => setMenuOpen(false)}
                  className="block py-3 text-slate-700 text-sm font-medium border-b border-slate-100 last:border-0">{label}</a>
              ))}
              <div className="pt-4 space-y-3">
                <Link href="/login" onClick={() => setMenuOpen(false)} className="block py-3 text-center text-sm text-slate-500 font-medium">Entrar</Link>
                <CTALink href="/cadastro" label="Teste grátis por 14 dias" source={`${source}_mobile_menu`} className="w-full py-3.5 px-6" />
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ══ HERO ════════════════════════════════════════════════════════════ */}
      <section className="relative flex items-center overflow-hidden"
        style={{ minHeight: '100vh', paddingTop: '64px' }}>
        {/* Warm glow */}
        <div className="pointer-events-none absolute top-0 inset-x-0 h-[65vh] opacity-50"
          style={{ background: 'radial-gradient(ellipse 70% 60% at 50% -5%, #ffedd5, transparent)' }} />
        {/* Bottom fade */}
        <div className="pointer-events-none absolute bottom-0 inset-x-0 h-24"
          style={{ background: 'linear-gradient(to bottom, transparent, rgba(248,250,252,0.5))' }} />

        <div className={cn(CONTAINER, 'relative z-10 py-20 lg:py-28')}>
          <div className="grid lg:grid-cols-2 gap-12 xl:gap-24 items-center">

            {/* Copy */}
            <div className="max-w-xl">
              <Fade>
                <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5 mb-8">
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                  <span className="text-orange-700 text-sm font-semibold">Sistema para oficinas mecânicas</span>
                </div>
              </Fade>

              <Fade delay={70}>
                <h1 className="font-black text-slate-900 tracking-tight leading-[1.07] mb-6"
                  style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.75rem)' }}>
                  Nunca mais perca<br />
                  uma revisão por<br />
                  <span className="text-orange-500">esquecimento.</span>
                </h1>
              </Fade>

              <Fade delay={130}>
                <p className="text-slate-700 text-lg font-semibold leading-relaxed mb-5">
                  Transforme clientes ocasionais em clientes recorrentes com lembretes automáticos de manutenção.
                </p>
              </Fade>

              <Fade delay={170}>
                <p className="text-slate-500 text-base leading-relaxed mb-10">
                  O Motor em Dia avisa quando cada cliente precisa retornar para revisão, troca de óleo ou manutenção preventiva —
                  ajudando sua oficina a aumentar o faturamento{' '}
                  <span className="text-slate-700 font-medium">sem gastar mais com anúncios.</span>
                </p>
              </Fade>

              <Fade delay={210}>
                <div className="flex flex-col sm:flex-row gap-3 mb-10">
                  <CTALink href="/cadastro" label="Quero ver funcionando" source={`${source}_hero_primary`} className="py-4 px-7 text-[15px]" />
                  <CTALink href="/cadastro" label="Teste grátis por 14 dias" primary={false} source={`${source}_hero_secondary`} className="py-4 px-7 text-[15px]" />
                </div>
              </Fade>

              <Fade delay={250}>
                <div className="flex flex-wrap gap-x-6 gap-y-2">
                  {['14 dias grátis', 'Sem cartão de crédito', 'Cancelamento a qualquer momento'].map(t => (
                    <span key={t} className="flex items-center gap-1.5 text-sm text-slate-500 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
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

      {/* ══ FEATURE STRIP ═══════════════════════════════════════════════════ */}
      <div className="border-y border-slate-200 bg-white">
        <div className={cn(CONTAINER, 'py-6 md:py-8')}>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 md:gap-x-10">
            {[
              { icon: Bell, label: 'Lembretes automáticos' },
              { icon: Car, label: 'Histórico de veículos' },
              { icon: FileText, label: 'OS digitais' },
              { icon: MessageSquare, label: 'WhatsApp integrado' },
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

      {/* ══ O PROBLEMA ══════════════════════════════════════════════════════ */}
      <section id="problema" className="py-16 md:py-24 lg:py-32 bg-slate-50">
        <div className={CONTAINER}>
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
                <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 hover:border-orange-200 hover:shadow-md transition-all duration-300 h-full">
                  <div className="w-11 h-11 bg-red-50 border border-red-100 rounded-xl flex items-center justify-center mb-5">
                    <item.icon className="w-5 h-5 text-red-500" />
                  </div>
                  <h3 className="text-slate-900 font-bold text-base mb-2">{item.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </Fade>
            ))}
          </div>
        </div>
      </section>

      {/* ══ A SOLUÇÃO ═══════════════════════════════════════════════════════ */}
      <section id="solucao" className="py-16 md:py-24 lg:py-32 bg-white">
        <div className={CONTAINER}>
          <SectionHeader
            label="A solução"
            title="Seu sistema de acompanhamento automático"
            subtitle="Um fluxo simples que transforma cada serviço realizado em uma oportunidade de retorno garantido."
            align="center"
          />
          <div className="mx-auto max-w-lg">
            {[
              { icon: Car, title: 'Cadastro do veículo', desc: 'Cliente, carro e quilometragem registrados em 2 minutos. Histórico centralizado para sempre.' },
              { icon: FileText, title: 'Registro da manutenção', desc: 'OS criada, serviços e próximo prazo de retorno definidos com precisão.' },
              { icon: Zap, title: 'Monitoramento automático', desc: 'O sistema acompanha todos os prazos em segundo plano, sem que você precise fazer nada.' },
              { icon: Bell, title: 'Alerta de retorno', desc: 'Você recebe o aviso e envia mensagem pelo WhatsApp com um clique.' },
              { icon: TrendingUp, title: 'Cliente volta para sua oficina', desc: 'Relacionamento fortalecido. Faturamento crescendo todo mês.' },
            ].map((step, i) => (
              <Fade key={i} delay={i * 80}>
                <div className="flex items-stretch gap-5 md:gap-6">
                  <div className="flex flex-col items-center flex-shrink-0 w-12">
                    <div className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
                      i === 4 ? 'bg-orange-500 shadow-md shadow-orange-200' : 'bg-white border-2 border-orange-200'
                    )}>
                      <step.icon className={cn('w-5 h-5', i === 4 ? 'text-white' : 'text-orange-500')} />
                    </div>
                    {i < 4 && (
                      <div className="flex-1 w-px bg-gradient-to-b from-orange-200 to-orange-50 my-1" style={{ minHeight: '48px' }} />
                    )}
                  </div>
                  <div className="pb-10 last:pb-0 flex-1 pt-2">
                    <h3 className="text-slate-900 font-bold text-base mb-2">{step.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              </Fade>
            ))}
          </div>
          <Fade className="flex justify-center mt-12 md:mt-16">
            <CTALink href="/cadastro" label="Quero ver isso funcionando" source={`${source}_solucao_cta`} className="py-4 px-8 text-[15px]" />
          </Fade>
        </div>
      </section>

      {/* ══ BENEFÍCIOS ══════════════════════════════════════════════════════ */}
      <section id="beneficios" className="py-16 md:py-24 lg:py-32 bg-slate-50">
        <div className={CONTAINER}>
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
                <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 hover:border-orange-200 hover:shadow-md transition-all duration-300 h-full">
                  <div className="w-11 h-11 bg-orange-50 border border-orange-100 rounded-xl flex items-center justify-center mb-5">
                    <item.icon className="w-5 h-5 text-orange-500" />
                  </div>
                  <h3 className="text-slate-900 font-bold text-base mb-2">{item.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </Fade>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CALCULADORA ═════════════════════════════════════════════════════ */}
      <section id="calculadora" className="py-16 md:py-24 lg:py-32 bg-white">
        <div className={CONTAINER}>
          <SectionHeader
            label="Calculadora"
            title="Calcule quanto faturamento você está perdendo agora"
            subtitle="Ajuste os valores e veja a projeção de faturamento que pode ser recuperado com lembretes automáticos."
            align="center"
          />
          <div className="mx-auto max-w-4xl">
            <Fade delay={100}><Calculator /></Fade>
          </div>
        </div>
      </section>

      {/* ══ O SISTEMA ═══════════════════════════════════════════════════════ */}
      <section id="como-funciona" className="py-16 md:py-24 lg:py-32 bg-slate-50">
        <div className={CONTAINER}>
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
                <div className="group rounded-2xl border border-slate-200 bg-white p-5 md:p-6 hover:border-orange-200 hover:shadow-md transition-all duration-300">
                  <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mb-5 shadow-sm shadow-orange-200 group-hover:scale-105 transition-transform duration-300">
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

      {/* ══ SEGURANÇA ═══════════════════════════════════════════════════════ */}
      <section id="seguranca" className="py-16 md:py-24 lg:py-32 bg-white">
        <div className={CONTAINER}>
          <SectionHeader
            label="Segurança"
            title="Seguro, confiável e pronto para usar"
            subtitle="Sem instalação. Sem complicação. Começa a funcionar no primeiro dia."
            align="center"
          />
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5 md:gap-6 lg:gap-8">
            {[
              { icon: Cloud, title: '100% online', desc: 'Sem instalar nada' },
              { icon: Smartphone, title: 'Celular e computador', desc: 'Qualquer dispositivo' },
              { icon: Shield, title: 'Dados protegidos', desc: 'Criptografia total' },
              { icon: RotateCcw, title: 'Backup automático', desc: 'Nuvem em tempo real' },
              { icon: Zap, title: 'Interface simples', desc: 'Pronto no primeiro dia' },
            ].map((item, i) => (
              <Fade key={i} delay={i * 55}>
                <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 text-center hover:border-orange-200 transition-colors h-full">
                  <div className="w-11 h-11 bg-orange-50 border border-orange-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                    <item.icon className="w-5 h-5 text-orange-500" />
                  </div>
                  <h3 className="text-slate-900 font-bold text-sm mb-1.5">{item.title}</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">{item.desc}</p>
                </div>
              </Fade>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA FINAL — fundo escuro ═════════════════════════════════════════ */}
      <section className="py-16 md:py-24 lg:py-32 bg-slate-950">
        <div className={cn(CONTAINER, 'text-center')}>
          <Fade>
            <div className="mx-auto max-w-3xl">
              <div className="w-14 h-1 bg-orange-500 rounded-full mx-auto mb-10 md:mb-14" />
              <h2 className="font-black text-white leading-tight mb-6"
                style={{ fontSize: 'clamp(1.9rem, 3.8vw, 3.25rem)' }}>
                Pare de perder clientes<br />
                para o esquecimento.
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed mb-12 max-w-xl mx-auto">
                Comece hoje a transformar{' '}
                <span className="text-slate-200 font-semibold">manutenção em relacionamento</span>{' '}
                e relacionamento em{' '}
                <span className="text-slate-200 font-semibold">faturamento.</span>
              </p>
              <CTALink href="/cadastro" label="Quero testar grátis" source={`${source}_cta_final`} className="py-4 px-12 text-base" />
              <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mt-10">
                {['14 dias grátis', 'Sem cartão', 'Cancele quando quiser', 'Suporte em português'].map(t => (
                  <span key={t} className="flex items-center gap-1.5 text-sm text-slate-400 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </Fade>
        </div>
      </section>

      {/* ══ FOOTER ══════════════════════════════════════════════════════════ */}
      <footer className="py-8 bg-white border-t border-slate-200">
        <div className={cn(CONTAINER, 'flex flex-col md:flex-row items-center justify-between gap-6')}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <Wrench className="w-4 h-4 text-white" />
            </div>
            <span className="text-slate-900 font-bold">Motor em Dia</span>
          </div>
          <p className="text-slate-400 text-sm">© 2025 Motor em Dia. Todos os direitos reservados.</p>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <Link href="/login" className="hover:text-slate-800 transition-colors">Entrar</Link>
            <Link href="/cadastro" className="hover:text-slate-800 transition-colors font-medium text-orange-600">
              Criar conta grátis
            </Link>
          </div>
        </div>
      </footer>

      {/* ══ CTA FLUTUANTE MOBILE ════════════════════════════════════════════ */}
      <div className={cn(
        'md:hidden fixed bottom-0 inset-x-0 z-40 transition-all duration-300',
        showFloatingCTA ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      )}>
        <div className="bg-white border-t border-slate-200 shadow-2xl px-5 py-4">
          <CTALink href="/cadastro" label="Quero ver funcionando" source={`${source}_floating_mobile`} className="w-full py-4 px-6 text-base" />
        </div>
      </div>
    </div>
  );
}
