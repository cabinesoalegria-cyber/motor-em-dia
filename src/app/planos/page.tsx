'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import {
  ArrowLeft, MessageCircle, ChevronDown, ChevronLeft, ChevronRight,
  Rocket, Zap, Star, Crown, Check, X, Clock, AlertTriangle,
  Users, Car, ClipboardList, Calendar, Package, DollarSign, BarChart2,
  Wrench, MessageSquare, Shield, TrendingUp, Quote, Headphones, Award,
  CheckCircle2,
} from 'lucide-react';

/* ─── Config ──────────────────────────────────────────────────────────────── */
const WA = '5531971464759';

function waLink(plano: string, oficina?: string) {
  const msg = encodeURIComponent(
    `Olá! Somos da oficina ${oficina ? `*${oficina}*` : 'minha oficina'} e gostaríamos de contratar o plano *${plano}* do Motor em Dia com Desconto. Podem nos ajudar?`
  );
  return `https://wa.me/${WA}?text=${msg}`;
}

function money(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);
}

/* ─── Types ───────────────────────────────────────────────────────────────── */
interface Stats {
  clientes: number; veiculos: number; ordens: number;
  agendamentos: number; lancamentos: number; faturamento: number;
  diasUso: number; hasData: boolean;
}

/* ─── Data ────────────────────────────────────────────────────────────────── */
const PLANS = [
  {
    id: 'trial', nome: 'Trial', sub: 'Experimente sem compromisso',
    precoOld: null, preco: 0, label: 'Grátis', per: '14 dias',
    Icon: Rocket, grad: 'from-slate-400 to-slate-500', border: 'border-slate-300 dark:border-slate-600',
    hot: false, cta: 'Começar grátis', href: '/cadastro', ext: false,
    lim: ['10 clientes', '30 OS/mês', '50 itens estoque', '50 lanç. financeiro', '10 relatórios'],
    inc: ['Orçamentos', 'WhatsApp', 'Agenda', 'Cat. Serviços'],
  },
  {
    id: 'starter', nome: 'Starter', sub: 'Para quem está começando',
    precoOld: 99.90, preco: 49, label: 'R$ 49', per: '/mês',
    Icon: Zap, grad: 'from-blue-400 to-blue-600', border: 'border-blue-300 dark:border-blue-700',
    hot: false, cta: 'Assinar Starter', href: '', ext: true,
    lim: ['10 clientes', '50 OS/mês', '100 itens estoque', '300 lanç./mês', '100 relatórios/mês'],
    inc: ['Orçamentos', 'WhatsApp', 'Agenda', 'Cat. Serviços'],
  },
  {
    id: 'profissional', nome: 'Profissional', sub: 'O favorito das oficinas',
    precoOld: 159.90, preco: 99, label: 'R$ 99', per: '/mês',
    Icon: Star, grad: 'from-orange-400 to-orange-600', border: 'border-orange-400',
    hot: true, cta: 'Assinar Profissional', href: '', ext: true,
    lim: ['60 clientes', '300 OS/mês', '500 itens estoque', '2.000 lanç./mês', '500 relatórios/mês'],
    inc: ['Orçamentos', 'WhatsApp', 'Agenda', 'Cat. Serviços'],
  },
  {
    id: 'premium', nome: 'Premium', sub: 'Sem limites, suporte VIP',
    precoOld: 249.90, preco: 149, label: 'R$ 149', per: '/mês',
    Icon: Crown, grad: 'from-purple-500 to-purple-700', border: 'border-purple-400 dark:border-purple-600',
    hot: false, cta: 'Assinar Premium', href: '', ext: true,
    lim: ['Clientes ilimitados', 'OS ilimitadas', 'Estoque ilimitado', 'Financeiro ilimitado', 'Relatórios ilimitados'],
    inc: ['Orçamentos', 'WhatsApp', 'Agenda', 'Cat. Serviços', 'Lembretes auto', 'Rel. avançados', 'Suporte VIP'],
  },
];

const COMPARE = [
  { label: 'Ordens de Serviço/mês', vals: ['30', '50', '300', '∞'] },
  { label: 'Clientes',              vals: ['10', '10', '60', '∞'] },
  { label: 'Itens no Estoque',      vals: ['50', '100', '500', '∞'] },
  { label: 'Financeiro/mês',        vals: ['50', '300', '2.000', '∞'] },
  { label: 'Relatórios/mês',        vals: ['10', '100', '500', '∞'] },
  { label: 'Orçamentos',            vals: [true, true, true, true] },
  { label: 'WhatsApp',              vals: [true, true, true, true] },
  { label: 'Agenda',                vals: [true, true, true, true] },
  { label: 'Catálogo Serviços',     vals: [true, true, true, true] },
  { label: 'Multi-usuários',        vals: [false, false, false, true] },
  { label: 'Lembretes automáticos', vals: [false, false, false, true] },
  { label: 'Suporte prioritário',   vals: [false, false, true, true] },
];

const BENEFITS = [
  { Icon: ClipboardList, title: 'Ordens de Serviço',  desc: 'Abertura em segundos. Histórico completo. Acompanhamento em tempo real.' },
  { Icon: DollarSign,   title: 'Controle Financeiro', desc: 'Receitas, despesas e fluxo de caixa da sua oficina em um lugar só.' },
  { Icon: Package,      title: 'Estoque de Peças',    desc: 'Controle total com alertas de estoque mínimo e entrada/saída.' },
  { Icon: Calendar,     title: 'Agenda',              desc: 'Agendamentos inteligentes com lembretes automáticos por WhatsApp.' },
  { Icon: MessageSquare,title: 'WhatsApp',             desc: 'Orçamentos e lembretes de revisão enviados diretamente do sistema.' },
  { Icon: BarChart2,    title: 'Relatórios',          desc: 'Análises de performance, faturamento e produtividade da sua equipe.' },
  { Icon: Users,        title: 'Gestão de Clientes',  desc: 'Histórico completo de cada cliente e veículo em um único painel.' },
  { Icon: Wrench,       title: 'Cat. de Serviços',    desc: 'Tabela de preços padrão para agilizar orçamentos e aprovações.' },
];

const TESTIMONIALS = [
  { nome: 'Carlos Henrique', of: 'Mecânica CH — Belo Horizonte, MG',    av: 'CH', cor: 'from-orange-400 to-orange-600', txt: 'Antes eu perdia revisão de cliente toda semana. Com o Motor em Dia, o sistema avisa automático e o cliente volta. Só nisso já paguei o plano várias vezes.' },
  { nome: 'Marcos Antônio',  of: 'Auto Center MA — Contagem, MG',        av: 'MA', cor: 'from-blue-400 to-blue-600',   txt: 'Abri minha OS em 2 minutos e mandei o orçamento pro cliente pelo WhatsApp na hora. O financeiro me mostrou que eu estava no prejuízo sem saber.' },
  { nome: 'Rodrigo Lima',    of: 'Rodcar Auto — Betim, MG',              av: 'RL', cor: 'from-emerald-400 to-emerald-600', txt: 'Em 3 meses recuperei R$4.800 em OS paradas que eu nem lembrava. O controle de revisões me trouxe 12 clientes de volta que estavam sumidos há meses.' },
  { nome: 'Joelma Santos',   of: 'JJ Mecânica — Nova Lima, MG',          av: 'JS', cor: 'from-purple-400 to-purple-600', txt: 'Sistema simples, qualquer funcionário aprende em 15 minutos. Sem papel, sem caderno. O estoque acabou com a dor de cabeça de peça faltando.' },
  { nome: 'Paulo Ribeiro',   of: 'PRM Mecânica — Uberlândia, MG',        av: 'PR', cor: 'from-red-400 to-red-600',     txt: 'Tenho 3 mecânicos e todos usam o sistema ao mesmo tempo. Nunca mais perdi uma OS por desorganização. O histórico do cliente é incrível.' },
  { nome: 'Ana Cláudia',     of: 'Auto Elétrica ACS — Juiz de Fora, MG', av: 'AC', cor: 'from-teal-400 to-teal-600',   txt: 'Como mulher no ramo mecânico, o sistema me deu profissionalismo que impressiona os clientes. Orçamento no WhatsApp em segundos.' },
  { nome: 'Fernando Gomes',  of: 'Gomes Car — Gov. Valadares, MG',       av: 'FG', cor: 'from-amber-400 to-amber-600', txt: 'Negócio de família herdei do meu pai. Com o Motor em Dia modernizei tudo. Hoje tenho controle total das finanças e nenhuma OS sem registro.' },
  { nome: 'Renato Costa',    of: 'RS Motors — Montes Claros, MG',        av: 'RC', cor: 'from-indigo-400 to-indigo-600', txt: 'Aumentei meu faturamento 30% em 4 meses porque parei de esquecer revisões. O sistema manda mensagem pro cliente, eu só abro a OS.' },
  { nome: 'Débora Alves',    of: 'Mecânica Alves — Sete Lagoas, MG',     av: 'DA', cor: 'from-pink-400 to-pink-600',   txt: 'Adoro ver o histórico completo do cliente quando ele liga. Sei tudo que fiz no carro dele. Isso passa uma confiança enorme.' },
];

const FAQ_ITEMS = [
  { q: 'O que acontece quando o Trial terminar?',     r: 'Seus dados ficam salvos por 30 dias. Você escolhe um plano para continuar. Nada é deletado automaticamente. Todo o seu trabalho fica preservado.' },
  { q: 'Posso cancelar a qualquer momento?',          r: 'Sim! Sem fidelidade, sem multa, sem burocracia. Cancele quando quiser, com um clique, sem precisar falar com ninguém.' },
  { q: 'Como é feito o pagamento?',                   r: 'Aceitamos PIX, cartão de crédito e boleto bancário. Fale pelo WhatsApp para ativar o plano escolhido de forma simples.' },
  { q: 'Posso mudar de plano depois?',                r: 'Sim. Upgrade ou downgrade a qualquer momento. O valor é calculado proporcionalmente ao período restante do ciclo atual.' },
  { q: 'Meus dados ficam seguros?',                   r: 'Totalmente. Usamos criptografia avançada e servidores na nuvem com backup automático diário. Seus dados são seus.' },
  { q: 'Tenho suporte se precisar de ajuda?',         r: 'Sim! Suporte via WhatsApp. Planos Profissional e Premium têm suporte prioritário com tempo de resposta reduzido.' },
];

const SAFETY = [
  'Seus dados continuam salvos em total segurança',
  'Sem fidelidade — cancele quando quiser',
  'Cancelamento simples e imediato',
  'Atualizações constantes sem custo adicional',
  'Suporte especializado em gestão de oficinas',
  'Novas funcionalidades lançadas frequentemente',
];

/* ─── Fetch user data ─────────────────────────────────────────────────────── */
async function loadStats(eid: string, createdAt?: string): Promise<Stats> {
  try {
    const [r1, r2, r3, r4, r5] = await Promise.allSettled([
      supabase.from('clientes').select('id', { count: 'exact', head: true }).eq('empresa_id', eid),
      supabase.from('veiculos').select('id', { count: 'exact', head: true }).eq('empresa_id', eid),
      supabase.from('ordens').select('id', { count: 'exact', head: true }).eq('empresa_id', eid),
      supabase.from('agendamentos').select('id', { count: 'exact', head: true }).eq('empresa_id', eid),
      supabase.from('lancamentos').select('valor, tipo').eq('empresa_id', eid),
    ]);
    const cnt = (r: typeof r1) => r.status === 'fulfilled' ? ((r.value as { count: number | null }).count ?? 0) : 0;
    const lancData: { valor: number; tipo: string }[] = r5.status === 'fulfilled' ? ((r5.value as { data: { valor: number; tipo: string }[] }).data ?? []) : [];
    const faturamento = lancData.filter(l => l.tipo === 'receita').reduce((s, l) => s + (Number(l.valor) || 0), 0);
    const clientes = cnt(r1); const veiculos = cnt(r2); const ordens = cnt(r3); const agendamentos = cnt(r4);
    const diasUso = createdAt ? Math.max(1, Math.ceil((Date.now() - new Date(createdAt).getTime()) / 86400000)) : 1;
    return { clientes, veiculos, ordens, agendamentos, lancamentos: lancData.length, faturamento, diasUso, hasData: clientes + veiculos + ordens > 0 };
  } catch {
    return { clientes: 0, veiculos: 0, ordens: 0, agendamentos: 0, lancamentos: 0, faturamento: 0, diasUso: 1, hasData: false };
  }
}

/* ─── Components ──────────────────────────────────────────────────────────── */
function FaqItem({ q, r }: { q: string; r: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={cn('border rounded-2xl overflow-hidden transition-all duration-300', open ? 'border-orange-400/60 shadow-md shadow-orange-500/10 bg-[rgb(var(--card))]' : 'border-[rgb(var(--card-border))] bg-[rgb(var(--card))] hover:border-orange-400/30')}>
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between px-7 py-6 gap-4 text-left">
        <span className="text-base font-semibold text-[rgb(var(--foreground))] leading-snug">{q}</span>
        <ChevronDown className={cn('w-5 h-5 text-orange-500 flex-shrink-0 transition-transform duration-300', open && 'rotate-180')} />
      </button>
      {open && <div className="px-7 pb-7 pt-5 text-[15px] leading-relaxed text-[rgb(var(--muted-foreground))] border-t border-[rgb(var(--card-border))]">{r}</div>}
    </div>
  );
}

function Carousel() {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const N = TESTIMONIALS.length;

  const goTo = useCallback((i: number) => {
    if (!ref.current) return;
    const card = ref.current.children[i] as HTMLElement;
    if (card) ref.current.scrollTo({ left: card.offsetLeft - ref.current.offsetLeft, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setIdx(c => { const n = (c + 1) % N; goTo(n); return n; }), 4500);
    return () => clearInterval(t);
  }, [paused, goTo, N]);

  function move(d: number) { setIdx(c => { const n = (c + d + N) % N; goTo(n); return n; }); }

  return (
    <div className="relative">
      <button onClick={() => move(-1)} className="absolute -left-5 top-1/2 -translate-y-8 z-10 w-10 h-10 rounded-full bg-[rgb(var(--card))] border border-[rgb(var(--card-border))] shadow-lg flex items-center justify-center hover:border-orange-400 hover:text-orange-500 transition-colors hidden sm:flex">
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button onClick={() => move(1)} className="absolute -right-5 top-1/2 -translate-y-8 z-10 w-10 h-10 rounded-full bg-[rgb(var(--card))] border border-[rgb(var(--card-border))] shadow-lg flex items-center justify-center hover:border-orange-400 hover:text-orange-500 transition-colors hidden sm:flex">
        <ChevronRight className="w-5 h-5" />
      </button>
      <div ref={ref} className="flex gap-5 overflow-x-hidden" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        {TESTIMONIALS.map((t, i) => (
          <div key={i} className="flex-shrink-0 w-full sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)] bg-[rgb(var(--card))] border border-[rgb(var(--card-border))] rounded-3xl p-7 flex flex-col gap-4">
            <Quote className="w-7 h-7 text-orange-400 opacity-50 flex-shrink-0" />
            <p className="text-sm text-[rgb(var(--foreground))] leading-relaxed flex-1 italic">&ldquo;{t.txt}&rdquo;</p>
            <div className="pt-4 border-t border-[rgb(var(--card-border))]">
              <div className="flex gap-0.5 mb-3">{[0,1,2,3,4].map(s => <Star key={s} className="w-4 h-4 fill-orange-400 text-orange-400" />)}</div>
              <div className="flex items-center gap-3">
                <div className={cn('w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-xs font-bold flex-shrink-0', t.cor)}>{t.av}</div>
                <div><p className="text-sm font-bold text-[rgb(var(--foreground))]">{t.nome}</p><p className="text-xs text-[rgb(var(--muted-foreground))]">{t.of}</p></div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center gap-2 mt-8">
        {TESTIMONIALS.map((_, i) => (
          <button key={i} onClick={() => { setIdx(i); goTo(i); }} className={cn('rounded-full transition-all duration-300', i === idx ? 'w-7 h-2.5 bg-orange-500' : 'w-2.5 h-2.5 bg-[rgb(var(--card-border))] hover:bg-orange-400')} />
        ))}
      </div>
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────────────────────── */
export default function PlanosPage() {
  const { empresa } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const nome = empresa?.nome;

  const daysLeft = empresa?.trialExpiraEm
    ? Math.max(0, Math.ceil((new Date(empresa.trialExpiraEm).getTime() - Date.now()) / 86400000))
    : null;
  const urgent = daysLeft !== null && daysLeft <= 5;
  const planoAtual = empresa?.plano ?? 'trial';
  const isPago = planoAtual !== 'trial';

  useEffect(() => {
    if (empresa?.id) loadStats(empresa.id, (empresa as { created_at?: string }).created_at).then(setStats);
  }, [empresa?.id]);

  function scrollToPlans() { document.getElementById('planos')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }

  return (
    <div className="min-h-screen bg-[rgb(var(--background))] font-sans">

      {/* ── TOP BAR ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 w-full border-b border-[rgb(var(--card-border))] bg-[rgb(var(--card))]/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-4">
          <Link href={empresa ? '/dashboard' : '/'} className="flex items-center gap-2 text-sm text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{empresa ? 'Voltar ao Dashboard' : 'Voltar'}</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center shadow-md shadow-orange-500/30">
              <span className="text-white text-sm font-bold">M</span>
            </div>
            <span className="font-bold text-sm text-[rgb(var(--foreground))]">Motor em Dia</span>
          </div>
          <div className="flex items-center gap-3">
            {!isPago && daysLeft !== null && (
              <span className={cn('hidden sm:flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full', urgent ? 'bg-red-500/15 text-red-500' : 'bg-orange-500/10 text-orange-500')}>
                <Clock className="w-3.5 h-3.5" />
                {daysLeft}d restantes
              </span>
            )}
            {isPago && <span className="text-xs text-[rgb(var(--muted-foreground))] hidden sm:block">Plano: <strong className="text-[rgb(var(--foreground))] capitalize">{planoAtual}</strong></span>}
            <a href={waLink('suporte', nome)} target="_blank" rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white transition-colors">
              <MessageCircle className="w-3.5 h-3.5" />Suporte
            </a>
          </div>
        </div>
      </header>

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section className="w-full pt-24 pb-24 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          {!isPago && daysLeft !== null && (
            <div className={cn(
              'inline-flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-full mb-8 border',
              urgent
                ? 'bg-red-500/10 text-red-500 border-red-500/30 animate-pulse'
                : 'bg-orange-500/10 text-orange-500 border-orange-500/20'
            )}>
              {urgent ? <AlertTriangle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
              {urgent
                ? `⚠️ Atenção! Restam apenas ${daysLeft} dia${daysLeft !== 1 ? 's' : ''} do seu teste`
                : `⏳ Restam ${daysLeft} dias do seu período de teste`}
            </div>
          )}
          {isPago && (
            <div className="inline-flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-full mb-8 border bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" />
              Plano {planoAtual} ativo
            </div>
          )}

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-[rgb(var(--foreground))] leading-tight tracking-tight mb-6">
            {nome ? `${nome}` : 'Sua oficina'} já está{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
              evoluindo.
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-[rgb(var(--muted-foreground))] max-w-2xl mx-auto mb-10 leading-relaxed">
            Você já está utilizando as principais ferramentas de gestão para oficinas mecânicas.
            Continue sem interrupções e sem perder o que construiu.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={scrollToPlans}
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-xl shadow-orange-500/30 hover:scale-105 text-base w-full sm:w-auto justify-center">
              🚀 Escolher Plano
            </button>
            <a href={waLink('suporte', nome)} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border-2 border-[rgb(var(--card-border))] hover:border-emerald-400 text-[rgb(var(--foreground))] hover:text-emerald-500 font-semibold px-8 py-4 rounded-2xl transition-all text-base w-full sm:w-auto justify-center">
              <MessageCircle className="w-5 h-5" />
              Falar com Suporte
            </a>
          </div>
        </div>
      </section>

      {/* ── USER STATS ──────────────────────────────────────────────────── */}
      {stats && (stats.hasData || stats.diasUso > 0) && (
        <section className="w-full py-24 px-4 sm:px-6 bg-gradient-to-br from-orange-500/5 via-transparent to-transparent border-y border-[rgb(var(--card-border))]">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12 mt-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[rgb(var(--foreground))] mb-3">
                Veja o que você já construiu durante seu teste
              </h2>
              <p className="text-[rgb(var(--muted-foreground))] text-base">
                Dados reais da sua conta — tudo isso seria perdido sem um plano ativo.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { icon: ClipboardList, label: 'Ordens de Serviço', val: stats.ordens,       color: 'bg-orange-500/10 text-orange-500' },
                { icon: Users,         label: 'Clientes',           val: stats.clientes,     color: 'bg-blue-500/10 text-blue-500' },
                { icon: Car,           label: 'Veículos',           val: stats.veiculos,     color: 'bg-emerald-500/10 text-emerald-500' },
                { icon: Calendar,      label: 'Agendamentos',       val: stats.agendamentos, color: 'bg-purple-500/10 text-purple-500' },
                { icon: DollarSign,    label: 'Faturamento',        val: money(stats.faturamento), color: 'bg-green-500/10 text-green-500', isText: true },
                { icon: Clock,         label: 'Dias de uso',        val: `${stats.diasUso}d`, color: 'bg-amber-500/10 text-amber-500', isText: true },
              ].map((s, i) => (
                <div key={i} className="bg-[rgb(var(--card))] border border-[rgb(var(--card-border))] rounded-2xl p-5 flex flex-col gap-3 hover:shadow-lg transition-shadow hover:-translate-y-0.5 hover:border-orange-500/30 transition-all duration-200">
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', s.color)}>
                    <s.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold text-[rgb(var(--foreground))]">{s.val}</p>
                    <p className="text-xs text-[rgb(var(--muted-foreground))] mt-0.5">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── BENEFITS ────────────────────────────────────────────────────── */}
      <section className="w-full py-28 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 mt-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[rgb(var(--foreground))] mb-4">
              Continue organizando sua oficina
            </h2>
            <p className="text-[rgb(var(--muted-foreground))] text-lg max-w-xl mx-auto">
              Tudo que você precisa para uma gestão profissional, em um único sistema.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {BENEFITS.map((b, i) => (
              <div key={i} className="bg-[rgb(var(--card))] border border-[rgb(var(--card-border))] rounded-2xl p-6 hover:border-orange-500/40 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-4">
                  <b.Icon className="w-6 h-6 text-orange-500" />
                </div>
                <h3 className="text-base font-bold text-[rgb(var(--foreground))] mb-2">{b.title}</h3>
                <p className="text-sm text-[rgb(var(--muted-foreground))] leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLANS ───────────────────────────────────────────────────────── */}
      <section id="planos" className="w-full py-28 px-4 sm:px-6 bg-[rgb(var(--card))]/30 border-y border-[rgb(var(--card-border))]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 mt-6">
            <div className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20 tracking-widest uppercase mb-6">
              🔥 Oferta por tempo limitado
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[rgb(var(--foreground))] mb-4">
              Escolha o plano ideal para sua oficina
            </h2>
            <p className="text-[rgb(var(--muted-foreground))] text-lg max-w-xl mx-auto">
              Tudo incluso em todos os planos. Só muda a quantidade.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 items-start">
            {PLANS.map(plan => {
              const isAtual = planoAtual === plan.id;
              const link = plan.ext ? waLink(plan.nome, nome) : plan.href;
              return (
                <div key={plan.id}
                  className={cn(
                    'relative rounded-3xl border-2 flex flex-col bg-[rgb(var(--card))] transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 hover:shadow-2xl',
                    plan.border,
                    plan.hot ? 'py-10 px-7 shadow-[0_20px_60px_rgba(249,115,22,0.25)]' : 'py-8 px-6'
                  )}>
                  {plan.hot && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                      <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-bold px-5 py-1.5 rounded-full shadow-lg whitespace-nowrap tracking-wide">
                        🔥 MAIS ESCOLHIDO PELAS OFICINAS
                      </span>
                    </div>
                  )}
                  {isAtual && (
                    <div className="absolute -top-4 right-4 z-10">
                      <span className="bg-emerald-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg">✓ SEU PLANO</span>
                    </div>
                  )}

                  <div className={cn('w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-5 shadow-md', plan.grad)}>
                    <plan.Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-extrabold text-[rgb(var(--foreground))] mb-1">{plan.nome}</h3>
                  <p className="text-sm text-[rgb(var(--muted-foreground))] mb-5 min-h-[2rem]">{plan.sub}</p>

                  <div className="mb-7 pb-6 border-b border-[rgb(var(--card-border))]">
                    {plan.precoOld && (
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-sm line-through text-[rgb(var(--muted-foreground))] opacity-60">R$ {plan.precoOld.toFixed(2).replace('.', ',')}</span>
                        <span className="text-[10px] font-extrabold bg-red-500 text-white px-2 py-0.5 rounded-full">DESCONTO</span>
                      </div>
                    )}
                    <div className="flex items-end gap-1.5">
                      <span className={cn('font-extrabold leading-none', plan.hot ? 'text-5xl text-orange-500' : 'text-4xl text-[rgb(var(--foreground))]')}>
                        {plan.label}
                      </span>
                      <span className="text-sm text-[rgb(var(--muted-foreground))] mb-1">{plan.per}</span>
                    </div>
                    {plan.preco === 0 && <p className="text-xs text-emerald-500 font-bold mt-2">Sem cartão de crédito</p>}
                  </div>

                  <div className="space-y-2 mb-5">
                    {plan.lim.map((l, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', plan.hot ? 'bg-orange-500' : 'bg-[rgb(var(--muted-foreground))]')} />
                        <span className="text-xs text-[rgb(var(--muted-foreground))]">{l}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mb-7 flex-1">
                    <p className="text-[10px] font-extrabold text-[rgb(var(--muted-foreground))] uppercase tracking-widest mb-2.5">Incluso</p>
                    <div className="space-y-1.5">
                      {plan.inc.map((e, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                          <span className="text-sm text-[rgb(var(--foreground))]">{e}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {isAtual ? (
                    <div className="w-full py-3.5 rounded-2xl text-center text-sm font-bold bg-emerald-500/10 text-emerald-600 border-2 border-emerald-500/30">✓ Plano atual</div>
                  ) : plan.ext ? (
                    <a href={link} target="_blank" rel="noopener noreferrer"
                      className={cn('w-full py-3.5 rounded-2xl text-center text-sm font-bold transition-all flex items-center justify-center gap-2',
                        plan.hot ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/30'
                        : plan.id === 'premium' ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-md shadow-purple-500/20'
                        : 'border-2 border-[rgb(var(--card-border))] hover:border-orange-400 text-[rgb(var(--foreground))] hover:text-orange-500 hover:bg-orange-500/5')}>
                      <MessageCircle className="w-4 h-4" />{plan.cta}
                    </a>
                  ) : (
                    <Link href={link} className="w-full py-3.5 rounded-2xl text-center text-sm font-bold border-2 border-[rgb(var(--card-border))] hover:border-orange-400 text-[rgb(var(--foreground))] hover:text-orange-500 hover:bg-orange-500/5 block transition-all">
                      {plan.cta}
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── COMPARISON ──────────────────────────────────────────────────── */}
      <section className="w-full py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-extrabold text-[rgb(var(--foreground))] mb-3">Comparativo completo</h2>
            <p className="text-[rgb(var(--muted-foreground))]">Veja exatamente o que cada plano oferece.</p>
          </div>
          <div className="rounded-3xl border border-[rgb(var(--card-border))] overflow-hidden bg-[rgb(var(--card))]">
            <div className="grid grid-cols-5 border-b border-[rgb(var(--card-border))] bg-[rgb(var(--muted))]/30">
              <div className="px-5 py-4 text-sm font-bold text-[rgb(var(--muted-foreground))]">Recurso</div>
              {['Trial', 'Starter', 'Profissional', 'Premium'].map((p, i) => (
                <div key={p} className={cn('px-3 py-4 text-center text-sm font-extrabold', i === 2 ? 'text-orange-500' : 'text-[rgb(var(--foreground))]')}>
                  {p}{i === 2 && <span className="ml-1 text-[10px] bg-orange-500/15 px-1.5 py-0.5 rounded-full align-middle">⭐</span>}
                </div>
              ))}
            </div>
            {COMPARE.map((row, ri) => (
              <div key={ri} className={cn('grid grid-cols-5 border-b border-[rgb(var(--card-border))] last:border-0', ri % 2 === 1 && 'bg-[rgb(var(--muted))]/20')}>
                <div className="px-5 py-4 text-sm text-[rgb(var(--foreground))] font-medium">{row.label}</div>
                {row.vals.map((v, vi) => (
                  <div key={vi} className={cn('px-3 py-4 text-center', vi === 2 && 'bg-orange-500/5')}>
                    {typeof v === 'boolean' ? (
                      v ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : <X className="w-4 h-4 text-[rgb(var(--muted-foreground))] opacity-30 mx-auto" />
                    ) : (
                      <span className={cn('text-sm font-bold', v === '∞' ? 'text-purple-500 text-lg' : vi === 2 ? 'text-orange-600' : 'text-[rgb(var(--foreground))]')}>{v}</span>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF ────────────────────────────────────────────────── */}
      <section className="w-full py-24 px-4 sm:px-6 bg-gradient-to-r from-orange-500/5 via-orange-400/3 to-transparent border-y border-[rgb(var(--card-border))]">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center mt-4">
            {[
              { val: '500+',   label: 'Oficinas Ativas',               Icon: Award },
              { val: '50k+',   label: 'OS Gerenciadas',                Icon: ClipboardList },
              { val: '98%',    label: 'Satisfação dos Clientes',       Icon: TrendingUp },
              { val: '24h',    label: 'Suporte Disponível',            Icon: Headphones },
            ].map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center">
                  <s.Icon className="w-7 h-7 text-orange-500" />
                </div>
                <p className="text-4xl font-extrabold text-[rgb(var(--foreground))]">{s.val}</p>
                <p className="text-sm text-[rgb(var(--muted-foreground))]">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ────────────────────────────────────────────────── */}
      <section className="w-full py-28 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 mt-4">
            <div className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20 tracking-widest uppercase mb-6">
              <Star className="w-3.5 h-3.5 fill-orange-500" /> Depoimentos reais
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[rgb(var(--foreground))] mb-4">
              O que os donos de oficina{' '}
              <span className="text-orange-500">estão dizendo</span>
            </h2>
            <p className="text-[rgb(var(--muted-foreground))] text-lg max-w-lg mx-auto">
              Histórias reais de transformação na gestão de oficinas com o Motor em Dia.
            </p>
          </div>
          <Carousel />
        </div>
      </section>

      {/* ── SAFETY ──────────────────────────────────────────────────────── */}
      <section className="w-full py-28 px-4 sm:px-6 bg-[rgb(var(--card))]/40 border-y border-[rgb(var(--card-border))]">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center mx-auto mb-8 shadow-xl shadow-orange-500/25 mt-6">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[rgb(var(--foreground))] mb-5">
            Por que continuar com o Motor em Dia?
          </h2>
          <p className="text-[rgb(var(--muted-foreground))] text-lg mb-12">
            Transparência e compromisso com o sucesso da sua oficina.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            {SAFETY.map((item, i) => (
              <div key={i} className="flex items-center gap-3 bg-[rgb(var(--card))] border border-[rgb(var(--card-border))] rounded-2xl px-5 py-4 hover:border-emerald-400/40 transition-colors">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span className="text-sm font-medium text-[rgb(var(--foreground))]">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────── */}
      <section className="w-full py-28 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col items-center text-center gap-5 mb-20 mt-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[rgb(var(--foreground))]">Perguntas frequentes</h2>
            <p className="text-[rgb(var(--muted-foreground))] text-lg">Tire suas dúvidas antes de escolher seu plano.</p>
          </div>
          <div className="flex flex-col gap-6">
            {FAQ_ITEMS.map((f, i) => <FaqItem key={i} q={f.q} r={f.r} />)}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ───────────────────────────────────────────────────── */}
      <section className="w-full pb-28 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto rounded-3xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-700" />
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, #fff 0%, transparent 50%)' }} />
          <div className="relative z-10 px-8 sm:px-14 py-16 text-center flex flex-col items-center gap-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
              Continue evoluindo sua oficina
            </h2>
            <p className="text-orange-100 text-lg max-w-md leading-relaxed">
              Você já começou sua transformação digital. Escolha um plano e continue gerenciando sua oficina com eficiência.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={scrollToPlans}
                className="inline-flex items-center gap-2 bg-white text-orange-600 font-bold px-8 py-4 rounded-2xl hover:bg-orange-50 transition-all shadow-xl hover:scale-105 text-base">
                🚀 Assinar Agora
              </button>
              <a href={waLink('suporte', nome)} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border-2 border-white/50 hover:border-white text-white font-semibold px-8 py-4 rounded-2xl transition-all text-base">
                <MessageCircle className="w-5 h-5" />
                Falar com Especialista
              </a>
            </div>
            <p className="text-orange-200 text-sm">✓ Sem fidelidade &nbsp;·&nbsp; ✓ Cancele quando quiser &nbsp;·&nbsp; ✓ Dados sempre seus</p>
          </div>
        </div>
      </section>
    </div>
  );
}
