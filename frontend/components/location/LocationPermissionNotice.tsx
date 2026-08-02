'use client';

import React from 'react';

interface LocationPermissionNoticeProps {
  message: string;
  onOpenManualModal: () => void;
}

export function LocationPermissionNotice({ message, onOpenManualModal }: LocationPermissionNoticeProps) {
  return (
    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex flex-col gap-2 text-amber-200 text-sm">
      <div className="flex items-center gap-2 font-semibold">
        <span>⚠️</span>
        <span>Atenção à Localização</span>
      </div>
      <p>{message}</p>
      <button
        onClick={onOpenManualModal}
        className="self-start text-xs font-semibold text-amber-400 underline hover:text-amber-300 transition"
      >
        Inserir endereço manualmente →
      </button>
    </div>
  );
}
