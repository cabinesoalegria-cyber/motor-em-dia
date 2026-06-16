'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Building2, Wrench, Package, Users, ClipboardList,
  ChevronRight, ChevronLeft, CheckCircle2, Loader2,
} from 'lucide-react';

const inputCn = cn(
  'w-full px-3 py-2.5 rounded-xl text-sm border',
  'bg-[rgb(var(--input-bg))] border-[rgb(var(--input-border))]',
  'text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))]',
  'focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-colors',
);

const DEFAULT_SERVICOS = [
  { nome: 'Troca de oleo e filtro (mao de obra)', categoria: 'Motor', valorPadrao: 80 },
  { nome: 'Diagnostico eletronico (scanner)', categoria: 'Eletrica', valorPadrao: 150 },
  { nome: 'Alinhamento e balanceamento', categoria: 'Suspensao', valorPadrao: 150 },
  { nome: 'Troca de pastilhas de freio (dianteiras)', categoria: 'Freios', valorPadrao: 150 },
  { nome: 'Troca de correia dentada e tensor', categoria: 'Motor', valorPadrao: 600 },
  { nome: 'Revisao basica (10.000 km)', categoria: 'Mecanica', valorPadrao: 500 },
  { nome: 'Recarga de gas do ar-condicionado', categoria: 'Outro', valorPadrao: 280 },
  { nome: 'Troca de amortecedores dianteiros', categoria: 'Suspensao', valorPadrao: 450 },
  { nome: 'Reparo de suspensao dianteira', categoria: 'Suspensao', valorPadrao: 500 },
  { nome: 'Limpeza de injecao eletronica', categoria: 'Motor', valorPadrao: 500 },
];

const STEPS = [
  { icon: Building2,     label: 'Oficina',   color: 'text-orange-500' },
  { icon: Wrench,        label: 'Servicos',  color: 'text-blue-500'   },
  { icon: Package,       label: 'Estoque',   color: 'text-emerald-500'},
  { icon: Users,         label: 'Cliente',   color: 'text-purple-500' },
  { icon: ClipboardList, label: 'Pronto!',   color: 'text-green-500'  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { empresa, refreshEmpresa } = useAuth();
  const { addServicoCatalogo, addCliente } = useStore();

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Step 0
  const [telefone, setTelefone] = useState(empresa?.telefone || '');
  const [endereco, setEndereco] = useState(empresa?.endereco || '');

  // Step 1
  const [selectedServicos, setSelectedServicos] = useState<number[]>([0, 1, 2, 3]);

  // Step 3
  const [clienteNome, setClienteNome] = useState('');
  const [clienteTel, setClienteTel] = useState('');

  const progress = Math.round((step / (STEPS.length - 1)) * 100);

  async function handleNext() {
    setSaving(true);
    try {
      if (step === 0 && empresa) {
        await supabase.from('empresas').update({ telefone, endereco }).eq('id', empresa.id);
        await refreshEmpresa();
      }

      if (step === 1) {
        for (const idx of selectedServicos) {
          try { await addServicoCatalogo(DEFAULT_SERVICOS[idx]); } catch { /* skip dupes */ }
        }
      }

      if (step === 3 && clienteNome.trim()) {
        try {
          await addCliente({
            nome: clienteNome.trim(),
            telefone: clienteTel,
            whatsapp: clienteTel,
            cpfCnpj: '', email: '', endereco: '', observacoes: '',
          });
        } catch { /* ignore */ }
      }

      if (step === STEPS.length - 1) {
        if (empresa) {
          await supabase.from('empresas').update({ onboarding_completo: true }).eq('id', empresa.id);
          await refreshEmpresa();
        }
        toast.success('Tudo pronto! Bem-vindo ao Motor em Dia!');
        router.push('/dashboard');
        return;
      }

      setStep(s => s + 1);
    } finally {
      setSaving(false);
    }
  }

  function toggleServico(idx: number) {
    setSelectedServicos(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--background))] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-orange-500/30">
            <Wrench className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[rgb(var(--foreground))]">Configurando sua oficina</h1>
          <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">Passo {step + 1} de {STEPS.length}</p>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-[rgb(var(--muted))] rounded-full mb-6 overflow-hidden">
          <div
            className="h-full bg-orange-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Step indicators */}
        <div className="flex justify-between mb-8 px-2">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const done = i < step;
            const active = i === step;
            return (
              <div key={s.label} className="flex flex-col items-center gap-1">
                <div className={cn(
                  'w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300',
                  done ? 'bg-emerald-500' : active ? 'bg-orange-500' : 'bg-[rgb(var(--muted))]'
                )}>
                  {done
                    ? <CheckCircle2 className="w-5 h-5 text-white" />
                    : <Icon className={cn('w-4 h-4', active ? 'text-white' : 'text-[rgb(var(--muted-foreground))]')} />
                  }
                </div>
                <span className={cn('text-[10px] font-medium hidden sm:block',
                  active ? 'text-orange-500' : done ? 'text-emerald-500' : 'text-[rgb(var(--muted-foreground))]'
                )}>{s.label}</span>
              </div>
            );
          })}
        </div>

        {/* Card */}
        <div className="bg-[rgb(var(--card))] border border-[rgb(var(--card-border))] rounded-2xl p-6 shadow-xl">

          {/* Step 0: Dados da oficina */}
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-[rgb(var(--foreground))]">Dados da Oficina</h2>
              <p className="text-sm text-[rgb(var(--muted-foreground))]">Complemente as informacoes — pode ser editado depois em Configuracoes.</p>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-[rgb(var(--foreground))]">Telefone</label>
                <input type="tel" placeholder="(11) 3333-4444" value={telefone} onChange={e => setTelefone(e.target.value)} className={inputCn} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-[rgb(var(--foreground))]">Endereco</label>
                <input type="text" placeholder="Rua, numero, bairro, cidade" value={endereco} onChange={e => setEndereco(e.target.value)} className={inputCn} />
              </div>
            </div>
          )}

          {/* Step 1: Servicos */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-[rgb(var(--foreground))]">Servicos Comuns</h2>
              <p className="text-sm text-[rgb(var(--muted-foreground))]">Selecione os servicos que sua oficina realiza. Pode adicionar mais depois.</p>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {DEFAULT_SERVICOS.map((s, i) => (
                  <label key={i} className={cn(
                    'flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors',
                    selectedServicos.includes(i)
                      ? 'border-orange-500 bg-orange-500/5'
                      : 'border-[rgb(var(--card-border))] hover:bg-[rgb(var(--muted))]'
                  )}>
                    <input
                      type="checkbox"
                      checked={selectedServicos.includes(i)}
                      onChange={() => toggleServico(i)}
                      className="w-4 h-4 accent-orange-500 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[rgb(var(--foreground))]">{s.nome}</p>
                      <p className="text-xs text-[rgb(var(--muted-foreground))]">R$ {s.valorPadrao}</p>
                    </div>
                    <span className="text-xs bg-orange-500/10 text-orange-500 px-2 py-0.5 rounded flex-shrink-0">{s.categoria}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Estoque */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-[rgb(var(--foreground))]">Estoque de Pecas</h2>
              <p className="text-sm text-[rgb(var(--muted-foreground))]">
                Voce pode cadastrar suas pecas agora ou fazer isso depois na aba <strong>Estoque</strong>.
              </p>
              <div className="flex items-center justify-center py-10">
                <div className="text-center">
                  <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Package className="w-8 h-8 text-emerald-500" />
                  </div>
                  <p className="text-sm font-medium text-[rgb(var(--foreground))]">Cadastro de pecas disponivel</p>
                  <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">Acesse a aba Estoque a qualquer momento</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Primeiro cliente */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-[rgb(var(--foreground))]">Primeiro Cliente</h2>
              <p className="text-sm text-[rgb(var(--muted-foreground))]">Cadastre seu primeiro cliente agora (opcional).</p>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-[rgb(var(--foreground))]">Nome do Cliente</label>
                <input type="text" placeholder="Nome completo" value={clienteNome} onChange={e => setClienteNome(e.target.value)} className={inputCn} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-[rgb(var(--foreground))]">Telefone / WhatsApp</label>
                <input type="tel" placeholder="(11) 99999-9999" value={clienteTel} onChange={e => setClienteTel(e.target.value)} className={inputCn} />
              </div>
            </div>
          )}

          {/* Step 4: Pronto */}
          {step === 4 && (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <div className="w-20 h-20 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-xl font-bold text-[rgb(var(--foreground))]">Tudo configurado!</h2>
              <p className="text-sm text-[rgb(var(--muted-foreground))] max-w-xs">
                Sua oficina esta pronta no Motor em Dia. Clique em Comecar para ir ao painel principal.
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-6">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep(s => s - 1)}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[rgb(var(--input-border))] text-sm font-medium text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))] transition-colors disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" /> Voltar
              </button>
            )}
            {step === 1 && (
              <button
                type="button"
                onClick={() => setStep(s => s + 1)}
                disabled={saving}
                className="px-4 py-2.5 rounded-xl border border-[rgb(var(--input-border))] text-sm text-[rgb(var(--muted-foreground))] hover:bg-[rgb(var(--muted))] transition-colors disabled:opacity-50"
              >
                Pular
              </button>
            )}
            <button
              type="button"
              onClick={handleNext}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-colors disabled:opacity-60"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {step === STEPS.length - 1 ? 'Comecar agora!' : 'Proximo'}
              {step < STEPS.length - 1 && !saving && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
