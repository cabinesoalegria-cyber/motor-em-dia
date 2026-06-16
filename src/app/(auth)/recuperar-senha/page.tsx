'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Mail, ArrowLeft, Wrench, Loader2, CheckCircle2 } from 'lucide-react';

const inputCn = cn(
  'w-full px-3 py-3 rounded-xl text-sm border',
  'bg-[rgb(var(--input-bg))] border-[rgb(var(--input-border))]',
  'text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))]',
  'focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-colors',
);

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) { toast.error('Informe seu e-mail'); return; }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    setLoading(false);
    if (error) { toast.error('Erro ao enviar e-mail. Verifique o endereco.'); return; }
    setSent(true);
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-[rgb(var(--card))] border border-[rgb(var(--card-border))] rounded-2xl p-8 shadow-xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-orange-500/30">
            <Wrench className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[rgb(var(--foreground))]">Recuperar Senha</h1>
          <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1 text-center">
            Enviaremos um link de redefinicao para seu e-mail
          </p>
        </div>

        {sent ? (
          <div className="flex flex-col items-center gap-4 py-4">
            <CheckCircle2 className="w-14 h-14 text-emerald-500" />
            <p className="text-center text-sm text-[rgb(var(--muted-foreground))]">
              E-mail enviado para <strong>{email}</strong>.<br />
              Verifique sua caixa de entrada e spam.
            </p>
            <Link href="/login" className="mt-2 flex items-center gap-1.5 text-sm text-orange-500 font-semibold hover:underline">
              <ArrowLeft className="w-4 h-4" /> Voltar para o login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-1.5">E-mail cadastrado</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--muted-foreground))]" />
                <input
                  id="recuperar-email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className={cn(inputCn, 'pl-9')}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              id="btn-recuperar"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-colors disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
              {loading ? 'Enviando...' : 'Enviar link de recuperacao'}
            </button>
            <Link href="/login" className="flex items-center justify-center gap-1.5 text-sm text-[rgb(var(--muted-foreground))] hover:text-orange-500 transition-colors mt-2">
              <ArrowLeft className="w-4 h-4" /> Voltar para o login
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
