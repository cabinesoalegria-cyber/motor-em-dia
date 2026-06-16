'use client';

import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Check, X, Zap, Star, Crown, Rocket, MessageCircle, ArrowLeft, ChevronDown } from 'lucide-react';
import { useState } from 'react';

// ─── WhatsApp CTA ─────────────────────────────────────────────────────────
const WHATSAPP_NUMBER = '5531971464759'; // (31) 97146-4759 — altere aqui

function whatsappLink(plano: string) {
  const msg = encodeURIComponent(
    `Olá! Gostaria de contratar o plano *${plano}* do Motor em Dia. Podem me ajudar?`
  );
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
}

// ─── Dados dos planos ──────────────────────────────────────────────────────
const PLANS = [
  {
    id: 'trial',
    nome: 'Trial',
    descricao: 'Experimente grátis por 14 dias',
    preco: null,
    precoLabel: 'Grátis',
    periodo: '14 dias',
    cor: 'from-slate-400 to-slate-500',
    corBorda: 'border-slate-300 dark:border-slate-600',
    corBg: 'bg-slate-50 dark:bg-slate-800/30',
    icone: Rocket,
    destaque: false,
    cta: 'Começar grátis',
    ctaHref: '/cadastro',
    ctaExterno: false,
    features: [
      { texto: '1 usuário', ativo: true },
      { texto: 'Até 10 clientes', ativo: true },
      { texto: 'Até 30 ordens de serviço', ativo: true },
      { texto: 'Até 50 itens no estoque', ativo: true },
      { texto: 'Orçamentos', ativo: true },
      { texto: 'WhatsApp mensagens', ativo: true },
      { texto: 'Financeiro', ativo: false },
      { texto: 'Relatórios avançados', ativo: false },
      { texto: 'Lembretes automáticos', ativo: false },
      { texto: 'Suporte prioritário', ativo: false },
    ],
  },
  {
    id: 'starter',
    nome: 'Starter',
    descricao: 'Para quem está começando',
    preco: 49,
    precoLabel: 'R$ 49',
    periodo: '/mês',
    cor: 'from-blue-400 to-blue-600',
    corBorda: 'border-blue-200 dark:border-blue-800',
    corBg: 'bg-blue-50/50 dark:bg-blue-900/10',
    icone: Zap,
    destaque: false,
    cta: 'Assinar Starter',
    ctaHref: whatsappLink('Starter'),
    ctaExterno: true,
    features: [
      { texto: '1 usuário', ativo: true },
      { texto: 'Até 10 clientes', ativo: true },
      { texto: 'Até 50 ordens de serviço', ativo: true },
      { texto: 'Até 100 itens no estoque', ativo: true },
      { texto: 'Orçamentos', ativo: true },
      { texto: 'WhatsApp mensagens', ativo: true },
      { texto: 'Financeiro', ativo: false },
      { texto: 'Relatórios avançados', ativo: false },
      { texto: 'Lembretes automáticos', ativo: false },
      { texto: 'Suporte prioritário', ativo: false },
    ],
  },
  {
    id: 'profissional',
    nome: 'Profissional',
    descricao: 'O mais escolhido pelas oficinas',
    preco: 89,
    precoLabel: 'R$ 89',
    periodo: '/mês',
    cor: 'from-orange-400 to-orange-600',
    corBorda: 'border-orange-400',
    corBg: 'bg-orange-500/5',
    icone: Star,
    destaque: true,
    cta: 'Assinar Profissional',
    ctaHref: whatsappLink('Profissional'),
    ctaExterno: true,
    features: [
      { texto: '1 usuário', ativo: true },
      { texto: 'Até 60 clientes', ativo: true },
      { texto: 'Até 300 ordens de serviço', ativo: true },
      { texto: 'Até 500 itens no estoque', ativo: true },
      { texto: 'Orçamentos', ativo: true },
      { texto: 'WhatsApp mensagens', ativo: true },
      { texto: 'Financeiro completo', ativo: true },
      { texto: 'Relatórios avançados', ativo: false },
      { texto: 'Lembretes automáticos', ativo: false },
      { texto: 'Suporte prioritário', ativo: false },
    ],
  },
  {
    id: 'premium',
    nome: 'Premium',
    descricao: 'Para oficinas que querem crescer',
    preco: 149,
    precoLabel: 'R$ 149',
    periodo: '/mês',
    cor: 'from-purple-500 to-purple-700',
    corBorda: 'border-purple-300 dark:border-purple-700',
    corBg: 'bg-purple-50/50 dark:bg-purple-900/10',
    icone: Crown,
    destaque: false,
    cta: 'Assinar Premium',
    ctaHref: whatsappLink('Premium'),
    ctaExterno: true,
    features: [
      { texto: 'Usuários ilimitados', ativo: true },
      { texto: 'Clientes ilimitados', ativo: true },
      { texto: 'Ordens ilimitadas', ativo: true },
      { texto: 'Estoque ilimitado', ativo: true },
      { texto: 'Orçamentos', ativo: true },
      { texto: 'WhatsApp mensagens', ativo: true },
      { texto: 'Financeiro completo', ativo: true },
      { texto: 'Relatórios avançados', ativo: true },
      { texto: 'Lembretes automáticos', ativo: true },
      { texto: 'Suporte prioritário', ativo: true },
    ],
  },
];

const FAQ = [
  {
    q: 'Posso cancelar a qualquer momento?',
    r: 'Sim! Não há fidelidade. Cancele quando quiser, sem multa.',
  },
  {
    q: 'O que acontece ao final do Trial?',
    r: 'Seus dados ficam salvos. Você escolhe um plano para continuar. Nada é apagado.',
  },
  {
    q: 'Como é feito o pagamento?',
    r: 'Aceitamos PIX, cartão de crédito e boleto. Fale conosco pelo WhatsApp para ativar.',
  },
  {
    q: 'Posso mudar de plano depois?',
    r: 'Sim, você pode fazer upgrade ou downgrade a qualquer momento. O valor é proporcional ao período.',
  },
  {
    q: 'Os dados ficam seguros?',
    r: 'Sim. Seus dados ficam armazenados com segurança na nuvem (Supabase). Backup automático diário.',
  },
];

function FaqItem({ q, r }: { q: string; r: string }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      onClick={() => setOpen(o => !o)}
      className="w-full text-left border border-[rgb(var(--card-border))] rounded-2xl overflow-hidden transition-all"
    >
      <div className="flex items-center justify-between px-5 py-4 gap-3">
        <span className="text-sm font-semibold text-[rgb(var(--foreground))]">{q}</span>
        <ChevronDown className={cn('w-4 h-4 text-[rgb(var(--muted-foreground))] flex-shrink-0 transition-transform', open && 'rotate-180')} />
      </div>
      {open && (
        <div className="px-5 pb-4 text-sm text-[rgb(var(--muted-foreground))] border-t border-[rgb(var(--card-border))] pt-3">
          {r}
        </div>
      )}
    </button>
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
        {!empresa && (
          <Link href="/login" className="text-sm text-orange-500 hover:underline font-medium">
            Entrar
          </Link>
        )}
        {empresa && (
          <span className="text-xs text-[rgb(var(--muted-foreground))]">
            Plano atual: <strong className="text-[rgb(var(--foreground))] capitalize">{planoAtual}</strong>
          </span>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-14">
          <span className="inline-block bg-orange-500/10 text-orange-500 text-xs font-bold px-3 py-1.5 rounded-full mb-4 border border-orange-500/20">
            Planos e Preços
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[rgb(var(--foreground))] mb-4 leading-tight">
            Escolha o plano ideal<br />
            <span className="text-orange-500">para sua oficina</span>
          </h1>
          <p className="text-[rgb(var(--muted-foreground))] text-base max-w-xl mx-auto">
            Comece grátis por 14 dias. Sem cartão de crédito. Cancele quando quiser.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
          {PLANS.map(plan => {
            const Icon = plan.icone;
            const isAtual = planoAtual === plan.id;
            const isDestaque = plan.destaque;

            return (
              <div
                key={plan.id}
                className={cn(
                  'relative rounded-3xl border-2 p-6 flex flex-col transition-all duration-200',
                  plan.corBorda,
                  plan.corBg,
                  isDestaque && 'shadow-2xl shadow-orange-500/20 scale-[1.02]',
                  !isDestaque && 'hover:scale-[1.01] hover:shadow-xl'
                )}
              >
                {/* Badge destaque */}
                {isDestaque && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md whitespace-nowrap">
                      ⭐ Mais Popular
                    </span>
                  </div>
                )}

                {/* Badge plano atual */}
                {isAtual && (
                  <div className="absolute -top-3 right-4">
                    <span className="bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md whitespace-nowrap">
                      ✓ Seu plano
                    </span>
                  </div>
                )}

                {/* Ícone + Nome */}
                <div className={cn('w-10 h-10 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-4', plan.cor)}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-bold text-[rgb(var(--foreground))] mb-1">{plan.nome}</h2>
                <p className="text-xs text-[rgb(var(--muted-foreground))] mb-4 min-h-[2.5rem]">{plan.descricao}</p>

                {/* Preço */}
                <div className="mb-6">
                  <div className="flex items-end gap-1">
                    <span className="text-3xl font-extrabold text-[rgb(var(--foreground))]">{plan.precoLabel}</span>
                    <span className="text-sm text-[rgb(var(--muted-foreground))] mb-1">{plan.periodo}</span>
                  </div>
                  {plan.preco === null && (
                    <p className="text-xs text-emerald-500 font-semibold mt-0.5">Sem cartão de crédito</p>
                  )}
                </div>

                {/* Features */}
                <ul className="flex-1 space-y-2.5 mb-6">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2">
                      {f.ativo ? (
                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <X className="w-4 h-4 text-[rgb(var(--muted-foreground))] opacity-30 flex-shrink-0" />
                      )}
                      <span className={cn('text-xs', f.ativo ? 'text-[rgb(var(--foreground))]' : 'text-[rgb(var(--muted-foreground))] opacity-50 line-through')}>
                        {f.texto}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {isAtual ? (
                  <div className="w-full py-2.5 rounded-xl text-center text-sm font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                    ✓ Plano atual
                  </div>
                ) : plan.ctaExterno ? (
                  <a
                    href={plan.ctaHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      'w-full py-2.5 rounded-xl text-center text-sm font-semibold transition-all flex items-center justify-center gap-2',
                      isDestaque
                        ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/30'
                        : 'border-2 border-[rgb(var(--card-border))] hover:border-orange-500/50 text-[rgb(var(--foreground))] hover:text-orange-500'
                    )}
                  >
                    <MessageCircle className="w-4 h-4" />
                    {plan.cta}
                  </a>
                ) : (
                  <Link
                    href={plan.ctaHref}
                    className="w-full py-2.5 rounded-xl text-center text-sm font-semibold transition-all border-2 border-[rgb(var(--card-border))] hover:border-orange-500/50 text-[rgb(var(--foreground))] hover:text-orange-500 block"
                  >
                    {plan.cta}
                  </Link>
                )}
              </div>
            );
          })}
        </div>

        {/* Tabela comparativa (mobile oculta) */}
        <div className="hidden lg:block mb-16">
          <h2 className="text-xl font-bold text-center text-[rgb(var(--foreground))] mb-6">Comparativo completo</h2>
          <div className="rounded-3xl border border-[rgb(var(--card-border))] overflow-hidden bg-[rgb(var(--card))]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[rgb(var(--card-border))]">
                  <th className="text-left px-6 py-4 font-semibold text-[rgb(var(--muted-foreground))]">Recurso</th>
                  {PLANS.map(p => (
                    <th key={p.id} className={cn('text-center px-4 py-4 font-bold', p.destaque ? 'text-orange-500' : 'text-[rgb(var(--foreground))]')}>
                      {p.nome}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: 'Usuários', vals: ['1', '1', '1', 'Ilimitados'] },
                  { label: 'Clientes', vals: ['Até 10', 'Até 10', 'Até 60', 'Ilimitados'] },
                  { label: 'Ordens de serviço', vals: ['Até 30', 'Até 50', 'Até 300', 'Ilimitadas'] },
                  { label: 'Itens no estoque', vals: ['Até 50', 'Até 100', 'Até 500', 'Ilimitados'] },
                  { label: 'Orçamentos', vals: [true, true, true, true] },
                  { label: 'WhatsApp mensagens', vals: [true, true, true, true] },
                  { label: 'Financeiro', vals: [false, false, true, true] },
                  { label: 'Relatórios avançados', vals: [false, false, false, true] },
                  { label: 'Lembretes automáticos', vals: [false, false, false, true] },
                  { label: 'Suporte prioritário', vals: [false, false, false, true] },
                ].map((row, i) => (
                  <tr key={i} className={cn('border-b border-[rgb(var(--card-border))] last:border-0', i % 2 === 0 ? '' : 'bg-[rgb(var(--muted))]/30')}>
                    <td className="px-6 py-3.5 text-[rgb(var(--foreground))] font-medium">{row.label}</td>
                    {row.vals.map((v, j) => (
                      <td key={j} className="text-center px-4 py-3.5">
                        {typeof v === 'boolean' ? (
                          v ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : <X className="w-4 h-4 text-[rgb(var(--muted-foreground))] opacity-30 mx-auto" />
                        ) : (
                          <span className="text-[rgb(var(--foreground))] font-medium">{v}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
