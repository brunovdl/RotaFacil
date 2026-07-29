'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogoIcon, StarsIcon, MapPinIcon, FlashIcon, PackageIcon } from '@/components/ui/icons';

const features = [
  { icon: <MapPinIcon size={18} />, text: 'Localização via GPS' },
  { icon: <FlashIcon size={18} />, text: 'Rota otimizada em segundos' },
  { icon: <PackageIcon size={18} />, text: 'Marcar entregas concluídas' },
];

export default function WelcomePage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      router.push('/dashboard');
    }
  }, [router]);

  if (!mounted || isLoggedIn) return null;

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: 'var(--surface)' }}>

      {/* ─── Orbs decorativos de fundo ─── */}
      <div
        className="absolute top-[-100px] left-[-80px] w-80 h-80 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      <div
        className="absolute top-[200px] right-[-60px] w-64 h-64 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(79,70,229,0.2) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      <div
        className="absolute bottom-[120px] left-[20px] w-48 h-48 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(16,217,160,0.12) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      {/* ─── Conteúdo Principal ─── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center relative z-10">

        {/* Logo animada */}
        <div className="animate-fade-up" style={{ animationDelay: '0ms' }}>
          <div
            className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6 relative mx-auto animate-float"
            style={{
              background: 'linear-gradient(135deg, rgba(124,58,237,0.2) 0%, rgba(79,70,229,0.1) 100%)',
              border: '1px solid rgba(124,58,237,0.35)',
              boxShadow: '0 0 32px rgba(124,58,237,0.3), inset 0 1px 0 rgba(255,255,255,0.08)',
            }}
          >
            {/* Ping de anel */}
            <div
              className="absolute inset-0 rounded-3xl"
              style={{
                animation: 'orbitPing 2.5s ease-out infinite',
                border: '1px solid rgba(124,58,237,0.4)',
              }}
            />
            <LogoIcon size={48} />
          </div>
        </div>

        {/* Título e subtítulo */}
        <div className="animate-fade-up" style={{ animationDelay: '80ms', opacity: 0 }}>
          <h1 className="text-4xl font-bold mb-2 tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Rota<span className="gradient-text">Fácil</span>
          </h1>
          <p className="font-medium mb-1" style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
            Roteirização inteligente para entregadores
          </p>
        </div>

        {/* Badge de trial */}
        <div
          className="animate-fade-up mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-full"
          style={{
            animationDelay: '160ms',
            opacity: 0,
            background: 'rgba(124,58,237,0.12)',
            border: '1px solid rgba(124,58,237,0.3)',
          }}
        >
          <StarsIcon size={16} className="text-brand-400" />
          <span className="text-sm font-medium text-brand-300">7 dias grátis • Sem cartão</span>
        </div>

        {/* Features list */}
        <div className="mt-8 space-y-3 w-full max-w-xs">
          {features.map((f, i) => (
            <div
              key={i}
              className="animate-fade-up flex items-center gap-3 px-4 py-3 rounded-xl text-left"
              style={{
                animationDelay: `${240 + i * 80}ms`,
                opacity: 0,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              <span className="text-brand-400 flex-shrink-0">{f.icon}</span>
              <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Botões de ação ─── */}
      <div
        className="px-6 pb-12 space-y-3 relative z-10 animate-fade-up"
        style={{ animationDelay: '520ms', opacity: 0 }}
      >
        <Link
          href="/register"
          className="btn-brand block w-full py-4 text-center text-base font-semibold rounded-2xl"
        >
          Começar agora — É grátis
        </Link>
        <Link
          href="/login"
          className="block w-full py-4 text-center text-base font-semibold rounded-2xl transition-all duration-200 press-effect"
          style={{
            color: 'var(--text-secondary)',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          Já tenho conta
        </Link>
      </div>

      {/* Keyframe extra para o orb ping */}
      <style>{`
        @keyframes orbitPing {
          0% { transform: scale(1); opacity: 0.6; }
          70%, 100% { transform: scale(1.4); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
