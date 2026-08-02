'use client';

import React, { useState } from 'react';

interface ManualLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (lat: number, lng: number, address: string) => void;
}

export function ManualLocationModal({ isOpen, onClose, onSelectLocation }: ManualLocationModalProps) {
  const [address, setAddress] = useState('');
  const [cep, setCep] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address && !cep) return;
    // Ponto padrão manual de fallback
    onSelectLocation(-23.55052, -46.633308, address || cep);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <div className="glass-card w-full max-w-md p-6 rounded-2xl border border-white/10 space-y-4">
        <h3 className="text-xl font-bold text-white">Inserir Ponto de Partida Manual</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">CEP de Saída</label>
            <input
              type="text"
              placeholder="00000-000"
              value={cep}
              onChange={(e) => setCep(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Endereço Completo</label>
            <input
              type="text"
              placeholder="Rua, Número, Cidade"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg transition"
            >
              Confirmar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
