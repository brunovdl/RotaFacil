'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { BottomNav } from '@/components/layout/bottom-nav';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  PackageIcon,
  RoutesIcon,
  FlashIcon,
  ClockIcon,
  DistanceIcon,
  StarsIcon,
  ChevronRightIcon,
  MapPinIcon,
  AddRouteIcon,
  SpinnerIcon,
} from '@/components/ui/icons';
import { api } from '@/lib/api';
import { formatDistance, formatDuration } from '@/lib/utils';
import type { DashboardStats } from '@/lib/types';

const statusLabel: Record<string, string> = {
  active: 'Ativa',
  completed: 'Concluída',
  cancelled: 'Cancelada',
};

const statusClass: Record<string, string> = {
  active: 'pill-active',
  completed: 'pill-completed',
  cancelled: 'pill-cancelled',
};

function StatCard({
  icon,
  label,
  value,
  color = '#A78BFA',
  delay = 0,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color?: string;
  delay?: number;
}) {
  return (
    <div
      className="animate-fade-up rounded-2xl p-4 relative overflow-hidden"
      style={{
        animationDelay: `${delay}ms`,
        opacity: 0,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* Glow de fundo */}
      <div
        className="absolute top-0 right-0 w-16 h-16 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${color}22 0%, transparent 70%)`,
          transform: 'translate(4px, -4px)',
        }}
      />
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
        style={{ background: `${color}18`, color }}
      >
        {icon}
      </div>
      <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{value}</p>
      <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentRoutes, setRecentRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }
    loadData();
  }, [router]);

  const loadData = async () => {
    try {
      const [statsData, routesData] = await Promise.all([
        api.routes.todayStats(),
        api.routes.list(1, 5),
      ]);
      setStats(statsData);
      setRecentRoutes(routesData.data || []);
    } catch (err: any) {
      if (err.message?.includes('Token') || err.message?.includes('401')) {
        localStorage.removeItem('token');
        router.push('/');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen gap-3"
        style={{ background: 'var(--surface)' }}
      >
        <SpinnerIcon size={32} className="text-brand-500" />
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Carregando…</p>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--surface)', minHeight: '100vh' }}>
      <Header />

      <main className="px-4 pt-4 pb-28 space-y-4">

        {/* ── Stats Grid ── */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={<PackageIcon size={18} />}
            label="Entregas hoje"
            value={stats?.totalStops || 0}
            color="#A78BFA"
            delay={0}
          />
          <StatCard
            icon={<RoutesIcon size={18} />}
            label="Rotas hoje"
            value={stats?.todayRoutes || 0}
            color="#10D9A0"
            delay={80}
          />
        </div>

        {/* ── Rota Atual ── */}
        {stats?.currentRoute ? (
          <div
            className="animate-fade-up rounded-2xl p-4 relative overflow-hidden"
            style={{
              animationDelay: '160ms',
              opacity: 0,
              background: 'linear-gradient(135deg, rgba(124,58,237,0.18) 0%, rgba(79,70,229,0.08) 100%)',
              border: '1px solid rgba(124,58,237,0.3)',
            }}
          >
            {/* Brilho de fundo */}
            <div
              className="absolute top-[-20px] right-[-20px] w-32 h-32 rounded-full pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 70%)',
                filter: 'blur(20px)',
              }}
            />

            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full animate-pulse-soft"
                  style={{ background: '#10D9A0' }}
                />
                <p className="text-xs font-semibold" style={{ color: '#10D9A0' }}>
                  EM ANDAMENTO
                </p>
              </div>
              <span
                className="text-xs font-medium px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(16,217,160,0.15)', color: '#10D9A0', border: '1px solid rgba(16,217,160,0.3)' }}
              >
                Rota ativa
              </span>
            </div>

            <h3
              className="text-lg font-bold mb-3 relative z-10"
              style={{ color: 'var(--text-primary)' }}
            >
              {stats.currentRoute.name}
            </h3>

            <div className="flex gap-4 mb-4 relative z-10">
              <div className="flex items-center gap-1.5">
                <DistanceIcon className="text-brand-400" size={14} />
                <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {formatDistance(stats.currentRoute.totalDistance)}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <ClockIcon className="text-brand-400" size={14} />
                <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {formatDuration(stats.currentRoute.estimatedDuration)}
                </span>
              </div>
            </div>

            <Link href={`/routes/${stats.currentRoute.id}`} className="block relative z-10">
              <Button variant="primary" size="sm" className="w-full">
                Continuar rota →
              </Button>
            </Link>
          </div>
        ) : (
          /* ── Sem rota ativa ── */
          <div
            className="animate-fade-up rounded-2xl p-5 text-center relative overflow-hidden"
            style={{
              animationDelay: '160ms',
              opacity: 0,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
              style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.2)' }}
            >
              <MapPinIcon className="text-brand-400" size={24} />
            </div>
            <p className="font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
              Nenhuma rota em andamento
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Crie uma rota e otimize suas entregas do dia
            </p>
          </div>
        )}

        {/* ── Ação Rápida ── */}
        <Link href="/routes/new" className="block mt-3">
          <div
            className="animate-fade-up rounded-2xl p-4 flex items-center gap-4 hover-lift press-effect"
            style={{
              animationDelay: '240ms',
              opacity: 0,
              background: 'linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(79,70,229,0.06) 100%)',
              border: '1px solid rgba(124,58,237,0.2)',
            }}
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #4F46E5)', boxShadow: '0 4px 16px rgba(124,58,237,0.4)' }}
            >
              <AddRouteIcon className="text-white" size={22} />
            </div>
            <div className="flex-1">
              <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Nova rota otimizada</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Adicione endereços e gere a melhor sequência
              </p>
            </div>
            <ChevronRightIcon className="flex-shrink-0" style={{ color: 'var(--text-muted)' }} size={16} />
          </div>
        </Link>

        {/* ── Rotas Recentes ── */}
        {recentRoutes.length > 0 && (
          <div className="animate-fade-up" style={{ animationDelay: '320ms', opacity: 0 }}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                Rotas recentes
              </h2>
              <Link
                href="/history"
                className="text-xs font-medium text-brand-400 hover:text-brand-300 transition-colors"
              >
                Ver todas →
              </Link>
            </div>
            <div className="space-y-2">
              {recentRoutes.slice(0, 3).map((route, i) => (
                <Link key={route.id} href={`/routes/${route.id}`}>
                  <div
                    className="rounded-xl p-3 flex items-center gap-3 hover-lift press-effect"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.07)',
                    }}
                  >
                    {/* Número da rota */}
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background: 'rgba(124,58,237,0.15)', color: '#A78BFA' }}
                    >
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-medium truncate"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {route.name}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {formatDistance(route.total_distance_km)} • {formatDuration(route.estimated_duration_min)}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${statusClass[route.status] || 'pill-cancelled'}`}
                    >
                      {statusLabel[route.status] || 'Desconhecido'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── Banner Trial ── */}
        <div
          className="animate-fade-up rounded-2xl p-4 flex items-center gap-3"
          style={{
            animationDelay: '400ms',
            opacity: 0,
            background: 'linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(217,119,6,0.05) 100%)',
            border: '1px solid rgba(245,158,11,0.25)',
          }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(245,158,11,0.15)' }}
          >
            <StarsIcon size={20} className="text-yellow-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold" style={{ color: '#FCD34D' }}>
              Teste grátis ativo
            </p>
            <p className="text-xs" style={{ color: 'rgba(252,211,77,0.7)' }}>
              7 dias para explorar todos os recursos
            </p>
          </div>
          <Link href="/settings">
            <Button variant="ghost" size="sm" style={{ color: '#FCD34D' }}>
              Gerir
            </Button>
          </Link>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
