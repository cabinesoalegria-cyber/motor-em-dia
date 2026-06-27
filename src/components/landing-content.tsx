'use client';

/**
 * Landing page do Motor em Dia
 * Portada do repositório Lovable (motor-em-dia-hub) para Next.js.
 * Design tokens mapeados para Tailwind. Links adaptados para Next.js Link.
 */

import Link from 'next/link';
import { useState, useMemo } from 'react';
import {
  Bell,
  Car,
  FileText,
  BarChart3,
  DollarSign,
  MessageSquare,
  ShieldCheck,
  Smartphone,
  Cloud,
  Sparkles,
  Check,
  ArrowRight,
  AlertTriangle,
  Clock,
  History,
  Users,
  Wrench,
  PieChart,
  LayoutDashboard,
  ClipboardList,
  TrendingUp,
  Send,
  Menu,
  X,
  UserMinus,
  FolderOpen,
  Droplets,
} from 'lucide-react';
import { trackEvent } from '@/components/analytics';

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
function cn(...cls: (string | boolean | undefined)[]) {
  return cls.filter(Boolean).join(' ');
}

/* ─── Container padrão do Lovable ────────────────────────────────────────── */
function Container({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('mx-auto w-full max-w-6xl px-5 sm:px-8', className)}>
      {children}
    </div>
  );
}

/* ─── Section label pill ─────────────────────────────────────────────────── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-orange-600">
      <Sparkles className="h-3.5 w-3.5" />
      {children}
    </span>
  );
}

/* ─── CTA Buttons ────────────────────────────────────────────────────────── */
function PrimaryLink({
  href, children, className = '', source = '',
}: {
  href: string; children: React.ReactNode; className?: string; source?: string;
}) {
  return (
    <Link
      href={href}
      onClick={() => trackEvent('cta_click', { source })}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3.5 text-sm font-semibold text-white',
        'shadow-[0_12px_30px_-10px_rgba(234,88,12,0.45)]',
        'transition-all hover:bg-orange-600 hover:-translate-y-0.5',
        className,
      )}
    >
      {children}
    </Link>
  );
}

function SecondaryLink({
  href, children, className = '',
}: {
  href: string; children: React.ReactNode; className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-900',
        'transition-all hover:border-slate-300 hover:bg-slate-50',
        className,
      )}
    >
      {children}
    </Link>
  );
}

/* ─── Card ───────────────────────────────────────────────────────────────── */
function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn(
      'rounded-2xl border border-slate-200 bg-white p-6',
      'shadow-[0_1px_3px_0_rgba(15,23,42,0.06)]',
      'transition-all hover:shadow-[0_4px_16px_-4px_rgba(15,23,42,0.08)]',
      className,
    )}>
      {children}
    </div>
  );
}

/* ─── Icon Badge ─────────────────────────────────────────────────────────── */
function IconBadge({
  children, tone = 'primary',
}: {
  children: React.ReactNode; tone?: 'primary' | 'ink';
}) {
  const cls = tone === 'primary'
    ? 'bg-orange-500/10 text-orange-500'
    : 'bg-slate-900/5 text-slate-700';
  return (
    <div className={cn('mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl', cls)}>
      {children}
    </div>
  );
}

/* ─── Calculator Field ───────────────────────────────────────────────────── */
function Field({
  label, value, onChange, min, max, step, prefix, suffix,
}: {
  label: string; value: number; onChange: (n: number) => void;
  min: number; max: number; step: number; prefix?: string; suffix?: string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-900">{label}</label>
        <span className="rounded-lg bg-slate-50 px-3 py-1 text-sm font-bold text-slate-900">
          {prefix ? `${prefix} ` : ''}{value.toLocaleString('pt-BR')}{suffix ? ` ${suffix}` : ''}
        </span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-orange-500"
      />
      <div className="mt-1 flex justify-between text-xs text-slate-400">
        <span>{prefix ? `${prefix} ` : ''}{min}{suffix ? ` ${suffix}` : ''}</span>
        <span>{prefix ? `${prefix} ` : ''}{max}{suffix ? ` ${suffix}` : ''}</span>
      </div>
    </div>
  );
}

/* ─── Hero Mockup ────────────────────────────────────────────────────────── */
function HeroMockup() {
  return (
    <div className="relative">
      {/* Glow */}
      <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-orange-500/20 via-orange-500/5 to-transparent blur-2xl" />

      {/* Dashboard card */}
      <div className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_24px_60px_-24px_rgba(15,23,42,0.18)]">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Dashboard</div>
            <div className="text-lg font-bold text-slate-900">Motor em Dia</div>
          </div>
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-100" />
            <span className="h-2.5 w-2.5 rounded-full bg-slate-100" />
            <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { l: 'OS abertas', v: '24', i: ClipboardList },
            { l: 'Revisões hoje', v: '08', i: Clock },
            { l: 'Faturamento', v: 'R$ 38k', i: TrendingUp },
          ].map(({ l, v, i: Icon }) => (
            <div key={l} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
              <Icon className="mb-2 h-4 w-4 text-orange-500" />
              <div className="text-xs text-slate-500">{l}</div>
              <div className="text-lg font-bold text-slate-900">{v}</div>
            </div>
          ))}
        </div>

        {/* Reminders */}
        <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-900">Lembretes de hoje</span>
            <span className="text-xs text-slate-400">5 clientes</span>
          </div>
          <div className="space-y-2.5">
            {[
              { n: 'João Pereira', c: 'Honda Civic • Troca de óleo', k: 'ABC-1234' },
              { n: 'Maria Santos', c: 'VW Gol • Revisão 20.000 km', k: 'DEF-5678' },
              { n: 'Carlos Lima', c: 'Toyota Corolla • Alinhamento', k: 'GHI-9012' },
            ].map(r => (
              <div key={r.k} className="flex items-center justify-between rounded-lg bg-white px-3 py-2.5 shadow-sm">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-slate-900">{r.n}</div>
                  <div className="truncate text-xs text-slate-400">{r.c}</div>
                </div>
                <button className="inline-flex shrink-0 items-center gap-1 rounded-md bg-orange-500/10 px-2.5 py-1 text-xs font-semibold text-orange-600">
                  <Send className="h-3 w-3" /> Avisar
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* WhatsApp badge */}
      <div className="absolute -bottom-5 -left-5 hidden rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-md md:flex md:items-center md:gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-500/10 text-emerald-600">
          <MessageSquare className="h-4 w-4" />
        </div>
        <div>
          <div className="text-xs text-slate-400">WhatsApp enviado</div>
          <div className="text-sm font-semibold text-slate-900">+248 esta semana</div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────────── */
export default function LandingPageContent({ source = 'landing' }: { source?: string }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased"
      style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur">
        <Container className="flex h-16 items-center justify-between">
          <Link href="/landing" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-orange-500 text-white">
              <Wrench className="h-4.5 w-4.5" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-bold text-slate-900">Motor em Dia</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-7 text-sm font-medium text-slate-500 md:flex">
            <a href="#problema" className="hover:text-slate-900">Problema</a>
            <a href="#solucao" className="hover:text-slate-900">Solução</a>
            <a href="#beneficios" className="hover:text-slate-900">Benefícios</a>
            <a href="#sistema" className="hover:text-slate-900">O Sistema</a>
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden text-sm font-semibold text-slate-700 hover:text-orange-500 sm:inline">
              Entrar
            </Link>
            <PrimaryLink href="/cadastro" source={`${source}_nav`} className="px-4 py-2.5 text-xs">
              Teste 14 dias grátis
            </PrimaryLink>
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="p-2 text-slate-500 md:hidden"
              aria-label="Menu"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </Container>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="border-t border-slate-200 bg-white shadow-lg md:hidden">
            <Container className="py-4">
              {[['Problema', '#problema'], ['Solução', '#solucao'], ['Benefícios', '#beneficios'], ['O Sistema', '#sistema']].map(([label, href]) => (
                <a key={href} href={href}
                  onClick={() => setMenuOpen(false)}
                  className="block border-b border-slate-100 py-3 text-sm font-medium text-slate-700 last:border-0">
                  {label}
                </a>
              ))}
              <div className="mt-4 space-y-3">
                <Link href="/login" onClick={() => setMenuOpen(false)}
                  className="block py-3 text-center text-sm font-medium text-slate-500">
                  Entrar
                </Link>
                <PrimaryLink href="/cadastro" source={`${source}_mobile_menu`} className="w-full py-3.5 px-6">
                  Teste 14 dias grátis
                </PrimaryLink>
              </div>
            </Container>
          </div>
        )}
      </header>

      {/* ── HERO ───────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-slate-50 to-white py-12 lg:py-20">
        <div className="pointer-events-none absolute -top-32 right-0 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl" />
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
            {/* Copy */}
            <div>
              <SectionLabel>Sistema para oficinas mecânicas</SectionLabel>
              <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] text-slate-900 sm:text-5xl lg:text-[3.4rem]">
                Nunca mais perca uma{' '}
                <span className="relative inline-block">
                  <span className="relative z-10 text-orange-500">revisão</span>
                  <span className="absolute inset-x-0 bottom-1 z-0 h-3 bg-orange-500/20" />
                </span>{' '}
                por esquecimento.
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-500">
                Transforme cada serviço em cliente recorrente, com lembretes automáticos, histórico
                organizado e ordens de serviço digitais.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <PrimaryLink href="/cadastro" source={`${source}_hero_primary`}>
                  Teste grátis por 14 dias <ArrowRight className="h-4 w-4" />
                </PrimaryLink>
                <SecondaryLink href="/cadastro">
                  Quero ver funcionando
                </SecondaryLink>
              </div>
              <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
                {['14 dias grátis', 'Sem cartão de crédito', 'Cancelamento a qualquer momento'].map(t => (
                  <li key={t} className="inline-flex items-center gap-2">
                    <Check className="h-4 w-4 text-orange-500" strokeWidth={3} />
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            {/* Mockup */}
            <div className="hidden lg:block">
              <HeroMockup />
            </div>
          </div>
        </Container>
      </section>

      {/* ── FEATURE BAR ────────────────────────────────────────────────── */}
      <section className="border-b border-slate-200 bg-white py-8">
        <Container>
          <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3 lg:grid-cols-6">
            {[
              { i: Bell, t: 'Lembretes automáticos' },
              { i: History, t: 'Histórico de veículos' },
              { i: FileText, t: 'OS digitais' },
              { i: MessageSquare, t: 'WhatsApp integrado' },
              { i: LayoutDashboard, t: 'Dashboard gerencial' },
              { i: DollarSign, t: 'Controle financeiro' },
            ].map(({ i: Icon, t }) => (
              <div key={t} className="flex items-center gap-2.5 text-sm font-medium text-slate-500">
                <Icon className="h-5 w-5 shrink-0 text-orange-500" />
                <span>{t}</span>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── O PROBLEMA ─────────────────────────────────────────────────── */}
      <section id="problema" className="bg-slate-50 py-16 lg:py-20">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <SectionLabel>O problema</SectionLabel>
            <h2 className="mt-4 text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Quantos clientes sua oficina já perdeu por esquecimento?
            </h2>
            <p className="mt-4 text-lg text-slate-500">
              Esses problemas custam dinheiro — e a maioria dos donos de oficina não percebe porque a perda é silenciosa.
            </p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { i: Clock, t: 'Revisões esquecidas', d: 'O cliente promete "passar semana que vem" e nunca mais volta. Sem um lembrete, ele simplesmente esquece.' },
              { i: Droplets, t: 'Trocas de óleo perdidas', d: 'A troca de óleo é o serviço mais recorrente. Cada troca esquecida é dinheiro direto na mesa do concorrente.' },
              { i: AlertTriangle, t: 'Falta de acompanhamento', d: 'Sem acompanhar o histórico do veículo, sua oficina perde oportunidades de oferecer serviços preventivos no momento certo.' },
              { i: UserMinus, t: 'Clientes que nunca retornam', d: 'Conquistar um novo cliente custa de 5 a 7 vezes mais do que manter um. Você está perdendo dinheiro na retenção.' },
              { i: FolderOpen, t: 'Histórico desorganizado', d: 'Informações em papel, caderno ou memória do mecânico. Quando alguém sai, o histórico vai junto.' },
              { i: MessageSquare, t: 'WhatsApp virou bagunça', d: 'Clientes, fornecedores, família — tudo misturado. Impossível acompanhar quem precisa retornar e quando.' },
            ].map(({ i: Icon, t, d }) => (
              <Card key={t}>
                <IconBadge tone="ink"><Icon className="h-5 w-5" /></IconBadge>
                <h3 className="text-lg font-bold text-slate-900">{t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{d}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* ── A SOLUÇÃO ──────────────────────────────────────────────────── */}
      <section id="solucao" className="bg-white py-16 lg:py-20">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <SectionLabel>A solução</SectionLabel>
            <h2 className="mt-4 text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Seu sistema de acompanhamento automático
            </h2>
            <p className="mt-4 text-lg text-slate-500">
              Um fluxo simples que transforma cada serviço realizado em uma oportunidade de retorno garantido.
            </p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {[
              { i: Car, t: 'Cadastro do veículo', d: 'Cliente, carro e quilometragem registrados em 2 minutos. Histórico centralizado para sempre.' },
              { i: ClipboardList, t: 'Registro da manutenção', d: 'OS criada, serviços e próximo prazo de retorno definidos com precisão.' },
              { i: Bell, t: 'Lembrete automático', d: 'O sistema avisa quando o cliente precisa voltar — por data, quilometragem ou tipo de serviço.' },
              { i: TrendingUp, t: 'Retorno e fidelização', d: 'Sua oficina chama o cliente na hora certa e aumenta o faturamento sem depender de novos anúncios.' },
            ].map(({ i: Icon, t, d }, idx) => (
              <Card key={t} className="relative">
                <span className="absolute right-5 top-5 text-3xl font-extrabold text-orange-500/15">
                  0{idx + 1}
                </span>
                <IconBadge><Icon className="h-5 w-5" /></IconBadge>
                <h3 className="text-lg font-bold text-slate-900">{t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{d}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* ── BENEFÍCIOS ─────────────────────────────────────────────────── */}
      <section id="beneficios" className="bg-slate-50 py-16 lg:py-20">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <SectionLabel>Benefícios</SectionLabel>
            <h2 className="mt-4 text-3xl font-extrabold text-slate-900 sm:text-4xl">
              O que muda na sua oficina a partir do primeiro mês
            </h2>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { i: Users, t: 'Mais clientes retornando', d: 'Clientes avisados no momento certo voltam mais. Não tem segredo: comunicação = fidelização.' },
              { i: TrendingUp, t: 'Faturamento recorrente', d: 'Cada cliente fidelizado gera receita previsível todo mês, sem depender de novos anúncios.' },
              { i: Bell, t: 'Menos esquecimentos', d: 'O sistema lembra por você. Nenhum cliente cai no esquecimento por falta de atenção.' },
              { i: Sparkles, t: 'Atendimento profissional', d: 'Histórico completo, OS digital e comunicação organizada. Seu cliente percebe a diferença.' },
              { i: History, t: 'Histórico organizado', d: 'Cada carro, cada serviço, cada troca — na nuvem, acessível de qualquer lugar, para sempre.' },
              { i: LayoutDashboard, t: 'Gestão mais eficiente', d: 'Dashboard completo: OS abertas, revisões próximas e faturamento do mês em uma tela só.' },
            ].map(({ i: Icon, t, d }) => (
              <Card key={t}>
                <IconBadge><Icon className="h-5 w-5" /></IconBadge>
                <h3 className="text-lg font-bold text-slate-900">{t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{d}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* ── CALCULADORA ────────────────────────────────────────────────── */}
      <section id="calculadora" className="bg-white py-16 lg:py-20">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <SectionLabel>Calculadora</SectionLabel>
            <h2 className="mt-4 text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Calcule quanto faturamento você está perdendo agora
            </h2>
            <p className="mt-4 text-lg text-slate-500">
              Ajuste os valores e veja a projeção de faturamento que pode ser recuperado com lembretes automáticos.
            </p>
          </div>
          <CalculatorBlock source={source} />
        </Container>
      </section>

      {/* ── O SISTEMA ──────────────────────────────────────────────────── */}
      <section id="sistema" className="bg-slate-50 py-16 lg:py-20">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <SectionLabel>O sistema</SectionLabel>
            <h2 className="mt-4 text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Tudo o que sua oficina precisa em um só lugar
            </h2>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { i: Users, t: 'Clientes e veículos', d: 'Cadastro completo e centralizado.' },
              { i: FileText, t: 'Ordens de serviço digitais', d: 'OS criadas e assinadas em segundos.' },
              { i: Bell, t: 'Revisões futuras', d: 'Agenda inteligente de retornos.' },
              { i: History, t: 'Histórico completo', d: 'Todo serviço de cada veículo, sempre.' },
              { i: DollarSign, t: 'Controle financeiro', d: 'Receitas, despesas e faturamento em ordem.' },
              { i: LayoutDashboard, t: 'Dashboard gerencial', d: 'A oficina inteira em uma tela só.' },
            ].map(({ i: Icon, t, d }) => (
              <Card key={t} className="flex items-start gap-4">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-orange-500/10 text-orange-500">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-slate-900">{t}</h3>
                  <p className="mt-1 text-sm text-slate-500">{d}</p>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* ── SEGURANÇA ──────────────────────────────────────────────────── */}
      <section id="seguranca" className="bg-white py-16 lg:py-20">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <SectionLabel>Segurança</SectionLabel>
            <h2 className="mt-4 text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Seguro, confiável e pronto para usar
            </h2>
            <p className="mt-4 text-lg text-slate-500">
              Sem instalação. Sem complicação. Começa a funcionar no primeiro dia.
            </p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {[
              { i: Cloud, t: '100% online', d: 'Sem instalar nada' },
              { i: Smartphone, t: 'Celular e computador', d: 'Qualquer dispositivo' },
              { i: ShieldCheck, t: 'Dados protegidos', d: 'Criptografia total' },
              { i: History, t: 'Backup automático', d: 'Nuvem em tempo real' },
              { i: Sparkles, t: 'Interface simples', d: 'Pronto no primeiro dia' },
            ].map(({ i: Icon, t, d }) => (
              <Card key={t} className="text-center">
                <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl bg-orange-500/10 text-orange-500">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">{t}</h3>
                <p className="mt-1 text-sm text-slate-500">{d}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* ── CTA FINAL ──────────────────────────────────────────────────── */}
      <section className="bg-slate-50 py-16 lg:py-20">
        <Container>
          <div className="relative overflow-hidden rounded-3xl bg-slate-900 px-7 py-14 text-center text-white shadow-[0_24px_60px_-24px_rgba(15,23,42,0.4)] sm:px-12 lg:py-20">
            {/* Glows */}
            <div className="pointer-events-none absolute -left-20 top-0 h-72 w-72 rounded-full bg-orange-500/30 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -right-10 h-72 w-72 rounded-full bg-orange-500/20 blur-3xl" />

            <div className="relative mx-auto max-w-2xl">
              <h2 className="text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
                Pare de perder clientes para o esquecimento.
              </h2>
              <p className="mt-5 text-lg text-white/75">
                Comece hoje a transformar manutenção em relacionamento e relacionamento em faturamento.
              </p>
              <div className="mt-8 flex justify-center">
                <PrimaryLink href="/cadastro" source={`${source}_cta_final`} className="px-8 py-4 text-base">
                  Quero testar grátis <ArrowRight className="h-4 w-4" />
                </PrimaryLink>
              </div>
              <ul className="mt-7 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-white/70">
                {['14 dias grátis', 'Sem cartão', 'Cancele quando quiser', 'Suporte em português'].map(t => (
                  <li key={t} className="inline-flex items-center gap-2">
                    <Check className="h-4 w-4 text-orange-500" strokeWidth={3} />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-200 bg-white py-8">
        <Container className="flex flex-col items-center justify-between gap-5 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-orange-500 text-white">
              <Wrench className="h-4 w-4" strokeWidth={2.5} />
            </div>
            <span className="text-sm text-slate-400">© 2026 Motor em Dia. Todos os direitos reservados.</span>
          </div>
          <div className="flex items-center gap-6 text-sm font-medium text-slate-700">
            <Link href="/login" className="hover:text-orange-500">Entrar</Link>
            <Link href="/cadastro" className="hover:text-orange-500">Criar conta grátis</Link>
          </div>
        </Container>
      </footer>
    </div>
  );
}

/* ─── Calculator (extracted to avoid hook-in-loop) ──────────────────────── */
function CalculatorBlock({ source }: { source: string }) {
  const [clients, setClients] = useState(120);
  const [ticket, setTicket] = useState(450);
  const [pct, setPct] = useState(40);

  const lost = useMemo(() => Math.round((clients * ticket * pct) / 100), [clients, ticket, pct]);
  const yearly = lost * 12;

  const fmt = (n: number) =>
    n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

  return (
    <div className="mt-12 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
      <Card className="p-7">
        <div className="space-y-7">
          <Field label="Clientes por mês" value={clients} suffix="clientes" min={10} max={500} step={10} onChange={setClients} />
          <Field label="Ticket médio" value={ticket} prefix="R$" min={50} max={2000} step={50} onChange={setTicket} />
          <Field label="% de clientes que não retornam" value={pct} suffix="%" min={5} max={90} step={5} onChange={setPct} />
        </div>
      </Card>

      <div className="relative overflow-hidden rounded-2xl bg-slate-900 p-7 text-white shadow-[0_24px_60px_-24px_rgba(15,23,42,0.3)]">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-orange-500/30 blur-3xl" />
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
            <PieChart className="h-3.5 w-3.5" /> Estimativa
          </span>
          <p className="mt-5 text-sm text-white/70">Faturamento perdido por mês</p>
          <p className="mt-2 text-5xl font-extrabold text-orange-400">{fmt(lost)}</p>
          <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-white/70">Em 12 meses</p>
            <p className="mt-1 text-2xl font-bold">{fmt(yearly)}</p>
          </div>
          <p className="mt-5 text-sm leading-relaxed text-white/70">
            Com lembretes automáticos, boa parte desse valor volta a entrar no caixa todo mês.
          </p>
          <PrimaryLink
            href="/cadastro"
            source={`${source}_calculator`}
            className="mt-6 w-full"
          >
            Quero recuperar esse faturamento
          </PrimaryLink>
        </div>
      </div>
    </div>
  );
}
