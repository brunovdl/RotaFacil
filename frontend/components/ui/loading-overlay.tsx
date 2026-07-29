'use client';

import { LogoIcon, SpinnerIcon } from '@/components/ui/icons';

interface LoadingOverlayProps {
  title?: string;
  message?: string;
  progress?: number | null; // 0 a 100 se aplicável
  subtext?: string;
}

export function LoadingOverlay({
  title = 'Processando...',
  message = 'Aguarde enquanto preparamos suas informações',
  progress = null,
  subtext,
}: LoadingOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-sm rounded-3xl p-6 text-center space-y-5 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(22, 22, 42, 0.95) 0%, rgba(15, 15, 26, 0.98) 100%)',
          border: '1px solid rgba(124, 58, 237, 0.3)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.7), 0 0 30px rgba(124, 58, 237, 0.25)',
        }}
      >
        {/* Glow de fundo */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 70%)',
            filter: 'blur(30px)',
          }}
        />

        {/* Animação Central: Radar Orbital com Logo */}
        <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
          {/* Anéis de Radar Pulsando */}
          <div
            className="absolute inset-0 rounded-full animate-ping"
            style={{
              border: '2px solid rgba(124,58,237,0.4)',
              animationDuration: '2s',
            }}
          />
          <div
            className="absolute inset-[-12px] rounded-full animate-ping"
            style={{
              border: '1px solid rgba(16,217,160,0.3)',
              animationDuration: '2.5s',
              animationDelay: '0.4s',
            }}
          />

          {/* Círculo Central com Logo */}
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center relative z-10 animate-float"
            style={{
              background: 'linear-gradient(135deg, rgba(124,58,237,0.25) 0%, rgba(79,70,229,0.15) 100%)',
              border: '1px solid rgba(124,58,237,0.5)',
              boxShadow: '0 0 25px rgba(124,58,237,0.5)',
            }}
          >
            <LogoIcon size={44} />
          </div>

          {/* Partícula Orbital de Carga */}
          <div
            className="absolute inset-0 rounded-full animate-spin"
            style={{ animationDuration: '3s' }}
          >
            <span
              className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-emerald-400"
              style={{ boxShadow: '0 0 10px #10D9A0' }}
            />
          </div>
        </div>

        {/* Mensagens de Texto */}
        <div className="space-y-1 relative z-10">
          <h3 className="text-lg font-bold gradient-text">{title}</h3>
          <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
            {message}
          </p>
          {subtext && (
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              {subtext}
            </p>
          )}
        </div>

        {/* Barra de Progresso em Porcentagem (opcional) */}
        {progress !== null && (
          <div className="space-y-1.5 pt-2 relative z-10">
            <div className="flex justify-between text-[11px] font-bold text-brand-300">
              <span>Processando</span>
              <span>{Math.min(100, Math.max(0, Math.round(progress)))}%</span>
            </div>
            <div className="w-full h-2 rounded-full overflow-hidden bg-surface-3">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, Math.max(0, progress))}%`,
                  background: 'linear-gradient(90deg, #7C3AED, #10D9A0)',
                  boxShadow: '0 0 10px rgba(16, 217, 160, 0.6)',
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
