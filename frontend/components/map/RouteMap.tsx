'use client';

import React from 'react';

interface MapMarker {
  lat: number;
  lng: number;
  label?: string;
  order?: number;
}

interface RouteMapProps {
  startPoint?: { lat: number; lng: number };
  markers?: MapMarker[];
}

export function RouteMap({ startPoint, markers = [] }: RouteMapProps) {
  return (
    <div className="relative w-full h-64 bg-slate-950/80 rounded-2xl border border-white/10 overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#7C3AED_1px,transparent_1px)] [background-size:16px_16px]" />
      <div className="z-10 text-center space-y-2">
        <div className="inline-block px-3 py-1 bg-purple-600/30 border border-purple-500/40 text-purple-300 rounded-full text-xs font-semibold">
          🗺️ Mapa de Rota Otimizada
        </div>
        <p className="text-xs text-gray-400">
          {startPoint ? `Origem + ${markers.length} marcadores ordenados` : 'Carregando mapa...'}
        </p>
      </div>
    </div>
  );
}
