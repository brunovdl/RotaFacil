'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { BottomNav } from '@/components/layout/bottom-nav';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { api } from '@/lib/api';
import { formatDistance, formatDuration, formatDateTime } from '@/lib/utils';
import {
  RoutesIcon,
  AddRouteIcon,
  SpinnerIcon,
  DistanceIcon,
  ClockIcon,
  PackageIcon,
  ExportCsvIcon,
} from '@/components/ui/icons';

const statusLabel: Record<string, string> = {
  active: 'Em andamento',
  completed: 'Concluída',
  cancelled: 'Cancelada',
};

const statusClass: Record<string, string> = {
  active: 'pill-active',
  completed: 'pill-completed',
  cancelled: 'pill-cancelled',
};

export default function HistoryPage() {
  const router = useRouter();
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }
    loadRoutes();
  }, [router, page]);

  const loadRoutes = async () => {
    try {
      const data = await api.routes.list(page);
      setRoutes(data.data || []);
      setTotal(data.total || 0);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const [actionOverlay, setActionOverlay] = useState<{ title: string; message: string } | null>(null);

  const handleDuplicate = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActionOverlay({ title: 'Duplicando Rota...', message: 'Gerando uma cópia idêntica da rota no histórico' });
    try {
      const result = await api.routes.duplicate(id);
      router.push(`/routes/${result.id}`);
    } catch (err: any) {
      alert(err.message || 'Erro ao duplicar rota');
      setActionOverlay(null);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Excluir esta rota?')) return;
    setActionOverlay({ title: 'Excluindo Rota...', message: 'Removendo registro de rota do seu histórico' });
    try {
      await api.routes.delete(id);
      loadRoutes();
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir rota');
    } finally {
      setActionOverlay(null);
    }
  };

  const exportCsv = () => {
    const headers = 'Nome,Data,Paradas,Distância (km),Duração (min),Status\n';
    const rows = routes
      .map(
        (r) =>
          `"${r.name}","${formatDateTime(r.created_at)}",${r.stops_count || 0},${
            r.total_distance_km
          },${r.estimated_duration_min},"${r.status}"`,
      )
      .join('\n');

    const blob = new Blob(['\uFEFF' + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rotas_rotafacil.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ background: 'var(--surface)', minHeight: '100vh' }}>
      <Header />

      <main className="px-4 pt-4 pb-28 space-y-4 animate-fade-in">
        {/* Header da Página */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Histórico de Rotas
            </h1>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {total > 0 ? `${total} rotas registradas` : 'Suas rotas salvas'}
            </p>
          </div>

            <button
              onClick={exportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl press-effect text-xs font-semibold"
              style={{
                background: 'rgba(124,58,237,0.15)',
                border: '1px solid rgba(124,58,237,0.3)',
                color: '#A78BFA',
              }}
            >
              <ExportCsvIcon size={14} />
              Exportar CSV
            </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <SpinnerIcon size={32} className="text-brand-500" />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Carregando histórico...
            </p>
          </div>
        ) : routes.length === 0 ? (
          /* Empty State */
          <div
            className="rounded-2xl p-8 text-center space-y-4"
            style={{
              background:
                'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
              style={{
                background: 'rgba(124,58,237,0.12)',
                border: '1px solid rgba(124,58,237,0.2)',
              }}
            >
              <RoutesIcon className="text-brand-400" size={28} />
            </div>
            <div>
              <p className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>
                Nenhuma rota encontrada
              </p>
              <p className="text-xs mt-1 max-w-xs mx-auto" style={{ color: 'var(--text-muted)' }}>
                Você ainda não criou nenhuma rota. Crie sua primeira rota para otimizar suas
                entregas!
              </p>
            </div>
            <Link href="/routes/new" className="inline-block pt-2">
              <Button variant="primary" size="sm">
                <AddRouteIcon className="mr-1.5" size={16} /> Criar primeira rota
              </Button>
            </Link>
          </div>
        ) : (
          /* Lista de Rotas */
          <div className="space-y-3">
            {routes.map((route) => (
              <Link key={route.id} href={`/routes/${route.id}`} className="block">
                <div
                  className="rounded-2xl p-4 transition-all duration-200 hover-lift press-effect space-y-3"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3
                        className="font-bold text-base truncate"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {route.name}
                      </h3>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {formatDateTime(route.created_at)}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        statusClass[route.status] || 'pill-cancelled'
                      }`}
                    >
                      {statusLabel[route.status] || route.status}
                    </span>
                  </div>

                  {/* Informações da Rota */}
                  <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    <span className="flex items-center gap-1">
                      <DistanceIcon size={14} className="text-brand-400" />
                      {formatDistance(route.total_distance_km)}
                    </span>
                    <span className="flex items-center gap-1">
                      <ClockIcon size={14} className="text-brand-400" />
                      {formatDuration(route.estimated_duration_min)}
                    </span>
                    <span className="flex items-center gap-1">
                      <PackageIcon size={14} className="text-emerald-400" />
                      {route.stops_count || 0} paradas
                    </span>
                  </div>

                  {/* Ações do Card */}
                  <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                    <button
                      onClick={(e) => handleDuplicate(route.id, e)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold press-effect"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      Duplicar
                    </button>

                    <button
                      onClick={(e) => handleDelete(route.id, e)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold press-effect"
                      style={{
                        background: 'rgba(239,68,68,0.1)',
                        border: '1px solid rgba(239,68,68,0.2)',
                        color: '#FCA5A5',
                      }}
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Paginação */}
        {total > 20 && (
          <div className="flex justify-center items-center gap-3 pt-4">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Anterior
            </Button>
            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
              Página {page}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page * 20 >= total}
              onClick={() => setPage((p) => p + 1)}
            >
              Próxima
            </Button>
          </div>
        )}
        {actionOverlay && (
          <LoadingOverlay
            title={actionOverlay.title}
            message={actionOverlay.message}
          />
        )}
      </main>

      <BottomNav />
    </div>
  );
}
