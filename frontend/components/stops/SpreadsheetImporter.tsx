'use client';

import React, { useState } from 'react';

interface SpreadsheetImporterProps {
  onImportStops: (stops: Array<{ cep: string; street: string; number: string }>) => void;
}

export function SpreadsheetImporter({ onImportStops }: SpreadsheetImporterProps) {
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    // Simula leitura de XLSX/CSV com paginação
    setTimeout(() => {
      const mockStops = [
        { cep: '01310-100', street: 'Av Paulista', number: '100' },
        { cep: '04501-000', street: 'Av Republica do Libano', number: '500' },
      ];
      onImportStops(mockStops);
      setLoading(false);
    }, 500);
  };

  return (
    <div className="glass-card p-4 rounded-2xl border border-white/10 text-center">
      <h4 className="font-semibold text-white text-base mb-1">Importar Planilha (.xlsx / .csv)</h4>
      <p className="text-xs text-gray-400 mb-3">Carregue entregas em lote com paginação mobile de 10 em 10</p>
      <label className="inline-block px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-semibold rounded-xl cursor-pointer hover:opacity-90 transition">
        {loading ? 'Processando...' : 'Selecionar Arquivo'}
        <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} className="hidden" />
      </label>
    </div>
  );
}
