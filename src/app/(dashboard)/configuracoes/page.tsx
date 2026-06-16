'use client';

import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/components/theme-provider';
import { Sun, Moon, Building2, Save, Lock, Eye, EyeOff, Zap, ImagePlus, X, Loader2, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';

export default function ConfiguracoesPage() {
  const { theme, toggleTheme } = useTheme();
  const { empresa, refreshEmpresa } = useAuth();
  const [officeName, setOfficeName] = useState('');
  const [officePhone, setOfficePhone] = useState('');
  const [officeAddress, setOfficeAddress] = useState('');
  const [officeLogo, setOfficeLogo] = useState('');
  const [savingOffice, setSavingOffice] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Senha
  const [senhaNova, setSenhaNova] = useState('');
  const [senhaConfirm, setSenhaConfirm] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [savingSenha, setSavingSenha] = useState(false);

  // Load from empresa (Supabase) - sync with localStorage for sidebar/favicon
  useEffect(() => {
    if (empresa) {
      setOfficeName(empresa.nome || '');
      setOfficePhone(empresa.telefone || '');
      setOfficeAddress(empresa.endereco || '');
      // logo: stored in localStorage as base64 (too large for DB)
      const savedLogo = localStorage.getItem('autoflow-office-logo');
      if (savedLogo) setOfficeLogo(savedLogo);
    } else {
      // fallback for loading state
      const saved = localStorage.getItem('autoflow-office-name');
      if (saved) setOfficeName(saved);
      const savedPhone = localStorage.getItem('autoflow-office-phone');
      if (savedPhone) setOfficePhone(savedPhone);
      const savedAddr = localStorage.getItem('autoflow-office-address');
      if (savedAddr) setOfficeAddress(savedAddr);
      const savedLogo = localStorage.getItem('autoflow-office-logo');
      if (savedLogo) setOfficeLogo(savedLogo);
    }
  }, [empresa]);

  async function handleSaveOffice() {
    setSavingOffice(true);
    try {
      // Salva no localStorage sempre (fallback)
      localStorage.setItem('autoflow-office-name', officeName);
      localStorage.setItem('autoflow-office-phone', officePhone);
      localStorage.setItem('autoflow-office-address', officeAddress);
      if (officeLogo) localStorage.setItem('autoflow-office-logo', officeLogo);
      else localStorage.removeItem('autoflow-office-logo');

      // Salva no Supabase se empresa estiver carregada
      if (empresa) {
        const { error: updateError } = await supabase
          .from('empresas')
          .update({ nome: officeName, telefone: officePhone, endereco: officeAddress })
          .eq('id', empresa.id);

        if (updateError) {
          console.error('Supabase update error:', updateError);
          toast.warning(`Salvo localmente. Supabase: ${updateError.message}`);
        } else {
          await refreshEmpresa();
          toast.success('Dados da oficina salvos!');
        }
      } else {
        toast.success('Dados salvos localmente!');
      }

      // Dispara eventos para sidebar/favicon atualizarem
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('autoflow-settings-updated'));
      window.dispatchEvent(new Event('autoflow-logo-updated'));
    } catch (err) {
      console.error('Save error:', err);
      toast.error('Erro inesperado ao salvar.');
    } finally {
      setSavingOffice(false);
    }
  }

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) { toast.error('Imagem muito grande. Use até 500KB.'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      setOfficeLogo(base64);
    };
    reader.readAsDataURL(file);
  }

  async function handleTrocarSenha(e: React.FormEvent) {
    e.preventDefault();
    if (senhaNova.length < 6) { toast.error('A nova senha deve ter pelo menos 6 caracteres'); return; }
    if (senhaNova !== senhaConfirm) { toast.error('As senhas nao coincidem'); return; }
    setSavingSenha(true);
    const { error } = await supabase.auth.updateUser({ password: senhaNova });
    setSavingSenha(false);
    if (error) { toast.error('Erro ao alterar senha. Tente novamente.'); return; }
    toast.success('Senha alterada com sucesso!');
    setSenhaNova(''); setSenhaConfirm('');
  }

  const inputCn = cn(
    'w-full px-3 py-2.5 rounded-xl text-sm border',
    'bg-[rgb(var(--input-bg))] border-[rgb(var(--input-border))]',
    'text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))]',
    'focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500'
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Office Info */}
      <div className={cn('rounded-2xl p-5 border', 'bg-[rgb(var(--card))] border-[rgb(var(--card-border))]')}>
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-4 h-4 text-orange-500" />
          <h3 className="font-semibold text-[rgb(var(--foreground))]">Dados da Oficina</h3>
        </div>
        <div className="space-y-3">
          {/* Logo */}
          <div>
            <label className="block text-sm font-medium mb-1.5 text-[rgb(var(--foreground))]">Logo / Favicon</label>
            <div className="flex items-center gap-3">
              {officeLogo ? (
                <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-[rgb(var(--card-border))] flex-shrink-0">
                  <img src={officeLogo} alt="Logo" className="w-full h-full object-contain" />
                  <button
                    type="button"
                    onClick={() => setOfficeLogo('')}
                    className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => logoInputRef.current?.click()}
                  className="w-16 h-16 rounded-xl border-2 border-dashed border-[rgb(var(--input-border))] flex items-center justify-center cursor-pointer hover:border-orange-500 hover:bg-orange-500/5 transition-colors flex-shrink-0"
                >
                  <ImagePlus className="w-6 h-6 text-[rgb(var(--muted-foreground))]" />
                </div>
              )}
              <div className="flex-1">
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="text-sm text-orange-500 hover:underline"
                >
                  {officeLogo ? 'Trocar logo' : 'Carregar logo'}
                </button>
                <p className="text-xs text-[rgb(var(--muted-foreground))] mt-0.5">PNG, JPG ou SVG. Máx 500KB.<br/>Aparece na sidebar e nos PDFs gerados.</p>
              </div>
            </div>
            <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-[rgb(var(--foreground))]">Nome da Oficina</label>
            <input type="text" value={officeName} onChange={e => setOfficeName(e.target.value)} className={inputCn} placeholder="Ex: Oficina do João" />
            <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">Aparece no cabeçalho, sidebar e nos PDFs gerados</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-[rgb(var(--foreground))]">Telefone / WhatsApp</label>
            <input type="tel" value={officePhone} onChange={e => setOfficePhone(e.target.value)} className={inputCn} placeholder="(11) 99999-0001" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-[rgb(var(--foreground))]">Endereço</label>
            <input type="text" value={officeAddress} onChange={e => setOfficeAddress(e.target.value)} className={inputCn} placeholder="Rua, número, cidade" />
          </div>
        </div>
        <button onClick={handleSaveOffice} disabled={savingOffice} className="mt-4 flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-medium hover:bg-orange-600 transition-colors disabled:opacity-60">
          {savingOffice ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {savingOffice ? 'Salvando...' : 'Salvar'}
        </button>
      </div>

      {/* Senha Financeiro */}
      <div className={cn('rounded-2xl p-5 border', 'bg-[rgb(var(--card))] border-[rgb(var(--card-border))]')}>
        <div className="flex items-center gap-2 mb-1">
          <Lock className="w-4 h-4 text-slate-500" />
          <h3 className="font-semibold text-[rgb(var(--foreground))]">Alterar Senha</h3>
        </div>
        <p className="text-xs text-[rgb(var(--muted-foreground))] mb-4">
          Altere a senha da sua conta Supabase.
        </p>

        <form onSubmit={handleTrocarSenha} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-[rgb(var(--foreground))]">Nova Senha</label>
              <input type={showSenha ? 'text' : 'password'} value={senhaNova} onChange={e => setSenhaNova(e.target.value)} className={inputCn} placeholder="Min. 6 caracteres" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-[rgb(var(--foreground))]">Confirmar Senha</label>
              <input type={showSenha ? 'text' : 'password'} value={senhaConfirm} onChange={e => setSenhaConfirm(e.target.value)} className={inputCn} placeholder="Repita a senha" />
            </div>
          </div>
          <button
            type="submit"
            disabled={!senhaNova || !senhaConfirm || savingSenha}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-700 text-white rounded-xl text-sm font-medium hover:bg-slate-600 transition-colors disabled:opacity-50"
          >
            {savingSenha ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            {savingSenha ? 'Salvando...' : 'Alterar Senha'}
          </button>
        </form>
      </div>

      {/* Appearance */}
      <div className={cn('rounded-2xl p-5 border', 'bg-[rgb(var(--card))] border-[rgb(var(--card-border))]')}>
        <h3 className="font-semibold text-[rgb(var(--foreground))] mb-4">Aparência</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[rgb(var(--foreground))]">Modo {theme === 'dark' ? 'Escuro' : 'Claro'}</p>
            <p className="text-xs text-[rgb(var(--muted-foreground))] mt-0.5">Alterne entre os temas</p>
          </div>
          <button
            onClick={toggleTheme}
            className={cn(
              'relative w-14 h-7 rounded-full transition-colors',
              theme === 'dark' ? 'bg-orange-500' : 'bg-slate-300'
            )}
          >
            <span className={cn(
              'absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-all flex items-center justify-center',
              theme === 'dark' ? 'left-8' : 'left-1'
            )}>
              {theme === 'dark' ? <Moon className="w-3 h-3 text-slate-600" /> : <Sun className="w-3 h-3 text-orange-500" />}
            </span>
          </button>
        </div>
      </div>

      {/* Plano */}
      {empresa && (
        <div className={cn('rounded-2xl p-5 border', 'bg-[rgb(var(--card))] border-[rgb(var(--card-border))]')}>
          <div className="flex items-center gap-2 mb-3">
            <Crown className="w-4 h-4 text-yellow-500" />
            <h3 className="font-semibold text-[rgb(var(--foreground))]">Plano Atual</h3>
          </div>
          <div className="flex items-center gap-3">
            <span className={cn(
              'px-3 py-1 rounded-xl text-sm font-bold capitalize',
              empresa.plano === 'premium'      ? 'bg-purple-500/15 text-purple-500' :
              empresa.plano === 'profissional' ? 'bg-blue-500/15 text-blue-500' :
              empresa.plano === 'starter'      ? 'bg-emerald-500/15 text-emerald-500' :
              'bg-orange-500/15 text-orange-500'
            )}>
              {empresa.plano === 'trial' ? 'Trial Gratuito' : empresa.plano}
            </span>
            {empresa.trialExpiraEm && empresa.plano === 'trial' && (
              <span className="text-xs text-[rgb(var(--muted-foreground))]">
                Expira em: {new Date(empresa.trialExpiraEm).toLocaleDateString('pt-BR')}
              </span>
            )}
          </div>
        </div>
      )}

      {/* About */}
      <div className={cn('rounded-2xl p-5 border', 'bg-[rgb(var(--card))] border-[rgb(var(--card-border))]')}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <p className="font-semibold text-[rgb(var(--foreground))]">Motor em Dia</p>
            <p className="text-xs text-[rgb(var(--muted-foreground))]">v2.0 SaaS</p>
          </div>
        </div>
        <p className="text-sm text-[rgb(var(--muted-foreground))]">
          O sistema mais simples do Brasil para pequenas oficinas mecânicas. 🔧
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {['OS por Placa', 'Lembretes de Revisão', 'Financeiro', 'Agenda', 'WhatsApp', 'Estoque'].map((f) => (
            <span key={f} className="text-xs bg-orange-500/10 text-orange-500 px-2.5 py-1 rounded-full">{f}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
