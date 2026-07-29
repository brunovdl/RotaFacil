'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ClockIcon, CheckIcon } from '@/components/ui/icons';
import type { RouteStop } from '@/lib/types';

interface SuspendStopModalProps {
  stop: RouteStop;
  onConfirm: (reason: string, notes: string, moveToEnd: boolean) => Promise<void>;
  onClose: () => void;
}

const PRESET_REASONS = [
  'Cliente ausente no local',
  'Cliente solicitou voltar mais tarde',
  'Endereço não localizado / Acesso restrito',
  'Outro motivo',
];

export function SuspendStopModal({ stop, onConfirm, onClose }: SuspendStopModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>(PRESET_REASONS[0]);
  const [customReason, setCustomReason] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [moveToEnd, setMoveToEnd] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = selectedReason === 'Outro motivo'
      ? (customReason.trim() || 'Outro motivo')
      : selectedReason;

    setLoading(true);
    try {
      await onConfirm(finalReason, notes.trim(), moveToEnd);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Erro ao adiar entrega');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div
        className="relative w-full max-w-md rounded-3xl p-6 shadow-2xl animate-fade-up z-10 space-y-5"
        style={{
          background: 'linear-gradient(135deg, rgba(22,22,42,0.95) 0%, rgba(30,30,56,0.98) 100%)',
          border: '1px solid rgba(245,158,11,0.3)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.6), 0 0 20px rgba(245,158,11,0.15)',
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{
              background: 'rgba(245,158,11,0.15)',
              border: '1px solid rgba(245,158,11,0.3)',
              color: '#F59E0B',
            }}
          >
            <ClockIcon size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Adiar / Suspender Entrega</h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {stop.street}, {stop.number} ({stop.neighborhood})
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Motivos pré-definidos */}
          <div className="space-y-2">
            <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
              Motivo do adiamento
            </label>
            <div className="space-y-2">
              {PRESET_REASONS.map((reason) => {
                const isSelected = selectedReason === reason;
                return (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => setSelectedReason(reason)}
                    className="w-full flex items-center justify-between p-3 rounded-xl text-xs font-medium transition-all press-effect text-left"
                    style={{
                      background: isSelected ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.04)',
                      border: isSelected ? '1px solid rgba(245,158,11,0.4)' : '1px solid rgba(255,255,255,0.08)',
                      color: isSelected ? '#FCD34D' : 'var(--text-primary)',
                    }}
                  >
                    <span>{reason}</span>
                    {isSelected && <CheckIcon size={14} className="text-amber-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Se escolheu "Outro motivo", mostra input customizado */}
          {selectedReason === 'Outro motivo' && (
            <Input
              label="Especifique o motivo"
              placeholder="Ex: Trânsito bloqueado / cliente em almoço"
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              required
            />
          )}

          {/* Observação Adicional */}
          <Input
            label="Observação (opcional)"
            placeholder="Ex: Voltar por volta das 16h"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          {/* Checkbox para mover para o final */}
          <label
            className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <input
              type="checkbox"
              checked={moveToEnd}
              onChange={(e) => setMoveToEnd(e.target.checked)}
              className="w-4 h-4 rounded accent-amber-500 cursor-pointer"
            />
            <div>
              <p className="text-xs font-semibold text-white">Mover para o final da rota</p>
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                Reordena a entrega para ser a última parada do dia
              </p>
            </div>
          </label>

          {/* Botões de Ação */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all press-effect text-black"
              style={{
                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                boxShadow: '0 4px 15px rgba(245,158,11,0.4)',
              }}
            >
              {loading ? 'Adiando...' : 'Confirmar Adiar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
