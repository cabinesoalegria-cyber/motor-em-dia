'use client';

import { useState, useMemo, Suspense } from 'react';
import { useStore } from '@/lib/store';
import { useAuth } from '@/lib/auth-context';
import { OrdemServico } from '@/lib/types';
import { formatCurrency, formatDate, getStatusColor, getStatusLabel, cn, buildWhatsAppLink } from '@/lib/utils';
import {
  Search, Plus, X, ChevronDown, Wrench, ArrowRight, Car, Trash2
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useSearchParams } from 'next/navigation';

const STATUS_OPTIONS = [
  { value: '', label: 'Todos os Status' },
  { value: 'aberta', label: 'Aberta' },
  { value: 'em_andamento', label: 'Em Andamento' },
  { value: 'aguardando_peca', label: 'Aguardando Peça' },
  { value: 'finalizada', label: 'Finalizada' },
  { value: 'entregue', label: 'Entregue' },
];

function OrdensPageInner() {
  const { ordens, clientes, veiculos, updateOrdemStatus, deleteOrdem } = useStore();
  const { empresa } = useAuth();
  const officeName = empresa?.nome ?? 'Nossa Oficina';
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const filterClienteId = searchParams.get('clienteId');
  const initStatus = searchParams.get('status') || '';
  const [activeStatus, setActiveStatus] = useState(initStatus);

  const currentStatusFilter = activeStatus || statusFilter;

  const ordensComDetalhes = useMemo(() =>
    ordens.map((o) => ({
      ...o,
      cliente: clientes.find((c) => c.id === o.clienteId),
      veiculo: veiculos.find((v) => v.id === o.veiculoId),
    })),
    [ordens, clientes, veiculos]
  );

  const filtered = useMemo(() => {
    let list = ordensComDetalhes;
    if (filterClienteId) list = list.filter((o) => o.clienteId === filterClienteId);
    if (currentStatusFilter) list = list.filter((o) => o.status === currentStatusFilter);

    const q = search.toLowerCase().trim();
    if (q) {
      list = list.filter(
        (o) =>
          // Busca por placa (prioridade)
          o.veiculo?.placa.toLowerCase().replace(/[^a-z0-9]/g, '').includes(q.replace(/[^a-z0-9]/g, '')) ||
          o.veiculo?.placa.toLowerCase().includes(q) ||
          // Busca por número da OS
          o.numero.toLowerCase().includes(q) ||
          // Busca por nome do cliente (secundário)
          o.cliente?.nome.toLowerCase().includes(q) ||
          // Busca por modelo do veículo
          `${o.veiculo?.marca} ${o.veiculo?.modelo}`.toLowerCase().includes(q) ||
          // Busca por problema
          o.problemaRelatado.toLowerCase().includes(q)
      );
    }
    return [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [ordensComDetalhes, search, currentStatusFilter, filterClienteId]);

  function handleQuickStatus(id: string, status: OrdemServico['status']) {
    updateOrdemStatus(id, status);
    toast.success(`Status: "${getStatusLabel(status)}"`);
  }

  const nextStatus: Record<string, OrdemServico['status']> = {
    aberta: 'em_andamento',
    em_andamento: 'finalizada',
    aguardando_peca: 'em_andamento',
    finalizada: 'entregue',
    entregue: 'entregue',
  };

  const inputCn = cn(
    'w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border',
    'bg-[rgb(var(--input-bg))] border-[rgb(var(--input-border))]',
    'text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))]',
    'focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500'
  );

  return (
    <>
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--muted-foreground))]" />
          <input
            type="text"
            placeholder="Buscar por placa, nº OS, cliente, modelo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={inputCn}
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(var(--muted-foreground))]">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="relative">
          <select
            value={currentStatusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setActiveStatus(''); }}
            className={cn(
              'appearance-none pl-3 pr-8 py-2.5 rounded-xl text-sm border h-full',
              'bg-[rgb(var(--input-bg))] border-[rgb(var(--input-border))]',
              'text-[rgb(var(--foreground))]',
              'focus:outline-none focus:ring-2 focus:ring-orange-500/40'
            )}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--muted-foreground))] pointer-events-none" />
        </div>
        <Link
          href="/ordens/nova"
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-medium hover:bg-orange-600 transition-colors shadow-sm flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          Nova OS
        </Link>
      </div>

      {/* Dica de busca */}
      <p className="text-xs text-[rgb(var(--muted-foreground))]">
        💡 Busca por <strong>placa</strong> (ex: ABC1234), número da OS ou nome do cliente · {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
      </p>

      {/* OS List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className={cn('rounded-2xl p-12 text-center border', 'bg-[rgb(var(--card))] border-[rgb(var(--card-border))]')}>
            <Wrench className="w-8 h-8 text-[rgb(var(--muted-foreground))] mx-auto mb-2" />
            <p className="text-[rgb(var(--muted-foreground))]">Nenhuma OS encontrada</p>
            <Link href="/ordens/nova" className="mt-2 text-xs text-orange-500 hover:underline block">
              Criar primeira OS
            </Link>
          </div>
        ) : (
          filtered.map((o) => (
            <div
              key={o.id}
              className={cn(
                'rounded-2xl border transition-all duration-200',
                'bg-[rgb(var(--card))] border-[rgb(var(--card-border))]',
                'hover:border-orange-500/30 hover:shadow-sm'
              )}
            >
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Wrench className="w-5 h-5 text-orange-500" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-sm text-[rgb(var(--foreground))]">{o.numero}</span>
                      <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', getStatusColor(o.status))}>
                        {getStatusLabel(o.status)}
                      </span>
                    </div>

                    {/* Placa em destaque */}
                    {o.veiculo && (
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1.5 bg-[rgb(var(--muted))] px-2.5 py-1 rounded-lg">
                          <Car className="w-3.5 h-3.5 text-[rgb(var(--muted-foreground))]" />
                          <span className="font-mono font-bold text-sm text-[rgb(var(--foreground))] tracking-wide">
                            {o.veiculo.placa}
                          </span>
                        </div>
                        <span className="text-sm text-[rgb(var(--muted-foreground))]">
                          {o.veiculo.marca} {o.veiculo.modelo} {o.veiculo.ano}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-sm text-[rgb(var(--muted-foreground))]">
                        👤 {o.cliente?.nome ?? '—'}
                      </span>
                    </div>
                    <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1 line-clamp-1">{o.problemaRelatado}</p>
                    <p className="text-xs text-[rgb(var(--muted-foreground))] mt-0.5">{formatDate(o.dataEntrada)}</p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-[rgb(var(--foreground))]">{formatCurrency(o.valorTotal)}</p>
                    {o.status !== 'entregue' && (
                      <button
                        onClick={() => handleQuickStatus(o.id, nextStatus[o.status])}
                        className="mt-1 text-xs text-orange-500 hover:underline whitespace-nowrap"
                      >
                        → {getStatusLabel(nextStatus[o.status])}
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-[rgb(var(--card-border))]">
                  <Link href={`/ordens/${o.id}`} className="flex items-center gap-1 text-xs text-orange-500 hover:underline">
                    Ver detalhes <ArrowRight className="w-3 h-3" />
                  </Link>
                  <div className="flex items-center gap-2">
                    {/* Botão WhatsApp — aparece quando OS está finalizada */}
                    {o.status === 'finalizada' && o.cliente && (
                      (() => {
                        const telefone = o.cliente.whatsapp || o.cliente.telefone || '';
                        const veiculo = o.veiculo
                          ? `${o.veiculo.marca} ${o.veiculo.modelo} (${o.veiculo.placa})`
                          : 'seu veículo';
                        const msg = [
                          `Olá *${o.cliente.nome}*! ✅`,
                          ``,
                          `Seu veículo *${veiculo}* está pronto e aguardando sua retirada.`,
                          ``,
                          `Para melhor organização dos atendimentos da oficina, pedimos que, se possível, a retirada seja realizada ainda hoje ou no próximo horário disponível para você.`,
                          ``,
                          `Estamos à disposição.`,
                          ``,
                          `Obrigado pela preferência!`,
                          ``,
                          `*_${officeName}_* 🚗🔧`,
                        ].join('\n');
                        return telefone ? (
                          <a
                            href={buildWhatsAppLink(telefone, msg)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs font-medium text-[#25D366] hover:text-[#1ebe5d] hover:bg-[#25D366]/10 px-2 py-1 rounded-lg transition-colors"
                            title="Avisar cliente que o veículo está pronto"
                          >
                            {/* WhatsApp native icon */}
                            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-[#25D366]" xmlns="http://www.w3.org/2000/svg">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.534 5.86L.054 23.25a.75.75 0 0 0 .916.983l5.578-1.453A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.712 9.712 0 0 1-4.953-1.355l-.355-.21-3.678.958.988-3.574-.232-.368A9.712 9.712 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/>
                            </svg>
                            Avisar
                          </a>
                        ) : null;
                      })()
                    )}
                    <button
                      onClick={() => setDeleteConfirmId(o.id)}
                      className="flex items-center gap-1 text-xs text-[rgb(var(--muted-foreground))] hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>

    {/* Delete confirmation modal */}
    {deleteConfirmId && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="w-full max-w-sm bg-[rgb(var(--card))] border border-[rgb(var(--card-border))] rounded-2xl p-6 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-6 h-6 text-red-500" />
          </div>
          <h3 className="text-center font-bold text-[rgb(var(--foreground))] mb-2">Excluir Ordem de Serviço?</h3>
          <p className="text-center text-sm text-[rgb(var(--muted-foreground))] mb-6">
            Esta ação é permanente e não pode ser desfeita.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setDeleteConfirmId(null)}
              className="flex-1 py-2.5 rounded-xl border-2 border-[rgb(var(--card-border))] text-sm font-semibold text-[rgb(var(--foreground))] hover:border-orange-400 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={async () => {
                await deleteOrdem(deleteConfirmId);
                setDeleteConfirmId(null);
                toast.success('OS excluída');
              }}
              className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-sm font-bold text-white transition-colors"
            >
              Excluir definitivamente
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

export default function OrdensPage() {
  return (
    <Suspense fallback={<div />}>
      <OrdensPageInner />
    </Suspense>
  );
}
