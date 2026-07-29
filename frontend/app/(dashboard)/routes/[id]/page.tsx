'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { BottomNav } from '@/components/layout/bottom-nav';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RouteMap } from '@/components/ui/route-map';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { SuspendStopModal } from '@/components/ui/suspend-stop-modal';
import { api } from '@/lib/api';
import {
  formatDistance,
  formatDuration,
  openExternalNavigation,
  openMultiStopNavigation,
  formatDateTime,
} from '@/lib/utils';
import type { Route, RouteStop, Vehicle } from '@/lib/types';
import {
  BackIcon,
  CheckIcon,
  ClockIcon,
  DistanceIcon,
  FlashIcon,
  GoogleMapsIcon,
  WazeIcon,
  CopyIcon,
  PackageIcon,
  SpinnerIcon,
  DuplicateIcon,
  TrashIcon,
  FuelIcon,
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

export default function RouteDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [route, setRoute] = useState<Route | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [completedStops, setCompletedStops] = useState<Set<string>>(new Set());
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [suspendModalStop, setSuspendModalStop] = useState<RouteStop | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }
    loadRoute();
  }, [router, params.id]);

  const loadRoute = async () => {
    try {
      const [data, vehicleData] = await Promise.all([
        api.routes.getById(params.id as string),
        api.vehicles.get().catch(() => null),
      ]);
      setRoute(data);
      setVehicle(vehicleData);
      const completed = new Set<string>(
        (data.stops || []).filter((s: RouteStop) => s.completed).map((s: RouteStop) => s.id),
      );
      setCompletedStops(completed);
      setCurrentStopIndex(completed.size);
    } catch {
      router.push('/history');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteStop = async (stopId: string) => {
    try {
      await api.stops.complete(stopId, params.id as string);
      setCompletedStops((prev) => {
        const next = new Set(prev);
        next.add(stopId);
        return next;
      });
      setCurrentStopIndex((prev) => prev + 1);
      await loadRoute();
    } catch (err: any) {
      alert(err.message || 'Erro ao concluir parada');
    }
  };

  const handleConfirmSkipStop = async (reason: string, notes: string, moveToEnd: boolean) => {
    if (!suspendModalStop) return;
    try {
      await api.stops.skip(suspendModalStop.id, params.id as string, reason, notes, moveToEnd);
      await loadRoute();
    } catch (err: any) {
      alert(err.message || 'Erro ao adiar entrega');
    }
  };

  const handleResumeStop = async (stopId: string) => {
    try {
      await api.stops.resume(stopId, params.id as string);
      await loadRoute();
    } catch (err: any) {
      alert(err.message || 'Erro ao retomar entrega');
    }
  };

  const handleNavigate = (stop: RouteStop, app: 'google_maps' | 'waze') => {
    openExternalNavigation(stop.lat, stop.lng, app);
  };

  const handleNavigateAllStops = (app: 'google_maps' | 'waze') => {
    if (!route) return;
    const remaining = (route.stops || []).filter((s) => !completedStops.has(s.id));
    if (remaining.length === 0) return;

    openMultiStopNavigation(
      { lat: route.start_lat, lng: route.start_lng },
      remaining.map((s) => ({ lat: s.lat, lng: s.lng })),
      app,
    );
  };

  const handleCopySequence = () => {
    if (!route || !route.stops) return;
    const sequenceText = route.stops
      .map(
        (s, i) =>
          `${i + 1}. ${s.street}, ${s.number} - ${s.neighborhood}, ${s.city} (CEP: ${s.cep})`,
      )
      .join('\n');

    navigator.clipboard.writeText(`📍 Rota: ${route.name}\n\n${sequenceText}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const [actionOverlay, setActionOverlay] = useState<{ title: string; message: string } | null>(null);

  const handleDuplicate = async () => {
    setActionOverlay({ title: 'Duplicando Rota...', message: 'Criando uma cópia desta rota para reutilização' });
    try {
      const result = await api.routes.duplicate(params.id as string);
      router.push(`/routes/${result.id}`);
    } catch (err: any) {
      alert(err.message || 'Erro ao duplicar rota');
      setActionOverlay(null);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir esta rota?')) return;
    setActionOverlay({ title: 'Excluindo Rota...', message: 'Removendo rota e paradas salvas' });
    try {
      await api.routes.delete(params.id as string);
      router.push('/history');
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir rota');
      setActionOverlay(null);
    }
  };

  const handleCompleteRoute = async () => {
    setActionOverlay({ title: 'Finalizando Rota...', message: 'Atualizando status de todas as entregas' });
    try {
      await api.routes.updateStatus(params.id as string, 'completed');
      loadRoute();
    } catch (err: any) {
      alert(err.message || 'Erro ao concluir rota');
    } finally {
      setActionOverlay(null);
    }
  };

  if (loading) {
    return (
      <div style={{ background: 'var(--surface)', minHeight: '100vh' }}>
        <Header />
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <SpinnerIcon size={32} className="text-brand-500" />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Carregando rota...
          </p>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (!route) return null;

  const stops = route.stops || [];
  const activeStops = stops.filter((s) => !completedStops.has(s.id) && s.status !== 'skipped');
  const skippedStops = stops.filter((s) => !completedStops.has(s.id) && s.status === 'skipped');
  const isAllCompleted = stops.length > 0 && completedStops.size === stops.length;
  const progressPct = stops.length > 0 ? Math.round((completedStops.size / stops.length) * 100) : 0;

  return (
    <div style={{ background: 'var(--surface)', minHeight: '100vh' }}>
      <Header />

      <main className="px-4 pt-4 pb-28 space-y-4 animate-fade-in">
        {/* ── Top Bar ── */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/history')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl press-effect text-xs font-medium"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'var(--text-secondary)',
            }}
          >
            <BackIcon size={14} /> Rotas
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySequence}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl press-effect text-xs font-medium transition-all"
              style={{
                background: copied ? 'rgba(16,217,160,0.15)' : 'rgba(255,255,255,0.05)',
                border: copied
                  ? '1px solid rgba(16,217,160,0.3)'
                  : '1px solid rgba(255,255,255,0.08)',
                color: copied ? '#10D9A0' : 'var(--text-secondary)',
              }}
              title="Copiar sequência de entregas"
            >
              {copied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
              {copied ? 'Copiado!' : 'Copiar'}
            </button>

            <button
              onClick={handleDuplicate}
              className="p-2 rounded-xl press-effect"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'var(--text-secondary)',
              }}
              title="Duplicar rota"
            >
              <DuplicateIcon size={16} />
            </button>

            <button
              onClick={handleDelete}
              className="p-2 rounded-xl press-effect text-red-400"
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.2)',
              }}
              title="Excluir rota"
            >
              <TrashIcon size={16} />
            </button>
          </div>
        </div>

        {/* ── Route Summary Header Card ── */}
        <Card variant="brand" className="relative overflow-hidden">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FlashIcon className="text-brand-400" size={16} />
                <span className="text-xs font-semibold uppercase tracking-wider text-brand-300">
                  Rota Otimizada
                </span>
              </div>
              <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {route.name}
              </h1>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Gerada em {formatDateTime(route.created_at)}
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

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-4 gap-1.5 text-center pt-2 border-t border-white/10">
            <div className="p-2 rounded-xl bg-white/5">
              <div className="flex items-center justify-center gap-1 text-brand-400 mb-0.5">
                <DistanceIcon size={14} />
              </div>
              <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                {formatDistance(route.total_distance_km)}
              </p>
              <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                Distância
              </p>
            </div>

            <div className="p-2 rounded-xl bg-white/5">
              <div className="flex items-center justify-center gap-1 text-brand-400 mb-0.5">
                <ClockIcon size={14} />
              </div>
              <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                {formatDuration(route.estimated_duration_min)}
              </p>
              <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                Tempo est.
              </p>
            </div>

            <div className="p-2 rounded-xl bg-white/5">
              <div className="flex items-center justify-center gap-1 text-emerald-400 mb-0.5">
                <PackageIcon size={14} />
              </div>
              <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                {stops.length}
              </p>
              <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                Entregas
              </p>
            </div>

            <div className="p-2 rounded-xl bg-white/5">
              <div className="flex items-center justify-center gap-1 text-amber-400 mb-0.5">
                <FuelIcon size={14} />
              </div>
              <p className="text-xs font-bold text-amber-300">
                {((route.total_distance_km || 0) / (vehicle?.km_per_liter || 10)).toFixed(1)} L
              </p>
              <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                {vehicle?.fuel_price_per_liter && vehicle.fuel_price_per_liter > 0
                  ? `~R$ ${(((route.total_distance_km || 0) / (vehicle.km_per_liter || 10)) * vehicle.fuel_price_per_liter).toFixed(2)}`
                  : 'Consumo'}
              </p>
            </div>
          </div>
        </Card>

        {/* ── Visual Route Map ── */}
        <Card padding="sm" className="space-y-2">
          <div className="flex items-center justify-between px-1 py-1">
            <span className="text-xs font-semibold text-brand-300 flex items-center gap-1.5">
              🗺️ Visualização de Sequência de Entregas
            </span>
            <span className="text-[11px] text-muted">Nearest Neighbor</span>
          </div>
          <RouteMap
            startLat={route.start_lat}
            startLng={route.start_lng}
            stops={stops}
            completedStopIds={completedStops}
            selectedStopId={selectedStopId}
            onSelectStop={(s) => setSelectedStopId(s.id)}
          />
        </Card>

        {/* ── Progress Card ── */}
        {stops.length > 0 && (
          <Card padding="sm" className="space-y-2">
            <div className="flex items-center justify-between text-xs font-medium">
              <span style={{ color: 'var(--text-secondary)' }}>Progresso das entregas</span>
              <span className="font-bold text-brand-400">
                {completedStops.size} de {stops.length} ({progressPct}%)
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full overflow-hidden bg-surface-3">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progressPct}%`,
                  background: 'linear-gradient(90deg, #7C3AED, #10D9A0)',
                  boxShadow: '0 0 12px rgba(16, 217, 160, 0.5)',
                }}
              />
            </div>
          </Card>
        )}

        {/* ── Próxima Parada & Ações de Navegação Externa ── */}
        {activeStops.length > 0 && (
          <Card
            variant="brand"
            className="space-y-4 relative overflow-hidden"
            style={{
              background:
                'linear-gradient(135deg, rgba(124,58,237,0.22) 0%, rgba(79,70,229,0.12) 100%)',
              border: '1px solid rgba(124,58,237,0.4)',
            }}
          >
            <div>
              <span
                className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full"
                style={{
                  background: 'rgba(16,217,160,0.15)',
                  color: '#10D9A0',
                  border: '1px solid rgba(16,217,160,0.3)',
                }}
              >
                Próxima Parada (#{stops.indexOf(activeStops[0]) + 1})
              </span>
              <h3 className="text-lg font-bold mt-2" style={{ color: 'var(--text-primary)' }}>
                {activeStops[0].street}, {activeStops[0].number}
                {activeStops[0].complement && (
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {' '}
                    — {activeStops[0].complement}
                  </span>
                )}
              </h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {activeStops[0].neighborhood}, {activeStops[0].city} — {activeStops[0].state} (CEP:{' '}
                {activeStops[0].cep})
              </p>
            </div>

            {/* Ação 1: Rota Sequencial Completa */}
            {activeStops.length > 1 && (
              <div
                className="p-3 rounded-xl space-y-2"
                style={{
                  background: 'rgba(15,15,26,0.6)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <p className="text-xs font-semibold" style={{ color: '#A78BFA' }}>
                  🚀 Iniciar rota sequencial no GPS ({activeStops.length} paradas restantes)
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleNavigateAllStops('google_maps')}
                    className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold press-effect"
                    style={{
                      background:
                        'linear-gradient(135deg, rgba(66,133,244,0.2) 0%, rgba(52,168,83,0.2) 100%)',
                      border: '1px solid rgba(66,133,244,0.4)',
                      color: '#93C5FD',
                    }}
                  >
                    <GoogleMapsIcon size={16} /> Google Maps
                  </button>

                  <button
                    onClick={() => handleNavigateAllStops('waze')}
                    className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold press-effect"
                    style={{
                      background: 'rgba(51,204,255,0.15)',
                      border: '1px solid rgba(51,204,255,0.3)',
                      color: '#7DD3FC',
                    }}
                  >
                    <WazeIcon size={16} /> Waze
                  </button>
                </div>
              </div>
            )}

            {/* Ação 2: Navegar Parada Atual, Adiar ou Concluir */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <button
                onClick={() => handleNavigate(activeStops[0], 'google_maps')}
                className="flex items-center justify-center gap-1 py-2.5 px-2 rounded-xl text-xs font-semibold press-effect"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: 'var(--text-primary)',
                }}
              >
                <GoogleMapsIcon size={14} /> GPS
              </button>

              <button
                type="button"
                onClick={() => setSuspendModalStop(activeStops[0])}
                className="flex items-center justify-center gap-1 py-2.5 px-2 rounded-xl text-xs font-semibold press-effect"
                style={{
                  background: 'rgba(245,158,11,0.15)',
                  border: '1px solid rgba(245,158,11,0.3)',
                  color: '#FCD34D',
                }}
              >
                <ClockIcon size={14} /> Adiar
              </button>

              <Button
                variant="success"
                size="sm"
                onClick={() => handleCompleteStop(activeStops[0].id)}
                className="w-full flex items-center justify-center gap-1 px-1"
              >
                <CheckIcon size={14} /> Concluir
              </Button>
            </div>
          </Card>
        )}

        {/* ── Lista de Todas as Paradas ── */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              Lista de paradas
            </h2>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {stops.length} no total {skippedStops.length > 0 && `• ${skippedStops.length} adiadas`}
            </span>
          </div>

          {stops.map((stop, index) => {
            const isCompleted = completedStops.has(stop.id);
            const isSkipped = stop.status === 'skipped';
            const isCurrent = activeStops.length > 0 && activeStops[0].id === stop.id;

            return (
              <div
                key={stop.id}
                onClick={() => setSelectedStopId(stop.id)}
                className={`rounded-2xl p-3 flex flex-col gap-2 transition-all duration-200 cursor-pointer ${
                  isCurrent ? 'ring-1 ring-brand-500/60' : ''
                }`}
                style={{
                  background: isCompleted
                    ? 'rgba(255,255,255,0.02)'
                    : isSkipped
                    ? 'rgba(245,158,11,0.06)'
                    : isCurrent
                    ? 'linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(79,70,229,0.05) 100%)'
                    : 'rgba(255,255,255,0.04)',
                  border: isSkipped
                    ? '1px solid rgba(245,158,11,0.3)'
                    : isCurrent
                    ? '1px solid rgba(124,58,237,0.4)'
                    : '1px solid rgba(255,255,255,0.07)',
                  opacity: isCompleted ? 0.6 : 1,
                }}
              >
                <div className="flex items-start gap-3 w-full">
                  {/* Number Badge */}
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5"
                    style={{
                      background: isCompleted
                        ? 'rgba(16,217,160,0.15)'
                        : isSkipped
                        ? 'rgba(245,158,11,0.2)'
                        : isCurrent
                        ? 'linear-gradient(135deg, #7C3AED, #4F46E5)'
                        : 'rgba(255,255,255,0.08)',
                      color: isCompleted ? '#10D9A0' : isSkipped ? '#FCD34D' : '#FFFFFF',
                    }}
                  >
                    {isCompleted ? <CheckIcon size={16} /> : isSkipped ? <ClockIcon size={16} /> : index + 1}
                  </div>

                  {/* Stop Address Info */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-semibold truncate ${
                        isCompleted ? 'line-through' : ''
                      }`}
                      style={{
                        color: isCompleted ? 'var(--text-muted)' : 'var(--text-primary)',
                      }}
                    >
                      {stop.street}, {stop.number}
                      {stop.complement && (
                        <span className="font-normal" style={{ color: 'var(--text-muted)' }}>
                          {' '}
                          — {stop.complement}
                        </span>
                      )}
                    </p>
                    <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {stop.neighborhood}, {stop.city} — {stop.state}
                    </p>

                    {/* Motivo de adiamento */}
                    {isSkipped && (
                      <div className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-medium">
                        <span>⚠️ Adiada: {stop.skip_reason || 'Adiada pelo motorista'}</span>
                      </div>
                    )}
                  </div>

                  {/* Direct GPS Navigate & Adiar buttons */}
                  {!isCompleted && !isSkipped && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSuspendModalStop(stop);
                        }}
                        className="p-1.5 rounded-lg press-effect text-amber-400"
                        style={{
                          background: 'rgba(245,158,11,0.12)',
                          border: '1px solid rgba(245,158,11,0.25)',
                        }}
                        title="Adiar entrega"
                      >
                        <ClockIcon size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNavigate(stop, 'google_maps');
                        }}
                        className="p-1.5 rounded-lg press-effect"
                        style={{
                          background: 'rgba(255,255,255,0.06)',
                          color: 'var(--text-secondary)',
                        }}
                        title="Abrir no Google Maps"
                      >
                        <GoogleMapsIcon size={16} />
                      </button>
                    </div>
                  )}

                  {/* Ações para parada Adiada */}
                  {isSkipped && !isCompleted && (
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleResumeStop(stop.id);
                        }}
                        className="px-2.5 py-1.5 rounded-lg press-effect text-xs font-semibold"
                        style={{
                          background: 'rgba(124,58,237,0.2)',
                          border: '1px solid rgba(124,58,237,0.4)',
                          color: '#A78BFA',
                        }}
                        title="Retomar entrega"
                      >
                        Retomar
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCompleteStop(stop.id);
                        }}
                        className="p-1.5 rounded-lg press-effect text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                        title="Marcar como concluída"
                      >
                        <CheckIcon size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Complete Route Banner ── */}
        {isAllCompleted && (
          <div
            className="animate-fade-up rounded-2xl p-5 text-center space-y-2 relative overflow-hidden"
            style={{
              background:
                'linear-gradient(135deg, rgba(16,217,160,0.15) 0%, rgba(5,150,105,0.08) 100%)',
              border: '1px solid rgba(16,217,160,0.3)',
            }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mx-auto"
              style={{ background: 'rgba(16,217,160,0.2)', color: '#10D9A0' }}
            >
              <CheckIcon size={28} />
            </div>
            <h3 className="text-lg font-bold" style={{ color: '#10D9A0' }}>
              Rota Concluída com Sucesso! 🎉
            </h3>
            <p className="text-xs max-w-xs mx-auto" style={{ color: 'var(--text-secondary)' }}>
              Todas as {stops.length} entregas desta rota foram finalizadas. Excelente trabalho!
            </p>
            <div className="pt-2">
              <Link href="/routes/new">
                <Button variant="success" size="sm">
                  + Iniciar nova rota
                </Button>
              </Link>
            </div>
          </div>
        )}

        {!isAllCompleted && activeStops.length === 0 && (
          <Button size="lg" className="w-full mt-4" onClick={handleCompleteRoute}>
            Finalizar rota completa
          </Button>
        )}

        {suspendModalStop && (
          <SuspendStopModal
            stop={suspendModalStop}
            onConfirm={handleConfirmSkipStop}
            onClose={() => setSuspendModalStop(null)}
          />
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
