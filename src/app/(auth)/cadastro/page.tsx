'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Eye, EyeOff, Wrench, UserPlus, Loader2, CheckCircle2 } from 'lucide-react';

const inputCn = cn(
  'w-full px-3 py-2.5 rounded-xl text-sm border',
  'bg-[rgb(var(--input-bg))] border-[rgb(var(--input-border))]',
  'text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))]',
  'focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-colors',
);

const PLAN_FEATURES = [
  '14 dias gratis, sem cartao',
  'OS, clientes, estoque e financeiro',
  'Cancele quando quiser',
];

export default function CadastroPage() {
  const { signUp } = useAuth();
  const router = useRouter();

  const [nomeOficina, setNomeOficina] = useState('');
  const [nomeProprietario, setNomeProprietario] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [cidade, setCidade] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nomeOficina || !nomeProprietario || !email || !password || !whatsapp || !cidade) {
      toast.error('Preencha todos os campos obrigatorios');
      return;
    }
    if (password.length < 6) { toast.error('A senha deve ter pelo menos 6 caracteres'); return; }
    if (password !== confirmPassword) { toast.error('As senhas nao coincidem'); return; }

    setLoading(true);
    const { error } = await signUp({
      email, password,
      nomeOficina, nomeProprietario, whatsapp, cidade,
      cnpj: cnpj || undefined,
    });
    setLoading(false);

    if (error) {
      if (error.includes('already registered') || error.includes('already been registered')) {
        toast.error('Este e-mail ja esta cadastrado. Faca login.');
      } else {
        toast.error(error);
      }
      return;
    }

    toast.success('Conta criada com sucesso! Configurando sua oficina...');
    router.push('/onboarding');
  }

  return (
    <div className="w-full max-w-lg">
      <div className="bg-[rgb(var(--card))] border border-[rgb(var(--card-border))] rounded-2xl p-8 shadow-xl">
        {/* Logo */}
        <div className="flex flex-col items-center mb-5">
          <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center mb-3 shadow-lg shadow-orange-500/30">
            <Wrench className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[rgb(var(--foreground))]">Cadastrar Oficina</h1>
          <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">Comece com 14 dias gratis</p>
        </div>

        {/* Features */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 mb-6 justify-center">
          {PLAN_FEATURES.map(f => (
            <div key={f} className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
              <span className="text-xs text-[rgb(var(--muted-foreground))]">{f}</span>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[rgb(var(--foreground))] mb-1.5">Nome da Oficina *</label>
              <input id="reg-oficina" type="text" placeholder="Ex: Auto Center Silva" value={nomeOficina} onChange={e => setNomeOficina(e.target.value)} className={inputCn} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[rgb(var(--foreground))] mb-1.5">Nome do Proprietario *</label>
              <input id="reg-proprietario" type="text" placeholder="Seu nome" value={nomeProprietario} onChange={e => setNomeProprietario(e.target.value)} className={inputCn} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[rgb(var(--foreground))] mb-1.5">E-mail *</label>
            <input id="reg-email" type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} className={inputCn} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[rgb(var(--foreground))] mb-1.5">WhatsApp *</label>
              <input id="reg-whatsapp" type="tel" placeholder="(11) 99999-9999" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} className={inputCn} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[rgb(var(--foreground))] mb-1.5">Cidade *</label>
              <input id="reg-cidade" type="text" placeholder="Sua cidade" value={cidade} onChange={e => setCidade(e.target.value)} className={inputCn} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[rgb(var(--foreground))] mb-1.5">
              CNPJ <span className="text-[rgb(var(--muted-foreground))] font-normal">(opcional)</span>
            </label>
            <input id="reg-cnpj" type="text" placeholder="00.000.000/0001-00" value={cnpj} onChange={e => setCnpj(e.target.value)} className={inputCn} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[rgb(var(--foreground))] mb-1.5">Senha *</label>
              <div className="relative">
                <input id="reg-senha" type={showPwd ? 'text' : 'password'} placeholder="Min. 6 caracteres" value={password} onChange={e => setPassword(e.target.value)} className={cn(inputCn, 'pr-9')} />
                <button type="button" onClick={() => setShowPwd(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(var(--muted-foreground))] hover:text-orange-500 transition-colors">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[rgb(var(--foreground))] mb-1.5">Confirmar Senha *</label>
              <input id="reg-confirmar" type="password" placeholder="Repita a senha" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={inputCn} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            id="btn-cadastrar"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-colors disabled:opacity-60 mt-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            {loading ? 'Criando conta...' : 'Criar conta gratis'}
          </button>
        </form>

        <p className="text-center text-sm text-[rgb(var(--muted-foreground))] mt-5">
          Ja tem conta?{' '}
          <Link href="/login" className="text-orange-500 font-semibold hover:underline">Fazer login</Link>
        </p>
      </div>
    </div>
  );
}
