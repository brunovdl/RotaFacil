'use client';

import React, { useState } from 'react';

interface StopFormProps {
  onAddStop: (stop: { cep: string; street: string; number: string; city: string; state: string }) => void;
}

export function StopForm({ onAddStop }: StopFormProps) {
  const [cep, setCep] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCepBlur = async () => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;

    setLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setStreet(data.logradouro || '');
        setCity(data.localidade || '');
        setState(data.uf || '');
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!street || !number) return;
    onAddStop({ cep, street, number, city, state });
    setCep('');
    setStreet('');
    setNumber('');
    setCity('');
    setState('');
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card p-4 rounded-2xl border border-white/10 space-y-3">
      <h4 className="font-semibold text-white text-base">Adicionar Parada Manual</h4>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-gray-400">CEP</label>
          <input
            type="text"
            placeholder="00000-000"
            value={cep}
            onChange={(e) => setCep(e.target.value)}
            onBlur={handleCepBlur}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400">Número</label>
          <input
            type="text"
            placeholder="123"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>
      <div>
        <label className="text-xs text-gray-400">Rua / Logradouro</label>
        <input
          type="text"
          placeholder="Ex: Av. Paulista"
          value={street}
          onChange={(e) => setStreet(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-semibold press-effect transition"
      >
        {loading ? 'Buscando...' : '+ Adicionar à Rota'}
      </button>
    </form>
  );
}
