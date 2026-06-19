'use client';

import { useState, useMemo, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { formatCurrency, formatDate, getStatusColor, getStatusLabel, cn } from '@/lib/utils';
import { ContaPagar, Lancamento } from '@/lib/types';
import {
  TrendingUp, TrendingDown, DollarSign, AlertTriangle, Plus, Trash2,
  Lock, Eye, EyeOff, ArrowRight, ShieldCheck, LogOut, Pencil, CheckCircle2,
  X, Save, Clock, History, BarChart2, FileSpreadsheet, Download, SlidersHorizontal,
  Filter, Users,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import Link from 'next/link';
import { toast } from 'sonner';

// ─── Auth ────────────────────────────────────────────────────────────────
const SENHA_PADRAO = 'admin123';
const SESSION_KEY = 'autoflow-financeiro-auth';
const SESSION_DURATION = 30 * 60 * 1000;

const inputCn = cn(
  'w-full px-3 py-2.5 rounded-xl text-sm border',
  'bg-[rgb(var(--input-bg))] border-[rgb(var(--input-border))]',
  'text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))]',
  'focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-colors'
);

// ─── Login ───────────────────────────────────────────────────────────────
function FinanceiroLogin({ onSuccess }: { onSuccess: () => void }) {
  const [senha, setSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [erro, setErro] = useState('');
  const [tentativas, setTentativas] = useState(0);
  const bloqueado = tentativas >= 5;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (bloqueado) return;
    const senhaCorreta = localStorage.getItem('autoflow-financeiro-senha') || SENHA_PADRAO;
    if (senha === senhaCorreta) {
      localStorage.setItem(SESSION_KEY, String(Date.now()));
      setErro('');
      onSuccess();
    } else {
      setTentativas(t => t + 1);
      setErro(`Senha incorreta. ${4 - tentativas} tentativa${4 - tentativas !== 1 ? 's' : ''} restante${4 - tentativas !== 1 ? 's' : ''}.`);
      setSenha('');
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className={cn('w-full max-w-sm rounded-2xl border p-8', 'bg-[rgb(var(--card))] border-[rgb(var(--card-border))] shadow-xl')}>
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-slate-700 flex items-center justify-center mb-4 shadow-lg">
            <Lock className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-xl font-bold text-[rgb(var(--foreground))]">Área Administrativa</h2>
          <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1 text-center">O módulo financeiro é protegido por senha</p>
        </div>
        {bloqueado ? (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
            <p className="text-sm text-red-600 dark:text-red-400 font-medium">Acesso bloqueado após 5 tentativas.</p>
            <button onClick={() => { setTentativas(0); setErro(''); }} className="mt-2 text-xs text-red-500 hover:underline">
              Desbloquear
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-1.5">Senha de Acesso</label>
              <div className="relative">
                <input
                  type={showSenha ? 'text' : 'password'}
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  placeholder="Digite a senha..."
                  autoFocus
                  className={cn(inputCn, 'pr-10', erro && 'border-red-500/60')}
                />
                <button type="button" onClick={() => setShowSenha(!showSenha)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]">
                  {showSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {erro && <p className="mt-1.5 text-xs text-red-500">{erro}</p>}
            </div>
            <button type="submit" disabled={!senha} className="w-full py-3 rounded-xl text-sm font-semibold bg-slate-700 text-white hover:bg-slate-600 disabled:opacity-50 transition-colors shadow-sm">
              Acessar Financeiro
            </button>
          </form>
        )}
        <p className="mt-4 text-center text-xs text-[rgb(var(--muted-foreground))]">
          Senha padrão: <span className="font-mono">admin123</span> · Altere nas{' '}
          <Link href="/configuracoes" className="text-orange-500 hover:underline">configurações</Link>
        </p>
      </div>
    </div>
  );
}

// ─── Edit Modal for Lancamento ───────────────────────────────────────────
function EditLancamentoModal({
  lancamento,
  onSave,
  onClose,
}: {
  lancamento: Lancamento;
  onSave: (id: string, data: Partial<Lancamento>) => void;
  onClose: () => void;
}) {
  const [tipo, setTipo] = useState<'entrada' | 'saida'>(lancamento.tipo);
  const [descricao, setDescricao] = useState(lancamento.descricao);
  const [valor, setValor] = useState(String(lancamento.valor));
  const [data, setData] = useState(lancamento.data);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={cn('relative w-full max-w-sm rounded-2xl p-5 shadow-2xl', 'bg-[rgb(var(--card))] border border-[rgb(var(--card-border))]')}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-[rgb(var(--foreground))]">Editar Lançamento</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[rgb(var(--muted))] text-[rgb(var(--muted-foreground))]">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-3">
          <div className="flex gap-2">
            <button onClick={() => setTipo('entrada')} className={cn('flex-1 py-2 rounded-lg text-xs font-medium transition-colors', tipo === 'entrada' ? 'bg-emerald-500 text-white' : 'bg-[rgb(var(--input-bg))] text-[rgb(var(--muted-foreground))]')}>
              + Entrada
            </button>
            <button onClick={() => setTipo('saida')} className={cn('flex-1 py-2 rounded-lg text-xs font-medium transition-colors', tipo === 'saida' ? 'bg-red-500 text-white' : 'bg-[rgb(var(--input-bg))] text-[rgb(var(--muted-foreground))]')}>
              - Saída
            </button>
          </div>
          <input type="text" placeholder="Descrição" value={descricao} onChange={e => setDescricao(e.target.value)} className={inputCn} />
          <div className="grid grid-cols-2 gap-2">
            <input type="number" placeholder="Valor (R$)" value={valor} onChange={e => setValor(e.target.value)} className={inputCn} />
            <input type="date" value={data} onChange={e => setData(e.target.value)} className={inputCn} />
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={onClose} className="flex-1 py-2 rounded-lg text-xs border border-[rgb(var(--input-border))] text-[rgb(var(--foreground))] hover:bg-[rgb(var(--input-bg))] transition-colors">
              Cancelar
            </button>
            <button
              onClick={() => { onSave(lancamento.id, { tipo, descricao, valor: Number(valor), data }); onClose(); }}
              className="flex-1 py-2 rounded-lg text-xs bg-orange-500 text-white hover:bg-orange-600 transition-colors font-medium"
            >
              <Save className="w-3.5 h-3.5 inline mr-1" />Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Relatórios Tab ──────────────────────────────────────────────────────
function RelatoriosTab() {
  const { ordens, clientes, veiculos } = useStore();

  const todayStr = new Date().toISOString().split('T')[0];
  const firstOfMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-01`;

  const [dataInicio, setDataInicio] = useState(firstOfMonth);
  const [dataFim,    setDataFim]    = useState(todayStr);
  const [mecanicoSel, setMecanicoSel] = useState('todos');
  const [percentagem, setPercentagem] = useState(40);

  const mecanicosDisponiveis = useMemo(() => {
    const s = new Set<string>();
    ordens.forEach(o => { if (o.mecanico?.trim()) s.add(o.mecanico.trim()); });
    return [...s].sort();
  }, [ordens]);

  const ordensNoPeriodo = useMemo(() => {
    const from = new Date(dataInicio + 'T00:00:00');
    const to   = new Date(dataFim   + 'T23:59:59');
    return ordens.filter(o => { const d = new Date(o.dataEntrada); return d >= from && d <= to; });
  }, [ordens, dataInicio, dataFim]);

  const ordensFiltradas = useMemo(() =>
    mecanicoSel === 'todos' ? ordensNoPeriodo
      : ordensNoPeriodo.filter(o => (o.mecanico?.trim() || '') === mecanicoSel),
    [ordensNoPeriodo, mecanicoSel]
  );

  const totalMO    = ordensFiltradas.reduce((s, o) => s + o.valorMaoDeObra, 0);
  const valorPagar = totalMO * (percentagem / 100);
  const totalFat   = ordensFiltradas.reduce((s, o) => s + o.valorTotal, 0);

  function buildRows() {
    return ordensFiltradas.map(o => {
      const c = clientes.find(x => x.id === o.clienteId);
      const v = veiculos.find(x => x.id === o.veiculoId);
      const pct = parseFloat((o.valorMaoDeObra * percentagem / 100).toFixed(2));
      return {
        'OS': o.numero,
        'Data': o.dataEntrada,
        'Cliente': c?.nome || '',
        'Ve\u00edculo': v ? `${v.marca} ${v.modelo} ${v.placa}` : '',
        'Mec\u00e2nico': o.mecanico || '',
        'MO (R$)': o.valorMaoDeObra,
        'Pe\u00e7as (R$)': o.valorPecas,
        'Total (R$)': o.valorTotal,
        [`${percentagem}% MO (R$)`]: pct,
        'Status': o.status,
      } as Record<string, unknown>;
    });
  }

  function exportXLS() {
    const rows = buildRows();
    if (!rows.length) { toast.error('Nenhum dado'); return; }
    const keys = Object.keys(rows[0]);
    function esc(v: unknown) { return String(v ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
    const hdr = `<Row>${keys.map(k => `<Cell><Data ss:Type="String">${esc(k)}</Data></Cell>`).join('')}</Row>`;
    const dRows = rows.map(r => `<Row>${keys.map(k => { const v = r[k]; const t = typeof v === 'number' ? 'Number' : 'String'; return `<Cell><Data ss:Type="${t}">${esc(v)}</Data></Cell>`; }).join('')}</Row>`).join('');
    const sheet = mecanicoSel === 'todos' ? 'Todos' : mecanicoSel;
    const xml = `<?xml version="1.0" encoding="UTF-8"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="${esc(sheet)}"><Table>${hdr}${dRows}</Table></Worksheet></Workbook>`;
    const blob = new Blob(['\uFEFF' + xml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `relatorio-mecanico-${dataInicio}-${dataFim}.xls`; a.click();
    URL.revokeObjectURL(a.href); toast.success('XLS exportado!');
  }

  function exportPDF() {
    const nome = mecanicoSel === 'todos' ? 'Todos os Mec\u00e2nicos' : mecanicoSel;
    const d1 = new Date(dataInicio + 'T12:00').toLocaleDateString('pt-BR');
    const d2 = new Date(dataFim    + 'T12:00').toLocaleDateString('pt-BR');
    const tableRows = ordensFiltradas.map(o => {
      const c = clientes.find(x => x.id === o.clienteId);
      const v = veiculos.find(x => x.id === o.veiculoId);
      const pct = (o.valorMaoDeObra * percentagem / 100).toLocaleString('pt-BR', { style:'currency', currency:'BRL' });
      const mo  = o.valorMaoDeObra.toLocaleString('pt-BR', { style:'currency', currency:'BRL' });
      return `<tr><td>${o.numero}</td><td>${new Date(o.dataEntrada+'T12:00').toLocaleDateString('pt-BR')}</td><td>${c?.nome||'—'}</td><td>${v?`${v.marca} ${v.modelo} - ${v.placa}`:'—'}</td><td>${o.mecanico||'—'}</td><td>${mo}</td><td><strong>${pct}</strong></td></tr>`;
    }).join('');
    const moFmt  = totalMO.toLocaleString('pt-BR', { style:'currency', currency:'BRL' });
    const pagFmt = valorPagar.toLocaleString('pt-BR', { style:'currency', currency:'BRL' });
    const html = `<h1>Relat\u00f3rio de Mec\u00e2nicos \u2014 Motor em Dia</h1><p><b>Mec\u00e2nico:</b> ${nome} &nbsp;|&nbsp; <b>Per\u00edodo:</b> ${d1} a ${d2} &nbsp;|&nbsp; <b>%:</b> ${percentagem}%</p><hr><table><thead><tr><th>OS</th><th>Data</th><th>Cliente</th><th>Ve\u00edculo</th><th>Mec\u00e2nico</th><th>M\u00e3o de Obra</th><th>${percentagem}% a Pagar</th></tr></thead><tbody>${tableRows}</tbody></table><hr><p class="total">Total M\u00e3o de Obra: <strong>${moFmt}</strong> &nbsp;|&nbsp; ${percentagem}% a Pagar: <strong>${pagFmt}</strong></p>`;
    const w = window.open('','_blank','width=1000,height=750');
    if (!w) { toast.error('Popup bloqueado. Permita popups para este site.'); return; }
    w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Relat\u00f3rio</title><style>body{font-family:Arial,sans-serif;font-size:12px;padding:24px;color:#111}table{width:100%;border-collapse:collapse;margin:14px 0}th,td{border:1px solid #ccc;padding:6px 10px;text-align:left}th{background:#f3f4f6;font-weight:700}h1{font-size:18px;margin:0 0 6px}hr{border:1px solid #e5e7eb;margin:10px 0}.total{background:#fefce8;padding:8px 14px;border-radius:4px;font-size:13px}@media print{.noprint{display:none}}</style></head><body>${html}<br><button class="noprint" onclick="window.print()">Imprimir</button></body></html>`);
    w.document.close(); w.focus();
  }

  return (
    <div className="space-y-5">
      {/* Filtros */}
      <div className={cn('rounded-2xl p-5 border', 'bg-[rgb(var(--card))] border-[rgb(var(--card-border))]')}>
        <h3 className="font-semibold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" /> Filtros do Relat\u00f3rio
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs text-[rgb(var(--muted-foreground))] mb-1">Data In\u00edcio</label>
            <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} className={inputCn} />
          </div>
          <div>
            <label className="block text-xs text-[rgb(var(--muted-foreground))] mb-1">Data Fim</label>
            <input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} className={inputCn} />
          </div>
          <div>
            <label className="block text-xs text-[rgb(var(--muted-foreground))] mb-1">Mec\u00e2nico</label>
            <select value={mecanicoSel} onChange={e => setMecanicoSel(e.target.value)} className={inputCn}>
              <option value="todos">Todos os mec\u00e2nicos</option>
              {mecanicosDisponiveis.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-[rgb(var(--muted-foreground))] mb-1">% M\u00e3o de Obra</label>
            <div className="relative">
              <input type="number" value={percentagem} onChange={e => setPercentagem(Number(e.target.value))}
                min="0" max="100" step="0.5" className={cn(inputCn, 'pr-8')} />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[rgb(var(--muted-foreground))]">%</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          {[{l:'Hoje',f:()=>{setDataInicio(todayStr);setDataFim(todayStr);}},{l:'M\u00eas',f:()=>{setDataInicio(firstOfMonth);setDataFim(todayStr);}},{l:'Trim.',f:()=>{const t=new Date();t.setMonth(t.getMonth()-3);setDataInicio(t.toISOString().split('T')[0]);setDataFim(todayStr);}},{l:'12M',f:()=>{const t=new Date();t.setFullYear(t.getFullYear()-1);setDataInicio(t.toISOString().split('T')[0]);setDataFim(todayStr);}}].map(({l,f})=>(
            <button key={l} onClick={f} className="px-3 py-1 rounded-lg text-xs border border-[rgb(var(--card-border))] text-[rgb(var(--muted-foreground))] hover:border-orange-400 hover:text-orange-500 hover:bg-orange-500/5 transition-all">{l}</button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'OS no Per\u00edodo',    val: ordensFiltradas.length.toString(), c: 'text-blue-500' },
          { label: 'Total M\u00e3o de Obra', val: formatCurrency(totalMO),           c: 'text-orange-500' },
          { label: `${percentagem}% a Pagar`, val: formatCurrency(valorPagar),       c: 'text-emerald-500' },
          { label: 'Total Faturado',          val: formatCurrency(totalFat),          c: 'text-purple-500' },
        ].map(({label, val, c}) => (
          <div key={label} className={cn('rounded-2xl p-4 border', 'bg-[rgb(var(--card))] border-[rgb(var(--card-border))]')}>
            <p className="text-xs text-[rgb(var(--muted-foreground))] mb-1">{label}</p>
            <p className={cn('text-xl font-bold', c)}>{val}</p>
          </div>
        ))}
      </div>

      {/* OS Table */}
      <div className={cn('rounded-2xl border overflow-hidden', 'bg-[rgb(var(--card))] border-[rgb(var(--card-border))]')}>
        <div className="flex items-center justify-between p-5 border-b border-[rgb(var(--card-border))]">
          <h3 className="font-semibold text-[rgb(var(--foreground))]">Ordens de Servi\u00e7o</h3>
          <div className="flex gap-2">
            <button onClick={exportXLS} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-[rgb(var(--card-border))] text-[rgb(var(--muted-foreground))] hover:border-blue-400 hover:text-blue-500 hover:bg-blue-500/5 transition-all">
              <FileSpreadsheet className="w-3.5 h-3.5" /> XLS
            </button>
            <button onClick={exportPDF} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-[rgb(var(--card-border))] text-[rgb(var(--muted-foreground))] hover:border-red-400 hover:text-red-500 hover:bg-red-500/5 transition-all">
              PDF
            </button>
          </div>
        </div>
        {ordensFiltradas.length === 0 ? (
          <div className="py-12 text-center text-[rgb(var(--muted-foreground))]">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Nenhuma OS encontrada</p>
            <p className="text-sm mt-1">Ajuste o per\u00edodo ou o mec\u00e2nico selecionado</p>
          </div>
        ) : (
          <div className="divide-y divide-[rgb(var(--card-border))]">
            <div className="hidden sm:grid sm:grid-cols-12 gap-2 px-5 py-2.5 text-xs font-semibold text-[rgb(var(--muted-foreground))] uppercase tracking-wide bg-[rgb(var(--muted))]/40">
              <span className="col-span-2">OS</span>
              <span className="col-span-2">Data</span>
              <span className="col-span-3">Cliente</span>
              <span className="col-span-2">M\u00e3o de Obra</span>
              <span className="col-span-3 text-right">{percentagem}% MO</span>
            </div>
            {ordensFiltradas.map(o => {
              const c = clientes.find(x => x.id === o.clienteId);
              const v = veiculos.find(x => x.id === o.veiculoId);
              return (
                <div key={o.id} className="flex flex-wrap sm:grid sm:grid-cols-12 gap-2 px-5 py-3 items-center hover:bg-[rgb(var(--muted))]/40 transition-colors">
                  <div className="w-full sm:w-auto sm:col-span-2">
                    <span className="font-mono text-xs font-bold text-[rgb(var(--muted-foreground))]">{o.numero}</span>
                    {o.mecanico && mecanicoSel === 'todos' && (
                      <p className="text-xs text-blue-500 mt-0.5">{o.mecanico}</p>
                    )}
                  </div>
                  <span className="hidden sm:block sm:col-span-2 text-xs text-[rgb(var(--muted-foreground))]">
                    {new Date(o.dataEntrada+'T12:00').toLocaleDateString('pt-BR')}
                  </span>
                  <div className="flex-1 sm:col-span-3 min-w-0">
                    <p className="text-sm font-medium text-[rgb(var(--foreground))] truncate">{c?.nome||'\u2014'}</p>
                    {v && <p className="text-xs text-[rgb(var(--muted-foreground))] truncate">{v.placa}</p>}
                  </div>
                  <span className="sm:col-span-2 text-sm font-semibold text-orange-500">{formatCurrency(o.valorMaoDeObra)}</span>
                  <span className="sm:col-span-3 text-sm font-bold text-emerald-500 sm:text-right">{formatCurrency(o.valorMaoDeObra * percentagem / 100)}</span>
                </div>
              );
            })}
            <div className="flex sm:grid sm:grid-cols-12 gap-2 px-5 py-3 bg-[rgb(var(--muted))] font-bold">
              <span className="flex-1 sm:col-span-7 text-sm text-[rgb(var(--foreground))]">TOTAL ({ordensFiltradas.length} OS)</span>
              <span className="sm:col-span-2 text-sm text-orange-500">{formatCurrency(totalMO)}</span>
              <span className="sm:col-span-3 text-sm text-emerald-500 sm:text-right">{formatCurrency(valorPagar)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Content ─────────────────────────────────────────────────────────────
function FinanceiroContent({ onLogout }: { onLogout: () => void }) {
  const {
    lancamentos, clientes, veiculos, ordens,
    addLancamento, updateLancamento, deleteLancamento,
    contasPagar, addContaPagar, updateContaPagar, deleteContaPagar, pagarConta,
  } = useStore();

  // Tab state
  const [tab, setTab] = useState<'financeiro' | 'relatorios'>('financeiro');

  // Lan\u00e7amentos state
  const [showLancModal, setShowLancModal] = useState(false);
  const [tipo, setTipo] = useState<'entrada' | 'saida'>('entrada');
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [dataLanc, setDataLanc] = useState(new Date().toISOString().split('T')[0]);
  const [editingLanc, setEditingLanc] = useState<Lancamento | null>(null);

  // Contas a pagar state
  const [showContaModal, setShowContaModal] = useState(false);
  const [cDescricao, setCDescricao] = useState('');
  const [cValor, setCValor] = useState('');
  const [cVencimento, setCVencimento] = useState('');
  const [cFornecedor, setCFornecedor] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const currentMonth = today.slice(0, 7);

  const stats = useMemo(() => {
    const todayEntradas = lancamentos.filter(l => l.data.startsWith(today) && l.tipo === 'entrada').reduce((s, l) => s + l.valor, 0);
    const todaySaidas = lancamentos.filter(l => l.data.startsWith(today) && l.tipo === 'saida').reduce((s, l) => s + l.valor, 0);
    const mesEntradas = lancamentos.filter(l => l.data.startsWith(currentMonth) && l.tipo === 'entrada').reduce((s, l) => s + l.valor, 0);
    const mesSaidas = lancamentos.filter(l => l.data.startsWith(currentMonth) && l.tipo === 'saida').reduce((s, l) => s + l.valor, 0);
    const lucroMes = mesEntradas - mesSaidas;
    const contasReceber = ordens
      .filter(o => o.status === 'finalizada' || o.status === 'em_andamento')
      .filter(o => !lancamentos.some(l => l.ordemServicoId === o.id))
      .map(o => ({ ...o, cliente: clientes.find(c => c.id === o.clienteId) }));
    const totalContasPagar = contasPagar.filter(c => !c.pago).reduce((s, c) => s + c.valor, 0);
    return { todayEntradas, todaySaidas, mesEntradas, mesSaidas, lucroMes, contasReceber, totalContasPagar };
  }, [lancamentos, ordens, clientes, today, currentMonth, contasPagar]);

  const chartData = useMemo(() =>
    Array.from({ length: 14 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (13 - i));
      const dateStr = d.toISOString().split('T')[0];
      const label = `${d.getDate()}/${d.getMonth() + 1}`;
      const entradas = lancamentos.filter(l => l.data.startsWith(dateStr) && l.tipo === 'entrada').reduce((s, l) => s + l.valor, 0);
      const saidas = lancamentos.filter(l => l.data.startsWith(dateStr) && l.tipo === 'saida').reduce((s, l) => s + l.valor, 0);
      return { label, entradas, saidas };
    }),
    [lancamentos]
  );

  function handleAddLanc() {
    if (!descricao || !valor) { toast.error('Preencha todos os campos'); return; }
    addLancamento({ tipo, descricao, valor: Number(valor), data: dataLanc });
    toast.success(`${tipo === 'entrada' ? 'Entrada' : 'Saída'} registrada!`);
    setDescricao(''); setValor(''); setShowLancModal(false);
  }

  function handleAddConta() {
    if (!cDescricao || !cValor || !cVencimento) { toast.error('Preencha todos os campos'); return; }
    addContaPagar({ descricao: cDescricao, valor: Number(cValor), vencimento: cVencimento, fornecedor: cFornecedor, pago: false });
    toast.success('Conta a pagar cadastrada!');
    setCDescricao(''); setCValor(''); setCVencimento(''); setCFornecedor(''); setShowContaModal(false);
  }

  const recentLancamentos = [...lancamentos]
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
    .slice(0, 30);

  const contasPagarAtivas = contasPagar.filter(c => !c.pago).sort((a, b) => a.vencimento.localeCompare(b.vencimento));
  const contasPagarHistorico = contasPagar.filter(c => c.pago).slice(0, 10);

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Admin Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-700/20 border border-slate-700/30">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-xs font-medium text-slate-500">Acesso Administrativo</span>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500 hover:text-white transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          Sair do Financeiro
        </button>
      </div>

      {/* Tab selector */}
      <div className="flex gap-1 p-1 bg-[rgb(var(--muted))] rounded-xl">
        {([{key:'financeiro',label:'Financeiro',icon:DollarSign},{key:'relatorios',label:'Rel. Mec\u00e2nicos',icon:BarChart2}] as const).map(({key,label,icon:Icon})=>(
          <button key={key} onClick={() => setTab(key)}
            className={cn('flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-all',
              tab === key
                ? 'bg-[rgb(var(--card))] text-orange-500 shadow-sm'
                : 'text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]'
            )}>
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {tab === 'relatorios' && <RelatoriosTab />}
      {tab === 'financeiro' && (
        <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Entradas Hoje',   value: stats.todayEntradas, icon: TrendingUp,   color: 'text-emerald-500 bg-emerald-500/10' },
          { label: 'Saídas Hoje',     value: stats.todaySaidas,   icon: TrendingDown,  color: 'text-red-500 bg-red-500/10' },
          { label: 'Faturado no Mês', value: stats.mesEntradas,   icon: DollarSign,    color: 'text-orange-500 bg-orange-500/10' },
          { label: 'Lucro no Mês',    value: stats.lucroMes,      icon: TrendingUp,    color: stats.lucroMes >= 0 ? 'text-emerald-500 bg-emerald-500/10' : 'text-red-500 bg-red-500/10' },
        ].map((s) => (
          <div key={s.label} className={cn('rounded-2xl p-4 border', 'bg-[rgb(var(--card))] border-[rgb(var(--card-border))]')}>
            <div className={cn('p-2 rounded-lg w-fit mb-2', s.color)}>
              <s.icon className="w-4 h-4" />
            </div>
            <p className="text-xs text-[rgb(var(--muted-foreground))]">{s.label}</p>
            <p className="text-xl font-bold text-[rgb(var(--foreground))] mt-0.5">{formatCurrency(s.value)}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className={cn('rounded-2xl p-5 border', 'bg-[rgb(var(--card))] border-[rgb(var(--card-border))]')}>
        <h3 className="font-semibold text-[rgb(var(--foreground))] mb-4">Entradas × Saídas — Últimos 14 Dias</h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gEntradas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gSaidas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.15)" />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'rgb(100,116,139)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: 'rgb(100,116,139)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${v}`} />
            <Tooltip />
            <Area type="monotone" dataKey="entradas" stroke="#10b981" strokeWidth={2} fill="url(#gEntradas)" name="Entradas" />
            <Area type="monotone" dataKey="saidas"   stroke="#ef4444" strokeWidth={2} fill="url(#gSaidas)"   name="Saídas" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 2-col grid: Lançamentos + Contas a Receber */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Lançamentos */}
        <div className={cn('rounded-2xl p-5 border', 'bg-[rgb(var(--card))] border-[rgb(var(--card-border))]')}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[rgb(var(--foreground))]">Lançamentos</h3>
            <button
              onClick={() => setShowLancModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-orange-500 text-white hover:bg-orange-600 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Novo
            </button>
          </div>

          {showLancModal && (
            <div className="mb-4 p-4 rounded-xl bg-[rgb(var(--muted))] space-y-3">
              <div className="flex gap-2">
                <button onClick={() => setTipo('entrada')} className={cn('flex-1 py-2 rounded-lg text-xs font-medium transition-colors', tipo === 'entrada' ? 'bg-emerald-500 text-white' : 'bg-[rgb(var(--input-bg))] text-[rgb(var(--muted-foreground))]')}>+ Entrada</button>
                <button onClick={() => setTipo('saida')} className={cn('flex-1 py-2 rounded-lg text-xs font-medium transition-colors', tipo === 'saida' ? 'bg-red-500 text-white' : 'bg-[rgb(var(--input-bg))] text-[rgb(var(--muted-foreground))]')}>- Saída</button>
              </div>
              <input type="text" placeholder="Descrição" value={descricao} onChange={e => setDescricao(e.target.value)} className={inputCn} />
              <div className="grid grid-cols-2 gap-2">
                <input type="number" placeholder="Valor (R$)" value={valor} onChange={e => setValor(e.target.value)} className={inputCn} />
                <input type="date" value={dataLanc} onChange={e => setDataLanc(e.target.value)} className={inputCn} />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowLancModal(false)} className="flex-1 py-2 rounded-lg text-xs border border-[rgb(var(--input-border))] text-[rgb(var(--foreground))] hover:bg-[rgb(var(--input-bg))] transition-colors">Cancelar</button>
                <button onClick={handleAddLanc} className="flex-1 py-2 rounded-lg text-xs bg-orange-500 text-white hover:bg-orange-600 transition-colors font-medium">Salvar</button>
              </div>
            </div>
          )}

          <div className="space-y-3 max-h-80 overflow-y-auto">
            {recentLancamentos.length === 0 ? (
              <p className="text-sm text-center text-[rgb(var(--muted-foreground))] py-6">Nenhum lançamento ainda</p>
            ) : (
              recentLancamentos.map((l) => (
                <div key={l.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[rgb(var(--muted))] transition-colors group">
                  <div className={cn('w-2 h-2 rounded-full flex-shrink-0', l.tipo === 'entrada' ? 'bg-emerald-500' : 'bg-red-500')} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[rgb(var(--foreground))] truncate">{l.descricao}</p>
                    <p className="text-xs text-[rgb(var(--muted-foreground))]">{formatDate(l.data)}</p>
                  </div>
                  <span className={cn('text-sm font-semibold flex-shrink-0', l.tipo === 'entrada' ? 'text-emerald-500' : 'text-red-500')}>
                    {l.tipo === 'entrada' ? '+' : '-'}{formatCurrency(l.valor)}
                  </span>
                  {/* Edit & Delete */}
                  <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-all">
                    <button onClick={() => setEditingLanc(l)} className="p-1 text-[rgb(var(--muted-foreground))] hover:text-orange-500 transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => {
                      if (!confirm(`Excluir lançamento "${l.descricao}"?`)) return;
                      deleteLancamento(l.id); toast.success('Excluído');
                    }} className="p-1 text-[rgb(var(--muted-foreground))] hover:text-red-500 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Contas a Receber */}
        <div className={cn('rounded-2xl p-5 border', 'bg-[rgb(var(--card))] border-[rgb(var(--card-border))]')}>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            <h3 className="font-semibold text-[rgb(var(--foreground))]">Contas a Receber</h3>
          </div>
          {stats.contasReceber.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
              <p className="text-sm text-[rgb(var(--muted-foreground))]">Tudo em dia!</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {stats.contasReceber.map((o) => (
                <div key={o.id} className="rounded-xl bg-yellow-500/5 border border-yellow-500/20 overflow-hidden">
                  <Link href={`/ordens/${o.id}`} className="flex items-center gap-3 p-3 hover:bg-yellow-500/10 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[rgb(var(--foreground))]">{o.cliente?.nome ?? '—'}</p>
                      <p className="text-xs text-[rgb(var(--muted-foreground))]">{o.numero}</p>
                    </div>
                    <p className="font-bold text-yellow-600 dark:text-yellow-400">{formatCurrency(o.valorTotal)}</p>
                    <ArrowRight className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
                  </Link>
                  {/* Marcar como pago */}
                  <button
                    onClick={() => {
                      addLancamento({
                        tipo: 'entrada',
                        descricao: `${o.numero} - ${o.cliente?.nome ?? ''} (recebido)`,
                        valor: o.valorTotal,
                        ordemServicoId: o.id,
                        clienteId: o.clienteId,
                        data: today,
                        pago: true,
                      });
                      toast.success('Pagamento registrado! Lançamento criado.');
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-colors border-t border-yellow-500/20"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Marcar como Pago
                  </button>
                </div>
              ))}
              <div className="pt-1 text-right">
                <span className="text-xs text-[rgb(var(--muted-foreground))]">
                  Total: <strong>{formatCurrency(stats.contasReceber.reduce((s, o) => s + o.valorTotal, 0))}</strong>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contas a Pagar (full width, side by side panels) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pendentes */}
        <div className={cn('rounded-2xl p-5 border', 'bg-[rgb(var(--card))] border-[rgb(var(--card-border))]')}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-red-500" />
              <h3 className="font-semibold text-[rgb(var(--foreground))]">Contas a Pagar</h3>
              {contasPagarAtivas.length > 0 && (
                <span className="text-xs bg-red-500/15 text-red-500 px-2 py-0.5 rounded-full font-semibold">
                  {contasPagarAtivas.length}
                </span>
              )}
            </div>
            <button
              onClick={() => setShowContaModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Nova
            </button>
          </div>

          {showContaModal && (
            <div className="mb-4 p-4 rounded-xl bg-[rgb(var(--muted))] space-y-3">
              <input type="text" placeholder="Descrição *" value={cDescricao} onChange={e => setCDescricao(e.target.value)} className={inputCn} />
              <input type="text" placeholder="Fornecedor" value={cFornecedor} onChange={e => setCFornecedor(e.target.value)} className={inputCn} />
              <div className="grid grid-cols-2 gap-2">
                <input type="number" placeholder="Valor (R$) *" value={cValor} onChange={e => setCValor(e.target.value)} className={inputCn} />
                <input type="date" value={cVencimento} onChange={e => setCVencimento(e.target.value)} className={inputCn} />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowContaModal(false)} className="flex-1 py-2 rounded-lg text-xs border border-[rgb(var(--input-border))] text-[rgb(var(--foreground))] hover:bg-[rgb(var(--input-bg))] transition-colors">Cancelar</button>
                <button onClick={handleAddConta} className="flex-1 py-2 rounded-lg text-xs bg-red-500 text-white hover:bg-red-600 transition-colors font-medium">Cadastrar</button>
              </div>
            </div>
          )}

          <div className="space-y-4 max-h-72 overflow-y-auto">
            {contasPagarAtivas.length === 0 ? (
              <p className="text-sm text-center text-[rgb(var(--muted-foreground))] py-6">Nenhuma conta pendente</p>
            ) : (
              contasPagarAtivas.map((c) => {
                const vencido = c.vencimento < today;
                return (
                  <div key={c.id} className={cn(
                    'rounded-xl p-3 border group',
                    vencido ? 'bg-red-500/5 border-red-500/25' : 'bg-[rgb(var(--muted))] border-[rgb(var(--card-border))]'
                  )}>
                    <div className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[rgb(var(--foreground))] truncate">{c.descricao}</p>
                        {c.fornecedor && <p className="text-xs text-[rgb(var(--muted-foreground))]">{c.fornecedor}</p>}
                        <p className={cn('text-xs mt-0.5', vencido ? 'text-red-500 font-semibold' : 'text-[rgb(var(--muted-foreground))]')}>
                          {vencido ? '⚠ Vencida em' : 'Vence em'} {new Date(c.vencimento + 'T12:00:00').toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-red-500">{formatCurrency(c.valor)}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => {
                          pagarConta(c.id);
                          addLancamento({ tipo: 'saida', descricao: `Pgto: ${c.descricao}${c.fornecedor ? ' - ' + c.fornecedor : ''}`, valor: c.valor, data: today });
                          toast.success('Conta paga! Saída registrada.');
                        }}
                        className="flex-1 py-1.5 rounded-lg text-xs font-medium bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
                      >
                        <CheckCircle2 className="w-3 h-3 inline mr-1" />
                        Pagar
                      </button>
                      <button onClick={() => {
                        if (!confirm(`Excluir conta "${c.descricao}"?`)) return;
                        deleteContaPagar(c.id);
                        toast.success('Conta excluída');
                      }} className="p-1.5 rounded-lg text-[rgb(var(--muted-foreground))] hover:text-red-500 hover:bg-red-500/10 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Histórico de pagas */}
        <div className={cn('rounded-2xl p-5 border', 'bg-[rgb(var(--card))] border-[rgb(var(--card-border))]')}>
          <div className="flex items-center gap-2 mb-4">
            <History className="w-4 h-4 text-slate-500" />
            <h3 className="font-semibold text-[rgb(var(--foreground))]">Histórico de Contas Pagas</h3>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {contasPagarHistorico.length === 0 ? (
              <p className="text-sm text-center text-[rgb(var(--muted-foreground))] py-6">Nenhuma conta paga ainda</p>
            ) : (
              contasPagarHistorico.map((c) => (
                <div key={c.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[rgb(var(--foreground))] truncate">{c.descricao}</p>
                    <p className="text-xs text-[rgb(var(--muted-foreground))]">Pago em {c.dataPagamento ? new Date(c.dataPagamento + 'T12:00:00').toLocaleDateString('pt-BR') : '—'}</p>
                  </div>
                  <span className="text-sm font-semibold text-emerald-500 flex-shrink-0">{formatCurrency(c.valor)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Edit lancamento modal */}
      {editingLanc && (
        <EditLancamentoModal
          lancamento={editingLanc}
          onSave={updateLancamento}
          onClose={() => setEditingLanc(null)}
        />
      )}
        </div>
      )}
    </div>
  );
}

// ─── Page com auth guard ─────────────────────────────────────────────────
export default function FinanceiroPage() {
  const [autenticado, setAutenticado] = useState(false);
  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    const ts = localStorage.getItem(SESSION_KEY);
    if (ts && Date.now() - Number(ts) < SESSION_DURATION) {
      setAutenticado(true);
    }
    setVerificando(false);
  }, []);

  function handleLogout() {
    localStorage.removeItem(SESSION_KEY);
    setAutenticado(false);
    toast.info('Sessão encerrada');
  }

  if (verificando) return null;
  if (!autenticado) return <FinanceiroLogin onSuccess={() => setAutenticado(true)} />;
  return <FinanceiroContent onLogout={handleLogout} />;
}
