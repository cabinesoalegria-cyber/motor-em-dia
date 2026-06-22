'use client';

import { useState, useMemo } from 'react';
import { useStore } from '@/lib/store';
import { OrcamentoItem } from '@/lib/types';
import { formatCurrency, formatDate, generateId, cn } from '@/lib/utils';
import {
  FileText, Plus, Trash2, ChevronDown, Send, Printer,
  CheckCircle, XCircle, ArrowRight, Clock, Pencil,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

const inputCn = cn(
  'w-full px-3 py-2.5 rounded-xl text-sm border',
  'bg-[rgb(var(--input-bg))] border-[rgb(var(--input-border))]',
  'text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))]',
  'focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-colors'
);

function getStatusBadge(status: string) {
  switch (status) {
    case 'pendente': return 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400';
    case 'aprovado': return 'bg-green-500/15 text-green-600 dark:text-green-400';
    case 'recusado': return 'bg-red-500/15 text-red-500';
    case 'expirado': return 'bg-gray-500/15 text-gray-500';
    default: return 'bg-gray-500/15 text-gray-500';
  }
}

function getStatusLabel(status: string) {
  const map: Record<string, string> = { pendente: 'Aguardando aprovação', aprovado: 'Aprovado', recusado: 'Recusado', expirado: 'Expirado' };
  return map[status] || status;
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className={cn('rounded-2xl p-5 border', 'bg-[rgb(var(--card))] border-[rgb(var(--card-border))]')}>
      <h3 className="font-semibold text-[rgb(var(--foreground))] mb-4">{title}</h3>
      {children}
    </div>
  );
}

export default function OrcamentosPage() {
  const { clientes, veiculos, orcamentos, addOrcamento, updateOrcamento, deleteOrcamento, approveOrcamento, servicosCatalogo, pecas: stockPecas } = useStore();

  const [tab, setTab] = useState<'lista' | 'novo'>('lista');

  // New orcamento form state
  const [clienteId, setClienteId] = useState('');
  const [veiculoId, setVeiculoId] = useState('');
  const [validade, setValidade] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [observacoes, setObservacoes] = useState('');
  const [itens, setItens] = useState<OrcamentoItem[]>([]);

  // Separate servico/peca inputs
  const [servicoDesc, setServicoDesc] = useState('');
  const [servicoValor, setServicoValor] = useState('');
  const [showServicSugg, setShowServicSugg] = useState(false);

  const [pecaDesc, setPecaDesc] = useState('');
  const [pecaQtd, setPecaQtd] = useState('1');
  const [pecaValor, setPecaValor] = useState('');
  const [showPecaSugg, setShowPecaSugg] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editObservacoes, setEditObservacoes] = useState('');
  const [editValidade, setEditValidade] = useState('');

  const clienteVeiculos = veiculos.filter(v => v.clienteId === clienteId);
  const valorTotal = itens.reduce((s, i) => s + i.valorTotal, 0);

  const orcamentosComDetalhes = useMemo(() =>
    orcamentos.map(o => ({
      ...o,
      cliente: clientes.find(c => c.id === o.clienteId),
      veiculo: veiculos.find(v => v.id === o.veiculoId),
    })),
    [orcamentos, clientes, veiculos]
  );

  // Autocomplete suggestions
  const servicoSuggestions = useMemo(() => {
    const q = servicoDesc.toLowerCase().trim();
    if (!q) return servicosCatalogo.slice(0, 8);
    return servicosCatalogo.filter(s =>
      s.nome.toLowerCase().includes(q) ||
      (s.categoria || '').toLowerCase().includes(q)
    ).slice(0, 10);
  }, [servicoDesc, servicosCatalogo]);

  const pecaSuggestions = useMemo(() => {
    const q = pecaDesc.toLowerCase().trim();
    if (!q) return stockPecas.slice(0, 8);
    return stockPecas.filter(p =>
      p.nome.toLowerCase().includes(q) ||
      (p.codigo || '').toLowerCase().includes(q)
    ).slice(0, 10);
  }, [pecaDesc, stockPecas]);

  function addServico() {
    if (!servicoDesc.trim()) return;
    const val = Number(servicoValor);
    if (!val || val <= 0) { toast.error('Informe o valor do serviço'); return; }
    setItens(prev => [...prev, { id: generateId(), descricao: servicoDesc, tipo: 'servico', quantidade: 1, valorUnitario: val, valorTotal: val }]);
    setServicoDesc(''); setServicoValor('');
  }

  function addPeca() {
    if (!pecaDesc.trim()) return;
    const val = Number(pecaValor);
    if (!val || val <= 0) { toast.error('Informe o valor da peça'); return; }
    const qtd = Number(pecaQtd) || 1;
    setItens(prev => [...prev, { id: generateId(), descricao: pecaDesc, tipo: 'peca', quantidade: qtd, valorUnitario: val, valorTotal: qtd * val }]);
    setPecaDesc(''); setPecaValor(''); setPecaQtd('1');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!clienteId || !veiculoId) {
      toast.error('Selecione cliente e veículo');
      return;
    }
    addOrcamento({ clienteId, veiculoId, itens, valorTotal, validade, status: 'pendente', observacoes });
    toast.success('Orçamento criado!');
    setTab('lista');
    setClienteId(''); setVeiculoId(''); setItens([]); setObservacoes('');
  }

  function handlePrint(o: typeof orcamentosComDetalhes[0]) {
    const officeName = localStorage.getItem('autoflow-office-name') || 'Sua Oficina';
    const officePhone = localStorage.getItem('autoflow-office-phone') || '';
    const officeAddress = localStorage.getItem('autoflow-office-address') || '';
    const officeLogo = localStorage.getItem('autoflow-office-logo') || '';

    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Orçamento ${o.numero}</title>
<style>
  body { font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 32px; color: #1a1a1a; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; border-bottom: 2px solid #f97316; padding-bottom: 16px; }
  .office-name { font-size: 24px; font-weight: 700; color: #f97316; }
  .office-info { font-size: 12px; color: #666; margin-top: 4px; }
  .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; background: #fef3c7; color: #92400e; }
  h2 { font-size: 18px; margin: 0 0 4px; }
  .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 24px 0; }
  .meta-box { background: #f9f9f9; border-radius: 8px; padding: 12px; }
  .meta-box label { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px; }
  .meta-box p { font-size: 14px; font-weight: 600; margin: 0; }
  table { width: 100%; border-collapse: collapse; margin: 24px 0; }
  th { text-align: left; padding: 10px 12px; background: #f97316; color: white; font-size: 13px; }
  td { padding: 10px 12px; border-bottom: 1px solid #eee; font-size: 13px; }
  tr:last-child td { border-bottom: none; }
  .total-row td { font-weight: 700; font-size: 16px; background: #fff8f3; border-top: 2px solid #f97316; }
  .tipo-servico { background: #dbeafe; color: #1e40af; border-radius: 4px; padding: 2px 8px; font-size: 11px; }
  .tipo-peca { background: #dcfce7; color: #166534; border-radius: 4px; padding: 2px 8px; font-size: 11px; }
  .obs { background: #f9f9f9; border-radius: 8px; padding: 12px; margin: 16px 0; font-size: 13px; color: #555; }
  .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; margin-top: 64px; padding-top: 24px; border-top: 1px solid #eee; }
  .sig-box { text-align: center; }
  .sig-line { border-top: 1px solid #333; margin-bottom: 8px; }
  .sig-label { font-size: 12px; color: #666; }
  .validity { font-size: 13px; color: #888; text-align: right; margin-top: 12px; }
  .approval-box { border: 2px dashed #f97316; border-radius: 12px; padding: 16px; margin: 24px 0; }
  .approval-title { font-weight: 700; color: #f97316; margin-bottom: 8px; }
  @media print { body { padding: 16px; } }
</style>
</head><body>
<div class="header">
  <div style="display:flex;align-items:center;gap:14px">
    ${officeLogo ? `<img src="${officeLogo}" alt="logo" style="width:56px;height:56px;object-fit:contain;border-radius:8px;border:1px solid #e5e7eb">` : ''}
    <div>
      <div class="office-name">${officeName}</div>
      ${officePhone ? `<div class="office-info">Tel: ${officePhone}</div>` : ''}
      ${officeAddress ? `<div class="office-info">${officeAddress}</div>` : ''}
    </div>
  </div>
  <div style="text-align:right">
    <h2>Orçamento ${o.numero}</h2>
    <span class="badge">Aguardando Aprovação</span>
    <div style="font-size:12px;color:#888;margin-top:4px">Emitido em ${new Date().toLocaleDateString('pt-BR')}</div>
  </div>
</div>

<div class="meta">
  <div class="meta-box">
    <label>Cliente</label>
    <p>${o.cliente?.nome || '—'}</p>
    <div style="font-size:12px;color:#888;margin-top:2px">${o.cliente?.telefone || ''} ${(o.cliente as any)?.endereco ? '· ' + (o.cliente as any).endereco : ''}</div>
  </div>
  <div class="meta-box">
    <label>Veículo</label>
    <p>${o.veiculo ? `${o.veiculo.marca} ${o.veiculo.modelo} ${o.veiculo.ano}` : '—'}</p>
    <div style="font-size:12px;color:#888;margin-top:2px">🪪 ${o.veiculo?.placa || ''} · ${o.veiculo?.quilometragem?.toLocaleString('pt-BR') || '?'} km</div>
  </div>
</div>

${o.itens.length > 0 ? `<table>
  <thead>
    <tr><th>Descrição</th><th>Tipo</th><th style="text-align:center">Qtd</th><th style="text-align:right">Unit.</th><th style="text-align:right">Total</th></tr>
  </thead>
  <tbody>
    ${o.itens.map(item => `
    <tr>
      <td>${item.descricao}</td>
      <td><span class="${item.tipo === 'servico' ? 'tipo-servico' : 'tipo-peca'}">${item.tipo === 'servico' ? 'Serviço' : 'Peça'}</span></td>
      <td style="text-align:center">${item.quantidade}</td>
      <td style="text-align:right">R$ ${item.valorUnitario.toFixed(2).replace('.', ',')}</td>
      <td style="text-align:right">R$ ${item.valorTotal.toFixed(2).replace('.', ',')}</td>
    </tr>`).join('')}
    <tr class="total-row">
      <td colspan="4">TOTAL</td>
      <td style="text-align:right;color:#f97316">R$ ${o.valorTotal.toFixed(2).replace('.', ',')}</td>
    </tr>
  </tbody>
</table>` : '<p style="color:#888;font-size:13px;margin:16px 0">Nenhum item no orçamento.</p>'}

${o.observacoes ? `<div class="obs"><strong>Problema Relatado pelo Cliente:</strong> ${o.observacoes}</div>` : ''}

<div style="margin: 16px 0; padding: 10px 14px; background: #fff8e1; border: 1.5px solid #f59e0b; border-radius: 8px; font-size: 13px; color: #92400e; font-weight: 600;">
  ⚠️ Obs: ORÇAMENTO SUJEITO A ALTERAÇÕES!
</div>

<div class="approval-box">
  <div class="approval-title">✅ Aprovação do Orçamento</div>
  <p style="font-size:13px;color:#555;margin:0">
    Ao assinar abaixo, o cliente declara estar ciente e de acordo com os serviços e valores descritos neste orçamento,
    autorizando o início dos trabalhos.
  </p>
  <div class="validity">Válido até: <strong>${new Date(o.validade + 'T12:00:00').toLocaleDateString('pt-BR')}</strong></div>
</div>

<div class="signatures">
  <div class="sig-box">
    <div style="height:60px"></div>
    <div class="sig-line"></div>
    <div class="sig-label"><strong>${o.cliente?.nome || 'Cliente'}</strong><br>Assinatura do Cliente · CPF: ${o.cliente?.cpfCnpj || '________________'}</div>
  </div>
  <div class="sig-box">
    <div style="height:60px"></div>
    <div class="sig-line"></div>
    <div class="sig-label"><strong>${officeName}</strong><br>Responsável pela Oficina</div>
  </div>
</div>

<div style="text-align:center;margin-top:32px;font-size:11px;color:#aaa">
  Data: _____ / _____ / ___________
</div>

</body></html>`;

    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
      win.onload = () => win.print();
    }
  }

  function handleSendWhatsApp(o: typeof orcamentosComDetalhes[0]) {
    if (!o.cliente) return;
    const officeName = localStorage.getItem('autoflow-office-name') || 'Sua Oficina';
    const msg = `Olá ${o.cliente.nome}! 📋\n\nSegue o *Orçamento ${o.numero}* da ${officeName}:\n\n${o.itens.map(i => `• ${i.descricao}: *R$ ${i.valorTotal.toFixed(2).replace('.', ',')}*`).join('\n')}${o.itens.length === 0 ? '_(sem itens)_' : ''}\n\n*Total: R$ ${o.valorTotal.toFixed(2).replace('.', ',')}*\n\n_Válido até ${new Date(o.validade + 'T12:00:00').toLocaleDateString('pt-BR')}_\n\nResponda *SIM* para aprovar ou *NÃO* para recusar.\n\n⚠️ Obs: ORÇAMENTO SUJEITO A ALTERAÇÕES!\n\n_${officeName}_`;
    window.open(`https://wa.me/55${o.cliente.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Tabs + New Button */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-1 bg-[rgb(var(--muted))] rounded-xl p-1">
          <button
            onClick={() => setTab('lista')}
            className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-all', tab === 'lista' ? 'bg-[rgb(var(--card))] text-[rgb(var(--foreground))] shadow-sm' : 'text-[rgb(var(--muted-foreground))]')}
          >
            Lista de Orçamentos
          </button>
          <button
            onClick={() => setTab('novo')}
            className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-all', tab === 'novo' ? 'bg-[rgb(var(--card))] text-[rgb(var(--foreground))] shadow-sm' : 'text-[rgb(var(--muted-foreground))]')}
          >
            + Novo Orçamento
          </button>
        </div>
        {tab === 'lista' && (
          <button
            onClick={() => setTab('novo')}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition-colors shadow-md shadow-orange-500/20"
          >
            <Plus className="w-4 h-4" /> Novo Orçamento
          </button>
        )}
      </div>

      {/* LISTA */}
      {tab === 'lista' && (
        <div className="space-y-5">
          {orcamentosComDetalhes.length === 0 ? (
            <div className={cn('rounded-2xl p-16 text-center border', 'bg-[rgb(var(--card))] border-[rgb(var(--card-border))]')}>
              <FileText className="w-10 h-10 text-[rgb(var(--muted-foreground))] mx-auto mb-3" />
              <p className="font-medium text-[rgb(var(--foreground))]">Nenhum orçamento criado</p>
              <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1 mb-4">Crie um orçamento para enviar ao cliente antes de iniciar o serviço</p>
              <button onClick={() => setTab('novo')} className="px-4 py-2 bg-orange-500 text-white rounded-xl text-sm font-medium hover:bg-orange-600 transition-colors">
                Criar Orçamento
              </button>
            </div>
          ) : (
            orcamentosComDetalhes.map(o => (
              <div key={o.id} className={cn('rounded-2xl border p-5 transition-all', 'bg-[rgb(var(--card))] border-[rgb(var(--card-border))] hover:border-orange-500/30')}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-sm text-[rgb(var(--foreground))]">{o.numero}</span>
                      <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', getStatusBadge(o.status))}>
                        {getStatusLabel(o.status)}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-[rgb(var(--foreground))] mt-1">👤 {o.cliente?.nome}</p>
                    {o.veiculo && (
                      <p className="text-xs text-[rgb(var(--muted-foreground))] mt-0.5">🚗 {o.veiculo.marca} {o.veiculo.modelo} · <strong>{o.veiculo.placa}</strong></p>
                    )}
                    <p className="text-xs text-[rgb(var(--muted-foreground))] mt-0.5">
                      <Clock className="w-3 h-3 inline mr-1" />
                      Válido até {new Date(o.validade + 'T12:00:00').toLocaleDateString('pt-BR')}
                    </p>
                    <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">{o.itens.length} item{o.itens.length !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xl font-bold text-orange-500">{formatCurrency(o.valorTotal)}</p>
                    <p className="text-xs text-[rgb(var(--muted-foreground))] mt-0.5">{formatDate(o.createdAt)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[rgb(var(--card-border))] flex-wrap">
                  {o.ordemServicoId ? (
                    <Link
                      href={`/ordens/${o.ordemServicoId}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 transition-colors"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                      Ver OS Gerada
                    </Link>
                  ) : o.status === 'pendente' ? (
                    <>
                      <button onClick={async () => {
                        try {
                          const osId = await approveOrcamento(o.id);
                          toast.success('Orçamento aprovado! OS criada automaticamente.');
                          if (osId) window.location.href = `/ordens/${osId}`;
                        } catch (err) {
                          toast.error('Erro ao criar OS. Tente novamente.');
                          console.error(err);
                        }
                      }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-500 text-white hover:bg-green-600 transition-colors">
                        <CheckCircle className="w-3.5 h-3.5" /> Aprovar e Criar OS
                      </button>
                      <button onClick={() => { updateOrcamento(o.id, { status: 'recusado' }); toast.info('Orçamento recusado'); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors">
                        <XCircle className="w-3.5 h-3.5" /> Recusar
                      </button>
                    </>
                  ) : null}
                  <button onClick={() => handleSendWhatsApp(o)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-500/10 text-green-600 hover:bg-green-500/20 transition-colors">
                    <Send className="w-3.5 h-3.5" /> WhatsApp
                  </button>
                  <button onClick={() => handlePrint(o)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[rgb(var(--muted))] text-[rgb(var(--foreground))] hover:bg-[rgb(var(--card-border))] transition-colors">
                    <Printer className="w-3.5 h-3.5" /> PDF/Imprimir
                  </button>
                  {o.status !== 'aprovado' && (
                    <button onClick={() => { setEditingId(editingId === o.id ? null : o.id); setEditObservacoes(o.observacoes || ''); setEditValidade(o.validade); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[rgb(var(--muted))] text-[rgb(var(--foreground))] hover:bg-orange-500/10 hover:text-orange-500 transition-colors">
                      <Pencil className="w-3.5 h-3.5" /> Editar
                    </button>
                  )}
                  <button onClick={() => { if (confirm('Excluir orçamento?')) { deleteOrcamento(o.id); toast.success('Excluído'); } }}
                    className="ml-auto p-1.5 rounded-lg text-[rgb(var(--muted-foreground))] hover:text-red-500 hover:bg-red-500/10 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Inline Edit Panel */}
                {editingId === o.id && (
                  <div className="mt-3 pt-3 border-t border-[rgb(var(--card-border))] space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-[rgb(var(--muted-foreground))] mb-1">Validade</label>
                        <input type="date" value={editValidade} onChange={e => setEditValidade(e.target.value)} className={inputCn} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-[rgb(var(--muted-foreground))] mb-1">Problema / Observações</label>
                      <textarea value={editObservacoes} onChange={e => setEditObservacoes(e.target.value)} className={cn(inputCn, 'resize-none')} rows={2} />
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setEditingId(null)} className="flex-1 py-2 rounded-xl border border-[rgb(var(--card-border))] text-sm text-[rgb(var(--muted-foreground))]">Cancelar</button>
                      <button type="button" onClick={() => {
                        updateOrcamento(o.id, { observacoes: editObservacoes, validade: editValidade });
                        toast.success('Orçamento atualizado!');
                        setEditingId(null);
                      }} className="flex-1 py-2 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600">Salvar</button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* NOVO ORÇAMENTO */}
      {tab === 'novo' && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <SectionCard title="Cliente e Veículo">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-[rgb(var(--foreground))]">Cliente *</label>
                <div className="relative">
                  <select value={clienteId} onChange={e => { setClienteId(e.target.value); setVeiculoId(''); }} className={cn(inputCn, 'appearance-none pr-8')}>
                    <option value="">Selecione</option>
                    {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--muted-foreground))] pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-[rgb(var(--foreground))]">Veículo *</label>
                <div className="relative">
                  <select value={veiculoId} onChange={e => setVeiculoId(e.target.value)} disabled={!clienteId} className={cn(inputCn, 'appearance-none pr-8 disabled:opacity-50')}>
                    <option value="">Selecione</option>
                    {clienteVeiculos.map(v => <option key={v.id} value={v.id}>{v.marca} {v.modelo} — {v.placa}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--muted-foreground))] pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-[rgb(var(--foreground))]">Validade</label>
                <input type="date" value={validade} onChange={e => setValidade(e.target.value)} className={inputCn} />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Itens do Orçamento">
            <div className="space-y-4">
              {/* Existing items */}
              {itens.map(item => (
                <div key={item.id} className="flex items-center gap-2 p-3 rounded-xl bg-[rgb(var(--muted))]">
                  <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0',
                    item.tipo === 'servico' ? 'bg-blue-500/15 text-blue-600' : 'bg-green-500/15 text-green-600')}>
                    {item.tipo === 'servico' ? 'Serviço' : 'Peça'}
                  </span>
                  <span className="flex-1 text-sm text-[rgb(var(--foreground))] truncate">{item.descricao}</span>
                  <span className="text-xs text-[rgb(var(--muted-foreground))]">x{item.quantidade}</span>
                  <span className="text-sm font-medium text-[rgb(var(--foreground))] flex-shrink-0">{formatCurrency(item.valorTotal)}</span>
                  <button type="button" onClick={() => setItens(p => p.filter(i => i.id !== item.id))} className="text-[rgb(var(--muted-foreground))] hover:text-red-500 p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {/* Serviço row */}
              <div>
                <label className="block text-xs font-semibold text-blue-500 uppercase tracking-wide mb-1.5">🔧 Serviço</label>
                <div className="flex gap-2">
                  <div className="flex-1 relative z-30">
                    <input
                      type="text"
                      placeholder="Buscar no catálogo de serviços..."
                      value={servicoDesc}
                      onChange={e => { setServicoDesc(e.target.value); setShowServicSugg(true); }}
                      onFocus={() => setShowServicSugg(true)}
                      onBlur={() => setTimeout(() => setShowServicSugg(false), 200)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addServico(); } }}
                      className={cn(inputCn, 'w-full')}
                    />
                    {showServicSugg && servicoSuggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 rounded-xl shadow-2xl border border-[rgb(var(--card-border))] overflow-hidden z-[999]" style={{ backgroundColor: 'rgb(var(--card))' }}>
                        <div className="max-h-48 overflow-y-auto">
                          {servicoSuggestions.map(s => (
                            <button key={s.id} type="button"
                              onMouseDown={e => { e.preventDefault(); setServicoDesc(s.nome); setServicoValor(String(s.valorPadrao)); setShowServicSugg(false); }}
                              className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-[rgb(var(--muted))] transition-colors text-left border-b border-[rgb(var(--card-border))] last:border-0">
                              <span className="text-sm text-[rgb(var(--foreground))]">{s.nome}</span>
                              <span className="text-sm font-bold text-blue-500 ml-3">{formatCurrency(s.valorPadrao)}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <input type="number" placeholder="R$" value={servicoValor} onChange={e => setServicoValor(e.target.value)}
                    className={cn(inputCn, 'w-24 flex-shrink-0')} min="0" step="0.01"
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addServico(); } }} />
                  <button type="button" onClick={addServico} className="p-2.5 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors flex-shrink-0">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Peça row */}
              <div>
                <label className="block text-xs font-semibold text-emerald-500 uppercase tracking-wide mb-1.5">📦 Peça</label>
                <div className="flex gap-2">
                  <div className="flex-1 relative z-20">
                    <input
                      type="text"
                      placeholder="Buscar no estoque de peças..."
                      value={pecaDesc}
                      onChange={e => { setPecaDesc(e.target.value); setShowPecaSugg(true); }}
                      onFocus={() => setShowPecaSugg(true)}
                      onBlur={() => setTimeout(() => setShowPecaSugg(false), 200)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addPeca(); } }}
                      className={cn(inputCn, 'w-full')}
                    />
                    {showPecaSugg && pecaSuggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 rounded-xl shadow-2xl border border-[rgb(var(--card-border))] overflow-hidden z-[998]" style={{ backgroundColor: 'rgb(var(--card))' }}>
                        <div className="max-h-48 overflow-y-auto">
                          {pecaSuggestions.map(p => (
                            <button key={p.id} type="button"
                              onMouseDown={e => { e.preventDefault(); setPecaDesc(p.nome); setPecaValor(String(p.custo)); setShowPecaSugg(false); }}
                              className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-[rgb(var(--muted))] transition-colors text-left border-b border-[rgb(var(--card-border))] last:border-0">
                              <span className="text-sm text-[rgb(var(--foreground))]">{p.nome}</span>
                              <span className="text-sm font-bold text-emerald-500 ml-3">{formatCurrency(p.custo)}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <input type="number" placeholder="Qtd" value={pecaQtd} onChange={e => setPecaQtd(e.target.value)}
                    className={cn(inputCn, 'w-16 flex-shrink-0')} min="1" />
                  <input type="number" placeholder="R$" value={pecaValor} onChange={e => setPecaValor(e.target.value)}
                    className={cn(inputCn, 'w-24 flex-shrink-0')} min="0" step="0.01"
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addPeca(); } }} />
                  <button type="button" onClick={addPeca} className="p-2.5 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-colors flex-shrink-0">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {itens.length > 0 && (
                <div className="flex justify-between items-center pt-2 border-t border-[rgb(var(--card-border))]">
                  <span className="text-sm text-[rgb(var(--muted-foreground))]">Total do orçamento</span>
                  <span className="text-xl font-bold text-orange-500">{formatCurrency(valorTotal)}</span>
                </div>
              )}
            </div>
          </SectionCard>

          <SectionCard title="Problema Relatado pelo Cliente">
            <textarea
              value={observacoes}
              onChange={e => setObservacoes(e.target.value)}
              className={cn(inputCn, 'resize-none')}
              rows={3}
              placeholder="Descreva o problema que o cliente relatou..."
            />
          </SectionCard>

          <div className="flex gap-3">
            <button type="button" onClick={() => setTab('lista')} className="flex-1 py-3 rounded-xl border border-[rgb(var(--input-border))] text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))] transition-colors text-sm font-medium">
              Cancelar
            </button>
            <button type="submit" className="flex-1 py-3 rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition-colors text-sm font-semibold shadow-md shadow-orange-500/20">
              Criar Orçamento
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
