'use client';

import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import {
  Check, Zap, Star, Crown, Rocket,
  MessageCircle, ArrowLeft, ChevronDown,
  Users, FileText, Car, Package, DollarSign, BarChart2, Sparkles,
} from 'lucide-react';
import { useState } from 'react';

// ─── Config ───────────────────────────────────────────────────────────────
const WHATSAPP_NUMBER = '5531971464759';

function whatsappLink(plano: string, nomeOficina?: string) {
  const oficina = nomeOficina ? `*${nomeOficina}*` : 'nossa oficina';
  const msg = encodeURIComponent(
    `Olá! Somos da oficina ${oficina} e gostaríamos de contratar o plano *${plano}* do Motor em Dia com Desconto. Podem nos ajudar?`
  );
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
}

// ─── Dados ────────────────────────────────────────────────────────────────
const PLANS = [
  {
    id: 'trial',
    nome: 'Trial',
    descricao: 'Experimente sem compromisso',
    precoOriginal: null,
    preco: 0,
    precoLabel: 'Grátis',
    periodo: '14 dias',
    icone: Rocket,
    gradiente: 'from-slate-400 to-slate-500',
    corDestaque: '#64748b',
    corBorda: 'border-slate-300 dark:border-slate-600',
    destaque: false,
    cta: 'Começar grátis',
    ctaHref: '/cadastro',
    ctaExterno: false,
    limites: [
      { icon: Users,      label: 'Usuários',               valor: '1' },
      { icon: FileText,   label: 'Clientes',                valor: 'Até 10' },
      { icon: Car,        label: 'Ordens de Serviço',       valor: 'Até 30/mês' },
      { icon: Package,    label: 'Itens no Estoque',        valor: 'Até 50' },
      { icon: DollarSign, label: 'Financeiro',              valor: '50 lançamentos' },
      { icon: BarChart2,  label: 'Relatórios',              valor: '10 relatórios' },
    ],
    extras: ['Orçamentos', 'WhatsApp mensagens', 'Agenda', 'Catálogo de Serviços'],
  },
  {
    id: 'starter',
    nome: 'Starter',
    descricao: 'Para oficinas que estão começando',
    precoOriginal: 99.90,
    preco: 49,
    precoLabel: 'R$ 49',
    periodo: '/mês',
    icone: Zap,
    gradiente: 'from-blue-400 to-blue-600',
    corDestaque: '#3b82f6',
    corBorda: 'border-blue-300 dark:border-blue-700',
    destaque: false,
    cta: 'Assinar Starter',
    ctaHref: '',
    ctaExterno: true,
    limites: [
      { icon: Users,      label: 'Usuários',               valor: '1' },
      { icon: FileText,   label: 'Clientes',                valor: 'Até 10' },
      { icon: Car,        label: 'Ordens de Serviço',       valor: 'Até 50/mês' },
      { icon: Package,    label: 'Itens no Estoque',        valor: 'Até 100' },
      { icon: DollarSign, label: 'Financeiro',              valor: '300 lanç./mês' },
      { icon: BarChart2,  label: 'Relatórios',              valor: '100/mês' },
    ],
    extras: ['Orçamentos', 'WhatsApp mensagens', 'Agenda', 'Catálogo de Serviços'],
  },
  {
    id: 'profissional',
    nome: 'Profissional',
    descricao: 'O mais escolhido pelas oficinas',
    precoOriginal: 159.90,
    preco: 99,
    precoLabel: 'R$ 99',
    periodo: '/mês',
    icone: Star,
    gradiente: 'from-orange-400 to-orange-600',
    corDestaque: '#f97316',
    corBorda: 'border-orange-400',
    destaque: true,
    cta: 'Assinar Profissional',
    ctaHref: '',
    ctaExterno: true,
    limites: [
      { icon: Users,      label: 'Usuários',               valor: '1' },
      { icon: FileText,   label: 'Clientes',                valor: 'Até 60' },
      { icon: Car,        label: 'Ordens de Serviço',       valor: 'Até 300/mês' },
      { icon: Package,    label: 'Itens no Estoque',        valor: 'Até 500' },
      { icon: DollarSign, label: 'Financeiro',              valor: '2.000 lanç./mês' },
      { icon: BarChart2,  label: 'Relatórios',              valor: '500/mês' },
    ],
    extras: ['Orçamentos', 'WhatsApp mensagens', 'Agenda', 'Catálogo de Serviços'],
  },
  {
    id: 'premium',
    nome: 'Premium',
    descricao: 'Sem limites, com suporte VIP',
    precoOriginal: 249.90,
    preco: 149,
    precoLabel: 'R$ 149',
    periodo: '/mês',
    icone: Crown,
    gradiente: 'from-purple-500 to-purple-700',
    corDestaque: '#9333ea',
    corBorda: 'border-purple-400 dark:border-purple-600',
    destaque: false,
    cta: 'Assinar Premium',
    ctaHref: '',
    ctaExterno: true,
    limites: [
      { icon: Users,      label: 'Usuários',               valor: 'Ilimitados' },
      { icon: FileText,   label: 'Clientes',                valor: 'Ilimitados' },
      { icon: Car,        label: 'Ordens de Serviço',       valor: 'Ilimitadas' },
      { icon: Package,    label: 'Itens no Estoque',        valor: 'Ilimitados' },
      { icon: DollarSign, label: 'Financeiro',              valor: 'Ilimitados' },
      { icon: BarChart2,  label: 'Relatórios',              valor: 'Ilimitados' },
    ],
    extras: [
      'Orçamentos', 'WhatsApp mensagens', 'Agenda', 'Catálogo de Serviços',
      'Lembretes automáticos', 'Relatórios avançados', 'Suporte prioritário',
    ],
  },
];

const FAQ = [
  { q: 'Posso cancelar a qualquer momento?', r: 'Sim! Sem fidelidade nem multa. Cancele quando quiser, sem burocracia.' },
  { q: 'O que acontece ao final do Trial?', r: 'Seus dados ficam salvos por 30 dias. Escolha um plano para continuar. Nada é apagado automaticamente.' },
  { q: 'Como é feito o pagamento?', r: 'Aceitamos PIX, cartão de crédito e boleto bancário. Entre em contato pelo WhatsApp para ativar seu plano.' },
  { q: 'Posso mudar de plano depois?', r: 'Sim! Upgrade ou downgrade a qualquer momento. O valor é calculado proporcionalmente ao período restante.' },
  { q: 'Os dados ficam seguros?', r: 'Totalmente. Seus dados são armazenados com criptografia na nuvem, com backup automático diário.' },
];

function FaqItem({ q, r }: { q: string; r: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={cn(
        'border border-[rgb(var(--card-border))] rounded-2xl overflow-hidden transition-all duration-300',
        open && 'shadow-md border-orange-500/30'
      )}
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-6 py-5 gap-4 text-left hover:bg-[rgb(var(--muted))]/40 transition-colors"
      >
        <span className="text-base font-semibold text-[rgb(var(--foreground))]">{q}</span>
        <ChevronDown className={cn('w-5 h-5 text-orange-500 flex-shrink-0 transition-transform duration-300', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="px-6 pb-5 text-sm leading-relaxed text-[rgb(var(--muted-foreground))] border-t border-[rgb(var(--card-border))] pt-4 bg-[rgb(var(--muted))]/20">
          {r}
        </div>
      )}
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────
export default function PlanosPage() {
  const { empresa } = useAuth();
  const planoAtual = empresa?.plano;
  const nomeOficina = empresa?.nome;

  return (
    <div className="min-h-screen bg-[rgb(var(--background))]">

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-[rgb(var(--card-border))] bg-[rgb(var(--card))]/80 backdrop-blur-md sticky top-0 z-30">
        <Link
          href={empresa ? '/dashboard' : '/'}
          className="flex items-center gap-2 text-sm text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {empresa ? 'Voltar ao Dashboard' : 'Voltar'}
        </Link>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center shadow-md shadow-orange-500/30">
            <span className="text-white text-sm font-bold">M</span>
          </div>
          <span className="font-bold text-sm text-[rgb(var(--foreground))]">Motor em Dia</span>
        </div>
        {!empresa ? (
          <Link href="/login" className="text-sm text-orange-500 hover:underline font-medium">Entrar</Link>
        ) : (
          <span className="text-xs text-[rgb(var(--muted-foreground))] hidden sm:block">
            Plano atual: <strong className="text-[rgb(var(--foreground))] capitalize">{planoAtual === 'trial' ? 'Trial (14 dias)' : planoAtual}</strong>
          </span>
        )}
      </div>

      {/* ── Hero ── */}
      <div className="text-center pt-20 pb-16 px-4">
        <div className="inline-flex items-center gap-2 bg-orange-500/10 text-orange-500 text-xs font-bold px-4 py-2 rounded-full mb-6 border border-orange-500/20 tracking-widest uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          Oferta por tempo limitado
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[rgb(var(--foreground))] mb-6 leading-tight tracking-tight">
          Tudo incluso em todos<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
            os planos.
          </span>
        </h1>
        <p className="text-[rgb(var(--muted-foreground))] text-lg max-w-2xl mx-auto mb-3 leading-relaxed">
          OS, Orçamentos, WhatsApp, Agenda, Estoque, Financeiro e Relatórios.<br />
          Só muda a quantidade. Comece grátis por <strong className="text-[rgb(var(--foreground))]">14 dias</strong>.
        </p>
        <p className="text-sm text-emerald-500 font-semibold">✓ Sem cartão de crédito &nbsp;·&nbsp; ✓ Cancele quando quiser &nbsp;·&nbsp; ✓ Dados sempre seus</p>
      </div>

      {/* ── Cards ── */}
      <div className="max-w-7xl mx-auto px-4 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 items-end">
          {PLANS.map(plan => {
            const Icon = plan.icone;
            const isAtual = planoAtual === plan.id;
            const isDestaque = plan.destaque;
            const linkHref = plan.ctaExterno ? whatsappLink(plan.nome, nomeOficina) : plan.ctaHref;

            return (
              <div
                key={plan.id}
                className={cn(
                  'relative rounded-3xl border-2 flex flex-col bg-[rgb(var(--card))]',
                  'transition-all duration-300 cursor-default',
                  'hover:scale-[1.03] hover:shadow-2xl hover:-translate-y-1',
                  plan.corBorda,
                  isDestaque
                    ? 'shadow-2xl shadow-orange-500/20 scale-[1.04] -translate-y-2 pb-8 pt-10 px-7'
                    : 'pb-7 pt-8 px-6'
                )}
                style={isDestaque ? { boxShadow: '0 20px 60px rgba(249,115,22,0.25)' } : undefined}
              >
                {/* Badges */}
                {isDestaque && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg whitespace-nowrap tracking-wide">
                      ⭐ MAIS POPULAR
                    </span>
                  </div>
                )}
                {isAtual && (
                  <div className="absolute -top-4 right-5 z-10">
                    <span className="bg-emerald-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg whitespace-nowrap">
                      ✓ SEU PLANO
                    </span>
                  </div>
                )}

                {/* Ícone */}
                <div className={cn('w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-5 shadow-md', plan.gradiente)}>
                  <Icon className="w-6 h-6 text-white" />
                </div>

                {/* Nome */}
                <h2 className="text-xl font-extrabold text-[rgb(var(--foreground))] mb-1">{plan.nome}</h2>
                <p className="text-sm text-[rgb(var(--muted-foreground))] mb-6 leading-relaxed">{plan.descricao}</p>

                {/* Preço */}
                <div className="mb-7 pb-6 border-b border-[rgb(var(--card-border))]">
                  {plan.precoOriginal && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm line-through text-[rgb(var(--muted-foreground))] opacity-60">
                        R$ {plan.precoOriginal.toFixed(2).replace('.', ',')}
                      </span>
                      <span className="text-[10px] font-bold bg-red-500 text-white px-2 py-0.5 rounded-full tracking-wide">
                        DESCONTO
                      </span>
                    </div>
                  )}
                  <div className="flex items-end gap-1.5">
                    <span className={cn(
                      'font-extrabold leading-none',
                      isDestaque ? 'text-5xl text-orange-500' : 'text-4xl text-[rgb(var(--foreground))]'
                    )}>
                      {plan.precoLabel}
                    </span>
                    <span className="text-sm text-[rgb(var(--muted-foreground))] mb-1">{plan.periodo}</span>
                  </div>
                  {plan.preco === 0 && (
                    <p className="text-xs text-emerald-500 font-bold mt-1.5">Sem cartão de crédito</p>
                  )}
                </div>

                {/* Limites */}
                <div className="space-y-3 mb-6">
                  {plan.limites.map((l, i) => {
                    const LIcon = l.icon;
                    const isUnlimited = l.valor.startsWith('Ilimitad');
                    return (
                      <div key={i} className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <LIcon className="w-3.5 h-3.5 text-[rgb(var(--muted-foreground))] flex-shrink-0" />
                          <span className="text-xs text-[rgb(var(--muted-foreground))] truncate">{l.label}</span>
                        </div>
                        <span className={cn(
                          'text-xs font-bold px-2.5 py-1 rounded-lg whitespace-nowrap flex-shrink-0',
                          isUnlimited
                            ? 'bg-purple-500/15 text-purple-500'
                            : isDestaque
                            ? 'bg-orange-500/15 text-orange-600 dark:text-orange-400'
                            : 'bg-[rgb(var(--muted))] text-[rgb(var(--foreground))]'
                        )}>
                          {l.valor}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Extras */}
                <div className="mb-7 flex-1">
                  <p className="text-[10px] font-extrabold text-[rgb(var(--muted-foreground))] uppercase tracking-widest mb-3">
                    Incluso
                  </p>
                  <div className="space-y-2">
                    {plan.extras.map((e, i) => (
                      <div key={i} className="flex items-center gap-2.5">
                        <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                        <span className="text-sm text-[rgb(var(--foreground))]">{e}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                {isAtual ? (
                  <div className="w-full py-3.5 rounded-2xl text-center text-sm font-bold bg-emerald-500/10 text-emerald-600 border-2 border-emerald-500/30">
                    ✓ Plano atual
                  </div>
                ) : plan.ctaExterno ? (
                  <a
                    href={linkHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      'w-full py-3.5 rounded-2xl text-center text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2',
                      isDestaque
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40'
                        : plan.id === 'premium'
                        ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-md shadow-purple-500/25'
                        : 'border-2 border-[rgb(var(--card-border))] hover:border-orange-400 text-[rgb(var(--foreground))] hover:text-orange-500 hover:bg-orange-500/5'
                    )}
                  >
                    <MessageCircle className="w-4 h-4" />
                    {plan.cta}
                  </a>
                ) : (
                  <Link
                    href={linkHref}
                    className="w-full py-3.5 rounded-2xl text-center text-sm font-bold transition-all duration-200 border-2 border-[rgb(var(--card-border))] hover:border-orange-400 text-[rgb(var(--foreground))] hover:text-orange-500 hover:bg-orange-500/5 block"
                  >
                    {plan.cta}
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── FAQ ── */}
      <div className="bg-[rgb(var(--card))]/50 border-t border-[rgb(var(--card-border))] py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-[rgb(var(--foreground))] mb-3">Perguntas frequentes</h2>
            <p className="text-[rgb(var(--muted-foreground))] text-base">Tudo o que você precisa saber antes de começar.</p>
          </div>
          <div className="space-y-4">
            {FAQ.map((f, i) => <FaqItem key={i} q={f.q} r={f.r} />)}
          </div>
        </div>
      </div>

      {/* ── CTA Final ── */}
      <div className="py-24 px-4">
        <div className="max-w-2xl mx-auto text-center bg-gradient-to-br from-orange-500/10 via-orange-400/5 to-transparent rounded-3xl border border-orange-500/20 p-14">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-orange-500/30">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-extrabold text-[rgb(var(--foreground))] mb-3">Ainda tem dúvidas?</h3>
          <p className="text-[rgb(var(--muted-foreground))] mb-8 text-base leading-relaxed">
            Nossa equipe está pronta para te ajudar.<br />Respondemos em minutos pelo WhatsApp.
          </p>
          <a
            href={whatsappLink('informações', nomeOficina)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 py-4 rounded-2xl transition-all duration-200 shadow-xl shadow-emerald-500/30 hover:scale-105 hover:shadow-emerald-500/40 text-base"
          >
            <MessageCircle className="w-5 h-5" />
            Falar pelo WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
