'use client';

import { useState, useMemo } from 'react';
import { useStore } from '@/lib/store';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import {
  BarChart2, Users, Wrench, TrendingUp, Calendar,
  ChevronDown, ChevronUp, ClipboardList, DollarSign, Car,
} from 'lucide-react';

// ── Helpers ─────────────────────────────────────────────────────────────────
function parseDate(s: string): Date {
  return new Date(s.length === 10 ? s + 'T12:00:00' : s);
}

function StatBox({ label, value, color = 'orange', sub }: {
  label: string; value: string | number; color?: string; sub?: string;
}) {
  const colorMap: Record<string, string> = {
    orange: 'text-orange-500 bg-orange-500/10',
    blue:   'text-blue-500   bg-blue-500/10',
    green:  'text-emerald-500 bg-emerald-500/10',
    purple: 'text-purple-500 bg-purple-500/10',
    slate:  'text-slate-500  bg-slate-500/10',
  };
  return (
    <div className={cn('rounded-2xl p-4 border bg-[rgb(var(--card))] border-[rgb(var(--card-border))]')}>
      <p className="text-xs text-[rgb(var(--muted-foreground))] mb-1">{label}</p>
      <p className={cn('text-2xl font-bold', colorMap[color]?.split(' ')[0])}>{value}</p>
      {sub && <p className="text-xs text-[rgb(var(--muted-foreground))] mt-0.5">{sub}</p>}
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────
export default function RelatoriosPage() {
  const { ordens, clientes, veiculos } = useStore();

  // ── Date filter ───────────────────────────────────────────────────────────
  const today = new Date();
  const firstOfMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
  const todayStr    = today.toISOString().split('T')[0];

  const [dataInicio, setDataInicio] = useState(firstOfMonth);
  const [dataFim,    setDataFim]    = useState(todayStr);
  const [tab, setTab] = useState<'mecanicos' | 'veiculos' | 'clientes'>('mecanicos');
  const [expandedMec, setExpandedMec] = useState<string | null>(null);

  // ── Filtered OS ───────────────────────────────────────────────────────────
  const ordensFiltered = useMemo(() => {
    const from = parseDate(dataInicio);
    const to   = parseDate(dataFim);
    to.setHours(23, 59, 59, 999);
    return ordens.filter(o => {
      const d = parseDate(o.dataEntrada);
      return d >= from && d <= to;
    });
  }, [ordens, dataInicio, dataFim]);

  // ── Relatório de Mecânicos ────────────────────────────────────────────────
  const relMecanicos = useMemo(() => {
    const map = new Map<string, {
      nome: string;
      totalOS: number;
      totalMO: number;
      totalPecas: number;
      totalGeral: number;
      os: typeof ordens;
    }>();

    const sem = 'Sem mecânico';
    ordensFiltered.forEach(o => {
      const key = o.mecanico?.trim() || sem;
      const cur = map.get(key) ?? { nome: key, totalOS: 0, totalMO: 0, totalPecas: 0, totalGeral: 0, os: [] };
      cur.totalOS++;
      cur.totalMO    += o.valorMaoDeObra;
      cur.totalPecas += o.valorPecas;
      cur.totalGeral += o.valorTotal;
      cur.os = [...cur.os, o];
      map.set(key, cur);
    });

    return [...map.values()]
      .filter(m => m.nome !== sem || m.totalOS > 0)
      .sort((a, b) => b.totalMO - a.totalMO);
  }, [ordensFiltered]);

  // ── Relatório de Veículos ─────────────────────────────────────────────────
  const relVeiculos = useMemo(() => {
    const map = new Map<string, { veiculo: typeof veiculos[0]; totalOS: number; totalGeral: number }>();
    ordensFiltered.forEach(o => {
      const v = veiculos.find(v => v.id === o.veiculoId);
      if (!v) return;
      const cur = map.get(v.id) ?? { veiculo: v, totalOS: 0, totalGeral: 0 };
      cur.totalOS++;
      cur.totalGeral += o.valorTotal;
      map.set(v.id, cur);
    });
    return [...map.values()].sort((a, b) => b.totalOS - a.totalOS).slice(0, 15);
  }, [ordensFiltered, veiculos]);

  // ── Relatório de Clientes ─────────────────────────────────────────────────
  const relClientes = useMemo(() => {
    const map = new Map<string, { cliente: typeof clientes[0]; totalOS: number; totalGasto: number }>();
    ordensFiltered.forEach(o => {
      const c = clientes.find(c => c.id === o.clienteId);
      if (!c) return;
      const cur = map.get(c.id) ?? { cliente: c, totalOS: 0, totalGasto: 0 };
      cur.totalOS++;
      cur.totalGasto += o.valorTotal;
      map.set(c.id, cur);
    });
    return [...map.values()].sort((a, b) => b.totalGasto - a.totalGasto).slice(0, 15);
  }, [ordensFiltered, clientes]);

  // ── Totais gerais ─────────────────────────────────────────────────────────
  const totalGeral = useMemo(() => ({
    os:    ordensFiltered.length,
    mo:    ordensFiltered.reduce((s, o) => s + o.valorMaoDeObra, 0),
    pecas: ordensFiltered.reduce((s, o) => s + o.valorPecas, 0),
    total: ordensFiltered.reduce((s, o) => s + o.valorTotal, 0),
  }), [ordensFiltered]);

  const inputCn = cn(
    'px-3 py-2 rounded-xl text-sm border',
    'bg-[rgb(var(--input-bg))] border-[rgb(var(--input-border))]',
    'text-[rgb(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-orange-500/40',
  );

  return (
    <div className="max-w-5xl mx-auto space-y-5">

      {/* ── FILTRO DE PERÍODO ──────────────────────────────────────────── */}
      <div className={cn('rounded-2xl p-5 border', 'bg-[rgb(var(--card))] border-[rgb(var(--card-border))]')}>
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-4 h-4 text-orange-500" />
          <h2 className="font-semibold text-[rgb(var(--foreground))]">Período do Relatório</h2>
        </div>
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs text-[rgb(var(--muted-foreground))] mb-1">Data Início</label>
            <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} className={inputCn} />
          </div>
          <div>
            <label className="block text-xs text-[rgb(var(--muted-foreground))] mb-1">Data Fim</label>
            <input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} className={inputCn} />
          </div>
          <div className="flex gap-2">
            {[
              { label: 'Hoje',    fn: () => { setDataInicio(todayStr); setDataFim(todayStr); } },
              { label: 'Mês',     fn: () => { setDataInicio(firstOfMonth); setDataFim(todayStr); } },
              { label: 'Trim.',   fn: () => {
                const t = new Date(); t.setMonth(t.getMonth() - 3);
                setDataInicio(t.toISOString().split('T')[0]); setDataFim(todayStr);
              }},
              { label: '12M',     fn: () => {
                const t = new Date(); t.setFullYear(t.getFullYear() - 1);
                setDataInicio(t.toISOString().split('T')[0]); setDataFim(todayStr);
              }},
            ].map(({ label, fn }) => (
              <button key={label} onClick={fn}
                className="px-3 py-2 rounded-xl text-xs font-semibold border border-[rgb(var(--card-border))] text-[rgb(var(--muted-foreground))] hover:border-orange-400 hover:text-orange-500 hover:bg-orange-500/5 transition-all">
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── RESUMO GERAL ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatBox label="OS no Período"     value={totalGeral.os}                        color="blue"   />
        <StatBox label="Mão de Obra"       value={formatCurrency(totalGeral.mo)}        color="orange" />
        <StatBox label="Peças"             value={formatCurrency(totalGeral.pecas)}     color="purple" />
        <StatBox label="Faturamento Total" value={formatCurrency(totalGeral.total)}     color="green"  />
      </div>

      {/* ── ABAS ────────────────────────────────────────────────────────── */}
      <div className="flex gap-1 p-1 bg-[rgb(var(--muted))] rounded-xl">
        {([
          { key: 'mecanicos', label: 'Mecânicos',  icon: Users },
          { key: 'veiculos',  label: 'Veículos',   icon: Car },
          { key: 'clientes',  label: 'Clientes',   icon: ClipboardList },
        ] as const).map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={cn('flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all',
              tab === key
                ? 'bg-[rgb(var(--card))] text-orange-500 shadow-sm'
                : 'text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]'
            )}>
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* ── RELATÓRIO DE MECÂNICOS ───────────────────────────────────────── */}
      {tab === 'mecanicos' && (
        <div className="space-y-3">
          {relMecanicos.length === 0 ? (
            <div className="text-center py-12 text-[rgb(var(--muted-foreground))]">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Nenhuma OS no período</p>
              <p className="text-sm mt-1">Ajuste o filtro de datas ou cadastre mecânicos nas Configurações</p>
            </div>
          ) : relMecanicos.map((m, idx) => (
            <div key={m.nome} className={cn('rounded-2xl border overflow-hidden', 'bg-[rgb(var(--card))] border-[rgb(var(--card-border))]')}>
              {/* Header do mecânico */}
              <button
                onClick={() => setExpandedMec(expandedMec === m.nome ? null : m.nome)}
                className="w-full flex items-center gap-4 px-5 py-4 hover:bg-[rgb(var(--muted))]/50 transition-colors text-left"
              >
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0',
                  idx === 0 ? 'bg-yellow-500/15 text-yellow-600' :
                  idx === 1 ? 'bg-slate-400/20 text-slate-500' :
                  idx === 2 ? 'bg-orange-600/15 text-orange-600' :
                  'bg-blue-500/10 text-blue-500'
                )}>
                  {m.nome === 'Sem mecânico' ? '—' : m.nome.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[rgb(var(--foreground))] truncate">{m.nome}</p>
                  <p className="text-xs text-[rgb(var(--muted-foreground))]">{m.totalOS} OS · MO: {formatCurrency(m.totalMO)}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-lg font-bold text-orange-500">{formatCurrency(m.totalGeral)}</p>
                  <p className="text-xs text-[rgb(var(--muted-foreground))]">total faturado</p>
                </div>
                {expandedMec === m.nome
                  ? <ChevronUp className="w-4 h-4 text-[rgb(var(--muted-foreground))] flex-shrink-0" />
                  : <ChevronDown className="w-4 h-4 text-[rgb(var(--muted-foreground))] flex-shrink-0" />}
              </button>

              {/* Lista de OS do mecânico */}
              {expandedMec === m.nome && (
                <div className="border-t border-[rgb(var(--card-border))]">
                  {/* Mini stats */}
                  <div className="grid grid-cols-3 divide-x divide-[rgb(var(--card-border))] border-b border-[rgb(var(--card-border))]">
                    {[
                      { label: 'Mão de Obra', val: formatCurrency(m.totalMO) },
                      { label: 'Peças',        val: formatCurrency(m.totalPecas) },
                      { label: 'OS Feitas',    val: String(m.totalOS) },
                    ].map(({ label, val }) => (
                      <div key={label} className="py-3 px-4 text-center">
                        <p className="text-xs text-[rgb(var(--muted-foreground))]">{label}</p>
                        <p className="text-sm font-bold text-[rgb(var(--foreground))]">{val}</p>
                      </div>
                    ))}
                  </div>
                  {/* OS list */}
                  <div className="divide-y divide-[rgb(var(--card-border))]">
                    {m.os.map(o => {
                      const c = clientes.find(c => c.id === o.clienteId);
                      const v = veiculos.find(v => v.id === o.veiculoId);
                      return (
                        <div key={o.id} className="flex items-center gap-3 px-5 py-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-xs font-bold text-[rgb(var(--muted-foreground))]">{o.numero}</span>
                              <span className="text-sm font-medium text-[rgb(var(--foreground))] truncate">{c?.nome ?? '—'}</span>
                            </div>
                            <p className="text-xs text-[rgb(var(--muted-foreground))] truncate">
                              {v ? `${v.marca} ${v.modelo} · ${v.placa}` : '—'} · {formatDate(o.dataEntrada)}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-sm font-semibold text-orange-500">{formatCurrency(o.valorMaoDeObra)}</p>
                            <p className="text-xs text-[rgb(var(--muted-foreground))]">MO</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-sm font-bold text-[rgb(var(--foreground))]">{formatCurrency(o.valorTotal)}</p>
                            <p className="text-xs text-[rgb(var(--muted-foreground))]">total</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── RELATÓRIO DE VEÍCULOS ─────────────────────────────────────────── */}
      {tab === 'veiculos' && (
        <div className={cn('rounded-2xl border', 'bg-[rgb(var(--card))] border-[rgb(var(--card-border))]')}>
          {relVeiculos.length === 0 ? (
            <div className="text-center py-12 text-[rgb(var(--muted-foreground))]">
              <Car className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Nenhuma OS no período</p>
            </div>
          ) : (
            <div className="divide-y divide-[rgb(var(--card-border))]">
              <div className="grid grid-cols-4 gap-2 px-5 py-3 text-xs font-semibold text-[rgb(var(--muted-foreground))] uppercase tracking-wide">
                <span className="col-span-2">Veículo</span>
                <span className="text-center">OS</span>
                <span className="text-right">Total</span>
              </div>
              {relVeiculos.map(({ veiculo: v, totalOS, totalGeral }) => {
                const c = clientes.find(c => c.id === v.clienteId);
                return (
                  <div key={v.id} className="grid grid-cols-4 gap-2 px-5 py-3 items-center hover:bg-[rgb(var(--muted))]/40 transition-colors">
                    <div className="col-span-2 min-w-0">
                      <p className="text-sm font-semibold text-[rgb(var(--foreground))] truncate">{v.marca} {v.modelo} · <span className="font-mono">{v.placa}</span></p>
                      <p className="text-xs text-[rgb(var(--muted-foreground))] truncate">{c?.nome ?? '—'}</p>
                    </div>
                    <p className="text-center text-sm font-bold text-blue-500">{totalOS}</p>
                    <p className="text-right text-sm font-bold text-orange-500">{formatCurrency(totalGeral)}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── RELATÓRIO DE CLIENTES ─────────────────────────────────────────── */}
      {tab === 'clientes' && (
        <div className={cn('rounded-2xl border', 'bg-[rgb(var(--card))] border-[rgb(var(--card-border))]')}>
          {relClientes.length === 0 ? (
            <div className="text-center py-12 text-[rgb(var(--muted-foreground))]">
              <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Nenhuma OS no período</p>
            </div>
          ) : (
            <div className="divide-y divide-[rgb(var(--card-border))]">
              <div className="grid grid-cols-4 gap-2 px-5 py-3 text-xs font-semibold text-[rgb(var(--muted-foreground))] uppercase tracking-wide">
                <span className="col-span-2">Cliente</span>
                <span className="text-center">OS</span>
                <span className="text-right">Total Gasto</span>
              </div>
              {relClientes.map(({ cliente: c, totalOS, totalGasto }, i) => (
                <div key={c.id} className="grid grid-cols-4 gap-2 px-5 py-3 items-center hover:bg-[rgb(var(--muted))]/40 transition-colors">
                  <div className="col-span-2 flex items-center gap-3 min-w-0">
                    <div className={cn('w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                      i === 0 ? 'bg-yellow-400/20 text-yellow-600' : 'bg-blue-500/10 text-blue-500'
                    )}>
                      {c.nome.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[rgb(var(--foreground))] truncate">{c.nome}</p>
                      <p className="text-xs text-[rgb(var(--muted-foreground))] truncate">{c.telefone}</p>
                    </div>
                  </div>
                  <p className="text-center text-sm font-bold text-blue-500">{totalOS}</p>
                  <p className="text-right text-sm font-bold text-emerald-500">{formatCurrency(totalGasto)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
