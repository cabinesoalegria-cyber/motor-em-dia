'use client';

import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import {
  Check, Zap, Star, Crown, Rocket,
  MessageCircle, ArrowLeft, ChevronDown,
  Users, FileText, Car, Package, DollarSign, BarChart2,
} from 'lucide-react';
import { useState } from 'react';

// ─── Config ───────────────────────────────────────────────────────────────
const WHATSAPP_NUMBER = '5531971464759'; // (31) 97146-4759

function whatsappLink(plano: string) {
  const msg = encodeURIComponent(
    `Olá! Gostaria de contratar o plano *${plano}* do Motor em Dia. Podem me ajudar?`
  );
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
}

// ─── Planos ────────────────────────────────────────────────────────────────
const PLANS = [
  {
    id: 'trial',
    nome: 'Trial',
    descricao: 'Experimente sem compromisso',
    preco: null,
    precoLabel: 'Grátis',
    periodo: '14 dias',
    icone: Rocket,
    cor: 'from-slate-400 to-slate-600',
    corBorda: 'border-slate-300 dark:border-slate-600',
    corCard: '',
    destaque: false,
    cta: 'Começar grátis',
    ctaHref: '/cadastro',
    ctaExterno: false,
    ctaStyle: 'outline',
    limites: [
      { icon: Users,     label: 'Usuários',              valor: '1' },
      { icon: FileText,  label: 'Clientes',               valor: 'Até 10' },
      { icon: Car,       label: 'Ordens de Serviço',      valor: 'Até 30/mês' },
      { icon: Package,   label: 'Itens no Estoque',       valor: 'Até 50' },
      { icon: DollarSign,label: 'Lançamentos Financeiro', valor: 'Até 50' },
      { icon: BarChart2, label: 'Relatórios',             valor: 'Até 10' },
    ],
    extras: ['Orçamentos', 'WhatsApp mensagens', 'Agenda', 'Cat. Serviços'],
  },
  {
    id: 'starter',
    nome: 'Starter',
    descricao: 'Para oficinas que estão crescendo',
    preco: 49,
    precoLabel: 'R$ 49',
    periodo: '/mês',
    icone: Zap,
    cor: 'from-blue-400 to-blue-600',
    corBorda: 'border-blue-300 dark:border-blue-700',
    corCard: '',
    destaque: false,
    cta: 'Assinar Starter',
    ctaHref: whatsappLink('Starter'),
    ctaExterno: true,
    ctaStyle: 'outline',
    limites: [
      { icon: Users,     label: 'Usuários',              valor: '1' },
      { icon: FileText,  label: 'Clientes',               valor: 'Até 10' },
      { icon: Car,       label: 'Ordens de Serviço',      valor: 'Até 50/mês' },
      { icon: Package,   label: 'Itens no Estoque',       valor: 'Até 100' },
      { icon: DollarSign,label: 'Lançamentos Financeiro', valor: 'Até 300/mês' },
      { icon: BarChart2, label: 'Relatórios',             valor: 'Até 100/mês' },
    ],
    extras: ['Orçamentos', 'WhatsApp mensagens', 'Agenda', 'Cat. Serviços'],
  },
  {
    id: 'profissional',
    nome: 'Profissional',
    descricao: 'O mais escolhido pelas oficinas',
    preco: 89,
    precoLabel: 'R$ 89',
    periodo: '/mês',
    icone: Star,
    cor: 'from-orange-400 to-orange-600',
    corBorda: 'border-orange-400',
    corCard: 'ring-2 ring-orange-400/30',
    destaque: true,
    cta: 'Assinar Profissional',
    ctaHref: whatsappLink('Profissional'),
    ctaExterno: true,
    ctaStyle: 'filled',
    limites: [
      { icon: Users,     label: 'Usuários',              valor: '1' },
      { icon: FileText,  label: 'Clientes',               valor: 'Até 60' },
      { icon: Car,       label: 'Ordens de Serviço',      valor: 'Até 300/mês' },
      { icon: Package,   label: 'Itens no Estoque',       valor: 'Até 500' },
      { icon: DollarSign,label: 'Lançamentos Financeiro', valor: 'Até 2.000/mês' },
      { icon: BarChart2, label: 'Relatórios',             valor: 'Até 500/mês' },
    ],
    extras: ['Orçamentos', 'WhatsApp mensagens', 'Agenda', 'Cat. Serviços'],
  },
  {
    id: 'premium',
    nome: 'Premium',
    descricao: 'Sem limites, com suporte VIP',
    preco: 149,
    precoLabel: 'R$ 149',
    periodo: '/mês',
    icone: Crown,
    cor: 'from-purple-500 to-purple-700',
    corBorda: 'border-purple-400 dark:border-purple-600',
    corCard: 'ring-2 ring-purple-400/20',
    destaque: false,
    cta: 'Assinar Premium',
    ctaHref: whatsappLink('Premium'),
    ctaExterno: true,
    ctaStyle: 'purple',
    limites: [
      { icon: Users,     label: 'Usuários',              valor: 'Ilimitados' },
      { icon: FileText,  label: 'Clientes',               valor: 'Ilimitados' },
      { icon: Car,       label: 'Ordens de Serviço',      valor: 'Ilimitadas' },
      { icon: Package,   label: 'Itens no Estoque',       valor: 'Ilimitados' },
      { icon: DollarSign,label: 'Lançamentos Financeiro', valor: 'Ilimitados' },
      { icon: BarChart2, label: 'Relatórios',             valor: 'Ilimitados' },
    ],
    extras: ['Orçamentos', 'WhatsApp mensagens', 'Agenda', 'Cat. Serviços', 'Lembretes automáticos', 'Suporte prioritário', 'Relatórios avançados'],
  },
];

const FAQ = [
  { q: 'Posso cancelar a qualquer momento?', r: 'Sim! Sem fidelidade nem multa. Cancele quando quiser.' },
  { q: 'O que acontece ao final do Trial?', r: 'Seus dados ficam salvos. Escolha um plano para continuar. Nada é apagado.' },
  { q: 'Como é feito o pagamento?', r: 'Aceitamos PIX, cartão de crédito e boleto. Fale conosco pelo WhatsApp para ativar.' },
  { q: 'Posso mudar de plano depois?', r: 'Sim! Upgrade ou downgrade a qualquer momento. Valor proporcional ao período.' },
  { q: 'Os dados ficam seguros?', r: 'Sim. Armazenados na nuvem com backup automático diário.' },
];

function FaqItem({ q, r }: { q: string; r: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-[rgb(var(--card-border))] rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 gap-3 text-left hover:bg-[rgb(var(--muted))]/40 transition-colors"
      >
        <span className="text-sm font-semibold text-[rgb(var(--foreground))]">{q}</span>
        <ChevronDown className={cn('w-4 h-4 text-[rgb(var(--muted-foreground))] flex-shrink-0 transition-transform duration-200', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-[rgb(var(--muted-foreground))] border-t border-[rgb(var(--card-border))] pt-3 bg-[rgb(var(--muted))]/20">
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

  return (
    <div className="min-h-screen bg-[rgb(var(--background))]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[rgb(var(--card-border))] bg-[rgb(var(--card))]/80 backdrop-blur-md sticky top-0 z-30">
        <Link
          href={empresa ? '/dashboard' : '/'}
          className="flex items-center gap-2 text-sm text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {empresa ? 'Voltar ao Dashboard' : 'Voltar'}
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center">
            <span className="text-white text-xs font-bold">M</span>
          </div>
          <span className="font-bold text-sm text-[rgb(var(--foreground))]">Motor em Dia</span>
        </div>
        {!empresa ? (
          <Link href="/login" className="text-sm text-orange-500 hover:underline font-medium">Entrar</Link>
        ) : (
          <span className="text-xs text-[rgb(var(--muted-foreground))]">
            Plano atual: <strong className="text-[rgb(var(--foreground))] capitalize">{planoAtual === 'trial' ? 'Trial' : planoAtual}</strong>
          </span>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-14">
          <span className="inline-block bg-orange-500/10 text-orange-500 text-xs font-bold px-3 py-1.5 rounded-full mb-4 border border-orange-500/20 tracking-wide">
            PLANOS E PREÇOS
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[rgb(var(--foreground))] mb-4 leading-tight">
            Tudo incluso em todos os planos.<br />
            <span className="text-orange-500">Só muda a quantidade.</span>
          </h1>
          <p className="text-[rgb(var(--muted-foreground))] text-base max-w-lg mx-auto">
            Orçamentos, WhatsApp, Agenda, Estoque, Financeiro e muito mais — em todos os planos. Comece grátis por 14 dias.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-16 items-start">
          {PLANS.map(plan => {
            const Icon = plan.icone;
            const isAtual = planoAtual === plan.id;

            return (
              <div
                key={plan.id}
                className={cn(
                  'relative rounded-3xl border-2 p-6 flex flex-col bg-[rgb(var(--card))] transition-all duration-200',
                  plan.corBorda,
                  plan.corCard,
                  plan.destaque && 'shadow-2xl shadow-orange-500/15',
                  !plan.destaque && 'hover:shadow-xl'
                )}
              >
                {/* Badges */}
                {plan.destaque && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="bg-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow whitespace-nowrap">
                      ⭐ Mais Popular
                    </span>
                  </div>
                )}
                {isAtual && (
                  <div className="absolute -top-3.5 right-4">
                    <span className="bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow whitespace-nowrap">
                      ✓ Seu plano
                    </span>
                  </div>
                )}

                {/* Header */}
                <div className={cn('w-10 h-10 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-4', plan.cor)}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-[rgb(var(--foreground))] mb-0.5">{plan.nome}</h2>
                <p className="text-xs text-[rgb(var(--muted-foreground))] mb-5 leading-relaxed">{plan.descricao}</p>

                {/* Preço */}
                <div className="mb-6 pb-5 border-b border-[rgb(var(--card-border))]">
                  <div className="flex items-end gap-1">
                    <span className="text-3xl font-extrabold text-[rgb(var(--foreground))]">{plan.precoLabel}</span>
                    <span className="text-sm text-[rgb(var(--muted-foreground))] mb-1">{plan.periodo}</span>
                  </div>
                  {plan.preco === null && (
                    <p className="text-xs text-emerald-500 font-semibold mt-0.5">Sem cartão de crédito</p>
                  )}
                </div>

                {/* Limites de quantidade */}
                <div className="mb-5 space-y-2.5">
                  {plan.limites.map((l, i) => {
                    const LIcon = l.icon;
                    const isUnlimited = l.valor === 'Ilimitados' || l.valor === 'Ilimitadas';
                    return (
                      <div key={i} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <LIcon className="w-3.5 h-3.5 text-[rgb(var(--muted-foreground))] flex-shrink-0" />
                          <span className="text-xs text-[rgb(var(--muted-foreground))]">{l.label}</span>
                        </div>
                        <span className={cn(
                          'text-xs font-bold px-2 py-0.5 rounded-lg',
                          isUnlimited
                            ? 'bg-purple-500/10 text-purple-500'
                            : plan.destaque
                            ? 'bg-orange-500/10 text-orange-600'
                            : 'bg-[rgb(var(--muted))] text-[rgb(var(--foreground))]'
                        )}>
                          {l.valor}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Extras inclusos */}
                <div className="mb-6 flex-1">
                  <p className="text-[10px] font-bold text-[rgb(var(--muted-foreground))] uppercase tracking-wider mb-2.5">
                    Incluso
                  </p>
                  <div className="space-y-1.5">
                    {plan.extras.map((e, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                        <span className="text-xs text-[rgb(var(--foreground))]">{e}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                {isAtual ? (
                  <div className="w-full py-2.5 rounded-xl text-center text-sm font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/30">
                    ✓ Plano atual
                  </div>
                ) : plan.ctaExterno ? (
                  <a
                    href={plan.ctaHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      'w-full py-2.5 rounded-xl text-center text-sm font-semibold transition-all flex items-center justify-center gap-2',
                      plan.ctaStyle === 'filled' && 'bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/25',
                      plan.ctaStyle === 'purple' && 'bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-500/25',
                      plan.ctaStyle === 'outline' && 'border-2 border-[rgb(var(--card-border))] hover:border-orange-500/60 text-[rgb(var(--foreground))] hover:text-orange-500'
                    )}
                  >
                    <MessageCircle className="w-4 h-4" />
                    {plan.cta}
                  </a>
                ) : (
                  <Link
                    href={plan.ctaHref}
                    className="w-full py-2.5 rounded-xl text-center text-sm font-semibold transition-all border-2 border-[rgb(var(--card-border))] hover:border-orange-500/60 text-[rgb(var(--foreground))] hover:text-orange-500 block"
                  >
                    {plan.cta}
                  </Link>
                )}
              </div>
            );
          })}
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto mb-12">
          <h2 className="text-xl font-bold text-center text-[rgb(var(--foreground))] mb-6">Perguntas frequentes</h2>
          <div className="space-y-3">
            {FAQ.map((f, i) => <FaqItem key={i} q={f.q} r={f.r} />)}
          </div>
        </div>

        {/* CTA final */}
        <div className="text-center bg-gradient-to-br from-orange-500/10 to-orange-600/5 rounded-3xl border border-orange-500/20 p-10">
          <h3 className="text-2xl font-bold text-[rgb(var(--foreground))] mb-2">Ficou com dúvidas?</h3>
          <p className="text-[rgb(var(--muted-foreground))] mb-6 text-sm">Fale com a gente pelo WhatsApp. Respondemos em minutos.</p>
          <a
            href={whatsappLink('informações')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors shadow-md shadow-emerald-500/30"
          >
            <MessageCircle className="w-5 h-5" />
            Falar pelo WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
