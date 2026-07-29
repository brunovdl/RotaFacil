'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { BottomNav } from '@/components/layout/bottom-nav';
import { Card } from '@/components/ui/card';
import { api } from '@/lib/api';
import { SpinnerIcon, ReportsIcon, PackageIcon, DistanceIcon, ClockIcon, StarsIcon } from '@/components/ui/icons';

export default function ReportsPage() {
  const router = useRouter();
  const [operational, setOperational] = useState<any>(null);
  const [performance, setPerformance] = useState<any>(null);
  const [kmByDay, setKmByDay] = useState<any[]>([]);
  const [completion, setCompletion] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'charts'>('overview');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }
    loadReports();
  }, [router]);

  const loadReports = async () => {
    try {
      const [op, perf, km, comp] = await Promise.all([
        api.reports.operational(),
        api.reports.performance(),
        api.reports.kmByDay(7),
        api.reports.routeCompletion(),
      ]);
      setOperational(op);
      setPerformance(perf);
      setKmByDay(km || []);
      setCompletion(comp);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ background: 'var(--surface)', minHeight: '100vh' }}>
        <Header />
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <SpinnerIcon size={32} className="text-brand-500" />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Carregando relatórios...</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--surface)', minHeight: '100vh' }}>
      <Header />

      <main className="px-4 pt-4 pb-28 space-y-4 animate-fade-in">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Relatórios de Desempenho</h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Acompanhe métricas de entregas e economia</p>
        </div>

        {/* Tab Selector */}
        <div className="flex p-1 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            onClick={() => setActiveTab('overview')}
            className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all duration-200"
            style={{
              background: activeTab === 'overview' ? 'linear-gradient(135deg, #7C3AED, #4F46E5)' : 'transparent',
              color: activeTab === 'overview' ? '#FFFFFF' : 'var(--text-muted)',
              boxShadow: activeTab === 'overview' ? '0 4px 16px rgba(124,58,237,0.3)' : 'none',
            }}
          >
            Visão Geral
          </button>
          <button
            onClick={() => setActiveTab('charts')}
            className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all duration-200"
            style={{
              background: activeTab === 'charts' ? 'linear-gradient(135deg, #7C3AED, #4F46E5)' : 'transparent',
              color: activeTab === 'charts' ? '#FFFFFF' : 'var(--text-muted)',
              boxShadow: activeTab === 'charts' ? '0 4px 16px rgba(124,58,237,0.3)' : 'none',
            }}
          >
            Gráficos & Economia
          </button>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Indicadores Operacionais */}
            <div className="space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-300">
                Volume de Entregas
              </h2>
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-2xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Hoje</p>
                  <p className="text-xl font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>{operational?.daily?.deliveries || 0}</p>
                  <p className="text-[10px] text-brand-400">entregas</p>
                </div>
                <div className="rounded-2xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Semana</p>
                  <p className="text-xl font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>{operational?.weekly?.deliveries || 0}</p>
                  <p className="text-[10px] text-brand-400">entregas</p>
                </div>
                <div className="rounded-2xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Mês</p>
                  <p className="text-xl font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>{operational?.monthly?.deliveries || 0}</p>
                  <p className="text-[10px] text-brand-400">entregas</p>
                </div>
              </div>
            </div>

            {/* Média de Desempenho */}
            {performance && (
              <div className="space-y-2">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-300">
                  Desempenho Geral
                </h2>
                <div className="grid grid-cols-2 gap-2">
                  <Card padding="sm">
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Total Percorrido</p>
                    <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{performance.totalKm} km</p>
                  </Card>
                  <Card padding="sm">
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Total de Rotas</p>
                    <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{performance.totalRoutes}</p>
                  </Card>
                  <Card padding="sm">
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Média km / entrega</p>
                    <p className="text-lg font-bold text-emerald-400">{performance.avgKmPerDelivery} km</p>
                  </Card>
                  <Card padding="sm">
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Média entregas / rota</p>
                    <p className="text-lg font-bold text-brand-400">{performance.avgDeliveriesPerRoute}</p>
                  </Card>
                </div>
              </div>
            )}

            {/* Completion Rates */}
            {completion && (
              <Card className="space-y-3">
                <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Status de Rotas Geradas</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: 'var(--text-secondary)' }}>Concluídas</span>
                      <span className="font-bold text-emerald-400">{completion.completed}</span>
                    </div>
                    <div className="w-full bg-surface-3 rounded-full h-2">
                      <div className="bg-emerald-400 h-2 rounded-full" style={{
                        width: completion.total > 0 ? `${(completion.completed / completion.total) * 100}%` : '0%'
                      }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: 'var(--text-secondary)' }}>Em andamento</span>
                      <span className="font-bold text-brand-400">{completion.active}</span>
                    </div>
                    <div className="w-full bg-surface-3 rounded-full h-2">
                      <div className="bg-brand-500 h-2 rounded-full" style={{
                        width: completion.total > 0 ? `${(completion.active / completion.total) * 100}%` : '0%'
                      }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: 'var(--text-secondary)' }}>Canceladas</span>
                      <span className="font-bold text-red-400">{completion.cancelled}</span>
                    </div>
                    <div className="w-full bg-surface-3 rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{
                        width: completion.total > 0 ? `${(completion.cancelled / completion.total) * 100}%` : '0%'
                      }} />
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'charts' && (
          <div className="space-y-4">
            {/* Gráfico de barras simples em CSS */}
            <Card className="space-y-3">
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Km Percorridos (Últimos 7 dias)</h3>
              {kmByDay.length > 0 ? (
                <div className="space-y-2">
                  {kmByDay.slice(-7).map((item: any) => {
                    const maxKm = Math.max(...kmByDay.map((k: any) => k.km)) || 1;
                    const pct = (item.km / maxKm) * 100;
                    const date = new Date(item.date + 'T12:00:00');
                    const dayName = date.toLocaleDateString('pt-BR', { weekday: 'short' });
                    return (
                      <div key={item.date} className="flex items-center gap-2">
                        <span className="text-xs w-9 uppercase" style={{ color: 'var(--text-muted)' }}>{dayName}</span>
                        <div className="flex-1 bg-surface-3 rounded-full h-5 overflow-hidden">
                          <div
                            className="h-5 rounded-full flex items-center justify-end px-2 transition-all duration-500"
                            style={{
                              width: `${Math.max(pct, 8)}%`,
                              background: 'linear-gradient(90deg, #7C3AED, #4F46E5)',
                            }}
                          >
                            <span className="text-[10px] text-white font-bold">
                              {item.km.toFixed(1)} km
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-center py-6" style={{ color: 'var(--text-muted)' }}>
                  Nenhum registro de km recente
                </p>
              )}
            </Card>

            {/* Banner de Economia */}
            <div
              className="rounded-2xl p-4 space-y-2 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(16,217,160,0.15) 0%, rgba(5,150,105,0.06) 100%)',
                border: '1px solid rgba(16,217,160,0.3)',
              }}
            >
              <div className="flex items-center gap-2">
                <StarsIcon size={20} className="text-emerald-400" />
                <h3 className="text-sm font-bold text-emerald-400">Economia Estima com Otimização</h3>
              </div>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Calculamos que a roteirização do RotaFácil reduz até <strong className="text-emerald-300">20% da distância total</strong> percorrida e evita desperdício de combustível.
              </p>
            </div>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
