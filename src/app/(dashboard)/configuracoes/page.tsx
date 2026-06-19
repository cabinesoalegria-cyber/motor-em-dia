'use client';

import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/components/theme-provider';
import { Sun, Moon, Building2, Save, Lock, Eye, EyeOff, Zap, ImagePlus, X, Loader2, Crown, Users, Plus, Trash2, Download, Upload, FileSpreadsheet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/lib/store';
import Link from 'next/link';

export default function ConfiguracoesPage() {
  const { theme, toggleTheme } = useTheme();
  const { empresa, refreshEmpresa } = useAuth();
  const { clientes, veiculos, ordens, pecas, lancamentos, agendamentos, orcamentos } = useStore();
  const [officeName, setOfficeName] = useState('');
  const [officePhone, setOfficePhone] = useState('');
  const [officeAddress, setOfficeAddress] = useState('');
  const [officeLogo, setOfficeLogo] = useState('');
  const [savingOffice, setSavingOffice] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Equipe (mânicos) - armazenado no localStorage
  const [mecanicos, setMecanicos] = useState<string[]>([]);
  const [novoMecanico, setNovoMecanico] = useState('');

  useEffect(() => {
    try { setMecanicos(JSON.parse(localStorage.getItem('autoflow-mecanicos') || '[]')); } catch { setMecanicos([]); }
  }, []);

  function saveMecanicos(list: string[]) {
    setMecanicos(list);
    localStorage.setItem('autoflow-mecanicos', JSON.stringify(list));
  }

  function addMecanico() {
    const nome = novoMecanico.trim();
    if (!nome) return;
    if (mecanicos.includes(nome)) { toast.error('Mecânico já cadastrado'); return; }
    saveMecanicos([...mecanicos, nome]);
    setNovoMecanico('');
    toast.success(`${nome} adicionado à equipe`);
  }

  function removeMecanico(nome: string) {
    saveMecanicos(mecanicos.filter(m => m !== nome));
    toast.success('Mecânico removido');
  }

  // Export helpers
  function exportJSON() {
    const backup = {
      geradoEm: new Date().toISOString(),
      oficina: officeName,
      clientes, veiculos, ordens, pecas, lancamentos, agendamentos, orcamentos,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `motor-em-dia-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success('Backup completo baixado!');
  }

  function toCSV(rows: Record<string, unknown>[]): string {
    if (!rows.length) return '';
    const keys = Object.keys(rows[0]);
    const header = keys.join(';');
    const lines = rows.map(r => keys.map(k => { const v = r[k]; return typeof v === 'object' ? JSON.stringify(v) : String(v ?? ''); }).join(';'));
    return [header, ...lines].join('\n');
  }

  function exportCSV(nome: string, rows: Record<string, unknown>[]) {
    const csv = toCSV(rows);
    if (!csv) { toast.error('Nenhum dado para exportar'); return; }
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${nome}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success(`${nome}.csv exportado!`);
  }

  function exportXLS(nome: string, rows: Record<string, unknown>[]) {
    if (!rows.length) { toast.error('Nenhum dado para exportar'); return; }
    const keys = Object.keys(rows[0]);
    function escXml(v: unknown): string {
      return String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
    const header = `<Row>${keys.map(k => `<Cell><Data ss:Type="String">${escXml(k)}</Data></Cell>`).join('')}</Row>`;
    const dataRows = rows.map(r =>
      `<Row>${keys.map(k => {
        const val = r[k];
        const text = typeof val === 'object' ? JSON.stringify(val) : val;
        const type = typeof val === 'number' ? 'Number' : 'String';
        return `<Cell><Data ss:Type="${type}">${escXml(text)}</Data></Cell>`;
      }).join('')}</Row>`
    ).join('');
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Worksheet ss:Name="${escXml(nome)}">
    <Table>${header}${dataRows}</Table>
  </Worksheet>
</Workbook>`;
    const blob = new Blob(['\uFEFF' + xml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${nome}-${new Date().toISOString().split('T')[0]}.xls`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success(`${nome}.xls exportado!`);
  }

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

      {/* ── EQUIPE ──────────────────────── */}
      <div className={cn('rounded-2xl p-5 border', 'bg-[rgb(var(--card))] border-[rgb(var(--card-border))]')}>
        <div className="flex items-center gap-2 mb-1">
          <Users className="w-4 h-4 text-blue-500" />
          <h3 className="font-semibold text-[rgb(var(--foreground))]">Equipe de Mecânicos</h3>
        </div>
        <p className="text-xs text-[rgb(var(--muted-foreground))] mb-4">
          Cadastre os mecânicos para selecionar nas OS e gerar relatórios de produtividade.
        </p>

        {/* Lista */}
        {mecanicos.length > 0 ? (
          <div className="space-y-2 mb-4">
            {mecanicos.map((m) => (
              <div key={m} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-blue-500/5 border border-blue-500/15">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-blue-500/15 flex items-center justify-center">
                    <span className="text-xs font-bold text-blue-600">{m.charAt(0).toUpperCase()}</span>
                  </div>
                  <span className="text-sm font-medium text-[rgb(var(--foreground))]">{m}</span>
                </div>
                <button onClick={() => removeMecanico(m)} className="p-1 text-[rgb(var(--muted-foreground))] hover:text-red-500 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[rgb(var(--muted-foreground))] mb-4 italic">Nenhum mecânico cadastrado ainda.</p>
        )}

        {/* Add */}
        <div className="flex gap-2">
          <input
            type="text"
            value={novoMecanico}
            onChange={e => setNovoMecanico(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addMecanico(); } }}
            placeholder="Nome do mecânico..."
            className={inputCn}
          />
          <button
            type="button"
            onClick={addMecanico}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors flex-shrink-0"
          >
            <Plus className="w-4 h-4" /> Adicionar
          </button>
        </div>
      </div>

      {/* ── EXPORTAR / BACKUP ──────────────── */}
      <div className={cn('rounded-2xl p-5 border', 'bg-[rgb(var(--card))] border-[rgb(var(--card-border))]')}>
        <div className="flex items-center gap-2 mb-1">
          <Download className="w-4 h-4 text-emerald-500" />
          <h3 className="font-semibold text-[rgb(var(--foreground))]">Exportar / Backup</h3>
        </div>
        <p className="text-xs text-[rgb(var(--muted-foreground))] mb-5">
          Faça backup completo ou exporte tabelas individuais em CSV.
        </p>

        {/* Backup completo */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
          <div>
            <p className="text-sm font-bold text-[rgb(var(--foreground))]">Backup Completo (JSON)</p>
            <p className="text-xs text-[rgb(var(--muted-foreground))]">Todos os dados da oficina em um arquivo</p>
          </div>
          <button
            onClick={exportJSON}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-semibold hover:bg-emerald-600 transition-colors flex-shrink-0"
          >
            <Download className="w-4 h-4" /> Baixar Backup
          </button>
        </div>

        {/* Importar backup */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 p-3 rounded-xl bg-blue-500/5 border border-blue-500/20">
          <div>
            <p className="text-sm font-bold text-[rgb(var(--foreground))]">Importar Backup (JSON)</p>
            <p className="text-xs text-[rgb(var(--muted-foreground))]">Restaura dados de um arquivo de backup anterior</p>
          </div>
          <label className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors flex-shrink-0 cursor-pointer">
            <Upload className="w-4 h-4" /> Importar Backup
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (ev) => {
                  try {
                    const data = JSON.parse(ev.target?.result as string);
                    if (!data.clientes && !data.ordens) {
                      toast.error('Arquivo inválido. Selecione um backup do Motor em Dia.');
                      return;
                    }
                    // Store keys mapping
                    const keyMap: Record<string, string> = {
                      clientes: 'autoflow-clientes',
                      veiculos: 'autoflow-veiculos',
                      ordens: 'autoflow-ordens',
                      pecas: 'autoflow-pecas',
                      lancamentos: 'autoflow-lancamentos',
                      agendamentos: 'autoflow-agendamentos',
                      orcamentos: 'autoflow-orcamentos',
                    };
                    Object.entries(keyMap).forEach(([key, lsKey]) => {
                      if (data[key]) localStorage.setItem(lsKey, JSON.stringify(data[key]));
                    });
                    toast.success('Backup restaurado! Recarregue a página para ver os dados.');
                    setTimeout(() => window.location.reload(), 2000);
                  } catch {
                    toast.error('Erro ao ler o arquivo. Certifique-se que é um JSON válido.');
                  }
                };
                reader.readAsText(file);
                e.target.value = '';
              }}
            />
          </label>
        </div>

        {/* Exportações individuais */}
        <p className="text-xs font-semibold text-[rgb(var(--muted-foreground))] uppercase tracking-widest mb-3">Exportar individual</p>
        <div className="space-y-2">
          {[
            { label: 'Clientes',          nome: 'clientes',           data: clientes as unknown as Record<string, unknown>[] },
            { label: 'Veículos',          nome: 'veiculos',           data: veiculos as unknown as Record<string, unknown>[] },
            { label: 'Ordens de Serviço', nome: 'ordens_servico',     data: ordens   as unknown as Record<string, unknown>[] },
            { label: 'Peças/Estoque',     nome: 'pecas_estoque',      data: pecas    as unknown as Record<string, unknown>[] },
            { label: 'Financeiro',         nome: 'financeiro',         data: lancamentos  as unknown as Record<string, unknown>[] },
            { label: 'Agendamentos',       nome: 'agendamentos',       data: agendamentos as unknown as Record<string, unknown>[] },
          ].map(({ label, nome, data }) => (
            <div key={label} className="flex items-center gap-2">
              <span className="flex-1 text-sm text-[rgb(var(--foreground))]">{label}</span>
              <button
                onClick={() => exportCSV(nome, data)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[rgb(var(--card-border))] text-xs font-semibold text-[rgb(var(--muted-foreground))] hover:border-emerald-400 hover:text-emerald-500 hover:bg-emerald-500/5 transition-all"
              >
                <Download className="w-3.5 h-3.5" /> CSV
              </button>
              <button
                onClick={() => exportXLS(nome, data)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[rgb(var(--card-border))] text-xs font-semibold text-[rgb(var(--muted-foreground))] hover:border-blue-400 hover:text-blue-500 hover:bg-blue-500/5 transition-all"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" /> XLS
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Plano */}
      {empresa && (() => {
        const expira = empresa.trialExpiraEm ? new Date(empresa.trialExpiraEm) : null;
        const diasRestantes = expira ? Math.max(0, Math.ceil((expira.getTime() - Date.now()) / 86400000)) : null;
        const expirado = diasRestantes !== null && diasRestantes === 0;
        return (
          <div className={cn('rounded-2xl p-5 border', 'bg-[rgb(var(--card))] border-[rgb(var(--card-border))]')}>
            <div className="flex items-center gap-2 mb-4">
              <Crown className="w-4 h-4 text-yellow-500" />
              <h3 className="font-semibold text-[rgb(var(--foreground))]">Plano Atual</h3>
            </div>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className={cn(
                'px-3 py-1 rounded-xl text-sm font-bold capitalize',
                empresa.plano === 'premium'      ? 'bg-purple-500/15 text-purple-500' :
                empresa.plano === 'profissional' ? 'bg-blue-500/15 text-blue-500' :
                empresa.plano === 'starter'      ? 'bg-emerald-500/15 text-emerald-500' :
                'bg-orange-500/15 text-orange-500'
              )}>
                {empresa.plano === 'trial' ? 'Trial Gratuito' : empresa.plano}
              </span>
              {expira && (
                <span className={cn(
                  'text-xs font-medium px-2.5 py-1 rounded-full',
                  expirado ? 'bg-red-500/10 text-red-500' :
                  diasRestantes! <= 5 ? 'bg-red-500/10 text-red-500' :
                  diasRestantes! <= 10 ? 'bg-orange-500/10 text-orange-500' :
                  'bg-slate-500/10 text-[rgb(var(--muted-foreground))]'
                )}>
                  {expirado ? 'Expirado' : `${diasRestantes} dia${diasRestantes !== 1 ? 's' : ''} restante${diasRestantes !== 1 ? 's' : ''}`}
                </span>
              )}
            </div>
            {expira && (
              <div className="text-sm text-[rgb(var(--muted-foreground))] mb-4">
                <span className="font-medium text-[rgb(var(--foreground))]">Expira em: </span>
                {expira.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
              </div>
            )}
            {empresa.plano === 'trial' && (
              <Link href="/planos"
                className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition-colors"
              >
                <Crown className="w-4 h-4" /> Assinar um Plano
              </Link>
            )}
          </div>
        );
      })()}

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
