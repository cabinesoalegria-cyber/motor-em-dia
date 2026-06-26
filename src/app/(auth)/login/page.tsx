'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Eye, EyeOff, Wrench, LogIn, Loader2, CheckCircle2 } from 'lucide-react';

const inputCn = cn(
  'w-full px-3 py-3 rounded-xl text-sm border',
  'bg-[rgb(var(--input-bg))] border-[rgb(var(--input-border))]',
  'text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))]',
  'focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-colors',
);

function LoginForm() {
  const { signIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) { toast.error('Preencha todos os campos'); return; }
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      setLoading(false);
      toast.error('E-mail ou senha incorretos');
      return;
    }
    // Verifica se o usuário é master para redirecionar ao painel admin
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: usuario } = await supabase
        .from('usuarios')
        .select('role')
        .eq('id', user.id)
        .single();
      if (usuario?.role === 'master') {
        router.push('/admin');
        return;
      }
    }
    setLoading(false);
    router.push(redirect);
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-[rgb(var(--card))] border border-[rgb(var(--card-border))] rounded-2xl p-8 shadow-xl">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-orange-500/30">
            <Wrench className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[rgb(var(--foreground))]">Motor em Dia</h1>
          <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">Entre na sua conta</p>
        </div>

        {/* Trial badge */}
        <div className="flex items-center justify-center gap-1.5 mb-6 px-4 py-2 bg-orange-500/10 rounded-xl border border-orange-500/20">
          <CheckCircle2 className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
          <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">14 dias gratis para novas oficinas</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-1.5">E-mail</label>
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={inputCn}
              autoComplete="email"
              id="login-email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-1.5">Senha</label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                placeholder="Sua senha"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className={cn(inputCn, 'pr-10')}
                autoComplete="current-password"
                id="login-password"
              />
              <button
                type="button"
                onClick={() => setShowPwd(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(var(--muted-foreground))] hover:text-orange-500 transition-colors"
              >
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="text-right mt-1">
              <Link href="/recuperar-senha" className="text-xs text-[rgb(var(--muted-foreground))] hover:text-orange-500 transition-colors">
                Esqueci minha senha
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            id="btn-login"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-center text-sm text-[rgb(var(--muted-foreground))] mt-6">
          Nao tem conta?{' '}
          <Link href="/cadastro" className="text-orange-500 font-semibold hover:underline">
            Cadastre-se gratis
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="w-16 h-16 bg-orange-500 rounded-2xl animate-pulse" />}>
      <LoginForm />
    </Suspense>
  );
}
