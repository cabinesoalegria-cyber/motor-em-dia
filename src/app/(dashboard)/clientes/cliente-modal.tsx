'use client';

import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useStore } from '@/lib/store';
import { Cliente } from '@/lib/types';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
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

export function ClienteModal({ cliente, onClose }: Props) {
  const { addCliente, updateCliente } = useStore();

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

  // Watch telefone to auto-fill WhatsApp if WhatsApp is empty or same as old phone
  const telefoneValue = watch('telefone');
  const whatsappValue = watch('whatsapp');

  useEffect(() => {
    // Only auto-fill if creating new client or whatsapp is empty/same as telefone
    if (!cliente && telefoneValue) {
      setValue('whatsapp', telefoneValue);
    }
  }, [telefoneValue, cliente, setValue]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  function onSubmit(data: FormData) {
    if (cliente) {
      updateCliente(cliente.id, {
        nome: data.nome,
        telefone: data.telefone,
        whatsapp: data.whatsapp,
        cpfCnpj: data.cpfCnpj || '',
        email: data.email || '',
        endereco: data.endereco || '',
        observacoes: data.observacoes || '',
      } as any);
      toast.success('Cliente atualizado!');
    } else {
      addCliente({
        nome: data.nome,
        telefone: data.telefone,
        whatsapp: data.whatsapp,
        cpfCnpj: data.cpfCnpj || '',
        email: data.email || '',
        endereco: data.endereco || '',
        observacoes: data.observacoes || '',
      } as any);
      toast.success('Cliente cadastrado!');
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
