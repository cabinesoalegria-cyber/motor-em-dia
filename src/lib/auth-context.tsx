'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export interface Empresa {
  id: string;
  nome: string;
  proprietario: string;
  email: string;
  whatsapp: string;
  cidade: string;
  cnpj: string;
  plano: string; // 'trial' | 'starter' | 'profissional' | 'premium'
  status: string; // 'ativo' | 'inativo'
  trialExpiraEm: string | null;
  logoUrl: string | null;
  telefone: string;
  endereco: string;
  onboardingCompleto: boolean;
  createdAt: string;
}

export interface UsuarioInfo {
  id: string;
  empresaId: string;
  nome: string;
  email: string;
  role: 'proprietario' | 'funcionario' | 'master';
}

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  empresa: Empresa | null;
  usuario: UsuarioInfo | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (data: SignUpData) => Promise<{ error: string | null; empresaId?: string }>;
  signOut: () => Promise<void>;
  refreshEmpresa: () => Promise<void>;
  isTrialExpired: boolean;
  isMaster: boolean;
}

export interface SignUpData {
  email: string;
  password: string;
  nomeOficina: string;
  nomeProprietario: string;
  whatsapp: string;
  cidade: string;
  cnpj?: string;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [usuario, setUsuario] = useState<UsuarioInfo | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchEmpresaData(userId: string) {
    const { data: usuarioData } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (!usuarioData) return;
    
    setUsuario({
      id: usuarioData.id,
      empresaId: usuarioData.empresa_id,
      nome: usuarioData.nome,
      email: usuarioData.email,
      role: usuarioData.role,
    });

    const { data: empresaData } = await supabase
      .from('empresas')
      .select('*')
      .eq('id', usuarioData.empresa_id)
      .single();

    if (empresaData) {
      setEmpresa({
        id: empresaData.id,
        nome: empresaData.nome,
        proprietario: empresaData.proprietario || '',
        email: empresaData.email || '',
        whatsapp: empresaData.whatsapp || '',
        cidade: empresaData.cidade || '',
        cnpj: empresaData.cnpj || '',
        plano: empresaData.plano || 'trial',
        status: empresaData.status || 'ativo',
        trialExpiraEm: empresaData.trial_expira_em,
        logoUrl: empresaData.logo_url,
        telefone: empresaData.telefone || '',
        endereco: empresaData.endereco || '',
        onboardingCompleto: empresaData.onboarding_completo || false,
        createdAt: empresaData.created_at,
      });
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchEmpresaData(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchEmpresaData(session.user.id);
      } else {
        setEmpresa(null);
        setUsuario(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error) {
      // Limpa apenas dados de autenticação do sistema antigo
      // NÃO apaga nome/logo/telefone/endereço — esses pertencem à oficina e devem persistir
      ['autoflow-financeiro-auth', 'autoflow-financeiro-senha', 'autoflow-store']
        .forEach(k => localStorage.removeItem(k));
    }
    return { error: error?.message || null };
  }




  async function signUp(data: SignUpData) {
    // 1. Cria usuário no auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { emailRedirectTo: undefined },
    });

    if (authError) {
      const msg = authError.message.toLowerCase();
      if (msg.includes('rate limit') || msg.includes('email rate')) {
        return { error: 'Limite atingido. Aguarde alguns minutos e tente novamente.' };
      }
      if (msg.includes('already registered') || msg.includes('already been registered')) {
        return { error: 'Este e-mail já está cadastrado. Faça login.' };
      }
      return { error: authError.message };
    }

    if (!authData.user) {
      return { error: 'Erro ao criar conta. Verifique se "Confirm email" está DESATIVADO no Supabase.' };
    }

    // Garante que a sessão está ativa no cliente
    if (authData.session) {
      await supabase.auth.setSession({
        access_token: authData.session.access_token,
        refresh_token: authData.session.refresh_token,
      });
    }

    const userId = authData.user.id;

    // Verifica se o e-mail já foi usado em outro trial
    // Busca em auth.users (via RPC) qualquer empresa com esse e-mail
    const { data: emailCheck } = await supabase
      .from('empresas')
      .select('id, plano')
      .eq('email', data.email)
      .limit(1)
      .maybeSingle();

    const emailJaUsado = !!emailCheck;
    const trialExpira = new Date();
    if (emailJaUsado) {
      // Trial já foi usado — expira imediatamente (sem período gratuito)
      trialExpira.setDate(trialExpira.getDate() - 1);
    } else {
      // Primeiro cadastro — 14 dias grátis
      trialExpira.setDate(trialExpira.getDate() + 14);
    }

    // 2. Cria empresa + usuario via RPC (SECURITY DEFINER — bypassa RLS)
    // Isso resolve o erro 42501 que ocorre logo após o signUp
    const { data: empresaId, error: rpcError } = await supabase.rpc('criar_empresa_e_usuario', {
      p_user_id:         userId,
      p_nome_oficina:    data.nomeOficina,
      p_proprietario:    data.nomeProprietario,
      p_email:           data.email,
      p_whatsapp:        data.whatsapp,
      p_cidade:          data.cidade,
      p_cnpj:            data.cnpj || null,
      p_trial_expira_em: trialExpira.toISOString(),
    });

    if (rpcError) {
      console.error('RPC criar_empresa error:', rpcError);
      return { error: `Erro ao configurar oficina: ${rpcError.message}. Execute a função no Supabase SQL Editor.` };
    }

    await fetchEmpresaData(userId);
    return { error: null, empresaId: empresaId as string };
  }


  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setEmpresa(null);
    setUsuario(null);
  }

  async function refreshEmpresa() {
    if (user) await fetchEmpresaData(user.id);
  }

  const isTrialExpired = empresa
    ? empresa.plano === 'trial' &&
      empresa.trialExpiraEm !== null &&
      new Date(empresa.trialExpiraEm) < new Date()
    : false;

  const isMaster = usuario?.role === 'master';

  return (
    <AuthContext.Provider value={{
      user, session, empresa, usuario, loading,
      signIn, signUp, signOut, refreshEmpresa,
      isTrialExpired, isMaster,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
