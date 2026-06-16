'use client';

import { useState, useMemo, useRef } from 'react';
import { useStore } from '@/lib/store';
import { Peca } from '@/lib/types';
import { formatCurrency, cn } from '@/lib/utils';
import { Search, Plus, Edit2, Trash2, X, AlertTriangle, Package, Upload, ChevronDown, Download } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

// ─── Marcas e modelos populares Brasil ──────────────────────────────────────
const MARCAS_BR: Record<string, string[]> = {
  Fiat: ['Palio', 'Uno', 'Strada', 'Toro', 'Pulse', 'Fastback', 'Cronos', 'Mobi', 'Argo', 'Doblo', 'Fiorino', 'Ducato', 'Scudo', 'Punto', 'Bravo', 'Linea', 'Stilo', '500', 'Tipo', 'Siena', 'Weekend'],
  Volkswagen: ['Gol', 'Polo', 'Virtus', 'Nivus', 'T-Cross', 'Taos', 'Amarok', 'Saveiro', 'Voyage', 'Fox', 'Jetta', 'Tiguan', 'Golf', 'Up', 'Kombi', 'Fusca'],
  Chevrolet: ['Onix', 'Tracker', 'Equinox', 'Trailblazer', 'S10', 'Montana', 'Spin', 'Cobalt', 'Cruze', 'Camaro', 'Blazer', 'Captiva', 'Corsa', 'Celta', 'Classic', 'Prisma', 'Astra', 'Vectra', 'Zafira'],
  Ford: ['Ka', 'EcoSport', 'Bronco', 'Ranger', 'Maverick', 'Territory', 'Fiesta', 'Focus', 'Fusion', 'Edge', 'Expedition', 'F-150', 'F-250', 'Courier', 'Transit'],
  Toyota: ['Corolla', 'Yaris', 'Hilux', 'SW4', 'RAV4', 'Prius', 'Camry', 'Land Cruiser', 'Rush', 'Etios', 'Fielder'],
  Honda: ['Civic', 'City', 'Fit', 'HR-V', 'CR-V', 'WR-V', 'Accord', 'ZR-V', 'Jazz'],
  Hyundai: ['HB20', 'HB20S', 'Creta', 'Tucson', 'Santa Fe', 'Elantra', 'Sonata', 'Azera', 'ix35', 'i30'],
  Renault: ['Kwid', 'Sandero', 'Logan', 'Duster', 'Captur', 'Oroch', 'Kangoo', 'Master', 'Clio', 'Megane', 'Symbol'],
  Jeep: ['Renegade', 'Compass', 'Commander', 'Wrangler', 'Cherokee', 'Gladiator'],
  Nissan: ['Kicks', 'Versa', 'Sentra', 'Frontier', 'Tiida', 'March', 'X-Trail', 'Murano'],
  Peugeot: ['208', '308', '2008', '3008', '408', '5008', 'Partner', 'Expert', 'Boxer'],
  Citroën: ['C3', 'C4', 'Aircross', 'C4 Cactus', 'C3 Aircross', 'Berlingo', 'Jumpy', 'Jumper'],
  BMW: ['116i', '118i', '120i', '320i', '330i', '420i', '430i', 'X1', 'X3', 'X5', 'X6', 'M3', 'M5'],
  'Mercedes-Benz': ['A180', 'A200', 'C180', 'C200', 'C250', 'E200', 'GLA', 'GLC', 'GLE', 'Sprinter', 'Vito', 'Actros'],
  Audi: ['A3', 'A4', 'A5', 'A6', 'Q3', 'Q5', 'Q7', 'Q8', 'TT', 'R8'],
  Mitsubishi: ['Lancer', 'Eclipse Cross', 'Outlander', 'Pajero', 'L200 Triton', 'ASX'],
  Kia: ['Sportage', 'Sorento', 'Soul', 'Stinger', 'Cerato', 'Rio', 'Seltos'],
  Dodge: ['RAM 1500', 'RAM 2500', 'Journey', 'Challenger', 'Charger'],
  Chery: ['Tiggo 5x', 'Tiggo 7', 'Tiggo 8', 'Arrizo 6'],
  Caoa: ['Caoa Chery Tiggo'],
  Lifan: ['X60', 'X70', '620', '720'],
  JAC: ['T40', 'T50', 'T60', 'E-JS4'],
  Iveco: ['Daily', 'Stralis', 'Trakker'],
  Agrale: ['MA 8.5', 'MT 12.0'],
  Outro: [],
};

const CAMBIO_OPTIONS = [
  { value: 'manual', label: 'Manual' },
  { value: 'automatico', label: 'Automático' },
  { value: 'ambos', label: 'Ambos' },
];

// ─── Gera nome padronizado da peça ──────────────────────────────────────────
function gerarNomePadrao(nome: string, marca: string, modelo: string, ano: string, motor: string, codigo: string) {
  return [nome, marca, modelo, ano, motor, codigo].filter(Boolean).join(' ');
}

// ─── inputCn ─────────────────────────────────────────────────────────────────
const inputCn = cn(
  'w-full px-3 py-2.5 rounded-xl text-sm border',
  'bg-[rgb(var(--input-bg))] border-[rgb(var(--input-border))]',
  'text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))]',
  'focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-colors'
);

// ─── Dropdown Component ───────────────────────────────────────────────────────
function Dropdown({ value, onChange, options, placeholder }: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const filtered = query ? options.filter(o => o.toLowerCase().includes(query.toLowerCase())) : options;

  return (
    <div className="relative">
      <input
        type="text"
        placeholder={placeholder}
        value={open ? query : value}
        onChange={e => { setQuery(e.target.value); setOpen(true); onChange(e.target.value); }}
        onFocus={() => { setQuery(''); setOpen(true); }}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        className={inputCn}
      />
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--muted-foreground))] pointer-events-none" />
      {open && filtered.length > 0 && (
        <div
          className="absolute top-full left-0 right-0 mt-1 rounded-xl border border-[rgb(var(--card-border))] overflow-hidden shadow-2xl z-[999] max-h-48 overflow-y-auto"
          style={{ backgroundColor: 'rgb(var(--card))' }}
        >
          {filtered.map(opt => (
            <button
              key={opt}
              type="button"
              onMouseDown={e => { e.preventDefault(); onChange(opt); setQuery(''); setOpen(false); }}
              className={cn(
                'w-full text-left px-3 py-2 text-sm hover:bg-[rgb(var(--muted))] transition-colors border-b border-[rgb(var(--card-border))] last:border-0',
                value === opt && 'bg-orange-500/10 text-orange-500 font-medium'
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── PecaCard ─────────────────────────────────────────────────────────────────
function PecaCard({ p, onEdit, onDelete }: { p: Peca; onEdit: (p: Peca) => void; onDelete: (p: Peca) => void }) {
  const baixo = p.quantidade <= p.quantidadeMinima;
  return (
    <div className={cn(
      'rounded-2xl p-4 border transition-all duration-200 bg-[rgb(var(--card))] hover:shadow-sm',
      baixo ? 'border-red-500/40' : 'border-[rgb(var(--card-border))]'
    )}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-sm text-[rgb(var(--foreground))] truncate">{p.nome}</p>
            {p.codigo && (
              <span className="text-xs bg-orange-500/10 text-orange-500 px-1.5 py-0.5 rounded font-mono flex-shrink-0">{p.codigo}</span>
            )}
            {baixo && (
              <span className="flex items-center gap-1 text-xs text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full flex-shrink-0">
                <AlertTriangle className="w-3 h-3" />Baixo
              </span>
            )}
          </div>
          {(p.marcaVeiculo || p.modeloVeiculo) && (
            <p className="text-xs text-blue-500 mt-0.5">
              {[p.marcaVeiculo, p.modeloVeiculo, p.anoVeiculo, p.motorizacao].filter(Boolean).join(' ')}
              {p.cambio && p.cambio !== 'ambos' && ` · ${p.cambio === 'manual' ? 'Manual' : 'Automático'}`}
            </p>
          )}
          {p.fornecedor && <p className="text-xs text-[rgb(var(--muted-foreground))] mt-0.5">{p.fornecedor}</p>}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={() => onEdit(p)} className="p-1.5 rounded-lg text-[rgb(var(--muted-foreground))] hover:text-blue-500 hover:bg-blue-500/10 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
          <button onClick={() => onDelete(p)} className="p-1.5 rounded-lg text-[rgb(var(--muted-foreground))] hover:text-red-500 hover:bg-red-500/10 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 mt-3">
        <div><p className="text-xs text-[rgb(var(--muted-foreground))]">Qtd.</p><p className={cn('text-lg font-bold', baixo ? 'text-red-500' : 'text-[rgb(var(--foreground))]')}>{p.quantidade}</p></div>
        <div><p className="text-xs text-[rgb(var(--muted-foreground))]">Mín.</p><p className="text-lg font-bold text-[rgb(var(--foreground))]">{p.quantidadeMinima}</p></div>
        <div><p className="text-xs text-[rgb(var(--muted-foreground))]">Custo</p><p className="text-sm font-semibold text-[rgb(var(--foreground))]">{formatCurrency(p.custo)}</p></div>
      </div>
      <div className="mt-3 h-1.5 bg-[rgb(var(--muted))] rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all', baixo ? 'bg-red-500' : 'bg-emerald-500')}
          style={{ width: `${Math.min(100, (p.quantidade / Math.max(p.quantidadeMinima * 2, 1)) * 100)}%` }} />
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function EstoquePage() {
  const { pecas, addPeca, updatePeca, deletePeca } = useStore();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Peca | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [fNome, setFNome] = useState('');
  const [fMarca, setFMarca] = useState('');
  const [fModelo, setFModelo] = useState('');
  const [fAno, setFAno] = useState('');
  const [fMotorizacao, setFMotorizacao] = useState('');
  const [fCambio, setFCambio] = useState<'manual' | 'automatico' | 'ambos'>('ambos');
  const [fCodigo, setFCodigo] = useState('');
  const [fQtd, setFQtd] = useState('');
  const [fQtdMin, setFQtdMin] = useState('5');
  const [fCusto, setFCusto] = useState('');
  const [fFornecedor, setFFornecedor] = useState('');

  const marcas = Object.keys(MARCAS_BR);
  const modelos = fMarca ? (MARCAS_BR[fMarca] || []) : [];
  const nomeCompleto = gerarNomePadrao(fNome, fMarca, fModelo, fAno, fMotorizacao, fCodigo);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return pecas.filter(p =>
      !q ||
      p.nome.toLowerCase().includes(q) ||
      (p.fornecedor || '').toLowerCase().includes(q) ||
      (p.marcaVeiculo || '').toLowerCase().includes(q) ||
      (p.modeloVeiculo || '').toLowerCase().includes(q) ||
      (p.codigo || '').toLowerCase().includes(q) ||
      (p.motorizacao || '').toLowerCase().includes(q)
    );
  }, [pecas, search]);

  const emEstoqueBaixo = filtered.filter(p => p.quantidade <= p.quantidadeMinima);
  const emEstoqueOk = filtered.filter(p => p.quantidade > p.quantidadeMinima);

  function resetForm() {
    setFNome(''); setFMarca(''); setFModelo(''); setFAno('');
    setFMotorizacao(''); setFCambio('ambos'); setFCodigo('');
    setFQtd(''); setFQtdMin('5'); setFCusto(''); setFFornecedor('');
  }

  function openNew() { setEditing(null); resetForm(); setShowModal(true); }

  function openEdit(p: Peca) {
    setEditing(p);
    setFNome(p.nome); setFMarca(p.marcaVeiculo || ''); setFModelo(p.modeloVeiculo || '');
    setFAno(p.anoVeiculo || ''); setFMotorizacao(p.motorizacao || '');
    setFCambio((p.cambio as 'manual' | 'automatico' | 'ambos') || 'ambos');
    setFCodigo(p.codigo || ''); setFQtd(String(p.quantidade)); setFQtdMin(String(p.quantidadeMinima));
    setFCusto(String(p.custo)); setFFornecedor(p.fornecedor || '');
    setShowModal(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fNome || !fQtd || !fCusto) { toast.error('Preencha: nome, quantidade e custo'); return; }
    const data = {
      nome: fNome, marcaVeiculo: fMarca, modeloVeiculo: fModelo, anoVeiculo: fAno,
      motorizacao: fMotorizacao, cambio: fCambio, codigo: fCodigo,
      quantidade: Number(fQtd), quantidadeMinima: Number(fQtdMin) || 5,
      custo: Number(fCusto), fornecedor: fFornecedor,
    };
    if (editing) { updatePeca(editing.id, data); toast.success('Peça atualizada!'); }
    else { addPeca(data); toast.success('Peça cadastrada!'); }
    setShowModal(false);
  }

  function handleDelete(p: Peca) {
    if (!confirm(`Excluir peça "${p.nome}"?\nEsta ação não pode ser desfeita.`)) return;
    deletePeca(p.id); toast.success('Peça excluída');
  }

  // ─── Exportar planilha modelo ──────────────────────────────────────────────
  function downloadModelo() {
    const rows = [
      { Nome: 'Correia dentada', Marca: 'Fiat', Modelo: 'Palio', Ano: '2010', Motorizacao: '1.0', Cambio: 'manual', Codigo: 'C1049', Quantidade: 5, 'Qtd Minima': 2, Custo: 85.50, Fornecedor: 'Auto Peças Silva' },
      { Nome: 'Filtro de óleo', Marca: 'Volkswagen', Modelo: 'Gol', Ano: '2015', Motorizacao: '1.6', Cambio: 'manual', Codigo: 'FO2031', Quantidade: 10, 'Qtd Minima': 3, Custo: 25.00, Fornecedor: 'Distribuidora ABC' },
      { Nome: 'Pastilha de freio dianteira', Marca: 'Chevrolet', Modelo: 'Onix', Ano: '2020', Motorizacao: '1.0 Turbo', Cambio: 'automatico', Codigo: 'PF4402', Quantidade: 8, 'Qtd Minima': 2, Custo: 75.00, Fornecedor: '' },
    ];
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Estoque');
    XLSX.writeFile(wb, 'modelo_estoque_autoflow.xlsx');
    toast.success('Planilha modelo baixada!');
  }

  // ─── Import Excel ──────────────────────────────────────────────────────────
  function handleImportExcel(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = ev.target?.result;
        const wb = XLSX.read(data, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '' });
        let count = 0;
        rows.forEach(row => {
          // Helper: pega valor de múltiplas chaves possíveis
          const get = (...keys: string[]) => {
            for (const k of keys) {
              const val = row[k];
              if (val !== undefined && val !== null && String(val).trim() !== '') return String(val).trim();
            }
            return '';
          };
          const nome = get('Nome', 'nome', 'Peça', 'peca', 'NOME', 'name');
          if (!nome || nome.length < 2) return;

          addPeca({
            nome,
            marcaVeiculo: get('Marca', 'marca', 'MarcaVeiculo', 'marcaVeiculo', 'marca_veiculo'),
            modeloVeiculo: get('Modelo', 'modelo', 'ModeloVeiculo', 'modeloVeiculo', 'modelo_veiculo'),
            anoVeiculo: get('Ano', 'ano', 'AnoVeiculo', 'anoVeiculo'),
            motorizacao: get('Motorizacao', 'motorizacao', 'Motor', 'motor', 'Motorização', 'motorização', 'Motorizacao'),
            cambio: (get('Cambio', 'cambio', 'Câmbio', 'câmbio') as 'manual' | 'automatico' | 'ambos') || 'ambos',
            codigo: get('Codigo', 'codigo', 'Código', 'código', 'code', 'Code'),
            quantidade: Number(get('Quantidade', 'quantidade', 'Qtd', 'qtd', 'qty')) || 0,
            quantidadeMinima: Number(get('Qtd Minima', 'qtd_minima', 'Min', 'min', 'qtd_min', 'QtdMin', 'Minimo', 'minimo')) || 5,
            custo: Number(get('Custo', 'custo', 'Preço', 'preco', 'Valor', 'valor', 'price')) || 0,
            fornecedor: get('Fornecedor', 'fornecedor', 'supplier'),
          });
          count++;
        });
        toast.success(`${count} peça${count !== 1 ? 's' : ''} importada${count !== 1 ? 's' : ''}!`);
      } catch {
        toast.error('Erro ao importar. Use a planilha modelo para garantir o formato correto.');
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsBinaryString(file);
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--muted-foreground))] pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por nome, código, marca, modelo..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={cn(inputCn, 'pl-9')}
          />
        </div>
        <button
          onClick={downloadModelo}
          className="flex items-center gap-2 px-3 py-2.5 border border-[rgb(var(--input-border))] text-[rgb(var(--foreground))] rounded-xl text-sm font-medium hover:bg-[rgb(var(--muted))] transition-colors flex-shrink-0"
          title="Baixar planilha modelo"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Modelo</span>
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-3 py-2.5 border border-[rgb(var(--input-border))] text-[rgb(var(--foreground))] rounded-xl text-sm font-medium hover:bg-[rgb(var(--muted))] transition-colors flex-shrink-0"
          title="Importar peças via Excel (.xlsx)"
        >
          <Upload className="w-4 h-4" />
          <span className="hidden sm:inline">Importar</span>
        </button>
        <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleImportExcel} className="hidden" />
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-medium hover:bg-orange-600 transition-colors shadow-sm flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          Nova Peça
        </button>
      </div>

      {/* Import hint */}
      <p className="text-xs text-[rgb(var(--muted-foreground))]">
        💡 Baixe a <button onClick={downloadModelo} className="text-orange-500 hover:underline font-medium">planilha modelo</button> para importar peças corretamente. Colunas: <span className="font-mono">Nome, Marca, Modelo, Ano, Motorizacao, Cambio, Codigo, Quantidade, Qtd Minima, Custo, Fornecedor</span>
      </p>

      {/* Alert */}
      {emEstoqueBaixo.length > 0 && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-600 dark:text-red-400">
            <span className="font-semibold">{emEstoqueBaixo.length} peça{emEstoqueBaixo.length !== 1 ? 's' : ''}</span> com estoque baixo: {emEstoqueBaixo.map(p => p.nome).join(', ')}
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total de Itens', value: pecas.length },
          { label: 'Estoque Baixo', value: emEstoqueBaixo.length },
          { label: 'Valor em Estoque', value: formatCurrency(pecas.reduce((s, p) => s + p.custo * p.quantidade, 0)) },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-4 border text-center bg-[rgb(var(--card))] border-[rgb(var(--card-border))]">
            <p className="text-xs text-[rgb(var(--muted-foreground))]">{s.label}</p>
            <p className="text-xl font-bold text-[rgb(var(--foreground))] mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Low stock */}
      {emEstoqueBaixo.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-red-500 mb-2 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" />Estoque Crítico
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {emEstoqueBaixo.map(p => <PecaCard key={p.id} p={p} onEdit={openEdit} onDelete={handleDelete} />)}
          </div>
        </div>
      )}

      {/* Normal stock */}
      <div>
        {emEstoqueBaixo.length > 0 && (
          <h3 className="text-sm font-semibold text-[rgb(var(--foreground))] mb-2 flex items-center gap-1.5">
            <Package className="w-4 h-4" />Estoque Normal
          </h3>
        )}
        {filtered.length === 0 ? (
          <div className="rounded-2xl p-12 text-center border bg-[rgb(var(--card))] border-[rgb(var(--card-border))]">
            <Package className="w-8 h-8 text-[rgb(var(--muted-foreground))] mx-auto mb-2" />
            <p className="text-[rgb(var(--muted-foreground))]">Nenhuma peça encontrada</p>
            <button onClick={openNew} className="mt-3 px-4 py-2 bg-orange-500 text-white rounded-xl text-sm font-medium hover:bg-orange-600 transition-colors">
              Cadastrar primeira peça
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {emEstoqueOk.map(p => <PecaCard key={p.id} p={p} onEdit={openEdit} onDelete={handleDelete} />)}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl bg-[rgb(var(--card))] border border-[rgb(var(--card-border))] shadow-2xl max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-[rgb(var(--card-border))]">
              <h2 className="text-base font-semibold text-[rgb(var(--foreground))]">
                {editing ? 'Editar Peça' : 'Nova Peça'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-[rgb(var(--muted))] text-[rgb(var(--muted-foreground))]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
              {/* Nome da peça */}
              <div>
                <label className="block text-xs font-semibold text-[rgb(var(--muted-foreground))] uppercase tracking-wide mb-1.5">Nome da Peça *</label>
                <input type="text" value={fNome} onChange={e => setFNome(e.target.value)} className={inputCn} placeholder="Ex: Correia dentada" required />
              </div>

              {/* Compatibilidade */}
              <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3 space-y-3">
                <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide">Compatibilidade do Veículo</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-[rgb(var(--muted-foreground))] mb-1">Marca</label>
                    <Dropdown
                      value={fMarca}
                      onChange={v => { setFMarca(v); if (!MARCAS_BR[v]) setFModelo(''); }}
                      options={marcas}
                      placeholder="Ex: Fiat"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[rgb(var(--muted-foreground))] mb-1">Modelo</label>
                    <Dropdown
                      value={fModelo}
                      onChange={setFModelo}
                      options={modelos.length > 0 ? modelos : ['(Selecione a marca primeiro)']}
                      placeholder="Ex: Palio"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[rgb(var(--muted-foreground))] mb-1">Ano</label>
                    <input type="text" value={fAno} onChange={e => setFAno(e.target.value)} className={inputCn} placeholder="Ex: 2010" />
                  </div>
                  <div>
                    <label className="block text-xs text-[rgb(var(--muted-foreground))] mb-1">Motorização</label>
                    <input type="text" value={fMotorizacao} onChange={e => setFMotorizacao(e.target.value)} className={inputCn} placeholder="Ex: 1.0" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-[rgb(var(--muted-foreground))] mb-1">Câmbio</label>
                    <div className="relative">
                      <select value={fCambio} onChange={e => setFCambio(e.target.value as 'manual' | 'automatico' | 'ambos')} className={cn(inputCn, 'appearance-none pr-8')}>
                        {CAMBIO_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--muted-foreground))] pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-[rgb(var(--muted-foreground))] mb-1">Código</label>
                    <input type="text" value={fCodigo} onChange={e => setFCodigo(e.target.value)} className={inputCn} placeholder="Ex: C1049" />
                  </div>
                </div>
                {nomeCompleto && (
                  <div className="text-xs bg-blue-500/10 rounded-lg px-3 py-2 text-blue-600 dark:text-blue-400 font-medium">
                    📋 {nomeCompleto}
                  </div>
                )}
              </div>

              {/* Estoque e custo */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[rgb(var(--muted-foreground))] uppercase tracking-wide mb-1.5">Qtd. *</label>
                  <input type="number" value={fQtd} onChange={e => setFQtd(e.target.value)} className={inputCn} min="0" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[rgb(var(--muted-foreground))] uppercase tracking-wide mb-1.5">Qtd. Mín.</label>
                  <input type="number" value={fQtdMin} onChange={e => setFQtdMin(e.target.value)} className={inputCn} min="0" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[rgb(var(--muted-foreground))] uppercase tracking-wide mb-1.5">Custo *</label>
                  <input type="number" value={fCusto} onChange={e => setFCusto(e.target.value)} className={inputCn} min="0" step="0.01" required />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[rgb(var(--muted-foreground))] uppercase tracking-wide mb-1.5">Fornecedor</label>
                <input type="text" value={fFornecedor} onChange={e => setFFornecedor(e.target.value)} className={inputCn} placeholder="Nome do fornecedor" />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl text-sm border border-[rgb(var(--input-border))] text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))] transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-orange-500 text-white hover:bg-orange-600 transition-colors">
                  {editing ? 'Salvar Alterações' : 'Cadastrar Peça'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
