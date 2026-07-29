'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PackageScanner } from '@/components/ui/package-scanner';
import { SpinnerIcon, CheckIcon, MapPinIcon } from '@/components/ui/icons';
import { formatCep, onlyNumbers } from '@/lib/utils';
import { api } from '@/lib/api';

export interface AddressForm {
  cep: string;
  number: string;
  complement: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
}

const EMPTY_ADDRESS: AddressForm = {
  cep: '',
  number: '',
  complement: '',
  street: '',
  neighborhood: '',
  city: '',
  state: '',
  lat: 0,
  lng: 0,
};

interface AddAddressModalProps {
  onAddStop: (stop: AddressForm) => Promise<void>;
  onClose: () => void;
  addedCount?: number;
}

export function AddAddressModal({ onAddStop, onClose, addedCount = 0 }: AddAddressModalProps) {
  const [address, setAddress] = useState<AddressForm>(EMPTY_ADDRESS);
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState('');
  const [addingLoading, setAddingLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  // Lookup CEP
  const lookupCep = async (cepToLookup?: string) => {
    const clean = cepToLookup || onlyNumbers(address.cep);
    if (clean.length !== 8) {
      setCepError('CEP deve ter 8 dígitos');
      return;
    }
    setCepLoading(true);
    setCepError('');
    try {
      const result = await api.cep.lookup(clean);
      setAddress((prev) => ({
        ...prev,
        street: result.street,
        neighborhood: result.neighborhood,
        city: result.city,
        state: result.state,
      }));
    } catch (err: any) {
      setCepError(err.message || 'CEP não encontrado');
    } finally {
      setCepLoading(false);
    }
  };

  const handleScanResult = (data: { cep: string; number: string }) => {
    setShowScanner(false);
    if (data.cep) {
      setAddress((prev) => ({ ...prev, cep: data.cep }));
      setTimeout(() => lookupCep(data.cep), 400);
    }
    if (data.number) setAddress((prev) => ({ ...prev, number: data.number }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.cep || !address.number) {
      setCepError('Preencha CEP e número');
      return;
    }
    if (onlyNumbers(address.cep).length !== 8) {
      setCepError('CEP deve ter 8 dígitos');
      return;
    }

    setAddingLoading(true);
    try {
      await onAddStop(address);
      setSuccessToast(`✓ Endereço de ${address.street || 'entrega'}, nº ${address.number} adicionado!`);
      setAddress(EMPTY_ADDRESS);
      setCepError('');

      setTimeout(() => setSuccessToast(''), 3000);
    } catch (err: any) {
      setCepError(err.message || 'Erro ao adicionar parada');
    } finally {
      setAddingLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-md rounded-3xl p-5 space-y-4 max-h-[90vh] flex flex-col relative overflow-hidden"
        style={{
          background: 'rgba(22, 22, 42, 0.96)',
          border: '1px solid rgba(124, 58, 237, 0.3)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.7)',
        }}
      >
        {/* Header do Modal */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(124,58,237,0.2)', color: '#A78BFA' }}
            >
              <MapPinIcon size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                Adicionar Endereço
              </h2>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Preencha os dados ou escaneie o pacote
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl press-effect text-xs text-muted hover:text-white"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          >
            ✕
          </button>
        </div>

        {/* Success Toast */}
        {successToast && (
          <div
            className="px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in"
            style={{
              background: 'rgba(16,217,160,0.15)',
              border: '1px solid rgba(16,217,160,0.3)',
              color: '#10D9A0',
            }}
          >
            <CheckIcon size={16} />
            {successToast}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-3 overflow-y-auto pr-1 flex-1">
          <div className="flex gap-2 items-start">
            <div className="flex-1">
              <Input
                label="CEP *"
                placeholder="00000-000"
                value={formatCep(address.cep)}
                onChange={(e) => {
                  const clean = onlyNumbers(e.target.value).slice(0, 8);
                  setAddress((prev) => ({ ...prev, cep: clean }));
                  setCepError('');
                  if (clean.length === 8) setTimeout(() => lookupCep(clean), 300);
                }}
                maxLength={9}
                error={cepError}
              />
            </div>
            <div className="w-24">
              <Input
                label="Número *"
                placeholder="123"
                value={address.number}
                onChange={(e) => setAddress((prev) => ({ ...prev, number: e.target.value }))}
              />
            </div>
            {/* Package Scanner Button */}
            <div className="w-10 pt-6">
              <button
                type="button"
                onClick={() => setShowScanner(true)}
                className="w-9 h-9 rounded-xl flex items-center justify-center press-effect mt-0.5"
                style={{
                  background: 'rgba(124,58,237,0.18)',
                  border: '1px solid rgba(124,58,237,0.35)',
                  color: '#A78BFA',
                }}
                title="Escanear etiqueta do pacote"
              >
                📷
              </button>
            </div>
          </div>

          {cepLoading && (
            <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
              <SpinnerIcon size={14} className="text-brand-500" />
              Buscando CEP no ViaCEP / Correios…
            </div>
          )}

          <Input
            label="Rua / Logradouro"
            placeholder="Nome da rua"
            value={address.street}
            onChange={(e) => setAddress((prev) => ({ ...prev, street: e.target.value }))}
          />

          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                label="Bairro"
                placeholder="Bairro"
                value={address.neighborhood}
                onChange={(e) => setAddress((prev) => ({ ...prev, neighborhood: e.target.value }))}
              />
            </div>
            <div className="w-28">
              <Input
                label="Complemento"
                placeholder="Apto/Bloco"
                value={address.complement}
                onChange={(e) => setAddress((prev) => ({ ...prev, complement: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                label="Cidade"
                placeholder="Cidade"
                value={address.city}
                onChange={(e) => setAddress((prev) => ({ ...prev, city: e.target.value }))}
              />
            </div>
            <div className="w-20">
              <Input
                label="UF"
                placeholder="SP"
                maxLength={2}
                value={address.state}
                onChange={(e) => setAddress((prev) => ({ ...prev, state: e.target.value.toUpperCase() }))}
              />
            </div>
          </div>

          {/* Buttons Footer */}
          <div className="pt-2 space-y-2 flex-shrink-0">
            <Button
              type="submit"
              size="lg"
              className="w-full"
              loading={addingLoading}
              disabled={!address.cep || !address.number || addingLoading}
            >
              <CheckIcon className="mr-2" size={18} />
              Adicionar à rota
            </Button>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-xl text-xs font-semibold press-effect"
              style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}
            >
              Concluir e voltar à lista ({addedCount} paradas)
            </button>
          </div>
        </form>

        {showScanner && (
          <PackageScanner onScan={handleScanResult} onClose={() => setShowScanner(false)} />
        )}
      </div>
    </div>
  );
}
