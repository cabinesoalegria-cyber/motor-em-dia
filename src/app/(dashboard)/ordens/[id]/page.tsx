'use client';

import { useParams } from 'next/navigation';
import { useStore } from '@/lib/store';
import { formatCurrency, formatDate, getStatusColor, getStatusLabel, buildWhatsAppLink, cn } from '@/lib/utils';
import {
  ArrowLeft, Printer, MessageSquare, CheckCircle,
  Car, User, Gauge, Wrench, Package, Pencil,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { OrdemServico } from '@/lib/types';

const STATUS_FLOW: { value: OrdemServico['status']; label: string }[] = [
  { value: 'aberta', label: 'Aberta' },
  { value: 'em_andamento', label: 'Em Andamento' },
  { value: 'aguardando_peca', label: 'Aguardando Peça' },
  { value: 'finalizada', label: 'Finalizada' },
  { value: 'entregue', label: 'Entregue' },
];

export default function OrdemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { ordens, clientes, veiculos, updateOrdemStatus } = useStore();

  const ordem = ordens.find((o) => o.id === id);
  const cliente = ordem ? clientes.find((c) => c.id === ordem.clienteId) : null;
  const veiculo = ordem ? veiculos.find((v) => v.id === ordem.veiculoId) : null;

  if (!ordem) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <p className="text-[rgb(var(--muted-foreground))]">OS não encontrada</p>
        <Link href="/ordens" className="text-orange-500 hover:underline text-sm">Voltar</Link>
      </div>
    );
  }

  function handleStatusChange(status: OrdemServico['status']) {
    updateOrdemStatus(id, status);
    const label = getStatusLabel(status);
    if (status === 'entregue') {
      toast.success(`Status: ${label} — lançamento financeiro criado automaticamente! 💰`);
    } else {
      toast.success(`Status: ${label}`);
    }
  }

  function handleWhatsApp() {
    if (!cliente) return;
    const officeName = localStorage.getItem('autoflow-office-name') || 'Sua Oficina';
    const msg = [
      `Ola ${cliente.nome}!`,
      ``,
      `Sua OS *${ordem!.numero}* esta com status: *${getStatusLabel(ordem!.status)}*.`,
      ``,
      `Veiculo: *${veiculo?.marca} ${veiculo?.modelo}* - Placa: *${veiculo?.placa}*`,
      `Valor total: *${formatCurrency(ordem!.valorTotal)}*`,
      ``,
      `Qualquer duvida, estamos a disposicao!`,
      ``,
      `_${officeName}_`,
    ].join('\n');
    window.open(buildWhatsAppLink(cliente.whatsapp, msg), '_blank');
  }

  function handlePrint() {
    const officeName = localStorage.getItem('autoflow-office-name') || 'Sua Oficina';
    const officePhone = localStorage.getItem('autoflow-office-phone') || '';
    const officeAddress = localStorage.getItem('autoflow-office-address') || '';
    const officeLogo = localStorage.getItem('autoflow-office-logo') || '';

    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
<title>OS ${ordem!.numero} — ${officeName}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: Arial, sans-serif; max-width: 720px; margin: 0 auto; padding: 32px; color: #1a1a1a; font-size: 14px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; padding-bottom: 16px; border-bottom: 3px solid #f97316; }
  .office-name { font-size: 26px; font-weight: 800; color: #f97316; }
  .office-info { font-size: 12px; color: #666; margin-top: 4px; line-height: 1.6; }
  .os-number { font-size: 20px; font-weight: 700; color: #1a1a1a; font-family: monospace; }
  .badge { display: inline-block; padding: 4px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; background: #fff7ed; color: #c2410c; border: 1px solid #fed7aa; }
  .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin: 20px 0; }
  .meta-box { background: #f9fafb; border-radius: 8px; padding: 12px 14px; border: 1px solid #e5e7eb; }
  .meta-box .label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.8px; color: #9ca3af; font-weight: 600; margin-bottom: 4px; }
  .meta-box .value { font-size: 15px; font-weight: 700; color: #111; }
  .meta-box .sub { font-size: 12px; color: #6b7280; margin-top: 2px; }
  .section-title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #f97316; margin: 24px 0 10px; display: flex; align-items: center; gap: 6px; }
  .section-title::after { content: ''; flex: 1; height: 1px; background: #fed7aa; }
  .problem-box { background: #fff7ed; border-left: 3px solid #f97316; padding: 12px 16px; border-radius: 0 8px 8px 0; font-size: 14px; color: #374151; line-height: 1.6; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #f97316; color: white; padding: 9px 12px; text-align: left; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
  th:last-child, td:last-child { text-align: right; }
  td { padding: 9px 12px; border-bottom: 1px solid #f3f4f6; font-size: 13px; color: #374151; }
  tr:last-child td { border-bottom: none; }
  tr:nth-child(even) td { background: #f9fafb; }
  .total-section { margin-top: 16px; border: 2px solid #f97316; border-radius: 10px; overflow: hidden; }
  .total-row { display: flex; justify-content: space-between; padding: 9px 16px; font-size: 13px; }
  .total-row.final { background: #f97316; color: white; font-size: 16px; font-weight: 800; }
  .total-row.alt { background: #fff7ed; }
  .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; margin-top: 56px; }
  .sig-area { text-align: center; }
  .sig-line { border-top: 1px solid #374151; margin-bottom: 8px; padding-top: 4px; }
  .sig-name { font-size: 13px; font-weight: 700; color: #111; }
  .sig-role { font-size: 11px; color: #9ca3af; margin-top: 2px; }
  .footer { margin-top: 32px; text-align: center; font-size: 11px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 12px; }
  .tipo-servico { display: inline-block; background: #dbeafe; color: #1e40af; border-radius: 4px; padding: 1px 8px; font-size: 11px; font-weight: 600; }
  .tipo-peca { display: inline-block; background: #dcfce7; color: #166534; border-radius: 4px; padding: 1px 8px; font-size: 11px; font-weight: 600; }
  @media print { body { padding: 16px; } .no-print { display: none; } }
</style>
</head><body>

<div class="header">
  <div style="display:flex;align-items:center;gap:14px">
    ${officeLogo ? `<img src="${officeLogo}" alt="logo" style="width:60px;height:60px;object-fit:contain;border-radius:8px;border:1px solid #e5e7eb">` : ''}
    <div>
      <div class="office-name">${officeName}</div>
      <div class="office-info">
        ${officePhone ? `Tel: ${officePhone}<br>` : ''}
        ${officeAddress ? officeAddress : ''}
      </div>
    </div>
  </div>
  <div style="text-align:right">
    <div class="os-number">${ordem!.numero}</div>
    <div style="margin: 4px 0"><span class="badge">${getStatusLabel(ordem!.status)}</span></div>
    <div style="font-size:12px;color:#6b7280;">Entrada: ${formatDate(ordem!.dataEntrada)}${ordem!.dataConclusao ? ` · Saída: ${formatDate(ordem!.dataConclusao)}` : ''}</div>
  </div>
</div>

<div class="meta-grid">
  <div class="meta-box">
    <div class="label">👤 Cliente</div>
    <div class="value">${cliente?.nome || '—'}</div>
    <div class="sub">${cliente?.telefone || ''}${(cliente as any)?.cpfCnpj ? ` · CPF: ${(cliente as any).cpfCnpj}` : ''}</div>
    ${(cliente as any)?.endereco ? `<div class="sub">📍 ${(cliente as any).endereco}</div>` : ''}
  </div>
  <div class="meta-box">
    <div class="label">🚗 Veículo</div>
    <div class="value">${veiculo ? `${veiculo.marca} ${veiculo.modelo} ${veiculo.ano}` : '—'}</div>
    <div class="sub">Placa: <strong>${veiculo?.placa || '—'}</strong> · Cor: ${veiculo?.cor || '—'}</div>
    <div class="sub">KM na entrada: ${ordem!.quilometragemAtual.toLocaleString('pt-BR')} km</div>
  </div>
</div>

<div class="section-title">Problema Relatado</div>
<div class="problem-box">${ordem!.problemaRelatado}</div>

${ordem!.servicos.length > 0 ? `
<div class="section-title">Serviços Executados</div>
<table>
  <thead><tr><th>Descrição</th><th style="text-align:right">Valor</th><th style="text-align:right">Próxima Revisão</th></tr></thead>
  <tbody>
    ${ordem!.servicos.map(s => `<tr><td>${s.descricao}</td><td>R$ ${s.valor.toFixed(2).replace('.', ',')}</td><td style="font-size:11px;color:#7c3aed;text-align:right">${
      s.proximaRevisaoKm || s.proximaRevisaoData
        ? [s.proximaRevisaoKm ? `${s.proximaRevisaoKm.toLocaleString('pt-BR')} km` : '', s.proximaRevisaoData ? new Date(s.proximaRevisaoData + 'T12:00:00').toLocaleDateString('pt-BR') : ''].filter(Boolean).join(' / ')
        : '—'
    }</td></tr>`).join('')}
    <tr style="font-weight:700;background:#fff7ed"><td colspan="2">Subtotal Mão de Obra</td><td>R$ ${ordem!.valorMaoDeObra.toFixed(2).replace('.', ',')}</td></tr>
  </tbody>
</table>` : ''}

${ordem!.pecas.length > 0 ? `
<div class="section-title">Peças Utilizadas</div>
<table>
  <thead><tr><th>Peça</th><th style="text-align:center">Qtd</th><th style="text-align:right">Unit.</th><th style="text-align:right">Total</th></tr></thead>
  <tbody>
    ${ordem!.pecas.map(p => `<tr><td>${p.nome}</td><td style="text-align:center">${p.quantidade}</td><td>R$ ${p.valorUnitario.toFixed(2).replace('.', ',')}</td><td>R$ ${p.valorTotal.toFixed(2).replace('.', ',')}</td></tr>`).join('')}
    <tr style="font-weight:700;background:#f0fdf4"><td colspan="3">Subtotal Peças</td><td>R$ ${ordem!.valorPecas.toFixed(2).replace('.', ',')}</td></tr>
  </tbody>
</table>` : ''}

<div class="total-section" style="margin-top:20px">
  <div class="total-row alt"><span>Mão de obra</span><span>R$ ${ordem!.valorMaoDeObra.toFixed(2).replace('.', ',')}</span></div>
  <div class="total-row"><span>Peças</span><span>R$ ${ordem!.valorPecas.toFixed(2).replace('.', ',')}</span></div>
  <div class="total-row final"><span>TOTAL</span><span>R$ ${ordem!.valorTotal.toFixed(2).replace('.', ',')}</span></div>
</div>

<div class="signatures">
  <div class="sig-area">
    <div style="height:56px"></div>
    <div class="sig-line"></div>
    <div class="sig-name">${cliente?.nome || 'Cliente'}</div>
    <div class="sig-role">Assinatura do Cliente — Recebimento do Veículo</div>
    <div style="font-size:11px;color:#9ca3af;margin-top:4px">CPF: ${(cliente as any)?.cpfCnpj || '________________________'}</div>
  </div>
  <div class="sig-area">
    <div style="height:56px"></div>
    <div class="sig-line"></div>
    <div class="sig-name">${officeName}</div>
    <div class="sig-role">Responsável pela Oficina</div>
  </div>
</div>

<div class="footer">
  Data de entrega: _____ / _____ / ___________
  &nbsp;&nbsp;·&nbsp;&nbsp;
  ${officeName}${officePhone ? ` · ${officePhone}` : ''}${officeAddress ? ` · ${officeAddress}` : ''}
</div>

</body></html>`;

    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
      win.onload = () => win.print();
    }
  }

  const statusIndex = STATUS_FLOW.findIndex((s) => s.value === ordem.status);

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header Actions */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Link href="/ordens" className="inline-flex items-center gap-1.5 text-sm text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]">
          <ArrowLeft className="w-4 h-4" />
          Ordens de Serviço
        </Link>
        <div className="flex items-center gap-2">
          {ordem.status !== 'entregue' ? (
            <Link
              href={`/ordens/${id}/editar`}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border border-[rgb(var(--input-border))] text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))] transition-colors"
            >
              <Pencil className="w-4 h-4" />
              Editar OS
            </Link>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border border-[rgb(var(--input-border))] text-[rgb(var(--muted-foreground))] opacity-50 cursor-not-allowed" title="OS entregue não pode ser editada">
              <Pencil className="w-4 h-4" />
              Entregue
            </span>
          )}
          {cliente && (
            <button
              onClick={handleWhatsApp}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-green-500 text-white hover:bg-green-600 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              WhatsApp
            </button>
          )}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border border-[rgb(var(--input-border))] text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))] transition-colors"
          >
            <Printer className="w-4 h-4" />
            Imprimir / PDF
          </button>
        </div>
      </div>

      {/* OS Header */}
      <div className={cn('rounded-2xl p-5 border', 'bg-[rgb(var(--card))] border-[rgb(var(--card-border))]')}>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono font-bold text-2xl text-[rgb(var(--foreground))]">{ordem.numero}</span>
              <span className={cn('px-3 py-1 rounded-full text-sm font-medium', getStatusColor(ordem.status))}>
                {getStatusLabel(ordem.status)}
              </span>
            </div>
            <p className="text-sm text-[rgb(var(--muted-foreground))]">
              Entrada: {formatDate(ordem.dataEntrada)}
              {ordem.dataConclusao && ` · Saída: ${formatDate(ordem.dataConclusao)}`}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-[rgb(var(--muted-foreground))]">Valor Total</p>
            <p className="text-3xl font-bold text-orange-500">{formatCurrency(ordem.valorTotal)}</p>
          </div>
        </div>

        {/* Status Stepper */}
        <div className="mt-5 flex items-center gap-1 overflow-x-auto pb-1">
          {STATUS_FLOW.map((s, i) => {
            const isPast = i <= statusIndex;
            const isCurrent = i === statusIndex;
            return (
              <button
                key={s.value}
                onClick={() => handleStatusChange(s.value)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex-shrink-0',
                  isCurrent
                    ? 'bg-orange-500 text-white shadow-sm'
                    : isPast
                    ? 'bg-orange-500/20 text-orange-500 hover:bg-orange-500/30'
                    : 'bg-[rgb(var(--muted))] text-[rgb(var(--muted-foreground))] hover:bg-[rgb(var(--card-border))]'
                )}
              >
                {isPast && !isCurrent && <CheckCircle className="w-3 h-3" />}
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Client & Vehicle */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cliente && (
          <div className={cn('rounded-2xl p-4 border', 'bg-[rgb(var(--card))] border-[rgb(var(--card-border))]')}>
            <div className="flex items-center gap-2 mb-3">
              <User className="w-4 h-4 text-orange-500" />
              <h3 className="font-semibold text-sm text-[rgb(var(--foreground))]">Cliente</h3>
            </div>
            <p className="font-medium text-[rgb(var(--foreground))]">{cliente.nome}</p>
            <p className="text-sm text-[rgb(var(--muted-foreground))] mt-0.5">{cliente.telefone}</p>
            {cliente.cpfCnpj && <p className="text-xs text-[rgb(var(--muted-foreground))] mt-0.5">{cliente.cpfCnpj}</p>}
            {(cliente as any).endereco && <p className="text-xs text-[rgb(var(--muted-foreground))] mt-0.5">📍 {(cliente as any).endereco}</p>}
          </div>
        )}
        {veiculo && (
          <div className={cn('rounded-2xl p-4 border', 'bg-[rgb(var(--card))] border-[rgb(var(--card-border))]')}>
            <div className="flex items-center gap-2 mb-3">
              <Car className="w-4 h-4 text-orange-500" />
              <h3 className="font-semibold text-sm text-[rgb(var(--foreground))]">Veículo</h3>
            </div>
            <p className="font-medium text-[rgb(var(--foreground))]">{veiculo.marca} {veiculo.modelo} {veiculo.ano}</p>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-sm text-[rgb(var(--muted-foreground))]">🪪 {veiculo.placa}</span>
              <span className="text-sm text-[rgb(var(--muted-foreground))]">{veiculo.cor}</span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-xs text-[rgb(var(--muted-foreground))]">
              <Gauge className="w-3 h-3" />
              {ordem.quilometragemAtual.toLocaleString('pt-BR')} km
            </div>
          </div>
        )}
      </div>

      {/* Problem */}
      <div className={cn('rounded-2xl p-5 border', 'bg-[rgb(var(--card))] border-[rgb(var(--card-border))]')}>
        <h3 className="font-semibold text-[rgb(var(--foreground))] mb-2">Problema Relatado</h3>
        <p className="text-sm text-[rgb(var(--muted-foreground))] leading-relaxed">{ordem.problemaRelatado}</p>
        {ordem.observacoesInternas && (
          <div className="mt-3 p-3 rounded-xl bg-[rgb(var(--muted))]">
            <p className="text-xs font-medium text-[rgb(var(--muted-foreground))] mb-1">🔒 Observação Interna</p>
            <p className="text-sm text-[rgb(var(--foreground))]">{ordem.observacoesInternas}</p>
          </div>
        )}
      </div>

      {/* Services */}
      {ordem.servicos.length > 0 && (
        <div className={cn('rounded-2xl p-5 border', 'bg-[rgb(var(--card))] border-[rgb(var(--card-border))]')}>
          <div className="flex items-center gap-2 mb-3">
            <Wrench className="w-4 h-4 text-orange-500" />
            <h3 className="font-semibold text-[rgb(var(--foreground))]">Serviços</h3>
          </div>
          <div className="space-y-2">
            {ordem.servicos.map((s) => (
              <div key={s.id} className="flex justify-between items-center py-2 border-b border-[rgb(var(--card-border))] last:border-0">
                <span className="text-sm text-[rgb(var(--foreground))]">{s.descricao}</span>
                <span className="text-sm font-medium text-[rgb(var(--foreground))]">{formatCurrency(s.valor)}</span>
              </div>
            ))}
            <div className="flex justify-between items-center pt-1">
              <span className="text-sm text-[rgb(var(--muted-foreground))]">Subtotal mão de obra</span>
              <span className="font-semibold text-[rgb(var(--foreground))]">{formatCurrency(ordem.valorMaoDeObra)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Parts */}
      {ordem.pecas.length > 0 && (
        <div className={cn('rounded-2xl p-5 border', 'bg-[rgb(var(--card))] border-[rgb(var(--card-border))]')}>
          <div className="flex items-center gap-2 mb-3">
            <Package className="w-4 h-4 text-orange-500" />
            <h3 className="font-semibold text-[rgb(var(--foreground))]">Peças</h3>
          </div>
          <div className="space-y-2">
            {ordem.pecas.map((p) => (
              <div key={p.id} className="flex justify-between items-center py-2 border-b border-[rgb(var(--card-border))] last:border-0">
                <div>
                  <span className="text-sm text-[rgb(var(--foreground))]">{p.nome}</span>
                  <span className="text-xs text-[rgb(var(--muted-foreground))] ml-2">x{p.quantidade} × {formatCurrency(p.valorUnitario)}</span>
                </div>
                <span className="text-sm font-medium text-[rgb(var(--foreground))]">{formatCurrency(p.valorTotal)}</span>
              </div>
            ))}
            <div className="flex justify-between items-center pt-1">
              <span className="text-sm text-[rgb(var(--muted-foreground))]">Subtotal peças</span>
              <span className="font-semibold text-[rgb(var(--foreground))]">{formatCurrency(ordem.valorPecas)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Total */}
      <div className={cn('rounded-2xl p-5 border', 'bg-[rgb(var(--card))] border-[rgb(var(--card-border))]')}>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-[rgb(var(--muted-foreground))]">Mão de obra</span>
            <span>{formatCurrency(ordem.valorMaoDeObra)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[rgb(var(--muted-foreground))]">Peças</span>
            <span>{formatCurrency(ordem.valorPecas)}</span>
          </div>
          <div className="h-px bg-[rgb(var(--card-border))]" />
          <div className="flex justify-between items-center">
            <span className="font-bold text-lg text-[rgb(var(--foreground))]">Total</span>
            <span className="text-2xl font-bold text-orange-500">{formatCurrency(ordem.valorTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
