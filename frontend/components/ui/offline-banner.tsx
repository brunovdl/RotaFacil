'use client';

import React from 'react';
import { useOnlineStatus } from '@/lib/hooks/useOnlineStatus';

export function OfflineBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 px-4 py-2 text-center text-xs font-semibold flex items-center justify-center gap-2 animate-fade-down shadow-lg"
      style={{
        background: 'rgba(239, 68, 68, 0.9)',
        backdropFilter: 'blur(12px)',
        color: '#FFFFFF',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
      }}
    >
      <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
      <span>Você está offline. As alterações serão salvas localmente e sincronizadas quando a rede voltar.</span>
    </div>
  );
}
