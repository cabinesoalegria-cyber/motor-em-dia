'use client';

import { useState, useMemo } from 'react';
import { useStore } from '@/lib/store';
import { Agendamento, Cliente, Veiculo } from '@/lib/types';
import { getStatusColor, getStatusLabel, cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Plus, X, Calendar, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function getWeekDates(baseDate: Date) {
  const d = new Date(baseDate);
  d.setDate(d.getDate() - d.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(d);
    day.setDate(d.getDate() + i);
    return day;
  });
}

// Modal de novo agendamento — fora do componente para evitar remount
function AgendamentoModal({
  onClose,
  defaultDate,
  clientes,
  veiculos,
  onSubmit,
}: {
  onClose: () => void;
  defaultDate: string;
  clientes: Cliente[];
  veiculos: Veiculo[];
  onSubmit: (data: {
    clienteId: string; veiculoId: string; servico: string;
    data: string; hora: string; observacoes: string;
  }) => void;
}) {
  const [formClienteId, setFormClienteId] = useState('');
  const [formVeiculoId, setFormVeiculoId] = useState('');
  const [formServico, setFormServico] = useState('');
  const [formData, setFormData] = useState(defaultDate);
  const [formHora, setFormHora] = useState('09:00');
  const [formObs, setFormObs] = useState('');

  const clienteVeiculos = veiculos.filter((v) => v.clienteId === formClienteId);

  const inputCn = cn(
    'w-full px-3 py-2.5 rounded-xl text-sm border',
    'bg-[rgb(var(--input-bg))] border-[rgb(var(--input-border))]',
    'text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))]',
    'focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500'
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formClienteId || !formVeiculoId || !formServico) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }
    onSubmit({ clienteId: formClienteId, veiculoId: formVeiculoId, servico: formServico, data: formData, hora: formHora, observacoes: formObs });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={cn(
        'relative w-full max-w-md rounded-2xl',
        'bg-[rgb(var(--card))] border border-[rgb(var(--card-border))] shadow-2xl',
        'max-h-[90vh] overflow-y-auto'
      )}>
        <div className="flex items-center justify-between p-5 border-b border-[rgb(var(--card-border))] sticky top-0 bg-[rgb(var(--card))]">
          <h2 className="text-base font-semibold text-[rgb(var(--foreground))]">Novo Agendamento</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[rgb(var(--muted))] text-[rgb(var(--muted-foreground))]">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-[rgb(var(--foreground))]">Cliente *</label>
            <select
              value={formClienteId}
              onChange={(e) => { setFormClienteId(e.target.value); setFormVeiculoId(''); }}
              className={inputCn}
              autoFocus
            >
              <option value="">Selecione</option>
              {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-[rgb(var(--foreground))]">Veículo *</label>
            <select
              value={formVeiculoId}
              onChange={(e) => setFormVeiculoId(e.target.value)}
              disabled={!formClienteId}
              className={cn(inputCn, 'disabled:opacity-50')}
            >
              <option value="">Selecione</option>
              {clienteVeiculos.map((v) => (
                <option key={v.id} value={v.id}>{v.marca} {v.modelo} — {v.placa}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-[rgb(var(--foreground))]">Serviço *</label>
            <input
              type="text"
              value={formServico}
              onChange={(e) => setFormServico(e.target.value)}
              className={inputCn}
              placeholder="Revisão, troca de óleo..."
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-[rgb(var(--foreground))]">Data</label>
              <input type="date" value={formData} onChange={(e) => setFormData(e.target.value)} className={inputCn} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-[rgb(var(--foreground))]">Hora</label>
              <input type="time" value={formHora} onChange={(e) => setFormHora(e.target.value)} className={inputCn} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-[rgb(var(--foreground))]">Observações</label>
            <input
              type="text"
              value={formObs}
              onChange={(e) => setFormObs(e.target.value)}
              className={inputCn}
              placeholder="Opcional..."
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm border border-[rgb(var(--input-border))] text-[rgb(var(--foreground))] hover:bg-[rgb(var(--muted))] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-orange-500 text-white hover:bg-orange-600 transition-colors"
            >
              Agendar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AgendaPage() {
  const { agendamentos, clientes, veiculos, addAgendamento, updateAgendamento } = useStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showModal, setShowModal] = useState(false);

  const weekDates = useMemo(() => getWeekDates(currentDate), [currentDate]);

  const agendamentosComDetalhes = useMemo(() =>
    agendamentos.map((a) => ({
      ...a,
      cliente: clientes.find((c) => c.id === a.clienteId),
      veiculo: veiculos.find((v) => v.id === a.veiculoId),
    })),
    [agendamentos, clientes, veiculos]
  );

  const selectedDateAgendamentos = useMemo(() =>
    agendamentosComDetalhes
      .filter((a) => a.data === selectedDate && a.status !== 'cancelado')
      .sort((a, b) => a.hora.localeCompare(b.hora)),
    [agendamentosComDetalhes, selectedDate]
  );

  const weekCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    agendamentos.forEach((a) => {
      if (a.status !== 'cancelado') {
        map[a.data] = (map[a.data] || 0) + 1;
      }
    });
    return map;
  }, [agendamentos]);

  function prevWeek() {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 7);
    setCurrentDate(d);
  }

  function nextWeek() {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 7);
    setCurrentDate(d);
  }

  function handleAddAgendamento(data: {
    clienteId: string; veiculoId: string; servico: string;
    data: string; hora: string; observacoes: string;
  }) {
    const id = addAgendamento({ ...data, status: 'agendado' });
    toast.success('Agendamento criado!');
    setShowModal(false);

    // Perguntar sobre confirmacão via WhatsApp
    const cliente = clientes.find(c => c.id === data.clienteId);
    const veiculo = veiculos.find(v => v.id === data.veiculoId);
    const officeName = localStorage.getItem('autoflow-office-name') || 'Sua Oficina';
    if (cliente) {
      const dataFormatada = new Date(data.data + 'T12:00:00').toLocaleDateString('pt-BR', {
        weekday: 'long', day: 'numeric', month: 'long'
      });
      const msg = [
        `Ola ${cliente.nome}!`,
        ``,
        `Seu agendamento foi confirmado:`,
        ``,
        `Data: *${dataFormatada}* as *${data.hora}*`,
        `Servico: *${data.servico}*`,
        veiculo ? `Veiculo: ${veiculo.marca} ${veiculo.modelo} (${veiculo.placa})` : '',
        ``,
        `Por favor, confirme sua presenca respondendo *SIM* para confirmar ou *NAO* para cancelar.`,
        ``,
        `_${officeName}_`,
      ].filter(l => l !== null).join('\n');
      const waLink = `https://wa.me/55${cliente.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
      window.open(waLink, '_blank');
    }
  }

  function handleStatus(id: string, status: Agendamento['status']) {
    updateAgendamento(id, { status });
    toast.success(`Status: ${getStatusLabel(status)}`);
  }

  function handleWhatsAppConfirm(a: typeof agendamentosComDetalhes[0]) {
    if (!a.cliente) return;
    const officeName = localStorage.getItem('autoflow-office-name') || 'Sua Oficina';
    const dataFormatada = new Date(a.data + 'T12:00:00').toLocaleDateString('pt-BR', {
      weekday: 'long', day: 'numeric', month: 'long'
    });
    const msg = [
      `Ola ${a.cliente.nome}!`,
      ``,
      `Lembrando do seu agendamento:`,
      ``,
      `Data: *${dataFormatada}* as *${a.hora}*`,
      `Servico: *${a.servico}*`,
      a.veiculo ? `Veiculo: ${a.veiculo.marca} ${a.veiculo.modelo} (${a.veiculo.placa})` : '',
      ``,
      `Confirme sua presenca respondendo *SIM* para confirmar ou *NAO* para cancelar.`,
      ``,
      `_${officeName}_`,
    ].filter(l => l !== null).join('\n');
    const waLink = `https://wa.me/55${a.cliente.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
    window.open(waLink, '_blank');
  }

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Week Navigator */}
      <div className={cn('rounded-2xl p-4 border', 'bg-[rgb(var(--card))] border-[rgb(var(--card-border))]')}>
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevWeek} className="p-2 rounded-lg hover:bg-[rgb(var(--muted))] transition-colors text-[rgb(var(--muted-foreground))]">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h3 className="font-semibold text-[rgb(var(--foreground))] text-sm">
            {weekDates[0].toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </h3>
          <button onClick={nextWeek} className="p-2 rounded-lg hover:bg-[rgb(var(--muted))] transition-colors text-[rgb(var(--muted-foreground))]">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {weekDates.map((d, i) => {
            const dateStr = d.toISOString().split('T')[0];
            const isToday = dateStr === today;
            const isSelected = dateStr === selectedDate;
            const count = weekCountMap[dateStr] || 0;

            return (
              <button
                key={i}
                onClick={() => setSelectedDate(dateStr)}
                className={cn(
                  'flex flex-col items-center p-2 rounded-xl transition-all',
                  isSelected
                    ? 'bg-orange-500 text-white shadow-md'
                    : isToday
                    ? 'bg-orange-500/10 text-orange-500'
                    : 'hover:bg-[rgb(var(--muted))] text-[rgb(var(--foreground))]'
                )}
              >
                <span className="text-xs font-medium opacity-70">{DIAS_SEMANA[d.getDay()]}</span>
                <span className="text-base font-bold mt-0.5">{d.getDate()}</span>
                {count > 0 && (
                  <span className={cn(
                    'mt-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center',
                    isSelected ? 'bg-white/30 text-white' : 'bg-orange-500 text-white'
                  )}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Day Appointments */}
      <div className={cn('rounded-2xl p-5 border', 'bg-[rgb(var(--card))] border-[rgb(var(--card-border))]')}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-[rgb(var(--foreground))]">
              {new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </h3>
            <p className="text-xs text-[rgb(var(--muted-foreground))] mt-0.5">
              {selectedDateAgendamentos.length} agendamento{selectedDateAgendamentos.length !== 1 ? 's' : ''}
            </p>
          </div>
          {/* ✅ FIX: Botão que abre modal diretamente (não navega para /agenda/nova) */}
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-orange-500 text-white hover:bg-orange-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Agendar
          </button>
        </div>

        {selectedDateAgendamentos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Calendar className="w-8 h-8 text-[rgb(var(--muted-foreground))] mb-2" />
            <p className="text-sm text-[rgb(var(--muted-foreground))]">Nenhum agendamento neste dia</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-2 text-xs text-orange-500 hover:underline"
            >
              Agendar serviço
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {selectedDateAgendamentos.map((a) => (
              <div key={a.id} className="flex items-start gap-4 p-4 rounded-xl bg-[rgb(var(--muted))]">
                <div className="text-center flex-shrink-0 w-14">
                  <p className="text-xl font-bold text-orange-500">{a.hora}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-[rgb(var(--foreground))]">{a.cliente?.nome ?? '—'}</p>
                    <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', getStatusColor(a.status))}>
                      {getStatusLabel(a.status)}
                    </span>
                  </div>
                  <p className="text-sm text-[rgb(var(--muted-foreground))] mt-0.5">{a.servico}</p>
                  {a.veiculo && (
                    <p className="text-xs text-[rgb(var(--muted-foreground))] mt-0.5">
                      🚗 {a.veiculo.marca} {a.veiculo.modelo} · {a.veiculo.placa}
                    </p>
                  )}
                  {a.observacoes && (
                    <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1 italic">{a.observacoes}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {/* WhatsApp confirmation button */}
                  <button
                    onClick={() => handleWhatsAppConfirm(a)}
                    className="p-1.5 rounded-lg text-[rgb(var(--muted-foreground))] hover:text-green-500 hover:bg-green-500/10 transition-colors"
                    title="Enviar confirmação WhatsApp"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                  {a.status === 'agendado' && (
                    <button
                      onClick={() => handleStatus(a.id, 'confirmado')}
                      className="p-1.5 rounded-lg text-[rgb(var(--muted-foreground))] hover:text-green-500 hover:bg-green-500/10 transition-colors"
                      title="Confirmar"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                  {a.status !== 'cancelado' && a.status !== 'concluido' && (
                    <button
                      onClick={() => handleStatus(a.id, 'cancelado')}
                      className="p-1.5 rounded-lg text-[rgb(var(--muted-foreground))] hover:text-red-500 hover:bg-red-500/10 transition-colors"
                      title="Cancelar"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal — centralizado na tela */}
      {showModal && (
        <AgendamentoModal
          onClose={() => setShowModal(false)}
          defaultDate={selectedDate}
          clientes={clientes}
          veiculos={veiculos}
          onSubmit={handleAddAgendamento}
        />
      )}
    </div>
  );
}
