'use client';

import React from 'react';
import { getGoogleMapsDeeplink, getWazeDeeplink } from '@/lib/utils/deeplinks';

interface Stop {
  id: string;
  sequence: number;
  street: string;
  number: string;
  neighborhood?: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  status: 'pending' | 'completed' | 'failed';
}

interface StopItemCardProps {
  stop: Stop;
  onToggleComplete: (id: string) => void;
}

export function StopItemCard({ stop, onToggleComplete }: StopItemCardProps) {
  const isCompleted = stop.status === 'completed';

  return (
    <div className={`p-4 rounded-2xl border transition-all ${isCompleted ? 'bg-purple-950/20 border-purple-500/30 text-gray-400' : 'glass-card border-white/10 text-white'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${isCompleted ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-600 text-white'}`}>
            {stop.sequence}
          </span>
          <div>
            <h4 className="font-semibold text-base leading-tight">
              {stop.street}, {stop.number}
            </h4>
            <p className="text-xs text-gray-400 mt-0.5">
              {stop.neighborhood ? `${stop.neighborhood}, ` : ''}{stop.city} - {stop.state}
            </p>
          </div>
        </div>
        <button
          onClick={() => onToggleComplete(stop.id)}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold press-effect ${isCompleted ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/10 hover:bg-white/20 text-white'}`}
        >
          {isCompleted ? '✓ Concluído' : 'Concluir'}
        </button>
      </div>

      <div className="flex gap-2 mt-3 pt-3 border-t border-white/5">
        <a
          href={getGoogleMapsDeeplink(stop.latitude, stop.longitude)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 text-center py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-medium transition"
        >
          Google Maps
        </a>
        <a
          href={getWazeDeeplink(stop.latitude, stop.longitude)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 text-center py-2 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-medium transition"
        >
          Waze
        </a>
      </div>
    </div>
  );
}
