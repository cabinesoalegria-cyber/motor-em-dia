'use client';

import { useState, useMemo, Suspense } from 'react';
import { useStore } from '@/lib/store';
import { Veiculo } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Search, Plus, Edit2, Trash2, X, History, Car } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { VeiculoModal } from './veiculo-modal';
import { useSearchParams } from 'next/navigation';

const BRAND_COLORS: Record<string, string> = {
  Chevrolet: 'from-yellow-400 to-yellow-600',
  Volkswagen: 'from-blue-400 to-blue-600',
  Toyota: 'from-red-400 to-red-600',
  Fiat: 'from-orange-400 to-orange-600',
  Honda: 'from-red-500 to-red-700',
  Ford: 'from-blue-500 to-blue-700',
  Hyundai: 'from-sky-400 to-sky-600',
  Renault: 'from-yellow-500 to-yellow-700',
  Nissan: 'from-gray-500 to-gray-700',
  Jeep: 'from-green-500 to-green-700',
};

function VeiculosPageInner() {
  const { veiculos, clientes, ordens, deleteVeiculo } = useStore();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVeiculo, setEditingVeiculo] = useState<Veiculo | null>(null);
  const searchParams = useSearchParams();
  const filterClienteId = searchParams.get('clienteId');

  const filtered = useMemo(() => {
    let list = veiculos;
    if (filterClienteId) list = list.filter((v) => v.clienteId === filterClienteId);
    const q = search.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!search.trim()) return list;
    const qRaw = search.toLowerCase().trim();
    return list.filter(
      (v) =>
        // Busca por placa (prioridade — ignora traços e espaços)
        v.placa.toLowerCase().replace(/[^a-z0-9]/g, '').includes(q) ||
        v.placa.toLowerCase().includes(qRaw) ||
        // Busca por marca/modelo
        v.modelo.toLowerCase().includes(qRaw) ||
        v.marca.toLowerCase().includes(qRaw) ||
        // Busca por nome do cliente
        clientes.find(c => c.id === v.clienteId)?.nome.toLowerCase().includes(qRaw)
    );
  }, [veiculos, search, filterClienteId, clientes]);

  const veiculosComInfo = useMemo(() =>
    filtered.map((v) => ({
      ...v,
      cliente: clientes.find((c) => c.id === v.clienteId),
      totalOS: ordens.filter((o) => o.veiculoId === v.id).length,
    })),
    [filtered, clientes, ordens]
  );

  function handleDelete(veiculo: Veiculo) {
    if (confirm(`Excluir veículo "${veiculo.marca} ${veiculo.modelo} - ${veiculo.placa}"?`)) {
      deleteVeiculo(veiculo.id);
      toast.success('Veículo excluído');
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--muted-foreground))]" />
          <input
            type="text"
            placeholder="Buscar por placa (ex: ABC1234), marca ou modelo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cn(
              'w-full pl-9 pr-4 py-2.5 rounded-xl text-sm border',
              'bg-[rgb(var(--input-bg))] border-[rgb(var(--input-border))]',
              'text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))]',
              'focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500'
            )}
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(var(--muted-foreground))]">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <button
          onClick={() => { setEditingVeiculo(null); setModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-medium hover:bg-orange-600 transition-colors shadow-sm flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          Novo Veículo
        </button>
      </div>

      <p className="text-sm text-[rgb(var(--muted-foreground))]">
        {veiculosComInfo.length} veículo{veiculosComInfo.length !== 1 ? 's' : ''} encontrado{veiculosComInfo.length !== 1 ? 's' : ''}
        {filterClienteId && clientes.find(c => c.id === filterClienteId) && (
          <> de <span className="font-medium">{clientes.find(c => c.id === filterClienteId)?.nome}</span></>
        )}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {veiculosComInfo.length === 0 ? (
          <div className={cn(
            'sm:col-span-2 rounded-2xl p-12 text-center border',
            'bg-[rgb(var(--card))] border-[rgb(var(--card-border))]'
          )}>
            <p className="text-[rgb(var(--muted-foreground))]">Nenhum veículo encontrado</p>
          </div>
        ) : (
          veiculosComInfo.map((v) => {
            const gradientClass = BRAND_COLORS[v.marca] || 'from-slate-400 to-slate-600';
            return (
              <div
                key={v.id}
                className={cn(
                  'rounded-2xl border overflow-hidden transition-all duration-200',
                  'bg-[rgb(var(--card))] border-[rgb(var(--card-border))]',
                  'hover:border-orange-500/30 hover:shadow-md'
                )}
              >
                {/* Card header */}
                <div className={`bg-gradient-to-r ${gradientClass} p-4 flex items-center justify-between`}>
                  <div>
                    <p className="text-white font-bold text-lg leading-none">{v.marca}</p>
                    <p className="text-white/80 text-sm">{v.modelo} • {v.ano}</p>
                  </div>
                  <div className="bg-white/20 rounded-lg px-3 py-1.5">
                    <span className="text-white font-mono font-bold text-sm tracking-widest">{v.placa}</span>
                  </div>
                </div>

                {/* Card body */}
                <div className="p-4">
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="text-center">
                      <p className="text-xs text-[rgb(var(--muted-foreground))]">Cor</p>
                      <p className="text-sm font-medium text-[rgb(var(--foreground))]">{v.cor}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-[rgb(var(--muted-foreground))]">KM</p>
                      <p className="text-sm font-medium text-[rgb(var(--foreground))]">{v.quilometragem.toLocaleString('pt-BR')}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-[rgb(var(--muted-foreground))]">OS Realizadas</p>
                      <p className="text-sm font-medium text-[rgb(var(--foreground))]">{v.totalOS}</p>
                    </div>
                  </div>

                  {v.cliente && (
                    <p className="text-xs text-[rgb(var(--muted-foreground))] mb-3">
                      👤 {v.cliente.nome}
                    </p>
                  )}

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/veiculos/${v.id}`}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium bg-[rgb(var(--muted))] text-[rgb(var(--foreground))] hover:bg-orange-500/10 hover:text-orange-500 transition-colors"
                    >
                      <History className="w-3.5 h-3.5" />
                      Histórico
                    </Link>
                    <button
                      onClick={() => { setEditingVeiculo(v); setModalOpen(true); }}
                      className="p-2 rounded-lg text-[rgb(var(--muted-foreground))] hover:text-blue-500 hover:bg-blue-500/10 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(v)}
                      className="p-2 rounded-lg text-[rgb(var(--muted-foreground))] hover:text-red-500 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {modalOpen && (
        <VeiculoModal
          veiculo={editingVeiculo}
          onClose={() => { setModalOpen(false); setEditingVeiculo(null); }}
        />
      )}
    </div>
  );
}

export default function VeiculosPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-[rgb(var(--muted-foreground))]" />}>
      <VeiculosPageInner />
    </Suspense>
  );
}
