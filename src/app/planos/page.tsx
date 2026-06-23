'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Crown, Check, X as XIcon, Loader2, Zap, Star,
  CreditCard, ArrowLeft, ShieldCheck, RefreshCw, User,
  ArrowUpCircle, AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';
import { getPlanLimits, PLAN_LIMITS } from '@/lib/planos';

/* ─── Plan definitions with features ─────────────────────────────────────── */
const PLANOS = [
  {
    key: 'starter',
    nome: 'Starter',
    valor: 49,
    cor: 'emerald',
    icone: Zap,
    limiteClientes: '10 clientes',
    descricao: 'Ideal para conhecer o sistema sem compromisso.',
    recursos: [
      { ok: true,  text: 'Até 10 clientes cadastrados' },
      { ok: true,  text: 'Até 20 Ordens de Serviço por mês' },
      { ok: true,  text: 'Financeiro básico (contas a pagar e receber)' },
      { ok: true,  text: 'Estoque de até 50 peças' },
      { ok: true,  text: 'Cadastro de veículos' },
      { ok: true,  text: 'Agenda de serviços' },
      { ok: true,  text: 'Relatórios básicos' },
      { ok: false, text: 'Sem backup automático' },
      { ok: false, text: 'Sem suporte WhatsApp' },
      { ok: false, text: 'Sem lembretes automáticos' },
      { ok: false, text: 'Sem exportação PDF avançada' },
    ],
  },
  {
    key: 'profissional',
    nome: 'Profissional',
    valor: 99,
    cor: 'blue',
    icone: Star,
    limiteClientes: '60 clientes',
    popular: true,
    descricao: 'Para oficinas em crescimento.',
    recursos: [
      { ok: true, text: 'Até 60 clientes cadastrados' },
      { ok: true, text: 'OS ilimitadas por mês' },
      { ok: true, text: 'Tudo do Starter' },
      { ok: true, text: 'Backup automático completo' },
      { ok: true, text: 'Relatório de mecânicos' },
      { ok: true, text: 'Lembretes automáticos' },
      { ok: true, text: 'Exportação em PDF' },
      { ok: true, text: 'Suporte prioritário por WhatsApp' },
    ],
  },
  {
    key: 'premium',
    nome: 'Premium',
    valor: 149,
    cor: 'purple',
    icone: Crown,
    limiteClientes: 'Ilimitados',
    descricao: 'Clientes ilimitados e suporte VIP.',
    recursos: [
      { ok: true, text: 'Clientes ILIMITADOS' },
      { ok: true, text: 'OS ilimitadas por mês' },
      { ok: true, text: 'Tudo do Profissional' },
      { ok: true, text: 'Estoque ilimitado de peças' },
      { ok: true, text: 'Acesso antecipado a novidades' },
      { ok: true, text: 'Suporte VIP 24h' },
    ],
  },
] as const;

type PlanoKey = 'starter' | 'profissional' | 'premium';

const COR: Record<string, { bg: string; text: string; border: string; btn: string; badge: string; ring: string }> = {
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500', btn: 'bg-emerald-500 hover:bg-emerald-600', badge: 'bg-emerald-500/15 text-emerald-600', ring: 'ring-emerald-500/30' },
  blue:    { bg: 'bg-blue-500/10',    text: 'text-blue-500',    border: 'border-blue-500',    btn: 'bg-blue-500 hover:bg-blue-600',       badge: 'bg-blue-500/15 text-blue-600',    ring: 'ring-blue-500/30' },
  purple:  { bg: 'bg-purple-500/10',  text: 'text-purple-500',  border: 'border-purple-500',  btn: 'bg-purple-500 hover:bg-purple-600',   badge: 'bg-purple-500/15 text-purple-600', ring: 'ring-purple-500/30' },
};

const inputCn = cn(
  'w-full px-3 py-3 rounded-xl text-sm border',
  'bg-[rgb(var(--input-bg))] border-[rgb(var(--input-border))]',
  'text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))]',
  'focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-colors'
);

function formatCpfCnpj(value: string) {
  const d = value.replace(/\D/g, '').slice(0, 14);
  if (d.length <= 11) return d.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  return d.replace(/(\d{2})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1/$2').replace(/(\d{4})(\d{1,2})$/, '$1-$2');
}

/* ─── Main Component ─────────────────────────────────────────────────────── */
export default function PlanosPage() {
  const { empresa, user, refreshEmpresa } = useAuth();
  const { clientes } = useStore();
  const [loading, setLoading] = useState<string | null>(null);
  const [modalPlano, setModalPlano] = useState<PlanoKey | null>(null);
  const [cpfCnpj, setCpfCnpj] = useState('');
  const [cpfCnpjError, setCpfCnpjError] = useState('');

  const planoAtual  = (empresa?.plano  ?? 'trial') as string;
  const statusAtual = (empresa?.status ?? 'ativo')  as string;
  const isPending   = statusAtual === 'pendente_pagamento';
  const isAtivo     = statusAtual === 'ativo';
  const isTrial     = planoAtual === 'trial';
  const hasActivePlan = ['starter', 'profissional', 'premium'].includes(planoAtual);
  const currentPlan = PLANOS.find(p => p.key === planoAtual);
  const currentVal  = currentPlan?.valor ?? 0;
  // URL de pagamento vem do banco — persiste mesmo após reload
  const invoiceUrl  = empresa?.asaasInvoiceUrl ?? null;

  function openModal(planoKey: PlanoKey) {
    // Block downgrade if current client count exceeds target plan limit
    const targetLimit = PLAN_LIMITS[planoKey].clientes;
    if (clientes.length > targetLimit) {
      toast.error(
        `Não é possível assinar o plano ${PLANOS.find(p => p.key === planoKey)?.nome}: ` +
        `você tem ${clientes.length} clientes cadastrados e o limite deste plano é ${targetLimit}. ` +
        `Exclua clientes ou escolha um plano maior.`
      );
      return;
    }
    const existing = (empresa as any)?.cnpj ?? (empresa as any)?.cpfCnpj ?? '';
    setCpfCnpj(existing ? formatCpfCnpj(existing) : '');
    setCpfCnpjError('');
    setModalPlano(planoKey);
  }

  async function confirmarAssinatura() {
    const digits = cpfCnpj.replace(/\D/g, '');
    if (digits.length !== 11 && digits.length !== 14) {
      setCpfCnpjError('Informe um CPF (11 dígitos) ou CNPJ (14 dígitos) válido');
      return;
    }
    if (!empresa || !user || !modalPlano) return;

    setLoading(modalPlano);
    setModalPlano(null);

    try {
      const res = await fetch('/api/asaas/assinar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empresaId: empresa.id,
          plano: modalPlano,
          nome: empresa.nome,
          email: user.email,
          cpfCnpj: digits,
        }),
      });

      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? 'Erro ao criar assinatura'); return; }

      // Recarrega dados da empresa (pega o novo status + invoiceUrl do banco)
      await refreshEmpresa();

      toast.success(`Assinatura do plano ${data.plano} criada! Realize o pagamento para ativar. 🎉`);

      // Abre a página de pagamento imediatamente
      if (data.invoiceUrl) {
        setTimeout(() => window.open(data.invoiceUrl, '_blank'), 800);
      }

      // Recarrega a página após 2s para mostrar o estado pendente
      setTimeout(() => window.location.reload(), 2000);

    } catch (err: any) {
      toast.error(err.message ?? 'Erro de conexão');
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <Link href="/configuracoes" className="inline-flex items-center gap-1.5 text-sm text-[rgb(var(--muted-foreground))] hover:text-orange-500 transition-colors mb-2">
          <ArrowLeft className="w-4 h-4" /> Voltar às configurações
        </Link>
        <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-orange-500/30">
          <Crown className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-[rgb(var(--foreground))]">Planos e Preços</h1>
        <p className="text-[rgb(var(--muted-foreground))]">
          {hasActivePlan ? 'Gerencie ou faça upgrade do seu plano.' : 'Escolha o plano ideal para sua oficina.'}
        </p>
        <div className="flex flex-wrap justify-center gap-4 pt-2">
          {[
            { icon: ShieldCheck, label: 'Pagamento seguro via Asaas' },
            { icon: RefreshCw,   label: 'Cancele quando quiser' },
            { icon: CreditCard,  label: 'PIX, cartão ou boleto' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-1.5 text-xs text-[rgb(var(--muted-foreground))]">
              <Icon className="w-3.5 h-3.5 text-orange-500" />{label}
            </div>
          ))}
        </div>
      </div>

      {/* Pending payment banner */}
      {isPending && hasActivePlan && currentPlan && (
        <div className="rounded-2xl border-2 border-yellow-500/50 bg-yellow-500/10 p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="font-bold text-yellow-700 dark:text-yellow-300">
                  ⏳ Pagamento pendente — Plano {currentPlan.nome}
                </p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-0.5">
                  Seu plano ficará ativo assim que o pagamento for confirmado pelo Asaas.
                </p>
              </div>
            </div>
            <a
              href={invoiceUrl ?? 'https://sandbox.asaas.com'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 bg-yellow-500 text-white text-sm font-semibold rounded-xl hover:bg-yellow-600 transition-colors"
            >
              <CreditCard className="w-4 h-4" /> Pagar agora
            </a>
          </div>
        </div>
      )}

      {/* Current plan highlight (when active) */}
      {hasActivePlan && isAtivo && currentPlan && (
        <div className={cn('rounded-2xl p-5 border-2 flex items-center gap-4', COR[currentPlan.cor].border, 'bg-[rgb(var(--card))]')}>
          <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0', COR[currentPlan.cor].bg)}>
            <currentPlan.icone className={cn('w-6 h-6', COR[currentPlan.cor].text)} />
          </div>
          <div className="flex-1">
            <p className="text-xs text-[rgb(var(--muted-foreground))] font-medium uppercase tracking-wide">Seu plano atual</p>
            <p className="font-bold text-xl text-[rgb(var(--foreground))]">{currentPlan.nome}</p>
            <p className="text-sm text-[rgb(var(--muted-foreground))]">R$ {currentPlan.valor}/mês · {currentPlan.limiteClientes}</p>
          </div>
          <div className={cn('px-3 py-1.5 rounded-xl text-xs font-bold', COR[currentPlan.cor].bg, COR[currentPlan.cor].text)}>
            ✓ Ativo
          </div>
        </div>
      )}

      {/* Downgrade warning — only when truly active */}
      {hasActivePlan && isAtivo && (
        <div className="rounded-xl bg-[rgb(var(--muted))] border border-[rgb(var(--card-border))] p-4 text-sm text-[rgb(var(--muted-foreground))] flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
          <span>
            Você tem <strong className="text-[rgb(var(--foreground))]">{clientes.length} clientes</strong> cadastrados.
            Ao fazer upgrade, pague apenas a <strong className="text-orange-500">diferença do valor</strong> proporcional ao mês.
            Não é possível reduzir para um plano cujo limite seja menor que seus clientes atuais.
          </span>
        </div>
      )}

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {PLANOS.map(plano => {
          const c = COR[plano.cor];
          const Icon = plano.icone;
          const isAtual = planoAtual === plano.key;
          const isLoading = loading === plano.key;
          const targetLimit = PLAN_LIMITS[plano.key].clientes;
          const exceedsLimit = clientes.length > targetLimit;
          const upgradeVal = plano.valor - currentVal;
          const isUpgrade = hasActivePlan && !isAtual && plano.valor > currentVal;
          const isDowngrade = hasActivePlan && !isAtual && plano.valor < currentVal;
          const blocked = exceedsLimit && !isAtual;

          return (
            <div key={plano.key} className={cn(
              'relative rounded-2xl border-2 p-6 flex flex-col transition-all',
              'bg-[rgb(var(--card))]',
              isAtual    ? cn(c.border, 'ring-2', c.ring) :
              blocked    ? 'border-red-500/20 opacity-60' :
              'border-[rgb(var(--card-border))] hover:border-orange-500/40',
              (plano as any).popular && !isAtual ? 'shadow-xl shadow-blue-500/10' : '',
            )}>
              {(plano as any).popular && !isAtual && !blocked && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-full">⭐ Mais Popular</div>
              )}
              {isAtual && (
                <div className={cn('absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-white text-xs font-bold rounded-full', c.btn.split(' ')[0])}>✓ Plano Atual</div>
              )}
              {blocked && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">⚠ Limite excedido</div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', c.bg)}>
                  <Icon className={cn('w-5 h-5', c.text)} />
                </div>
                <div>
                  <h2 className="font-bold text-lg text-[rgb(var(--foreground))]">{plano.nome}</h2>
                  <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', c.badge)}>{plano.limiteClientes}</span>
                </div>
              </div>

              <p className="text-xs text-[rgb(var(--muted-foreground))] mb-4">{plano.descricao}</p>

              <div className="mb-5">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-[rgb(var(--foreground))]">R$ {plano.valor}</span>
                  <span className="text-sm text-[rgb(var(--muted-foreground))]">/mês</span>
                </div>
                {isUpgrade && (
                  <p className="text-xs text-emerald-500 font-medium mt-1">
                    Upgrade: pague apenas R$ {upgradeVal} (diferença proporcional)
                  </p>
                )}
                {!hasActivePlan && (
                  <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">Cobrança mensal automática</p>
                )}
              </div>

              <ul className="space-y-2 flex-1 mb-6">
                {plano.recursos.map(r => (
                  <li key={r.text} className="flex items-start gap-2">
                    {r.ok
                      ? <Check className={cn('w-4 h-4 flex-shrink-0 mt-0.5', c.text)} />
                      : <XIcon className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-400" />
                    }
                    <span className={cn('text-sm', r.ok ? 'text-[rgb(var(--foreground))]' : 'text-[rgb(var(--muted-foreground))]')}>{r.text}</span>
                  </li>
                ))}
              </ul>

              {isAtual && isAtivo ? (
                <div className={cn('w-full py-3 rounded-xl text-center text-sm font-semibold', c.bg, c.text)}>✓ Plano Ativo</div>
              ) : isAtual && isPending ? (
                <a
                  href={invoiceUrl ?? 'https://sandbox.asaas.com'}
                  target="_blank" rel="noopener noreferrer"
                  className="w-full py-3 rounded-xl text-center text-sm font-semibold bg-yellow-500/10 text-yellow-600 border border-yellow-500/30 hover:bg-yellow-500/20 transition-colors block"
                >
                  ⏳ Aguardando pagamento — Pagar agora
                </a>
              ) : blocked ? (
                <div className="w-full py-3 rounded-xl text-center text-sm font-semibold bg-red-500/10 text-red-500">
                  {clientes.length} clientes · limite {targetLimit}
                </div>
              ) : (
                <button
                  onClick={() => openModal(plano.key as PlanoKey)}
                  disabled={!!loading}
                  className={cn(
                    'w-full py-3 rounded-xl text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2',
                    'disabled:opacity-60 disabled:cursor-not-allowed',
                    c.btn,
                  )}
                >
                  {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Aguarde...</> :
                   isUpgrade ? <><ArrowUpCircle className="w-4 h-4" /> Fazer Upgrade</> :
                   isDowngrade ? 'Mudar para este plano' :
                   'Assinar agora'}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Resumo do plano atual ──────────────────────────────── */}
      <div className="rounded-2xl border bg-[rgb(var(--card))] border-[rgb(var(--card-border))] p-6">
        <h3 className="font-bold text-[rgb(var(--foreground))] text-lg mb-4">Resumo do seu plano atual</h3>

        {isTrial ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
              <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-orange-500">Trial Gratuito</p>
                <p className="text-xs text-[rgb(var(--muted-foreground))]">
                  {empresa?.trialExpiraEm
                    ? `Expira em: ${new Date(empresa.trialExpiraEm).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}`
                    : 'Período de avaliação gratuita'}
                </p>
              </div>
            </div>
            <p className="text-sm text-[rgb(var(--muted-foreground))]">
              Ao assinar um plano acima, sua conta passa imediatamente para o plano escolhido.
              Você escolhe como pagar: <strong>PIX, cartão de crédito ou boleto</strong>.
            </p>
          </div>
        ) : currentPlan ? (
          <div className="space-y-4">
            {/* Plan badge */}
            <div className={cn('flex items-center gap-3 p-3 rounded-xl border', COR[currentPlan.cor].bg, `border-${currentPlan.cor}-500/20`)}>
              <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', COR[currentPlan.cor].btn.split(' ')[0])}>
                <currentPlan.icone className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className={cn('font-semibold', COR[currentPlan.cor].text)}>Plano {currentPlan.nome} — R$ {currentPlan.valor}/mês</p>
                <p className="text-xs text-[rgb(var(--muted-foreground))]">Limite: {currentPlan.limiteClientes} · Clientes ativos: {clientes.length}</p>
              </div>
              <span className={cn('px-2.5 py-1 rounded-full text-xs font-bold', COR[currentPlan.cor].bg, COR[currentPlan.cor].text)}>✓ Ativo</span>
            </div>

            {/* Usage bar */}
            {currentPlan.key !== 'premium' && (
              <div>
                <div className="flex justify-between text-xs text-[rgb(var(--muted-foreground))] mb-1.5">
                  <span>Clientes cadastrados</span>
                  <span className="font-mono">{clientes.length} / {PLAN_LIMITS[currentPlan.key].clientes}</span>
                </div>
                <div className="h-2 rounded-full bg-[rgb(var(--muted))] overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all', clientes.length >= PLAN_LIMITS[currentPlan.key].clientes ? 'bg-red-500' : 'bg-emerald-500')}
                    style={{ width: `${Math.min(100, (clientes.length / PLAN_LIMITS[currentPlan.key].clientes) * 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Migration info */}
            <div className="rounded-xl bg-[rgb(var(--muted))] p-3 text-sm text-[rgb(var(--muted-foreground))]">
              <p className="font-semibold text-[rgb(var(--foreground))] mb-1">Como funciona o upgrade?</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Clique em <strong>"Fazer Upgrade"</strong> no plano desejado acima</li>
                <li>Informe seu CPF/CNPJ e confirme</li>
                <li>Sua assinatura atual é <strong>cancelada automaticamente</strong></li>
                <li>Uma nova assinatura é criada no plano novo</li>
                <li>A página de pagamento do Asaas abre automaticamente</li>
              </ol>
            </div>
          </div>
        ) : null}
      </div>

      {/* FAQ */}
      <div className="rounded-2xl border bg-[rgb(var(--card))] border-[rgb(var(--card-border))] p-6 space-y-4">
        <h3 className="font-bold text-[rgb(var(--foreground))] text-lg">Perguntas Frequentes</h3>
        {[
          {
            q: 'Como funciona o período gratuito (Trial)?',
            a: 'Ao criar sua conta, você recebe automaticamente 14 dias de Trial gratuito para testar o sistema. Nesse período, você pode usar o sistema com limite de até 20 clientes. Após os 14 dias, é necessário assinar um plano pago para continuar usando. Não há mais dias grátis ao assinar um plano — a cobrança começa no momento da assinatura.',
          },
          {
            q: 'Como é feito o pagamento?',
            a: 'Processado pelo Asaas. Você pode pagar com cartão de crédito, PIX ou boleto bancário. A cobrança é automática todo mês.',
          },
          {
            q: 'Posso fazer upgrade de plano?',
            a: 'Sim! Clique em "Fazer Upgrade" no plano desejado. Você paga apenas a diferença proporcional ao tempo restante do mês. A mudança é imediata.',
          },
          {
            q: 'Posso reduzir para um plano menor?',
            a: 'Somente se o número de clientes cadastrados couber no limite do plano menor. Por exemplo: se você tem 25 clientes, não pode ir para o Starter (limite 10) sem antes excluir 15 clientes.',
          },
          {
            q: 'E se eu quiser cancelar?',
            a: 'Sem burocracia. Cancele a qualquer momento. Você continua com acesso até o fim do período pago.',
          },
        ].map(({ q, a }) => (
          <div key={q} className="border-b border-[rgb(var(--card-border))] pb-4 last:border-0 last:pb-0">
            <p className="font-semibold text-sm text-[rgb(var(--foreground))] mb-1">{q}</p>
            <p className="text-sm text-[rgb(var(--muted-foreground))]">{a}</p>
          </div>
        ))}
      </div>

      {/* Sandbox notice */}
      {process.env.NEXT_PUBLIC_ASAAS_SANDBOX === 'true' && (
        <div className="rounded-xl bg-yellow-500/10 border border-yellow-500/30 p-4 text-sm text-yellow-700 dark:text-yellow-400">
          <strong>🧪 Modo Sandbox Ativo:</strong> Nenhuma cobrança real será feita.
          <br />Cartão de teste: <code className="font-mono bg-yellow-500/20 px-1.5 py-0.5 rounded">5162 3062 3062 3062</code> · CVV: <code className="font-mono bg-yellow-500/20 px-1.5 py-0.5 rounded">318</code> · Validade: qualquer data futura.
        </div>
      )}

      {/* CPF/CNPJ Modal */}
      {modalPlano && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setModalPlano(null)}>
          <div className="w-full max-w-sm bg-[rgb(var(--card))] border border-[rgb(var(--card-border))] rounded-2xl p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-orange-500/10 rounded-xl flex items-center justify-center">
                  <User className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <h3 className="font-bold text-[rgb(var(--foreground))]">Identificação</h3>
                  <p className="text-xs text-[rgb(var(--muted-foreground))]">Exigido pelo Asaas para emissão de cobranças</p>
                </div>
              </div>
              <button onClick={() => setModalPlano(null)} className="p-1.5 rounded-lg text-[rgb(var(--muted-foreground))] hover:bg-[rgb(var(--muted))]">
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="mb-5 p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
              <p className="text-sm text-orange-500 font-semibold">
                Plano {PLANOS.find(p => p.key === modalPlano)?.nome} — R$ {PLANOS.find(p => p.key === modalPlano)?.valor}/mês
              </p>
              <p className="text-xs text-[rgb(var(--muted-foreground))] mt-0.5">💳 Cobrança mensal automática via PIX, cartão ou boleto</p>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-1.5">CPF ou CNPJ da oficina</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="000.000.000-00 ou 00.000.000/0000-00"
                value={cpfCnpj}
                onChange={e => { setCpfCnpjError(''); setCpfCnpj(formatCpfCnpj(e.target.value)); }}
                className={cn(inputCn, cpfCnpjError ? 'border-red-500' : '')}
                autoFocus
                onKeyDown={e => { if (e.key === 'Enter') confirmarAssinatura(); }}
              />
              {cpfCnpjError && <p className="text-xs text-red-500 mt-1">{cpfCnpjError}</p>}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setModalPlano(null)} className="flex-1 py-3 rounded-xl border border-[rgb(var(--card-border))] text-sm text-[rgb(var(--muted-foreground))] hover:bg-[rgb(var(--muted))] transition-colors">
                Cancelar
              </button>
              <button onClick={confirmarAssinatura} className="flex-1 py-3 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors">
                Confirmar e Assinar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
