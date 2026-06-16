'use client';

import { useState, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';
import { useStore } from '@/lib/store';
import { toast } from 'sonner';
import {
  Wrench,
  Plus,
  Pencil,
  Trash2,
  X,
  ChevronDown,
  Tag,
  DollarSign,
  Upload,
} from 'lucide-react';
import type { ServicosCatalogo } from '@/lib/types';
import * as XLSX from 'xlsx';

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIAS = [
  'Mecânica',
  'Elétrica',
  'Funilaria',
  'Suspensão',
  'Freios',
  'Motor',
  'Outro',
];

// ─── Shared input class ───────────────────────────────────────────────────────

const inputCn = cn(
  'w-full px-3 py-2.5 rounded-xl text-sm border',
  'bg-[rgb(var(--input-bg))] border-[rgb(var(--input-border))]',
  'text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))]',
  'focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-colors',
);

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormState {
  nome: string;
  categoria: string;
  valorPadrao: string;
  descricao: string;
}

const EMPTY_FORM: FormState = {
  nome: '',
  categoria: '',
  valorPadrao: '',
  descricao: '',
};

// ─── Sub-components (defined OUTSIDE main export to prevent focus loss) ───────

interface ModalHeaderProps {
  isEditing: boolean;
  onClose: () => void;
}

function ModalHeader({ isEditing, onClose }: ModalHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-xl bg-orange-500/10">
          <Wrench className="w-5 h-5 text-orange-500" />
        </div>
        <h2 className="text-lg font-semibold text-[rgb(var(--foreground))]">
          {isEditing ? 'Editar Serviço' : 'Novo Serviço'}
        </h2>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="p-1.5 rounded-lg text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))] transition-colors"
        aria-label="Fechar"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}

interface FieldLabelProps {
  htmlFor: string;
  children: React.ReactNode;
  required?: boolean;
}

function FieldLabel({ htmlFor, children, required }: FieldLabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-sm font-medium text-[rgb(var(--foreground))] mb-1.5"
    >
      {children}
      {required && <span className="text-orange-500 ml-0.5">*</span>}
    </label>
  );
}

interface NomeFieldProps {
  value: string;
  onChange: (v: string) => void;
}

function NomeField({ value, onChange }: NomeFieldProps) {
  return (
    <div>
      <FieldLabel htmlFor="servico-nome" required>
        Nome do serviço
      </FieldLabel>
      <input
        id="servico-nome"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ex.: Troca de óleo completa"
        className={inputCn}
        autoComplete="off"
      />
    </div>
  );
}

interface CategoriaFieldProps {
  value: string;
  onChange: (v: string) => void;
}

function CategoriaField({ value, onChange }: CategoriaFieldProps) {
  const [open, setOpen] = useState(false);

  const select = useCallback(
    (cat: string) => {
      onChange(cat);
      setOpen(false);
    },
    [onChange],
  );

  return (
    <div>
      <FieldLabel htmlFor="servico-categoria">Categoria</FieldLabel>
      <div className="relative">
        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--muted-foreground))] pointer-events-none" />
        <input
          id="servico-categoria"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Selecione ou digite…"
          className={cn(inputCn, 'pl-9 pr-9')}
          autoComplete="off"
        />
        <ChevronDown
          className={cn(
            'absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--muted-foreground))] pointer-events-none transition-transform',
            open && 'rotate-180',
          )}
        />
        {open && (
          <ul className="absolute z-50 mt-1 w-full rounded-xl border border-[rgb(var(--card-border))] bg-[rgb(var(--card))] shadow-lg overflow-hidden">
            {CATEGORIAS.filter((c) =>
              c.toLowerCase().includes(value.toLowerCase()),
            ).map((cat) => (
              <li key={cat}>
                <button
                  type="button"
                  onMouseDown={() => select(cat)}
                  className={cn(
                    'w-full text-left px-3 py-2 text-sm transition-colors',
                    'text-[rgb(var(--foreground))] hover:bg-orange-500/10 hover:text-orange-500',
                    value === cat && 'bg-orange-500/10 text-orange-500 font-medium',
                  )}
                >
                  {cat}
                </button>
              </li>
            ))}
            {CATEGORIAS.filter((c) =>
              c.toLowerCase().includes(value.toLowerCase()),
            ).length === 0 && (
              <li className="px-3 py-2 text-sm text-[rgb(var(--muted-foreground))]">
                Usar &quot;{value}&quot;
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}

interface ValorFieldProps {
  value: string;
  onChange: (v: string) => void;
}

function ValorField({ value, onChange }: ValorFieldProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/[^0-9.,]/g, '');
      onChange(raw);
    },
    [onChange],
  );

  return (
    <div>
      <FieldLabel htmlFor="servico-valor" required>
        Valor padrão
      </FieldLabel>
      <div className="relative">
        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--muted-foreground))] pointer-events-none" />
        <input
          id="servico-valor"
          type="text"
          inputMode="decimal"
          value={value}
          onChange={handleChange}
          placeholder="0,00"
          className={cn(inputCn, 'pl-9')}
          autoComplete="off"
        />
      </div>
    </div>
  );
}

interface DescricaoFieldProps {
  value: string;
  onChange: (v: string) => void;
}

function DescricaoField({ value, onChange }: DescricaoFieldProps) {
  return (
    <div>
      <FieldLabel htmlFor="servico-descricao">Descrição</FieldLabel>
      <textarea
        id="servico-descricao"
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Detalhes opcionais sobre o serviço…"
        className={cn(inputCn, 'resize-none')}
      />
    </div>
  );
}

interface ServiceFormProps {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  isEditing: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

function ServiceForm({ form, setForm, isEditing, onClose, onSubmit }: ServiceFormProps) {
  const setField = useCallback(
    <K extends keyof FormState>(key: K) =>
      (value: FormState[K]) =>
        setForm((prev) => ({ ...prev, [key]: value })),
    [setForm],
  );

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <ModalHeader isEditing={isEditing} onClose={onClose} />

      <NomeField value={form.nome} onChange={setField('nome')} />
      <CategoriaField value={form.categoria} onChange={setField('categoria')} />
      <ValorField value={form.valorPadrao} onChange={setField('valorPadrao')} />
      <DescricaoField value={form.descricao} onChange={setField('descricao')} />

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          className={cn(
            'flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-colors',
            'bg-[rgb(var(--muted))] text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]',
          )}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white transition-colors"
        >
          {isEditing ? 'Salvar alterações' : 'Adicionar serviço'}
        </button>
      </div>
    </form>
  );
}

interface DeleteConfirmProps {
  servico: ServicosCatalogo;
  onCancel: () => void;
  onConfirm: () => void;
}

function DeleteConfirm({ servico, onCancel, onConfirm }: DeleteConfirmProps) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-xl bg-red-500/10">
          <Trash2 className="w-5 h-5 text-red-500" />
        </div>
        <h2 className="text-lg font-semibold text-[rgb(var(--foreground))]">
          Excluir serviço
        </h2>
      </div>
      <p className="text-sm text-[rgb(var(--muted-foreground))] leading-relaxed">
        Tem certeza que deseja excluir{' '}
        <span className="font-semibold text-[rgb(var(--foreground))]">
          {servico.nome}
        </span>
        ? Esta ação não pode ser desfeita.
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className={cn(
            'flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-colors',
            'bg-[rgb(var(--muted))] text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]',
          )}
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold bg-red-500 hover:bg-red-600 text-white transition-colors"
        >
          Excluir
        </button>
      </div>
    </div>
  );
}

interface ServiceCardProps {
  servico: ServicosCatalogo;
  onEdit: (s: ServicosCatalogo) => void;
  onDeleteRequest: (s: ServicosCatalogo) => void;
}

function ServiceCard({ servico, onEdit, onDeleteRequest }: ServiceCardProps) {
  return (
    <article
      className={cn(
        'rounded-2xl border p-4 flex flex-col gap-3 transition-shadow hover:shadow-md',
        'bg-[rgb(var(--card))] border-[rgb(var(--card-border))]',
      )}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-2 rounded-xl bg-orange-500/10 shrink-0">
            <Wrench className="w-4 h-4 text-orange-500" />
          </div>
          <h3 className="font-semibold text-sm text-[rgb(var(--foreground))] truncate">
            {servico.nome}
          </h3>
        </div>
        <div className="flex gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => onEdit(servico)}
            aria-label="Editar serviço"
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              'text-[rgb(var(--muted-foreground))] hover:text-orange-500 hover:bg-orange-500/10',
            )}
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onDeleteRequest(servico)}
            aria-label="Excluir serviço"
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              'text-[rgb(var(--muted-foreground))] hover:text-red-500 hover:bg-red-500/10',
            )}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Category badge */}
      {servico.categoria && (
        <div className="flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-[rgb(var(--muted-foreground))]" />
          <span className="text-xs text-[rgb(var(--muted-foreground))] font-medium">
            {servico.categoria}
          </span>
        </div>
      )}

      {/* Description */}
      {servico.descricao && (
        <p className="text-xs text-[rgb(var(--muted-foreground))] line-clamp-2 leading-relaxed">
          {servico.descricao}
        </p>
      )}

      {/* Price */}
      <div className="flex items-center gap-1.5 mt-auto pt-1 border-t border-[rgb(var(--card-border))]">
        <DollarSign className="w-3.5 h-3.5 text-orange-500" />
        <span className="text-sm font-bold text-orange-500">
          {formatCurrency(servico.valorPadrao)}
        </span>
      </div>
    </article>
  );
}

interface EmptyStateProps {
  onAdd: () => void;
}

function EmptyState({ onAdd }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-5 text-center">
      <div className="p-5 rounded-2xl bg-orange-500/10">
        <Wrench className="w-10 h-10 text-orange-500" />
      </div>
      <div className="max-w-xs">
        <p className="text-base font-semibold text-[rgb(var(--foreground))] mb-1">
          Nenhum serviço cadastrado
        </p>
        <p className="text-sm text-[rgb(var(--muted-foreground))]">
          Comece adicionando os serviços que sua oficina oferece.
        </p>
      </div>
      <button
        type="button"
        onClick={onAdd}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition-colors"
      >
        <Plus className="w-4 h-4" />
        Adicionar serviço
      </button>
    </div>
  );
}

interface ModalBackdropProps {
  onClose: () => void;
  children: React.ReactNode;
}

function ModalBackdrop({ onClose, children }: ModalBackdropProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Panel */}
      <div
        className={cn(
          'relative z-10 w-full max-w-md rounded-2xl p-6 shadow-xl',
          'bg-[rgb(var(--card))] border border-[rgb(var(--card-border))]',
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseValor(raw: string): number {
  // Accept "1.200,50" or "1200.50" or "1200,50"
  const normalized = raw.replace(/\./g, '').replace(',', '.');
  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? 0 : parsed;
}

function formToPayload(form: FormState) {
  return {
    nome: form.nome.trim(),
    categoria: form.categoria.trim() || undefined,
    valorPadrao: parseValor(form.valorPadrao),
    descricao: form.descricao.trim() || undefined,
  };
}

function servicoToForm(s: ServicosCatalogo): FormState {
  return {
    nome: s.nome,
    categoria: s.categoria ?? '',
    valorPadrao: String(s.valorPadrao).replace('.', ','),
    descricao: s.descricao ?? '',
  };
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type ModalMode = 'add' | 'edit' | 'delete' | null;

export default function ServicosPage() {
  const { servicosCatalogo, addServicoCatalogo, updateServicoCatalogo, deleteServicoCatalogo } =
    useStore();

  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedServico, setSelectedServico] = useState<ServicosCatalogo | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Excel Import ──
  function handleImportExcel(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = ev.target?.result;
        const wb = XLSX.read(data, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: '' });
        let count = 0;
        rows.forEach((row) => {
          // Flexible column matching
          const keys = Object.keys(row);
          const find = (candidates: string[]) =>
            keys.find(k => candidates.some(c => k.toLowerCase().includes(c.toLowerCase())));

          const nomeKey = find(['servico', 'nome', 'service', 'descricao do servico']);
          const catKey  = find(['categoria', 'category', 'cat']);
          const valKey  = find(['valor', 'preco', 'price', 'value']);
          const descKey = find(['descricao', 'description', 'obs']);

          const nome = nomeKey ? String(row[nomeKey]).trim() : '';
          if (!nome) return;

          const catRaw  = catKey  ? String(row[catKey]).trim()  : '';
          const valRaw  = valKey  ? String(row[valKey]).trim()  : '0';
          const descRaw = descKey ? String(row[descKey]).trim() : '';

          // Parse value: handle "R$ 1.200,50" or "1200.50" or "1200,50"
          const normalizedVal = valRaw
            .replace(/R\$\s*/gi, '')
            .replace(/\./g, '')
            .replace(',', '.')
            .trim();
          const valorPadrao = parseFloat(normalizedVal) || 0;

          addServicoCatalogo({
            nome,
            categoria: catRaw || undefined,
            valorPadrao,
            descricao: descRaw || undefined,
          });
          count++;
        });
        if (count > 0) {
          toast.success(`${count} serviço${count !== 1 ? 's' : ''} importado${count !== 1 ? 's' : ''} com sucesso!`);
        } else {
          toast.error('Nenhum serviço encontrado. Verifique as colunas: Servico, Categoria, Valor, Descricao');
        }
      } catch {
        toast.error('Erro ao ler o arquivo. Verifique o formato.');
      }
      // Reset input so same file can be re-imported
      e.target.value = '';
    };
    reader.readAsBinaryString(file);
  }

  // ── Open handlers ──

  const openAdd = useCallback(() => {
    setForm(EMPTY_FORM);
    setSelectedServico(null);
    setModalMode('add');
  }, []);

  const openEdit = useCallback((servico: ServicosCatalogo) => {
    setForm(servicoToForm(servico));
    setSelectedServico(servico);
    setModalMode('edit');
  }, []);

  const openDelete = useCallback((servico: ServicosCatalogo) => {
    setSelectedServico(servico);
    setModalMode('delete');
  }, []);

  const closeModal = useCallback(() => {
    setModalMode(null);
    setSelectedServico(null);
    setForm(EMPTY_FORM);
  }, []);

  // ── Submit handlers ──

  const handleSubmitAdd = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!form.nome.trim()) {
        toast.error('O nome do serviço é obrigatório.');
        return;
      }
      if (!form.valorPadrao) {
        toast.error('O valor padrão é obrigatório.');
        return;
      }
      const payload = formToPayload(form);
      if (payload.valorPadrao <= 0) {
        toast.error('Informe um valor válido para o serviço.');
        return;
      }
      addServicoCatalogo(payload);
      toast.success(`Serviço "${payload.nome}" adicionado com sucesso!`);
      closeModal();
    },
    [form, addServicoCatalogo, closeModal],
  );

  const handleSubmitEdit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedServico) return;
      if (!form.nome.trim()) {
        toast.error('O nome do serviço é obrigatório.');
        return;
      }
      if (!form.valorPadrao) {
        toast.error('O valor padrão é obrigatório.');
        return;
      }
      const payload = formToPayload(form);
      if (payload.valorPadrao <= 0) {
        toast.error('Informe um valor válido para o serviço.');
        return;
      }
      updateServicoCatalogo(selectedServico.id, payload);
      toast.success(`Serviço "${payload.nome}" atualizado com sucesso!`);
      closeModal();
    },
    [form, selectedServico, updateServicoCatalogo, closeModal],
  );

  const handleConfirmDelete = useCallback(() => {
    if (!selectedServico) return;
    deleteServicoCatalogo(selectedServico.id);
    toast.success(`Serviço "${selectedServico.nome}" excluído.`);
    closeModal();
  }, [selectedServico, deleteServicoCatalogo, closeModal]);

  // ── Render ──

  return (
    <div className="min-h-screen bg-[rgb(var(--background))] px-4 py-6 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[rgb(var(--foreground))] flex items-center gap-2">
            <Wrench className="w-6 h-6 text-orange-500" />
            Catálogo de Serviços
          </h1>
          <p className="text-sm text-[rgb(var(--muted-foreground))] mt-0.5">
            {servicosCatalogo.length}{' '}
            {servicosCatalogo.length === 1 ? 'serviço cadastrado' : 'serviços cadastrados'}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* Excel import */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[rgb(var(--input-border))] text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))] text-sm font-medium transition-colors shrink-0"
            title="Importar servicos via Excel (.xlsx)"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Importar Excel</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleImportExcel}
            className="hidden"
          />
          <button
            type="button"
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Novo servico</span>
            <span className="sm:hidden">Novo</span>
          </button>
        </div>
      </div>
      <p className="text-xs text-[rgb(var(--muted-foreground))] mb-4">
        Colunas esperadas no Excel: <span className="font-mono">Servico, Categoria, Valor, Descricao</span>
      </p>

      {/* Content */}
      {servicosCatalogo.length === 0 ? (
        <EmptyState onAdd={openAdd} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {servicosCatalogo.map((servico: ServicosCatalogo) => (
            <ServiceCard
              key={servico.id}
              servico={servico}
              onEdit={openEdit}
              onDeleteRequest={openDelete}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {(modalMode === 'add' || modalMode === 'edit') && (
        <ModalBackdrop onClose={closeModal}>
          <ServiceForm
            form={form}
            setForm={setForm}
            isEditing={modalMode === 'edit'}
            onClose={closeModal}
            onSubmit={modalMode === 'add' ? handleSubmitAdd : handleSubmitEdit}
          />
        </ModalBackdrop>
      )}

      {modalMode === 'delete' && selectedServico && (
        <ModalBackdrop onClose={closeModal}>
          <DeleteConfirm
            servico={selectedServico}
            onCancel={closeModal}
            onConfirm={handleConfirmDelete}
          />
        </ModalBackdrop>
      )}
    </div>
  );
}
