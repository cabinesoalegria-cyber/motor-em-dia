'use client';

/**
 * Landing page do Motor em Dia
 * Portada do Lovable (motor-em-dia-hub/src/routes/index.tsx).
 *
 * Adaptações técnicas aplicadas:
 *  1. createFileRoute removido → export default function
 *  2. PrimaryButton/SecondaryButton (button) → PrimaryLink/SecondaryLink (next/link)
 *  3. hrefs: #login → /login | #signup → /cadastro
 *  4. Classes Lovable customizadas → equivalentes Tailwind v4 padrão:
 *       bg-background   → bg-white
 *       bg-surface      → bg-gray-50
 *       bg-surface-alt  → bg-gray-100
 *       bg-card         → bg-white
 *       bg-ink          → bg-gray-900
 *       text-ink        → text-gray-900
 *       text-ink-soft   → text-gray-500
 *       text-primary    → text-orange-500
 *       bg-primary      → bg-orange-500
 *       border-border   → border-gray-200
 *       from-surface    → from-gray-50
 *       to-background   → to-white
 *       bg-primary/N    → bg-orange-500/N
 *       accent-primary  → accent-orange-500
 *  5. shadow-orange / shadow-elevated → inline style
 *  6. shadow-soft / shadow-card → lovable.css (.med-ld)
 *  7. font-display → lovable.css via --font-pjs (Plus Jakarta Sans)
 */

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  Bell,
  Car,
  FileText,
  Wallet,
  MessageCircle,
  ShieldCheck,
  Smartphone,
  Cloud,
  MonitorSmartphone,
  Sparkles,
  Check,
  ArrowRight,
  AlertTriangle,
  Clock,
  Droplet,
  History,
  UserX,
  FolderX,
  MessagesSquare,
  ClipboardList,
  CalendarClock,
  Send,
  TrendingUp,
  Users,
  Wrench,
  PieChart,
  LayoutDashboard,
} from 'lucide-react';

/* ── Inline style constants (Lovable custom shadows) ───────────────────── */
const SHADOW_ORANGE   = { boxShadow: '0 12px 30px -10px rgb(234 88 12 / 0.45)' } as const;
const SHADOW_ELEVATED = { boxShadow: '0 24px 60px -24px rgb(15 23 42 / 0.18), 0 8px 20px -10px rgb(234 88 12 / 0.18)' } as const;
const SHADOW_CARD     = { boxShadow: '0 4px 16px -4px rgb(15 23 42 / 0.06), 0 2px 6px -2px rgb(15 23 42 / 0.04)' } as const;

/* ── Sub-components ────────────────────────────────────────────────────── */

function Container({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`mx-auto w-full max-w-6xl px-5 sm:px-8 ${className}`}>{children}</div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-orange-500">
      <Sparkles className="h-3.5 w-3.5" />
      {children}
    </span>
  );
}

function PrimaryLink({
  children,
  className = '',
  href = '/cadastro',
}: {
  children: React.ReactNode;
  className?: string;
  href?: string;
}) {
  return (
    <Link
      href={href}
      style={SHADOW_ORANGE}
      className={`inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-orange-600 hover:-translate-y-0.5 ${className}`}
    >
      {children}
    </Link>
  );
}

function SecondaryLink({
  children,
  className = '',
  href = '/cadastro',
}: {
  children: React.ReactNode;
  className?: string;
  href?: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3.5 text-sm font-semibold text-gray-900 transition-all hover:border-gray-900/30 hover:bg-gray-50 ${className}`}
    >
      {children}
    </Link>
  );
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-gray-200 bg-white p-6 shadow-soft transition-all hover:shadow-card ${className}`}>
      {children}
    </div>
  );
}

function IconBadge({ children, tone = 'primary' }: { children: React.ReactNode; tone?: 'primary' | 'ink' }) {
  const cls =
    tone === 'primary'
      ? 'bg-orange-500/10 text-orange-500'
      : 'bg-gray-900/5 text-gray-900';
  return (
    <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${cls}`}>
      {children}
    </div>
  );
}

/* ── Main export ───────────────────────────────────────────────────────── */

export default function LandingPageContent({ source = 'landing' }: { source?: string }) {
  return (
    <div className="med-ld min-h-screen bg-white text-gray-900">
      <Header />
      <Hero />
      <FeatureBar />
      <ProblemSection />
      <SolutionSection />
      <BenefitsSection />
      <CalculatorSection />
      <SystemSection />
      <SecuritySection />
      <FinalCTA />
      <Footer />
    </div>
  );
}

/* ── Header ────────────────────────────────────────────────────────────── */

function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-200/70 bg-white/85 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <a href="#" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-orange-500 text-white">
            <Wrench className="h-[1.125rem] w-[1.125rem]" strokeWidth={2.5} />
          </div>
          <span className="font-display text-lg font-bold text-gray-900">Motor em Dia</span>
        </a>
        <nav className="hidden items-center gap-7 text-sm font-medium text-gray-500 md:flex">
          <a href="#problema" className="hover:text-gray-900">Problema</a>
          <a href="#solucao"  className="hover:text-gray-900">Solução</a>
          <a href="#beneficios" className="hover:text-gray-900">Benefícios</a>
          <a href="#sistema" className="hover:text-gray-900">O Sistema</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login" className="hidden text-sm font-semibold text-gray-900 hover:text-orange-500 sm:inline">
            Entrar
          </Link>
          <PrimaryLink className="px-4 py-2.5 text-xs">Teste 14 dias grátis</PrimaryLink>
        </div>
      </Container>
    </header>
  );
}

/* ── Hero ──────────────────────────────────────────────────────────────── */

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-gray-200 bg-gradient-to-b from-gray-50 to-white py-10 lg:py-16">
      <div className="pointer-events-none absolute -top-32 right-0 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl" />
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          <div>
            <SectionLabel>Sistema para oficinas mecânicas</SectionLabel>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] text-gray-900 sm:text-5xl lg:text-[3.4rem]">
              Nunca mais perca uma{' '}
              <span className="relative inline-block">
                <span className="relative z-10 text-orange-500">revisão</span>
                <span className="absolute inset-x-0 bottom-1 z-0 h-3 bg-orange-500/20" />
              </span>{' '}
              por esquecimento.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-gray-500">
              Transforme cada serviço em cliente recorrente, com lembretes automáticos, histórico
              organizado e ordens de serviço digitais.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <PrimaryLink>
                Teste grátis por 14 dias <ArrowRight className="h-4 w-4" />
              </PrimaryLink>
              <SecondaryLink>Quero ver funcionando</SecondaryLink>
            </div>
            <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
              {['14 dias grátis', 'Sem cartão de crédito', 'Cancelamento a qualquer momento'].map((t) => (
                <li key={t} className="inline-flex items-center gap-2">
                  <Check className="h-4 w-4 text-orange-500" strokeWidth={3} />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <HeroMockup />
        </div>
      </Container>
    </section>
  );
}

/* ── Hero Mockup ───────────────────────────────────────────────────────── */

function HeroMockup() {
  return (
    <div className="relative">
      <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-orange-500/20 via-orange-500/5 to-transparent blur-2xl" />
      <div className="relative rounded-2xl border border-gray-200 bg-white p-5" style={SHADOW_ELEVATED}>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-gray-500">Dashboard</div>
            <div className="font-display text-lg font-bold text-gray-900">Motor em Dia</div>
          </div>
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-gray-100" />
            <span className="h-2.5 w-2.5 rounded-full bg-gray-100" />
            <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { l: 'OS abertas',    v: '24',     i: ClipboardList },
            { l: 'Revisões hoje', v: '08',     i: CalendarClock },
            { l: 'Faturamento',   v: 'R$ 38k', i: TrendingUp    },
          ].map(({ l, v, i: Icon }) => (
            <div key={l} className="rounded-xl border border-gray-200 bg-gray-50 p-3">
              <Icon className="mb-2 h-4 w-4 text-orange-500" />
              <div className="text-xs text-gray-500">{l}</div>
              <div className="text-lg font-bold text-gray-900">{v}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-900">Lembretes de hoje</span>
            <span className="text-xs text-gray-500">5 clientes</span>
          </div>
          <div className="space-y-2.5">
            {[
              { n: 'João Pereira', c: 'Honda Civic • Troca de óleo',    k: 'ABC-1234' },
              { n: 'Maria Santos', c: 'VW Gol • Revisão 20.000 km',     k: 'DEF-5678' },
              { n: 'Carlos Lima',  c: 'Toyota Corolla • Alinhamento',   k: 'GHI-9012' },
            ].map((r) => (
              <div key={r.k} className="flex items-center justify-between rounded-lg bg-white px-3 py-2.5 shadow-soft">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-gray-900">{r.n}</div>
                  <div className="truncate text-xs text-gray-500">{r.c}</div>
                </div>
                <button className="inline-flex shrink-0 items-center gap-1 rounded-md bg-orange-500/10 px-2.5 py-1 text-xs font-semibold text-orange-500">
                  <Send className="h-3 w-3" /> Avisar
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* WhatsApp badge */}
      <div
        className="absolute -bottom-5 -left-5 hidden rounded-xl border border-gray-200 bg-white px-4 py-3 md:flex md:items-center md:gap-3"
        style={SHADOW_CARD}
      >
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-500/10 text-emerald-600">
          <MessageCircle className="h-4 w-4" />
        </div>
        <div>
          <div className="text-xs text-gray-500">WhatsApp enviado</div>
          <div className="text-sm font-semibold text-gray-900">+248 esta semana</div>
        </div>
      </div>
    </div>
  );
}

/* ── Feature Bar ───────────────────────────────────────────────────────── */

function FeatureBar() {
  const items = [
    { i: Bell,          t: 'Lembretes automáticos' },
    { i: History,       t: 'Histórico de veículos'  },
    { i: FileText,      t: 'OS digitais'             },
    { i: MessageCircle, t: 'WhatsApp integrado'      },
    { i: LayoutDashboard, t: 'Dashboard gerencial'   },
    { i: Wallet,        t: 'Controle financeiro'     },
  ];
  return (
    <section className="border-b border-gray-200 bg-white py-8">
      <Container>
        <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3 lg:grid-cols-6">
          {items.map(({ i: Icon, t }) => (
            <div key={t} className="flex items-center gap-2.5 text-sm font-medium text-gray-500">
              <Icon className="h-5 w-5 shrink-0 text-orange-500" />
              <span>{t}</span>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ── O Problema ────────────────────────────────────────────────────────── */

function ProblemSection() {
  const cards = [
    { i: Clock,          t: 'Revisões esquecidas',         d: 'O cliente promete "passar semana que vem" e nunca mais volta. Sem um lembrete, ele simplesmente esquece.' },
    { i: Droplet,        t: 'Trocas de óleo perdidas',     d: 'A troca de óleo é o serviço mais recorrente. Cada troca esquecida é dinheiro direto na mesa do concorrente.' },
    { i: AlertTriangle,  t: 'Falta de acompanhamento',     d: 'Sem acompanhar o histórico do veículo, sua oficina perde oportunidades de oferecer serviços preventivos no momento certo.' },
    { i: UserX,          t: 'Clientes que nunca retornam', d: 'Conquistar um novo cliente custa de 5 a 7 vezes mais do que manter um. Você está perdendo dinheiro na retenção.' },
    { i: FolderX,        t: 'Histórico desorganizado',     d: 'Informações em papel, caderno ou memória do mecânico. Quando alguém sai, o histórico vai junto.' },
    { i: MessagesSquare, t: 'WhatsApp virou bagunça',      d: 'Clientes, fornecedores, família — tudo misturado. Impossível acompanhar quem precisa retornar e quando.' },
  ];
  return (
    <section id="problema" className="bg-gray-50 py-16 lg:py-20">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <SectionLabel>O problema</SectionLabel>
          <h2 className="mt-4 text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Quantos clientes sua oficina já perdeu por esquecimento?
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Esses problemas custam dinheiro — e a maioria dos donos de oficina não percebe porque a perda é silenciosa.
          </p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map(({ i: Icon, t, d }) => (
            <Card key={t}>
              <IconBadge tone="ink"><Icon className="h-5 w-5" /></IconBadge>
              <h3 className="text-lg font-bold text-gray-900">{t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">{d}</p>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ── A Solução ─────────────────────────────────────────────────────────── */

function SolutionSection() {
  const steps = [
    { i: Car,          t: 'Cadastro do veículo',      d: 'Cliente, carro e quilometragem registrados em 2 minutos. Histórico centralizado para sempre.' },
    { i: ClipboardList,t: 'Registro da manutenção',   d: 'OS criada, serviços e próximo prazo de retorno definidos com precisão.' },
    { i: Bell,         t: 'Lembrete automático',      d: 'O sistema avisa quando o cliente precisa voltar — por data, quilometragem ou tipo de serviço.' },
    { i: TrendingUp,   t: 'Retorno e fidelização',    d: 'Sua oficina chama o cliente na hora certa e aumenta o faturamento sem depender de novos anúncios.' },
  ];
  return (
    <section id="solucao" className="bg-white py-16 lg:py-20">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <SectionLabel>A solução</SectionLabel>
          <h2 className="mt-4 text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Seu sistema de acompanhamento automático
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Um fluxo simples que transforma cada serviço realizado em uma oportunidade de retorno garantido.
          </p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ i: Icon, t, d }, idx) => (
            <Card key={t} className="relative">
              <span className="absolute right-5 top-5 font-display text-3xl font-extrabold text-orange-500/15">
                0{idx + 1}
              </span>
              <IconBadge><Icon className="h-5 w-5" /></IconBadge>
              <h3 className="text-lg font-bold text-gray-900">{t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">{d}</p>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ── Benefícios ────────────────────────────────────────────────────────── */

function BenefitsSection() {
  const cards = [
    { i: Users,          t: 'Mais clientes retornando', d: 'Clientes avisados no momento certo voltam mais. Não tem segredo: comunicação = fidelização.' },
    { i: TrendingUp,     t: 'Faturamento recorrente',   d: 'Cada cliente fidelizado gera receita previsível todo mês, sem depender de novos anúncios.' },
    { i: Bell,           t: 'Menos esquecimentos',      d: 'O sistema lembra por você. Nenhum cliente cai no esquecimento por falta de atenção.' },
    { i: Sparkles,       t: 'Atendimento profissional', d: 'Histórico completo, OS digital e comunicação organizada. Seu cliente percebe a diferença.' },
    { i: History,        t: 'Histórico organizado',     d: 'Cada carro, cada serviço, cada troca — na nuvem, acessível de qualquer lugar, para sempre.' },
    { i: LayoutDashboard,t: 'Gestão mais eficiente',    d: 'Dashboard completo: OS abertas, revisões próximas e faturamento do mês em uma tela só.' },
  ];
  return (
    <section id="beneficios" className="bg-gray-50 py-16 lg:py-20">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <SectionLabel>Benefícios</SectionLabel>
          <h2 className="mt-4 text-3xl font-extrabold text-gray-900 sm:text-4xl">
            O que muda na sua oficina a partir do primeiro mês
          </h2>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map(({ i: Icon, t, d }) => (
            <Card key={t}>
              <IconBadge><Icon className="h-5 w-5" /></IconBadge>
              <h3 className="text-lg font-bold text-gray-900">{t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">{d}</p>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ── Calculadora ───────────────────────────────────────────────────────── */

function CalculatorSection() {
  const [clients, setClients] = useState(120);
  const [ticket,  setTicket]  = useState(450);
  const [pct,     setPct]     = useState(40);

  const lost   = useMemo(() => Math.round((clients * ticket * pct) / 100), [clients, ticket, pct]);
  const yearly = lost * 12;
  const fmt    = (n: number) =>
    n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

  return (
    <section id="calculadora" className="bg-white py-16 lg:py-20">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <SectionLabel>Calculadora</SectionLabel>
          <h2 className="mt-4 text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Calcule quanto faturamento você está perdendo agora
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Ajuste os valores e veja a projeção de faturamento que pode ser recuperado com lembretes automáticos.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          {/* Sliders */}
          <Card className="p-7">
            <div className="space-y-7">
              <Field label="Clientes por mês"                value={clients} suffix="clientes" min={10}  max={500}  step={10}  onChange={setClients} />
              <Field label="Ticket médio"                    value={ticket}  prefix="R$"        min={50}  max={2000} step={50}  onChange={setTicket} />
              <Field label="% de clientes que não retornam" value={pct}     suffix="%"          min={5}   max={90}   step={5}   onChange={setPct} />
            </div>
          </Card>

          {/* Result */}
          <div
            className="relative overflow-hidden rounded-2xl bg-gray-900 p-7 text-white"
            style={SHADOW_ELEVATED}
          >
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-orange-500/30 blur-3xl" />
            <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                <PieChart className="h-3.5 w-3.5" /> Estimativa
              </span>
              <p className="mt-5 text-sm text-white/70">Faturamento perdido por mês</p>
              <p className="mt-2 font-display text-5xl font-extrabold text-orange-400">{fmt(lost)}</p>
              <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-white/70">Em 12 meses</p>
                <p className="mt-1 font-display text-2xl font-bold">{fmt(yearly)}</p>
              </div>
              <p className="mt-5 text-sm leading-relaxed text-white/70">
                Com lembretes automáticos, boa parte desse valor volta a entrar no caixa todo mês.
              </p>
              <PrimaryLink className="mt-6 w-full">Quero recuperar esse faturamento</PrimaryLink>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function Field({
  label, value, onChange, min, max, step, prefix, suffix,
}: {
  label: string; value: number; onChange: (n: number) => void;
  min: number; max: number; step: number; prefix?: string; suffix?: string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="text-sm font-semibold text-gray-900">{label}</label>
        <span className="rounded-lg bg-gray-50 px-3 py-1 text-sm font-bold text-gray-900">
          {prefix ? `${prefix} ` : ''}{value.toLocaleString('pt-BR')}{suffix ? ` ${suffix}` : ''}
        </span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-100 accent-orange-500"
      />
      <div className="mt-1 flex justify-between text-xs text-gray-500">
        <span>{prefix ? `${prefix} ` : ''}{min}{suffix ? ` ${suffix}` : ''}</span>
        <span>{prefix ? `${prefix} ` : ''}{max}{suffix ? ` ${suffix}` : ''}</span>
      </div>
    </div>
  );
}

/* ── O Sistema ─────────────────────────────────────────────────────────── */

function SystemSection() {
  const modules = [
    { i: Users,          t: 'Clientes e veículos',          d: 'Cadastro completo e centralizado.' },
    { i: FileText,       t: 'Ordens de serviço digitais',   d: 'OS criadas e assinadas em segundos.' },
    { i: CalendarClock,  t: 'Revisões futuras',             d: 'Agenda inteligente de retornos.' },
    { i: History,        t: 'Histórico completo',           d: 'Todo serviço de cada veículo, sempre.' },
    { i: Wallet,         t: 'Controle financeiro',          d: 'Receitas, despesas e faturamento em ordem.' },
    { i: LayoutDashboard,t: 'Dashboard gerencial',          d: 'A oficina inteira em uma tela só.' },
  ];
  return (
    <section id="sistema" className="bg-gray-50 py-16 lg:py-20">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <SectionLabel>O sistema</SectionLabel>
          <h2 className="mt-4 text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Tudo o que sua oficina precisa em um só lugar
          </h2>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map(({ i: Icon, t, d }) => (
            <Card key={t} className="flex items-start gap-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-orange-500/10 text-orange-500">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-gray-900">{t}</h3>
                <p className="mt-1 text-sm text-gray-500">{d}</p>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ── Segurança ─────────────────────────────────────────────────────────── */

function SecuritySection() {
  const cards = [
    { i: Cloud,             t: '100% online',          d: 'Sem instalar nada'     },
    { i: MonitorSmartphone, t: 'Celular e computador', d: 'Qualquer dispositivo'  },
    { i: ShieldCheck,       t: 'Dados protegidos',     d: 'Criptografia total'    },
    { i: Smartphone,        t: 'Backup automático',    d: 'Nuvem em tempo real'   },
    { i: Sparkles,          t: 'Interface simples',    d: 'Pronto no primeiro dia' },
  ];
  return (
    <section className="bg-white py-16 lg:py-20">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <SectionLabel>Segurança</SectionLabel>
          <h2 className="mt-4 text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Seguro, confiável e pronto para usar
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Sem instalação. Sem complicação. Começa a funcionar no primeiro dia.
          </p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {cards.map(({ i: Icon, t, d }) => (
            <Card key={t} className="text-center">
              <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl bg-orange-500/10 text-orange-500">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900">{t}</h3>
              <p className="mt-1 text-sm text-gray-500">{d}</p>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ── CTA Final ─────────────────────────────────────────────────────────── */

function FinalCTA() {
  return (
    <section className="bg-gray-50 py-16 lg:py-20">
      <Container>
        <div
          className="relative overflow-hidden rounded-3xl bg-gray-900 px-7 py-14 text-center text-white sm:px-12 lg:py-20"
          style={SHADOW_ELEVATED}
        >
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
              <PrimaryLink className="px-8 py-4 text-base">
                Quero testar grátis <ArrowRight className="h-4 w-4" />
              </PrimaryLink>
            </div>
            <ul className="mt-7 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-white/70">
              {['14 dias grátis', 'Sem cartão', 'Cancele quando quiser', 'Suporte em português'].map((t) => (
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
  );
}

/* ── Footer ────────────────────────────────────────────────────────────── */

function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white py-8">
      <Container className="flex flex-col items-center justify-between gap-5 sm:flex-row">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-orange-500 text-white">
            <Wrench className="h-4 w-4" strokeWidth={2.5} />
          </div>
          <span className="text-sm text-gray-500">© 2026 Motor em Dia. Todos os direitos reservados.</span>
        </div>
        <div className="flex items-center gap-6 text-sm font-medium text-gray-900">
          <Link href="/login"    className="hover:text-orange-500">Entrar</Link>
          <Link href="/cadastro" className="hover:text-orange-500">Criar conta grátis</Link>
        </div>
      </Container>
    </footer>
  );
}
