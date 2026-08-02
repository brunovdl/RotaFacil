'use client';

import React from 'react';

interface StopItem {
  id: string;
  sequence: number;
  street: string;
  number: string;
}

interface StopListReorderProps {
  stops: StopItem[];
  onReorder: (newStops: StopItem[]) => void;
}

export function StopListReorder({ stops, onReorder }: StopListReorderProps) {
  const moveUp = (index: number) => {
    if (index === 0) return;
    const copy = [...stops];
    const temp = copy[index];
    copy[index] = copy[index - 1];
    copy[index - 1] = temp;
    onReorder(copy);
  };

  const moveDown = (index: number) => {
    if (index === stops.length - 1) return;
    const copy = [...stops];
    const temp = copy[index];
    copy[index] = copy[index + 1];
    copy[index + 1] = temp;
    onReorder(copy);
  };

  return (
    <div className="space-y-2">
      {stops.map((stop, idx) => (
        <div key={stop.id} className="flex items-center justify-between p-3 glass-card rounded-xl border border-white/10 text-sm text-white">
          <span>{idx + 1}. {stop.street}, {stop.number}</span>
          <div className="flex gap-1">
            <button
              onClick={() => moveUp(idx)}
              disabled={idx === 0}
              className="px-2 py-1 bg-white/10 hover:bg-white/20 disabled:opacity-30 rounded text-xs"
            >
              ▲
            </button>
            <button
              onClick={() => moveDown(idx)}
              disabled={idx === stops.length - 1}
              className="px-2 py-1 bg-white/10 hover:bg-white/20 disabled:opacity-30 rounded text-xs"
            >
              ▼
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
