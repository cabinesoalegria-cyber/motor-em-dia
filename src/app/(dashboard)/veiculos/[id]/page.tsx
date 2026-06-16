'use client';

import { useParams } from 'next/navigation';
import { useStore } from '@/lib/store';
import { formatCurrency, formatDate, getStatusColor, getStatusLabel, cn } from '@/lib/utils';
import { ArrowLeft, Calendar, DollarSign, Gauge, Wrench, Package } from 'lucide-react';
import Link from 'next/link';

export default function VeiculoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { veiculos, clientes, ordens } = useStore();

  const veiculo = veiculos.find((v) => v.id === id);
  const cliente = veiculo ? clientes.find((c) => c.id === veiculo.clienteId) : null;
  const veiculoOrdens = veiculo
    ? [...ordens.filter((o) => o.veiculoId === id)].sort(
        (a, b) => new Date(b.dataEntrada).getTime() - new Date(a.dataEntrada).getTime()
      )
    : [];

  if (!veiculo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <p className="text-[rgb(var(--muted-foreground))]">Veículo não encontrado</p>
        <Link href="/veiculos" className="text-orange-500 hover:underline text-sm">Voltar</Link>
      </div>
    );
  }

  const totalGasto = veiculoOrdens.reduce((s, o) => s + o.valorTotal, 0);
  const totalPecas = veiculoOrdens.flatMap((o) => o.pecas);

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Back */}
      <Link href="/veiculos" className="inline-flex items-center gap-1.5 text-sm text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Voltar para Veículos
      </Link>

      {/* Vehicle Header */}
      <div className={cn(
        'rounded-2xl overflow-hidden border',
        'bg-[rgb(var(--card))] border-[rgb(var(--card-border))]'
      )}>
        <div className="bg-gradient-to-r from-orange-500 to-amber-600 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">{veiculo.marca} {veiculo.modelo}</h2>
              <p className="text-white/80 mt-0.5">{veiculo.ano} · {veiculo.cor}</p>
            </div>
            <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
              <p className="text-white font-mono font-bold text-xl tracking-widest">{veiculo.placa}</p>
            </div>
          </div>
        </div>

        <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-[rgb(var(--muted-foreground))] mb-1">
              <Gauge className="w-4 h-4" />
              <span className="text-xs">KM Atual</span>
            </div>
            <p className="font-bold text-[rgb(var(--foreground))]">{veiculo.quilometragem.toLocaleString('pt-BR')}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-[rgb(var(--muted-foreground))] mb-1">
              <Wrench className="w-4 h-4" />
              <span className="text-xs">OS Realizadas</span>
            </div>
            <p className="font-bold text-[rgb(var(--foreground))]">{veiculoOrdens.length}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-[rgb(var(--muted-foreground))] mb-1">
              <DollarSign className="w-4 h-4" />
              <span className="text-xs">Total Gasto</span>
            </div>
            <p className="font-bold text-[rgb(var(--foreground))]">{formatCurrency(totalGasto)}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-[rgb(var(--muted-foreground))] mb-1">
              <Package className="w-4 h-4" />
              <span className="text-xs">Peças Trocadas</span>
            </div>
            <p className="font-bold text-[rgb(var(--foreground))]">{totalPecas.length}</p>
          </div>
        </div>

        {cliente && (
          <div className="px-5 pb-5">
            <Link href={`/clientes`} className="text-sm text-orange-500 hover:underline">
              👤 {cliente.nome}
            </Link>
          </div>
        )}
      </div>

      {/* History */}
      <div>
        <h3 className="font-semibold text-[rgb(var(--foreground))] mb-3">Histórico de Manutenções</h3>
        {veiculoOrdens.length === 0 ? (
          <div className={cn(
            'rounded-2xl p-10 text-center border',
            'bg-[rgb(var(--card))] border-[rgb(var(--card-border))]'
          )}>
            <Wrench className="w-8 h-8 text-[rgb(var(--muted-foreground))] mx-auto mb-2" />
            <p className="text-[rgb(var(--muted-foreground))] text-sm">Nenhuma OS registrada para este veículo</p>
            <Link href="/ordens/nova" className="mt-2 text-xs text-orange-500 hover:underline block">
              Criar OS
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {veiculoOrdens.map((os) => (
              <Link
                key={os.id}
                href={`/ordens/${os.id}`}
                className={cn(
                  'block rounded-2xl p-4 border transition-all duration-200',
                  'bg-[rgb(var(--card))] border-[rgb(var(--card-border))]',
                  'hover:border-orange-500/30 hover:shadow-sm'
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-[rgb(var(--foreground))]">{os.numero}</span>
                      <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', getStatusColor(os.status))}>
                        {getStatusLabel(os.status)}
                      </span>
                    </div>
                    <p className="text-sm text-[rgb(var(--muted-foreground))] line-clamp-1">{os.problemaRelatado}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1 text-xs text-[rgb(var(--muted-foreground))]">
                        <Calendar className="w-3 h-3" />
                        {formatDate(os.dataEntrada)}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-[rgb(var(--muted-foreground))]">
                        <Gauge className="w-3 h-3" />
                        {os.quilometragemAtual.toLocaleString('pt-BR')} km
                      </div>
                    </div>
                    {os.pecas.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {os.pecas.map((p, i) => (
                          <span key={i} className="text-xs bg-[rgb(var(--muted))] text-[rgb(var(--muted-foreground))] px-2 py-0.5 rounded-full">
                            {p.nome}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-[rgb(var(--foreground))]">{formatCurrency(os.valorTotal)}</p>
                    {os.servicos.length > 0 && (
                      <p className="text-xs text-[rgb(var(--muted-foreground))] mt-0.5">{os.servicos.length} serviço{os.servicos.length !== 1 ? 's' : ''}</p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
