'use client';

import { useState, useMemo, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { buildWhatsAppLink, cn } from '@/lib/utils';
import { MessageSquare, Send, Copy, ExternalLink, CheckCircle, Zap, Car, Save, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';

// Templates padrao do sistema — sem emojis para compatibilidade
const DEFAULT_TEMPLATES = [
  { id: 'revisao',      label: 'Lembrete de Revisao' },
  { id: 'ospronta',    label: 'OS Pronta para Retirada' },
  { id: 'agendamento', label: 'Confirmacao de Agendamento' },
  { id: 'oleo',        label: 'Troca de Oleo' },
  { id: 'cobranca',    label: 'Lembrete de Pagamento' },
];

function gerarTemplate(
  templateId: string,
  nome: string,
  veiculo: string,
  osNumero: string,
  valor: string,
  officeName: string
): string {
  const assinatura = `_${officeName}_`;
  switch (templateId) {
    case 'revisao':
      return [
        `Ola ${nome}!`,
        ``,
        `Seu *${veiculo}* esta proximo da proxima revisao.`,
        ``,
        `Agende agora e mantenha seu carro sempre em dia!`,
        ``,
        assinatura,
      ].join('\n');
    case 'ospronta':
      return [
        `Olá *${nome}*! ✅`,
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
    case 'agendamento':
      return [
        `Ola ${nome}!`,
        ``,
        `Confirmando seu agendamento:`,
        ``,
        `*Servico:* Revisao preventiva`,
        `*Veiculo:* ${veiculo}`,
        ``,
        `Responda *SIM* para confirmar ou *NAO* para cancelar.`,
        ``,
        assinatura,
      ].join('\n');
    case 'oleo':
      return [
        `Ola ${nome}!`,
        ``,
        `Seu *${veiculo}* esta proximo do prazo de *troca de oleo*.`,
        ``,
        `A troca regular protege o motor e evita problemas maiores.`,
        ``,
        `Agende ja!`,
        ``,
        assinatura,
      ].join('\n');
    case 'cobranca':
      return [
        `Ola ${nome}!`,
        ``,
        `Lembramos que existe um valor de *${valor}* em aberto em nossa oficina.`,
        ``,
        `Qualquer duvida, entre em contato.`,
        ``,
        assinatura,
      ].join('\n');
    default:
      return '';
  }
}

const CUSTOM_TEMPLATES_KEY = 'autoflow-whatsapp-templates';

interface SavedTemplate {
  id: string;
  label: string;
  mensagem: string;
}

export default function WhatsAppPage() {
  const { clientes, veiculos, ordens } = useStore();
  const [selectedTemplateId, setSelectedTemplateId] = useState('revisao');
  const [clienteId, setClienteId] = useState('');
  const [veiculoId, setVeiculoId] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [copied, setCopied] = useState(false);

  // Custom templates
  const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>([]);
  const [novoTemplateLabel, setNovoTemplateLabel] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const officeName = typeof window !== 'undefined'
    ? (localStorage.getItem('autoflow-office-name') || 'Sua Oficina')
    : 'Sua Oficina';

  useEffect(() => {
    const saved = localStorage.getItem(CUSTOM_TEMPLATES_KEY);
    if (saved) setSavedTemplates(JSON.parse(saved));
  }, []);

  const allTemplates = useMemo(() => [
    ...DEFAULT_TEMPLATES,
    ...savedTemplates.map(t => ({ id: `custom-${t.id}`, label: `💬 ${t.label}` })),
  ], [savedTemplates]);

  const cliente = clientes.find((c) => c.id === clienteId);
  const clienteVeiculos = veiculos.filter((v) => v.clienteId === clienteId);
  const veiculo = veiculos.find(v => v.id === veiculoId);
  const clienteOS = ordens.filter((o) => o.clienteId === clienteId);
  const ultimaOS = clienteOS[clienteOS.length - 1];

  function gerarMensagem() {
    if (!cliente) { toast.error('Selecione um cliente'); return; }
    const nomeVeiculo = veiculo ? `${veiculo.marca} ${veiculo.modelo} (${veiculo.placa})` : clienteVeiculos.length > 0 ? `${clienteVeiculos[0].marca} ${clienteVeiculos[0].modelo}` : 'veículo';
    const osNumero = ultimaOS?.numero || 'OS';
    const valor = ultimaOS ? `R$ ${ultimaOS.valorTotal.toFixed(2).replace('.', ',')}` : 'pendente';

    // Check if it's a custom template — replace placeholders with current client data
    if (selectedTemplateId.startsWith('custom-')) {
      const customId = selectedTemplateId.replace('custom-', '');
      const custom = savedTemplates.find(t => t.id === customId);
      if (custom) {
        const msg = custom.mensagem
          .replace(/\{nome\}/g, cliente.nome)
          .replace(/\{veiculo\}/g, nomeVeiculo)
          .replace(/\{placa\}/g, veiculo?.placa || '')
          .replace(/\{os\}/g, osNumero)
          .replace(/\{valor\}/g, valor)
          .replace(/\{oficina\}/g, officeName);
        setMensagem(msg);
        return;
      }
    }

    const msg = gerarTemplate(selectedTemplateId, cliente.nome, nomeVeiculo, osNumero, valor, officeName);
    setMensagem(msg);
  }

  function handleSaveTemplate() {
    if (!mensagem || !novoTemplateLabel) { toast.error('Escreva um nome para o template'); return; }

    // Convert actual values back to placeholders for reuse across clients
    let templateMsg = mensagem;
    if (cliente) {
      // Escape special regex chars in the name
      const escapedNome = cliente.nome.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      templateMsg = templateMsg.replace(new RegExp(escapedNome, 'g'), '{nome}');
    }
    if (veiculo) {
      const veiculoStr = `${veiculo.marca} ${veiculo.modelo} (${veiculo.placa})`;
      const escapedVeiculo = veiculoStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      templateMsg = templateMsg.replace(new RegExp(escapedVeiculo, 'g'), '{veiculo}');
      const escapedPlaca = veiculo.placa.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      templateMsg = templateMsg.replace(new RegExp(escapedPlaca, 'g'), '{placa}');
    }
    if (ultimaOS) {
      const escapedOS = ultimaOS.numero.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      templateMsg = templateMsg.replace(new RegExp(escapedOS, 'g'), '{os}');
    }

    const newTemplate: SavedTemplate = {
      id: String(Date.now()),
      label: novoTemplateLabel,
      mensagem: templateMsg,
    };
    const updated = [...savedTemplates, newTemplate];
    setSavedTemplates(updated);
    localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(updated));
    toast.success('Template salvo! Variaveis: {nome} {veiculo} {placa} {os} {oficina}');
    setNovoTemplateLabel('');
    setShowSaveDialog(false);
  }

  function handleDeleteTemplate(id: string) {
    const updated = savedTemplates.filter(t => t.id !== id);
    setSavedTemplates(updated);
    localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(updated));
    toast.success('Template excluído');
  }

  function handleCopy() {
    if (!mensagem) { toast.error('Gere uma mensagem primeiro'); return; }
    navigator.clipboard.writeText(mensagem);
    setCopied(true);
    toast.success('Mensagem copiada!');
    setTimeout(() => setCopied(false), 2000);
  }

  function handleSend() {
    if (!cliente || !mensagem) { toast.error('Gere uma mensagem primeiro'); return; }
    const link = buildWhatsAppLink(cliente.whatsapp, mensagem);
    window.open(link, '_blank');
  }

  const inputCn = cn(
    'w-full px-3 py-2.5 rounded-xl text-sm border',
    'bg-[rgb(var(--input-bg))] border-[rgb(var(--input-border))]',
    'text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))]',
    'focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500'
  );

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className={cn('rounded-2xl p-5 border bg-gradient-to-r from-green-600/10 to-green-500/5', 'border-green-500/20')}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-[rgb(var(--foreground))]">WhatsApp — {officeName}</h2>
            <p className="text-xs text-[rgb(var(--muted-foreground))]">Envie mensagens prontas para seus clientes em segundos</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Templates + Cliente */}
        <div className="space-y-4">
          {/* Templates */}
          <div className={cn('rounded-2xl p-5 border', 'bg-[rgb(var(--card))] border-[rgb(var(--card-border))]')}>
            <h3 className="font-semibold text-[rgb(var(--foreground))] mb-3">Template</h3>
            <div className="space-y-1.5">
              {allTemplates.map((t) => (
                <div key={t.id} className="flex items-center gap-2">
                  <button
                    onClick={() => { setSelectedTemplateId(t.id); setMensagem(''); }}
                    className={cn(
                      'flex-1 text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
                      selectedTemplateId === t.id
                        ? 'bg-green-500 text-white shadow-sm'
                        : 'bg-[rgb(var(--muted))] text-[rgb(var(--foreground))] hover:bg-[rgb(var(--card-border))]'
                    )}
                  >
                    {t.label}
                  </button>
                  {t.id.startsWith('custom-') && (
                    <button
                      onClick={() => handleDeleteTemplate(t.id.replace('custom-', ''))}
                      className="p-1.5 text-[rgb(var(--muted-foreground))] hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Cliente + Veículo */}
          <div className={cn('rounded-2xl p-5 border', 'bg-[rgb(var(--card))] border-[rgb(var(--card-border))]')}>
            <h3 className="font-semibold text-[rgb(var(--foreground))] mb-3">Cliente e Veículo</h3>
            <div className="space-y-3">
              <select
                value={clienteId}
                onChange={(e) => { setClienteId(e.target.value); setVeiculoId(''); setMensagem(''); }}
                className={inputCn}
              >
                <option value="">Selecione o cliente...</option>
                {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome} — {c.whatsapp}</option>)}
              </select>

              {/* Veículo selector - only when client has multiple vehicles */}
              {clienteId && (
                <div>
                  <select
                    value={veiculoId}
                    onChange={(e) => { setVeiculoId(e.target.value); setMensagem(''); }}
                    className={inputCn}
                  >
                    <option value="">
                      {clienteVeiculos.length === 0
                        ? 'Nenhum veículo cadastrado'
                        : clienteVeiculos.length === 1
                        ? `${clienteVeiculos[0].marca} ${clienteVeiculos[0].modelo} — ${clienteVeiculos[0].placa}`
                        : 'Selecione o veículo...'}
                    </option>
                    {clienteVeiculos.length > 1 && clienteVeiculos.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.marca} {v.modelo} — {v.placa}
                      </option>
                    ))}
                  </select>

                  {cliente && (
                    <div className="mt-2 p-3 rounded-xl bg-[rgb(var(--muted))]">
                      <p className="text-sm font-medium text-[rgb(var(--foreground))]">👤 {cliente.nome}</p>
                      <p className="text-xs text-[rgb(var(--muted-foreground))] mt-0.5">📱 {cliente.whatsapp}</p>
                      {veiculo && (
                        <p className="text-xs text-[rgb(var(--muted-foreground))] mt-0.5">
                          🚗 {veiculo.marca} {veiculo.modelo} — <strong>{veiculo.placa}</strong>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={gerarMensagem}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium bg-orange-500 text-white hover:bg-orange-600 transition-colors"
              >
                <Zap className="w-4 h-4" />
                Gerar Mensagem
              </button>
            </div>
          </div>
        </div>

        {/* Right: Preview */}
        <div className={cn('rounded-2xl p-5 border', 'bg-[rgb(var(--card))] border-[rgb(var(--card-border))]')}>
          <h3 className="font-semibold text-[rgb(var(--foreground))] mb-3">Prévia da Mensagem</h3>

          {mensagem ? (
            <>
              {/* WhatsApp bubble */}
              <div className="bg-[#128C7E] p-4 rounded-2xl mb-4">
                <div className="bg-[#DCF8C6] rounded-xl p-3 max-w-xs ml-auto shadow-sm">
                  <p className="text-sm text-[#1a1a1a] whitespace-pre-line leading-relaxed">
                    {mensagem.replace(/\*/g, '')}
                  </p>
                  <p className="text-right text-xs text-[#888] mt-1">agora ✓✓</p>
                </div>
              </div>

              <textarea
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                className={cn(inputCn, 'resize-none h-36')}
                placeholder="Edite a mensagem se necessário..."
              />

              <div className="flex gap-3 mt-3">
                <button
                  onClick={handleCopy}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border transition-all',
                    copied ? 'bg-green-500 text-white border-transparent' : 'border-[rgb(var(--input-border))] text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))]'
                  )}
                >
                  {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copiado!' : 'Copiar'}
                </button>
                <button
                  onClick={handleSend}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium bg-green-500 text-white hover:bg-green-600 transition-colors"
                >
                  <Send className="w-4 h-4" />
                  Abrir WhatsApp
                </button>
              </div>

              {/* Save as template */}
              <div className="mt-3 pt-3 border-t border-[rgb(var(--card-border))]">
                {showSaveDialog ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={novoTemplateLabel}
                      onChange={e => setNovoTemplateLabel(e.target.value)}
                      placeholder="Nome do template..."
                      className={cn(inputCn, 'flex-1')}
                      autoFocus
                    />
                    <button onClick={handleSaveTemplate} className="p-2.5 rounded-xl bg-green-500 text-white hover:bg-green-600">
                      <Save className="w-4 h-4" />
                    </button>
                    <button onClick={() => setShowSaveDialog(false)} className="p-2.5 rounded-xl bg-[rgb(var(--muted))] text-[rgb(var(--foreground))]">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowSaveDialog(true)}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs text-[rgb(var(--muted-foreground))] hover:bg-[rgb(var(--muted))] transition-colors border border-dashed border-[rgb(var(--input-border))]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Salvar como template
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mb-3">
                <MessageSquare className="w-6 h-6 text-green-500" />
              </div>
              <p className="text-sm text-[rgb(var(--muted-foreground))]">Selecione um template e um cliente,</p>
              <p className="text-sm text-[rgb(var(--muted-foreground))]">depois clique em <strong>Gerar Mensagem</strong></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
