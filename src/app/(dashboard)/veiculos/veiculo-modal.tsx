'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useStore } from '@/lib/store';
import { Veiculo } from '@/lib/types';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { toast } from 'sonner';

const schema = z.object({
  clienteId: z.string().min(1, 'Selecione um cliente'),
  marca: z.string().min(1, 'Marca obrigatória'),
  modelo: z.string().min(1, 'Modelo obrigatório'),
  ano: z.number().min(1950).max(new Date().getFullYear() + 1),
  placa: z.string().min(7, 'Placa obrigatória'),
  cor: z.string().min(1, 'Cor obrigatória'),
  quilometragem: z.number().min(0),
  observacoes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const MARCAS = [
  'Chevrolet', 'Volkswagen', 'Toyota', 'Fiat', 'Honda', 'Ford',
  'Hyundai', 'Renault', 'Nissan', 'Jeep', 'Mitsubishi', 'Peugeot',
  'Citroën', 'Kia', 'BMW', 'Mercedes-Benz', 'Audi', 'Outra',
];

// ⚠️ Field definido FORA do componente para evitar remount
function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-1.5">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

const inputCn = cn(
  'w-full px-3 py-2.5 rounded-xl text-sm border',
  'bg-[rgb(var(--input-bg))] border-[rgb(var(--input-border))]',
  'text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))]',
  'focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-colors'
);

export function VeiculoModal({ veiculo, onClose }: { veiculo: Veiculo | null; onClose: () => void }) {
  const { addVeiculo, updateVeiculo, clientes } = useStore();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: veiculo
      ? {
          clienteId: veiculo.clienteId,
          marca: veiculo.marca,
          modelo: veiculo.modelo,
          ano: veiculo.ano,
          placa: veiculo.placa,
          cor: veiculo.cor,
          quilometragem: veiculo.quilometragem,
          observacoes: veiculo.observacoes || '',
        }
      : { ano: new Date().getFullYear(), quilometragem: 0 },
  });

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  function onSubmit(data: FormData) {
    if (veiculo) {
      updateVeiculo(veiculo.id, { ...data, placa: data.placa.toUpperCase() });
      toast.success('Veículo atualizado!');
    } else {
      addVeiculo({ ...data, placa: data.placa.toUpperCase() });
      toast.success('Veículo cadastrado!');
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={cn(
        'relative w-full sm:max-w-lg rounded-2xl',
        'bg-[rgb(var(--card))] border border-[rgb(var(--card-border))]',
        'shadow-2xl max-h-[90vh] overflow-y-auto'
      )}>
        <div className="flex items-center justify-between p-5 border-b border-[rgb(var(--card-border))] sticky top-0 bg-[rgb(var(--card))] z-10">
          <h2 className="text-base font-semibold text-[rgb(var(--foreground))]">
            {veiculo ? 'Editar Veículo' : 'Novo Veículo'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[rgb(var(--muted))] transition-colors text-[rgb(var(--muted-foreground))]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
          <Field label="Cliente *" error={errors.clienteId?.message}>
            <select {...register('clienteId')} className={cn(inputCn, 'appearance-none')} autoFocus>
              <option value="">Selecione um cliente</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Marca *" error={errors.marca?.message}>
              <select {...register('marca')} className={cn(inputCn, 'appearance-none')}>
                <option value="">Selecione</option>
                {MARCAS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </Field>
            <Field label="Modelo *" error={errors.modelo?.message}>
              <input {...register('modelo')} className={inputCn} placeholder="Onix, Gol, Corolla..." />
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Ano *" error={errors.ano?.message}>
              <input {...register('ano', { valueAsNumber: true })} type="number" className={inputCn} placeholder="2020" />
            </Field>
            <Field label="Placa *" error={errors.placa?.message}>
              <input {...register('placa')} className={cn(inputCn, 'uppercase')} placeholder="ABC1234" maxLength={8} />
            </Field>
            <Field label="Cor *" error={errors.cor?.message}>
              <input {...register('cor')} className={inputCn} placeholder="Prata" />
            </Field>
          </div>

          <Field label="Quilometragem" error={errors.quilometragem?.message}>
            <input {...register('quilometragem', { valueAsNumber: true })} type="number" className={inputCn} placeholder="0" />
          </Field>

          <Field label="Observações">
            <textarea {...register('observacoes')} className={cn(inputCn, 'resize-none')} rows={2} placeholder="Observações sobre o veículo..." />
          </Field>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className={cn(
              'flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors',
              'border-[rgb(var(--input-border))] text-[rgb(var(--foreground))]',
              'hover:bg-[rgb(var(--muted))]'
            )}>
              Cancelar
            </button>
            <button type="submit" className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-orange-500 text-white hover:bg-orange-600 transition-colors shadow-sm">
              {veiculo ? 'Salvar' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
