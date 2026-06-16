import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(dateStr));
}

export function formatDateLong(dateStr: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateStr));
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return phone;
}

export function formatPlate(plate: string): string {
  return plate.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function generateOSNumber(): string {
  const timestamp = Date.now().toString().slice(-6);
  return `OS-${timestamp}`;
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    aberta: 'Aberta',
    em_andamento: 'Em Andamento',
    aguardando_peca: 'Aguardando Peça',
    finalizada: 'Finalizada',
    entregue: 'Entregue',
    agendado: 'Agendado',
    confirmado: 'Confirmado',
    cancelado: 'Cancelado',
    concluido: 'Concluído',
  };
  return labels[status] || status;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    aberta: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    em_andamento: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    aguardando_peca: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    finalizada: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    entregue: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    agendado: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    confirmado: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    cancelado: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    concluido: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  };
  return colors[status] || 'bg-slate-100 text-slate-600';
}

export function buildWhatsAppLink(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, '');
  const number = digits.startsWith('55') ? digits : `55${digits}`;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
