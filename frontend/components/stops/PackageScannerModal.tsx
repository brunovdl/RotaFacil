'use client';

import React from 'react';

interface PackageScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanCep: (cep: string) => void;
}

export function PackageScannerModal({ isOpen, onClose, onScanCep }: PackageScannerModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="glass-card w-full max-w-sm p-6 rounded-2xl border border-white/10 text-center space-y-4">
        <h3 className="text-lg font-bold text-white">Escanear Etiqueta com Câmera</h3>
        <div className="w-full h-48 bg-black/40 border-2 border-dashed border-purple-500/50 rounded-xl flex items-center justify-center text-xs text-gray-400">
          Câmera ativa (Aponte para o CEP no pacote)
        </div>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-white/10 text-white rounded-xl text-xs font-semibold"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              onScanCep('01310100');
              onClose();
            }}
            className="flex-1 py-2.5 bg-purple-600 text-white rounded-xl text-xs font-semibold"
          >
            Simular Leitura
          </button>
        </div>
      </div>
    </div>
  );
}
