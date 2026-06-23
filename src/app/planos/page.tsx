'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Crown, Check, Loader2, Zap, Star,
  CreditCard, ArrowLeft, ShieldCheck, RefreshCw, X, User,
} from 'lucide-react';
import Link from 'next/link';

const PLANOS = [
  {
    key: 'starter',
    nome: 'Starter',
    valor: 49,
    cor: 'emerald',
    icone: Zap,
    limiteClientes: '10 clientes',
    recursos: [
      'Até 10 clientes cadastrados',
      'OS ilimitadas',
      'Orçamentos',
      'Financeiro básico',
      'Agendamentos',
      'Estoque de peças',
      'Backup de dados',
      'Suporte por WhatsApp',
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
    recursos: [
      'Até 60 clientes cadastrados',
      'Tudo do Starter',
      'Relatório de mecânicos',
      'Múltiplos mecânicos',
      'Dashboard completo',
      'Lembretes automáticos',
      'Exportação em PDF',
      'Suporte prioritário',
    ],
  },
  {
    key: 'premium',
    nome: 'Premium',
    valor: 149,
    cor: 'purple',
    icone: Crown,
    limiteClientes: 'Ilimitados',
    recursos: [
      'Clientes ILIMITADOS',
      'Tudo do Profissional',
      'Catálogo de serviços avançado',
      'Multi-veículos por cliente',
      'Histórico completo',
      'Acesso antecipado a novidades',
      'Suporte VIP 24h',
    ],
  },
] as const;

const COR: Record<string, { bg: string; text: string; border: string; btn: string; badge: string }> = {
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500', btn: 'bg-emerald-500 hover:bg-emerald-600', badge: 'bg-emerald-500/15 text-emerald-600' },
  blue:    { bg: 'bg-blue-500/10',    text: 'text-blue-500',    border: 'border-blue-500',    btn: 'bg-blue-500 hover:bg-blue-600',       badge: 'bg-blue-500/15 text-blue-600' },
  purple:  { bg: 'bg-purple-500/10',  text: 'text-purple-500',  border: 'border-purple-500',  btn: 'bg-purple-500 hover:bg-purple-600',   badge: 'bg-purple-500/15 text-purple-600' },
};

const inputCn = cn(
  'w-full px-3 py-3 rounded-xl text-sm border',
  'bg-[rgb(var(--input-bg))] border-[rgb(var(--input-border))]',
  'text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))]',
  'focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-colors'
);

function formatCpfCnpj(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 14);
  if (digits.length <= 11) {
    return digits
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }
  return digits
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
}

export default function PlanosPage() {
  const { empresa, user, refreshEmpresa } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  // Modal state
  const [modalPlano, setModalPlano] = useState<string | null>(null);
  const [cpfCnpj, setCpfCnpj] = useState('');
  const [cpfCnpjError, setCpfCnpjError] = useState('');

  const planoAtual = empresa?.plano ?? 'trial';

  function openModal(planoKey: string) {
    // Pre-fill if empresa already has CPF/CNPJ
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

      if (!res.ok) {
        toast.error(data.error ?? 'Erro ao criar assinatura');
        return;
      }

      await refreshEmpresa();
      toast.success(`Plano ${modalPlano} ativado com 14 dias grátis! 🎉`);

      if (data.invoiceUrl) {
        toast.info('Abrindo página de pagamento do Asaas...', { duration: 3000 });
        setTimeout(() => window.open(data.invoiceUrl, '_blank'), 1500);
      }

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
          Escolha o plano ideal para sua oficina. Assine e comece a usar agora.
        </p>
        <div className="flex flex-wrap justify-center gap-4 pt-2">
          {[
            { icon: ShieldCheck, label: 'Pagamento seguro via Asaas' },
            { icon: RefreshCw,   label: 'Cancele quando quiser' },
            { icon: CreditCard,  label: 'PIX, cartão ou boleto' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-1.5 text-xs text-[rgb(var(--muted-foreground))]">
              <Icon className="w-3.5 h-3.5 text-orange-500" />
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {PLANOS.map(plano => {
          const c = COR[plano.cor];
          const Icon = plano.icone;
          const isAtual = planoAtual === plano.key;
          const isLoading = loading === plano.key;

          return (
            <div key={plano.key} className={cn(
              'relative rounded-2xl border-2 p-6 flex flex-col transition-all',
              'bg-[rgb(var(--card))]',
              isAtual ? c.border : 'border-[rgb(var(--card-border))] hover:border-orange-500/40',
              (plano as any).popular ? 'shadow-xl shadow-blue-500/10' : '',
            )}>
              {(plano as any).popular && !isAtual && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-full">
                  ⭐ Mais Popular
                </div>
              )}
              {isAtual && (
                <div className={cn('absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-white text-xs font-bold rounded-full', c.btn.split(' ')[0])}>
                  ✓ Plano Atual
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', c.bg)}>
                  <Icon className={cn('w-5 h-5', c.text)} />
                </div>
                <div>
                  <h2 className="font-bold text-lg text-[rgb(var(--foreground))]">{plano.nome}</h2>
                  <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', c.badge)}>
                    {plano.limiteClientes}
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-[rgb(var(--foreground))]">R$ {plano.valor}</span>
                  <span className="text-sm text-[rgb(var(--muted-foreground))]">/mês</span>
                </div>
                <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">Cobrança mensal automática</p>
              </div>

              <ul className="space-y-2.5 flex-1 mb-6">
                {plano.recursos.map(r => (
                  <li key={r} className="flex items-start gap-2">
                    <Check className={cn('w-4 h-4 flex-shrink-0 mt-0.5', c.text)} />
                    <span className="text-sm text-[rgb(var(--foreground))]">{r}</span>
                  </li>
                ))}
              </ul>

              {isAtual ? (
                <div className={cn('w-full py-3 rounded-xl text-center text-sm font-semibold', c.bg, c.text)}>
                  ✓ Plano Ativo
                </div>
              ) : (
                <button
                  onClick={() => openModal(plano.key)}
                  disabled={!!loading}
                  className={cn(
                    'w-full py-3 rounded-xl text-white text-sm font-semibold transition-colors',
                    'flex items-center justify-center gap-2',
                    'disabled:opacity-60 disabled:cursor-not-allowed',
                    c.btn,
                  )}
                >
                  {isLoading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Aguarde...</>
                    : 'Assinar agora'
                  }
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* FAQ */}
      <div className="rounded-2xl border bg-[rgb(var(--card))] border-[rgb(var(--card-border))] p-6 space-y-4">
        <h3 className="font-bold text-[rgb(var(--foreground))] text-lg">Perguntas Frequentes</h3>
        {[
          { q: 'Como funciona o período grátis?', a: 'Você assina o plano hoje e tem 14 dias para usar sem pagar nada. A primeira cobrança só ocorre no 15º dia. Cancele a qualquer momento antes disso.' },
          { q: 'Como é feito o pagamento?', a: 'Processado pelo Asaas. Você pode pagar com cartão de crédito, PIX ou boleto bancário. A cobrança é automática todo mês.' },
          { q: 'Posso mudar de plano depois?', a: 'Sim! Entre em contato pelo WhatsApp e fazemos a troca na hora, com ajuste proporcional no valor.' },
          { q: 'E se eu quiser cancelar?', a: 'Sem burocracia. Cancele a qualquer momento. Você continua com acesso até o fim do período pago.' },
        ].map(({ q, a }) => (
          <div key={q} className="border-b border-[rgb(var(--card-border))] pb-4 last:border-0 last:pb-0">
            <p className="font-semibold text-sm text-[rgb(var(--foreground))] mb-1">{q}</p>
            <p className="text-sm text-[rgb(var(--muted-foreground))]">{a}</p>
          </div>
        ))}
      </div>

      {/* Sandbox notice - remove in production */}
      {process.env.NEXT_PUBLIC_ASAAS_SANDBOX === 'true' && (
        <div className="rounded-xl bg-yellow-500/10 border border-yellow-500/30 p-4 text-sm text-yellow-700 dark:text-yellow-400">
          <strong>🧪 Modo Sandbox Ativo:</strong> Nenhuma cobrança real será feita.
          <br />Cartão de teste: <code className="font-mono bg-yellow-500/20 px-1.5 py-0.5 rounded">5162 3062 3062 3062</code> · CVV: <code className="font-mono bg-yellow-500/20 px-1.5 py-0.5 rounded">318</code> · Validade: qualquer data futura.
        </div>
      )}

      {/* ── CPF/CNPJ Modal ── */}
      {modalPlano && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setModalPlano(null)}>
          <div className="w-full max-w-sm bg-[rgb(var(--card))] border border-[rgb(var(--card-border))] rounded-2xl p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            {/* Header */}
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
              <button onClick={() => setModalPlano(null)} className="p-1.5 rounded-lg text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))]">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Plan summary */}
            <div className="mb-5 p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
              <p className="text-sm text-orange-500 font-semibold">
                Plano {PLANOS.find(p => p.key === modalPlano)?.nome} — R$ {PLANOS.find(p => p.key === modalPlano)?.valor}/mês
              </p>
              <p className="text-xs text-[rgb(var(--muted-foreground))] mt-0.5">💳 Cobrança mensal automática via PIX, cartão ou boleto</p>
            </div>

            {/* CPF/CNPJ input */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-1.5">CPF ou CNPJ da oficina</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="000.000.000-00 ou 00.000.000/0000-00"
                value={cpfCnpj}
                onChange={e => {
                  setCpfCnpjError('');
                  setCpfCnpj(formatCpfCnpj(e.target.value));
                }}
                className={cn(inputCn, cpfCnpjError ? 'border-red-500 focus:ring-red-500/40' : '')}
                autoFocus
                onKeyDown={e => { if (e.key === 'Enter') confirmarAssinatura(); }}
              />
              {cpfCnpjError && <p className="text-xs text-red-500 mt-1">{cpfCnpjError}</p>}
              <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1.5">
                Usado apenas para emissão de cobrança pelo Asaas. Seus dados são protegidos.
              </p>
            </div>

            {/* Buttons */}
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
