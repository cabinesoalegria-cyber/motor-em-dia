'use client';

import { useState, useMemo, useRef } from 'react';
import { useStore } from '@/lib/store';
import { Cliente } from '@/lib/types';
import { formatPhone, formatDate, cn } from '@/lib/utils';
import { Search, Plus, Edit2, Trash2, Car, FileText, MessageSquare, X, Upload } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ClienteModal } from './cliente-modal';
import * as XLSX from 'xlsx';

export default function ClientesPage() {
  const { clientes, veiculos, ordens, deleteCliente, addCliente } = useStore();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleImportExcel(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const data = ev.target?.result;
      const wb = XLSX.read(data, { type: 'binary' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: '' });
      let count = 0;
      rows.forEach((row) => {
        const nome = String(row['Nome'] || row['nome'] || row['NOME'] || '').trim();
        const telefone = String(row['Telefone'] || row['telefone'] || row['Fone'] || row['fone'] || '').trim();
        if (!nome || nome.length < 2) return;
        addCliente({
          nome,
          telefone: telefone || '',
          whatsapp: String(row['WhatsApp'] || row['whatsapp'] || row['Whatsapp'] || telefone || '').trim(),
          cpfCnpj: String(row['CPF'] || row['cpf'] || row['CNPJ'] || row['cnpj'] || '').trim(),
          email: String(row['Email'] || row['email'] || '').trim(),
          endereco: String(row['Endereço'] || row['Endereco'] || row['endereco'] || row['Endereço'] || '').trim(),
          observacoes: String(row['Observações'] || row['Observacoes'] || row['obs'] || '').trim(),
        } as any);
        count++;
      });
      toast.success(`${count} clientes importados com sucesso!`);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsBinaryString(file);
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    const qPlaca = q.replace(/[^a-z0-9]/g, '');
    if (!q) return clientes;
    return clientes.filter((c) => {
      // Busca por nome, telefone, CPF
      if (
        c.nome.toLowerCase().includes(q) ||
        c.telefone.includes(q) ||
        c.cpfCnpj.includes(q)
      ) return true;
      // Busca pela placa dos veículos do cliente
      const clienteVeiculos = veiculos.filter(v => v.clienteId === c.id);
      return clienteVeiculos.some(v =>
        v.placa.toLowerCase().replace(/[^a-z0-9]/g, '').includes(qPlaca) ||
        v.placa.toLowerCase().includes(q)
      );
    });
  }, [clientes, veiculos, search]);

  function handleDelete(cliente: Cliente) {
    if (confirm(`Excluir cliente "${cliente.nome}"?`)) {
      deleteCliente(cliente.id);
      toast.success('Cliente excluído');
    }
  }

  function handleEdit(cliente: Cliente) {
    setEditingCliente(cliente);
    setModalOpen(true);
  }

  function handleNew() {
    setEditingCliente(null);
    setModalOpen(true);
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--muted-foreground))]" />
          <input
            type="text"
            placeholder="Buscar por nome, placa, telefone ou CPF..."
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
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2.5 border border-[rgb(var(--input-border))] text-[rgb(var(--foreground))] rounded-xl text-sm font-medium hover:bg-[rgb(var(--muted))] transition-colors flex-shrink-0"
          title="Importar clientes via Excel (.xlsx)"
        >
          <Upload className="w-4 h-4" />
          Importar Excel
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleImportExcel}
          className="hidden"
        />
        <button
          onClick={handleNew}
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-medium hover:bg-orange-600 transition-colors shadow-sm flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          Novo Cliente
        </button>
      </div>

      {/* Import helper tip */}
      <p className="text-xs text-[rgb(var(--muted-foreground))]">
        💡 Colunas esperadas no Excel: <span className="font-mono">Nome, Telefone, WhatsApp, CPF, Email, Endereço, Observações</span>
      </p>

      {/* List */}
      <div className="space-y-6">
        {filtered.length === 0 ? (
          <div className={cn(
            'rounded-2xl p-12 text-center border',
            'bg-[rgb(var(--card))] border-[rgb(var(--card-border))]'
          )}>
            <p className="text-[rgb(var(--muted-foreground))]">Nenhum cliente encontrado</p>
            <button
              onClick={handleNew}
              className="mt-3 text-sm text-orange-500 hover:underline"
            >
              Cadastrar primeiro cliente
            </button>
          </div>
        ) : (
          filtered.map((cliente, idx) => {
            const clienteVeiculos = veiculos.filter((v) => v.clienteId === cliente.id);
            const clienteOrdens = ordens.filter((o) => o.clienteId === cliente.id);

            return (
              <div
                key={cliente.id}
                className={cn(
                  'rounded-2xl p-4 border transition-all duration-200',
                  idx % 2 === 0
                    ? 'bg-[rgb(var(--card))] border-[rgb(var(--card-border))]'
                    : 'bg-orange-500/[0.03] border-orange-500/20 dark:bg-orange-500/[0.05]',
                  'hover:border-orange-500/40 hover:shadow-sm'
                )}
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0',
                    idx % 2 === 0
                      ? 'bg-gradient-to-br from-orange-400 to-orange-600'
                      : 'bg-gradient-to-br from-blue-400 to-blue-600'
                  )}>
                    {cliente.nome.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-[rgb(var(--foreground))]">{cliente.nome}</h3>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-sm text-[rgb(var(--muted-foreground))]">
                            {formatPhone(cliente.telefone)}
                          </span>
                          {cliente.cpfCnpj && (
                            <span className="text-xs text-[rgb(var(--muted-foreground))]">{cliente.cpfCnpj}</span>
                          )}
                        </div>
                        {cliente.observacoes && (
                          <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1 line-clamp-1">{cliente.observacoes}</p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <a
                          href={`https://wa.me/55${cliente.whatsapp.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg text-[rgb(var(--muted-foreground))] hover:text-green-500 hover:bg-green-500/10 transition-colors"
                          title="WhatsApp"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleEdit(cliente)}
                          className="p-1.5 rounded-lg text-[rgb(var(--muted-foreground))] hover:text-blue-500 hover:bg-blue-500/10 transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cliente)}
                          className="p-1.5 rounded-lg text-[rgb(var(--muted-foreground))] hover:text-red-500 hover:bg-red-500/10 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Vehicles preview with plates */}
                    <div className="flex items-center gap-4 mt-3">
                      <Link
                        href={`/veiculos?clienteId=${cliente.id}`}
                        className="flex items-center gap-1.5 text-xs text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] transition-colors"
                      >
                        <Car className="w-3.5 h-3.5" />
                        <span>{clienteVeiculos.length} veículo{clienteVeiculos.length !== 1 ? 's' : ''}</span>
                      </Link>
                      {/* Show plate badges */}
                      {clienteVeiculos.slice(0, 3).map(v => (
                        <span key={v.id} className="font-mono text-xs bg-[rgb(var(--muted))] px-2 py-0.5 rounded font-bold text-[rgb(var(--foreground))]">
                          {v.placa}
                        </span>
                      ))}
                      <Link
                        href={`/ordens?clienteId=${cliente.id}`}
                        className="flex items-center gap-1.5 text-xs text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] transition-colors ml-auto"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>{clienteOrdens.length} OS</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <ClienteModal
          cliente={editingCliente}
          onClose={() => {
            setModalOpen(false);
            setEditingCliente(null);
          }}
        />
      )}
    </div>
  );
}
