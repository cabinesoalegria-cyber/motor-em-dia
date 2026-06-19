'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useStore } from '@/lib/store';
import { Cliente } from '@/lib/types';
import { cn } from '@/lib/utils';
import { X, Car, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';

const schema = z.object({
  nome: z.string().min(2, 'Nome obrigatório'),
  telefone: z.string().min(8, 'Telefone obrigatório'),
  whatsapp: z.string().min(8, 'WhatsApp obrigatório'),
  cpfCnpj: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  endereco: z.string().optional(),
  observacoes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  cliente: Cliente | null;
  onClose: () => void;
}

const inputCn = cn(
  'w-full px-3 py-2.5 rounded-xl text-sm border',
  'bg-[rgb(var(--input-bg))] border-[rgb(var(--input-border))]',
  'text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))]',
  'focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-colors'
);

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-1.5">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ─── Veículo section (only for new clients) ───────────────────────────────
interface VeiculoForm {
  placa: string;
  marca: string;
  modelo: string;
  ano: string;
  cor: string;
  quilometragem: string;
}

const MARCAS_SUGESTOES = [
  'Chevrolet', 'Fiat', 'Ford', 'Volkswagen', 'Honda', 'Toyota', 'Hyundai',
  'Renault', 'Nissan', 'Jeep', 'Mitsubishi', 'Peugeot', 'Citroën', 'Kia',
  'BMW', 'Mercedes-Benz', 'Audi', 'Volvo', 'Land Rover', 'Subaru',
];

function VeiculoSection({
  value,
  onChange,
}: {
  value: VeiculoForm;
  onChange: (v: VeiculoForm) => void;
}) {
  const currentYear = new Date().getFullYear();

  function set(field: keyof VeiculoForm, val: string) {
    onChange({ ...value, [field]: val });
  }

  return (
    <div className="space-y-3">
      {/* Placa */}
      <div>
        <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-1.5">Placa *</label>
        <input
          type="text"
          placeholder="ABC-1234 ou ABC1D23"
          value={value.placa}
          onChange={e => set('placa', e.target.value.toUpperCase())}
          className={inputCn}
          maxLength={8}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Marca */}
        <div>
          <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-1.5">Marca *</label>
          <input
            list="marcas-list"
            type="text"
            placeholder="Ex: Chevrolet"
            value={value.marca}
            onChange={e => set('marca', e.target.value)}
            className={inputCn}
          />
          <datalist id="marcas-list">
            {MARCAS_SUGESTOES.map(m => <option key={m} value={m} />)}
          </datalist>
        </div>

        {/* Modelo */}
        <div>
          <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-1.5">Modelo *</label>
          <input
            type="text"
            placeholder="Ex: Onix 1.0"
            value={value.modelo}
            onChange={e => set('modelo', e.target.value)}
            className={inputCn}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {/* Ano */}
        <div>
          <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-1.5">Ano</label>
          <input
            type="number"
            placeholder={String(currentYear)}
            value={value.ano}
            onChange={e => set('ano', e.target.value)}
            className={inputCn}
            min="1950"
            max={String(currentYear + 1)}
          />
        </div>

        {/* Cor */}
        <div>
          <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-1.5">Cor</label>
          <input
            type="text"
            placeholder="Branco"
            value={value.cor}
            onChange={e => set('cor', e.target.value)}
            className={inputCn}
          />
        </div>

        {/* Km */}
        <div>
          <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-1.5">Km atual</label>
          <input
            type="number"
            placeholder="0"
            value={value.quilometragem}
            onChange={e => set('quilometragem', e.target.value)}
            className={inputCn}
            min="0"
          />
        </div>
      </div>
    </div>
  );
}

// ─── Main Modal ──────────────────────────────────────────────────────────
export function ClienteModal({ cliente, onClose }: Props) {
  const { addCliente, updateCliente, addVeiculo } = useStore();
  const isNew = !cliente;

  // Vehicle toggle (only for new clients)
  const [addVeiculoEnabled, setAddVeiculoEnabled] = useState(false);
  const [veiculo, setVeiculo] = useState<VeiculoForm>({
    placa: '', marca: '', modelo: '', ano: '', cor: '', quilometragem: '',
  });

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: cliente
      ? {
          nome: cliente.nome,
          telefone: cliente.telefone,
          whatsapp: cliente.whatsapp,
          cpfCnpj: cliente.cpfCnpj || '',
          email: cliente.email || '',
          endereco: (cliente as any).endereco || '',
          observacoes: cliente.observacoes || '',
        }
      : { whatsapp: '', telefone: '' },
  });

  // Watch telefone to auto-fill WhatsApp if new client
  const telefoneValue = watch('telefone');

  useEffect(() => {
    if (!cliente && telefoneValue) {
      setValue('whatsapp', telefoneValue);
    }
  }, [telefoneValue, cliente, setValue]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  async function onSubmit(data: FormData) {
    if (cliente) {
      // Editing: only update client
      await updateCliente(cliente.id, {
        nome: data.nome,
        telefone: data.telefone,
        whatsapp: data.whatsapp,
        cpfCnpj: data.cpfCnpj || '',
        email: data.email || '',
        endereco: data.endereco || '',
        observacoes: data.observacoes || '',
      } as any);
      toast.success('Cliente atualizado!');
      onClose();
      return;
    }

    try {
      // New client — await to get the returned ID
      const clienteId = await addCliente({
        nome: data.nome,
        telefone: data.telefone,
        whatsapp: data.whatsapp,
        cpfCnpj: data.cpfCnpj || '',
        email: data.email || '',
        endereco: data.endereco || '',
        observacoes: data.observacoes || '',
      } as any);

      // Save vehicle if enabled and at least placa+marca+modelo filled
      if (addVeiculoEnabled && veiculo.placa.trim() && veiculo.marca.trim() && veiculo.modelo.trim() && clienteId) {
        await addVeiculo({
          clienteId,
          marca: veiculo.marca.trim(),
          modelo: veiculo.modelo.trim(),
          placa: veiculo.placa.trim().toUpperCase(),
          ano: parseInt(veiculo.ano) || new Date().getFullYear(),
          cor: veiculo.cor.trim() || '',
          quilometragem: parseInt(veiculo.quilometragem) || 0,
          observacoes: '',
        } as any);
        toast.success('Cliente e veículo cadastrados! 🚗');
      } else {
        toast.success('Cliente cadastrado!');
      }
    } catch (err) {
      console.error(err);
      toast.error('Erro ao cadastrar. Tente novamente.');
      return;
    }

    onClose();
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={cn(
        'relative w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl',
        'bg-[rgb(var(--card))] border border-[rgb(var(--card-border))]',
        'shadow-2xl max-h-[92vh] overflow-y-auto'
      )}>
        <div className="flex items-center justify-between p-5 border-b border-[rgb(var(--card-border))] sticky top-0 bg-[rgb(var(--card))] z-10">
          <h2 className="text-base font-semibold text-[rgb(var(--foreground))]">
            {cliente ? 'Editar Cliente' : 'Novo Cliente'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[rgb(var(--muted))] transition-colors text-[rgb(var(--muted-foreground))]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
          {/* ── Cliente fields ── */}
          <Field label="Nome completo *" error={errors.nome?.message}>
            <input {...register('nome')} className={inputCn} placeholder="João da Silva" autoFocus />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Telefone *" error={errors.telefone?.message}>
              <input
                {...register('telefone')}
                className={inputCn}
                placeholder="(11) 99999-0001"
                type="tel"
              />
            </Field>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-[rgb(var(--foreground))]">WhatsApp *</label>
                {!cliente && (
                  <button
                    type="button"
                    onClick={() => setValue('whatsapp', watch('telefone'))}
                    className="text-xs text-orange-500 hover:underline"
                  >
                    = Telefone
                  </button>
                )}
              </div>
              <input {...register('whatsapp')} className={inputCn} placeholder="(11) 99999-0001" type="tel" />
              {errors.whatsapp && <p className="mt-1 text-xs text-red-500">{errors.whatsapp.message}</p>}
            </div>
          </div>

          <Field label="Endereço">
            <input
              {...register('endereco')}
              className={inputCn}
              placeholder="Rua, nº, bairro, cidade — ES"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="CPF / CNPJ" error={errors.cpfCnpj?.message}>
              <input {...register('cpfCnpj')} className={inputCn} placeholder="000.000.000-00" />
            </Field>
            <Field label="Email" error={errors.email?.message}>
              <input {...register('email')} type="email" className={inputCn} placeholder="email@email.com" />
            </Field>
          </div>

          <Field label="Observações">
            <textarea
              {...register('observacoes')}
              className={cn(inputCn, 'resize-none')}
              rows={2}
              placeholder="Observações sobre o cliente..."
            />
          </Field>

          {/* ── Veículo section (new client only) ── */}
          {isNew && (
            <div className="border border-[rgb(var(--card-border))] rounded-xl overflow-hidden">
              {/* Toggle header */}
              <button
                type="button"
                onClick={() => setAddVeiculoEnabled(v => !v)}
                className={cn(
                  'w-full flex items-center justify-between px-4 py-3 text-sm font-semibold transition-colors',
                  addVeiculoEnabled
                    ? 'bg-blue-500/10 text-blue-500 border-b border-[rgb(var(--card-border))]'
                    : 'bg-[rgb(var(--muted))] text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]'
                )}
              >
                <span className="flex items-center gap-2">
                  <Car className="w-4 h-4" />
                  {addVeiculoEnabled ? 'Cadastrar veículo junto' : '+ Adicionar veículo (opcional)'}
                </span>
                {addVeiculoEnabled ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {/* Vehicle fields */}
              {addVeiculoEnabled && (
                <div className="p-4">
                  <p className="text-xs text-[rgb(var(--muted-foreground))] mb-3">
                    O veículo será salvo automaticamente na aba Veículos vinculado a este cliente.
                  </p>
                  <VeiculoSection value={veiculo} onChange={setVeiculo} />
                </div>
              )}
            </div>
          )}

          {/* ── Actions ── */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className={cn(
                'flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors',
                'border-[rgb(var(--input-border))] text-[rgb(var(--foreground))]',
                'hover:bg-[rgb(var(--muted))]'
              )}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-orange-500 text-white hover:bg-orange-600 transition-colors shadow-sm"
            >
              {cliente ? 'Salvar' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
